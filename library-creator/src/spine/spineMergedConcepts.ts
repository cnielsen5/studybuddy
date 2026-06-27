/**
 * A3 aggressive merge — shared universal nodes (dependency order).
 * Duplicates removed from domain L3 data files; references point here.
 */
import type { SpineConcept } from "./spineSchema.js";
import { l2Id, l3Id } from "./spineDomains.js";

const TS = "2025-01-01T00:00:00Z";

function emptyLinks() {
  return { by_library: {} };
}

export const SPINE_MERGED_CONCEPTS: SpineConcept[] = [
  // ── 1. Membrane potential (prerequisite for action potential) ──────────────
  {
    id: "spine_biology_l3_membrane_potential",
    resolution_level: 3,
    content: {
      title: "Membrane Potential",
      definition:
        "Voltage difference across a membrane arising from unequal ion distributions and selective permeability, establishing the electrochemical baseline for excitability and transport.",
      summary:
        "Resting membrane potential stores energy for signaling in neurons, muscle, and cardiac tissue. Ion pumps and channel permeability set the equilibrium contributions of each ion species.",
    },
    knowledge_graph: {
      knowledge_area: "Life Sciences",
      knowledge_cluster: "Electrical Signaling",
      primary_domain: "biology",
      _shared_concept_note:
        "Merged resting_membrane_potential (psych), cell_membrane_resting_potential (medicine_preclinical neuronal), and general excitable-tissue potential. Cardiac membrane potential remains a separate med node (B2).",
    },
    dependency_graph: {
      parent_concept_id: l2Id("biology", "Cell Biology"),
      prerequisites: [l3Id("biology", "membrane_transport_active")],
      unlocks: [
        l3Id("biology", "ion_channels"),
        "spine_biology_l3_action_potential",
        "spine_medicine_preclinical_l3_cardiac_membrane_potential",
      ],
    },
    domain_contexts: [
      {
        domain_id: "biology",
        framing: {
          title_in_context: "Membrane Potential",
          relevance: "Foundation for excitable cell signaling in animals.",
          applications: ["Neuron resting state", "Muscle excitability"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Cell Biology",
          subcategory: "Electrical Signaling",
          topic: "Membrane Potential",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l3Id("biology", "membrane_transport_active")],
          unlocks_in_context: [
            l3Id("biology", "ion_channels"),
            "spine_biology_l3_action_potential",
            "spine_medicine_preclinical_l3_cardiac_membrane_potential",
          ],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "psychology_neuroscience",
        framing: {
          title_in_context: "Resting Membrane Potential",
          relevance: "Baseline voltage before synaptic input in neurons.",
          applications: ["Neural excitability threshold", "Ion gradient maintenance"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Biological Psychology & Neuroscience",
          subcategory: "Cellular Neuroscience",
          topic: "Resting Membrane Potential",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [
            l3Id("psychology_neuroscience", "nervous_system_organization"),
          ],
          unlocks_in_context: ["spine_biology_l3_action_potential"],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Neuronal Membrane Potential",
          relevance: "Resting potential and threshold in neurons and skeletal muscle — basis for electrophysiology and pharmacology.",
          applications: ["Local anesthetic targets", "Neuromuscular junction baseline"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Physiology",
          subcategory: "Electrophysiology",
          topic: "Membrane Potential",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l2Id("medicine_preclinical", "Physiology")],
          unlocks_in_context: [
            "spine_biology_l3_action_potential",
            "spine_medicine_preclinical_l3_cardiac_membrane_potential",
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
        { source: "OpenStax Anatomy and Physiology 2e", chapter: "12", section: "12.2" },
      ],
    },
  },

  // ── 2. Synaptic transmission (after action potential) ────────────────────────
  {
    id: "spine_biology_l3_synaptic_transmission",
    resolution_level: 3,
    content: {
      title: "Synaptic Transmission",
      definition:
        "Chemical communication at synapses where presynaptic neurotransmitter release activates postsynaptic receptors, producing graded potentials integrated by target cells.",
      summary:
        "Synapses convert presynaptic electrical activity into chemical signals. Structure, release probability, and receptor density determine synaptic strength and plasticity.",
    },
    knowledge_graph: {
      knowledge_area: "Life Sciences",
      knowledge_cluster: "Neural Signaling",
      primary_domain: "biology",
      _shared_concept_note:
        "Merged synapse_structure (biology), synaptic_transmission (psych), synaptic_transmission_physiology (medicine_preclinical).",
    },
    dependency_graph: {
      parent_concept_id: l2Id("biology", "Organismal Physiology"),
      prerequisites: ["spine_biology_l3_action_potential"],
      unlocks: [
        l3Id("biology", "neuronal_circuit_integration"),
        "spine_biology_l3_neurotransmitters_and_receptors",
      ],
    },
    domain_contexts: [
      {
        domain_id: "biology",
        framing: {
          title_in_context: "Synapse Structure and Transmission",
          relevance: "Links cellular excitability to circuit-level integration.",
          applications: ["Chemical synapses", "Synaptic plasticity"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Organismal Physiology",
          subcategory: "Neural Signaling",
          topic: "Synaptic Transmission",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_action_potential"],
          unlocks_in_context: [l3Id("biology", "neuronal_circuit_integration")],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "psychology_neuroscience",
        framing: {
          title_in_context: "Synaptic Transmission",
          relevance: "Foundation of neural network computation and learning.",
          applications: ["EPSP/IPSP summation", "Long-term potentiation"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Biological Psychology & Neuroscience",
          subcategory: "Synaptic Physiology",
          topic: "Synaptic Transmission",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_action_potential"],
          unlocks_in_context: ["spine_biology_l3_neurotransmitters_and_receptors"],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Synaptic Transmission Physiology",
          relevance: "Target for reuptake inhibitors, local anesthetics, and neuromuscular blockers.",
          applications: ["EPSP/IPSP integration", "Pharmacologic modulation"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Physiology",
          subcategory: "Neurophysiology",
          topic: "Synaptic Transmission",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_action_potential"],
          unlocks_in_context: ["spine_biology_l3_neurotransmitters_and_receptors"],
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
        { source: "OpenStax Biology 2e", chapter: "33", section: "33.3" },
        { source: "OpenStax Anatomy and Physiology 2e", chapter: "12", section: "12.5" },
      ],
    },
  },

  // ── 3. Neurotransmitters and receptors ─────────────────────────────────────
  {
    id: "spine_biology_l3_neurotransmitters_and_receptors",
    resolution_level: 3,
    content: {
      title: "Neurotransmitters and Receptors",
      definition:
        "Chemical messengers released at synapses binding ionotropic or metabotropic receptors to modulate postsynaptic excitability, plasticity, and effector organ function.",
      summary:
        "Major systems include glutamate, GABA, dopamine, serotonin, and acetylcholine. Receptor subtype and location determine pharmacologic and behavioral effects.",
    },
    knowledge_graph: {
      knowledge_area: "Life Sciences",
      knowledge_cluster: "Synaptic Signaling",
      primary_domain: "biology",
      _shared_concept_note:
        "Merged neurotransmitters_and_receptors (psychology_neuroscience and medicine_preclinical).",
    },
    dependency_graph: {
      parent_concept_id: l2Id("biology", "Organismal Physiology"),
      prerequisites: ["spine_biology_l3_synaptic_transmission"],
      unlocks: [l3Id("psychology_neuroscience", "psychopharmacology_basics")],
    },
    domain_contexts: [
      {
        domain_id: "biology",
        framing: {
          title_in_context: "Neurotransmitters and Receptors",
          relevance: "Chemical basis of intercellular signaling in nervous systems.",
          applications: ["Excitatory vs inhibitory transmission"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Organismal Physiology",
          subcategory: "Neural Signaling",
          topic: "Neurotransmitters and Receptors",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_synaptic_transmission"],
          unlocks_in_context: [],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "psychology_neuroscience",
        framing: {
          title_in_context: "Neurotransmitters and Receptors",
          relevance: "Maps brain chemistry to behavior and psychopharmacology.",
          applications: ["Dopamine reward pathways", "SSRI mechanisms"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Biological Psychology & Neuroscience",
          subcategory: "Synaptic Physiology",
          topic: "Neurotransmitters and Receptors",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_synaptic_transmission"],
          unlocks_in_context: [l3Id("psychology_neuroscience", "psychopharmacology_basics")],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Neurotransmitters and Receptors",
          relevance: "Basis for autonomic pharmacology, anesthesia, and psychiatric drug classes.",
          applications: ["GABA-A benzodiazepines", "Nicotinic neuromuscular blockade"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Pharmacology",
          subcategory: "Neuropharmacology",
          topic: "Neurotransmitters and Receptors",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_synaptic_transmission"],
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
        { source: "OpenStax Psychology 2e", chapter: "3", section: "3.5" },
        { source: "OpenStax Anatomy and Physiology 2e", chapter: "12", section: "12.6" },
      ],
    },
  },

  // ── 4. Enzyme kinetics (chemistry ↔ medicine biochem) ─────────────────────
  {
    id: "spine_chemistry_l3_enzyme_kinetics_michaelis_menten",
    resolution_level: 3,
    content: {
      title: "Enzyme Kinetics and Michaelis–Menten",
      definition:
        "Hyperbolic relationship between reaction rate and substrate concentration characterized by Vmax and Km, reflecting enzyme saturation and catalytic efficiency.",
      summary:
        "Michaelis–Menten kinetics explains enzyme saturation and inhibitor mechanisms. Km approximates substrate affinity; competitive inhibitors alter apparent Km.",
    },
    knowledge_graph: {
      knowledge_area: "Physical Sciences",
      knowledge_cluster: "Biochemical Mechanism",
      primary_domain: "chemistry",
      _shared_concept_note:
        "Merged duplicate enzyme_kinetics_michaelis_menten in medicine_preclinical biochemistry.",
    },
    dependency_graph: {
      parent_concept_id: l2Id("chemistry", "Biochemistry"),
      prerequisites: [
        l3Id("chemistry", "amino_acids_and_protein_structure"),
        l3Id("chemistry", "reaction_rates"),
      ],
      unlocks: [l3Id("chemistry", "carbohydrate_structure_and_metabolism")],
    },
    domain_contexts: [
      {
        domain_id: "chemistry",
        framing: {
          title_in_context: "Enzyme Kinetics",
          relevance: "Quantitative model for catalytic rate and inhibition.",
          applications: ["Lineweaver-Burk analysis", "Inhibitor classification"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Biochemistry",
          subcategory: "Proteins",
          topic: "Enzyme Kinetics",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l3Id("chemistry", "amino_acids_and_protein_structure")],
          unlocks_in_context: [l3Id("chemistry", "carbohydrate_structure_and_metabolism")],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Enzyme Kinetics in Metabolism",
          relevance: "Explains drug enzyme inhibition and metabolic regulation.",
          applications: ["Competitive inhibition", "Allosteric regulation"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Biochemistry & Metabolism",
          subcategory: "Enzyme Kinetics",
          topic: "Michaelis-Menten Kinetics",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l2Id("medicine_preclinical", "Biochemistry & Metabolism")],
          unlocks_in_context: ["spine_chemistry_l3_glycolysis_and_central_metabolism"],
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
        { source: "OpenStax Chemistry 2e", chapter: "20", section: "20.3" },
        { source: "OpenStax Anatomy and Physiology 2e", chapter: "24", section: "24.2" },
      ],
    },
  },

  // ── 5. Glycolysis / central metabolism ─────────────────────────────────────
  {
    id: "spine_chemistry_l3_glycolysis_and_central_metabolism",
    resolution_level: 3,
    content: {
      title: "Glycolysis and Central Metabolism",
      definition:
        "Cytoplasmic glycolysis converting glucose to pyruvate with net ATP yield, coupled to gluconeogenic reversal and entry into mitochondrial oxidative metabolism.",
      summary:
        "Glycolysis is the universal entry point for carbohydrate energy harvest. Regulated irreversible steps link to fasting gluconeogenesis and the TCA cycle.",
    },
    knowledge_graph: {
      knowledge_area: "Physical Sciences",
      knowledge_cluster: "Metabolic Pathways",
      primary_domain: "chemistry",
      _shared_concept_note:
        "Merged glycolysis_and_central_metabolism (chemistry) and glycolysis_and_gluconeogenesis (medicine_preclinical).",
    },
    dependency_graph: {
      parent_concept_id: l2Id("chemistry", "Biochemistry"),
      prerequisites: [l3Id("chemistry", "carbohydrate_structure_and_metabolism")],
      unlocks: [],
    },
    domain_contexts: [
      {
        domain_id: "chemistry",
        framing: {
          title_in_context: "Glycolysis and Central Metabolism",
          relevance: "Core carbohydrate catabolism pathway.",
          applications: ["Fermentation", "Aerobic respiration entry"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Biochemistry",
          subcategory: "Carbohydrate Metabolism",
          topic: "Glycolysis",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l3Id("chemistry", "carbohydrate_structure_and_metabolism")],
          unlocks_in_context: [],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Glycolysis and Gluconeogenesis",
          relevance: "High-yield Step 1 metabolism with disease links to diabetes and fasting.",
          applications: ["Insulin regulation", "Pyruvate carboxylase"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Biochemistry & Metabolism",
          subcategory: "Carbohydrate Metabolism",
          topic: "Glycolysis and Gluconeogenesis",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_chemistry_l3_enzyme_kinetics_michaelis_menten"],
          unlocks_in_context: [l3Id("medicine_preclinical", "tca_cycle_and_electron_transport")],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "biology",
        framing: {
          title_in_context: "Cellular Carbohydrate Metabolism",
          relevance: "Conserved glycolytic pathway in all respiring cells.",
          applications: ["Fermentation in yeast", "Muscle glycogen use"],
          max_resolution_in_context: 3,
        },
        hierarchy_location: {
          category: "Cell Biology",
          subcategory: "Energy Metabolism",
          topic: "Glycolysis",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l2Id("biology", "Cell Biology")],
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
        { source: "OpenStax Chemistry 2e", chapter: "20", section: "20.4" },
        { source: "OpenStax Anatomy and Physiology 2e", chapter: "24", section: "24.3" },
        { source: "OpenStax Biology 2e", chapter: "7", section: "7.2" },
      ],
    },
  },

  // ── 6. Innate immunity ───────────────────────────────────────────────────────
  {
    id: "spine_biology_l3_innate_immunity",
    resolution_level: 3,
    content: {
      title: "Innate Immunity",
      definition:
        "Immediate, non-specific host defenses including barriers, phagocytes, complement, inflammation, and pattern-recognition receptors detecting pathogen-associated molecular patterns.",
      summary:
        "Innate immunity provides first-line protection before adaptive responses mature. TLRs and complement link recognition to rapid effector functions.",
    },
    knowledge_graph: {
      knowledge_area: "Life Sciences",
      knowledge_cluster: "Immune Defense",
      primary_domain: "biology",
      _shared_concept_note:
        "Merged innate_immunity (biology) and innate_immunity_pattern_recognition (medicine_preclinical).",
    },
    dependency_graph: {
      parent_concept_id: l2Id("biology", "Immunology"),
      prerequisites: [l2Id("biology", "Immunology")],
      unlocks: ["spine_biology_l3_adaptive_immunity_overview"],
    },
    domain_contexts: [
      {
        domain_id: "biology",
        framing: {
          title_in_context: "Innate Immunity",
          relevance: "Evolutionarily ancient immune layer in all multicellular hosts.",
          applications: ["Inflammation", "Phagocytosis"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Immunology",
          subcategory: "Immune Defense",
          topic: "Innate Immunity",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l2Id("biology", "Immunology")],
          unlocks_in_context: ["spine_biology_l3_adaptive_immunity_overview"],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Innate Immunity and Pattern Recognition",
          relevance: "Step 1 foundation for sepsis, complement deficiencies, and TLR signaling.",
          applications: ["TLR pathways", "Complement opsonization"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Immunology",
          subcategory: "Innate Immunity",
          topic: "Pattern Recognition",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l2Id("medicine_preclinical", "Immunology")],
          unlocks_in_context: ["spine_biology_l3_adaptive_immunity_overview"],
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
        { source: "OpenStax Biology 2e", chapter: "44", section: "44.1" },
        { source: "NCBI StatPearls", chapter: "Innate Immunity", section: "PRRs" },
      ],
    },
  },

  // ── 7. Adaptive immunity overview ────────────────────────────────────────────
  {
    id: "spine_biology_l3_adaptive_immunity_overview",
    resolution_level: 3,
    content: {
      title: "Adaptive Immunity Overview",
      definition:
        "Antigen-specific lymphocyte responses with clonal selection generating immunologic memory and heightened secondary responses to previously encountered pathogens.",
      summary:
        "Adaptive immunity combines humoral and cell-mediated arms. Memory B and T cells underpin vaccination and faster recall responses.",
    },
    knowledge_graph: {
      knowledge_area: "Life Sciences",
      knowledge_cluster: "Immune Defense",
      primary_domain: "biology",
      _shared_concept_note: "Merged duplicate adaptive_immunity_overview nodes in biology and medicine_preclinical.",
    },
    dependency_graph: {
      parent_concept_id: l2Id("biology", "Immunology"),
      prerequisites: ["spine_biology_l3_innate_immunity"],
      unlocks: [
        l3Id("biology", "antibodies_and_b_cells"),
        l3Id("biology", "t_cell_responses"),
        l3Id("medicine_preclinical", "mhc_and_antigen_presentation"),
      ],
    },
    domain_contexts: [
      {
        domain_id: "biology",
        framing: {
          title_in_context: "Adaptive Immunity Overview",
          relevance: "Specific, memory-capable immune layer in vertebrates.",
          applications: ["Clonal selection", "Primary vs secondary response"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Immunology",
          subcategory: "Immune Defense",
          topic: "Adaptive Immunity",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_innate_immunity"],
          unlocks_in_context: [
            l3Id("biology", "antibodies_and_b_cells"),
            l3Id("biology", "t_cell_responses"),
          ],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Adaptive Immunity Overview",
          relevance: "Framework for immunodeficiency, vaccination, and transplant rejection.",
          applications: ["Memory lymphocytes", "Clonal expansion"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Immunology",
          subcategory: "Adaptive Immunity",
          topic: "Adaptive Immunity Overview",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_innate_immunity"],
          unlocks_in_context: [l3Id("medicine_preclinical", "mhc_and_antigen_presentation")],
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
        { source: "OpenStax Biology 2e", chapter: "44", section: "44.2" },
        { source: "NCBI StatPearls", chapter: "Adaptive Immunity", section: "Overview" },
      ],
    },
  },

  // ── 8. Hypersensitivity ──────────────────────────────────────────────────────
  {
    id: "spine_biology_l3_hypersensitivity_reactions",
    resolution_level: 3,
    content: {
      title: "Hypersensitivity Reactions",
      definition:
        "Excessive or misdirected immune responses damaging host tissues through type I (IgE-mediated), type II (antibody-mediated cytotoxic), type III (immune complex), or type IV (T cell-mediated) mechanisms.",
      summary:
        "Hypersensitivity types unify allergy, serum sickness, and contact dermatitis under a mechanistic framework. Imbalance between tolerance and attack drives pathology.",
    },
    knowledge_graph: {
      knowledge_area: "Life Sciences",
      knowledge_cluster: "Immune Pathology",
      primary_domain: "biology",
      _shared_concept_note: "Merged hypersensitivity_reactions in biology and medicine_preclinical.",
    },
    dependency_graph: {
      parent_concept_id: l2Id("biology", "Immunology"),
      prerequisites: [l3Id("biology", "antibodies_and_b_cells")],
      unlocks: ["spine_biology_l3_autoimmunity"],
    },
    domain_contexts: [
      {
        domain_id: "biology",
        framing: {
          title_in_context: "Hypersensitivity Reactions",
          relevance: "Immune pathology when tolerance fails.",
          applications: ["Allergy", "Autoimmune overlap"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Immunology",
          subcategory: "Immune Pathology",
          topic: "Hypersensitivity",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l3Id("biology", "antibodies_and_b_cells")],
          unlocks_in_context: ["spine_biology_l3_autoimmunity"],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Hypersensitivity Reactions (Types I–IV)",
          relevance: "High-yield Step 1 mechanistic classification for allergy and drug reactions.",
          applications: ["Anaphylaxis", "TB skin test (type IV)"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Immunology",
          subcategory: "Hypersensitivity",
          topic: "Hypersensitivity Types",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l3Id("medicine_preclinical", "humoral_immunity_antibodies")],
          unlocks_in_context: ["spine_biology_l3_autoimmunity"],
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
        { source: "OpenStax Biology 2e", chapter: "44", section: "44.5" },
        { source: "NCBI StatPearls", chapter: "Hypersensitivity", section: "Types" },
      ],
    },
  },

  // ── 9. Autoimmunity ────────────────────────────────────────────────────────
  {
    id: "spine_biology_l3_autoimmunity",
    resolution_level: 3,
    content: {
      title: "Autoimmunity",
      definition:
        "Loss of self-tolerance leading to immune attack against host antigens through central or peripheral tolerance failure, molecular mimicry, or epitope spreading.",
      summary:
        "Autoimmunity underlies diseases such as rheumatoid arthritis, type 1 diabetes, and SLE. Genetic susceptibility and environmental triggers interact.",
    },
    knowledge_graph: {
      knowledge_area: "Life Sciences",
      knowledge_cluster: "Immune Pathology",
      primary_domain: "biology",
      _shared_concept_note:
        "Merged autoimmunity_basics (biology) and autoimmunity_mechanisms (medicine_preclinical).",
    },
    dependency_graph: {
      parent_concept_id: l2Id("biology", "Immunology"),
      prerequisites: [l3Id("biology", "t_cell_responses")],
      unlocks: [],
    },
    domain_contexts: [
      {
        domain_id: "biology",
        framing: {
          title_in_context: "Autoimmunity Basics",
          relevance: "When adaptive immunity targets self antigens.",
          applications: ["Tolerance checkpoints"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Immunology",
          subcategory: "Immune Pathology",
          topic: "Autoimmunity",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l3Id("biology", "t_cell_responses")],
          unlocks_in_context: [],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Autoimmunity Mechanisms",
          relevance: "Pathophysiology of SLE, RA, and other autoimmune diseases on Step 1.",
          applications: ["Anti-dsDNA", "Molecular mimicry"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Immunology",
          subcategory: "Autoimmunity",
          topic: "Autoimmunity Mechanisms",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l3Id("medicine_preclinical", "cell_mediated_immunity")],
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
        { source: "OpenStax Biology 2e", chapter: "44", section: "44.6" },
        { source: "NCBI StatPearls", chapter: "Autoimmunity", section: "Mechanisms" },
      ],
    },
  },

  // ── 10. Vaccination ──────────────────────────────────────────────────────────
  {
    id: "spine_biology_l3_vaccination_principles",
    resolution_level: 3,
    content: {
      title: "Vaccination Principles",
      definition:
        "Deliberate antigen exposure inducing protective adaptive memory without severe disease, using live attenuated, inactivated, subunit, conjugate, or nucleic acid vaccine platforms.",
      summary:
        "Vaccination harnesses immunologic memory for prevention. Herd immunity reduces transmission when population coverage is sufficient.",
    },
    knowledge_graph: {
      knowledge_area: "Life Sciences",
      knowledge_cluster: "Immune Applications",
      primary_domain: "biology",
      _shared_concept_note:
        "Merged vaccination_principles (biology) and vaccine_principles (medicine_preclinical).",
    },
    dependency_graph: {
      parent_concept_id: l2Id("biology", "Immunology"),
      prerequisites: [l3Id("biology", "antibodies_and_b_cells")],
      unlocks: [],
    },
    domain_contexts: [
      {
        domain_id: "biology",
        framing: {
          title_in_context: "Vaccination Principles",
          relevance: "Applied adaptive immunity for public health.",
          applications: ["Herd immunity", "Booster schedules"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Immunology",
          subcategory: "Immune Applications",
          topic: "Vaccination",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l3Id("biology", "antibodies_and_b_cells")],
          unlocks_in_context: [],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Vaccine Principles",
          relevance: "Step 1 contraindications, live vs killed vaccines, and immunization schedules.",
          applications: ["mRNA vaccines", "Pregnancy contraindications"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Immunology",
          subcategory: "Vaccination",
          topic: "Vaccine Principles",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_biology_l3_adaptive_immunity_overview"],
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
        { source: "OpenStax Biology 2e", chapter: "44", section: "44.7" },
        { source: "NCBI StatPearls", chapter: "Vaccines", section: "Types" },
      ],
    },
  },

  // ── 11. Descriptive statistics (math ↔ psych) ───────────────────────────────
  {
    id: "spine_mathematics_l3_descriptive_statistics",
    resolution_level: 3,
    content: {
      title: "Descriptive Statistics",
      definition:
        "Summarization of datasets using measures of central tendency, variability, and graphical displays to characterize distributions without inferring population parameters.",
      summary:
        "Mean, median, mode, variance, and standard deviation describe sample shape. Distribution skewness and outliers affect interpretation before inference.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Data Analysis",
      primary_domain: "mathematics",
      _shared_concept_note:
        "Merged descriptive_statistics (mathematics and psychology_neuroscience research methods).",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Statistics & Probability"),
      prerequisites: [l2Id("mathematics", "Statistics & Probability")],
      unlocks: [
        "spine_mathematics_l3_hypothesis_testing",
        l3Id("psychology_neuroscience", "correlation_and_regression"),
      ],
    },
    domain_contexts: [
      {
        domain_id: "mathematics",
        framing: {
          title_in_context: "Descriptive Statistics",
          relevance: "Foundation for probability and inference.",
          applications: ["Data visualization", "Summary measures"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Statistics & Probability",
          subcategory: "Data Analysis",
          topic: "Descriptive Statistics",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l2Id("mathematics", "Statistics & Probability")],
          unlocks_in_context: [
            "spine_mathematics_l3_hypothesis_testing",
            l3Id("mathematics", "probability_fundamentals"),
          ],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "psychology_neuroscience",
        framing: {
          title_in_context: "Descriptive Statistics",
          relevance: "Summarize behavioral research data before hypothesis testing.",
          applications: ["Survey data", "Reaction time distributions"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Research Methods & Statistics",
          subcategory: "Descriptive Statistics",
          topic: "Descriptive Statistics",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [
            l3Id("psychology_neuroscience", "experimental_design_basics"),
          ],
          unlocks_in_context: ["spine_mathematics_l3_hypothesis_testing"],
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
        { source: "OpenStax Introductory Statistics", chapter: "2", section: "2.3" },
        { source: "OpenStax Psychology 2e", chapter: "2", section: "2.2" },
      ],
    },
  },

  // ── 12. Hypothesis testing (math ↔ psych inferential) ───────────────────────
  {
    id: "spine_mathematics_l3_hypothesis_testing",
    resolution_level: 3,
    content: {
      title: "Hypothesis Testing",
      definition:
        "Formal procedure for evaluating claims about population parameters using sample data, null and alternative hypotheses, test statistics, p-values, and confidence intervals under stated assumptions.",
      summary:
        "Hypothesis tests quantify evidence against a null model. Type I/II errors, power, and effect size must be interpreted alongside statistical significance.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Statistical Inference",
      primary_domain: "mathematics",
      _shared_concept_note:
        "Merged hypothesis_testing (mathematics) and inferential_statistics_hypothesis_testing (psychology_neuroscience).",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Statistics & Probability"),
      prerequisites: ["spine_mathematics_l3_descriptive_statistics"],
      unlocks: [l3Id("mathematics", "normal_distribution")],
    },
    domain_contexts: [
      {
        domain_id: "mathematics",
        framing: {
          title_in_context: "Hypothesis Testing",
          relevance: "Core inferential framework in statistics.",
          applications: ["t-tests", "Chi-square tests"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Statistics & Probability",
          subcategory: "Inference",
          topic: "Hypothesis Testing",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_mathematics_l3_descriptive_statistics"],
          unlocks_in_context: [l3Id("mathematics", "normal_distribution")],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "psychology_neuroscience",
        framing: {
          title_in_context: "Inferential Statistics and Hypothesis Testing",
          relevance: "Evaluate experimental findings in behavioral science.",
          applications: ["NHST in psychology", "Effect size reporting"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Research Methods & Statistics",
          subcategory: "Inferential Statistics",
          topic: "Hypothesis Testing",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: ["spine_mathematics_l3_descriptive_statistics"],
          unlocks_in_context: [l3Id("psychology_neuroscience", "correlation_and_regression")],
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
        { source: "OpenStax Introductory Statistics", chapter: "9", section: "9.1" },
        { source: "OpenStax Psychology 2e", chapter: "2", section: "2.3" },
      ],
    },
  },
];

/** IDs removed from domain files — superseded by merged shared nodes (different ids only). */
export const SUPERSEDED_SPINE_L3_IDS = new Set([
  "spine_psychology_neuroscience_l3_resting_membrane_potential",
  "spine_medicine_preclinical_l3_cell_membrane_resting_potential",
  "spine_biology_l3_synapse_structure",
  "spine_psychology_neuroscience_l3_synaptic_transmission",
  "spine_medicine_preclinical_l3_synaptic_transmission_physiology",
  "spine_psychology_neuroscience_l3_neurotransmitters_and_receptors",
  "spine_medicine_preclinical_l3_neurotransmitters_and_receptors",
  "spine_medicine_preclinical_l3_enzyme_kinetics_michaelis_menten",
  "spine_medicine_preclinical_l3_glycolysis_and_gluconeogenesis",
  "spine_medicine_preclinical_l3_innate_immunity_pattern_recognition",
  "spine_medicine_preclinical_l3_adaptive_immunity_overview",
  "spine_medicine_preclinical_l3_hypersensitivity_reactions",
  "spine_medicine_preclinical_l3_autoimmunity_mechanisms",
  "spine_medicine_preclinical_l3_vaccine_principles",
  "spine_psychology_neuroscience_l3_descriptive_statistics",
  "spine_psychology_neuroscience_l3_inferential_statistics_hypothesis_testing",
  "spine_physics_l3_radioactive_decay",
  "spine_chemistry_l3_radioactive_decay_and_half_life",
]);
