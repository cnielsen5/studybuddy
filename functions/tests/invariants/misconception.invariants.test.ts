/**
 * MisconceptionEdge invariants
 * Purpose: User-specific misconception about a directed relation between two concepts.
 * Must be: user-scoped, edge-scoped, evidence-linked (IDs only), no scheduler/perf aggregates, no free-text AI narrative.
 */

const validMisconceptionEdge = {
  misconception_id: "mis_edge_001",
  type: "misconception_edge",

  user_id: "user_123",

  // two endpoints
  concept_a_id: "concept_working_memory",
  concept_b_id: "concept_attention",

  // directed misconception about the relation
  direction: {
    from: "concept_attention",
    to: "concept_working_memory",
    error_type: "reversal" // reversal | inversion | swapped_endpoints (choose your enum)
  },

  misconception_type: "directionality", // directionality | scope | causality | category | mechanism

  strength: 0.63,

  evidence: {
    question_failures: 4,
    relationship_card_failures: 2,
    high_confidence_errors: 3,
    ai_probe_confirmations: 1
  },

  evidence_refs: {
    question_attempt_ids: ["attempt_991", "attempt_882"],
    card_ids: ["card_441", "card_782"],
    ai_probe_ids: ["probe_102"]
  },

  first_observed_at: "2024-12-02T10:04:00Z",
  last_observed_at: "2025-01-14T18:22:00Z",

  status: "active" // active | weakening | resolved
};

describe("MisconceptionEdge invariants — identity", () => {
  it("must identify misconception edge and user; must declare type", () => {
    const m: any = validMisconceptionEdge;

    expect(typeof m.misconception_id).toBe("string");
    expect(m.type).toBe("misconception_edge");
    expect(typeof m.user_id).toBe("string");
  });
});

describe("MisconceptionEdge invariants — endpoints", () => {
  it("must reference exactly two concept endpoints", () => {
    const m: any = validMisconceptionEdge;

    expect(typeof m.concept_a_id).toBe("string");
    expect(typeof m.concept_b_id).toBe("string");
    expect(m.concept_a_id).not.toBe(m.concept_b_id);
  });

  it("must not use concept_ids array (edge has explicit endpoints)", () => {
    const m: any = validMisconceptionEdge;
    expect(m.concept_ids).toBeUndefined();
  });
});

describe("MisconceptionEdge invariants — direction structure", () => {
  it("direction.from and direction.to must be one of the two endpoints", () => {
    const m: any = validMisconceptionEdge;
    const d: any = m.direction;

    expect(d).toBeDefined();
    expect(typeof d.from).toBe("string");
    expect(typeof d.to).toBe("string");

    const endpoints = new Set([m.concept_a_id, m.concept_b_id]);
    expect(endpoints.has(d.from)).toBe(true);
    expect(endpoints.has(d.to)).toBe(true);
    expect(d.from).not.toBe(d.to);
  });

  it("must use constrained error_type enum", () => {
    const d: any = validMisconceptionEdge.direction;
    expect(["reversal", "inversion", "swapped_endpoints"]).toContain(d.error_type);
  });
});

describe("MisconceptionEdge invariants — misconception_type discipline", () => {
  it("must use a constrained misconception_type enum", () => {
    const allowed = ["directionality", "scope", "causality", "category", "mechanism"];
    expect(allowed).toContain(validMisconceptionEdge.misconception_type);
  });

  it("must not allow multiple types", () => {
    const m: any = validMisconceptionEdge;
    expect(m.types).toBeUndefined();
    expect(m.secondary_type).toBeUndefined();
  });
});

describe("MisconceptionEdge invariants — strength bounds", () => {
  it("must include numeric strength between 0 and 1", () => {
    const s = validMisconceptionEdge.strength;
    expect(typeof s).toBe("number");
    expect(s).toBeGreaterThanOrEqual(0);
    expect(s).toBeLessThanOrEqual(1);
  });

  it("must not use confidence field name (use strength)", () => {
    const m: any = validMisconceptionEdge;
    expect(m.confidence).toBeUndefined();
  });
});

describe("MisconceptionEdge invariants — evidence counts", () => {
  it("evidence counts must be non-negative numbers", () => {
    const e: any = validMisconceptionEdge.evidence;

    expect(e).toBeDefined();
    for (const key of [
      "question_failures",
      "relationship_card_failures",
      "high_confidence_errors",
      "ai_probe_confirmations"
    ]) {
      expect(typeof e[key]).toBe("number");
      expect(e[key]).toBeGreaterThanOrEqual(0);
    }
  });

  it("must not embed attempt/card/probe objects in evidence", () => {
    const e: any = validMisconceptionEdge.evidence;
    expect(e.attempts).toBeUndefined();
    expect(e.cards).toBeUndefined();
    expect(e.probes).toBeUndefined();
  });
});

describe("MisconceptionEdge invariants — evidence refs", () => {
  it("must reference evidence by ID only", () => {
    const r: any = validMisconceptionEdge.evidence_refs;

    expect(r).toBeDefined();
    expect(Array.isArray(r.question_attempt_ids)).toBe(true);
    expect(Array.isArray(r.card_ids)).toBe(true);
    expect(Array.isArray(r.ai_probe_ids)).toBe(true);

    for (const id of r.question_attempt_ids) expect(typeof id).toBe("string");
    for (const id of r.card_ids) expect(typeof id).toBe("string");
    for (const id of r.ai_probe_ids) expect(typeof id).toBe("string");
  });

  it("must not embed attempts/cards/probes", () => {
    const m: any = validMisconceptionEdge;
    expect(m.attempts).toBeUndefined();
    expect(m.cards).toBeUndefined();
    expect(m.probes).toBeUndefined();
  });
});

describe("MisconceptionEdge invariants — timestamps and status", () => {
  it("must include first_observed_at and last_observed_at timestamps", () => {
    const m: any = validMisconceptionEdge;

    expect(typeof m.first_observed_at).toBe("string");
    expect(typeof m.last_observed_at).toBe("string");
  });

  it("must declare status enum", () => {
    const status = validMisconceptionEdge.status;
    expect(["active", "weakening", "resolved"]).toContain(status);
  });
});

describe("MisconceptionEdge invariants — forbidden fields", () => {
  it("must not contain scheduling or mastery state", () => {
    const m: any = validMisconceptionEdge;

    expect(m.state).toBeUndefined();
    expect(m.due).toBeUndefined();
    expect(m.stability).toBeUndefined();
    expect(m.mastery).toBeUndefined();
  });

  it("must not contain performance aggregates", () => {
    const m: any = validMisconceptionEdge;

    expect(m.accuracy_rate).toBeUndefined();
    expect(m.avg_seconds).toBeUndefined();
    expect(m.total_attempts).toBeUndefined();
  });

  it("must not contain free-text AI reasoning or narrative", () => {
    const m: any = validMisconceptionEdge;

    expect(m.explanation).toBeUndefined();
    expect(m.ai_reasoning).toBeUndefined();
    expect(m.narrative).toBeUndefined();
  });
});

describe("MisconceptionEdge invariants — immutability by design", () => {
  it("must not define mutator methods", () => {
    const m: any = validMisconceptionEdge;

    expect(m.update).toBeUndefined();
    expect(m.resolve).toBeUndefined();
    expect(m.relabel).toBeUndefined();
  });

  it("must not contain any functions (top-level)", () => {
    for (const value of Object.values(validMisconceptionEdge)) {
      expect(typeof value).not.toBe("function");
    }
  });
});
