import type { Express, Request, Response, NextFunction } from "express";
import { getPublishedArticles } from "./db";
import {
  ROBOTS_TXT,
  llmsFullTxt,
  llmsTxt,
  rssXml,
  sitemapXml,
} from "./lib/aeo.js";
import { SITE } from "./lib/site-config.js";
import { getRecentCronRuns } from "./db";

/**
 * §9 — WWW → APEX 301 redirect, MUST be the first middleware on Express.
 *
 * In dev, every request hits localhost / sandbox preview URLs, so the redirect
 * is a no-op. In production, the apex domain is read from SITE.apex.
 */
export function wwwToApexRedirect(req: Request, res: Response, next: NextFunction) {
  const host = req.headers.host || "";
  if (host.toLowerCase().startsWith("www.")) {
    const path = req.originalUrl || req.url || "/";
    return res.redirect(301, `https://${SITE.apex}${path}`);
  }
  next();
}

export function registerPublicRoutes(app: Express) {
  // robots.txt — open to all
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send(ROBOTS_TXT);
  });

  // sitemap.xml — only published
  app.get("/sitemap.xml", async (_req, res) => {
    const articles = await getPublishedArticles({ limit: 1000 });
    res.type("application/xml").send(sitemapXml(articles));
  });

  // llms.txt — concise index for LLMs
  app.get("/llms.txt", async (_req, res) => {
    const articles = await getPublishedArticles({ limit: 1000 });
    res.type("text/plain").send(llmsTxt(articles));
  });

  // llms-full.txt — full body dump for LLMs (still only published)
  app.get("/llms-full.txt", async (_req, res) => {
    const articles = await getPublishedArticles({ limit: 1000 });
    res.type("text/plain").send(llmsFullTxt(articles));
  });

  // rss.xml — published articles, latest first
  app.get("/rss.xml", async (_req, res) => {
    const articles = await getPublishedArticles({ limit: 50 });
    res.type("application/rss+xml").send(rssXml(articles));
  });

  // /api/health — for uptime checks
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, ts: Date.now() });
  });

  // Public JSON view of the cron log for ops visibility (read-only, no PII).
  app.get("/api/cron/runs", async (_req, res) => {
    const runs = await getRecentCronRuns(50);
    res.json({ runs });
  });
}
