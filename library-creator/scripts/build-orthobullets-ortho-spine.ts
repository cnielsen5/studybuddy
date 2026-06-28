#!/usr/bin/env tsx
/**
 * Builds the OrthoBullets-native orthopaedic spine subtree (new L3/L4/L5 scheme)
 * and lens, into review drafts (does NOT mutate the master spine).
 *
 * Scheme: L2 Orthopaedic Surgery → L3 Section → L4 Chapter → L5 Topic.
 *   - Recon: real OrthoBullets data from content/spine/orthobullets/recon.taxonomy.json
 *   - Other 10 sections: re-bucketed from existing ABOS/StatPearls spine content
 *     (gaps flagged via obDataPending / pending_import provenance; no fabrication).
 *
 * Output:
 *   content/spine/drafts/orthobullets/orthopaedic-orthobullets-l2-l3.draft.json
 *   content/spine/drafts/orthobullets/bundles/<section>.json
 *   content/spine/drafts/orthobullets/orthopaedic-orthobullets-l4-l5.draft.json
 *   content/spine/drafts/orthobullets/lens_orthobullets_orthopaedic_2026.draft.json
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SpineConceptSchema } from "../src/spine/spineSchema.js";
import {
  validateSpineL4L5AnchorBundle,
  validateSpineL4L5Structure,
  type SpineL4L5GraphBundle,
} from "../src/spine/spineL4L5Schema.js";
import {
  parseCurriculumLens,
  validateCurriculumLensStructure,
} from "../src/types/curriculumLens.js";
import {
  ORTHO_L2_ROOT,
  buildSectionBundle,
  makeL2Root,
  makeSectionL3,
} from "../src/spine/data/orthobullets/generateSpine.js";
import { OB_SECTIONS } from "../src/spine/data/orthobullets/sections.js";
import { rebucketExistingOrtho } from "../src/spine/data/orthobullets/rebucketExisting.js";
import { buildOrthobulletsLensFromTaxonomy } from "../src/spine/data/orthobullets/lens.js";
import type { ObSectionTaxonomy } from "../src/spine/data/orthobullets/taxonomyTypes.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "../..");
const draftDir = join(repoRoot, "content/spine/drafts/orthobullets");
const bundleDir = join(draftDir, "bundles");
const taxDir = join(repoRoot, "content/spine/orthobullets");

// ── Assemble taxonomies for all 11 sections ──────────────────────────────
// Prefer committed per-section taxonomy artifacts:
//   recon.taxonomy.json           (authored OrthoBullets sheet)
//   <slug>.taxonomy.json          (scraped from the OrthoBullets site)
// Fall back to re-bucketed existing spine content only where no artifact exists.
const taxonomyBySection = new Map<string, ObSectionTaxonomy>();

for (const section of OB_SECTIONS) {
  const taxPath = join(taxDir, `${section.slug}.taxonomy.json`);
  if (existsSync(taxPath)) {
    const file = JSON.parse(readFileSync(taxPath, "utf8")) as { taxonomy: ObSectionTaxonomy };
    taxonomyBySection.set(section.slug, file.taxonomy);
  }
}

const { taxonomies: rebucketed } = rebucketExistingOrtho(repoRoot);
for (const t of rebucketed) {
  if (!taxonomyBySection.has(t.section)) taxonomyBySection.set(t.section, t);
}

for (const section of OB_SECTIONS) {
  if (!taxonomyBySection.has(section.slug)) {
    taxonomyBySection.set(section.slug, {
      section: section.slug,
      provenance: "pending_import",
      obDataPending: true,
      notes: "No OrthoBullets data imported yet for this section.",
      chapters: [],
    });
  }
}

// ── L2 + L3 sections ─────────────────────────────────────────────────────
const l2Root = makeL2Root();
const sectionConcepts = OB_SECTIONS.map((s) => makeSectionL3(s));
for (const c of [l2Root, ...sectionConcepts]) SpineConceptSchema.parse(c);

// ── L4/L5 bundles per section ────────────────────────────────────────────
mkdirSync(bundleDir, { recursive: true });
const allL4L5: SpineL4L5GraphBundle["concepts"] = [];
const sectionStats: Array<{ section: string; provenance: string; pending: boolean; l4: number; l5: number }> = [];

for (const section of OB_SECTIONS) {
  const taxonomy = taxonomyBySection.get(section.slug)!;
  const bundle = buildSectionBundle(section, taxonomy);
  if (!bundle) {
    sectionStats.push({ section: section.title, provenance: taxonomy.provenance, pending: taxonomy.obDataPending, l4: 0, l5: 0 });
    continue;
  }
  validateSpineL4L5AnchorBundle(bundle);
  writeFileSync(join(bundleDir, `${section.slug}.json`), `${JSON.stringify(bundle, null, 2)}\n`, "utf8");
  allL4L5.push(...bundle.concepts);
  sectionStats.push({
    section: section.title,
    provenance: taxonomy.provenance,
    pending: taxonomy.obDataPending,
    l4: bundle.concepts.filter((c) => c.resolution_level === 4).length,
    l5: bundle.concepts.filter((c) => c.resolution_level === 5).length,
  });
}

// ── Structural validation across the whole L4/L5 graph ───────────────────
const sectionL3Ids = new Set(sectionConcepts.map((c) => c.id));
const l4Count = allL4L5.filter((c) => c.resolution_level === 4).length;
const l5Count = allL4L5.filter((c) => c.resolution_level === 5).length;
const graphBundle: SpineL4L5GraphBundle = {
  _meta: {
    spine_version: "orthobullets-2026-draft",
    generation_date: "2026-06-27",
    status: "draft",
    notes: "OrthoBullets-native orthopaedic L4/L5 (section→chapter→topic).",
    anchor_count: sectionL3Ids.size,
    concept_counts: { level_4: l4Count, level_5: l5Count, total: allL4L5.length },
  },
  concepts: allL4L5,
};
const validation = validateSpineL4L5Structure(graphBundle, sectionL3Ids);
if (validation.hardErrors.length > 0) {
  console.error("L4/L5 hard errors:");
  for (const e of validation.hardErrors.slice(0, 30)) console.error(`  - ${e}`);
  process.exit(1);
}

// ── Lens ─────────────────────────────────────────────────────────────────
const lens = buildOrthobulletsLensFromTaxonomy([...taxonomyBySection.values()]);
parseCurriculumLens(lens);
const lensIssues = validateCurriculumLensStructure(lens);

// ── Write drafts ─────────────────────────────────────────────────────────
mkdirSync(draftDir, { recursive: true });
writeFileSync(
  join(draftDir, "orthopaedic-orthobullets-l2-l3.draft.json"),
  `${JSON.stringify(
    {
      _meta: {
        domain: "orthopaedic_surgery",
        parent_domain: "medicine_clinical",
        spine_root: ORTHO_L2_ROOT,
        scheme: "orthobullets: L3 section -> L4 chapter -> L5 topic",
        generation_date: "2026-06-27",
        status: "draft-for-review",
        section_count: sectionConcepts.length,
      },
      l2_root: l2Root,
      sections: sectionConcepts,
    },
    null,
    2
  )}\n`,
  "utf8"
);
writeFileSync(
  join(draftDir, "orthopaedic-orthobullets-l4-l5.draft.json"),
  `${JSON.stringify(graphBundle, null, 2)}\n`,
  "utf8"
);
writeFileSync(
  join(draftDir, "lens_orthobullets_orthopaedic_2026.draft.json"),
  `${JSON.stringify(lens, null, 2)}\n`,
  "utf8"
);

// ── Report ───────────────────────────────────────────────────────────────
console.log("OrthoBullets-native orthopaedic spine draft built.\n");
console.log("Section                | Provenance               | L4 | L5 ");
console.log("-----------------------+--------------------------+----+-----");
for (const s of sectionStats) {
  console.log(
    `${s.section.padEnd(22)} | ${s.provenance.padEnd(24)} | ${String(s.l4).padStart(2)} | ${String(s.l5).padStart(3)}${s.pending ? "  (OB import pending)" : ""}`
  );
}
console.log(`\nTotal L4 (chapters): ${l4Count} | Total L5 (topics): ${l5Count}`);
console.log(`Lens: ${lens.sections.length} sections, ${lens.concept_mappings.length} mappings, ${lensIssues.length} structure warnings`);
if (validation.warnings.length) console.log(`L4/L5 warnings: ${validation.warnings.length}`);
if (validation.citationUniformityWarnings.length)
  console.log(`Citation-uniformity warnings: ${validation.citationUniformityWarnings.length}`);
console.log(`\nDrafts written to ${draftDir}`);
