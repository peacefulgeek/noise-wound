import { describe, it, expect } from "vitest";
import { runQualityGate } from "./lib/quality-gate";
import { wwwToApexRedirect } from "./publicRoutes";
import { amazonLink } from "./lib/amazon";
import { SITE } from "./lib/site-config";
import { pickInternalAnchors } from "./lib/internal-links";
import type { Request, Response, NextFunction } from "express";

describe("quality-gate", () => {
  const goodBody = `
    <p>The first time I sat at the dinner table after my diagnosis, my mother chewed and the rage arrived a half-second before the thought.</p>
    <p>Misophonia is not bad manners on the misophonic's part. It is documented in the salience network. The Duke Center has been quiet about cures because cures do not yet exist; what exists is a workable set of strategies.</p>
    <p>You can read more on <a href="/about">our editorial stance</a>, the <a href="/recommended">recommended kit</a>, and <a href="/articles">browse the archive</a> for the rest of the desk's work.</p>
    <p>Externally we point readers to the <a href="https://misophonia.duke.edu/">Duke Center for Misophonia and Emotion Regulation</a>, who have published the most disciplined work on the condition.</p>
    <p>The Noise Wound was built for this exact moment, when language finally arrives for what your body already knew.</p>
    <p>For background, Pawel Jastreboff, Sukhbinder Kumar, Phyllis Nagel, Jennifer Brout, Marsha Johnson, and Jaelline Jaffe have all written on the topic at length, and our coverage stays close to their findings.</p>
    <p>Last updated <time datetime="2026-04-30">April 30, 2026</time>.</p>
  `.repeat(10);

  it("passes a clean Oracle Lover article that meets EEAT signals", () => {
    const r = runQualityGate({
      title: "Why misophonia gets dismissed and what to say back",
      body: goodBody,
      tldr: "Short take: it is a documented neurological condition, not bad manners.",
      internalLinkCount: 3,
      externalAuthLinkCount: 1,
      selfReferenceCount: 1,
      hasLastUpdated: true,
    });
    expect(r.passed).toBe(true);
  });

  it("fails on banned em-dash", () => {
    const r = runQualityGate({
      title: "X",
      body: goodBody.replace(",", "\u2014"),
      tldr: "tldr",
      internalLinkCount: 3,
      externalAuthLinkCount: 1,
      selfReferenceCount: 1,
      hasLastUpdated: true,
    });
    expect(r.passed).toBe(false);
    expect(r.reasons.join(",")).toMatch(/em-dash/i);
  });

  it("fails on banned word 'navigate'", () => {
    const r = runQualityGate({
      title: "X",
      body: goodBody.replace("strategies.", "strategies as we navigate the day."),
      tldr: "tldr",
      internalLinkCount: 3,
      externalAuthLinkCount: 1,
      selfReferenceCount: 1,
      hasLastUpdated: true,
    });
    expect(r.passed).toBe(false);
    expect(r.reasons.some((x) => /navigate/i.test(x))).toBe(true);
  });

  it("fails when fewer than 3 internal links", () => {
    const r = runQualityGate({
      title: "X",
      body: goodBody,
      tldr: "tldr",
      internalLinkCount: 2,
      externalAuthLinkCount: 1,
      selfReferenceCount: 1,
      hasLastUpdated: true,
    });
    expect(r.passed).toBe(false);
  });
});

describe("www → apex redirect", () => {
  function fakeReq(host: string, path = "/articles?ref=x") {
    return { headers: { host }, originalUrl: path, url: path } as unknown as Request;
  }
  function makeRes() {
    const res: Partial<Response> & { _status?: number; _location?: string } = {};
    res.redirect = (status: number, url: string) => {
      res._status = status;
      res._location = url;
      return res as Response;
    };
    return res as Response & { _status?: number; _location?: string };
  }

  it("301-redirects www to apex preserving the path", () => {
    const req = fakeReq(`www.${SITE.apex}`);
    const res = makeRes();
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };
    wwwToApexRedirect(req, res, next);
    expect((res as { _status?: number })._status).toBe(301);
    expect((res as { _location?: string })._location).toBe(
      `https://${SITE.apex}/articles?ref=x`,
    );
    expect(nextCalled).toBe(false);
  });

  it("does NOT redirect when host is already apex", () => {
    const req = fakeReq(SITE.apex);
    const res = makeRes();
    let nextCalled = false;
    const next: NextFunction = () => {
      nextCalled = true;
    };
    wwwToApexRedirect(req, res, next);
    expect(nextCalled).toBe(true);
    expect((res as { _status?: number })._status).toBeUndefined();
  });
});

