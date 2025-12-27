/**
 * QuestionGraphMetrics invariants
 * Purpose: Freeze derived, regenerable analytics for a question.
 * Must be: global (not user-specific), derived (not Golden Master), recomputable, provenance-tracked via graph_context.
 */

const validQuestionGraphMetrics = {
  question_id: "q_0001",
  type: "question_graph_metrics",
  _comment: "Derived, regenerable semantic and structural analytics.",

  graph_context: {
    library_id: "step1_usmle",
    graph_version: "2025-11-18",
    computed_at: "2025-11-18T03:30:00Z"
  },

  // Direct embedding (not centroid/provenance object)
  semantic_embedding: [0.091, -0.204, 0.412, 0.038, -0.115, 0.622],

  concept_alignment: [
    { concept_id: "concept_0001", weight: 0.78 },
    { concept_id: "concept_0099_pharmacology", weight: 0.42 }
  ],

  complexity: {
    estimated_seconds: 35,
    cognitive_load_score: 2.1
  },

  status: {
    valid: true,
    deprecated: false
  }
};

describe("QuestionGraphMetrics invariants — identity", () => {
  it("must identify a question and declare type", () => {
    const m: any = validQuestionGraphMetrics;

    expect(typeof m.question_id).toBe("string");
    expect(m.type).toBe("question_graph_metrics");
  });
});

describe("QuestionGraphMetrics invariants — graph context provenance", () => {
  it("must include graph_context with required provenance fields", () => {
    const gc: any = validQuestionGraphMetrics.graph_context;

    expect(gc).toBeDefined();
    expect(typeof gc.library_id).toBe("string");
    expect(typeof gc.graph_version).toBe("string");
    expect(typeof gc.computed_at).toBe("string");
  });

  it("graph_context must not include user/session context", () => {
    const gc: any = validQuestionGraphMetrics.graph_context;

    expect(gc.user_id).toBeUndefined();
    expect(gc.session_id).toBeUndefined();
  });
});

describe("QuestionGraphMetrics invariants — semantic_embedding (direct vector)", () => {
  it("must include semantic_embedding as a numeric vector (number[])", () => {
    const emb: any = validQuestionGraphMetrics.semantic_embedding;

    expect(Array.isArray(emb)).toBe(true);
    expect(emb.length).toBeGreaterThan(0);

    for (const v of emb) {
      expect(typeof v).toBe("number");
    }
  });

  it("must not include centroid/provenance shape", () => {
    const emb: any = validQuestionGraphMetrics.semantic_embedding;

    // if someone mistakenly converts embedding into an object, catch it
    expect((emb as any).kind).toBeUndefined();
    expect((emb as any).vector).toBeUndefined();
    expect((emb as any).computed_from).toBeUndefined();
  });
});

describe("QuestionGraphMetrics invariants — concept alignment", () => {
  it("must include concept_alignment as list of {concept_id, weight}", () => {
    const a: any[] = validQuestionGraphMetrics.concept_alignment;

    expect(Array.isArray(a)).toBe(true);
    expect(a.length).toBeGreaterThanOrEqual(1);

    for (const row of a) {
      expect(typeof row.concept_id).toBe("string");
      expect(typeof row.weight).toBe("number");
      expect(row.weight).toBeGreaterThanOrEqual(0);
      expect(row.weight).toBeLessThanOrEqual(1);
    }
  });

  it("must not embed concept objects or add scheduler directives", () => {
    const a: any[] = validQuestionGraphMetrics.concept_alignment;

    for (const row of a) {
      expect(row.concept).toBeUndefined();
      expect(row.priority).toBeUndefined();
      expect(row.bury).toBeUndefined();
    }
  });
});

describe("QuestionGraphMetrics invariants — complexity", () => {
  it("must include complexity with numeric fields", () => {
    const c: any = validQuestionGraphMetrics.complexity;

    expect(c).toBeDefined();
    expect(typeof c.estimated_seconds).toBe("number");
    expect(c.estimated_seconds).toBeGreaterThanOrEqual(0);

    expect(typeof c.cognitive_load_score).toBe("number");
    expect(c.cognitive_load_score).toBeGreaterThanOrEqual(0);
  });

  it("must not include performance or user timing aggregates", () => {
    const c: any = validQuestionGraphMetrics.complexity;

    expect(c.avg_seconds).toBeUndefined();
    expect(c.my_avg_seconds).toBeUndefined();
    expect(c.accuracy_rate).toBeUndefined();
  });
});

describe("QuestionGraphMetrics invariants — status flags", () => {
  it("must include status.valid and status.deprecated as booleans", () => {
    const s: any = validQuestionGraphMetrics.status;

    expect(s).toBeDefined();
    expect(typeof s.valid).toBe("boolean");
    expect(typeof s.deprecated).toBe("boolean");
  });
});

describe("QuestionGraphMetrics invariants — forbidden cross-domain fields", () => {
  it("must not contain user, scheduling, mastery, attempts, performance, or AI narrative fields", () => {
    const m: any = validQuestionGraphMetrics;

    // user/session
    expect(m.user_id).toBeUndefined();
    expect(m.session_id).toBeUndefined();

    // scheduling/mastery
    expect(m.due).toBeUndefined();
    expect(m.stability).toBeUndefined();
    expect(m.mastery).toBeUndefined();
    expect(m.state).toBeUndefined();

    // attempts/performance
    expect(m.attempt_ids).toBeUndefined();
    expect(m.attempts).toBeUndefined();
    expect(m.accuracy_rate).toBeUndefined();
    expect(m.avg_seconds).toBeUndefined();
    expect(m.my_avg_seconds).toBeUndefined();

    // AI narrative
    expect(m.explanation).toBeUndefined();
    expect(m.ai_reasoning).toBeUndefined();
    expect(m.narrative).toBeUndefined();
  });
});

describe("QuestionGraphMetrics invariants — immutability by design", () => {
  it("must not define mutator methods", () => {
    const m: any = validQuestionGraphMetrics;

    expect(m.update).toBeUndefined();
    expect(m.recompute).toBeUndefined();
    expect(m.mutate).toBeUndefined();
  });

  it("must not contain any functions (top-level)", () => {
    for (const value of Object.values(validQuestionGraphMetrics)) {
      expect(typeof value).not.toBe("function");
    }
  });
});
