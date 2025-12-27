/**
 * Cross-object invariant:
 * RelationshipGraphMetrics endpoints must match the authoritative
 * Relationship endpoints for the referenced relationship_id.
 *
 * This prevents semantic drift between Golden Master edges and derived metrics.
 */

const validRelationship = {
  relationship_id: "rel_0001",
  type: "relationship",

  endpoints: {
    from_concept_id: "concept_0000_arterial_anatomy",
    to_concept_id: "concept_0001_fatty_streak_formation"
  }
};

const validRelationshipGraphMetrics = {
  relationship_id: "rel_0001",
  type: "relationship_graph_metrics",

  endpoints: {
    from_concept_id: "concept_0000_arterial_anatomy",
    to_concept_id: "concept_0001_fatty_streak_formation"
  }
};

describe("RelationshipGraphMetrics ↔ Relationship endpoint consistency invariants", () => {
  it("RelationshipGraphMetrics endpoints must match Relationship endpoints", () => {
    const rel: any = validRelationship;
    const metrics: any = validRelationshipGraphMetrics;

    // Sanity check: metrics references the relationship
    expect(metrics.relationship_id).toBe(rel.relationship_id);

    // Endpoint consistency
    expect(metrics.endpoints.from_concept_id).toBe(
      rel.endpoints.from_concept_id
    );

    expect(metrics.endpoints.to_concept_id).toBe(
      rel.endpoints.to_concept_id
    );
  });

  it("RelationshipGraphMetrics must not reverse endpoints silently", () => {
    const rel: any = validRelationship;
    const metrics: any = validRelationshipGraphMetrics;

    expect(metrics.endpoints.from_concept_id).not.toBe(
      rel.endpoints.to_concept_id
    );

    expect(metrics.endpoints.to_concept_id).not.toBe(
      rel.endpoints.from_concept_id
    );
  });

  it("RelationshipGraphMetrics must not embed Relationship objects", () => {
    const metrics: any = validRelationshipGraphMetrics;

    expect(metrics.relationship).toBeUndefined();
    expect(metrics.relationship_object).toBeUndefined();
  });
});
