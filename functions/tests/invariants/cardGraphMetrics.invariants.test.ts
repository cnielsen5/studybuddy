/**
 * CardGraphMetrics invariants
 * Purpose: Freeze the derived, regenerable graph/embedding-based metrics for cards.
 * Must be: global (not user-specific), numeric/structural, recomputable, and non-decision-making.
 */

const validCardGraphMetrics = {
  card_id: "card_0001",
  type: "card_graph_metrics",
  _comment: "Derived, regenerable metrics computed from embeddings and graph context. Not user-specific.",

  graph_context: {
    library_id: "step1_usmle",
    graph_version: "2025-11-18",
    computed_at: "2025-11-18T03:10:00Z"
  },

  semantic_embedding: [-0.012, 0.331, -0.221, 0.045, 0.608, -0.091],

  semantic_neighbors: [
    { card_id: "card_0002", similarity: 0.82 },
    { card_id: "card_0047", similarity: 0.78 }
  ],

  structure: {
    concept_degree: 2,
    hierarchy_depth: 3,
    is_leaf: false
  },

  similarity: {
    cluster_id: "cluster_athero_early",
    redundancy_risk: "low"
  },

  cognitive_load: {
    pedagogical_weight: 1.5,
    estimated_seconds: 12
  },

  status: {
    valid: true,
    deprecated: false
  }
};

describe("CardGraphMetrics invariants — identity", () => {
  it("must identify a card and declare type", () => {
    const m: any = validCardGraphMetrics;

    expect(typeof m.card_id).toBe("string");
    expect(m.type).toBe("card_graph_metrics");
  });
});

describe("CardGraphMetrics invariants — graph context provenance", () => {
  it("must include graph_context with required provenance fields", () => {
    const gc: any = validCardGraphMetrics.graph_context;

    expect(gc).toBeDefined();
    expect(typeof gc.library_id).toBe("string");
    expect(typeof gc.graph_version).toBe("string");
    expect(typeof gc.computed_at).toBe("string");
  });

  it("must not store user-specific context in graph_context", () => {
    const gc: any = validCardGraphMetrics.graph_context;

    expect(gc.user_id).toBeUndefined();
    expect(gc.session_id).toBeUndefined();
  });
});

describe("CardGraphMetrics invariants — semantic embedding", () => {
  it("must include a non-empty numeric semantic_embedding array", () => {
    const emb: any = validCardGraphMetrics.semantic_embedding;

    expect(Array.isArray(emb)).toBe(true);
    expect(emb.length).toBeGreaterThan(0);
    for (const v of emb) {
      expect(typeof v).toBe("number");
    }
  });
});

describe("CardGraphMetrics invariants — semantic neighbors", () => {
  it("may include semantic_neighbors as references only", () => {
    const n: any = validCardGraphMetrics.semantic_neighbors;

    expect(Array.isArray(n)).toBe(true);
    for (const neighbor of n) {
      expect(typeof neighbor.card_id).toBe("string");
      expect(typeof neighbor.similarity).toBe("number");
      expect(neighbor.similarity).toBeGreaterThanOrEqual(0);
      expect(neighbor.similarity).toBeLessThanOrEqual(1);

      // Must not embed other objects
      expect((neighbor as any).card).toBeUndefined();
      expect((neighbor as any).content).toBeUndefined();
    }
  });

  it("must not contain decision fields in semantic_neighbors", () => {
    const n: any = validCardGraphMetrics.semantic_neighbors;

    for (const neighbor of n) {
      expect(neighbor.priority).toBeUndefined();
      expect(neighbor.action).toBeUndefined();
      expect(neighbor.bury).toBeUndefined();
      expect(neighbor.delay_days).toBeUndefined();
    }
  });
});

describe("CardGraphMetrics invariants — structural position", () => {
  it("must include structure metrics with numeric/boolean values", () => {
    const s: any = validCardGraphMetrics.structure;

    expect(s).toBeDefined();
    expect(typeof s.concept_degree).toBe("number");
    expect(typeof s.hierarchy_depth).toBe("number");
    expect(typeof s.is_leaf).toBe("boolean");
  });

  it("must not include scheduling or performance data inside structure", () => {
    const s: any = validCardGraphMetrics.structure;

    expect(s.due).toBeUndefined();
    expect(s.stability).toBeUndefined();
    expect(s.avg_seconds).toBeUndefined();
  });
});

describe("CardGraphMetrics invariants — similarity indicators", () => {
  it("may include similarity signals without prescribing actions", () => {
    const s: any = validCardGraphMetrics.similarity;

    expect(s).toBeDefined();
    expect(typeof s.cluster_id).toBe("string");
    expect(["low", "medium", "high"]).toContain(s.redundancy_risk);
  });

  it("must not encode queue actions in similarity", () => {
    const s: any = validCardGraphMetrics.similarity;

    expect(s.bury).toBeUndefined();
    expect(s.unlock).toBeUndefined();
    expect(s.delay_days).toBeUndefined();
    expect(s.priority).toBeUndefined();
  });
});

describe("CardGraphMetrics invariants — cognitive load", () => {
  it("may include derived cognitive load estimates (global, not user-specific)", () => {
    const c: any = validCardGraphMetrics.cognitive_load;

    expect(c).toBeDefined();
    expect(typeof c.pedagogical_weight).toBe("number");
    expect(typeof c.estimated_seconds).toBe("number");
  });

  it("must not store user timing or attempt-derived metrics in cognitive_load", () => {
    const c: any = validCardGraphMetrics.cognitive_load;

    expect(c.my_avg_seconds).toBeUndefined();
    expect(c.avg_seconds).toBeUndefined();
    expect(c.sample_count).toBeUndefined();
  });
});

describe("CardGraphMetrics invariants — status flags", () => {
  it("must include status.valid and status.deprecated as booleans", () => {
    const s: any = validCardGraphMetrics.status;

    expect(s).toBeDefined();
    expect(typeof s.valid).toBe("boolean");
    expect(typeof s.deprecated).toBe("boolean");
  });
});

describe("CardGraphMetrics invariants — forbidden cross-domain fields", () => {
  it("must not contain user, scheduling, performance, evidence, or AI narrative fields", () => {
    const m: any = validCardGraphMetrics;

    // user/session identifiers
    expect(m.user_id).toBeUndefined();
    expect(m.session_id).toBeUndefined();

    // scheduling
    expect(m.state).toBeUndefined();
    expect(m.due).toBeUndefined();
    expect(m.stability).toBeUndefined();
    expect(m.difficulty).toBeUndefined();

    // performance aggregates
    expect(m.my_avg_seconds).toBeUndefined();
    expect(m.avg_seconds).toBeUndefined();
    expect(m.accuracy_rate).toBeUndefined();
    expect(m.streak).toBeUndefined();

    // evidence/attempts
    expect(m.attempt_ids).toBeUndefined();
    expect(m.attempts).toBeUndefined();

    // AI narratives / explanations
    expect(m.explanation).toBeUndefined();
    expect(m.ai_reasoning).toBeUndefined();
    expect(m.narrative).toBeUndefined();
  });
});

describe("CardGraphMetrics invariants — immutability by design", () => {
  it("must not define mutator methods", () => {
    const m: any = validCardGraphMetrics;

    expect(m.update).toBeUndefined();
    expect(m.recompute).toBeUndefined();
    expect(m.mutate).toBeUndefined();
  });

  it("must not contain any functions", () => {
    for (const value of Object.values(validCardGraphMetrics)) {
      expect(typeof value).not.toBe("function");
    }
  });
});
