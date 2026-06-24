import type { SpineConcept } from "./spineSchema.js";
import { l2Id, l3Id } from "./spineDomains.js";

const TS = "2025-01-01T00:00:00Z";

function emptyLinks() {
  return { by_library: {} };
}

/** Cross-domain universal concepts — one node, multiple domain_contexts. */
export const SPINE_SHARED_CONCEPTS: SpineConcept[] = [
  {
    id: "spine_mathematics_l3_exponential_decay",
    resolution_level: 3,
    content: {
      title: "Exponential Decay",
      definition:
        "A process in which a quantity decreases at a rate proportional to its current value, often modeled by N(t) = N₀e^(−λt) where λ is a positive rate constant.",
      summary:
        "Exponential decay unifies half-life, first-order elimination, and cooling curves. The same proportional-loss mathematics appears across quantitative, physical, chemical, biological, and medical contexts.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Change & Rate",
      primary_domain: "mathematics",
      _shared_concept_note:
        "Also used in chemistry (first-order kinetics), biology (population decline), medicine_preclinical (drug elimination), physics (radioactive decay).",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Pre-Calculus & Functions"),
      prerequisites: ["spine_mathematics_l3_exponential_functions"],
      unlocks: [
        "spine_chemistry_l3_integrated_rate_laws",
        "spine_medicine_preclinical_l3_drug_elimination_kinetics",
        l3Id("physics", "nuclear_decay_modes"),
        l3Id("chemistry", "nuclear_transmutation_reactions"),
      ],
    },
    domain_contexts: [
      {
        domain_id: "mathematics",
        framing: {
          title_in_context: "Exponential Decay",
          relevance: "Core example of differential-equation solutions and the natural exponential function.",
          applications: ["Cooling curves", "Population decline models", "Reverse compound growth"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Pre-Calculus & Functions",
          subcategory: "Function Families",
          topic: "Exponential & Logarithmic Functions",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_mathematics_l3_exponential_functions"],
          unlocks_in_context: ["spine_mathematics_l3_first_order_linear_equations"],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "chemistry",
        framing: {
          title_in_context: "First-Order Reaction Kinetics",
          relevance: "Describes radioactive decay and first-order reactions where rate depends on concentration of one reactant.",
          applications: ["Radioactive decay", "Half-life calculations", "Integrated rate laws"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Physical Chemistry",
          subcategory: "Chemical Kinetics",
          topic: "Reaction Orders",
          subtopic: "First-Order Kinetics",
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_chemistry_l3_reaction_rates"],
          unlocks_in_context: ["spine_chemistry_l3_integrated_rate_laws"],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Drug Clearance & Elimination Kinetics",
          relevance: "First-order elimination is the default pharmacokinetic model for most drugs.",
          applications: ["Drug half-life", "Steady-state concentration", "Dosing interval design"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Pharmacology",
          subcategory: "Pharmacokinetics",
          topic: "Drug Elimination",
          subtopic: "First-Order Kinetics",
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_medicine_preclinical_l3_volume_of_distribution"],
          unlocks_in_context: ["spine_medicine_preclinical_l3_steady_state_concentration"],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "physics",
        framing: {
          title_in_context: "Radioactive Decay Kinetics",
          relevance: "Nuclear disintegration follows first-order exponential kinetics with characteristic half-life.",
          applications: ["Radiometric dating", "Activity and decay constants", "Dosimetry"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Nuclear Physics",
          subcategory: "Radioactivity",
          topic: "Radioactive Decay",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l3Id("physics", "nuclear_structure_and_binding_energy")],
          unlocks_in_context: [l3Id("physics", "nuclear_decay_modes")],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "biology",
        framing: {
          title_in_context: "Population Decline and Turnover",
          relevance: "Exponential loss models population die-off and biomolecule degradation.",
          applications: ["Population crash", "Protein half-life"],
          max_resolution_in_context: 3,
        },
        hierarchy_location: {
          category: "Ecology & Evolution",
          subcategory: "Population Dynamics",
          topic: "Exponential Decline",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l3Id("biology", "population_dynamics")],
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
        { source: "OpenStax Calculus Volume 1", chapter: "6", section: "6.8" },
        { source: "OpenStax Chemistry 2e", chapter: "12", section: "12.4" },
        { source: "OpenStax University Physics Vol 3", chapter: "10", section: "10.3" },
        { source: "OpenStax Biology 2e", chapter: "45", section: "45.2" },
      ],
    },
  },
  {
    id: "spine_biology_l3_action_potential",
    resolution_level: 3,
    content: {
      title: "Action Potential",
      definition:
        "A rapid, transient reversal and restoration of membrane potential driven by sequential opening and closing of voltage-gated ion channels, propagating signals along excitable cells.",
      summary:
        "Action potentials are the fundamental unit of electrical signaling in neurons and muscle. The same biophysical mechanism is studied in biology, neuroscience, and clinical electrophysiology.",
    },
    knowledge_graph: {
      knowledge_area: "Life Sciences",
      knowledge_cluster: "Cell Signaling",
      primary_domain: "biology",
      _shared_concept_note:
        "Also used in psychology_neuroscience (neural signaling) and medicine_preclinical (cardiac/neural electrophysiology).",
    },
    dependency_graph: {
      parent_concept_id: l2Id("biology", "Cell Biology"),
      prerequisites: ["spine_biology_l3_membrane_potential", "spine_biology_l3_ion_channels"],
      unlocks: ["spine_biology_l3_synaptic_transmission"],
    },
    domain_contexts: [
      {
        domain_id: "biology",
        framing: {
          title_in_context: "Action Potential",
          relevance: "Explains how excitable cells generate and propagate electrical signals.",
          applications: ["Neuron signaling", "Muscle contraction initiation"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Cell Biology",
          subcategory: "Membrane Physiology",
          topic: "Electrical Signaling",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_membrane_potential"],
          unlocks_in_context: ["spine_biology_l3_synaptic_transmission"],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "psychology_neuroscience",
        framing: {
          title_in_context: "Neuronal Action Potential",
          relevance: "Foundation of information coding and transmission in the nervous system.",
          applications: ["Spike timing", "Neural encoding", "Axonal conduction"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Biological Psychology & Neuroscience",
          subcategory: "Cellular Neuroscience",
          topic: "Neuronal Excitability",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_membrane_potential"],
          unlocks_in_context: ["spine_biology_l3_synaptic_transmission"],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Cardiac & Neural Action Potentials",
          relevance: "Basis for ECG, arrhythmia mechanisms, and local anesthetic targets.",
          applications: ["ECG waveform", "Antiarrhythmic drug mechanisms", "Local anesthesia"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Physiology",
          subcategory: "Electrophysiology",
          topic: "Excitable Tissue",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [
            "spine_biology_l3_membrane_potential",
            "spine_medicine_preclinical_l3_cardiac_membrane_potential",
          ],
          unlocks_in_context: [
            "spine_medicine_clinical_l3_arrhythmia_mechanisms",
            "spine_medicine_preclinical_l3_muscle_contraction",
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
        { source: "OpenStax Biology 2e", chapter: "33", section: "33.2" },
        { source: "OpenStax Anatomy and Physiology 2e", chapter: "12", section: "12.4" },
      ],
    },
  },
];
