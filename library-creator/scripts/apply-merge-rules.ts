#!/usr/bin/env tsx
/**
 * Applies approved merge rules to universal L4/L5 anchor bundles.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { applyMergeRules, type TaggedProposal } from "../src/spine/spineL4L5ApplyMergeRules.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = join(__dirname, "../..");
const taggedPath = join(repoRoot, "content/spine/socrates-l4-l5-merge-proposals.tagged.json");
const reportPath = join(repoRoot, "content/spine/socrates-l4-l5-merge-apply.report.json");

const data = JSON.parse(readFileSync(taggedPath, "utf8")) as {
  proposals: TaggedProposal[];
};

const result = applyMergeRules(repoRoot, data.proposals);

writeFileSync(
  reportPath,
  `${JSON.stringify({ applied_at: new Date().toISOString(), ...result }, null, 2)}\n`,
  "utf8"
);

console.log("Merge rules applied:");
console.log(`  merges applied: ${result.mergesApplied}`);
console.log(`  merges skipped: ${result.mergesSkipped.length}`);
console.log(`  notes cleaned: ${result.notesCleaned}`);
console.log(`  forward refs added: ${result.forwardRefsAdded}`);
console.log(`  bundles written: ${result.bundlesWritten}`);
console.log(`  report: ${reportPath}`);

if (result.mergesSkipped.length > 0) {
  console.log("\nSkipped (first 15):");
  for (const s of result.mergesSkipped.slice(0, 15)) {
    console.log(`  - ${s.proposalId}: ${s.reason}`);
  }
}
