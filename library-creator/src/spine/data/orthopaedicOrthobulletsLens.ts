import type { CurriculumLens } from "../../types/curriculumLens.js";
import { ABOS_LENS_HIGH_YIELD_IDS, orderedTopicIds } from "./abosLensConfig.js";
import { ORTHOPAEDIC_HUB_SPECS } from "./orthopaedicHubs.js";
import { ORTHOPAEDIC_L3_SPECS } from "./orthopaedicSurgeryL3Data.js";
import { CLUSTER_TO_HUB } from "./orthopaedicHubs.js";
import { EXISTING_NODE_REFERENCES, buildFlatAbosLensForValidation } from "./orthopaedicSurgeryMeta.js";

/** Secondary lens placements — same spine concept, different section (cross-links). */
export const LENS_CROSS_LINKS: Array<{
  spine_concept_id: string;
  abos_section_id: string;
  orthobullets_section_id: string;
  title_in_lens: string;
  high_yield_in_lens: boolean;
  depth_in_lens: 1 | 2 | 3 | 4 | 5;
  notes: string;
}> = [
  {
    spine_concept_id: "spine_medicine_clinical_l3_compartment_syndrome_and_fasciotomy",
    abos_section_id: "abos_p2_adult_trauma",
    orthobullets_section_id: "lens_section_ob_trauma",
    title_in_lens: "Compartment Syndrome and Fasciotomy",
    high_yield_in_lens: true,
    depth_in_lens: 5,
    notes:
      "cross_link_from=orthopaedic_trauma_hub; primary_anchor=orthopaedic_basic_science; primary_section=abos_p1_basic_science_principles",
  },
  {
    spine_concept_id: "spine_medicine_clinical_l3_stress_fractures_and_insufficiency_fractures",
    abos_section_id: "abos_p2_foot_ankle",
    orthobullets_section_id: "lens_section_ob_foot_and_ankle",
    title_in_lens: "Stress Fractures — High-Risk Foot and Ankle Sites",
    high_yield_in_lens: false,
    depth_in_lens: 4,
    notes:
      "cross_link_from=orthopaedic_trauma_hub; primary_section=abos_p2_adult_trauma; shared=navicular_metatarsal_fifth",
  },
  {
    spine_concept_id: "spine_medicine_clinical_l3_stress_fractures_and_insufficiency_fractures",
    abos_section_id: "abos_p1_metabolic_bone",
    orthobullets_section_id: "lens_section_ob_basic_science",
    title_in_lens: "Insufficiency Fractures and Osteoporosis",
    high_yield_in_lens: false,
    depth_in_lens: 5,
    notes:
      "cross_link_from=orthopaedic_trauma_hub; primary_section=abos_p2_adult_trauma; existing_ref=spine_medicine_clinical_l3_osteoporosis_management",
  },
];

function obSectionId(hubShortName: string) {
  const slug = hubShortName.replace(/^orthopaedic_/, "");
  return `lens_section_ob_${slug}`;
}

function abosToObSection(abosSection: string): string {
  const map: Record<string, string> = {
    abos_p1_basic_science_principles: "lens_section_ob_basic_science",
    abos_p1_anatomy_approaches: "lens_section_ob_basic_science",
    abos_p1_biostatistics: "lens_section_ob_basic_science",
    abos_p1_perioperative: "lens_section_ob_basic_science",
    abos_p2_adult_trauma: "lens_section_ob_trauma",
    abos_p2_multiple_trauma: "lens_section_ob_trauma",
    abos_p2_trauma_upper_extremity: "lens_section_ob_trauma",
    abos_p2_trauma_lower_extremity: "lens_section_ob_trauma",
    abos_p2_adult_reconstruction: "lens_section_ob_adult_reconstruction",
    abos_p2_adult_spine: "lens_section_ob_spine",
    abos_p2_sports_medicine: "lens_section_ob_sports_medicine",
    abos_p2_shoulder_elbow: "lens_section_ob_shoulder_and_elbow",
    abos_p2_hand_wrist: "lens_section_ob_hand_and_wrist",
    abos_p2_foot_ankle: "lens_section_ob_foot_and_ankle",
    abos_p2_pediatrics: "lens_section_ob_pediatrics",
    abos_p2_oncology: "lens_section_ob_oncology",
    abos_p2_neuromuscular: "lens_section_ob_neuromuscular_rehabilitation",
  };
  return map[abosSection] ?? "lens_section_ob_basic_science";
}

