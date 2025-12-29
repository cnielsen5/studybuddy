/**
 * Cross-object invariants:
 * RelationshipCard must be consistent with the authoritative Relationship it references.
 *
 * Enforces:
 *  - relationship_id linkage
 *  - endpoint consistency (from/to)
 *  - compatibility constraints between Relationship relation fields and RelationshipCard probe type
 */

import { validRelationship } from "../fixtures/relationship.fixture.ts";
import { validRelationshipCard } from "../fixtures/relationshipCard.fixture.ts";

describe("RelationshipCard ↔ Relationship consistency invariants", () => {
  it("RelationshipCard must reference an authoritative Relationship", () => {
    const rel: any = validRelationship;
    const card: any = validRelationshipCard;

    expect(card.relations.relationship_id).toBe(rel.relationship_id);
  });

  it("RelationshipCard endpoints must match Relationship endpoints", () => {
    const rel: any = validRelationship;
    const card: any = validRelationshipCard;

    expect(card.relations.from_concept_id).toBe(rel.endpoints.from_concept_id);
    expect(card.relations.to_concept_id).toBe(rel.endpoints.to_concept_id);
  });

  it("RelationshipCard must not reverse endpoints silently", () => {
    const rel: any = validRelationship;
    const card: any = validRelationshipCard;

    expect(card.relations.from_concept_id).not.toBe(rel.endpoints.to_concept_id);
    expect(card.relations.to_concept_id).not.toBe(rel.endpoints.from_concept_id);
  });
});

describe("RelationshipCard ↔ Relationship compatibility invariants", () => {
  it("relationship_probe_type must be compatible with relationship directionality", () => {
    const rel: any = validRelationship;
    const card: any = validRelationshipCard;

    const probe: string = card.config.relationship_probe_type;
    const direction: string = rel.relation.directionality;

    // Compatibility rules:
    // - "directionality" probes require a directed (forward) relationship.
    // - If the relationship is bidirectional, "directionality" is nonsensical.
    if (probe === "directionality") {
      expect(direction).toBe("forward");
    }
  });

  it("relationship_probe_type must be compatible with relationship_type (minimal constraints)", () => {
    const rel: any = validRelationship;
    const card: any = validRelationshipCard;

    const probe: string = card.config.relationship_probe_type;
    const relType: string = rel.relation.relationship_type;

    // Minimal compatibility matrix:
    // - prerequisite_reasoning only makes sense for prerequisite/unlocks
    if (probe === "prerequisite_reasoning") {
      expect(["prerequisite", "unlocks"]).toContain(relType);
    }

    // - causality probes only make sense for causes
    if (probe === "causality") {
      expect(relType).toBe("causes");
    }

    // - contrast probes only make sense for contrasts
    if (probe === "contrast") {
      expect(relType).toBe("contrasts");
    }

    // - scope probes are broadly applicable, no restriction enforced here
    // - directionality handled in prior test
  });

  it("RelationshipCard must not embed Relationship objects", () => {
    const card: any = validRelationshipCard;

    expect(card.relationship).toBeUndefined();
    expect(card.relationship_object).toBeUndefined();
  });
});
