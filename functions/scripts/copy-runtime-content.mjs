#!/usr/bin/env node
/**
 * Copy spine + lens JSON into functions/runtime for Cloud Functions deploy.
 * Run from functions/ via npm prebuild.
 */
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const functionsDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = join(functionsDir, "..");
const runtimeRoot = join(functionsDir, "runtime", "content");

const spineSrc = join(repoRoot, "content/spine/socrates-spine-l1-l5.draft.json");
const lensesSrc = join(repoRoot, "content/lenses");
const spineDest = join(runtimeRoot, "spine");
const lensesDest = join(runtimeRoot, "lenses");
const profilesSrc = join(repoRoot, "library-creator/profiles");
const profilesDest = join(functionsDir, "runtime/profiles");

mkdirSync(spineDest, { recursive: true });
mkdirSync(lensesDest, { recursive: true });

if (!existsSync(spineSrc)) {
  console.error(`Missing spine bundle: ${spineSrc}`);
  process.exit(1);
}

cpSync(spineSrc, join(spineDest, "socrates-spine-l1-l5.draft.json"));

for (const name of readdirSync(lensesSrc)) {
  if (name.endsWith(".json")) {
    cpSync(join(lensesSrc, name), join(lensesDest, name));
  }
}

mkdirSync(profilesDest, { recursive: true });
if (!existsSync(profilesSrc)) {
  console.error(`Missing domain profiles: ${profilesSrc}`);
  process.exit(1);
}
for (const name of readdirSync(profilesSrc)) {
  if (name.endsWith(".json")) {
    cpSync(join(profilesSrc, name), join(profilesDest, name));
  }
}

console.log(`Copied spine + lenses to ${runtimeRoot}`);
console.log(`Copied domain profiles to ${profilesDest}`);
