#!/usr/bin/env tsx
/**
 * Generates orthopaedic L4/L5 anchor bundles, merged draft, and curriculum lenses.
 * Output:
 *   content/spine/drafts/orthopaedic-l4-l5/bundles/{anchor}.json
 *   content/spine/drafts/orthopaedic-l4-l5.draft.json
 *   content/lenses/lens_abos_orthopaedic_2025.json
 *   content/lenses/lens_orthobullets_orthopaedic_2026.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildAllOrthopaedicAnchorBundles,
  orthopaedicAnchorStats,
} from "../src/spine/data/orthopaedicL4L5Data.js";
import { reconcileConceptContexts } from "../src/spine/spineL4L5Bundler.js";
import { validateSpineL4L5AnchorBundle } from "../src/spine/spineL4L5Schema.js";
import { buildAbosLens } from "../src/spine/data/orthopaedicSurgeryMeta.js";
import {
  buildFlatAbosOrthopaedicLens,
  buildOrthobulletsLens,
} from "../src/spine/data/orthopaedicOrthobulletsLens.js";
import { parseCurriculumLens, validateCurriculumLensStructure } from "../src/types/curriculumLens.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../..");
const bundleDir = join(repoRoot, "content/spine/drafts/orthopaedic-l4-l5/bundles");
const draftPath = join(repoRoot, "content/spine/drafts/orthopaedic-l4-l5.draft.json");
const abosLensPath = join(repoRoot, "content/lenses/lens_abos_orthopaedic_2025.json");
const obLensPath = join(repoRoot, "content/lenses/lens_orthobullets_orthopaedic_2026.json");

const bundles = buildAllOrthopaedicAnchorBundles();
mkdirSync(bundleDir, { recursive: true });

for (const bundle of bundles) {
  const anchor = bundle._meta.anchor_l3_id;
  const reconciled = {
    ...bundle,
    concepts: reconcileConceptContexts(bundle.concepts),
  };
  validateSpineL4L5AnchorBundle(reconciled);
  writeFileSync(join(bundleDir, `${anchor}.json`), `${JSON.stringify(reconciled, null, 2)}\n`, "utf8");
}

const allConcepts = reconcileConceptContexts(bundles.flatMap((b) => b.concepts));
const stats = orthopaedicAnchorStats();

const draft = {
  _meta: {
    domain: "orthopaedic_surgery",
    parent_domain: "medicine_clinical",
    generation_date: "2026-06-27",
    status: "draft-for-review",
    model: "universal-l4-l5",
    anchor_count: stats.anchorCount,
    topic_anchor_count: stats.topicAnchors,
    existing_anchor_count: stats.existingAnchors,
    concept_counts: {
      level_4: stats.l4,
      level_5: stats.l5,
      total: stats.total,
    },
    notes:
      "Standalone orthopaedic L4/L5 draft — not merged into socrates-spine-l1-l5 until resident approval. " +
      "Bone grafts demoted to L4 under fracture_reduction_and_fixation_principles. " +
      "Perioperative ortho L4 clusters on existing clinical nodes in existing_anchor_count.",
    bundle_dir: "content/spine/drafts/orthopaedic-l4-l5/bundles",
  },
  concepts: allConcepts,
};

writeFileSync(draftPath, `${JSON.stringify(draft, null, 2)}\n`, "utf8");

const abosFlat = buildFlatAbosOrthopaedicLens();
parseCurriculumLens(abosFlat);
writeFileSync(abosLensPath, `${JSON.stringify(abosFlat, null, 2)}\n`, "utf8");

const obLens = buildOrthobulletsLens();
parseCurriculumLens(obLens);
const obIssues = validateCurriculumLensStructure(obLens);
if (obIssues.length > 0) {
  console.warn("Orthobullets lens structure warnings:", obIssues.length);
}
writeFileSync(obLensPath, `${JSON.stringify(obLens, null, 2)}\n`, "utf8");

console.log(`Wrote ${bundles.length} anchor bundles to ${bundleDir}`);
console.log(`Wrote ${draftPath}`);
console.log(`L4=${stats.l4} L5=${stats.l5} total=${stats.total}`);
console.log(`Wrote ${abosLensPath} (${abosFlat.concept_mappings.length} mappings)`);
console.log(`Wrote ${obLensPath} (${obLens.concept_mappings.length} mappings)`);
console.log(`ABOS draft (nested): ${buildAbosLens().concept_mappings.length} mappings`);
