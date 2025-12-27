const validCardGraphMetrics = {
  card_id: "card_0001",

  concept_distance: 0,
  sibling_card_count: 3,

  graph_centrality: 0.62
};

describe("CardGraphMetrics invariants — structure", () => {
  it("must identify a card", () => {
    expect(typeof validCardGraphMetrics.card_id).toBe("string");
  });
});

describe("CardGraphMetrics invariants — numeric metrics", () => {
  it("must contain only numeric metrics", () => {
    for (const [k, v] of Object.entries(validCardGraphMetrics)) {
      if (k !== "card_id") {
        expect(typeof v).toBe("number");
      }
    }
  });
});

describe("CardGraphMetrics invariants — forbidden fields", () => {
  it("must not contain scheduling, performance, or attempts", () => {
    const m: any = validCardGraphMetrics;

    expect(m.state).toBeUndefined();
    expect(m.due).toBeUndefined();
    expect(m.reps).toBeUndefined();
    expect(m.attempts).toBeUndefined();
  });
});
