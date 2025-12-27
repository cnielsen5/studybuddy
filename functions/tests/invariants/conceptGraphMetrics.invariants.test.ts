/**
 * ConceptGraphMetrics invariants
 * Purpose: Freeze the derived, regenerable graph analytics for a concept.
 * Must be: global (not user-specific), derived (not Golden Master), recomputable, provenance-tracked.
 */

const validConceptGraphMetrics = {
  concept_id: "concept_0001",
  type: "concept_graph_metrics",
  _comment:
    "Derived, regenerable graph analytics for a concept. Not user-specific. Not a Golden Master.",

  graph_context: {
    library_id: "step1_usmle",
    graph_version: "2025-11-17",
    computed_at: "2025-11-18T02:45:00Z"
  },

  semantic_embedding: {
    "kind": "centroid",
    "vector": [0.021, -0.113, 0.487, 0.092, -0.334, 0.118],
    "computed_from": {
      "card_count": 42,
      "card_id_sample": ["card_001", "card_002"]
    }
  },

  degrees: {
    structural_degree: 3,
    semantic_degree: 7,
    combined_degree: 5.2
  },

  centrality: {
    betweenness: 0.031,
    pagerank: 0.0047
  },

  similarity_config: {
    semantic_similarity_threshold: 0.75,
    alpha: 0.3
  },

  status: {
    valid: true,
    deprecated: false
  }
};

describe("ConceptGraphMetrics invariants — identity", () => {
  it("must identify a concept and declare type", () => {
    const m: any = validConceptGraphMetrics;

    expect(typeof m.concept_id).toBe("string");
    expect(m.type).toBe("concept_graph_metrics");
  });
});

describe("ConceptGraphMetrics invariants — graph context provenance", () => {
  it("must include graph_context with required provenance fields", () => {
    const gc: any = validConceptGraphMetrics.graph_context;

    expect(gc).toBeDefined();
    expect(typeof gc.library_id).toBe("string");
    expect(typeof gc.graph_version).toBe("string");
    expect(typeof gc.computed_at).toBe("string");
  });

  it("graph_context must not include user/session context", () => {
    const gc: any = validConceptGraphMetrics.graph_context;

    expect(gc.user_id).toBeUndefined();
    expect(gc.session_id).toBeUndefined();
  });
});

describe("ConceptGraphMetrics invariants — semantic embedding (centroid)", () => {
  it("must include a centroid semantic_embedding with numeric vector", () => {
    const emb: any = validConceptGraphMetrics.semantic_embedding;

    expect(emb).toBeDefined();
    expect(emb.kind).toBe("centroid");

    expect(Array.isArray(emb.vector)).toBe(true);
    expect(emb.vector.length).toBeGreaterThan(0);
    for (const v of emb.vector) {
      expect(typeof v).toBe("number");
    }
  });

  it("must record centroid provenance (computed_from.card_count)", () => {
    const emb: any = validConceptGraphMetrics.semantic_embedding;

    expect(emb.computed_from).toBeDefined();
    expect(typeof emb.computed_from.card_count).toBe("number");
    expect(emb.computed_from.card_count).toBeGreaterThanOrEqual(0);
  });

  it("must not embed cards or include user-specific provenance", () => {
    const emb: any = validConceptGraphMetrics.semantic_embedding;

    // do not embed card objects
    expect(emb.computed_from.cards).toBeUndefined();
    expect(emb.computed_from.card_objects).toBeUndefined();

    // no user/session
    expect(emb.user_id).toBeUndefined();
    expect(emb.session_id).toBeUndefined();
  });
});


