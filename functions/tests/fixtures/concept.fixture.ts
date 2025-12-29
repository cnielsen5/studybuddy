/**
 * Shared fixture for Concept Golden Master
 * Used across invariant tests
 * 
 * Note: This fixture includes fields that may not be in the TypeScript interface
 * but are present in the actual test data structure (e.g., search_keywords,
 * version_history, semantic_relations, media, references, editorial section).
 * The test data represents the desired structure being validated.
 * 
 * Note: The test expects version to be a string ("1.1"), though the interface
 * may define it as a number. The fixture matches the test expectations.
 */

export const validConcept = {
  id: "concept_0001",
  type: "concept",

  metadata: {
    created_at: "2025-11-03T00:00:00Z",
    updated_at: "2025-11-17T12:00:00Z",
    created_by: "system_admin",
    last_updated_by: "system_admin",
    version: "1.1", // Test expects string, matching the invariant test structure
    status: "published",
    tags: ["pathology"],
    search_keywords: ["fatty streak"],
    version_history: []
  },

  editorial: {
    difficulty: "basic",
    high_yield_score: 9
  },

  hierarchy: {
    library_id: "step1_usmle",
    domain: "Pathology",
    category: "Cardiovascular",
    subcategory: "Atherosclerosis",
    topic: "Pathogenesis",
    subtopic: "Early Lesions"
  },

  content: {
    title: "Fatty streak formation",
    definition: "Earliest lesion of atherosclerosis",
    summary: "Initial reversible lesion"
  },

  dependency_graph: {
    prerequisites: [],
    unlocks: [],
    child_concepts: [],
    related_concepts: [],
    semantic_relations: []
  },

  mastery_config: {
    threshold: 0.8,
    decay_rate: "standard",
    min_questions_correct: 1
  },

  media: [],
  references: [],
  linked_content: {
    card_ids: [],
    question_ids: []
  }
} as const;

