import { LIBRARY_ID } from "./concepts";

const GC = {
  library_id: LIBRARY_ID,
  domain: "Learning Science",
  category: "Cognitive Science",
  subcategory: "Memory & Retention",
};

export const relationships = [
  {
    relationship_id: "rel_active_recall_to_forgetting",
    type: "relationship" as const,
    metadata: {
      created_at: "2026-06-14T00:00:00Z",
      updated_at: "2026-06-14T00:00:00Z",
      created_by: "socrates_admin",
      last_updated_by: "socrates_admin",
      version: "1.0",
      status: "published" as const,
      tags: ["prerequisite"],
      version_history: [],
    },
    graph_context: GC,
    endpoints: {
      from_concept_id: "concept_active_recall",
      to_concept_id: "concept_forgetting_curve",
    },
    relation: { relationship_type: "prerequisite", directionality: "forward" as const },
    editorial: {
      importance: "medium" as const,
      notes: "Retrieval practice context helps interpret why retention decays between reviews.",
    },
    linked_content: {
      relationship_card_ids: [],
      question_ids: [],
    },
  },
  {
    relationship_id: "rel_active_recall_to_concept_maps",
    type: "relationship" as const,
    metadata: {
      created_at: "2026-06-14T00:00:00Z",
      updated_at: "2026-06-14T00:00:00Z",
      created_by: "socrates_admin",
      last_updated_by: "socrates_admin",
      version: "1.0",
      status: "published" as const,
      tags: ["prerequisite"],
      version_history: [],
    },
    graph_context: GC,
    endpoints: {
      from_concept_id: "concept_active_recall",
      to_concept_id: "concept_concept_maps",
    },
    relation: { relationship_type: "prerequisite", directionality: "forward" as const },
    editorial: {
      importance: "medium" as const,
      notes: "Concept maps organize the knowledge that retrieval practice strengthens.",
    },
    linked_content: {
      relationship_card_ids: [],
      question_ids: [],
    },
  },
  {
    relationship_id: "rel_active_recall_to_spaced_rep",
    type: "relationship" as const,
    metadata: {
      created_at: "2026-06-14T00:00:00Z",
      updated_at: "2026-06-14T00:00:00Z",
      created_by: "socrates_admin",
      last_updated_by: "socrates_admin",
      version: "1.0",
      status: "published" as const,
      tags: ["prerequisite"],
      version_history: [],
    },
    graph_context: GC,
    endpoints: {
      from_concept_id: "concept_active_recall",
      to_concept_id: "concept_spaced_repetition",
    },
    relation: { relationship_type: "prerequisite", directionality: "forward" as const },
    editorial: {
      importance: "high" as const,
      notes: "You must understand retrieval practice before interval scheduling makes sense.",
    },
    linked_content: {
      relationship_card_ids: ["card_rel_active_to_spaced"],
      question_ids: ["q_rel_active_spaced_01"],
    },
  },
  {
    relationship_id: "rel_forgetting_to_spaced_rep",
    type: "relationship" as const,
    metadata: {
      created_at: "2026-06-14T00:00:00Z",
      updated_at: "2026-06-14T00:00:00Z",
      created_by: "socrates_admin",
      last_updated_by: "socrates_admin",
      version: "1.0",
      status: "published" as const,
      tags: ["prerequisite"],
      version_history: [],
    },
    graph_context: GC,
    endpoints: {
      from_concept_id: "concept_forgetting_curve",
      to_concept_id: "concept_spaced_repetition",
    },
    relation: { relationship_type: "prerequisite", directionality: "forward" as const },
    editorial: {
      importance: "high" as const,
      notes: "The forgetting curve motivates why spacing matters.",
    },
    linked_content: {
      relationship_card_ids: ["card_rel_forgetting_to_spaced"],
      question_ids: [],
    },
  },
  {
    relationship_id: "rel_spaced_rep_to_fsrs",
    type: "relationship" as const,
    metadata: {
      created_at: "2026-06-14T00:00:00Z",
      updated_at: "2026-06-14T00:00:00Z",
      created_by: "socrates_admin",
      last_updated_by: "socrates_admin",
      version: "1.0",
      status: "published" as const,
      tags: ["prerequisite"],
      version_history: [],
    },
    graph_context: GC,
    endpoints: {
      from_concept_id: "concept_spaced_repetition",
      to_concept_id: "concept_fsrs",
    },
    relation: { relationship_type: "prerequisite", directionality: "forward" as const },
    editorial: {
      importance: "high" as const,
      notes: "FSRS is a specific algorithmic implementation of spaced repetition.",
    },
    linked_content: {
      relationship_card_ids: [],
      question_ids: [],
    },
  },
  {
    relationship_id: "rel_spaced_rep_semantic_concept_maps",
    type: "relationship" as const,
    metadata: {
      created_at: "2026-06-14T00:00:00Z",
      updated_at: "2026-06-14T00:00:00Z",
      created_by: "socrates_admin",
      last_updated_by: "socrates_admin",
      version: "1.0",
      status: "published" as const,
      tags: ["semantic"],
      version_history: [],
    },
    graph_context: GC,
    endpoints: {
      from_concept_id: "concept_spaced_repetition",
      to_concept_id: "concept_concept_maps",
    },
    relation: { relationship_type: "reinforces", directionality: "bidirectional" as const },
    editorial: {
      importance: "medium" as const,
      notes: "Concept maps organize what spaced repetition schedules.",
    },
    linked_content: {
      relationship_card_ids: [],
      question_ids: [],
    },
  },
  {
    relationship_id: "rel_fsrs_to_certification",
    type: "relationship" as const,
    metadata: {
      created_at: "2026-06-14T00:00:00Z",
      updated_at: "2026-06-14T00:00:00Z",
      created_by: "socrates_admin",
      last_updated_by: "socrates_admin",
      version: "1.0",
      status: "published" as const,
      tags: ["prerequisite"],
      version_history: [],
    },
    graph_context: GC,
    endpoints: {
      from_concept_id: "concept_fsrs",
      to_concept_id: "concept_mastery_certification",
    },
    relation: { relationship_type: "prerequisite", directionality: "forward" as const },
    editorial: {
      importance: "high" as const,
      notes: "Certification outcomes affect FSRS scheduling (suppression, acceleration).",
    },
    linked_content: {
      relationship_card_ids: [],
      question_ids: [],
    },
  },
];
