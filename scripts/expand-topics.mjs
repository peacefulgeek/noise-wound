#!/usr/bin/env node
// Combinatorial expansion of the 32 seed topics to 500 distinct topic prompts.
import fs from "node:fs";
import path from "node:path";
import url from "node:url";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const TOPICS_PATH = path.resolve(__dirname, "../server/data/topics.json");
const OUT_PATH = path.resolve(__dirname, "../server/data/topics-expanded.json");

const base = JSON.parse(fs.readFileSync(TOPICS_PATH, "utf-8"));

// Axes for combinatorial expansion.
const AUDIENCES = [
  { tag: "for-partners", suffix: "for partners", category: "relationships" },
  { tag: "for-parents", suffix: "for parents", category: "school" },
  { tag: "for-teens", suffix: "for teenagers", category: "school" },
  { tag: "for-students", suffix: "for university students", category: "school" },
  { tag: "for-clinicians", suffix: "for clinicians", category: "treatment" },
  { tag: "for-managers", suffix: "for managers", category: "work" },
  { tag: "for-women", suffix: "for women in midlife", category: "psychology" },
  { tag: "for-men", suffix: "for men who don't talk about it", category: "psychology" },
  { tag: "for-newly-diagnosed", suffix: "for the newly diagnosed", category: "psychology" },
  { tag: "for-skeptics", suffix: "for skeptics", category: "neuroscience" },
];

const ANGLES = [
  { tag: "research-driven", prefix: "What the research actually says about" },
  { tag: "story-driven", prefix: "The night I learned the truth about" },
  { tag: "practical", prefix: "A practical playbook for" },
  { tag: "contrarian", prefix: "Why the standard advice on" },
  { tag: "first-person", prefix: "Living with" },
  { tag: "explainer", prefix: "An honest explainer of" },
  { tag: "field-notes", prefix: "Field notes on" },
  { tag: "letter", prefix: "A letter to anyone struggling with" },
  { tag: "long-read", prefix: "The long read on" },
];

const SCENARIOS = [
  "the dinner table",
  "the open-plan office",
  "the school classroom",
  "the long-haul flight",
  "the family holiday",
  "the bedroom at 3 a.m.",
  "the weekly therapy session",
  "the dentist's chair",
  "the morning commute",
  "the in-laws' kitchen",
  "the supermarket queue",
  "the library exam hall",
  "the open kitchen restaurant",
  "the busy coffee shop",
];

const INTERVENTIONS = [
  "deep listening",
  "co-regulation",
  "interoceptive training",
  "the silent reset",
  "the half-second pause",
  "scripted exits",
  "honest disclosure",
  "non-violent communication",
  "polyvagal sequencing",
  "exposure with care",
  "self-compassion practice",
  "house-rule rewriting",
];

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[''""]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}

const out = [];
const seen = new Set();
const push = (t) => {
  const slug = slugify(t.topic);
  if (!slug || seen.has(slug)) return;
  seen.add(slug);
  out.push({ ...t, slug });
};

for (const t of base) push(t);

// Phase 1: original × audiences
for (const t of base) {
  for (const aud of AUDIENCES) {
    push({
      topic: `${t.topic} — ${aud.suffix}`,
      category: aud.category || t.category,
      tags: [...new Set([...(t.tags || []), aud.tag])].slice(0, 6),
    });
    if (out.length >= 500) break;
  }
  if (out.length >= 500) break;
}

// Phase 2: angle × scenario
for (const angle of ANGLES) {
  for (const sc of SCENARIOS) {
    push({
      topic: `${angle.prefix} misophonia at ${sc}`,
      category: "strategies",
      tags: ["scenarios", angle.tag, slugify(sc)],
    });
    if (out.length >= 500) break;
  }
  if (out.length >= 500) break;
}

// Phase 3: intervention deep-dives
for (const iv of INTERVENTIONS) {
  for (const sc of SCENARIOS) {
    push({
      topic: `Using ${iv} when misophonia hits at ${sc}`,
      category: "strategies",
      tags: ["intervention", slugify(iv), slugify(sc)],
    });
    if (out.length >= 500) break;
  }
  if (out.length >= 500) break;
}

// Phase 4: research-led pieces
const RESEARCH = [
  "Schroder et al. on the salience network",
  "Edelstein et al. on autonomic arousal",
  "Wu et al. on adolescent misophonia",
  "Siepsiak et al. on MisoQuest validation",
  "Kumar et al. on connectivity and disgust",
  "Brout et al. on consensus diagnostic criteria",
  "Rouw and Erfanian on prevalence",
  "Erfanian et al. on misophonia and tinnitus",
  "Vidal et al. on triggers and emotional response",
  "Dozier on the conditioned reflex model",
];
for (const r of RESEARCH) {
  push({
    topic: `Reading the literature: ${r}`,
    category: "neuroscience",
    tags: ["research", "literature"],
  });
}

// Phase 5: long-tail combinations until 500
const FILLERS = [
  "How misophonia changes after age 50",
  "Misophonia in pregnancy and postpartum",
  "Misophonia and PMDD",
  "Misophonia after a concussion",
  "Misophonia and tinnitus together",
  "Misophonia and hyperacusis: same family, different beasts",
  "Misophonia and OCD: where the overlap is real",
  "Misophonia and grief",
  "Misophonia and chronic pain",
  "Misophonia and high-functioning anxiety",
  "Misophonia and being the eldest daughter",
  "Misophonia and being neurodivergent in a neurotypical workplace",
  "Misophonia and being the only one who hears it",
  "When the misophonic moves out: building a quiet first apartment",
  "When the misophonic moves in: negotiating shared sound",
  "When the misophonic gets a new job",
  "When the misophonic gets a new baby",
  "When the misophonic falls in love with a loud chewer",
  "When the misophonic loses their best earplugs",
  "When the misophonic can't afford the headphones they need",
  "Misophonia and money: the hidden costs",
  "Misophonia and burnout",
  "Misophonia and exercise",
  "Misophonia and meditation",
  "Misophonia and yoga nidra",
  "Misophonia and breathwork",
  "Misophonia and acupuncture",
  "Misophonia and TCM diagnostics",
  "Misophonia and Ayurveda",
  "Misophonia and the menstrual cycle",
  "Misophonia and perimenopause",
];
for (const f of FILLERS) {
  push({ topic: f, category: "psychology", tags: ["long-tail"] });
  if (out.length >= 500) break;
}

// Truncate / pad
const TARGET = 500;
const final = out.slice(0, TARGET);
fs.writeFileSync(OUT_PATH, JSON.stringify(final, null, 2));
console.log(`[expand-topics] wrote ${final.length} topics → ${OUT_PATH}`);
