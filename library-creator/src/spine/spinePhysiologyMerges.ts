/**
 * C1–C5 physiology merges: med preclinical owns human physiology; biology supplies contexts.
 */
import type { SpineConcept } from "./spineSchema.js";
import { l2Id, l3Id } from "./spineDomains.js";

const TS = "2025-01-01T00:00:00Z";

function emptyLinks() {
  return { by_library: {} };
}

export const SPINE_PHYSIOLOGY_MERGES: SpineConcept[] = [
  // C4: Homeostasis universal L3 — endocrine axes deferred to L4
  {
    id: "spine_biology_l3_homeostasis_and_feedback",
    resolution_level: 3,
    content: {
      title: "Homeostasis and Feedback Control",
      definition:
        "Maintenance of stable internal conditions through negative and positive feedback loops integrating sensors, control centers, and effectors across organ systems.",
      summary:
        "Homeostasis is the organizing principle of physiology. Specific endocrine axes and glucose regulation extend this concept at L4 in clinical domains.",
    },
    knowledge_graph: {
      knowledge_area: "Life Sciences",
      knowledge_cluster: "Physiological Regulation",
      primary_domain: "biology",
      _shared_concept_note:
        "Universal L3. Specific endocrine feedback axes and glucose homeostasis are L4 extensions (removed as separate L3 nodes).",
      _placement_note:
        "endocrine_feedback_axes and glucose_homeostasis_insulin_glucagon anchor as L4 children under this node.",
    },
    dependency_graph: {
      parent_concept_id: l2Id("biology", "Organismal Physiology"),
      prerequisites: [l2Id("biology", "Organismal Physiology")],
      unlocks: [
        l3Id("biology", "thermoregulation"),
        "spine_medicine_preclinical_l3_cardiac_physiology",
        "spine_medicine_preclinical_l3_renal_filtration_and_gfr",
      ],
    },
    domain_contexts: [
      {
        domain_id: "biology",
        framing: {
          title_in_context: "Homeostasis and Feedback",
          relevance: "Fundamental principle across all organisms — not human-specific.",
          applications: ["Negative feedback", "Positive feedback loops"],
          max_resolution_in_context: 3,
        },
        hierarchy_location: {
          category: "Organismal Physiology",
          subcategory: "Physiological Regulation",
          topic: "Homeostasis",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l2Id("biology", "Organismal Physiology")],
          unlocks_in_context: [l3Id("biology", "thermoregulation")],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Homeostatic Regulation in Humans",
          relevance: "Clinical reasoning framework for acid-base, volume, glucose, and temperature disorders.",
          applications: ["Set-point disruption in disease", "Compensatory mechanisms"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Physiology",
          subcategory: "Integrative Physiology",
          topic: "Homeostasis",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l2Id("medicine_preclinical", "Physiology")],
          unlocks_in_context: [
            "spine_medicine_preclinical_l3_cardiac_physiology",
            l3Id("medicine_preclinical", "acid_base_balance_renal"),
          ],
        },
        linked_content: emptyLinks(),
      },
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        { source: "OpenStax Biology 2e", chapter: "33", section: "33.1" },
        { source: "OpenStax Anatomy and Physiology 2e", chapter: "1", section: "1.5" },
      ],
    },
  },

  // C1: Cardiac physiology — med primary, thin biology context
  {
    id: "spine_medicine_preclinical_l3_cardiac_physiology",
    resolution_level: 3,
    content: {
      title: "Cardiac Physiology",
      definition:
        "Integrated function of the heart as a pump: rhythmic contraction, conduction, preload/afterload, and cardiac output regulation in the human circulation.",
      summary:
        "Cardiac physiology links electrophysiology to hemodynamics. Starling law and autonomic tone determine output in health and heart failure.",
    },
    knowledge_graph: {
      knowledge_area: "Clinical Sciences",
      knowledge_cluster: "Cardiovascular Physiology",
      primary_domain: "medicine_preclinical",
      _shared_concept_note:
        "Human cardiac physiology owned by medicine_preclinical. Biology carries only general circulatory principles as context.",
    },
    dependency_graph: {
      parent_concept_id: l2Id("medicine_preclinical", "Physiology"),
      prerequisites: ["spine_biology_l3_homeostasis_and_feedback"],
      unlocks: [
        "spine_medicine_preclinical_l3_cardiac_membrane_potential",
        l3Id("medicine_preclinical", "cardiac_output_and_starling_law"),
      ],
    },
    domain_contexts: [
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Cardiac Physiology",
          relevance: "Step 1 cardiovascular foundation — ECG, murmurs, heart failure.",
          applications: ["Cardiac output", "Frank-Starling mechanism"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Physiology",
          subcategory: "Cardiovascular Physiology",
          topic: "Cardiac Physiology",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_homeostasis_and_feedback"],
          unlocks_in_context: [
            "spine_medicine_preclinical_l3_cardiac_membrane_potential",
            l3Id("medicine_preclinical", "cardiac_output_and_starling_law"),
          ],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "biology",
        framing: {
          title_in_context: "Circulatory Pump Principles",
          relevance: "General vertebrate circulatory design — thin context only.",
          applications: ["Chambered heart", "Pressure-flow relationships"],
          max_resolution_in_context: 2,
        },
        hierarchy_location: {
          category: "Organismal Physiology",
          subcategory: "Circulatory Physiology",
          topic: "Cardiac Function (General)",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_homeostasis_and_feedback"],
          unlocks_in_context: [],
        },
        linked_content: emptyLinks(),
      },
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        { source: "OpenStax Anatomy and Physiology 2e", chapter: "19", section: "19.1" },
        { source: "OpenStax Biology 2e", chapter: "38", section: "38.2" },
      ],
    },
  },

  // C2: Renal filtration — med primary, biology excretory context
  {
    id: "spine_medicine_preclinical_l3_renal_filtration_and_gfr",
    resolution_level: 3,
    content: {
      title: "Renal Filtration and GFR",
      definition:
        "Glomerular ultrafiltration driven by Starling forces, with tubular reabsorption and secretion adjusting urine composition to maintain fluid and electrolyte homeostasis.",
      summary:
        "GFR is the clinical index of kidney function. Nephron segment physiology explains diuretic mechanisms and AKI/CKD staging.",
    },
    knowledge_graph: {
      knowledge_area: "Clinical Sciences",
      knowledge_cluster: "Renal Physiology",
      primary_domain: "medicine_preclinical",
      _shared_concept_note:
        "Merged kidney_filtration_and_reabsorption (biology) with renal_filtration_and_gfr (medicine_preclinical).",
    },
    dependency_graph: {
      parent_concept_id: l2Id("medicine_preclinical", "Physiology"),
      prerequisites: ["spine_biology_l3_homeostasis_and_feedback"],
      unlocks: [
        l3Id("medicine_preclinical", "tubular_reabsorption_and_secretion"),
        l3Id("medicine_preclinical", "acid_base_balance_renal"),
      ],
    },
    domain_contexts: [
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Renal Filtration and GFR",
          relevance: "Core nephron physiology for Step 1 and clinical medicine.",
          applications: ["GFR estimation", "Diuretic sites of action"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Physiology",
          subcategory: "Renal Physiology",
          topic: "Glomerular Filtration",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_homeostasis_and_feedback"],
          unlocks_in_context: [
            l3Id("medicine_preclinical", "tubular_reabsorption_and_secretion"),
          ],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "biology",
        framing: {
          title_in_context: "Excretory System Principles",
          relevance: "General osmoregulation and nitrogenous waste elimination across taxa.",
          applications: ["Nephridial systems", "Osmoregulation"],
          max_resolution_in_context: 2,
        },
        hierarchy_location: {
          category: "Organismal Physiology",
          subcategory: "Excretory Physiology",
          topic: "Filtration and Reabsorption (General)",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_homeostasis_and_feedback"],
          unlocks_in_context: [],
        },
        linked_content: emptyLinks(),
      },
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        { source: "OpenStax Anatomy and Physiology 2e", chapter: "25", section: "25.3" },
        { source: "OpenStax Biology 2e", chapter: "37", section: "37.3" },
      ],
    },
  },

  // C3: Muscle contraction — single universal node, med primary
  {
    id: "spine_medicine_preclinical_l3_muscle_contraction",
    resolution_level: 3,
    content: {
      title: "Muscle Contraction",
      definition:
        "Sliding-filament mechanism in which actin–myosin cross-bridge cycling, calcium-dependent thin-filament regulation, and ATP hydrolysis shorten sarcomeres in skeletal muscle.",
      summary:
        "Excitation–contraction coupling links membrane depolarization to calcium release. Fiber type and motor unit recruitment grade force output.",
    },
    knowledge_graph: {
      knowledge_area: "Clinical Sciences",
      knowledge_cluster: "Musculoskeletal Physiology",
      primary_domain: "medicine_preclinical",
      _shared_concept_note:
        "Merged muscle_contraction (biology) and skeletal_muscle_contraction (medicine_preclinical).",
    },
    dependency_graph: {
      parent_concept_id: l2Id("medicine_preclinical", "Physiology"),
      prerequisites: ["spine_biology_l3_action_potential"],
      unlocks: [],
    },
    domain_contexts: [
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Skeletal Muscle Contraction",
          relevance: "Human musculoskeletal and neuromuscular pharmacology foundation.",
          applications: ["Rigor mortis", "Neuromuscular blockade"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Physiology",
          subcategory: "Musculoskeletal Physiology",
          topic: "Muscle Contraction",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_action_potential"],
          unlocks_in_context: [],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "biology",
        framing: {
          title_in_context: "Muscle Contraction Mechanism",
          relevance: "Conserved sliding-filament mechanism across animals.",
          applications: ["Sarcomere structure", "Motor proteins"],
          max_resolution_in_context: 3,
        },
        hierarchy_location: {
          category: "Organismal Physiology",
          subcategory: "Musculoskeletal Physiology",
          topic: "Muscle Contraction",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_action_potential"],
          unlocks_in_context: [],
        },
        linked_content: emptyLinks(),
      },
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        { source: "OpenStax Anatomy and Physiology 2e", chapter: "10", section: "10.3" },
        { source: "OpenStax Biology 2e", chapter: "36", section: "36.4" },
      ],
    },
  },

  // C5: Respiratory gas exchange — med primary
  {
    id: "spine_medicine_preclinical_l3_gas_exchange_and_ventilation_perfusion",
    resolution_level: 3,
    content: {
      title: "Gas Exchange and Ventilation-Perfusion Matching",
      definition:
        "Oxygen and carbon dioxide diffusion across the alveolar-capillary membrane with regional ventilation–perfusion ratios determining arterial blood gas composition.",
      summary:
        "V/Q mismatch is the dominant mechanism of hypoxemia. Dead space and shunt physiology explain the A–a gradient in pulmonary disease.",
    },
    knowledge_graph: {
      knowledge_area: "Clinical Sciences",
      knowledge_cluster: "Respiratory Physiology",
      primary_domain: "medicine_preclinical",
      _shared_concept_note:
        "Merged respiratory_gas_exchange (biology) with gas_exchange_and_ventilation_perfusion (medicine_preclinical).",
    },
    dependency_graph: {
      parent_concept_id: l2Id("medicine_preclinical", "Physiology"),
      prerequisites: [
        "spine_biology_l3_homeostasis_and_feedback",
        l3Id("medicine_preclinical", "respiratory_mechanics_and_compliance"),
      ],
      unlocks: [l3Id("medicine_preclinical", "oxygen_hemoglobin_dissociation")],
    },
    domain_contexts: [
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Gas Exchange and V/Q Matching",
          relevance: "Pulmonary pathophysiology and ABG interpretation.",
          applications: ["Hypoxemia mechanisms", "Shunt vs dead space"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Physiology",
          subcategory: "Respiratory Physiology",
          topic: "Gas Exchange",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [
            l3Id("medicine_preclinical", "respiratory_mechanics_and_compliance"),
          ],
          unlocks_in_context: [l3Id("medicine_preclinical", "oxygen_hemoglobin_dissociation")],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "biology",
        framing: {
          title_in_context: "Respiratory Gas Exchange",
          relevance: "General principles of diffusion across respiratory surfaces.",
          applications: ["Gill vs lung exchange", "Partial pressure gradients"],
          max_resolution_in_context: 2,
        },
        hierarchy_location: {
          category: "Organismal Physiology",
          subcategory: "Respiratory Physiology",
          topic: "Gas Exchange (General)",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_homeostasis_and_feedback"],
          unlocks_in_context: [],
        },
        linked_content: emptyLinks(),
      },
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        { source: "OpenStax Anatomy and Physiology 2e", chapter: "22", section: "22.4" },
        { source: "OpenStax Biology 2e", chapter: "39", section: "39.2" },
      ],
    },
  },

  // C5: Nutrient absorption — med primary
  {
    id: "spine_medicine_preclinical_l3_nutrient_absorption_physiology",
    resolution_level: 3,
    content: {
      title: "Nutrient Absorption Physiology",
      definition:
        "Enzymatic digestion of carbohydrates, proteins, and lipids with absorption of monomers and micronutrients across the gastrointestinal epithelium into portal blood and lymph.",
      summary:
        "Transporter-mediated uptake and bile-dependent fat absorption underpin malabsorption syndromes. Lactase deficiency illustrates osmotic diarrhea.",
    },
    knowledge_graph: {
      knowledge_area: "Clinical Sciences",
      knowledge_cluster: "GI Physiology",
      primary_domain: "medicine_preclinical",
      _shared_concept_note:
        "Merged digestive_absorption (biology) with nutrient_absorption_physiology (medicine_preclinical).",
    },
    dependency_graph: {
      parent_concept_id: l2Id("medicine_preclinical", "Physiology"),
      prerequisites: ["spine_biology_l3_homeostasis_and_feedback"],
      unlocks: [],
    },
    domain_contexts: [
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Nutrient Absorption",
          relevance: "GI pathophysiology and malabsorption workups.",
          applications: ["Celiac disease", "Fat-soluble vitamin deficiency"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Physiology",
          subcategory: "GI Physiology",
          topic: "Nutrient Absorption",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_homeostasis_and_feedback"],
          unlocks_in_context: [],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "biology",
        framing: {
          title_in_context: "Digestive Absorption",
          relevance: "General nutrient uptake across animal digestive systems.",
          applications: ["Surface area adaptation", "Specialized epithelia"],
          max_resolution_in_context: 2,
        },
        hierarchy_location: {
          category: "Organismal Physiology",
          subcategory: "Digestive Physiology",
          topic: "Absorption (General)",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_homeostasis_and_feedback"],
          unlocks_in_context: [],
        },
        linked_content: emptyLinks(),
      },
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        { source: "OpenStax Anatomy and Physiology 2e", chapter: "23", section: "23.4" },
        { source: "OpenStax Biology 2e", chapter: "40", section: "40.3" },
      ],
    },
  },
];

export const PHYSIOLOGY_SUPERSEDED_IDS = new Set([
  "spine_biology_l3_cardiac_physiology",
  "spine_biology_l3_kidney_filtration_and_reabsorption",
  "spine_biology_l3_respiratory_gas_exchange",
  "spine_biology_l3_digestive_absorption",
  "spine_biology_l3_muscle_contraction",
  "spine_biology_l3_endocrine_signaling",
  "spine_biology_l3_homeostasis_and_feedback",
  "spine_medicine_preclinical_l3_endocrine_feedback_axes",
  "spine_medicine_preclinical_l3_glucose_homeostasis_insulin_glucagon",
  "spine_medicine_preclinical_l3_skeletal_muscle_contraction",
]);
