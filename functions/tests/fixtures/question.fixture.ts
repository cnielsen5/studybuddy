/**
 * Shared fixture for Question Golden Master
 * Used across invariant tests
 */

export const validQuestion = {
  id: "q_0001",
  type: "question",

  relations: {
    concept_ids: ["concept_0001", "concept_0099_pharmacology"],
    related_card_ids: ["card_0001"]
  },

  source: {
    origin: "validated", // public | validated | ai_generated
    provider: "Step1_Internal",
    subscription_required: false
  },

  classification: {
    question_type: "mcq", // mcq | select_all | matching
    usage_role: "generic", // generic | diagnostic | establishment | targeted | misconception_directed
    cognitive_level: "diagnosis" // pathophysiology | diagnosis | management | mechanism
  },

  content: {
    stem: "A 15-year-old boy's autopsy reveals lipid-laden macrophages...",
    options: [
      { id: "opt_A", text: "Fibrous cap formation" },
      { id: "opt_B", text: "Fatty streak" }
    ],
    correct_option_id: "opt_B"
  },

  explanations: {
    general: "Fatty streaks are the earliest visible lesions...",
    distractors: {
      opt_A: "Fibrous caps appear later..."
    }
  },

  editorial: {
    difficulty: "easy",
    tags: ["pathology", "cardio"]
  },

  media: [],
  references: [],

  metadata: {
    created_at: "2025-11-03T00:00:00Z",
    updated_at: "2025-11-03T00:00:00Z",
    created_by: "system_admin",
    last_updated_by: "system_admin",
    version: "1.0",
    status: "published"
  }
} as const;

