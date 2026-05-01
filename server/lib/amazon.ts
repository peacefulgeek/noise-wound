import { SITE } from "./site-config.js";
import asinsRaw from "../data/verified-asins.json" with { type: "json" };

export interface VerifiedAsin {
  asin: string;
  title: string;
  category: string;
  tags: string[];
}

export const VERIFIED_ASINS: VerifiedAsin[] = asinsRaw as VerifiedAsin[];

/** Build an Amazon link with our affiliate tag. Tag MUST always be appended. */
export function amazonLink(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${SITE.amazonTag}`;
}

/** Match products by category, falling back to tag overlap. */
export function matchProducts(opts: {
  category?: string;
  tags?: string[];
  limit?: number;
}): VerifiedAsin[] {
  const { category, tags = [], limit = 4 } = opts;
  const scored = VERIFIED_ASINS.map((p) => {
    let score = 0;
    if (category && p.category === category) score += 5;
    for (const t of tags) {
      if (p.tags.includes(t)) score += 1;
    }
    return { p, score };
  })
    .sort((a, b) => b.score - a.score)
    .filter((s) => s.score > 0)
    .slice(0, limit)
    .map((s) => s.p);

  // If nothing matched, return a deterministic spread across categories.
  if (scored.length === 0) {
    return VERIFIED_ASINS.slice(0, limit);
  }
  return scored;
}

/** Soft-language affiliate paragraph injectors. Each gets the (paid link) suffix. */
export function softAffiliateLine(p: VerifiedAsin): string {
  const phrasings = [
    `Some readers swear by the [${p.title}](${amazonLink(p.asin)}) (paid link) when their kitchen is the loudest place in the house.`,
    `If your trigger is the dinner table, [${p.title}](${amazonLink(p.asin)}) (paid link) is the option I keep hearing about.`,
    `For evening decompression, [${p.title}](${amazonLink(p.asin)}) (paid link) shows up on a lot of misophonic shelves.`,
    `When the office hum becomes too much, the [${p.title}](${amazonLink(p.asin)}) (paid link) is one route worth knowing about.`,
    `A quietly popular pick for night-time is the [${p.title}](${amazonLink(p.asin)}) (paid link).`,
  ];
  const idx = Math.floor(Math.random() * phrasings.length);
  return phrasings[idx];
}
