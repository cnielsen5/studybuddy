/**
 * Cross-object invariant:
 * RelationshipGraphMetrics edge_topology fields must match the authoritative
 * Relationship relation fields for the referenced relationship_id.
 *
 * Enforces: edge_type and directionality consistency across Golden Master edge and derived metrics.
 */

import { validRelationship } from "../../fixtures/relationship.fixture";
import { validRelationshipGraphMetrics } from "../../fixtures/relationshipGraphMetrics.fixture";

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
