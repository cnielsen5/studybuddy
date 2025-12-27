/**
 * Cross-object invariant:
 * RelationshipGraphMetrics edge_topology fields must match the authoritative
 * Relationship relation fields for the referenced relationship_id.
 *
 * Enforces: edge_type and directionality consistency across Golden Master edge and derived metrics.
 */

const validRelationship = {
  relationship_id: "rel_0001",
  type: "relationship",

  relation: {
    relationship_type: "prerequisite",
    directionality: "forward"
  }
};

const validRelationshipGraphMetrics = {
  relationship_id: "rel_0001",
  type: "relationship_graph_metrics",

  edge_topology: {
    edge_type: "prerequisite",
    directionality: "forward",
    from_node_degree: 6,
    to_node_degree: 8,
    bridge_score: 0.12
  }
};

describe("RelationshipGraphMetrics ↔ Relationship relation consistency invariants", () => {
  it("edge_topology.edge_type must match relationship.relation.relationship_type", () => {
    const rel: any = validRelationship;
    const metrics: any = validRelationshipGraphMetrics;

    // Sanity check: metrics references the relationship
    expect(metrics.relationship_id).toBe(rel.relationship_id);

    expect(metrics.edge_topology.edge_type).toBe(rel.relation.relationship_type);
  });

  it("edge_topology.directionality must match relationship.relation.directionality", () => {
    const rel: any = validRelationship;
    const metrics: any = validRelationshipGraphMetrics;

    expect(metrics.edge_topology.directionality).toBe(rel.relation.directionality);
  });

  it("must not allow edge_topology to drift into decision fields", () => {
    const t: any = validRelationshipGraphMetrics.edge_topology;

    expect(t.priority).toBeUndefined();
    expect(t.bury).toBeUndefined();
    expect(t.delay_days).toBeUndefined();
  });

  it("must not embed Relationship objects", () => {
    const metrics: any = validRelationshipGraphMetrics;

    expect(metrics.relationship).toBeUndefined();
    expect(metrics.relationship_object).toBeUndefined();
  });
});
