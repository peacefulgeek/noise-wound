declare module "*/bunny.mjs" {
  export const BUNNY: {
    storageZone: string;
    storageKey: string;
    pullZone: string;
    libraryPrefix: string;
    librarySize: number;
  };
  export function assignHeroImage(slug: string): string;
  export function randomLibraryImage(): string;
  export function fontUrl(filename: string): string;
}
