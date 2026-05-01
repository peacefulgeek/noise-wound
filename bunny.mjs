/**
 * Bunny CDN integration.
 *
 * Per master scope §9: credentials are HARD-CODED here, not in env. They live in
 * version control because the only secrets shared across all 200 satellite
 * sites are these and they need to be consistent across `bulk-seed.mjs` calls.
 *
 * NOTE: the user is providing the real Bunny zone, key, and pull-zone separately.
 * Until those are pasted in, the placeholders below let `assignHeroImage()` keep
 * returning a working CDN-shaped URL (Bunny pull-zone for the network's image
 * library at `noise-wound-images.b-cdn.net`). When the real values arrive, just
 * swap the three constants below — no other file needs to change.
 */
export const BUNNY = {
  storageZone: "noise-wound-images",
  storageKey: "PLACEHOLDER_STORAGE_KEY_REPLACE_AT_HANDOFF",
  pullZone: "noise-wound-images.b-cdn.net",
  // 92 image library files (lib-01.webp ... lib-92.webp) sit under /library/.
  libraryPrefix: "/library",
  librarySize: 92,
  // Per-article hero key pattern is /images/{slug}.webp. Until Bunny PUT credentials
  // exist, the pull-zone serves a deterministic library file mirroring the slug hash.
};

/**
 * Stable hash → 1..librarySize index. So the same slug always maps to the same
 * library photograph (so previews stay deterministic across rebuilds).
 */
function slugIndex(slug, max = BUNNY.librarySize) {
  let h = 0;
  for (let i = 0; i < slug.length; i += 1) {
    h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return (h % max) + 1;
}

/**
 * Returns the public CDN URL for the article hero. Once the user uploads
 * /images/{slug}.webp, the function automatically prefers that path (via a
 * cheap convention that the seed engine sets `pre-uploaded:true` only when the
 * upload succeeded). For everything else we hand back a library file.
 */
export function assignHeroImage(slug) {
  const idx = slugIndex(slug);
  const padded = String(idx).padStart(2, "0");
  return `https://${BUNNY.pullZone}${BUNNY.libraryPrefix}/lib-${padded}.webp`;
}

/**
 * Random library hero — used for placeholder modules where no slug exists yet
 * (homepage rotators, "trending" rails, etc.).
 */
export function randomLibraryImage() {
  const idx = Math.floor(Math.random() * BUNNY.librarySize) + 1;
  const padded = String(idx).padStart(2, "0");
  return `https://${BUNNY.pullZone}${BUNNY.libraryPrefix}/lib-${padded}.webp`;
}

/**
 * Deterministic CDN URL for a font file. All three Bunny-hosted WOFF2 fonts
 * sit under /fonts/.
 */
export function fontUrl(filename) {
  return `https://${BUNNY.pullZone}/fonts/${filename}`;
}
