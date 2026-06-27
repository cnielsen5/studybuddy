#!/usr/bin/env node
import * as esbuild from "esbuild";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const functionsDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const vendorDir = join(functionsDir, "lib/vendor");
mkdirSync(vendorDir, { recursive: true });
const entry = join(functionsDir, "../library-creator/src/pipeline/functionsBundleEntry.ts");
const outfile = join(functionsDir, "lib/vendor/libraryCreator.cjs");

await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "cjs",
  outfile,
  sourcemap: true,
  logLevel: "info",
  external: ["jsdom"],
});

console.log(`Bundled library-creator → ${outfile}`);
