/* eslint-disable */
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

(async () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("no DATABASE_URL");
    process.exit(1);
  }
  // mysql2 understands the URL directly with the ssl=... query string.
  // Adding multipleStatements requires either flag in URL or in opts; pass via opts via parse.
  const conn = await mysql.createConnection(url);
  await conn.query("SET SESSION sql_mode = 'ANSI_QUOTES'").catch(() => {});
  // Reset to default mode immediately
  await conn.query("SET SESSION sql_mode = ''").catch(() => {});

  const file =
    process.argv[2] ||
    path.join(__dirname, "..", "drizzle", "0001_hot_wendigo.sql");
  const sql = fs.readFileSync(file, "utf8");
  const stmts = sql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const s of stmts) {
    try {
      await conn.query(s);
      console.log("OK:", s.split("\n")[0].slice(0, 80));
    } catch (e) {
      console.log(
        "SKIP:",
        s.split("\n")[0].slice(0, 80),
        "|",
        e.code || e.message,
      );
    }
  }
  await conn.end();
  console.log("Migration done.");
  process.exit(0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
