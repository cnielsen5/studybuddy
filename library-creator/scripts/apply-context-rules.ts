#!/usr/bin/env tsx
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { applyContextRules } from "../src/spine/spineL4L5ApplyContextRules.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = join(__dirname, "../..");
const reportPath = join(repoRoot, "content/spine/socrates-l4-l5-context-apply.report.json");

const result = applyContextRules(repoRoot);

writeFileSync(
  reportPath,
  `${JSON.stringify({ applied_at: new Date().toISOString(), ...result }, null, 2)}\n`,
  "utf8"
);

console.log("Context rules applied:");
console.log(`  shared notes cleaned: ${result.sharedNotesCleaned}`);
console.log(`  reviewer notes cleaned: ${result.reviewerNotesCleaned}`);
console.log(`  domain contexts added: ${result.contextsAdded}`);
console.log(`  R-MIG-Z promotions: ${result.promotionsApplied}`);
console.log(`  bundles written: ${result.bundlesWritten}`);
console.log(`  report: ${reportPath}`);
