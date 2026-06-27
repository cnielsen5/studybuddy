#!/usr/bin/env tsx
/**
 * Merges orthopaedic L2/L3 into main spine, copies L4/L5 bundles, archives OB stub lens,
 * rebuilds socrates-spine-l1-l5.draft.json.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { SpineConcept } from "../src/spine/spineSchema.js";
import { validateSpineGraph, validateSpineGraphStructure } from "../src/spine/spineSchema.js";
import { validateSpineL4L5AnchorBundle } from "../src/spine/spineL4L5Schema.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../..");

const l3Path = join(repoRoot, "content/spine/socrates-spine-l1-l3.draft.json");
const orthoL23Path = join(repoRoot, "content/spine/drafts/orthopaedic-surgery-l2-l3.draft.json");
const orthoBundleDir = join(repoRoot, "content/spine/drafts/orthopaedic-l4-l5/bundles");
const mainBundleDir = join(repoRoot, "content/spine/l4-l5-bundles");
const lensDir = join(repoRoot, "content/lenses");
const obStub = join(lensDir, "lens_orthobullets_topic_taxonomy.stub.json");
const obStubArchived = join(lensDir, "lens_orthobullets_topic_taxonomy.stub.archived.json");

const ORTHO_L2 = "spine_medicine_clinical_l2_orthopaedic_surgery";
const MED_CLINICAL_L1 = "spine_medicine_clinical";

interface OrthoL23Draft {
  l2_root: SpineConcept;
  hub_concepts: SpineConcept[];
  concepts: SpineConcept[];
}

function mergeL3Spine(): { added: number; total: number } {
  const main = validateSpineGraph(JSON.parse(readFileSync(l3Path, "utf8")));
  const ortho = JSON.parse(readFileSync(orthoL23Path, "utf8")) as OrthoL23Draft;

  const byId = new Map(main.concepts.map((c) => [c.id, c]));
  const toAdd: SpineConcept[] = [ortho.l2_root, ...ortho.hub_concepts, ...ortho.concepts];

  for (const concept of toAdd) {
    if (byId.has(concept.id)) {
      throw new Error(`Duplicate spine id on merge: ${concept.id}`);
    }
    byId.set(concept.id, concept);
  }

  const l1 = byId.get(MED_CLINICAL_L1);
  if (!l1) throw new Error(`Missing ${MED_CLINICAL_L1}`);
  if (!l1.dependency_graph.unlocks.includes(ORTHO_L2)) {
    l1.dependency_graph.unlocks.push(ORTHO_L2);
    const dc = l1.domain_contexts.find((d) => d.domain_id === "medicine_clinical");
    if (dc && !dc.dependency_graph.unlocks_in_context.includes(ORTHO_L2)) {
      dc.dependency_graph.unlocks_in_context.push(ORTHO_L2);
    }
  }

  const concepts = [...byId.values()].sort((a, b) => {
    if (a.resolution_level !== b.resolution_level) return a.resolution_level - b.resolution_level;
    return a.id.localeCompare(b.id);
  });

  const counts = {
    level_1: concepts.filter((c) => c.resolution_level === 1).length,
    level_2: concepts.filter((c) => c.resolution_level === 2).length,
    level_3: concepts.filter((c) => c.resolution_level === 3).length,
    total: concepts.length,
  };

  const merged = {
    ...main,
    _meta: {
      ...main._meta,
      status: "draft",
      notes:
        (main._meta.notes ?? "") +
        " Orthopaedic surgery L2 + 11 hub L3 + 113 topic L3 merged 2026-06-27.",
      concept_counts: counts,
      orthopaedic_merge: {
        date: "2026-06-27",
        l2: ORTHO_L2,
        hub_l3_count: ortho.hub_concepts.length,
        topic_l3_count: ortho.concepts.length,
      },
    },
    concepts,
  };

  const parsed = validateSpineGraph(merged);
  const validation = validateSpineGraphStructure(parsed);
  if (validation.hardErrors.length > 0) {
    console.error("L1-L3 merge hard errors:");
    for (const e of validation.hardErrors.slice(0, 20)) console.error(`  - ${e}`);
    process.exit(1);
  }

  writeFileSync(l3Path, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  return { added: toAdd.length, total: concepts.length };
}

function copyOrthoBundles(): { copied: number; skipped: number } {
  mkdirSync(mainBundleDir, { recursive: true });
  const existing = new Set(readdirSync(mainBundleDir).filter((f) => f.endsWith(".json")));
  const orthoFiles = readdirSync(orthoBundleDir).filter((f) => f.endsWith(".json"));

  let copied = 0;
  let skipped = 0;
  for (const file of orthoFiles) {
    const src = join(orthoBundleDir, file);
    const dest = join(mainBundleDir, file);
    if (existing.has(file)) {
      throw new Error(`Anchor bundle already exists — resolve manually: ${file}`);
    }
    const bundle = validateSpineL4L5AnchorBundle(JSON.parse(readFileSync(src, "utf8")));
    writeFileSync(dest, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
    copied++;
  }
  return { copied, skipped };
}

function archiveObStubLens(): void {
  if (!existsSync(obStub)) return;
  if (existsSync(obStubArchived)) return;
  renameSync(obStub, obStubArchived);
  console.log(`Archived ${obStub} → ${obStubArchived}`);
}

function main() {
  console.log("Merging orthopaedic L2/L3 into main spine...");
  const { added, total } = mergeL3Spine();
  console.log(`Wrote ${l3Path} (+${added} concepts, total L1-L3=${total})`);

  console.log("Copying orthopaedic L4/L5 anchor bundles...");
  const { copied } = copyOrthoBundles();
  console.log(`Copied ${copied} bundles to ${mainBundleDir}`);

  archiveObStubLens();

  console.log("Run: npm run build:spine-l1-l5");
}

main();
