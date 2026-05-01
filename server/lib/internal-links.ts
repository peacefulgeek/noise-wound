/**
 * Static map of "evergreen" internal anchors and the short anchor texts we'll
 * use when the article body needs ≥3 internal links. Slugs without a matching
 * published article fall back to the homepage.
 */
export const INTERNAL_LINK_REGISTRY = [
  { slug: "/about", anchors: ["our editorial stance", "about the desk"] },
  { slug: "/recommended", anchors: ["our recommended quiet kit", "the recommended kit"] },
  { slug: "/articles", anchors: ["the rest of the archive", "browse the archive"] },
  { slug: "/author/the-oracle-lover", anchors: ["The Oracle Lover", "this author's other work"] },
  { slug: "/category/triggers", anchors: ["other trigger writeups", "more on triggers"] },
  { slug: "/category/strategies", anchors: ["working strategies", "more strategies"] },
  { slug: "/category/relationships", anchors: ["misophonia at home", "living with someone else's triggers"] },
  { slug: "/category/work", anchors: ["misophonia at work", "office strategies"] },
  { slug: "/category/sleep", anchors: ["sleep tactics", "the sleep desk"] },
] as const;

export const EXTERNAL_AUTHORITATIVE_LINKS = [
  { url: "https://misophonia.duke.edu/", anchor: "Duke Center for Misophonia and Emotion Regulation" },
  { url: "https://www.nimh.nih.gov/health/topics/anxiety-disorders", anchor: "National Institute of Mental Health" },
  { url: "https://www.ninds.nih.gov/", anchor: "National Institute of Neurological Disorders and Stroke" },
  { url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5371325/", anchor: "Kumar et al. — \"The Brain Basis for Misophonia\" (PMC)" },
  { url: "https://misophonia-association.org/", anchor: "Misophonia Association" },
  { url: "https://www.misophoniainstitute.org/", anchor: "Misophonia Institute" },
  { url: "https://soquietplease.com/", anchor: "soQuietPlease research index" },
  { url: "https://www.health.harvard.edu/", anchor: "Harvard Health Publishing" },
];

export function pickInternalAnchors(needed: number, exclude: string[] = []) {
  const out: { slug: string; anchor: string }[] = [];
  const pool = INTERNAL_LINK_REGISTRY.filter((l) => !exclude.includes(l.slug));
  for (let i = 0; i < needed && i < pool.length; i += 1) {
    const link = pool[i];
    const anchor = link.anchors[i % link.anchors.length];
    out.push({ slug: link.slug, anchor });
  }
  return out;
}

export function pickExternalAuthoritativeLink() {
  return EXTERNAL_AUTHORITATIVE_LINKS[
    Math.floor(Math.random() * EXTERNAL_AUTHORITATIVE_LINKS.length)
  ];
}
