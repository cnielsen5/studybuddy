export const validMisconceptionEdgeView = {
  type: "misconception_edge_view",
  misconception_id: "mis_edge_001",
  library_id: "lib_abc",
  user_id: "user_123",

  concept_a_id: "concept_attention",
  concept_b_id: "concept_working_memory",
  direction: { from: "concept_attention", to: "concept_working_memory", error_type: "reversal" },

  misconception_type: "directionality",
  strength: 0.63,
  status: "active",

  first_observed_at: "2024-12-02T10:04:00.000Z",
  last_observed_at: "2025-01-14T18:22:00.000Z",

  evidence: {
    relationship_failures: 2,
    high_confidence_errors: 3,
    probe_confirmations: 1
  },

  last_applied: { received_at: "2025-12-29T12:34:57.000Z", event_id: "evt_01JHXYZ..." },
  updated_at: "2025-12-29T12:34:57.000Z"
} as const;
