/**
 * Shared fixture for RelationshipCard Golden Master
 * Used across multiple consistency invariant tests
 */

export const validRelationshipCard = {
  id: "card_rel_0001",
  type: "relationship_card",
  _comment:
    "Static, read-only drill/probe to test a specific Relationship edge. Not user-specific.",

  relations: {
    relationship_id: "rel_0001",

    // redundant indexing helpers (must match Relationship endpoints)
    from_concept_id: "concept_0000_arterial_anatomy",
    to_concept_id: "concept_0001_fatty_streak_formation",

    related_question_ids: ["q_rel_0001"]
  },

  config: {
    card_type: "relationship",
    pedagogical_role: "synthesis",
    relationship_probe_type: "directionality",

    activation_policy: {
      requires_mastery_of: [
        "concept_0000_arterial_anatomy",
        "concept_0001_fatty_streak_formation"
      ],
      min_mastery_threshold: 0.7
    }
  },

  content: {
    front:
      "Why must you understand arterial wall anatomy before learning fatty streak formation?",
    back:
      "Because fatty streaks are intimal lesions; without wall-layer context, learners misplace the lesion."
  },

  media: [],

  metadata: {
    created_at: "2025-11-17T00:00:00Z",
    updated_at: "2025-11-17T00:00:00Z",
    created_by: "system_admin",
    status: "published",
    tags: ["relationship", "high-yield"],
    difficulty: "medium"
  }
} as const;

