/**
 * Cross-object invariant:
 * RelationshipCard endpoint concept IDs must match the authoritative
 * Relationship endpoints for the referenced relationship_id.
 *
 * This prevents semantic drift between graph edges and probes.
 */

const validRelationship = {
  relationship_id: "rel_0001",
  type: "relationship",

  endpoints: {
    from_concept_id: "concept_0000_arterial_anatomy",
    to_concept_id: "concept_0001_fatty_streak_formation"
  }
};

const validRelationshipCard = {
  id: "card_rel_0001",
  type: "relationship_card",

  relations: {
    relationship_id: "rel_0001",
    from_concept_id: "concept_0000_arterial_anatomy",
    to_concept_id: "concept_0001_fatty_streak_formation"
  }
};

describe("RelationshipCard ↔ Relationship endpoint consistency invariants", () => {
  it("RelationshipCard endpoints must match Relationship endpoints", () => {
    const rel: any = validRelationship;
    const card: any = validRelationshipCard;

    // Sanity check: card references the relationship
    expect(card.relations.relationship_id).toBe(rel.relationship_id);

    // Endpoint consistency
    expect(card.relations.from_concept_id).toBe(
      rel.endpoints.from_concept_id
    );

    expect(card.relations.to_concept_id).toBe(
      rel.endpoints.to_concept_id
    );
  });

  it("RelationshipCard must not reverse endpoints silently", () => {
    const rel: any = validRelationship;
    const card: any = validRelationshipCard;

    expect(card.relations.from_concept_id).not.toBe(
      rel.endpoints.to_concept_id
    );

    expect(card.relations.to_concept_id).not.toBe(
      rel.endpoints.from_concept_id
    );
  });
});
