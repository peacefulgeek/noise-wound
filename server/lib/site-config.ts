/**
 * Centralised site configuration. All values fall back to scope defaults so the
 * build never breaks when an env var is missing on a deployment target.
 */
export const SITE = {
  apex: process.env.SITE_APEX?.trim() || "thenoisewound.com",
  author: process.env.SITE_AUTHOR?.trim() || "The Oracle Lover",
  niche:
    process.env.SITE_NICHE?.trim() ||
    "Misophonia, sound sensitivity, and the triggers nobody believes",
  amazonTag: process.env.AMAZON_TAG?.trim() || "spankyspinola-20",
  oraclelinkOrigin: "https://theoraclelover.com",
} as const;

export const PUBLIC_BASE_URL = `https://${SITE.apex}`;

export const SITE_TITLE =
  "The Noise Wound — Misophonia, Sound Sensitivity, and the Triggers Nobody Believes";

export const SITE_TAGLINE =
  "The only desk that takes misophonia seriously: neuroscience, strategies, and the lived exhaustion of misophonic life.";

export const ORG = {
  name: "The Noise Wound",
  legalName: "The Noise Wound Editorial",
  description: SITE_TAGLINE,
  contactEmail: `editor@${SITE.apex}`,
} as const;
