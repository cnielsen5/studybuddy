/**
 * Cross-object invariant:
 * RelationshipGraphMetrics endpoints must match the authoritative
 * Relationship endpoints for the referenced relationship_id.
 *
 * This prevents semantic drift between Golden Master edges and derived metrics.
 */

import { validRelationship } from "../fixtures/relationship.fixture.ts";
import { validRelationshipGraphMetrics } from "../fixtures/relationshipGraphMetrics.fixture.ts";

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
