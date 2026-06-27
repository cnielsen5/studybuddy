import {
  buildSectionTree,
  parseCurriculumLens,
  validateCurriculumLensStructure,
} from "../src/types/curriculumLens.js";
import {
  applyLens,
  getDepthInLens,
  getEffectiveHighYieldScore,
  getTitleInLens,
  type LensSpineConcept,
} from "../src/lens/applyLens.js";

const sampleLens = parseCurriculumLens({
  id: "lens_abos_blueprint_2024",
  name: "ABOS Board Certification Blueprint 2024",
  source: "American Board of Orthopaedic Surgery",
  domain_id: "medicine_clinical",
  version: "2024",
  description: "Exam-weighted orthopaedic surgery board blueprint.",
  intended_audience: "Orthopaedic surgery residents preparing for boards",
  sections: [
    {
      id: "lens_section_abos_basic_science",
      title: "Basic Science",
      parent_section_id: null,
      order: 0,
      weight: 15,
    },
    {
      id: "lens_section_abos_trauma",
      title: "Trauma",
      parent_section_id: null,
      order: 1,
      weight: 20,
    },
    {
      id: "lens_section_abos_trauma_bone_biology",
      title: "Bone Biology",
      parent_section_id: "lens_section_abos_trauma",
      order: 0,
    },
  ],
  concept_mappings: [
    {
      spine_concept_id: "spine_medicine_clinical_l4_fracture_healing",
      section_id: "lens_section_abos_basic_science",
      lens_specific: {
        title_in_lens: "Fracture Healing (Basic Science)",
        order_in_section: 0,
        high_yield_in_lens: true,
        depth_in_lens: 4,
      },
    },
    {
      spine_concept_id: "spine_medicine_clinical_l4_fracture_healing",
      section_id: "lens_section_abos_trauma_bone_biology",
      lens_specific: {
        order_in_section: 0,
        high_yield_in_lens: true,
        depth_in_lens: 5,
        notes: "Also tested under trauma domain",
      },
    },
    {
      spine_concept_id: "spine_medicine_clinical_l4_osteoarthritis_management",
      section_id: "lens_section_abos_trauma",
      lens_specific: {
        order_in_section: 1,
        high_yield_in_lens: false,
        depth_in_lens: 4,
      },
    },
  ],
  metadata: {
    created_at: "2026-06-27T00:00:00Z",
    status: "active",
    source_url: "https://www.abos.org/",
  },
});

const concepts: LensSpineConcept[] = [
  {
    id: "spine_medicine_clinical_l4_fracture_healing",
    resolution_level: 4,
    content: {
      title: "Fracture Healing",
      definition: "Stages of bone repair.",
      summary: "Hematoma, soft callus, hard callus, remodeling.",
    },
    editorial: { high_yield_score: 6 },
  },
  {
    id: "spine_medicine_clinical_l4_osteoarthritis_management",
    resolution_level: 4,
    content: {
      title: "Osteoarthritis Management",
      definition: "Conservative and surgical options.",
      summary: "Activity modification, injections, arthroplasty.",
    },
    editorial: { high_yield_score: 7 },
  },
  {
    id: "spine_medicine_clinical_l4_unmapped",
    resolution_level: 4,
    content: {
      title: "Unmapped Concept",
      definition: "Not in lens.",
      summary: "—",
    },
  },
];

describe("curriculumLens", () => {
  it("builds a nested section tree from flat rows", () => {
    const tree = buildSectionTree(sampleLens.sections);
    expect(tree).toHaveLength(2);
    expect(tree[0].id).toBe("lens_section_abos_basic_science");
    expect(tree[1].children[0].id).toBe("lens_section_abos_trauma_bone_biology");
  });

  it("validates section and mapping integrity", () => {
    const issues = validateCurriculumLensStructure(sampleLens);
    expect(issues).toHaveLength(0);
  });

  it("applyLens filters by resolution range and sorts within sections", () => {
    const view = applyLens(concepts, sampleLens, { min: 3, max: 4 });
    const trauma = view.sections.find((s) => s.id === "lens_section_abos_trauma");
    expect(trauma?.concepts).toHaveLength(1);
    expect(trauma?.concepts[0].concept.id).toBe(
      "spine_medicine_clinical_l4_osteoarthritis_management"
    );
    expect(view.unmapped_concept_ids).toContain("spine_medicine_clinical_l4_unmapped");
  });

  it("getEffectiveHighYieldScore floors when lens marks high-yield", () => {
    const score = getEffectiveHighYieldScore(concepts[0], sampleLens, {
      sectionId: "lens_section_abos_trauma",
    });
    expect(score).toBeGreaterThanOrEqual(8);
  });

  it("getTitleInLens prefers lens-specific title", () => {
    const mapping = sampleLens.concept_mappings[0];
    expect(getTitleInLens(concepts[0], mapping)).toBe("Fracture Healing (Basic Science)");
  });

  it("getDepthInLens returns mapping depth when lens active", () => {
    expect(getDepthInLens(concepts[0], sampleLens)).toBe(4);
    expect(getDepthInLens(concepts[0], null)).toBe(4);
  });
});
