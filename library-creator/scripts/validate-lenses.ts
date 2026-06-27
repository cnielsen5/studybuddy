#!/usr/bin/env tsx
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateLensFile } from "../src/lens/loadLens.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const lensDir = join(repoRoot, "content/lenses");

if (!existsSync(lensDir)) {
  console.error(`Lens directory not found: ${lensDir}`);
  process.exit(1);
}

const files = readdirSync(lensDir).filter((name) => name.endsWith(".json"));
let failed = 0;

for (const file of files) {
  const path = join(lensDir, file);
  const issues = validateLensFile(path, repoRoot);
  if (issues.length === 0) {
    console.log(`OK ${file}`);
    continue;
  }
  failed++;
  console.error(`FAIL ${file}`);
  for (const issue of issues) {
    console.error(`  [${issue.code}] ${issue.message}`);
  }
}

if (failed > 0) process.exit(1);
console.log(`Validated ${files.length} lens file(s).`);
