#!/usr/bin/env tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mergeSpineL4L5Draft } from "../src/spine/spineL4L5Bundler.js";
import { validateSpineL4L5Graph } from "../src/spine/spineL4L5Schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../..");
const outPath = join(repoRoot, "content/spine/socrates-spine-l4-l5.draft.json");

const { bundle, missingAnchors, validation } = mergeSpineL4L5Draft({ repoRoot });
const parsed = validateSpineL4L5Graph(bundle);

if (validation.hardErrors.length > 0) {
  console.error("L4/L5 structure errors (hard):");
  for (const issue of validation.hardErrors.slice(0, 50)) {
    console.error(`  - ${issue}`);
  }
  process.exit(1);
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");

const { concept_counts: counts, anchor_count: anchorCount } = parsed._meta;
console.log(`Wrote ${outPath}`);
console.log(
  `Anchors: ${anchorCount} · L4=${counts.level_4} L5=${counts.level_5} total=${counts.total}`
);

if (missingAnchors.length > 0) {
  console.warn(`Missing ${missingAnchors.length} anchor bundles:`);
  for (const key of missingAnchors.slice(0, 20)) {
    console.warn(`  - ${key}`);
  }
  if (missingAnchors.length > 20) {
    console.warn(`  ... and ${missingAnchors.length - 20} more`);
  }
}

if (validation.graphConsistencyWarnings.length > 0) {
  console.warn(`Graph consistency warnings: ${validation.graphConsistencyWarnings.length}`);
}

if (validation.l5MembershipWarnings.length > 0) {
  console.warn(`L5 membership warnings: ${validation.l5MembershipWarnings.length}`);
}

if (validation.citationUniformityWarnings.length > 0) {
  console.warn(`Citation uniformity warnings: ${validation.citationUniformityWarnings.length}`);
}

if (parsed._meta.forward_reference_warnings?.length) {
  console.warn(
    `Unresolved forward references: ${parsed._meta.forward_reference_warnings.length}`
  );
}
