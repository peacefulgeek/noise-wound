/**
 * Quality gate — runs against generated article body before insert.
 * Returns { passed:false, reasons:[...] } and the caller regenerates up to 3
 * attempts. After 3 attempts the article is dropped and a cron note is logged.
 */

/** Union of every AI-flagged word/phrase list across the master + per-site scopes. */
export const AI_FLAGGED_WORDS = [
  // Generic AI tells
  "delve",
  "deep dive",
  "in today's fast-paced world",
  "in this article",
  "let's dive in",
  "let's explore",
  "buckle up",
  "in conclusion",
  "stay tuned",
  "tapestry",
  "intricate",
  "myriad",
  "navigate",
  "navigating",
  "landscape",
  "ever-evolving",
  "ever-changing",
  "game-changer",
  "game changer",
  "revolutionize",
  "unleash",
  "unlock the power",
  "harness the power",
  "leverage",
  "synergy",
  "synergize",
  "robust",
  "seamless",
  "seamlessly",
  "elevate",
  "elevates",
  "embark",
  "embark on a journey",
  "journey of discovery",
  "in essence",
  "essentially",
  "ultimately",
  "moreover",
  "furthermore",
  "additionally",
  "consequently",
  "thus",
  "hence",
  "indeed",
  "notably",
  "remarkably",
  "interestingly",
  "needless to say",
  "first and foremost",
  "last but not least",
  "all in all",
  "to sum up",
  "to summarize",
  "as we navigate",
  "in the realm of",
  "realm of",
  "world of",
  "the world of",
  "groundbreaking",
  "cutting-edge",
  "state-of-the-art",
  "next-generation",
  "next generation",
  "best-in-class",
  "world-class",
  "thought leader",
  "thought leadership",
  "paradigm shift",
  "low-hanging fruit",
  "circle back",
  "deep-dive",
];

/** Phrases that trigger the gate even when individual words are clean. */
export const AI_FLAGGED_PHRASES = [
  "in today's fast-paced world",
  "in the digital age",
  "in this digital era",
  "in today's society",
  "in modern times",
  "as an ai language model",
  "as a language model",
  "i hope this helps",
  "i hope you enjoyed",
  "thank you for reading",
  "feel free to",
  "don't hesitate to",
  "without further ado",
  "the bottom line is",
  "at the end of the day",
  "when all is said and done",
];

/** Author-side bans inherited from the voice spec. */
export const AUTHOR_BANNED_PHRASES = [
  "sweetheart",
  "my friend",
  "just so you know",
  "honey",
  "darling",
];

/** Names that must never appear anywhere in body, code, or assets. */
export const FORBIDDEN_NAMES = [
  "paul wagner",
  "paul.wagner",
  "paulwagner",
  "kalesh",
  "shrikrishna",
];

/** Soft-language voice signals that should appear at least N times. */
export const VOICE_SIGNALS = [
  "your nervous system",
  "your body",
  "the trigger",
  "the room",
  "the listening",
];

/** EEAT signals enforced server-side. The route handler will additionally fail
 * the gate when these don't render in the published HTML. */
export const EEAT_SIGNAL_TAGS = [
  'data-tldr="ai-overview"',
  'class="author-byline"',
  'data-eeat="author"',
];

export interface QualityGateInput {
  title: string;
  body: string;
  tldr: string;
  internalLinkCount: number;
  externalAuthLinkCount: number;
  selfReferenceCount: number;
  hasLastUpdated: boolean;
}

export interface QualityGateResult {
  passed: boolean;
  reasons: string[];
}

const EM_DASH = /\u2014/;
const EN_DASH = /\u2013/;

export function runQualityGate(input: QualityGateInput): QualityGateResult {
  const reasons: string[] = [];
  const haystack = `${input.title}\n${input.tldr}\n${input.body}`.toLowerCase();

  for (const word of AI_FLAGGED_WORDS) {
    if (haystack.includes(word.toLowerCase())) {
      reasons.push(`flagged-word: "${word}"`);
    }
  }
  for (const phrase of AI_FLAGGED_PHRASES) {
    if (haystack.includes(phrase.toLowerCase())) {
      reasons.push(`flagged-phrase: "${phrase}"`);
    }
  }
  for (const phrase of AUTHOR_BANNED_PHRASES) {
    if (haystack.includes(phrase.toLowerCase())) {
      reasons.push(`author-banned-phrase: "${phrase}"`);
    }
  }
  for (const name of FORBIDDEN_NAMES) {
    if (haystack.includes(name.toLowerCase())) {
      reasons.push(`forbidden-name: "${name}"`);
    }
  }

  if (EM_DASH.test(input.body) || EM_DASH.test(input.title) || EM_DASH.test(input.tldr)) {
    reasons.push("em-dash present (zero tolerance)");
  }
  if (EN_DASH.test(input.body) || EN_DASH.test(input.title) || EN_DASH.test(input.tldr)) {
    reasons.push("en-dash present (zero tolerance)");
  }

  if (input.internalLinkCount < 3) {
    reasons.push(`internal-links < 3 (got ${input.internalLinkCount})`);
  }
  if (input.externalAuthLinkCount < 1) {
    reasons.push("external authoritative link missing");
  }
  if (input.selfReferenceCount < 1) {
    reasons.push("self-referencing line missing");
  }
  if (!input.hasLastUpdated) {
    reasons.push("last-updated <time> tag missing");
  }

  const wc = input.body.split(/\s+/).filter(Boolean).length;
  if (wc < 1500 || wc > 2600) {
    reasons.push(`word-count out of range: ${wc} (need 1500-2600)`);
  }

  // Voice signals: at least one must show up
  const voiceHits = VOICE_SIGNALS.filter((s) =>
    input.body.toLowerCase().includes(s.toLowerCase()),
  ).length;
  if (voiceHits === 0) {
    reasons.push("no voice signals present");
  }

  return { passed: reasons.length === 0, reasons };
}

/**
 * Strip em/en dashes from a string before storing. The gate enforces zero
 * tolerance, but for hand-written test fixtures we still expose this helper.
 */
export function normalizeDashes(text: string): string {
  return text.replace(/\u2014/g, " - ").replace(/\u2013/g, "-");
}
