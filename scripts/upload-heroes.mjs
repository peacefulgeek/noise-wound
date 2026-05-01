#!/usr/bin/env node
/**
 * For every published article (or every queued+published article), pull a
 * relevant Creative-Commons photo from Openverse, compress it to WebP, and
 * upload it to Bunny CDN at /heroes/{slug}.webp + /og/{slug}.webp.
 *
 * Idempotent: skips slugs whose hero already exists in Bunny storage unless
 * --force is passed.
 */

import "dotenv/config";
import mysql from "mysql2/promise";
import sharp from "sharp";
import { bunnyPut, bunnyExists, heroUrlForSlug } from "../bunny.mjs";

const FORCE = process.argv.includes("--force");
const ONLY_PUBLISHED = process.argv.includes("--published-only");

// Per-topic image search queries — broad enough to return real photography,
// specific enough to feel related to the article. Falls back to topic.summary.
const QUERY_BANK = {
  "the-chewing-isnt-the-wound": "empty dinner table dim light still life",
  "what-misophonia-actually-is": "anatomical brain scan illustration vintage paper",
  "why-no-one-believes-you": "woman covering ears against window light",
  "the-table-trigger": "abandoned dinner table evening warm tones",
  "the-keyboard-trigger": "person headphones working office quiet",
  "the-breathing-trigger": "single rumpled empty pillow bedroom morning",
  "the-pen-clicking-trigger": "wooden pencil notebook shallow desk",
  "the-misokinesia-cousin": "blurred motion hands fidgeting still photography",
  "the-flight-or-fight-of-it": "racing pulse abstract red painting",
  "earplugs-arent-cheating": "minimal earplugs flat lay linen",
  "the-noise-canceling-question": "headphones woven texture warm light",
  "weighted-blanket-idea": "folded blanket bed corner morning natural light",
  "the-white-noise-rabbit-hole": "open window forest fog rain mood",
  "the-loop-earplugs-question": "small clear earplug case linen",
  "the-quiet-hour-protocol": "hands holding warm tea morning window",
  "telling-your-partner": "two hands across kitchen table candle",
  "telling-your-boss": "minimal office desk window blinds quiet",
  "telling-your-family": "family portrait wide table simple home",
  "the-restaurant-problem": "candlelit corner restaurant table empty",
  "the-airplane-problem": "airplane window cloud golden hour",
  "the-cmrt-protocol": "therapy notebook open hands soft light",
  "the-dnms-protocol": "vintage paper anatomy nervous system illustration",
  "the-medication-question": "pharmacy bottles still life soft natural",
  "the-trauma-link": "old letter handwriting dim light paper",
  "the-adhd-overlap": "scattered desk papers golden hour focus",
  "the-autism-overlap": "single hand sorting beads daylight",
  "what-the-research-actually-says": "old library reading lamp still life",
  "what-the-research-doesnt-say": "blank page typewriter quiet",
  "the-self-compassion-piece": "cup of tea hands warm sweater morning",
  "the-letter-to-younger-you": "open journal pen handwritten light",
};

const FALLBACK_QUERIES = [
  "warm window morning light home",
  "calm bedroom natural light",
  "old library reading lamp",
  "anatomical illustration vintage paper",
  "minimal still life linen",
  "rain on window quiet",
  "candle table evening soft",
  "wooden desk pen notebook",
  "open book quiet reading",
  "soft cotton blanket morning",
];

