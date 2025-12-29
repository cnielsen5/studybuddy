import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";
import { expectIdPrefix, ID_PREFIXES } from "../../helpers/ids.ts";
import {
  expectEventImmutability,
  expectNoPayloadAggregates
} from "../../helpers/invariantHelpers.ts";

const validRelationshipReviewedEvent = {
  ...validUserEvent,
  type: "relationship_reviewed",
  entity: { kind: "relationship_card", id: "card_rel_0001" },
  payload: {
    concept_a_id: "concept_attention",
    concept_b_id: "concept_working_memory",
    direction: { from: "concept_attention", to: "concept_working_memory" },
    correct: false,
    high_confidence: true,
    seconds_spent: 22
  }
};

describe("Event payload invariants — relationship_reviewed", () => {
  it("must have entity.kind === 'relationship_card'", () => {
    expect(validRelationshipReviewedEvent.entity.kind).toBe("relationship_card");
    expectIdPrefix(validRelationshipReviewedEvent.entity.id, ID_PREFIXES.RELATIONSHIP_CARD, "RelationshipReviewedEvent.entity.id");
  });

  it("must include concept endpoints and direction between them", () => {
    const p: any = validRelationshipReviewedEvent.payload;

    expect(typeof p.concept_a_id).toBe("string");
    expect(typeof p.concept_b_id).toBe("string");
    expect(p.concept_a_id).not.toBe(p.concept_b_id);

    expect(p.direction).toBeDefined();
    expect(typeof p.direction.from).toBe("string");
    expect(typeof p.direction.to).toBe("string");

    const endpoints = new Set([p.concept_a_id, p.concept_b_id]);
    expect(endpoints.has(p.direction.from)).toBe(true);
    expect(endpoints.has(p.direction.to)).toBe(true);
    expect(p.direction.from).not.toBe(p.direction.to);
  });

  it("must include correct/high_confidence/seconds_spent", () => {
    const p: any = validRelationshipReviewedEvent.payload;

    expect(typeof p.correct).toBe("boolean");
    expect(typeof p.high_confidence).toBe("boolean");
    expect(typeof p.seconds_spent).toBe("number");
    expect(p.seconds_spent).toBeGreaterThanOrEqual(0);
  });

  it("must not include misconception strength updates directly", () => {
    const p: any = validRelationshipReviewedEvent.payload;

    expect(p.misconception_id).toBeUndefined();
    expect(p.strength).toBeUndefined();
    expect(p.status).toBeUndefined();
  });

  it("must not contain mutation-indicating fields", () => {
    expectEventImmutability(validRelationshipReviewedEvent, "RelationshipReviewedEvent");
  });

  it("must not contain aggregate fields in payload", () => {
    expectNoPayloadAggregates(validRelationshipReviewedEvent.payload, "RelationshipReviewedEvent.payload");
  });
});
