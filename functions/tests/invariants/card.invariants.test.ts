const validCard = {
  id: "card_0001",
  type: "card",

  relations: {
    concept_id: "concept_0001",
    related_questions: ["q_0001"]
  },

  config: {
    card_type: "basic",
    pedagogical_role: "recall"
  },

  content: {
    front: "What is the earliest lesion in atherosclerosis?",
    back: "Fatty streak formed by lipid-laden macrophages.",

    cloze_data: null
  },

  media: [],

  metadata: {
    created_at: "2025-11-03T00:00:00Z",
    updated_at: "2025-11-03T00:00:00Z",
    created_by: "system_admin",
    status: "published",
    tags: ["pathology"],
    difficulty: "easy"
  }
};

describe("Card invariants — required structure", () => {
  it("must contain all top-level sections", () => {
    const c: any = validCard;

    expect(c.id).toBeDefined();
    expect(c.type).toBe("card");
    expect(c.relations).toBeDefined();
    expect(c.config).toBeDefined();
    expect(c.content).toBeDefined();
    expect(c.metadata).toBeDefined();
  });
});

describe("Card invariants — relations", () => {
  it("must belong to exactly one concept", () => {
    const r: any = validCard.relations;

    expect(typeof r.concept_id).toBe("string");
  });

  it("must not embed concept objects", () => {
    const r: any = validCard.relations;

    expect(r.concept).toBeUndefined();
    expect(r.concepts).toBeUndefined();
  });
});

describe("Card invariants — config", () => {
  it("must declare a valid card_type", () => {
    const type = validCard.config.card_type;
    expect(["basic", "cloze", "image_occlusion"]).toContain(type);
  });

  it("must declare a pedagogical_role", () => {
    const role = validCard.config.pedagogical_role;
    expect(["recognition", "recall", "synthesis"]).toContain(role);
  });

  it("must not contain scheduling directives", () => {
    const cfg: any = validCard.config;

    expect(cfg.due).toBeUndefined();
    expect(cfg.interval).toBeUndefined();
    expect(cfg.priority).toBeUndefined();
  });
});

describe("Card invariants — content", () => {
  it("must define front and back", () => {
    const c: any = validCard.content;

    expect(typeof c.front).toBe("string");
    expect(typeof c.back).toBe("string");
  });

  it("must not embed logic or functions", () => {
    for (const value of Object.values(validCard.content)) {
      expect(typeof value).not.toBe("function");
    }
  });
});

describe("Card invariants — forbidden runtime state", () => {
  it("must not contain scheduling state", () => {
    const c: any = validCard;

    expect(c.state).toBeUndefined();
    expect(c.due).toBeUndefined();
    expect(c.stability).toBeUndefined();
    expect(c.difficulty).toBeUndefined();
  });

  it("must not contain performance metrics", () => {
    const c: any = validCard;

    expect(c.reps).toBeUndefined();
    expect(c.lapses).toBeUndefined();
    expect(c.avg_seconds).toBeUndefined();
    expect(c.my_avg_seconds).toBeUndefined();
  });

  it("must not contain attempt history", () => {
    const c: any = validCard;

    expect(c.attempts).toBeUndefined();
    expect(c.history).toBeUndefined();
  });
});

describe("Card invariants — metadata discipline", () => {
  it("metadata must not contain scheduling or performance data", () => {
    const m: any = validCard.metadata;

    expect(m.state).toBeUndefined();
    expect(m.due).toBeUndefined();
    expect(m.reps).toBeUndefined();
  });
});

describe("Card invariants — immutability by design", () => {
  it("must not define mutator methods", () => {
    const c: any = validCard;

    expect(c.update).toBeUndefined();
    expect(c.setContent).toBeUndefined();
    expect(c.mutate).toBeUndefined();
  });

  it("must not contain any functions at top level", () => {
    for (const value of Object.values(validCard)) {
      expect(typeof value).not.toBe("function");
    }
  });
});
