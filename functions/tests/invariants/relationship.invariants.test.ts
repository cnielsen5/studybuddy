/**
 * Relationship invariants
 * Golden Master edge: declarative structural claim between two concept nodes.
 */

import { validRelationship } from "../fixtures/relationship.fixture.ts";

describe("Relationship invariants — identity", () => {
  it("must declare relationship_id and type", () => {
    const r: any = validRelationship;

    expect(typeof r.relationship_id).toBe("string");
    expect(r.type).toBe("relationship");
  });
});

describe("Relationship invariants — endpoints", () => {
  it("must have endpoints with two distinct concept IDs", () => {
    const e: any = validRelationship.endpoints;

    expect(typeof e.from_concept_id).toBe("string");
    expect(typeof e.to_concept_id).toBe("string");
    expect(e.from_concept_id).not.toBe(e.to_concept_id);
  });

  it("must not embed concept objects", () => {
    const r: any = validRelationship;

    expect(r.from_concept).toBeUndefined();
    expect(r.to_concept).toBeUndefined();
    expect((r.endpoints as any).from_concept).toBeUndefined();
    expect((r.endpoints as any).to_concept).toBeUndefined();
  });
});

describe("Relationship invariants — relation enums", () => {
  it("must use a constrained relationship_type enum", () => {
    const allowed = [
      "prerequisite",
      "unlocks",
      "reinforces",
      "contrasts",
      "causes",
      "associated_with"
    ];

    expect(allowed).toContain(validRelationship.relation.relationship_type);
  });

  it("must use a constrained directionality enum", () => {
    expect(["forward", "bidirectional"]).toContain(
      validRelationship.relation.directionality
    );
  });
});

describe("Relationship invariants — metadata governance", () => {
  it("must include metadata with version history", () => {
    const m: any = validRelationship.metadata;

    expect(m).toBeDefined();
    expect(typeof m.version).toBe("string");
    expect(Array.isArray(m.version_history)).toBe(true);
  });

  it("must not contain user state in metadata", () => {
    const m: any = validRelationship.metadata;

    expect(m.user_id).toBeUndefined();
    expect(m.mastery).toBeUndefined();
  });
});

describe("Relationship invariants — linked content discipline", () => {
  it("linked_content must be ID references only", () => {
    const l: any = validRelationship.linked_content;

    expect(Array.isArray(l.relationship_card_ids)).toBe(true);
    expect(Array.isArray(l.question_ids)).toBe(true);
  });

  it("must not embed cards or questions", () => {
    const r: any = validRelationship;

    expect(r.cards).toBeUndefined();
    expect(r.questions).toBeUndefined();
  });
});

describe("Relationship invariants — forbidden cross-domain fields", () => {
  it("must not contain scheduling, performance, attempts, or AI narratives", () => {
    const r: any = validRelationship;

    // scheduling / mastery
    expect(r.state).toBeUndefined();
    expect(r.due).toBeUndefined();
    expect(r.stability).toBeUndefined();
    expect(r.mastery).toBeUndefined();

    // performance aggregates
    expect(r.accuracy_rate).toBeUndefined();
    expect(r.avg_seconds).toBeUndefined();
    expect(r.my_avg_seconds).toBeUndefined();

    // attempts/evidence
    expect(r.attempt_ids).toBeUndefined();
    expect(r.attempts).toBeUndefined();

    // AI narratives
    expect(r.explanation).toBeUndefined();
    expect(r.ai_reasoning).toBeUndefined();
    expect(r.narrative).toBeUndefined();
  });
});

describe("Relationship invariants — immutability by design", () => {
  it("must not define mutator methods", () => {
    const r: any = validRelationship;

    expect(r.update).toBeUndefined();
    expect(r.recompute).toBeUndefined();
    expect(r.mutate).toBeUndefined();
  });

  it("must not contain any functions", () => {
    for (const value of Object.values(validRelationship)) {
      expect(typeof value).not.toBe("function");
    }
  });
});
