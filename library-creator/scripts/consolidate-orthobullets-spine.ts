#!/usr/bin/env tsx
/**
 * Merges the OrthoBullets-native orthopaedic spine into the master spine:
 *   - Replaces the legacy ortho L2/L3 subtree with 11 OB section L3 nodes
 *   - Copies per-section L4/L5 anchor bundles into content/spine/l4-l5-bundles/
 *   - Publishes the OrthoBullets curriculum lens
 *   - Rebuilds socrates-spine-l1-l5.draft.json
 *
 * Prerequisite: npm run backfill:orthobullets-topic-content && npm run build:orthobullets-spine
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import type { SpineConcept } from "../src/spine/spineSchema.js";
import { validateSpineGraph, validateSpineGraphStructure } from "../src/spine/spineSchema.js";
import { validateSpineL4L5AnchorBundle } from "../src/spine/spineL4L5Schema.js";
import { parseCurriculumLens } from "../src/types/curriculumLens.js";
import { ORTHO_L2_ROOT } from "../src/spine/data/orthobullets/generateSpine.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../..");
const l3Path = join(repoRoot, "content/spine/socrates-spine-l1-l3.draft.json");
const obL23Path = join(repoRoot, "content/spine/drafts/orthobullets/orthopaedic-orthobullets-l2-l3.draft.json");
const obBundleDir = join(repoRoot, "content/spine/drafts/orthobullets/bundles");
const mainBundleDir = join(repoRoot, "content/spine/l4-l5-bundles");
const obLensDraft = join(repoRoot, "content/spine/drafts/orthobullets/lens_orthobullets_orthopaedic_2026.draft.json");
const obLensLive = join(repoRoot, "content/lenses/lens_orthobullets_orthopaedic_2026.json");

const MED_CLINICAL_L1 = "spine_medicine_clinical";
const MERGE_DATE = new Date().toISOString().slice(0, 10);

interface ObL23Draft {
  l2_root: SpineConcept;
  sections: SpineConcept[];
}

function collectLegacyOrthoSubtree(concepts: SpineConcept[]): Set<string> {
  const remove = new Set<string>([ORTHO_L2_ROOT]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of concepts) {
      const parent = c.dependency_graph?.parent_concept_id;
      if (parent && remove.has(parent) && !remove.has(c.id)) {
        remove.add(c.id);
        changed = true;
      }
    }
  }
  return remove;
}

function shouldRemoveOrthoConcept(id: string, legacySubtree: Set<string>): boolean {
  return legacySubtree.has(id);
}

function mergeL3Spine(): { removed: number; added: number; total: number; legacySubtree: Set<string> } {
  const main = validateSpineGraph(JSON.parse(readFileSync(l3Path, "utf8")));
  const ob = JSON.parse(readFileSync(obL23Path, "utf8")) as ObL23Draft;

  const legacySubtree = collectLegacyOrthoSubtree(main.concepts);
  let kept = main.concepts.filter((c) => !shouldRemoveOrthoConcept(c.id, legacySubtree));
  // Scrub dependency edges pointing at removed ortho nodes.
  kept = kept.map((c) => {
    const dg = c.dependency_graph;
    const unlocks = dg.unlocks.filter((id) => !legacySubtree.has(id));
    const prerequisites = dg.prerequisites.filter((id) => !legacySubtree.has(id));
    const parent =
      dg.parent_concept_id && legacySubtree.has(dg.parent_concept_id)
        ? null
        : dg.parent_concept_id;
    const domain_contexts = c.domain_contexts.map((dc) => ({
      ...dc,
      dependency_graph: {
        prerequisites_in_context: dc.dependency_graph.prerequisites_in_context.filter(
          (id) => !legacySubtree.has(id)
        ),
        unlocks_in_context: dc.dependency_graph.unlocks_in_context.filter((ref) => {
          const id = typeof ref === "string" ? ref : ref.concept_id;
          return !legacySubtree.has(id);
        }),
      },
    }));
    if (
      unlocks.length === dg.unlocks.length &&
      prerequisites.length === dg.prerequisites.length &&
      parent === dg.parent_concept_id
    ) {
      return c;
    }
    return {
      ...c,
      dependency_graph: { ...dg, parent_concept_id: parent, prerequisites, unlocks },
      domain_contexts,
    };
  });
  const removed = main.concepts.length - kept.length;

  const byId = new Map(kept.map((c) => [c.id, c]));
  const toAdd: SpineConcept[] = [ob.l2_root, ...ob.sections];
  for (const concept of toAdd) {
    if (byId.has(concept.id)) byId.delete(concept.id);
    byId.set(concept.id, concept);
  }

  const l1 = byId.get(MED_CLINICAL_L1);
  if (!l1) throw new Error(`Missing ${MED_CLINICAL_L1}`);
  if (!l1.dependency_graph.unlocks.includes(ORTHO_L2_ROOT)) {
    l1.dependency_graph.unlocks.push(ORTHO_L2_ROOT);
  }
  const dc = l1.domain_contexts.find((d) => d.domain_id === "medicine_clinical");
  if (dc && !dc.dependency_graph.unlocks_in_context.includes(ORTHO_L2_ROOT)) {
    dc.dependency_graph.unlocks_in_context.push(ORTHO_L2_ROOT);
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
        ((main._meta.notes as string) ?? "") +
        ` OrthoBullets-native orthopaedic subtree merged ${MERGE_DATE} (11 sections, section→chapter→topic).`,
      concept_counts: counts,
      orthobullets_merge: {
        date: MERGE_DATE,
        l2: ORTHO_L2_ROOT,
        section_l3_count: ob.sections.length,
        removed_legacy_concepts: removed,
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
  return { removed, added: toAdd.length, total: concepts.length, legacySubtree };
}

function removeLegacyOrthoBundles(legacySubtree: Set<string>): number {
  let removed = 0;
  if (!existsSync(mainBundleDir)) return 0;
  for (const file of readdirSync(mainBundleDir).filter((f) => f.endsWith(".json"))) {
    const path = join(mainBundleDir, file);
    const bundle = JSON.parse(readFileSync(path, "utf8")) as { _meta?: { anchor_l3_id?: string } };
    const anchor = bundle._meta?.anchor_l3_id ?? file.replace(/\.json$/, "");
    if (legacySubtree.has(anchor)) {
      unlinkSync(path);
      removed++;
    }
  }
  return removed;
}

function installObBundles(): number {
  mkdirSync(mainBundleDir, { recursive: true });
  const obFiles = readdirSync(obBundleDir).filter((f) => f.endsWith(".json"));
  let installed = 0;

  for (const file of obFiles) {
    const src = join(obBundleDir, file);
    const bundle = validateSpineL4L5AnchorBundle(JSON.parse(readFileSync(src, "utf8")));
    const anchor = bundle._meta.anchor_l3_id;
    const dest = join(mainBundleDir, `${anchor}.json`);

    if (existsSync(dest)) {
      const existing = validateSpineL4L5AnchorBundle(JSON.parse(readFileSync(dest, "utf8")));
      if (existing._meta.anchor_l3_id === anchor) {
        rmSync(dest);
      } else {
        throw new Error(`Bundle filename collision at ${dest}`);
      }
    }

    writeFileSync(dest, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
    installed++;
  }
  return installed;
}

function publishLens(): void {
  if (!existsSync(obLensDraft)) throw new Error(`Missing lens draft: ${obLensDraft}`);
  const lens = JSON.parse(readFileSync(obLensDraft, "utf8"));
  parseCurriculumLens(lens);
  writeFileSync(obLensLive, `${JSON.stringify(lens, null, 2)}\n`, "utf8");
}

function main() {
  console.log("Merging OrthoBullets-native orthopaedic spine into master…");

  const { removed, added, total, legacySubtree } = mergeL3Spine();
  console.log(`L1-L3: removed ${removed} legacy ortho concepts, added ${added}, total=${total}`);

  const bundlesRemoved = removeLegacyOrthoBundles(legacySubtree);
  console.log(`Removed ${bundlesRemoved} legacy ortho topic bundles`);

  const bundlesInstalled = installObBundles();
  console.log(`Installed ${bundlesInstalled} OrthoBullets section bundles → ${mainBundleDir}`);

  publishLens();
  console.log(`Published lens → ${obLensLive}`);

  console.log("Rebuilding socrates-spine-l1-l5…");
  execSync("npm run build:spine-l1-l5", { cwd: join(__dirname, ".."), stdio: "inherit" });

  console.log("\nOrthoBullets orthopaedic spine merge complete.");
}

main();
