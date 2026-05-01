import {
  bigint,
  boolean,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  longtext,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Articles — the queue-first publishing table.
 * Status lifecycle: queued → published.
 * All public-facing reads filter status = 'published'.
 */
export const articles = mysqlTable(
  "articles",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    title: varchar("title", { length: 300 }).notNull(),
    metaDescription: varchar("metaDescription", { length: 500 }).notNull(),
    body: longtext("body").notNull(),
    tldr: text("tldr").notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    tags: json("tags").$type<string[]>().notNull(),
    asinsUsed: json("asinsUsed").$type<string[]>().notNull(),
    internalLinksUsed: json("internalLinksUsed").$type<string[]>().notNull(),
    heroUrl: text("heroUrl").notNull(),
    heroAlt: varchar("heroAlt", { length: 300 }).notNull(),
    wordCount: int("wordCount").notNull(),
    readingTime: int("readingTime").notNull(),
    openerType: mysqlEnum("openerType", [
      "gut-punch",
      "question",
      "story",
      "counterintuitive",
    ]).notNull(),
    conclusionType: mysqlEnum("conclusionType", [
      "cta",
      "reflection",
      "question",
      "challenge",
      "benediction",
    ]).notNull(),
    faqCount: int("faqCount").notNull().default(0),
    hasOraclelinkBacklink: boolean("hasOraclelinkBacklink").notNull().default(false),
    hasExternalAuthLink: boolean("hasExternalAuthLink").notNull().default(false),
    status: mysqlEnum("status", ["queued", "published"])
      .notNull()
      .default("queued"),
    queuedAt: timestamp("queuedAt").defaultNow().notNull(),
    publishedAt: timestamp("publishedAt"),
    lastModifiedAt: timestamp("lastModifiedAt").defaultNow().onUpdateNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (t) => ({
    statusIdx: index("articles_status_idx").on(t.status),
    publishedAtIdx: index("articles_published_at_idx").on(t.publishedAt),
    queuedAtIdx: index("articles_queued_at_idx").on(t.queuedAt),
    categoryIdx: index("articles_category_idx").on(t.category),
    slugIdx: index("articles_slug_idx").on(t.slug),
  }),
);

export type Article = typeof articles.$inferSelect;
export type InsertArticle = typeof articles.$inferInsert;

/**
 * Verified Amazon ASINs catalog (mirrors src/data/verified-asins.json shape).
 * Source-of-truth lives in JSON; this table is a denormalized cache for queries.
 */
export const asins = mysqlTable(
  "asins",
  {
    asin: varchar("asin", { length: 20 }).primaryKey(),
    title: varchar("title", { length: 500 }).notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    tags: json("tags").$type<string[]>().notNull(),
    status: mysqlEnum("status", ["valid", "invalid", "unverified"])
      .notNull()
      .default("unverified"),
    lastChecked: timestamp("lastChecked"),
    invalidReason: varchar("invalidReason", { length: 200 }),
  },
  (t) => ({
    categoryIdx: index("asins_category_idx").on(t.category),
    statusIdx: index("asins_status_idx").on(t.status),
  }),
);

export type Asin = typeof asins.$inferSelect;

/**
 * Cron run log — observability for which jobs fired and what they did.
 */
export const cronRuns = mysqlTable(
  "cronRuns",
  {
    id: bigint("id", { mode: "number" }).autoincrement().primaryKey(),
    jobName: varchar("jobName", { length: 80 }).notNull(),
    startedAt: timestamp("startedAt").defaultNow().notNull(),
    finishedAt: timestamp("finishedAt"),
    success: boolean("success").notNull().default(false),
    note: text("note"),
  },
  (t) => ({
    jobNameIdx: index("cron_job_name_idx").on(t.jobName),
    startedAtIdx: index("cron_started_at_idx").on(t.startedAt),
  }),
);

export type CronRun = typeof cronRuns.$inferSelect;
