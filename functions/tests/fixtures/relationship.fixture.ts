/**
 * Shared fixture for Relationship Golden Master
 * Used across multiple consistency invariant tests
 */

export const validRelationship = {
  relationship_id: "rel_0001",
  type: "relationship",
  _comment:
    "Static, read-only graph edge (Golden Master). Structural claim about how two nodes relate. Not user-specific.",

  metadata: {
    created_at: "2025-11-17T00:00:00Z",
    updated_at: "2025-11-17T00:00:00Z",
    created_by: "system_admin",
    last_updated_by: "system_admin",
    version: "1.0",
    status: "published",
    tags: ["cardio", "pathology"],
    version_history: [
      {
        version: "1.0",
        change_type: "structural",
        changes: "Initial relationship creation",
        date: "2025-11-17T00:00:00Z"
      }
    ]
  },

  graph_context: {
    library_id: "step1_usmle",
    domain: "Pathology",
    category: "Cardiovascular",
    subcategory: "Atherosclerosis"
  },

  endpoints: {
    from_concept_id: "concept_0000_arterial_anatomy",
    to_concept_id: "concept_0001_fatty_streak_formation"
  },

  relation: {
    relationship_type: "prerequisite",
    directionality: "forward"
  },

  editorial: {
    importance: "high",
    notes: "Understanding arterial wall layers is required before intimal lesions make sense."
  },

  linked_content: {
    relationship_card_ids: ["card_rel_0001"],
    question_ids: ["q_rel_0001"]
  }
} as const;

