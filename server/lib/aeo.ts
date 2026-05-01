import type { Article } from "../../drizzle/schema";
import { ORG, PUBLIC_BASE_URL, SITE, SITE_TAGLINE, SITE_TITLE } from "./site-config.js";

/** Strip UTM, fbclid, gclid, mc_eid; force apex; remove trailing slash. */
export function canonicaliseUrl(input: string): string {
  try {
    const u = new URL(input);
    u.hostname = SITE.apex;
    u.protocol = "https:";
    for (const k of Array.from(u.searchParams.keys())) {
      if (
        k.toLowerCase().startsWith("utm_") ||
        k === "fbclid" ||
        k === "gclid" ||
        k === "mc_eid" ||
        k === "ref"
      ) {
        u.searchParams.delete(k);
      }
    }
    let str = u.toString();
    str = str.replace(/\/+$/, "");
    if (str === `https://${SITE.apex}`) str = `https://${SITE.apex}/`;
    return str;
  } catch {
    return input;
  }
}

export function articleUrl(slug: string): string {
  return canonicaliseUrl(`${PUBLIC_BASE_URL}/articles/${slug}`);
}

// ─── JSON-LD ──────────────────────────────────────────────────────────────

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    name: ORG.name,
    legalName: ORG.legalName,
    url: PUBLIC_BASE_URL,
    description: ORG.description,
    logo: {
      "@type": "ImageObject",
      url: `${PUBLIC_BASE_URL}/favicon.svg`,
    },
    sameAs: [SITE.oraclelinkOrigin],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_TITLE,
    description: SITE_TAGLINE,
    url: PUBLIC_BASE_URL,
    publisher: { "@id": `${PUBLIC_BASE_URL}#org` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${PUBLIC_BASE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function authorJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.author,
    url: `${PUBLIC_BASE_URL}/author/the-oracle-lover`,
    description:
      "Editor of The Noise Wound. Writes about misophonia, sound sensitivity, the salience network, and the lived exhaustion of misophonic life.",
    sameAs: [SITE.oraclelinkOrigin],
  };
}

export function breadcrumbJsonLd(crumbs: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

export function articleJsonLd(a: Article) {
  const url = articleUrl(a.slug);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title,
    description: a.metaDescription,
    image: [a.heroUrl],
    datePublished: a.publishedAt?.toISOString(),
    dateModified: a.lastModifiedAt.toISOString(),
    author: { "@type": "Person", name: SITE.author, url: `${PUBLIC_BASE_URL}/author/the-oracle-lover` },
    publisher: { "@type": "Organization", name: ORG.name, logo: { "@type": "ImageObject", url: `${PUBLIC_BASE_URL}/favicon.svg` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["section[data-tldr]"],
    },
    inLanguage: "en",
    articleSection: a.category,
    keywords: a.tags.join(", "),
    wordCount: a.wordCount,
    isAccessibleForFree: true,
  };
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

// ─── Robots / sitemap ─────────────────────────────────────────────────────

export const ROBOTS_TXT = `# robots.txt for ${SITE.apex}
# Open access for crawlers and AI assistants.

User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

# Major search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Yandex
Allow: /

User-agent: Slurp
Allow: /

# AI assistants and answer engines
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: Anthropic-AI
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: cohere-ai
Allow: /

User-agent: Bytespider
Allow: /

User-agent: Diffbot
Allow: /

User-agent: FacebookBot
Allow: /

User-agent: Meta-ExternalAgent
Allow: /

User-agent: YouBot
Allow: /

User-agent: Amazonbot
Allow: /

Sitemap: ${PUBLIC_BASE_URL}/sitemap.xml
`;

export function sitemapXml(articles: Article[]): string {
  const staticPaths = ["/", "/about", "/recommended", "/articles", "/author/the-oracle-lover"];
  const staticEntries = staticPaths
    .map(
      (p) => `  <url>
    <loc>${canonicaliseUrl(`${PUBLIC_BASE_URL}${p}`)}</loc>
    <changefreq>weekly</changefreq>
    <priority>${p === "/" ? "1.0" : "0.8"}</priority>
  </url>`,
    )
    .join("\n");

  const articleEntries = articles
    .map((a) => {
      const lastmod = (a.lastModifiedAt ?? a.publishedAt ?? new Date()).toISOString();
      return `  <url>
    <loc>${articleUrl(a.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticEntries}
${articleEntries}
</urlset>`;
}

export function llmsTxt(articles: Article[]): string {
  return [
    `# ${SITE_TITLE}`,
    "",
    `> ${SITE_TAGLINE}`,
    "",
    `Author: ${SITE.author}`,
    `Apex: ${PUBLIC_BASE_URL}`,
    "",
    "## Sections",
    "- /about - editorial stance and methodology",
    "- /recommended - the recommended quiet kit (Amazon)",
    "- /articles - full archive",
    "- /author/the-oracle-lover - author bio",
    "",
    "## Articles",
    ...articles.map(
      (a) => `- [${a.title}](${articleUrl(a.slug)}) - ${a.metaDescription}`,
    ),
    "",
  ].join("\n");
}

export function llmsFullTxt(articles: Article[]): string {
  // Strips HTML to plain text, suitable for LLMs to ingest the whole site.
  const stripHtml = (html: string) =>
    html
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  return [
    `# ${SITE_TITLE}`,
    "",
    `> ${SITE_TAGLINE}`,
    "",
    `Author: ${SITE.author}`,
    `Apex: ${PUBLIC_BASE_URL}`,
    "",
    "---",
    "",
    ...articles.flatMap((a) => [
      `## ${a.title}`,
      `URL: ${articleUrl(a.slug)}`,
      `Category: ${a.category}`,
      `Published: ${a.publishedAt?.toISOString() ?? "queued"}`,
      `Last modified: ${a.lastModifiedAt.toISOString()}`,
      "",
      `TL;DR: ${a.tldr}`,
      "",
      stripHtml(a.body),
      "",
      "---",
      "",
    ]),
  ].join("\n");
}

export function rssXml(articles: Article[]): string {
  const items = articles
    .map(
      (a) => `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${articleUrl(a.slug)}</link>
      <guid isPermaLink="true">${articleUrl(a.slug)}</guid>
      <description>${escapeXml(a.metaDescription)}</description>
      <pubDate>${(a.publishedAt ?? new Date()).toUTCString()}</pubDate>
      <author>noreply@${SITE.apex} (${SITE.author})</author>
      <category>${escapeXml(a.category)}</category>
    </item>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${PUBLIC_BASE_URL}/</link>
    <description>${escapeXml(SITE_TAGLINE)}</description>
    <language>en</language>
${items}
  </channel>
</rss>`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
