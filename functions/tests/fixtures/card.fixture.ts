/**
 * Shared fixtures for Card Golden Master objects
 * Used across invariant tests
 */

/**
 * Basic card fixture (standard card with no cloze data)
 */
export const validCard = {
  id: "card_0001",
  type: "card",

  relations: {
    concept_id: "concept_0001",
    related_question_ids: ["q_0001"]
  },

  config: {
    card_type: "basic",
    pedagogical_role: "recall"
  },

  content: {
    front: "What is the earliest lesion in atherosclerosis?",
    back: "Fatty streak formed by lipid-laden macrophages.",
    cloze_data: null
  },

  media: [],

  metadata: {
    created_at: "2025-11-03T00:00:00Z",
    updated_at: "2025-11-03T00:00:00Z",
    created_by: "system_admin",
    status: "published",
    version: "1.0"
  },

  editorial: {
    tags: ["pathology"],
    difficulty: "easy"
  }
} as const;

/**
 * Basic card variant (alternative structure for testing)
 */
export const validBasicCard = {
  id: "card_basic_0001",
  type: "card",
  relations: {
    concept_id: "concept_0001",
    related_question_ids: ["q_0001"]
  },
  config: {
    card_type: "basic",
    pedagogical_role: "recall"
  },
  content: {
    front: "What is the earliest lesion in atherosclerosis?",
    back: "Fatty streak.",
    cloze_data: null
  },
  media: [],
  editorial: {
    difficulty: "easy",
    tags: ["pathology"]
  },
  metadata: {
    created_at: "2025-11-03T00:00:00Z",
    updated_at: "2025-11-03T00:00:00Z",
    created_by: "system_admin",
    status: "published",
    version: "1.0"
  }
} as const;

/**
 * Cloze card fixture (card with cloze deletion data)
 */
export const validClozeCard = {
  id: "card_cloze_0001",
  type: "card",
  relations: {
    concept_id: "concept_0001",
    related_question_ids: ["q_0001"]
  },
  config: {
    card_type: "cloze",
    pedagogical_role: "recall"
  },
  content: {
    front: "Fill in the blank.",
    back: "Fatty streak.",
    cloze_data: {
      template_text:
        "The earliest lesion of atherosclerosis is the [[cloze_1]], formed by [[cloze_1b]].",
      cloze_fields: [
        {
          field_id: "cloze_1",
          answer: "Fatty streak",
          hint: "Name of the lesion"
        },
        {
          field_id: "cloze_1b",
          link_to: "cloze_1"
        }
      ]
    }
  },
  media: [],
  editorial: {
    difficulty: "easy",
    tags: ["pathology"]
  },
  metadata: {
    created_at: "2025-11-03T00:00:00Z",
    updated_at: "2025-11-03T00:00:00Z",
    created_by: "system_admin",
    status: "published",
    version: "1.0"
  }
} as const;

