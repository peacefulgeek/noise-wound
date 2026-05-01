import type { Express, Request, Response } from "express";
import { getNextQueuedArticle, insertArticle, logCronRun, publishArticle } from "./db";
import { generateArticle, type SeedTopic } from "./lib/article-generator.js";
import topicsJson from "./data/topics.json" with { type: "json" };

const TOPICS: SeedTopic[] = topicsJson as SeedTopic[];

/**
 * Cloud Run hibernates inactive instances, so an in-process cron can miss runs.
 * These endpoints are designed to be hit by a Manus scheduled-task agent that
 * carries the auto-injected app_session_id cookie. They mirror what the in-process
 * crons do, but run on demand.
 *
 * No admin-token required: the platform's scheduled task is already authenticated
 * with a cookie that resolves to a `user` role. We deliberately keep these to
 * read-write actions that are safe to repeat (idempotent re: queue/publish caps).
 */

function authed(req: Request) {
  // The cookie pipeline already validates the request before it gets here,
  // and the OAuth router populates req.user via context. For unauthenticated
  // hits we still allow read-only operations; mutations require the auth
  // header that the sandbox scheduled task carries.
  const cookie = req.headers.cookie || "";
  return cookie.includes("app_session_id=");
}

export function registerScheduledTaskRoutes(app: Express) {
  app.post("/api/scheduled/publish-from-queue", async (req: Request, res: Response) => {
    if (!authed(req)) return res.status(401).json({ error: "unauthorized" });
    let result: string | undefined;
    await logCronRun("publish-from-queue:scheduled", async () => {
      const next = await getNextQueuedArticle();
      if (!next) { result = "queue-empty"; return result; }
      await publishArticle(next.id);
      result = `published ${next.slug}`;
      return result;
    });
    res.json({ ok: true, result });
  });

  app.post("/api/scheduled/generate-and-queue", async (req: Request, res: Response) => {
    if (!authed(req)) return res.status(401).json({ error: "unauthorized" });
    const idx = Number(req.body?.topicIndex ?? new Date().getUTCMinutes()) % TOPICS.length;
    const topic = TOPICS[idx];
    let result: string | undefined;
    await logCronRun("generate-and-queue:scheduled", async () => {
      const article = await generateArticle(topic);
      if (!article) { result = `gate-failed-3x: ${topic.topic}`; return result; }
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
      result = `queued ${article.slug}`;
      return result;
    });
    res.json({ ok: true, result });
  });
}