describe("ConceptGraphMetrics invariants — degrees", () => {
  it("must include degrees with structural, semantic, and combined values", () => {
    const d: any = validConceptGraphMetrics.degrees;

    expect(d).toBeDefined();
    expect(typeof d.structural_degree).toBe("number");
    expect(typeof d.semantic_degree).toBe("number");
    expect(typeof d.combined_degree).toBe("number");
  });

  it("must not encode decisions or actions inside degrees", () => {
    const d: any = validConceptGraphMetrics.degrees;

    expect(d.priority).toBeUndefined();
    expect(d.bury).toBeUndefined();
    expect(d.delay_days).toBeUndefined();
  });
});

describe("ConceptGraphMetrics invariants — centrality (optional, numeric)", () => {
  it("may include centrality; if present, must be numeric", () => {
    const c: any = validConceptGraphMetrics.centrality;

    if (c !== undefined) {
      if (c.betweenness !== undefined) expect(typeof c.betweenness).toBe("number");
      if (c.pagerank !== undefined) expect(typeof c.pagerank).toBe("number");
    }
  });

  it("centrality must not include user/session fields", () => {
    const c: any = validConceptGraphMetrics.centrality;

    if (c !== undefined) {
      expect(c.user_id).toBeUndefined();
      expect(c.session_id).toBeUndefined();
    }
  });
});

describe("ConceptGraphMetrics invariants — similarity config", () => {
  it("must include similarity_config with numeric threshold and alpha", () => {
    const s: any = validConceptGraphMetrics.similarity_config;

    expect(s).toBeDefined();
    expect(typeof s.semantic_similarity_threshold).toBe("number");
    expect(s.semantic_similarity_threshold).toBeGreaterThanOrEqual(0);
    expect(s.semantic_similarity_threshold).toBeLessThanOrEqual(1);

    expect(typeof s.alpha).toBe("number");
    expect(s.alpha).toBeGreaterThanOrEqual(0);
    expect(s.alpha).toBeLessThanOrEqual(1);
  });

  it("must not include scheduler or queue directives in similarity_config", () => {
    const s: any = validConceptGraphMetrics.similarity_config;

    expect(s.priority).toBeUndefined();
    expect(s.bury).toBeUndefined();
    expect(s.unlock).toBeUndefined();
  });
});

describe("ConceptGraphMetrics invariants — status flags", () => {
  it("must include status.valid and status.deprecated as booleans", () => {
    const s: any = validConceptGraphMetrics.status;

    expect(s).toBeDefined();
    expect(typeof s.valid).toBe("boolean");
    expect(typeof s.deprecated).toBe("boolean");
  });
});

describe("ConceptGraphMetrics invariants — forbidden cross-domain fields", () => {
  it("must not contain user, scheduling, performance, evidence, or AI narrative fields", () => {
    const m: any = validConceptGraphMetrics;

    // user/session identifiers
    expect(m.user_id).toBeUndefined();
    expect(m.session_id).toBeUndefined();

    // scheduling / mastery
    expect(m.state).toBeUndefined();
    expect(m.due).toBeUndefined();
    expect(m.stability).toBeUndefined();
    expect(m.mastery).toBeUndefined();

    // performance aggregates
    expect(m.my_avg_seconds).toBeUndefined();
    expect(m.avg_seconds).toBeUndefined();
    expect(m.accuracy_rate).toBeUndefined();

    // evidence/attempts
    expect(m.attempt_ids).toBeUndefined();
    expect(m.attempts).toBeUndefined();

    // AI narratives / explanations
    expect(m.explanation).toBeUndefined();
    expect(m.ai_reasoning).toBeUndefined();
    expect(m.narrative).toBeUndefined();
  });
});

describe("ConceptGraphMetrics invariants — immutability by design", () => {
  it("must not define mutator methods", () => {
    const m: any = validConceptGraphMetrics;

    expect(m.update).toBeUndefined();
    expect(m.recompute).toBeUndefined();
    expect(m.mutate).toBeUndefined();
  });

  it("must not contain any functions", () => {
    for (const value of Object.values(validConceptGraphMetrics)) {
      expect(typeof value).not.toBe("function");
    }
  });
});
