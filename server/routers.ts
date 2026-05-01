import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import {
  countPublishedArticles,
  getPublishedArticleBySlug,
  getPublishedArticles,
  getPublishedCountByDate,
  getRecentCronRuns,
  getValidAsinCount,
} from "./db";

export const articlesRouter = router({
  list: publicProcedure
    .input(
      z.object({
        limit: z.number().int().min(1).max(100).optional(),
        offset: z.number().int().min(0).optional(),
        category: z.string().optional(),
      }).optional(),
    )
    .query(async ({ input }) => {
      const articles = await getPublishedArticles({
        limit: input?.limit,
        offset: input?.offset,
        category: input?.category,
      });
      return { articles };
    }),

  bySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1).max(200) }))
    .query(async ({ input }) => {
      const article = await getPublishedArticleBySlug(input.slug);
      if (!article) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Article not found." });
      }
      return { article };
    }),

  stats: publicProcedure.query(async () => {
    const [total, byDate, validAsins] = await Promise.all([
      countPublishedArticles(),
      getPublishedCountByDate(),
      getValidAsinCount(),
    ]);
    return { total, byDate, validAsins };
  }),

  cronStatus: adminProcedure.query(async () => {
    return { runs: await getRecentCronRuns(50) };
  }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  articles: articlesRouter,
});

export type AppRouter = typeof appRouter;
