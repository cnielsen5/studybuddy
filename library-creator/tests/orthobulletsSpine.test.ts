import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import {
  buildSectionBundle,
  makeL2Root,
  makeSectionL3,
  ORTHO_L2_ROOT,
} from "../src/spine/data/orthobullets/generateSpine.js";
import { OB_SECTIONS, OB_SECTION_BY_SLUG } from "../src/spine/data/orthobullets/sections.js";
import { buildOrthobulletsLensFromTaxonomy } from "../src/spine/data/orthobullets/lens.js";
import { rebucketExistingOrtho } from "../src/spine/data/orthobullets/rebucketExisting.js";
import type { ObSectionTaxonomy } from "../src/spine/data/orthobullets/taxonomyTypes.js";
import { SpineConceptSchema } from "../src/spine/spineSchema.js";
import {
  validateSpineL4L5AnchorBundle,
  validateSpineL4L5Structure,
  type SpineL4L5GraphBundle,
} from "../src/spine/spineL4L5Schema.js";
import { parseCurriculumLens } from "../src/types/curriculumLens.js";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const sampleTaxonomy: ObSectionTaxonomy = {
  section: "recon",
  provenance: "orthobullets_sheet",
  obDataPending: false,
  chapters: [
    {
      shortName: "ob_recon_tha_acute_complications",
      title: "THA Acute Complications",
      field: "Hip Reconstruction",
      definition: "Chapter covering acute complications after total hip arthroplasty.",
      summary: "Acute THA complications.",
      topics: [
        {
          shortName: "ob_recon_tha_acute_complications_tha_dislocation",
          title: "THA Dislocation",
          definition: "Dislocation after THA.",
          summary: "THA dislocation overview.",
        },
        {
          shortName: "ob_recon_tha_acute_complications_tha_periprosthetic_fracture",
          title: "THA Periprosthetic Fracture",
          definition: "Periprosthetic fracture after THA.",
          summary: "THA periprosthetic fracture overview.",
        },
      ],
    },
  ],
};

describe("OrthoBullets-native ortho spine generator", () => {
  it("emits 11 OrthoBullets sections as schema-valid L3 concepts under the ortho L2 root", () => {
    expect(OB_SECTIONS).toHaveLength(11);
    const l2 = makeL2Root();
    expect(l2.id).toBe(ORTHO_L2_ROOT);
    SpineConceptSchema.parse(l2);

    for (const section of OB_SECTIONS) {
      const l3 = makeSectionL3(section);
      expect(l3.resolution_level).toBe(3);
      expect(l3.dependency_graph.parent_concept_id).toBe(ORTHO_L2_ROOT);
      SpineConceptSchema.parse(l3);
      expect(l2.dependency_graph.unlocks).toContain(l3.id);
    }
  });

  it("builds a schema- and structure-valid L4/L5 bundle (section→chapter→topic)", () => {
    const bundle = buildSectionBundle(OB_SECTION_BY_SLUG.recon, sampleTaxonomy)!;
    expect(bundle).not.toBeNull();
    validateSpineL4L5AnchorBundle(bundle);

    const l4 = bundle.concepts.filter((c) => c.resolution_level === 4);
    const l5 = bundle.concepts.filter((c) => c.resolution_level === 5);
    expect(l4).toHaveLength(1);
    expect(l5).toHaveLength(2);

    // L4 anchors to the section L3; L5 parents to its L4.
    expect(l4[0].anchor_concept_id).toBe("spine_medicine_clinical_l3_orthopaedic_recon");
    expect(l4[0].dependency_graph.parent_concept_id).toBe(l4[0].anchor_concept_id);
    for (const t of l5) expect(t.dependency_graph.parent_concept_id).toBe(l4[0].id);

    const graph: SpineL4L5GraphBundle = {
      _meta: {
        spine_version: "test",
        generation_date: "2026-06-27",
        status: "draft",
        notes: "test",
        anchor_count: 1,
        concept_counts: { level_4: 1, level_5: 2, total: 3 },
      },
      concepts: bundle.concepts,
    };
    const result = validateSpineL4L5Structure(
      graph,
      new Set(["spine_medicine_clinical_l3_orthopaedic_recon"])
    );
    expect(result.hardErrors).toEqual([]);
  });

  it("returns null for an empty (pending) section", () => {
    expect(
      buildSectionBundle(OB_SECTION_BY_SLUG.anatomy, {
        section: "anatomy",
        provenance: "pending_import",
        obDataPending: true,
        chapters: [],
      })
    ).toBeNull();
  });

  it("builds a parseable lens mirroring the taxonomy (chapters depth 4, topics depth 5)", () => {
    const lens = buildOrthobulletsLensFromTaxonomy([sampleTaxonomy]);
    parseCurriculumLens(lens);
    expect(lens.sections).toHaveLength(11);
    const reconMappings = lens.concept_mappings.filter(
      (m) => m.section_id === "lens_section_ob_recon"
    );
    expect(reconMappings.some((m) => m.lens_specific.depth_in_lens === 4)).toBe(true);
    expect(reconMappings.some((m) => m.lens_specific.depth_in_lens === 5)).toBe(true);
  });

  it("re-buckets existing spine content into sections without fabrication", () => {
    const { taxonomies } = rebucketExistingOrtho(repoRoot);
    // Recon is excluded from re-bucketing (comes from the sheet).
    expect(taxonomies.some((t) => t.section === "recon")).toBe(false);
    expect(taxonomies.length).toBeGreaterThan(0);
    for (const t of taxonomies) {
      expect(t.provenance).toBe("rebucketed_existing_spine");
      expect(t.obDataPending).toBe(true);
      // Every chapter shortName is namespaced by section for global id uniqueness.
      for (const ch of t.chapters) expect(ch.shortName.startsWith(`ob_${t.section}_`)).toBe(true);
    }
  });
});
