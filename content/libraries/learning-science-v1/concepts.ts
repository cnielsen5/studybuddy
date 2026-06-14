export const LIBRARY_ID = "lib_learning_science_v1";
export const LIBRARY_META = {
  id: LIBRARY_ID,
  name: "Learning Science & Socrates",
  version: "1.0.0",
  description:
    "A complete demo library covering spaced repetition, FSRS, concept maps, event sourcing, and mastery certification — designed to exercise every Socrates content type.",
  domain: "Learning Science",
  created_at: "2026-06-14T00:00:00Z",
  updated_at: "2026-06-14T00:00:00Z",
  status: "published" as const,
  tags: ["spaced-repetition", "fsrs", "learning-science", "socrates"],
};

const H = {
  library_id: LIBRARY_ID,
  domain: "Learning Science",
  category: "Cognitive Science",
  subcategory: "Memory & Retention",
};

export const concepts = [
  {
    id: "concept_active_recall",
    type: "concept" as const,
    metadata: {
      created_at: "2026-06-14T00:00:00Z",
      updated_at: "2026-06-14T00:00:00Z",
      created_by: "socrates_admin",
      last_updated_by: "socrates_admin",
      version: "1.0",
      status: "published" as const,
      tags: ["foundations", "memory"],
      search_keywords: ["testing effect", "retrieval practice", "active recall"],
      version_history: [],
    },
    editorial: { difficulty: "basic" as const, high_yield_score: 10 },
    hierarchy: { ...H, topic: "Active Recall", subtopic: "Testing Effect" },
    content: {
      title: "Active Recall",
      definition:
        "The learning strategy of retrieving information from memory rather than passively re-reading.",
      summary:
        "Active recall strengthens memory traces through retrieval practice. It is the foundation of effective spaced repetition systems.",
    },
    dependency_graph: {
      prerequisites: [],
      unlocks: ["concept_spaced_repetition", "concept_forgetting_curve"],
      child_concepts: [],
      related_concepts: ["concept_concept_maps"],
      semantic_relations: [],
    },
    mastery_config: { threshold: 0.8, decay_rate: "standard" as const, min_questions_correct: 2 },
    media: [],
    references: [],
    linked_content: {
      card_ids: ["card_active_recall_def", "card_active_recall_testing_effect", "card_active_recall_extension"],
      question_ids: ["q_active_recall_generic_01", "q_active_recall_establish_01"],
    },
  },
  {
    id: "concept_forgetting_curve",
    type: "concept" as const,
    metadata: {
      created_at: "2026-06-14T00:00:00Z",
      updated_at: "2026-06-14T00:00:00Z",
      created_by: "socrates_admin",
      last_updated_by: "socrates_admin",
      version: "1.0",
      status: "published" as const,
      tags: ["foundations", "memory"],
      search_keywords: ["ebbinghaus", "forgetting curve", "retention decay"],
      version_history: [],
    },
    editorial: { difficulty: "basic" as const, high_yield_score: 8 },
    hierarchy: { ...H, topic: "Forgetting Curve", subtopic: "Retention Decay" },
    content: {
      title: "The Forgetting Curve",
      definition:
        "Ebbinghaus's model showing memory retention declines exponentially over time without reinforcement.",
      summary:
        "Understanding the forgetting curve motivates spaced repetition: reviews must occur before retention drops below useful thresholds.",
    },
    dependency_graph: {
      prerequisites: ["concept_active_recall"],
      unlocks: ["concept_spaced_repetition"],
      child_concepts: [],
      related_concepts: [],
      semantic_relations: [],
    },
    mastery_config: { threshold: 0.75, decay_rate: "standard" as const, min_questions_correct: 1 },
    media: [],
    references: [],
    linked_content: {
      card_ids: ["card_forgetting_curve_def", "card_forgetting_curve_cloze"],
      question_ids: ["q_forgetting_curve_generic_01"],
    },
  },
  {
    id: "concept_spaced_repetition",
    type: "concept" as const,
    metadata: {
      created_at: "2026-06-14T00:00:00Z",
      updated_at: "2026-06-14T00:00:00Z",
      created_by: "socrates_admin",
      last_updated_by: "socrates_admin",
      version: "1.0",
      status: "published" as const,
      tags: ["scheduling", "core"],
      search_keywords: ["spaced repetition", "SRS", "interval scheduling"],
      version_history: [],
    },
    editorial: { difficulty: "intermediate" as const, high_yield_score: 10 },
    hierarchy: { ...H, topic: "Spaced Repetition", subtopic: "Scheduling" },
    content: {
      title: "Spaced Repetition",
      definition:
        "A scheduling method that increases intervals between reviews as material becomes better learned.",
      summary:
        "Spaced repetition combats the forgetting curve by timing reviews at optimal intervals. Modern systems use algorithms like FSRS to personalize schedules.",
    },
    dependency_graph: {
      prerequisites: ["concept_active_recall", "concept_forgetting_curve"],
      unlocks: ["concept_fsrs", "concept_mastery_certification"],
      child_concepts: [],
      related_concepts: ["concept_concept_maps"],
      semantic_relations: ["concept_concept_maps"],
    },
    mastery_config: { threshold: 0.85, decay_rate: "standard" as const, min_questions_correct: 2 },
    media: [],
    references: [],
    linked_content: {
      card_ids: ["card_spaced_rep_def", "card_spaced_rep_vs_cramming", "card_spaced_rep_cert"],
      question_ids: ["q_spaced_rep_diagnostic_01"],
    },
  },
  {
    id: "concept_fsrs",
    type: "concept" as const,
    metadata: {
      created_at: "2026-06-14T00:00:00Z",
      updated_at: "2026-06-14T00:00:00Z",
      created_by: "socrates_admin",
      last_updated_by: "socrates_admin",
      version: "1.0",
      status: "published" as const,
      tags: ["algorithm", "scheduling"],
      search_keywords: ["FSRS", "stability", "difficulty", "retrievability"],
      version_history: [],
    },
    editorial: { difficulty: "intermediate" as const, high_yield_score: 9 },
    hierarchy: { ...H, topic: "FSRS", subtopic: "Free Spaced Repetition Scheduler" },
    content: {
      title: "FSRS (Free Spaced Repetition Scheduler)",
      definition:
        "A modern spaced repetition algorithm that models memory stability and difficulty to predict optimal review intervals.",
      summary:
        "FSRS uses stability (how long memory lasts) and difficulty (how hard the item is) to schedule reviews. Socrates uses FSRS v6 for card scheduling.",
    },
    dependency_graph: {
      prerequisites: ["concept_spaced_repetition"],
      unlocks: ["concept_mastery_certification"],
      child_concepts: [],
      related_concepts: ["concept_event_sourcing"],
      semantic_relations: [],
    },
    mastery_config: { threshold: 0.8, decay_rate: "slow" as const, min_questions_correct: 3 },
    media: [],
    references: [],
    linked_content: {
      card_ids: [
        "card_fsrs_stability_def",
        "card_fsrs_difficulty_def",
        "card_fsrs_grades",
        "card_fsrs_cloze_interval",
      ],
      question_ids: ["q_fsrs_diagnostic_01", "q_fsrs_targeted_01"],
    },
  },
  {
    id: "concept_concept_maps",
    type: "concept" as const,
    metadata: {
      created_at: "2026-06-14T00:00:00Z",
      updated_at: "2026-06-14T00:00:00Z",
      created_by: "socrates_admin",
      last_updated_by: "socrates_admin",
      version: "1.0",
      status: "published" as const,
      tags: ["structure", "graph"],
      search_keywords: ["concept map", "knowledge graph", "prerequisites"],
      version_history: [],
    },
    editorial: { difficulty: "intermediate" as const, high_yield_score: 8 },
    hierarchy: { ...H, topic: "Concept Maps", subtopic: "Knowledge Graphs" },
    content: {
      title: "Concept Maps",
      definition:
        "A structured representation of knowledge as concepts connected by typed relationships and prerequisites.",
      summary:
        "Socrates treats concept maps as first-class: scheduling, certification, and relationship cards all operate over the concept graph.",
    },
    dependency_graph: {
      prerequisites: ["concept_active_recall"],
      unlocks: [],
      child_concepts: [],
      related_concepts: ["concept_spaced_repetition", "concept_event_sourcing"],
      semantic_relations: ["concept_spaced_repetition"],
    },
    mastery_config: { threshold: 0.75, decay_rate: "standard" as const, min_questions_correct: 1 },
    media: [],
    references: [],
    linked_content: {
      card_ids: ["card_concept_map_def", "card_concept_map_prereq"],
      question_ids: ["q_concept_map_generic_01"],
    },
  },
  {
    id: "concept_event_sourcing",
    type: "concept" as const,
    metadata: {
      created_at: "2026-06-14T00:00:00Z",
      updated_at: "2026-06-14T00:00:00Z",
      created_by: "socrates_admin",
      last_updated_by: "socrates_admin",
      version: "1.0",
      status: "published" as const,
      tags: ["architecture", "socrates"],
      search_keywords: ["event sourcing", "projector", "CQRS", "immutable events"],
      version_history: [],
    },
    editorial: { difficulty: "advanced" as const, high_yield_score: 7 },
    hierarchy: { ...H, topic: "Event Sourcing", subtopic: "Socrates Architecture" },
    content: {
      title: "Event Sourcing in Socrates",
      definition:
        "An architecture where all learning actions are recorded as immutable events, and read models (views) are derived by projectors.",
      summary:
        "When you review a card, Socrates appends a card_reviewed event. Cloud Functions project that into schedule and performance views.",
    },
    dependency_graph: {
      prerequisites: [],
      unlocks: [],
      child_concepts: [],
      related_concepts: ["concept_fsrs", "concept_concept_maps"],
      semantic_relations: [],
    },
    mastery_config: { threshold: 0.7, decay_rate: "fast" as const, min_questions_correct: 2 },
    media: [],
    references: [],
    linked_content: {
      card_ids: ["card_event_sourcing_def", "card_event_sourcing_projector", "card_event_sourcing_idempotent"],
      question_ids: ["q_event_sourcing_diagnostic_01"],
    },
  },
  {
    id: "concept_mastery_certification",
    type: "concept" as const,
    metadata: {
      created_at: "2026-06-14T00:00:00Z",
      updated_at: "2026-06-14T00:00:00Z",
      created_by: "socrates_admin",
      last_updated_by: "socrates_admin",
      version: "1.0",
      status: "published" as const,
      tags: ["certification", "mastery"],
      search_keywords: ["mastery certification", "concept mastery", "suppression"],
      version_history: [],
    },
    editorial: { difficulty: "advanced" as const, high_yield_score: 8 },
    hierarchy: { ...H, topic: "Mastery Certification", subtopic: "Concept Mastery" },
    content: {
      title: "Mastery Certification",
      definition:
        "A structured assessment flow that certifies concept-level mastery and may suppress or accelerate related cards.",
      summary:
        "Certification uses targeted questions across a concept's card set. Outcomes (full, partial, none) affect scheduling policy.",
    },
    dependency_graph: {
      prerequisites: ["concept_spaced_repetition", "concept_fsrs"],
      unlocks: [],
      child_concepts: [],
      related_concepts: [],
      semantic_relations: [],
    },
    mastery_config: { threshold: 0.9, decay_rate: "slow" as const, min_questions_correct: 3 },
    media: [],
    references: [],
    linked_content: {
      card_ids: ["card_certification_def", "card_certification_flow"],
      question_ids: ["q_certification_misconception_01"],
    },
  },
];
