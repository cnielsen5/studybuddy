const validPrimaryReason = {
  primary_reason: "due_now"
};

describe("PrimaryReason invariants — required structure", () => {
  it("must define a primary_reason field", () => {
    expect(validPrimaryReason.primary_reason).toBeDefined();
  });
});

describe("PrimaryReason invariants — enum discipline", () => {
  it("must be one of the allowed enum values", () => {
    const allowed = [
      "due_now",
      "overdue",
      "new_unlock",
      "weak_concept",
      "misconception_detected",
      "relationship_reinforcement",
      "cram_priority"
    ];

    expect(allowed).toContain(validPrimaryReason.primary_reason);
  });

  it("must not allow multiple reasons", () => {
    const r: any = validPrimaryReason;

    expect(r.primary_reasons).toBeUndefined();
    expect(r.reasons).toBeUndefined();
    expect(r.secondary_reason).toBeUndefined();
  });
});

describe("PrimaryReason invariants — explainability boundary", () => {
  it("must not include narrative explanation", () => {
    const r: any = validPrimaryReason;

    expect(r.explanation).toBeUndefined();
    expect(r.narrative).toBeUndefined();
    expect(r.ai_reasoning).toBeUndefined();
  });

  it("must not include scores or weights", () => {
    const r: any = validPrimaryReason;

    expect(r.weight).toBeUndefined();
    expect(r.score).toBeUndefined();
    expect(r.confidence).toBeUndefined();
  });
});

describe("PrimaryReason invariants — immutability by design", () => {
  it("must not define mutator methods", () => {
    const r: any = validPrimaryReason;

    expect(r.update).toBeUndefined();
    expect(r.set).toBeUndefined();
    expect(r.override).toBeUndefined();
  });

  it("must not contain any functions", () => {
    for (const value of Object.values(validPrimaryReason)) {
      expect(typeof value).not.toBe("function");
    }
  });
});

