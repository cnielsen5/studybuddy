#!/usr/bin/env tsx
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { mergeSpineL4L5Draft } from "../src/spine/spineL4L5Bundler.js";
import { validateSpineL4L5Graph, validateSpineL4L5Structure } from "../src/spine/spineL4L5Schema.js";
import { validateSpineGraph, validateSpineGraphStructure } from "../src/spine/spineSchema.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = join(__dirname, "../..");
const l3Path = join(repoRoot, "content/spine/socrates-spine-l1-l3.draft.json");
const outPath = join(repoRoot, "content/spine/socrates-spine-l1-l5.draft.json");

const l3Bundle = validateSpineGraph(JSON.parse(readFileSync(l3Path, "utf8")));
const l3Validation = validateSpineGraphStructure(l3Bundle);
if (l3Validation.hardErrors.length > 0) {
  console.error("L1-L3 hard errors:", l3Validation.hardErrors.slice(0, 10));
  process.exit(1);
}

const { bundle: l4l5, validation: l4l5Validation } = mergeSpineL4L5Draft({ repoRoot });
const parsedL4L5 = validateSpineL4L5Graph(l4l5);

if (l4l5Validation.hardErrors.length > 0) {
  console.error("L4/L5 hard errors:", l4l5Validation.hardErrors.slice(0, 10));
  process.exit(1);
}

const l3Ids = new Set(l3Bundle.concepts.map((c) => c.id));
const l4l5Ids = new Set(parsedL4L5.concepts.map((c) => c.id));
const overlap = [...l3Ids].filter((id) => l4l5Ids.has(id));
if (overlap.length > 0) {
  console.error("ID collision between L1-L3 and L4/L5:", overlap.slice(0, 5));
  process.exit(1);
}

const l1 = l3Bundle.concepts.filter((c) => c.resolution_level === 1).length;
const l2 = l3Bundle.concepts.filter((c) => c.resolution_level === 2).length;
const l3 = l3Bundle.concepts.filter((c) => c.resolution_level === 3).length;
const l4 = parsedL4L5.concepts.filter((c) => c.resolution_level === 4).length;
const l5 = parsedL4L5.concepts.filter((c) => c.resolution_level === 5).length;

const combined = {
  _meta: {
    spine_version: "0.2-draft",
    model: "universal-spine-l1-l5",
    generation_date: new Date().toISOString().slice(0, 10),
    status: parsedL4L5._meta.status,
    notes:
      "Merged L1-L3 master spine + universal L4/L5 anchor bundles. L4/L5 only for L3 nodes with max_resolution >= 4 in at least one domain context.",
    concept_counts: {
      level_1: l1,
      level_2: l2,
      level_3: l3,
      level_4: l4,
      level_5: l5,
      total: l1 + l2 + l3 + l4 + l5,
    },
    l4_l5_anchor_count: parsedL4L5._meta.anchor_count,
    domains: [
      "biology",
      "chemistry",
      "mathematics",
      "medicine_clinical",
      "medicine_preclinical",
      "physics",
      "psychology_neuroscience",
    ],
    forward_reference_warnings: parsedL4L5._meta.forward_reference_warnings ?? [],
    graph_consistency_warnings: parsedL4L5._meta.graph_consistency_warnings ?? [],
    l5_membership_warnings: parsedL4L5._meta.l5_membership_warnings ?? [],
  },
  concepts: [...l3Bundle.concepts, ...parsedL4L5.concepts],
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(combined, null, 2)}\n`, "utf8");

console.log(`Wrote ${outPath}`);
console.log(
  `L1=${l1} L2=${l2} L3=${l3} L4=${l4} L5=${l5} total=${combined._meta.concept_counts.total}`
);

void validateSpineL4L5Structure(parsedL4L5, l3Ids);
