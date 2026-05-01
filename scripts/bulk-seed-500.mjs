#!/usr/bin/env node
// Bulk seed against the expanded 500-topic catalog.
// Strategy: skip slugs that already exist (the 30 we already published),
// generate new articles, write them with status='queued' so the in-process
// hourly cron (cap 4/day) consumes the backlog organically over time.
//
// Optional --published-historical N back-fills N as published with publishedAt
// distributed across the past 60 days (max 4/day cap honored).
//
// Usage:
//   node scripts/bulk-seed-500.mjs --start 32 --limit 70

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

async function loadEngine() {
  const mod = await import(path.join(ROOT, "server/lib/article-generator.ts"));
  return mod;
}

const TOPICS = JSON.parse(
  fs.readFileSync(path.join(ROOT, "server/data/topics-expanded.json"), "utf8"),
);

const argv = process.argv.slice(2);
function flag(name, def) {
  const i = argv.findIndex((a) => a === `--${name}`);
  if (i === -1) return def;
  return argv[i + 1];
}
const START = Number(flag("start", "32"));
const LIMIT = Number(flag("limit", "70"));
const PUBLISHED_HIST = Number(flag("published-historical", "0"));

function readingTimeMin(words) {
  return Math.max(3, Math.round(words / 220));
}

async function dbConn() {
  const url = new URL(process.env.DATABASE_URL);
  return mysql.createConnection({
    host: url.hostname,
    port: Number(url.port || 4000),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
    ssl: { rejectUnauthorized: true },
    multipleStatements: false,
  });
}

function rng(s) {
  let x = s;
  return () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    return x / 0x7fffffff;
  };
}

const r = rng(929292);
const OPENER = ["gut-punch", "question", "story", "counterintuitive"];
const CONCLUSION = ["cta", "reflection", "question", "challenge", "benediction"];
const FAQS = [0, 0, 2, 2, 3, 3, 5];

function pickWeighted(arr) {
  return arr[Math.floor(r() * arr.length)];
}

// Spread N historical publishedAt across the past 60 days, max 4/day.
function historicalDates(n) {
  const out = [];
  let day = 0;
  let perDay = 0;
  while (out.length < n) {
    if (perDay >= 4) {
      perDay = 0;
      day += 1;
    }
    const t = new Date();
    t.setUTCDate(t.getUTCDate() - day);
    t.setUTCHours(8 + perDay * 3, (out.length * 11) % 60, 0, 0);
    out.push(t);
    perDay += 1;
  }
  return out;
}

async function main() {
  const { generateArticle } = await loadEngine();
  const conn = await dbConn();

  const histDates = historicalDates(PUBLISHED_HIST);
  let publishedHistDone = 0;
  let ok = 0;
  let fail = 0;
  let skipped = 0;

  for (let i = START; i < Math.min(TOPICS.length, START + LIMIT); i += 1) {
    const topic = TOPICS[i];
    const opts = {
      forceOpener: pickWeighted(OPENER),
      forceConclusion: pickWeighted(CONCLUSION),
      forceFaqCount: pickWeighted(FAQS),
      forceOraclelink: r() < 0.23,
      forceResearcherStyle: r() < 0.7 ? "niche" : "spiritual",
    };

    // Pre-check: skip if title slug already exists.
    const slugGuess = topic.slug ?? topic.topic.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 100);
    const [pre] = await conn.execute(
      `SELECT id FROM articles WHERE slug = ? LIMIT 1`,
      [slugGuess],
    );
    if (pre.length > 0) {
      skipped += 1;
      console.log(`[${i + 1}/${TOPICS.length}] skip (exists): ${slugGuess}`);
      continue;
    }

    const t0 = Date.now();
    let article = null;
    try {
      article = await generateArticle(topic, opts);
    } catch (e) {
      console.log(`[${i + 1}] THREW: ${e.message}`);
    }
    if (!article) {
      fail += 1;
      console.log(`[${i + 1}] FAIL after retries: ${topic.topic.slice(0, 60)}`);
      continue;
    }

    const [existing] = await conn.execute(
      `SELECT id FROM articles WHERE slug = ? LIMIT 1`,
      [article.slug],
    );
    if (existing.length > 0) {
      skipped += 1;
      console.log(`[${i + 1}] slug-exists: ${article.slug}`);
      continue;
    }

    let status, publishedAt;
    if (publishedHistDone < PUBLISHED_HIST) {
      status = "published";
      publishedAt = histDates[publishedHistDone++];
    } else {
      status = "queued";
      publishedAt = null;
    }

    await conn.execute(
      `INSERT INTO articles (
        slug, title, metaDescription, body, tldr, category,
        tags, asinsUsed, internalLinksUsed,
        heroUrl, heroAlt, wordCount, readingTime,
        openerType, conclusionType, faqCount,
        hasOraclelinkBacklink, hasExternalAuthLink,
        status, queuedAt, publishedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        article.slug,
        article.title,
        article.metaDescription,
        article.body,
        article.tldr,
        article.category,
        JSON.stringify(article.tags),
        JSON.stringify(article.asinsUsed),
        JSON.stringify(article.internalLinksUsed),
        article.heroUrl,
        article.heroAlt,
        article.wordCount,
        readingTimeMin(article.wordCount),
        article.openerType,
        article.conclusionType,
        article.faqCount,
        article.hasOraclelinkBacklink ? 1 : 0,
        article.hasExternalAuthLink ? 1 : 0,
        status,
        new Date(),
        publishedAt,
      ],
    );
    ok += 1;
    console.log(
      `[${i + 1}] ok ${article.wordCount}w ${Math.round((Date.now() - t0) / 1000)}s ${status} -> ${article.slug}`,
    );
  }

  await conn.end();
  console.log("");
  console.log("──────────────────────────────────────────────");
  console.log(`seed-500 done:  ok=${ok}  skipped=${skipped}  fail=${fail}`);
  console.log("──────────────────────────────────────────────");
}

main().catch((err) => {
  console.error("seed-500 failed:", err);
  process.exit(1);
});
