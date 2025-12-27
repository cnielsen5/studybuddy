/**
 * RelationshipCard invariants
 * Golden Master probe: a card that tests exactly one Relationship edge.
 * Uses generic CardScheduleState / CardPerformanceMetrics externally (no schedule/performance here).
 */

const validRelationshipCard = {
  id: "card_rel_0001",
  type: "relationship_card",
  _comment:
    "Static, read-only drill/probe to test a specific Relationship edge. Not user-specific.",

  relations: {
    relationship_id: "rel_0001",

    // redundant indexing helpers (must match Relationship endpoints)
    from_concept_id: "concept_0000_arterial_anatomy",
    to_concept_id: "concept_0001_fatty_streak_formation",

    related_question_ids: ["q_rel_0001"]
  },

  config: {
    card_type: "relationship",
    pedagogical_role: "synthesis",
    relationship_probe_type: "directionality",

    activation_policy: {
      requires_mastery_of: [
        "concept_0000_arterial_anatomy",
        "concept_0001_fatty_streak_formation"
      ],
      min_mastery_threshold: 0.7
    }
  },

  content: {
    front:
      "Why must you understand arterial wall anatomy before learning fatty streak formation?",
    back:
      "Because fatty streaks are intimal lesions; without wall-layer context, learners misplace the lesion."
  },

  media: [],

  metadata: {
    created_at: "2025-11-17T00:00:00Z",
    updated_at: "2025-11-17T00:00:00Z",
    created_by: "system_admin",
    status: "published",
    tags: ["relationship", "high-yield"],
    difficulty: "medium"
  }
};

describe("RelationshipCard invariants — identity", () => {
  it("must declare id and type", () => {
    const c: any = validRelationshipCard;

    expect(typeof c.id).toBe("string");
    expect(c.type).toBe("relationship_card");
  });
});

describe("RelationshipCard invariants — relationship linkage", () => {
  it("must reference exactly one relationship_id", () => {
    const r: any = validRelationshipCard.relations;

    expect(typeof r.relationship_id).toBe("string");
    expect(r.relationship_ids).toBeUndefined();
  });

  it("must include two distinct endpoint concept IDs (redundant index fields)", () => {
    const r: any = validRelationshipCard.relations;

    expect(typeof r.from_concept_id).toBe("string");
    expect(typeof r.to_concept_id).toBe("string");
    expect(r.from_concept_id).not.toBe(r.to_concept_id);
  });

  it("must not embed Relationship or Concept objects", () => {
    const c: any = validRelationshipCard;

    expect(c.relationship).toBeUndefined();
    expect(c.concepts).toBeUndefined();
    expect((c.relations as any).from_concept).toBeUndefined();
    expect((c.relations as any).to_concept).toBeUndefined();
  });
});

describe("RelationshipCard invariants — config discipline", () => {
  it("must declare card_type='relationship'", () => {
    expect(validRelationshipCard.config.card_type).toBe("relationship");
  });

  it("must use constrained pedagogical_role", () => {
    expect(["recognition", "recall", "synthesis"]).toContain(
      validRelationshipCard.config.pedagogical_role
    );
  });

  it("must use constrained relationship_probe_type", () => {
    const allowed = [
      "directionality",
      "causality",
      "contrast",
      "prerequisite_reasoning",
      "scope"
    ];
    expect(allowed).toContain(validRelationshipCard.config.relationship_probe_type);
  });

  it("activation_policy, if present, must be declarative and numeric", () => {
    const p: any = validRelationshipCard.config.activation_policy;

    if (p !== undefined) {
      expect(Array.isArray(p.requires_mastery_of)).toBe(true);
      expect(typeof p.min_mastery_threshold).toBe("number");
      expect(p.min_mastery_threshold).toBeGreaterThanOrEqual(0);
      expect(p.min_mastery_threshold).toBeLessThanOrEqual(1);
    }
  });
});

describe("RelationshipCard invariants — content", () => {
  it("must include front and back strings", () => {
    const content: any = validRelationshipCard.content;
    expect(typeof content.front).toBe("string");
    expect(typeof content.back).toBe("string");
  });

  it("must not include scheduling/performance/attempts in content", () => {
    const content: any = validRelationshipCard.content;

    expect(content.due).toBeUndefined();
    expect(content.reps).toBeUndefined();
    expect(content.attempts).toBeUndefined();
  });
});

describe("RelationshipCard invariants — forbidden cross-domain fields", () => {
  it("must not contain scheduling, performance, attempts, or AI narratives", () => {
    const c: any = validRelationshipCard;

    // scheduling
    expect(c.state).toBeUndefined();
    expect(c.due).toBeUndefined();
    expect(c.stability).toBeUndefined();
    expect(c.difficulty).toBeUndefined();

    // performance
    expect(c.avg_seconds).toBeUndefined();
    expect(c.my_avg_seconds).toBeUndefined();
    expect(c.accuracy_rate).toBeUndefined();

    // evidence/attempt history
    expect(c.attempts).toBeUndefined();
    expect(c.history).toBeUndefined();

    // AI narratives
    expect(c.explanation).toBeUndefined();
    expect(c.ai_reasoning).toBeUndefined();
    expect(c.narrative).toBeUndefined();
  });
});

describe("RelationshipCard invariants — immutability by design", () => {
  it("must not define mutator methods", () => {
    const c: any = validRelationshipCard;

    expect(c.update).toBeUndefined();
    expect(c.setContent).toBeUndefined();
    expect(c.mutate).toBeUndefined();
  });

  it("must not contain any functions", () => {
    for (const value of Object.values(validRelationshipCard)) {
      expect(typeof value).not.toBe("function");
    }
  });
});
