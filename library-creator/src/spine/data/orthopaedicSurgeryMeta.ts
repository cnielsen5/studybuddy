import type { CurriculumLens } from "../../types/curriculumLens.js";
import { ABOS_LENS_HIGH_YIELD_IDS, orderedTopicIds } from "./abosLensConfig.js";
import { ORTHOPAEDIC_HUB_SPECS } from "./orthopaedicHubs.js";
import { ORTHOPAEDIC_L3_SPECS } from "./orthopaedicSurgeryL3Data.js";
import { CLUSTER_TO_HUB } from "./orthopaedicHubs.js";
import { LENS_CROSS_LINKS } from "./orthopaedicOrthobulletsLens.js";

export interface ExistingNodeReference {
  existing_spine_id: string;
  orthopaedic_context: {
    relevance: string;
    applications: string[];
    abos_section: string;
    high_yield_in_lens: boolean;
    depth_in_lens: number;
    action_required: string;
    /** When true, L4/L5 orthopaedic domain_context and lens mappings are required on this node. */
    l4_ortho_context_pending?: boolean;
    include_in_abos_lens?: boolean;
    include_in_orthobullets_lens?: boolean;
  };
}

export const EXISTING_NODE_REFERENCES: ExistingNodeReference[] = [
  {
    existing_spine_id: "spine_medicine_clinical_l2_musculoskeletal_and_rheumatology",
    orthopaedic_context: {
      relevance:
        "Non-surgical musculoskeletal and rheumatology medicine sibling to orthopaedic surgery; shared conditions with distinct surgical subspecialty pathway.",
      applications: [
        "OA medical management before arthroplasty referral",
        "Inflammatory arthritis medical therapy",
        "Distinguish rheum vs ortho scope",
      ],
      abos_section: "abos_p2_adult_reconstruction",
      high_yield_in_lens: true,
      depth_in_lens: 3,
      action_required:
        "Add orthopaedic surgery sibling framing to MSK/Rheum L2 domain_context — clarifies boundary with spine_medicine_clinical_l2_orthopaedic_surgery.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_preclinical_l3_wound_healing_and_repair",
    orthopaedic_context: {
      relevance:
        "Wound healing biology underpins fracture healing, soft-tissue coverage, and surgical incision management in orthopaedics.",
      applications: ["Fracture healing phases", "Open fracture soft-tissue timing", "Incision healing after arthroplasty"],
      abos_section: "abos_p1_basic_science_principles",
      high_yield_in_lens: true,
      depth_in_lens: 4,
      action_required: "Add medicine_clinical orthopaedic domain context to this existing node in the spine consolidation pass.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_preclinical_l3_inflammation_acute_and_chronic",
    orthopaedic_context: {
      relevance:
        "Inflammatory cascades drive postoperative swelling, periprosthetic osteolysis, aseptic loosening, and synovitis in arthropathies. Osteolysis is a major arthroplasty failure mode.",
      applications: [
        "Periprosthetic osteolysis and wear debris",
        "Synovitis in inflammatory arthritis",
        "Postoperative inflammatory swelling",
        "Particle disease after joint replacement",
      ],
      abos_section: "abos_p1_basic_science_principles",
      high_yield_in_lens: true,
      depth_in_lens: 5,
      action_required:
        "Add medicine_clinical orthopaedic domain context with emphasis on osteolysis and arthroplasty — high depth in ABOS/Orthobullets lens.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_preclinical_l3_musculoskeletal_system_overview",
    orthopaedic_context: {
      relevance: "Foundational MSK anatomy and physiology prerequisite for all orthopaedic subspecialty nodes.",
      applications: ["Anatomic terminology", "Joint structure", "Muscle-tendon unit function"],
      abos_section: "abos_p1_anatomy_approaches",
      high_yield_in_lens: true,
      depth_in_lens: 3,
      action_required: "Add medicine_clinical orthopaedic domain context to this existing node in the spine consolidation pass.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_preclinical_l3_connective_tissue_matrix",
    orthopaedic_context: {
      relevance: "Collagen and matrix biology relate to ligament healing, tendon repair, and skeletal dysplasias.",
      applications: ["Ligament healing", "Tendon repair biology", "Connective tissue disorders"],
      abos_section: "abos_p1_basic_science_principles",
      high_yield_in_lens: false,
      depth_in_lens: 3,
      action_required: "Add medicine_clinical orthopaedic domain context to this existing node in the spine consolidation pass.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_preclinical_l3_screening_test_characteristics",
    orthopaedic_context: {
      relevance: "Sensitivity, specificity, and predictive values apply to orthopaedic screening tools and diagnostic tests.",
      applications: ["Diagnostic test interpretation", "Outcome study design", "Screening for DVT and infection"],
      abos_section: "abos_p1_biostatistics",
      high_yield_in_lens: true,
      depth_in_lens: 4,
      action_required: "Add medicine_clinical orthopaedic domain context to this existing node in the spine consolidation pass.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_preclinical_l3_study_designs_clinical_research",
    orthopaedic_context: {
      relevance: "RCTs and observational studies underpin orthopaedic evidence including fixation trials and arthroplasty registries.",
      applications: ["Evidence appraisal", "Registry interpretation", "Clinical trial design"],
      abos_section: "abos_p1_biostatistics",
      high_yield_in_lens: true,
      depth_in_lens: 4,
      action_required: "Add medicine_clinical orthopaedic domain context to this existing node in the spine consolidation pass.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_preclinical_l3_medical_ethics_principles",
    orthopaedic_context: {
      relevance: "Informed consent and disclosure apply to high-risk orthopaedic procedures including amputation and tumor surgery.",
      applications: ["Consent for arthroplasty", "Disclosure of nerve injury risk", "End-of-life and limb salvage decisions"],
      abos_section: "abos_p1_legal_ethical",
      high_yield_in_lens: false,
      depth_in_lens: 3,
      action_required: "Add medicine_clinical orthopaedic domain context (ref only — no separate ortho L3).",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: false,
    },
  },
  {
    existing_spine_id: "spine_biology_l3_action_potential",
    orthopaedic_context: {
      relevance: "Nerve conduction principles essential for peripheral nerve injury, compression syndromes, and EMG interpretation.",
      applications: ["Nerve injury classification", "Compression neuropathy pathophysiology", "Intraoperative nerve monitoring"],
      abos_section: "abos_p1_basic_science_principles",
      high_yield_in_lens: true,
      depth_in_lens: 3,
      action_required: "Add medicine_clinical orthopaedic domain context to this existing node in the spine consolidation pass.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_clinical_l3_osteoarthritis",
    orthopaedic_context: {
      relevance: "General OA management precedes surgical arthroplasty decisions in hip and knee reconstruction.",
      applications: ["Conservative OA care", "Injection therapy", "Referral for arthroplasty"],
      abos_section: "abos_p2_adult_reconstruction",
      high_yield_in_lens: true,
      depth_in_lens: 4,
      action_required: "Add orthopaedic surgery domain context emphasizing surgical candidacy and perioperative OA management.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_clinical_l3_osteoporosis_management",
    orthopaedic_context: {
      relevance:
        "Bone health optimization reduces fragility fracture and periprosthetic fracture risk. Primary home for metabolic bone disease in orthopaedic context (merged from metabolic_bone L3).",
      applications: [
        "Preoperative bone health",
        "Vertebral compression fractures",
        "Bisphosphonate timing before surgery",
        "Atypical femur fracture",
      ],
      abos_section: "abos_p1_metabolic_bone",
      high_yield_in_lens: true,
      depth_in_lens: 5,
      action_required:
        "Add orthopaedic surgery domain context emphasizing fracture prevention, fixation implications, and periprosthetic bone loss.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_clinical_l3_rheumatoid_arthritis",
    orthopaedic_context: {
      relevance: "Inflammatory arthritis drives upper extremity deformity, arthroplasty timing, and perioperative biologic management.",
      applications: ["Perioperative DMARD management", "Hand deformity surgery", "Cervical spine instability in RA"],
      abos_section: "abos_p2_adult_reconstruction",
      high_yield_in_lens: true,
      depth_in_lens: 4,
      action_required: "Add orthopaedic surgery domain context to this existing node in the spine consolidation pass.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_clinical_l3_back_pain_red_flags",
    orthopaedic_context: {
      relevance: "Red flags guide urgent spine imaging and referral for cauda equina, infection, and malignancy.",
      applications: ["Cauda equina screening", "Spine referral pathways", "Emergency MRI indications"],
      abos_section: "abos_p2_adult_spine",
      high_yield_in_lens: true,
      depth_in_lens: 4,
      action_required: "Add orthopaedic surgery domain context emphasizing surgical emergencies.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_clinical_l3_preoperative_assessment",
    orthopaedic_context: {
      relevance:
        "General preoperative assessment extended by orthopaedic-specific optimization (nutrition, smoking, inflammatory arthritis, prehabilitation).",
      applications: ["Cardiac risk stratification", "Frailty assessment", "Orthopaedic prehabilitation"],
      abos_section: "abos_p1_perioperative",
      high_yield_in_lens: true,
      depth_in_lens: 4,
      l4_ortho_context_pending: true,
      action_required:
        "Build L4/L5 orthopaedic domain_context children for arthroplasty and fracture preop protocols; map in ABOS and Orthobullets lenses.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_clinical_l3_anesthesia_basics",
    orthopaedic_context: {
      relevance: "Regional and general anesthesia choices affect orthopaedic ERAS pathways, multimodal analgesia, and pain control after TJA.",
      applications: ["Spinal anesthesia for arthroplasty", "Peripheral nerve blocks", "Multimodal opioid-sparing analgesia"],
      abos_section: "abos_p1_perioperative",
      high_yield_in_lens: true,
      depth_in_lens: 4,
      l4_ortho_context_pending: true,
      action_required:
        "Build L4/L5 orthopaedic multimodal pain and regional anesthesia context; include in ABOS and Orthobullets lenses.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_clinical_l3_wound_healing_surgical",
    orthopaedic_context: {
      relevance:
        "Surgical wound complications and SSI prevention bundles for arthroplasty, open fractures, and flap coverage.",
      applications: ["SSI prevention", "Antibiotic prophylaxis timing", "Wound dehiscence", "Negative pressure wound therapy"],
      abos_section: "abos_p1_perioperative",
      high_yield_in_lens: true,
      depth_in_lens: 5,
      l4_ortho_context_pending: true,
      action_required:
        "Build L4/L5 orthopaedic perioperative infection prevention context; map in ABOS and Orthobullets lenses.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_clinical_l3_deep_vein_thrombosis_pe",
    orthopaedic_context: {
      relevance: "VTE is a leading complication after hip/knee arthroplasty and hip fracture surgery with orthopaedic-specific prophylaxis protocols.",
      applications: ["Aspirin vs LMWH after TJA", "Prophylaxis duration", "Diagnosis after orthopaedic surgery"],
      abos_section: "abos_p1_perioperative",
      high_yield_in_lens: true,
      depth_in_lens: 5,
      l4_ortho_context_pending: true,
      action_required:
        "Build L4/L5 orthopaedic VTE prophylaxis context for arthroplasty and hip fracture; include in ABOS and Orthobullets lenses.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_clinical_l3_skin_soft_tissue_infections",
    orthopaedic_context: {
      relevance:
        "Cellulitis and necrotizing infection overlap with septic arthritis and osteomyelitis workup in orthopaedic practice.",
      applications: [
        "Septic arthritis vs gout vs cellulitis",
        "Necrotizing fasciitis urgency",
        "Hematogenous osteomyelitis",
        "Postoperative wound infection",
      ],
      abos_section: "abos_p2_hand_wrist",
      high_yield_in_lens: true,
      depth_in_lens: 4,
      action_required:
        "Add orthopaedic surgery domain context for septic arthritis and osteomyelitis differential and management.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_preclinical_l3_collagen_synthesis_and_disorders",
    orthopaedic_context: {
      relevance:
        "Bone matrix biology, collagen cross-linking, and metabolic bone disorders underpin fracture healing, implant osseointegration, and skeletal dysplasias.",
      applications: ["Bone quality in fixation", "Osteogenesis imperfecta", "Matrix mineralization"],
      abos_section: "abos_p1_basic_science_principles",
      high_yield_in_lens: false,
      depth_in_lens: 3,
      action_required:
        "Add medicine_clinical orthopaedic domain context for preclinical bone biology — complements fracture_healing L3.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_clinical_l3_gout_and_hyperuricemia",
    orthopaedic_context: {
      relevance: "Crystal arthropathy mimics septic joint and affects foot and hand surgical planning.",
      applications: ["Gout vs septic arthritis", "Tophaceous erosion", "Perioperative flare management"],
      abos_section: "abos_p2_foot_ankle",
      high_yield_in_lens: false,
      depth_in_lens: 3,
      action_required: "Add orthopaedic surgery domain context to this existing node in the spine consolidation pass.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
  {
    existing_spine_id: "spine_medicine_clinical_l3_peripheral_neuropathy",
    orthopaedic_context: {
      relevance: "Systemic neuropathy contributes to foot ulceration, Charcot, and fall risk in elderly orthopaedic patients.",
      applications: ["Diabetic neuropathy foot care", "Balance and fall prevention", "Differentiation from entrapment"],
      abos_section: "abos_p2_neuromuscular",
      high_yield_in_lens: false,
      depth_in_lens: 3,
      action_required: "Add orthopaedic surgery domain context to this existing node in the spine consolidation pass.",
      include_in_abos_lens: true,
      include_in_orthobullets_lens: true,
    },
  },
];

export function buildAbosLens(_conceptIds?: string[]) {
  const specById = new Map(
    ORTHOPAEDIC_L3_SPECS.map((s) => [`spine_medicine_clinical_l3_${s.shortName}`, s])
  );

  const orderedIds = orderedTopicIds();
  const sectionOrderCounters = new Map<string, number>();
  const hubOrder = new Map(ORTHOPAEDIC_HUB_SPECS.map((h, i) => [h.shortName, i]));

  const concept_mappings: Array<{
    spine_concept_id: string;
    section_id: string;
    hub_order: number;
    lens_specific: {
      title_in_lens: string;
      order_in_section: number;
      order_in_hub: number;
      high_yield_in_lens: boolean;
      depth_in_lens: number;
      notes: string;
    };
  }> = [];

  for (const spineId of orderedIds) {
    const spec = specById.get(spineId);
    if (!spec) continue;
    const sectionId = spec.abosSection ?? "abos_p1_basic_science_principles";
    const hubKey = spec.hub ?? CLUSTER_TO_HUB[spec.cluster] ?? "orthopaedic_basic_science";
    const orderInSection = sectionOrderCounters.get(sectionId) ?? 0;
    sectionOrderCounters.set(sectionId, orderInSection + 1);
    const orderInHub =
      concept_mappings.filter((m) => {
        const s = specById.get(m.spine_concept_id);
        return (s?.hub ?? CLUSTER_TO_HUB[s?.cluster ?? ""]) === hubKey;
      }).length;

    concept_mappings.push({
      spine_concept_id: spineId,
      section_id: sectionId,
      hub_order: hubOrder.get(hubKey) ?? 99,
      lens_specific: {
        title_in_lens: spec.title,
        order_in_section: orderInSection,
        order_in_hub: orderInHub,
        high_yield_in_lens: ABOS_LENS_HIGH_YIELD_IDS.has(spineId),
        depth_in_lens: spec.depth ?? 4,
        notes: `exam_part=Part I; hub=${hubKey}`,
      },
    });
  }

  for (const ref of EXISTING_NODE_REFERENCES) {
    if (ref.orthopaedic_context.include_in_abos_lens === false) continue;
    const sectionId = ref.orthopaedic_context.abos_section;
    const orderInSection = sectionOrderCounters.get(sectionId) ?? 0;
    sectionOrderCounters.set(sectionId, orderInSection + 1);
    concept_mappings.push({
      spine_concept_id: ref.existing_spine_id,
      section_id: sectionId,
      hub_order: 999,
      lens_specific: {
        title_in_lens: ref.existing_spine_id.replace(/^spine_[^_]+_(l2|l3)_/, "").replace(/_/g, " "),
        order_in_section: orderInSection,
        order_in_hub: 0,
        high_yield_in_lens: ref.orthopaedic_context.high_yield_in_lens,
        depth_in_lens: ref.orthopaedic_context.depth_in_lens,
        notes: ref.orthopaedic_context.l4_ortho_context_pending
          ? "existing_spine_node; l4_ortho_context_pending"
          : "existing_spine_node; anchor_to_existing_spine",
      },
    });
  }

  for (const link of LENS_CROSS_LINKS) {
    const sectionId = link.abos_section_id;
    const orderInSection = sectionOrderCounters.get(sectionId) ?? 0;
    sectionOrderCounters.set(sectionId, orderInSection + 1);
    concept_mappings.push({
      spine_concept_id: link.spine_concept_id,
      section_id: sectionId,
      hub_order: hubOrder.get("orthopaedic_trauma") ?? 1,
      lens_specific: {
        title_in_lens: link.title_in_lens,
        order_in_section: orderInSection,
        order_in_hub: orderInSection,
        high_yield_in_lens: link.high_yield_in_lens,
        depth_in_lens: link.depth_in_lens,
        notes: link.notes,
      },
    });
  }

  concept_mappings.sort((a, b) => {
    if (a.section_id !== b.section_id) return a.section_id.localeCompare(b.section_id);
    if (a.hub_order !== b.hub_order) return a.hub_order - b.hub_order;
    return a.lens_specific.order_in_hub - b.lens_specific.order_in_hub;
  });

  return {
    id: "lens_abos_orthopaedic_2025",
    name: "ABOS Orthopaedic Surgery Board Certification Blueprint 2025",
    source: "American Board of Orthopaedic Surgery",
    domain_id: "medicine_clinical",
    version: "2025",
    description:
      "Curriculum lens over the universal spine. High-yield flags exist only in this lens (G60). " +
      "Concept order follows subspecialty hub hierarchy then topic sequence (G59). " +
      "Orthobullets lens should mirror hub structure separately (G58).",
    intended_audience: "Orthopaedic surgery residents preparing for ABOS board certification",
    lens_architecture: {
      high_yield_source: "lens_only",
      ordering: "section > hub > topic (matches subspecialty nav)",
      orthobullets_lens_note:
        "Extract parallel Orthobullets curriculum lens tied to same spine concept IDs with Orthobullets section hierarchy.",
      exam_part: "Part I subspecialty sufficient for combined prep",
    },
    sections: [
      {
        id: "abos_part1_basic_science",
        title: "Part I — Basic Science and General Principles",
        parent_section_id: null,
        order: 1,
        weight_pct: 13,
        subsections: [
          { id: "abos_p1_biostatistics", title: "Biostatistics/Epidemiology", parent_section_id: "abos_part1_basic_science", order: 1, weight_pct: 1 },
          { id: "abos_p1_legal_ethical", title: "Legal/Ethical/Systems-Based Practice", parent_section_id: "abos_part1_basic_science", order: 2, weight_pct: 1 },
          { id: "abos_p1_basic_science_principles", title: "Basic Science Principles", parent_section_id: "abos_part1_basic_science", order: 3, weight_pct: 4 },
          { id: "abos_p1_anatomy_approaches", title: "Anatomy and Surgical Approaches", parent_section_id: "abos_part1_basic_science", order: 4, weight_pct: 4 },
          { id: "abos_p1_metabolic_bone", title: "Metabolic Bone Disease", parent_section_id: "abos_part1_basic_science", order: 5, weight_pct: 1 },
          { id: "abos_p1_perioperative", title: "Perioperative Management", parent_section_id: "abos_part1_basic_science", order: 6, weight_pct: 2 },
        ],
      },
      {
        id: "abos_part2_clinical",
        title: "Part I/II — Clinical Subspecialties",
        parent_section_id: null,
        order: 2,
        weight_pct: 87,
        subsections: [
          { id: "abos_p2_adult_spine", title: "Adult Spine", parent_section_id: "abos_part2_clinical", order: 1, weight_pct: 9 },
          { id: "abos_p2_shoulder_elbow", title: "Shoulder and Elbow", parent_section_id: "abos_part2_clinical", order: 2, weight_pct: 7.5 },
          { id: "abos_p2_hand_wrist", title: "Surgery of the Hand", parent_section_id: "abos_part2_clinical", order: 3, weight_pct: 10.5 },
          { id: "abos_p2_sports_medicine", title: "Orthopaedic Sports Medicine", parent_section_id: "abos_part2_clinical", order: 4, weight_pct: 9.5 },
          { id: "abos_p2_sports_medical", title: "Medical Aspects of Sports Medicine", parent_section_id: "abos_part2_clinical", order: 5, weight_pct: 1 },
          { id: "abos_p2_adult_reconstruction", title: "Adult Reconstruction", parent_section_id: "abos_part2_clinical", order: 6, weight_pct: 8 },
          { id: "abos_p2_foot_ankle", title: "Foot and Ankle", parent_section_id: "abos_part2_clinical", order: 7, weight_pct: 10 },
          { id: "abos_p2_adult_trauma", title: "Adult Trauma", parent_section_id: "abos_part2_clinical", order: 8, weight_pct: 13.5 },
          { id: "abos_p2_multiple_trauma", title: "Multiple Trauma", parent_section_id: "abos_part2_clinical", order: 9, weight_pct: 1.5 },
          { id: "abos_p2_trauma_upper_extremity", title: "Trauma — Upper Extremity", parent_section_id: "abos_part2_clinical", order: 10, weight_pct: 4.5 },
          { id: "abos_p2_trauma_lower_extremity", title: "Trauma — Lower Extremity", parent_section_id: "abos_part2_clinical", order: 11, weight_pct: 7.5 },
          { id: "abos_p2_pediatrics", title: "Pediatrics", parent_section_id: "abos_part2_clinical", order: 12, weight_pct: 12 },
          { id: "abos_p2_oncology", title: "Orthopaedic Oncology", parent_section_id: "abos_part2_clinical", order: 13, weight_pct: 7 },
          { id: "abos_p2_neuromuscular", title: "Neuromuscular and Rehabilitation", parent_section_id: "abos_part2_clinical", order: 14, weight_pct: 1 },
        ],
      },
    ],
    concept_mappings,
    metadata: {
      created_at: "2026-06-27T00:00:00Z",
      status: "draft",
      source_url: "https://www.abos.org/wp-content/uploads/2025/03/ABOS_blueprint_part-I_2025_Subspecialty.pdf",
    },
  } satisfies Record<string, unknown> & { concept_mappings: unknown[] };
}

export function buildFlatAbosLensForValidation(conceptIds: string[]): CurriculumLens {
  const draft = buildAbosLens(conceptIds);
  const flatSections = [
    ...draft.sections.flatMap((s) => {
      const parent = {
        id: s.id.replace("abos_", "lens_section_abos_"),
        title: s.title,
        parent_section_id: null as string | null,
        order: s.order,
        weight: s.weight_pct,
      };
      const subs = (s.subsections ?? []).map((sub, i) => ({
        id: sub.id.replace("abos_", "lens_section_abos_"),
        title: sub.title,
        parent_section_id: parent.id,
        order: i,
        weight: sub.weight_pct,
      }));
      return [parent, ...subs];
    }),
  ];

  const sectionIdMap = new Map<string, string>();
  for (const spec of ORTHOPAEDIC_L3_SPECS) {
    sectionIdMap.set(spec.abosSection, spec.abosSection.replace("abos_", "lens_section_abos_"));
  }

  return {
    id: "lens_abos_orthopaedic_2025",
    name: draft.name,
    source: draft.source,
    domain_id: "medicine_clinical",
    version: "2025",
    description: draft.description,
    intended_audience: draft.intended_audience,
    sections: flatSections,
    concept_mappings: draft.concept_mappings.map((m, i) => ({
      spine_concept_id: m.spine_concept_id,
      section_id: sectionIdMap.get(m.section_id) ?? m.section_id.replace("abos_", "lens_section_abos_"),
      lens_specific: {
        title_in_lens: m.lens_specific.title_in_lens,
        order_in_section: i,
        high_yield_in_lens: m.lens_specific.high_yield_in_lens,
        depth_in_lens: m.lens_specific.depth_in_lens as 1 | 2 | 3 | 4 | 5,
        notes: m.lens_specific.notes,
      },
    })),
    metadata: {
      created_at: "2026-06-27T00:00:00Z",
      status: "archived",
      source_url: draft.metadata.source_url,
    },
  };
}
