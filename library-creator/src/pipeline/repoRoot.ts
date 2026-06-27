import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Resolve monorepo root from library-creator package. */
export function repoRootFromModule(): string {
  const url = typeof import.meta !== "undefined" ? import.meta.url : "";
  if (!url) {
    throw new Error("repoRoot must be passed explicitly in bundled runtime.");
  }
  return join(dirname(fileURLToPath(url)), "..", "..", "..");
}