describe("amazon affiliate", () => {
  it("always appends the spankyspinola-20 tag", () => {
    const u = amazonLink("B0TEST0001");
    expect(u).toMatch(/[?&]tag=spankyspinola-20\b/);
    expect(u).toMatch(/B0TEST0001/);
  });
});

describe("internal links registry", () => {
  it("returns at least 3 distinct internal anchors when asked for 3", () => {
    const picks = pickInternalAnchors(3);
    expect(picks.length).toBeGreaterThanOrEqual(3);
    const slugs = new Set(picks.map((p) => p.slug));
    expect(slugs.size).toBe(picks.length);
  });
});


import { canonicaliseUrl } from "./lib/aeo";
// herbs.ts lives under client/src/data; import via relative path.
import { HERBS } from "../client/src/data/herbs";

describe("canonical URL builder", () => {
  it("strips utm params, trailing slash, and forces apex+https", () => {
    const u = canonicaliseUrl(`https://www.${SITE.apex}/articles/foo/?utm_source=x&utm_medium=y`);
    expect(u).toBe(`https://${SITE.apex}/articles/foo`);
  });
  it("preserves non-utm querystring", () => {
    const u = canonicaliseUrl(`https://${SITE.apex}/articles?page=2&utm_source=x`);
    expect(u).toMatch(/\?page=2$/);
    expect(u).not.toMatch(/utm_source/);
  });
});

describe("herbs page", () => {
  it("ships at least 60 verified ASIN entries", () => {
    expect(HERBS.length).toBeGreaterThanOrEqual(60);
  });
  it("has unique ASINs and the spankyspinola-20 tag flows through amazonLink", () => {
    const set = new Set(HERBS.map((h) => h.asin));
    expect(set.size).toBe(HERBS.length);
    // every herb's amazonLink output uses the audit tag
    for (const h of HERBS.slice(0, 5)) {
      expect(amazonLink(h.asin)).toMatch(/tag=spankyspinola-20/);
    }
  });
  it("every entry has a category", () => {
    for (const h of HERBS) {
      expect(typeof h.category).toBe("string");
      expect(h.category.length).toBeGreaterThan(0);
    }
  });
});


describe("fonts on Bunny CDN", () => {
  const FONTS = [
    "https://noise-wound.b-cdn.net/fonts/merriweather-900.woff2",
    "https://noise-wound.b-cdn.net/fonts/merriweather-700.woff2",
    "https://noise-wound.b-cdn.net/fonts/ssp-400.woff2",
    "https://noise-wound.b-cdn.net/fonts/ssp-400i.woff2",
    "https://noise-wound.b-cdn.net/fonts/ssp-700.woff2",
    "https://noise-wound.b-cdn.net/fonts/inter-400.woff2",
    "https://noise-wound.b-cdn.net/fonts/inter-500.woff2",
    "https://noise-wound.b-cdn.net/fonts/inter-600.woff2",
  ];

  for (const url of FONTS) {
    it(`serves ${url.split("/").pop()} as font/woff2`, async () => {
      const head = await fetch(url, { method: "HEAD" });
      expect(head.status).toBe(200);
      const ct = head.headers.get("content-type") ?? "";
      expect(ct).toMatch(/font\/woff2/);
      const len = Number(head.headers.get("content-length") ?? "0");
      expect(len).toBeGreaterThan(10_000);
    });
  }

  it("index.html @font-face URLs all point at noise-wound.b-cdn.net", async () => {
    const fs = await import("fs");
    const html = fs.readFileSync("client/index.html", "utf8");
    const fontUrls = [...html.matchAll(/url\("([^"]+\.woff2)"\)/g)].map(m => m[1]);
    expect(fontUrls.length).toBeGreaterThanOrEqual(8);
    for (const u of fontUrls) {
      expect(u).toMatch(/^https:\/\/noise-wound\.b-cdn\.net\/fonts\//);
    }
  });
});
