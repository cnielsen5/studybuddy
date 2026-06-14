import type { LibraryBundle } from "./libraryTypes";

const LIBRARY_SLUG = "learning-science-v1";

let cached: LibraryBundle | null = null;

export async function loadLibrary(libraryId: string): Promise<LibraryBundle> {
  if (cached && cached.manifest.id === libraryId) {
    return cached;
  }

  const slug = libraryId === "lib_learning_science_v1" ? LIBRARY_SLUG : libraryId.replace(/^lib_/, "");
  const res = await fetch(`/libraries/${slug}/library.json`);
  if (!res.ok) {
    throw new Error(`Failed to load library ${libraryId}: ${res.status}`);
  }
  const bundle = (await res.json()) as LibraryBundle;
  if (bundle.manifest.id !== libraryId) {
    throw new Error(`Library manifest id mismatch: expected ${libraryId}, got ${bundle.manifest.id}`);
  }
  cached = bundle;
  return bundle;
}

export function clearLibraryCache() {
  cached = null;
}
