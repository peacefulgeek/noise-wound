#!/usr/bin/env node
// Bulk-seed all 30 topics into the articles table with distributed publishedAt
// dates so the live site doesn't appear to have been published all on one day.
//
// Usage: node scripts/bulk-seed.mjs [--limit N] [--start-index N]
//
// Distribution rules enforced:
//  - opener types: no single type > 60% (12/30 cap on the dominant)
//  - conclusion types: no single type > 40% (12/30 cap on the dominant)
//  - faq counts: distributed across {0, 2, 3, 5}
//  - 23% (≈7/30) of articles carry an Oracle Lover backlink
//  - 70% niche / 30% spiritual researchers
//  - publishedAt: spread across the last 14 days, max 4/day to mirror the
//    cadence cap that protects Google authority

import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// dynamic-import the TS-built engine (we run via tsx)
async function loadEngine() {
  const mod = await import(path.join(ROOT, "server/lib/article-generator.ts"));
  return mod;
}

const TOPICS = JSON.parse(
  fs.readFileSync(path.join(ROOT, "server/data/topics.json"), "utf8"),
);

const argv = process.argv.slice(2);
function flag(name, def) {
  const i = argv.findIndex((a) => a === `--${name}`);
  if (i === -1) return def;
  return argv[i + 1];
}
const LIMIT = Number(flag("limit", "30"));
const START_INDEX = Number(flag("start-index", "0"));

// Build the planned distribution table for 30 articles.
function plan(n) {
  // openers: gut-punch 9, question 8, story 7, counterintuitive 6  (max 30%)
  const openers = [
    ...Array(9).fill("gut-punch"),
    ...Array(8).fill("question"),
    ...Array(7).fill("story"),
    ...Array(6).fill("counterintuitive"),
  ];
  // conclusions: cta 8, reflection 7, question 6, challenge 5, benediction 4  (max 27%)
  const conclusions = [
    ...Array(8).fill("cta"),
    ...Array(7).fill("reflection"),
    ...Array(6).fill("question"),
    ...Array(5).fill("challenge"),
    ...Array(4).fill("benediction"),
  ];
  // faqs: 0×8, 2×8, 3×8, 5×6
  const faqs = [
    ...Array(8).fill(0),
    ...Array(8).fill(2),
    ...Array(8).fill(3),
    ...Array(6).fill(5),
  ];
  // oraclelink: 7 of 30 = 23.3%
  const oraclelink = [...Array(7).fill(true), ...Array(23).fill(false)];
  // researcher: 21 niche / 9 spiritual ≈ 70/30
  const researchers = [
    ...Array(21).fill("niche"),
    ...Array(9).fill("spiritual"),
  ];

  // shuffle each independently so they don't co-cluster
  const seed = 92;
  function rng(s) {
    let x = s;
    return () => {
      x = (x * 1103515245 + 12345) & 0x7fffffff;
      return x / 0x7fffffff;
    };
  }
  const r = rng(seed);
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(r() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  return {
    openers: shuffle(openers).slice(0, n),
    conclusions: shuffle(conclusions).slice(0, n),
    faqs: shuffle(faqs).slice(0, n),
    oraclelink: shuffle(oraclelink).slice(0, n),
    researchers: shuffle(researchers).slice(0, n),
  };
}

// Distribute publishedAt across the last 14 days, max 4/day.
function publishSchedule(n) {
  const days = 14;
  const out = [];
  const now = Date.now();
  let dayIdx = 0;
  let perDay = 0;
  while (out.length < n) {
    if (perDay >= 4) {
      perDay = 0;
      dayIdx += 1;
      if (dayIdx >= days) dayIdx = 0; // wrap, keeps within window
    }
    // morning + evening offset, plus a deterministic minute jitter
    const minutesIntoDay = 8 * 60 + perDay * 3 * 60 + (out.length * 7) % 47;
    const t = new Date(now - dayIdx * 86400000);
    t.setUTCHours(0, 0, 0, 0);
    t.setUTCMinutes(t.getUTCMinutes() + minutesIntoDay);
    out.push(t);
    perDay += 1;
  }
  // newest first → oldest last so the front-page lead is most recent
  return out;
}

function readingTimeMin(words) {
  return Math.max(3, Math.round(words / 220));
}

async function dbConn() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed.");
  }
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

async function main() {
  const { generateArticle } = await loadEngine();
  const dist = plan(LIMIT);
  const dates = publishSchedule(LIMIT);
  const conn = await dbConn();

  const generated = [];
  let fails = 0;

  for (let i = START_INDEX; i < Math.min(TOPICS.length, START_INDEX + LIMIT); i += 1) {
    const topic = TOPICS[i];
    const opts = {
      forceOpener: dist.openers[i],
      forceConclusion: dist.conclusions[i],
      forceFaqCount: dist.faqs[i],
      forceOraclelink: dist.oraclelink[i],
      forceResearcherStyle: dist.researchers[i],
    };

    console.log(`[${i + 1}/${LIMIT}] generating: ${topic.topic.slice(0, 70)}…`);
    const t0 = Date.now();
    let article = null;
    try {
      article = await generateArticle(topic, opts);
    } catch (e) {
      console.log(`     · THREW: ${e.message}`);
    }
    if (!article) {
      fails += 1;
      console.log(`     · FAIL after retries`);
      continue;
    }
    console.log(`     · ok ${article.wordCount}w in ${Math.round((Date.now() - t0) / 1000)}s -> ${article.slug}`);

    // Skip if slug exists already.
    const [existing] = await conn.execute(
      `SELECT id FROM articles WHERE slug = ? LIMIT 1`,
      [article.slug],
    );
    if (existing.length > 0) {
      console.log(`     · slug exists, skipping insert`);
      generated.push(article.slug);
      continue;
    }

    const publishedAt = dates[i] ?? new Date();
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
        "published",
        publishedAt,
        publishedAt,
      ],
    );
    generated.push(article.slug);
  }

  await conn.end();

  console.log("");
  console.log("──────────────────────────────────────────────");
  console.log(`seed run complete:  ok=${generated.length}  fail=${fails}  total=${LIMIT}`);
  console.log("──────────────────────────────────────────────");
}

main().catch((err) => {
  console.error("seed failed:", err);
  process.exit(1);
});
