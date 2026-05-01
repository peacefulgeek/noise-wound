import OpenAI from "openai";
import { ORACLE_LOVER_SYSTEM_PROMPT } from "./voice-spec.js";
import { SITE } from "./site-config.js";
import { AI_FLAGGED_WORDS, AI_FLAGGED_PHRASES, AUTHOR_BANNED_PHRASES, FORBIDDEN_NAMES } from "./quality-gate.js";

/**
 * DeepSeek V4-Pro client. Uses the OpenAI SDK pointed at https://api.deepseek.com.
 * Falls back to deepseek-chat (latest cheap model) only if OPENAI_MODEL is unset.
 */
export function getDeepseekClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL || "https://api.deepseek.com";
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY missing — DeepSeek writing engine cannot run.");
  }
  return new OpenAI({ apiKey, baseURL, timeout: 240_000, maxRetries: 0 });
}

export function getModel() {
  return process.env.OPENAI_MODEL || "deepseek-v4-pro";
}

export interface GenerateArticleContext {
  topic: string;
  category: string;
  tags: string[];
  openerType: "gut-punch" | "question" | "story" | "counterintuitive";
  conclusionType: "cta" | "reflection" | "question" | "challenge" | "benediction";
  faqCount: 0 | 2 | 3 | 5;
  internalLinks: { slug: string; anchor: string }[];
  externalAuthority: { url: string; anchor: string };
  amazonProducts: { asin: string; title: string }[];
  includeOraclelinkBacklink: boolean;
  oraclelinkUrl?: string;
  oraclelinkAnchor?: string;
  researcherStyle: "niche" | "spiritual";
  selfReferenceLine: string;
}

export const HARD_RULES = `
HARD RULES (zero tolerance):
- No em-dashes (—). No en-dashes (–). Use plain hyphens or commas.
- No banned words/phrases (delve, in conclusion, in today's fast-paced world, navigate the landscape, tapestry, etc.).
- No "as an AI" disclaimers. You are The Oracle Lover.
- No medical claims of cure. Strategies and accommodations only.
- Word count: 1,500 to 2,400 (strict floor 1,500).
- Every Amazon link must end with ?tag=${SITE.amazonTag} and the visible suffix (paid link).
- Every article must include:
  • a TL;DR section in <section data-tldr="ai-overview"> with 3-5 bullets
  • an author byline in <aside class="author-byline" data-eeat="author">
  • a <time datetime="…"> last-updated tag
  • at least 3 internal links from the supplied registry
  • at least 1 external authoritative link (nofollow)
  • at least 1 self-referencing line that mentions this site by name
- Forbidden names: paul wagner, paul.wagner, paulwagner, kalesh, shrikrishna.
- Pull quotes inserted every ~600 words as <blockquote class="pullquote">…</blockquote>.
- The first paragraph must be styled-ready for a drop-cap (just plain text, the CSS handles it).
`.trim();

export function buildSystemPrompt(): string {
  const exactBans = [
    "\nABSOLUTELY-FORBIDDEN WORDS (zero-tolerance, the gate fails the article on any single occurrence):",
    AI_FLAGGED_WORDS.map((w) => `  - "${w}"`).join("\n"),
    "\nABSOLUTELY-FORBIDDEN PHRASES:",
    AI_FLAGGED_PHRASES.map((p) => `  - "${p}"`).join("\n"),
    "\nFORBIDDEN PERSONAL ADDRESS PHRASES:",
    AUTHOR_BANNED_PHRASES.map((p) => `  - "${p}"`).join("\n"),
    "\nFORBIDDEN NAMES (never reference, anywhere):",
    FORBIDDEN_NAMES.map((p) => `  - "${p}"`).join("\n"),
  ].join("\n");
  return [ORACLE_LOVER_SYSTEM_PROMPT, HARD_RULES, exactBans].join("\n\n");
}

export function buildUserPrompt(ctx: GenerateArticleContext): string {
  const internalLinkLines = ctx.internalLinks
    .map((l) => `  - ${l.anchor} → ${l.slug}`)
    .join("\n");
  const productLines = ctx.amazonProducts
    .map(
      (p) =>
        `  - ${p.title}: https://www.amazon.com/dp/${p.asin}?tag=${SITE.amazonTag}`,
    )
    .join("\n");

  return `
Write an article for **${SITE.niche}** on the topic:

  "${ctx.topic}"

Category: ${ctx.category}
Tags: ${ctx.tags.join(", ")}
Opener type: ${ctx.openerType}
Conclusion type: ${ctx.conclusionType}
FAQ count: ${ctx.faqCount}
Researcher style: ${ctx.researcherStyle === "niche"
    ? "Cite real misophonia researchers (Pawel Jastreboff, Sukhbinder Kumar, Phyllis Nagel, Jennifer Brout, Marsha Johnson, Jaelline Jaffe). Do not cite spiritual or yogic figures."
    : "Cite *one* respected reflective voice or contemplative tradition (e.g. Tara Brach, Jon Kabat-Zinn, polyvagal theory, IFS, somatic experiencing). Do NOT cite paul wagner, kalesh, or shrikrishna."}

Use these internal links somewhere natural in the body (each at least once):
${internalLinkLines}

Use this external authoritative link with rel="nofollow" and target="_blank":
  - ${ctx.externalAuthority.anchor} → ${ctx.externalAuthority.url}

Mention these Amazon products softly (with the (paid link) suffix), 3 to 4 of them in total, never more, never less:
${productLines}

${ctx.includeOraclelinkBacklink && ctx.oraclelinkUrl
    ? `Include a single, contextually natural backlink to The Oracle Lover at ${ctx.oraclelinkUrl} using anchor text "${ctx.oraclelinkAnchor}".\n\n`
    : ""}
Include this exact self-referencing line somewhere in the body:
  > "${ctx.selfReferenceLine}"

OUTPUT FORMAT (strict):

Return one JSON object exactly matching this schema:

{
  "title": "string, ≤100 chars, no em/en dashes",
  "metaDescription": "string, 140-160 chars, no em/en dashes",
  "tldr": "string of 3-5 short bullets joined with newlines, plain text",
  "heroAlt": "string, 8-15 words describing the hero photograph",
  "bodyHtml": "string of the full article HTML body, including the TL;DR <section>, author byline <aside>, drop-cap-ready first <p>, pull quotes, ${ctx.faqCount} FAQs (or none if 0), and a <time datetime=ISO> tag for last-updated",
  "wordCount": integer
}

Do not wrap the JSON in markdown fences. Output only the JSON object.
`.trim();
}
