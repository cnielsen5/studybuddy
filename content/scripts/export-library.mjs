/**
 * Export a content library TypeScript bundle to library.json
 *
 * Usage: node scripts/export-library.mjs learning-science-v1
 */
import { execSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const libName = process.argv[2] ?? "learning-science-v1";
const contentRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

execSync(`npx --yes tsx scripts/export-library.ts ${libName}`, {
  cwd: contentRoot,
  stdio: "inherit",
});