async function searchOpenverse(query) {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(
    query,
  )}&page_size=10&license_type=commercial&mature=false&extension=jpg,png,webp&aspect_ratio=wide`;
  const res = await fetch(url, {
    headers: { Accept: "application/json", "User-Agent": "thenoisewound/1.0" },
  });
  if (!res.ok) throw new Error(`Openverse ${res.status}`);
  const json = await res.json();
  return json.results || [];
}

// Tiny stop-word stripper so we can pull the topical 2-4 words out of a long
// article title and feed it to Openverse as a real photo query.
function titleToQuery(title) {
  const stop = new Set(
    "a an and or for of to in on at the by with what why how when whats your you yours youre yourself i my mine me is are was were be been being do does did has have had its it about over under from into out as that this these those".split(
      /\s+/,
    ),
  );
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stop.has(w));
  // Pick first 4 most distinctive words to keep the query tight.
  return words.slice(0, 4).join(" ");
}

// Per-slug pseudo-random index so the same article always picks the same photo
// across re-runs (deterministic).
function stableHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

async function pickPhoto(slug, fallbackTitle) {
  const fromTitle = titleToQuery(fallbackTitle || "");
  // Build query list from most-specific to most-fallback.
  const queries = [
    QUERY_BANK[slug],
    fromTitle && fromTitle + " still life",
    fromTitle,
    fromTitle && fromTitle.split(" ").slice(0, 2).join(" "),
    ...FALLBACK_QUERIES,
  ].filter(Boolean);
  const idx = stableHash(slug);
  for (const q of queries) {
    try {
      const results = await searchOpenverse(q);
      const filtered = results.filter((r) => r.url && /\.(jpg|jpeg|png|webp)/i.test(r.url));
      if (filtered.length > 0) {
        // Walk results starting at slug-stable offset, return first downloadable.
        for (let i = 0; i < filtered.length; i++) {
          const r = filtered[(idx + i) % filtered.length];
          try {
            const head = await fetch(r.url, { method: "HEAD" });
            if (head.ok) return r;
          } catch (_e) {
            /* skip */
          }
        }
      }
    } catch (e) {
      console.warn(`[upload-heroes] query "${q}" failed:`, e.message);
    }
  }
  return null;
}

async function downloadAndCompress(photoUrl, width, height, quality = 78) {
  const res = await fetch(photoUrl, {
    headers: { "User-Agent": "thenoisewound/1.0" },
  });
  if (!res.ok) throw new Error(`download ${res.status}`);
  const ab = await res.arrayBuffer();
  return sharp(Buffer.from(ab))
    .rotate()
    .resize(width, height, { fit: "cover", position: "attention" })
    .webp({ quality })
    .toBuffer();
}

async function processOne(article) {
  const slug = article.slug;
  const heroPath = `/heroes/${slug}.webp`;
  const ogPath = `/og/${slug}.webp`;

  if (!FORCE) {
    const exists = await bunnyExists(heroPath);
    if (exists) {
      console.log(`[skip] ${slug} (hero already in Bunny)`);
      return { slug, skipped: true };
    }
  }

  const photo = await pickPhoto(slug, article.title);
  if (!photo) {
    console.warn(`[warn] no photo found for ${slug}`);
    return { slug, error: "no-photo" };
  }
  console.log(`[ok] ${slug} → ${photo.url.slice(0, 80)}…`);

  const heroBuf = await downloadAndCompress(photo.url, 1600, 900, 78);
  const ogBuf = await downloadAndCompress(photo.url, 1200, 630, 78);

  const r1 = await bunnyPut(heroPath, heroBuf, "image/webp");
  const r2 = await bunnyPut(ogPath, ogBuf, "image/webp");
  if (!r1.ok || !r2.ok) {
    return { slug, error: `upload status ${r1.status}/${r2.status}` };
  }

  return {
    slug,
    bytes: { hero: heroBuf.length, og: ogBuf.length },
    creator: photo.creator,
    license: photo.license,
    foreign: photo.foreign_landing_url,
  };
}

(async () => {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const where = ONLY_PUBLISHED ? "WHERE status='published'" : "WHERE status IN ('published','queued')";
  const [rows] = await conn.execute(`SELECT slug, title FROM articles ${where} ORDER BY id ASC`);
  console.log(`[upload-heroes] ${rows.length} articles to process`);

  const results = [];
  for (const a of rows) {
    try {
      const r = await processOne(a);
      results.push(r);
      if (r.bytes) {
        await conn.execute(
          `UPDATE articles SET heroUrl=? WHERE slug=?`,
          [heroUrlForSlug(a.slug), a.slug],
        );
      }
    } catch (e) {
      console.error(`[err] ${a.slug}:`, e.message);
      results.push({ slug: a.slug, error: e.message });
    }
  }

  const ok = results.filter((r) => r.bytes).length;
  const skipped = results.filter((r) => r.skipped).length;
  const errored = results.filter((r) => r.error).length;
  console.log(`\n[upload-heroes] DONE  uploaded=${ok}  skipped=${skipped}  errored=${errored}`);
  await conn.end();
  process.exit(0);
})().catch((e) => {
  console.error("fatal:", e);
  process.exit(1);
});
