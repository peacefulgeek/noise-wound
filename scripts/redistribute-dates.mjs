#!/usr/bin/env node
/**
 * Redistribute publishedAt across past N days at <=4/day, oldest-first.
 * Honors the Google authority cap of 4 articles/day.
 */
import 'dotenv/config';
import mysql from 'mysql2/promise';

const url = new URL(process.env.DATABASE_URL);
const conn = await mysql.createConnection({
  host: url.hostname,
  port: Number(url.port || 4000),
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace(/^\//, ''),
  ssl: { rejectUnauthorized: true },
});

const [rows] = await conn.execute(
  "SELECT id, slug, publishedAt FROM articles WHERE status='published' ORDER BY publishedAt ASC, id ASC"
);

console.log(`[redistribute] ${rows.length} published articles`);

const PER_DAY = 4;
const startDay = new Date();
startDay.setUTCDate(startDay.getUTCDate() - Math.ceil(rows.length / PER_DAY) + 1);
startDay.setUTCHours(0, 0, 0, 0);

let dayOffset = 0;
let countToday = 0;
let updated = 0;
for (const row of rows) {
  if (countToday >= PER_DAY) {
    dayOffset++;
    countToday = 0;
  }
  const day = new Date(startDay);
  day.setUTCDate(day.getUTCDate() + dayOffset);
  const hour = 8 + countToday * 3 + (Math.floor(Math.random() * 60));
  day.setUTCHours(8 + countToday * 3, Math.floor(Math.random() * 60), 0, 0);
  const sql = day.toISOString().slice(0, 19).replace('T', ' ');
  await conn.execute(
    'UPDATE articles SET publishedAt = ?, lastModifiedAt = ? WHERE id = ?',
    [sql, sql, row.id]
  );
  updated++;
  countToday++;
}

console.log(`[redistribute] updated=${updated} across ${dayOffset + 1} days`);
const [byDay] = await conn.execute(
  "SELECT DATE(publishedAt) d, COUNT(*) c FROM articles WHERE status='published' GROUP BY DATE(publishedAt) ORDER BY d DESC LIMIT 40"
);
console.log(byDay);
await conn.end();
