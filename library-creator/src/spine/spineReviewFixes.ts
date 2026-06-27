/**
 * Human review fixes — duplicate cleanup and cross-domain shared nodes.
 */
import type { SpineConcept } from "./spineSchema.js";
import { l2Id, l3Id } from "./spineDomains.js";

const TS = "2025-01-01T00:00:00Z";

function emptyLinks() {
  return { by_library: {} };
}

function psychClinicalMerge(
  shortName: string,
  cluster: string,
  title: string,
  definition: string,
  summary: string,
  psychPrereqs: string[],
  clinical: {
    relevance: string;
    applications: string[];
    summary: string;
  },
  sources: { psych: { source: string; chapter: string; section: string }; clinical: { source: string; chapter: string; section: string } }
): SpineConcept {
  const id = l3Id("psychology_neuroscience", shortName);
  return {
    id,
    resolution_level: 3,
    content: { title, definition, summary },
    knowledge_graph: {
      knowledge_area: "Behavioral & Cognitive Sciences",
      knowledge_cluster: cluster,
      primary_domain: "psychology_neuroscience",
      _shared_concept_note: `Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).`,
    },
    dependency_graph: {
      parent_concept_id: l2Id("psychology_neuroscience", "Abnormal Psychology & Psychopathology"),
      prerequisites: psychPrereqs,
      unlocks: [],
    },
    domain_contexts: [
      {
        domain_id: "psychology_neuroscience",
        framing: {
          title_in_context: title,
          relevance: "DSM-based psychopathology classification and behavioral mechanisms.",
          applications: [],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Psychology & Neuroscience",
          subcategory: "Abnormal Psychology & Psychopathology",
          topic: title,
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: psychPrereqs,
          unlocks_in_context: [],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "medicine_clinical",
        framing: {
          title_in_context: title,
          relevance: clinical.relevance,
          applications: clinical.applications,
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Medicine (Clinical)",
          subcategory: "Psychiatry & Behavioral Health",
          topic: title,
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l2Id("medicine_clinical", "Psychiatry & Behavioral Health")],
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
      source_references: [sources.psych, sources.clinical],
    },
  };
}

export const SPINE_REVIEW_FIXES: SpineConcept[] = [
  // Psychiatry — psych owns DSM; clinical owns management (D2)
  psychClinicalMerge(
    "anxiety_disorders",
    "Anxiety Disorders",
    "Anxiety Disorders",
    "Excessive fear and avoidance including generalized anxiety, panic, phobic, and related disorders disrupting daily functioning.",
    "Anxiety disorders involve hyperarousal and catastrophic cognitions. Exposure-based therapies target avoidance.",
    [l3Id("psychology_neuroscience", "diagnostic_classification_dsm")],
    {
      relevance: "Clinical management with CBT, SSRIs, and short-term anxiolytics.",
      applications: ["Panic disorder treatment", "Exposure therapy for phobias"],
      summary: "",
    },
    {
      psych: { source: "OpenStax Psychology 2e", chapter: "15", section: "15.2" },
      clinical: { source: "NCBI StatPearls", chapter: "Anxiety", section: "Management" },
    }
  ),
  psychClinicalMerge(
    "schizophrenia_spectrum",
    "Psychotic Disorders",
    "Schizophrenia Spectrum Disorders",
    "Disorders featuring positive symptoms such as hallucinations and delusions, negative symptoms, and cognitive disorganization.",
    "Dopamine dysregulation and neurodevelopmental factors contribute. Functional outcome varies with support and treatment.",
    [l3Id("psychology_neuroscience", "diagnostic_classification_dsm")],
    {
      relevance: "Antipsychotic pharmacotherapy and psychosocial rehabilitation.",
      applications: ["First-episode psychosis workup", "Clozapine for treatment resistance"],
      summary: "",
    },
    {
      psych: { source: "OpenStax Psychology 2e", chapter: "15", section: "15.4" },
      clinical: { source: "NCBI StatPearls", chapter: "Schizophrenia", section: "Management" },
    }
  ),
  psychClinicalMerge(
    "substance_use_disorders",
    "Addiction",
    "Substance Use Disorders",
    "Problematic pattern of substance use leading to clinically significant impairment or distress with tolerance and withdrawal features.",
    "Reward pathways underlie addiction. Motivational interviewing and MAT support recovery.",
    [l3Id("psychology_neuroscience", "psychopharmacology_basics")],
    {
      relevance: "Withdrawal management and maintenance therapies in clinical practice.",
      applications: ["Opioid MAT", "Alcohol use disorder pharmacotherapy"],
      summary: "",
    },
    {
      psych: { source: "OpenStax Psychology 2e", chapter: "15", section: "15.7" },
      clinical: { source: "NCBI StatPearls", chapter: "Substance Use", section: "Management" },
    }
  ),
  psychClinicalMerge(
    "eating_disorders",
    "Feeding and Eating Disorders",
    "Eating Disorders",
    "Disturbances in eating behavior and body image including anorexia nervosa, bulimia nervosa, and binge-eating disorder.",
    "Sociocultural and biological factors interact in eating disorders. Medical complications require multidisciplinary care.",
    [l3Id("psychology_neuroscience", "diagnostic_classification_dsm")],
    {
      relevance: "Medical stabilization and psychotherapy in inpatient and outpatient settings.",
      applications: ["Anorexia medical complications", "Electrolyte monitoring with purging"],
      summary: "",
    },
    {
      psych: { source: "OpenStax Psychology 2e", chapter: "15", section: "15.8" },
      clinical: { source: "NCBI StatPearls", chapter: "Eating Disorders", section: "Management" },
    }
  ),
  psychClinicalMerge(
    "personality_disorders_overview",
    "Personality Disorders",
    "Personality Disorders Overview",
    "Enduring maladaptive patterns of cognition, affect, and interpersonal functioning deviating from cultural expectations.",
    "Clusters group odd-eccentric, dramatic, and anxious-fearful patterns. Traits exist on continua with normality.",
    [l3Id("psychology_neuroscience", "diagnostic_classification_dsm")],
    {
      relevance: "Cluster-based clinical approach including DBT for borderline personality disorder.",
      applications: ["Borderline PD management", "Antisocial vs avoidant clusters"],
      summary: "",
    },
    {
      psych: { source: "OpenStax Psychology 2e", chapter: "15", section: "15.5" },
      clinical: { source: "NCBI StatPearls", chapter: "Personality Disorders", section: "Overview" },
    }
  ),

  // Learning — med behavioral science context on psych conditioning nodes (#4)
  {
    id: l3Id("psychology_neuroscience", "classical_conditioning"),
    resolution_level: 3,
    content: {
      title: "Classical Conditioning",
      definition:
        "Learning in which a neutral conditioned stimulus acquires the ability to elicit a response after pairing with an unconditioned stimulus.",
      summary:
        "Pavlovian conditioning explains reflexive associations. Extinction and spontaneous recovery demonstrate flexibility.",
    },
    knowledge_graph: {
      knowledge_area: "Behavioral & Cognitive Sciences",
      knowledge_cluster: "Associative Learning",
      primary_domain: "psychology_neuroscience",
      _shared_concept_note:
        "Medicine preclinical behavioral science (patient adherence, aversive conditioning) is a domain context — not a separate L3.",
    },
    dependency_graph: {
      parent_concept_id: l2Id("psychology_neuroscience", "Learning & Conditioning"),
      prerequisites: [l2Id("psychology_neuroscience", "Learning & Conditioning")],
      unlocks: [
        l3Id("psychology_neuroscience", "extinction_and_spontaneous_recovery"),
        l3Id("psychology_neuroscience", "biological_constraints_on_learning"),
      ],
    },
    domain_contexts: [
      {
        domain_id: "psychology_neuroscience",
        framing: {
          title_in_context: "Classical Conditioning",
          relevance: "Foundation of associative learning in behavioral psychology.",
          applications: ["Pavlovian paradigms", "Conditioned emotional responses"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Psychology & Neuroscience",
          subcategory: "Learning & Conditioning",
          topic: "Classical Conditioning",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l2Id("psychology_neuroscience", "Learning & Conditioning")],
          unlocks_in_context: [
            l3Id("psychology_neuroscience", "extinction_and_spontaneous_recovery"),
          ],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Classical Conditioning in Behavioral Medicine",
          relevance: "Behavioral medicine and patient adherence — conditioned responses to clinical cues.",
          applications: ["Aversive conditioning", "Placebo/nocebo mechanisms"],
          max_resolution_in_context: 3,
        },
        hierarchy_location: {
          category: "Behavioral Science & Epidemiology",
          subcategory: "Behavioral Science",
          topic: "Learning Theory",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l2Id("medicine_preclinical", "Behavioral Science & Epidemiology")],
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
        { source: "OpenStax Psychology 2e", chapter: "6", section: "6.1" },
        { source: "NCBI StatPearls", chapter: "Behavioral Science", section: "Learning" },
      ],
    },
  },
  {
    id: l3Id("psychology_neuroscience", "operant_conditioning"),
    resolution_level: 3,
    content: {
      title: "Operant Conditioning",
      definition:
        "Learning through consequences in which reinforced behaviors increase and punished behaviors decrease in frequency.",
      summary:
        "Skinner's operant paradigm shapes voluntary behavior. Reinforcement schedules affect resistance to extinction.",
    },
    knowledge_graph: {
      knowledge_area: "Behavioral & Cognitive Sciences",
      knowledge_cluster: "Associative Learning",
      primary_domain: "psychology_neuroscience",
      _shared_concept_note:
        "Medicine preclinical behavioral science (reinforcement in adherence) is a domain context — not a separate L3.",
    },
    dependency_graph: {
      parent_concept_id: l2Id("psychology_neuroscience", "Learning & Conditioning"),
      prerequisites: [l2Id("psychology_neuroscience", "Learning & Conditioning")],
      unlocks: [l3Id("psychology_neuroscience", "reinforcement_schedules")],
    },
    domain_contexts: [
      {
        domain_id: "psychology_neuroscience",
        framing: {
          title_in_context: "Operant Conditioning",
          relevance: "Voluntary behavior shaped by reinforcement and punishment.",
          applications: ["Skinner box paradigms", "Behavior modification"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Psychology & Neuroscience",
          subcategory: "Learning & Conditioning",
          topic: "Operant Conditioning",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l2Id("psychology_neuroscience", "Learning & Conditioning")],
          unlocks_in_context: [l3Id("psychology_neuroscience", "reinforcement_schedules")],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Operant Conditioning in Behavioral Medicine",
          relevance: "Reinforcement schedules in patient behavior change and adherence programs.",
          applications: ["Positive reinforcement in lifestyle change", "Contingency management"],
          max_resolution_in_context: 3,
        },
        hierarchy_location: {
          category: "Behavioral Science & Epidemiology",
          subcategory: "Behavioral Science",
          topic: "Learning Theory",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l2Id("medicine_preclinical", "Behavioral Science & Epidemiology")],
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
        { source: "OpenStax Psychology 2e", chapter: "6", section: "6.2" },
        { source: "NCBI StatPearls", chapter: "Behavioral Science", section: "Learning" },
      ],
    },
  },

  // Bacterial cell structure — biology owns; med owns clinical relevance (#7)
  {
    id: l3Id("biology", "prokaryotic_cell_structure"),
    resolution_level: 3,
    content: {
      title: "Prokaryotic Cell Structure",
      definition:
        "Unicellular organisms lacking a nucleus, with circular DNA, ribosomes, cell wall, and often flagella or pili defining bacterial and archaeal architecture.",
      summary:
        "Prokaryotic simplicity enables rapid replication. Cell envelope composition distinguishes gram-positive and gram-negative bacteria.",
    },
    knowledge_graph: {
      knowledge_area: "Life Sciences",
      knowledge_cluster: "Microbial Cell Biology",
      primary_domain: "biology",
      _shared_concept_note:
        "Merged prokaryotic_cell_structure (biology) and bacterial_cell_structure (medicine_preclinical).",
    },
    dependency_graph: {
      parent_concept_id: l2Id("biology", "Microbiology"),
      prerequisites: [l2Id("biology", "Microbiology")],
      unlocks: [l3Id("biology", "bacterial_growth_and_metabolism")],
    },
    domain_contexts: [
      {
        domain_id: "biology",
        framing: {
          title_in_context: "Prokaryotic Cell Structure",
          relevance: "Structural and evolutionary framing across bacterial and archaeal domains.",
          applications: ["Cell envelope layers", "Flagella and pili"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Microbiology",
          subcategory: "Microbial Cell Biology",
          topic: "Prokaryotic Cell Structure",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l2Id("biology", "Microbiology")],
          unlocks_in_context: [l3Id("biology", "bacterial_growth_and_metabolism")],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: "Bacterial Cell Structure",
          relevance: "Gram staining, virulence factors, and antibiotic targets on Step 1.",
          applications: ["Gram-positive vs gram-negative", "Endospore resistance"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Microbiology & Infectious Disease",
          subcategory: "Bacteriology",
          topic: "Bacterial Cell Structure",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l2Id("medicine_preclinical", "Microbiology & Infectious Disease")],
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
        { source: "OpenStax Biology 2e", chapter: "22", section: "22.1" },
        { source: "NCBI StatPearls", chapter: "Bacteriology", section: "Structure" },
      ],
    },
  },

  // Nucleic acid structure — chemistry owns structure; biology links to DNA replication process (#7)
  {
    id: l3Id("chemistry", "nucleic_acid_structure"),
    resolution_level: 3,
    content: {
      title: "Nucleic Acid Structure",
      definition:
        "Polymers of nucleotides with sugar-phosphate backbones and complementary base pairing between adenine–thymine (or uracil) and guanine–cytosine.",
      summary:
        "DNA stores genetic information in double helices; RNA mediates expression. Base pairing rules enable replication, transcription, and hybridization assays.",
    },
    knowledge_graph: {
      knowledge_area: "Physical Sciences",
      knowledge_cluster: "Nucleic Acids",
      primary_domain: "chemistry",
      _shared_concept_note:
        "Structure owned by chemistry. Biology dna_structure_replication covers the replication process; dna_replication_chemistry covers enzyme mechanisms.",
    },
    dependency_graph: {
      parent_concept_id: l2Id("chemistry", "Biochemistry"),
      prerequisites: [l3Id("chemistry", "lipid_structure_and_function")],
      unlocks: [
        l3Id("chemistry", "dna_replication_chemistry"),
        "spine_chemistry_l3_glycolysis_and_central_metabolism",
      ],
    },
    domain_contexts: [
      {
        domain_id: "chemistry",
        framing: {
          title_in_context: "Nucleic Acid Structure",
          relevance: "Chemical structure of DNA and RNA polymers.",
          applications: ["Base pairing", "Hybridization assays"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Biochemistry",
          subcategory: "Nucleic Acids",
          topic: "Nucleic Acid Structure",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l3Id("chemistry", "lipid_structure_and_function")],
          unlocks_in_context: [l3Id("chemistry", "dna_replication_chemistry")],
        },
        linked_content: emptyLinks(),
      },
      {
        domain_id: "biology",
        framing: {
          title_in_context: "DNA and RNA Molecular Structure",
          relevance: "Structural basis linking to DNA replication and gene expression in biology.",
          applications: ["Double helix", "Complementary strands"],
          max_resolution_in_context: 3,
        },
        hierarchy_location: {
          category: "Molecular Biology & Genetics",
          subcategory: "Nucleic Acids",
          topic: "DNA Structure",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [l2Id("biology", "Molecular Biology & Genetics")],
          unlocks_in_context: [l3Id("biology", "dna_structure_replication")],
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
        { source: "OpenStax Chemistry 2e", chapter: "2", section: "2.6" },
        { source: "OpenStax Biology 2e", chapter: "14", section: "14.1" },
      ],
    },
  },

  // Meningitis — single clinical entity with infectious + neurology contexts (#6)
  {
    id: l3Id("medicine_clinical", "meningitis_and_encephalitis"),
    resolution_level: 3,
    content: {
      title: "Meningitis and Encephalitis",
      definition:
        "Acute CNS infection presenting with fever, headache, and altered mental status; lumbar puncture guides empiric antibiotics and antivirals.",
      summary:
        "Bacterial meningitis shows low glucose and high protein in CSF. HSV encephalitis needs acyclovir promptly. Organism-specific therapy follows culture.",
    },
    knowledge_graph: {
      knowledge_area: "Clinical Sciences",
      knowledge_cluster: "CNS Infections",
      primary_domain: "medicine_clinical",
      _placement_note:
        "Merged meningitis_bacterial (Infectious Disease L2) with neurology presentation. Single clinical node spans both L2 subdivisions.",
    },
    dependency_graph: {
      parent_concept_id: l2Id("medicine_clinical", "Neurology"),
      prerequisites: [l2Id("medicine_clinical", "Neurology")],
      unlocks: [],
    },
    domain_contexts: [
      {
        domain_id: "medicine_clinical",
        framing: {
          title_in_context: "Meningitis and Encephalitis",
          relevance:
            "Neurologic presentation and CSF interpretation; organism-specific empiric antibiotics, prophylaxis, and antivirals.",
          applications: ["HSV encephalitis", "Neisseria prophylaxis", "Dexamethasone adjunct"],
          max_resolution_in_context: 5,
        },
        hierarchy_location: {
          category: "Medicine (Clinical)",
          subcategory: "Neurology / Infectious Disease",
          topic: "Meningitis and Encephalitis",
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: [
            l2Id("medicine_clinical", "Neurology"),
            l2Id("medicine_clinical", "Infectious Disease"),
          ],
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
        { source: "NCBI StatPearls", chapter: "Meningitis", section: "Management" },
        { source: "NCBI StatPearls", chapter: "Bacterial Meningitis", section: "Treatment" },
      ],
    },
  },
];

export const REVIEW_FIX_SUPERSEDED_IDS = new Set([
  "spine_biology_l3_autoimmunity_basics",
  "spine_medicine_clinical_l3_anxiety_disorders",
  "spine_medicine_clinical_l3_schizophrenia_spectrum",
  "spine_medicine_clinical_l3_substance_use_disorders",
  "spine_medicine_clinical_l3_eating_disorders",
  "spine_medicine_clinical_l3_personality_disorders_overview",
  "spine_medicine_preclinical_l3_learning_theory_and_conditioning",
  "spine_medicine_preclinical_l3_bacterial_cell_structure",
  "spine_medicine_clinical_l3_meningitis_bacterial",
  "spine_mathematics_l3_first_order_linear_equations",
]);
