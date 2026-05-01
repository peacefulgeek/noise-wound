/**
 * Bunny CDN integration — credentials hard-coded per master scope §9.
 * Storage zone:   noise-wound (NY region)
 * Pull zone:      noise-wound.b-cdn.net
 * Storage host:   ny.storage.bunnycdn.com
 *
 * No environment variables. No Manus runtime. All assets served as compressed WebP.
 */

export const BUNNY = {
  storageZone: "noise-wound",
  storageKey: "4395078b-e81d-49eb-96590187e7bd-0355-458c",
  storageHost: "ny.storage.bunnycdn.com",
  pullZone: "noise-wound.b-cdn.net",
  libraryPrefix: "/library",
  librarySize: 92,
};

export function publicUrl(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `https://${BUNNY.pullZone}${p}`;
}

export function heroUrlForSlug(slug) {
  return publicUrl(`/heroes/${slug}.webp`);
}

export function ogUrlForSlug(slug) {
  return publicUrl(`/og/${slug}.webp`);
}

export function fontUrl(filename) {
  return publicUrl(`/fonts/${filename}`);
}

/** Random library hero — used for hero rotators where no slug exists yet. */
export function randomLibraryImage() {
  const idx = Math.floor(Math.random() * BUNNY.librarySize) + 1;
  const padded = String(idx).padStart(2, "0");
  return publicUrl(`${BUNNY.libraryPrefix}/lib-${padded}.webp`);
}

/** Deterministic library hero — same slug → same library file. */
export function assignHeroImage(slug) {
  return heroUrlForSlug(slug);
}

/**
 * PUT a buffer to Bunny storage. `path` is server-relative (e.g. "/heroes/a.webp").
 * Returns { ok, status, url }.
 */
export async function bunnyPut(path, body, contentType = "image/webp") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const url = `https://${BUNNY.storageHost}/${BUNNY.storageZone}${clean}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      AccessKey: BUNNY.storageKey,
      "Content-Type": contentType,
    },
    body,
  });
  return {
    ok: res.ok,
    status: res.status,
    url: publicUrl(clean),
  };
}

/** HEAD an asset to test existence without downloading. */
export async function bunnyExists(path) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const url = `https://${BUNNY.storageHost}/${BUNNY.storageZone}${clean}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { AccessKey: BUNNY.storageKey },
  });
  return res.ok;
}

/** DELETE an asset from Bunny storage. */
export async function bunnyDelete(path) {
  const clean = path.startsWith("/") ? path : `/${path}`;
  const url = `https://${BUNNY.storageHost}/${BUNNY.storageZone}${clean}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: { AccessKey: BUNNY.storageKey },
  });
  return res.ok;
}
