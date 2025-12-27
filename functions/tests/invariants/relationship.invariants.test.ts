const validRelationship = {
  relationship_id: "rel_0001",

  from_id: "concept_0001",
  to_id: "concept_0002",

  type: "prerequisite",
  direction: "forward"
};

describe("Relationship invariants — structure", () => {
  it("must identify source and target", () => {
    const r: any = validRelationship;

    expect(typeof r.from_id).toBe("string");
    expect(typeof r.to_id).toBe("string");
  });
});

describe("Relationship invariants — type discipline", () => {
  it("must use a constrained relationship type", () => {
    const allowed = [
      "prerequisite",
      "reinforces",
      "contrasts",
      "causes",
      "associated_with"
    ];

    expect(allowed).toContain(validRelationship.type);
  });
});

describe("Relationship invariants — direction discipline", () => {
  it("must declare direction explicitly", () => {
    expect(["forward", "bidirectional"]).toContain(
      validRelationship.direction
    );
  });
});

describe("Relationship invariants — forbidden fields", () => {
  it("must not contain scheduling or performance data", () => {
    const r: any = validRelationship;

    expect(r.state).toBeUndefined();
    expect(r.reps).toBeUndefined();
    expect(r.confidence).toBeUndefined();
  });
});
