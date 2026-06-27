#!/usr/bin/env tsx
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateSpineL4L5AnchorBundle } from "../src/spine/spineL4L5Schema.js";
import {
  anchorBundleFilename,
  loadGenerationUnitsFromRepo,
  type L4L5GenerationUnit,
} from "../src/spine/spineL4L5Units.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = join(__dirname, "../..");
const outPath = join(repoRoot, "content/spine/l4-l5-generation-queue.json");

function loadExistingAnchorConcepts(anchorId: string): unknown[] {
  const path = join(repoRoot, "content/spine/l4-l5-bundles", anchorBundleFilename(anchorId));
  if (!existsSync(path)) return [];
  const bundle = validateSpineL4L5AnchorBundle(JSON.parse(readFileSync(path, "utf8")));
  return bundle.concepts;
}

function anchorPrimaryDomain(unit: L4L5GenerationUnit): string {
  return unit.parent_l3_concept.knowledge_graph.primary_domain;
}

const units = loadGenerationUnitsFromRepo(repoRoot);
const queue = units.map((unit) => ({
  queue_key: `${unit.parent_l3_id}.${unit.domain_id}`,
  anchor_l3_id: unit.parent_l3_id,
  anchor_primary_domain: anchorPrimaryDomain(unit),
  anchor_bundle_filename: anchorBundleFilename(unit.parent_l3_id),
  domain_id: unit.domain_id,
  max_resolution_in_context: unit.max_resolution_in_context,
  bundle_exists: existsSync(
    join(repoRoot, "content/spine/l4-l5-bundles", anchorBundleFilename(unit.parent_l3_id))
  ),
  existing_concept_count: loadExistingAnchorConcepts(unit.parent_l3_id).length,
  input: {
    anchor_l3_id: unit.parent_l3_id,
    anchor_primary_domain: anchorPrimaryDomain(unit),
    parent_l3_concept: unit.parent_l3_concept,
    target_domain_context: unit.target_domain_context,
    existing_anchor_concepts: loadExistingAnchorConcepts(unit.parent_l3_id),
    generation_parameters: unit.generation_parameters,
  },
}));

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(
  outPath,
  `${JSON.stringify({ unit_count: queue.length, queue }, null, 2)}\n`,
  "utf8"
);

console.log(`Wrote ${queue.length} queue entries to ${outPath}`);
