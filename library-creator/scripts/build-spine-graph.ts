#!/usr/bin/env tsx
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildSpineGraphDraft } from "../src/spine/spineBuilder.js";
import {
  reconcileForwardReferences,
  validateSpineGraph,
  validateSpineGraphStructure,
} from "../src/spine/spineSchema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../..");
const outPath = join(repoRoot, "content/spine/socrates-spine-l1-l3.draft.json");

const bundle = buildSpineGraphDraft();
const parsed = validateSpineGraph(bundle);
const { hardErrors, warnings, forwardReferences } = validateSpineGraphStructure(parsed);

if (hardErrors.length > 0) {
  console.error("Spine structure errors (hard):");
  for (const issue of hardErrors.slice(0, 50)) {
    console.error(`  - ${issue}`);
  }
  if (hardErrors.length > 50) {
    console.error(`  ... and ${hardErrors.length - 50} more`);
  }
  process.exit(1);
}

const spineIds = new Set(parsed.concepts.map((concept) => concept.id));
const unresolved = reconcileForwardReferences(forwardReferences, spineIds);

if (warnings.length > 0) {
  console.warn(`Spine forward-reference warnings: ${warnings.length}`);
  for (const issue of warnings.slice(0, 20)) {
    console.warn(`  - ${issue}`);
  }
  if (warnings.length > 20) {
    console.warn(`  ... and ${warnings.length - 20} more`);
  }
}

if (unresolved.length > 0) {
  console.warn(`Unresolved forward references after spine completion: ${unresolved.length}`);
  for (const ref of unresolved.slice(0, 20)) {
    console.warn(`  - ${ref.from} → ${ref.to} (${ref.edge})`);
  }
}

parsed._meta.forward_reference_warnings = forwardReferences;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");

const { concept_counts: counts } = parsed._meta;
console.log(`Wrote ${outPath}`);
console.log(
  `Concepts: L1=${counts?.level_1} L2=${counts?.level_2} L3=${counts?.level_3} total=${counts?.total}`
);
