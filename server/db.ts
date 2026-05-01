import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  articles,
  asins,
  cronRuns,
  type Article,
  type InsertArticle,
  InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ──────────────────────────────────────────────────────────────────────────
// Articles
// ──────────────────────────────────────────────────────────────────────────

export async function insertArticle(a: InsertArticle): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(articles).values(a);
}

export async function getPublishedArticles(opts: {
  limit?: number;
  offset?: number;
  category?: string;
} = {}): Promise<Article[]> {
  const db = await getDb();
  if (!db) return [];
  const conds = [eq(articles.status, "published")];
  if (opts.category) conds.push(eq(articles.category, opts.category));
  return db
    .select()
    .from(articles)
    .where(and(...conds))
    .orderBy(desc(articles.publishedAt))
    .limit(opts.limit ?? 50)
    .offset(opts.offset ?? 0);
}

export async function getPublishedArticleBySlug(slug: string): Promise<Article | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.status, "published")))
    .limit(1);
  return rows[0];
}

export async function countPublishedArticles(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db
    .select({ c: sql<number>`count(*)` })
    .from(articles)
    .where(eq(articles.status, "published"));
  return Number(rows[0]?.c ?? 0);
}

export async function getNextQueuedArticle(): Promise<Article | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const rows = await db
    .select()
    .from(articles)
    .where(eq(articles.status, "queued"))
    .orderBy(articles.queuedAt)
    .limit(1);
  return rows[0];
}

export async function publishArticle(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(articles)
    .set({ status: "published", publishedAt: new Date() })
    .where(eq(articles.id, id));
}

export async function getPublishedCountByDate(): Promise<{ date: string; count: number }[]> {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.execute(sql`
    SELECT DATE(publishedAt) as d, COUNT(*) as c
    FROM articles
    WHERE status = 'published' AND publishedAt IS NOT NULL
    GROUP BY DATE(publishedAt)
    ORDER BY d DESC
    LIMIT 60
  `);
  const data = (rows as unknown as [Array<{ d: string; c: number }>])[0] ?? [];
  return data.map((r) => ({ date: String(r.d), count: Number(r.c) }));
}

export async function logCronRun(jobName: string, fn: () => Promise<string | void>) {
  const db = await getDb();
  if (!db) {
    console.warn(`[cron] DB unavailable, running ${jobName} without persistence.`);
    try { await fn(); } catch (e) { console.error(`[cron:${jobName}] failed:`, e); }
    return;
  }
  const { sql } = await import("drizzle-orm");
  // Use raw SQL because the Drizzle .update() path silently fails on the
  // tinyint(1) `success` column on TiDB. Raw SQL is reliable.
  const insertResult = (await db.execute(
    sql`INSERT INTO cronRuns (jobName, startedAt, success) VALUES (${jobName}, NOW(), 0)`,
  )) as unknown as { insertId?: number }[];
  const id = Number(
    (insertResult as unknown as { insertId?: number })?.insertId ??
      (insertResult as unknown as [{ insertId?: number }])[0]?.insertId ??
      0,
  );
  let note: string | void = undefined;
  let success = false;
  try {
    note = await fn();
    success = true;
    console.log(`[cron:${jobName}] ok: ${note ?? "(no note)"}`);
  } catch (e) {
    note = `error: ${(e as Error).message}`;
    console.error(`[cron:${jobName}] failed:`, e);
  } finally {
    if (id) {
      const successInt = success ? 1 : 0;
      const noteStr = note ?? null;
      await db.execute(
        sql`UPDATE cronRuns SET finishedAt = NOW(), success = ${successInt}, note = ${noteStr} WHERE id = ${id}`,
      );
    }
  }
}

export async function getRecentCronRuns(limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(cronRuns)
    .orderBy(desc(cronRuns.startedAt))
    .limit(limit);
}

export async function getValidAsinCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db
    .select({ c: sql<number>`count(*)` })
    .from(asins)
    .where(eq(asins.status, "valid"));
  return Number(rows[0]?.c ?? 0);
}
