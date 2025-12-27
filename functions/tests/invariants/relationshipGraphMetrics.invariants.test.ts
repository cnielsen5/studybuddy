const validRelationshipGraphMetrics = {
  relationship_id: "rel_0001",

  traversal_weight: 0.7,
  activation_frequency: 12
};

describe("RelationshipGraphMetrics invariants — structure", () => {
  it("must identify relationship", () => {
    expect(typeof validRelationshipGraphMetrics.relationship_id).toBe("string");
  });
});

describe("RelationshipGraphMetrics invariants — numeric only", () => {
  it("must contain only numeric metrics", () => {
    for (const [k, v] of Object.entries(validRelationshipGraphMetrics)) {
      if (k !== "relationship_id") {
        expect(typeof v).toBe("number");
      }
    }
  });
});

describe("RelationshipGraphMetrics invariants — forbidden fields", () => {
  it("must not contain scheduling, performance, or explanations", () => {
    const m: any = validRelationshipGraphMetrics;

    expect(m.state).toBeUndefined();
    expect(m.due).toBeUndefined();
    expect(m.explanation).toBeUndefined();
  });
});
