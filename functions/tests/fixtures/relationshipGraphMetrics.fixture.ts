/**
 * Shared fixture for RelationshipGraphMetrics
 * Used across multiple consistency invariant tests
 */

export const validRelationshipGraphMetrics = {
  relationship_id: "rel_0001",
  type: "relationship_graph_metrics",
  _comment:
    "Derived, regenerable graph analytics for a relationship edge. Not user-specific. Not a Golden Master.",

  graph_context: {
    library_id: "step1_usmle",
    graph_version: "2025-11-18",
    computed_at: "2025-11-18T03:25:00Z"
  },

  embedding: {
    kind: "endpoint_mean",
    vector: [0.014, -0.062, 0.391, 0.081, -0.298, 0.095]
  },

  endpoints: {
    from_concept_id: "concept_0000_arterial_anatomy",
    to_concept_id: "concept_0001_fatty_streak_formation"
  },

  edge_topology: {
    edge_type: "prerequisite",
    directionality: "forward",
    from_node_degree: 6,
    to_node_degree: 8,
    bridge_score: 0.12
  },

  semantic_neighbors: [
    { relationship_id: "rel_0042", similarity: 0.79 },
    { relationship_id: "rel_0188", similarity: 0.74 }
  ],

  status: {
    valid: true,
    deprecated: false
  }
} as const;