export function buildOrthobulletsLens(): CurriculumLens {
  const specById = new Map(
    ORTHOPAEDIC_L3_SPECS.map((s) => [`spine_medicine_clinical_l3_${s.shortName}`, s])
  );
  const sectionOrderCounters = new Map<string, number>();

  const sections: CurriculumLens["sections"] = ORTHOPAEDIC_HUB_SPECS.map((hub, i) => ({
    id: obSectionId(hub.shortName),
    title: hub.title,
    parent_section_id: null,
    order: i,
  }));

  const concept_mappings: CurriculumLens["concept_mappings"] = [];

  for (const spineId of orderedTopicIds()) {
    const spec = specById.get(spineId);
    if (!spec) continue;
    const hubKey = spec.hub ?? CLUSTER_TO_HUB[spec.cluster] ?? "orthopaedic_basic_science";
    const sectionId = obSectionId(hubKey);
    const orderInSection = sectionOrderCounters.get(sectionId) ?? 0;
    sectionOrderCounters.set(sectionId, orderInSection + 1);

    concept_mappings.push({
      spine_concept_id: spineId,
      section_id: sectionId,
      lens_specific: {
        title_in_lens: spec.title,
        order_in_section: orderInSection,
        high_yield_in_lens: ABOS_LENS_HIGH_YIELD_IDS.has(spineId),
        depth_in_lens: (spec.depth ?? 4) as 1 | 2 | 3 | 4 | 5,
        notes: `hub=${hubKey}; orthobullets_topic_nav`,
      },
    });
  }

  for (const ref of EXISTING_NODE_REFERENCES) {
    if (ref.orthopaedic_context.include_in_orthobullets_lens === false) continue;
    const sectionId = abosToObSection(ref.orthopaedic_context.abos_section);
    const orderInSection = sectionOrderCounters.get(sectionId) ?? 0;
    sectionOrderCounters.set(sectionId, orderInSection + 1);
    concept_mappings.push({
      spine_concept_id: ref.existing_spine_id,
      section_id: sectionId,
      lens_specific: {
        title_in_lens: ref.existing_spine_id
          .replace(/^spine_[^_]+_(l2|l3)_/, "")
          .replace(/_/g, " "),
        order_in_section: orderInSection,
        high_yield_in_lens: ref.orthopaedic_context.high_yield_in_lens,
        depth_in_lens: ref.orthopaedic_context.depth_in_lens as 1 | 2 | 3 | 4 | 5,
        notes: ref.orthopaedic_context.l4_ortho_context_pending
          ? "existing_spine_node; l4_ortho_context_pending"
          : "existing_spine_node",
      },
    });
  }

  for (const link of LENS_CROSS_LINKS) {
    const orderInSection = sectionOrderCounters.get(link.orthobullets_section_id) ?? 0;
    sectionOrderCounters.set(link.orthobullets_section_id, orderInSection + 1);
    concept_mappings.push({
      spine_concept_id: link.spine_concept_id,
      section_id: link.orthobullets_section_id,
      lens_specific: {
        title_in_lens: link.title_in_lens,
        order_in_section: orderInSection,
        high_yield_in_lens: link.high_yield_in_lens,
        depth_in_lens: link.depth_in_lens,
        notes: link.notes,
      },
    });
  }

  return {
    id: "lens_orthobullets_orthopaedic_2026",
    name: "Orthobullets Orthopaedic Topic Taxonomy",
    source: "Orthobullets",
    domain_id: "medicine_clinical",
    version: "2026-draft",
    description:
      "Case-oriented topic clusters mirroring subspecialty hub hierarchy (G58). Same spine concept IDs as ABOS lens with Orthobullets-style section navigation.",
    intended_audience: "Orthopaedic surgery residents using topic-based study workflows",
    sections,
    concept_mappings,
    metadata: {
      created_at: "2026-06-27T00:00:00Z",
      status: "active",
    },
  };
}

export function buildFlatAbosOrthopaedicLens(): CurriculumLens {
  return buildFlatAbosLensForValidation(orderedTopicIds());
}
