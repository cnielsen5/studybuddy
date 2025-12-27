const validConceptGraphMetrics = {
  concept_id: "concept_0001",

  structural_degrees: {
    in_degree: 2,
    out_degree: 1
  },

  semantic_degrees: {
    similarity_links: 5
  },

  combined_degrees: {
    total_connections: 8
  }
};

describe("ConceptGraphMetrics invariants — structure", () => {
  it("must identify a concept", () => {
    expect(typeof validConceptGraphMetrics.concept_id).toBe("string");
  });
});

describe("ConceptGraphMetrics invariants — degree groups", () => {
  it("must contain structural, semantic, and combined degrees", () => {
    const m: any = validConceptGraphMetrics;

    expect(m.structural_degrees).toBeDefined();
    expect(m.semantic_degrees).toBeDefined();
    expect(m.combined_degrees).toBeDefined();
  });
});

describe("ConceptGraphMetrics invariants — numeric only", () => {
  it("all degree values must be numeric", () => {
    const m: any = validConceptGraphMetrics;

    for (const group of Object.values(m)) {
      if (typeof group === "object") {
        for (const v of Object.values(group as any)) {
          expect(typeof v).toBe("number");
        }
      }
    }
  });
});

describe("ConceptGraphMetrics invariants — forbidden fields", () => {
  it("must not contain user, mastery, or scheduling data", () => {
    const m: any = validConceptGraphMetrics;

    expect(m.user_id).toBeUndefined();
    expect(m.mastery).toBeUndefined();
    expect(m.state).toBeUndefined();
    expect(m.due).toBeUndefined();
  });
});
