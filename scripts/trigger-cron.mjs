import "dotenv/config";
import mysql from "mysql2/promise";
import { logCronRun, countPublishedArticles } from "../server/db.ts";

const conn = await mysql.createConnection(process.env.DATABASE_URL);

console.log("[trigger-cron] running publish-from-queue manually");
await logCronRun("publish-from-queue", async () => {
  const [todayRows] = await conn.execute(
    "SELECT COUNT(*) c FROM articles WHERE status='published' AND DATE(publishedAt)=UTC_DATE()",
  );
  const today = Number(todayRows[0].c);
  if (today >= 4) return `cap-hit (already ${today} today)`;
  const [queuedRows] = await conn.execute(
    "SELECT id, slug FROM articles WHERE status='queued' ORDER BY queuedAt ASC LIMIT 1",
  );
  if (!queuedRows[0]) return "queue-empty";
  await conn.execute(
    "UPDATE articles SET status='published', publishedAt=NOW() WHERE id=?",
    [queuedRows[0].id],
  );
  return `published #${queuedRows[0].id} (${queuedRows[0].slug})`;
});

console.log("[trigger-cron] running weekly-audit manually");
await logCronRun("weekly-audit", async () => {
  const total = await countPublishedArticles();
  return `weekly audit: ${total} published`;
});

console.log("[trigger-cron] inspecting cronRuns last 5");
const [rows] = await conn.execute(
  "SELECT id, jobName, startedAt, finishedAt, success, note FROM cronRuns ORDER BY id DESC LIMIT 5",
);
rows.forEach((r) => console.log(" ", JSON.stringify(r)));

await conn.end();
process.exit(0);
