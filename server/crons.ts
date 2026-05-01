import cron from "node-cron";
import {
  countPublishedArticles,
  getNextQueuedArticle,
  insertArticle,
  logCronRun,
  publishArticle,
} from "./db";
import { generateArticle, type SeedTopic } from "./lib/article-generator.js";
import topicsJson from "./data/topics.json" with { type: "json" };

const TOPICS: SeedTopic[] = topicsJson as SeedTopic[];

let started = false;

/**
 * §16 / §17 — Crons:
 *  - generate-and-queue: every 6 hours, picks an under-served topic and queues a new article.
 *  - publish-from-queue: every hour at minute 7, publishes ONE queued article (steady cadence,
 *    not "all on one day"). Cap at 4 published per UTC day.
 *  - link-and-asin-audit: weekly Monday 03:00 UTC. Logs cron status only (no destructive action).
 */
export function startCronJobs() {
  if (started) return;
  started = true;
  if (process.env.AUTO_GEN_ENABLED !== "true") {
    console.log("[cron] AUTO_GEN_ENABLED != 'true' — cron jobs not started.");
    return;
  }

  console.log("[cron] starting in-process schedulers (UTC)");

  // Every hour at minute 7: publish one if any queued, with daily cap of 4.
  cron.schedule(
    "7 * * * *",
    () => {
      void logCronRun("publish-from-queue", async () => {
        const todayCount = await publishedToday();
        if (todayCount >= 4) return `cap-hit (already ${todayCount} today)`;
        const next = await getNextQueuedArticle();
        if (!next) return "queue-empty";
        await publishArticle(next.id);
        return `published #${next.id} (${next.slug})`;
      });
    },
    { timezone: "UTC" },
  );

  // Every 6 hours at minute 23: generate and queue if total backlog < 10.
  cron.schedule(
    "23 */6 * * *",
    () => {
      void logCronRun("generate-and-queue", async () => {
        const queued = await queueDepth();
        if (queued >= 10) return `queue-deep (${queued})`;
        const topic = pickUnderservedTopic();
        const article = await generateArticle(topic);
        if (!article) return `gate-failed-3x for "${topic.topic}"`;
        await insertArticle({
          slug: article.slug,
          title: article.title,
          metaDescription: article.metaDescription,
          body: article.body,
          tldr: article.tldr,
          category: article.category,
          tags: article.tags,
          asinsUsed: article.asinsUsed,
          internalLinksUsed: article.internalLinksUsed,
          heroUrl: article.heroUrl,
          heroAlt: article.heroAlt,
          wordCount: article.wordCount,
          readingTime: Math.max(1, Math.round(article.wordCount / 220)),
          openerType: article.openerType,
          conclusionType: article.conclusionType,
          faqCount: article.faqCount,
          hasOraclelinkBacklink: article.hasOraclelinkBacklink,
          hasExternalAuthLink: article.hasExternalAuthLink,
          status: "queued",
        });
        return `queued ${article.slug}`;
      });
    },
    { timezone: "UTC" },
  );

  // Weekly Monday 03:00 UTC — light audit (count + report).
  cron.schedule(
    "0 3 * * 1",
    () => {
      void logCronRun("weekly-audit", async () => {
        const total = await countPublishedArticles();
        return `weekly audit: ${total} published`;
      });
    },
    { timezone: "UTC" },
  );
}

async function publishedToday(): Promise<number> {
  const { getDb } = await import("./db");
  const db = await getDb();
  if (!db) return 0;
  const { sql } = await import("drizzle-orm");
  const r = await db.execute(sql`
    SELECT COUNT(*) AS c
    FROM articles
    WHERE status = 'published'
      AND DATE(publishedAt) = UTC_DATE()
  `);
  const data = (r as unknown as [Array<{ c: number }>])[0] ?? [];
  return Number(data[0]?.c ?? 0);
}

async function queueDepth(): Promise<number> {
  const { getDb } = await import("./db");
  const db = await getDb();
  if (!db) return 0;
  const { sql } = await import("drizzle-orm");
  const r = await db.execute(sql`
    SELECT COUNT(*) AS c
    FROM articles
    WHERE status = 'queued'
  `);
  const data = (r as unknown as [Array<{ c: number }>])[0] ?? [];
  return Number(data[0]?.c ?? 0);
}

function pickUnderservedTopic(): SeedTopic {
  // For now, deterministic by minute-of-hour. Future versions can query
  // articles for topic frequency and weight against the 30-topic catalog.
  const idx = new Date().getUTCMinutes() % TOPICS.length;
  return TOPICS[idx];
}
