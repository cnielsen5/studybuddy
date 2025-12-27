/**
 * Relationship invariants
 * Golden Master edge: declarative structural claim between two concept nodes.
 */

const validRelationship = {
  relationship_id: "rel_0001",
  type: "relationship",
  _comment:
    "Static, read-only graph edge (Golden Master). Structural claim about how two nodes relate. Not user-specific.",

  metadata: {
    created_at: "2025-11-17T00:00:00Z",
    updated_at: "2025-11-17T00:00:00Z",
    created_by: "system_admin",
    last_updated_by: "system_admin",
    version: "1.0",
    status: "published",
    tags: ["cardio", "pathology"],
    version_history: [
      {
        version: "1.0",
        change_type: "structural",
        changes: "Initial relationship creation",
        date: "2025-11-17T00:00:00Z"
      }
    ]
  },

  graph_context: {
    library_id: "step1_usmle",
    domain: "Pathology",
    category: "Cardiovascular",
    subcategory: "Atherosclerosis"
  },

  endpoints: {
    from_concept_id: "concept_0000_arterial_anatomy",
    to_concept_id: "concept_0001_fatty_streak_formation"
  },

  relation: {
    relationship_type: "prerequisite",
    directionality: "forward"
  },

  editorial: {
    importance: "high",
    notes: "Understanding arterial wall layers is required before intimal lesions make sense."
  },

  linked_content: {
    relationship_card_ids: ["card_rel_0001"],
    question_ids: ["q_rel_0001"]
  }
};

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
