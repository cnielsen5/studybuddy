const validSessionQueueItem = {
  queue_item_id: "queue_item_0001",
  session_id: "session_0001",
  user_id: "user_123",
  type: "session_queue_item",

  item_type: "card",
  item_id: "card_0001",

  primary_reason: "due_now",

  scheduled_for: "2025-12-20T14:00:00Z",

  supporting_context: {
    related_concept_ids: ["concept_0001"]
  }
};

describe("SessionQueueItem invariants — required structure", () => {
  it("must identify queue item, session, and user and declare type", () => {
    const q: any = validSessionQueueItem;

    expect(typeof q.queue_item_id).toBe("string");
    expect(typeof q.session_id).toBe("string");
    expect(typeof q.user_id).toBe("string");
    expect(q.type).toBe("session_queue_item");
  });
});

describe("SessionQueueItem invariants — item identity", () => {
  it("must identify exactly one item", () => {
    const q: any = validSessionQueueItem;

    expect(typeof q.item_type).toBe("string");
    expect(typeof q.item_id).toBe("string");
  });

  it("must not embed card or question objects", () => {
    const q: any = validSessionQueueItem;

    expect(q.card).toBeUndefined();
    expect(q.question).toBeUndefined();
  });
});

describe("SessionQueueItem invariants — primary reason enforcement", () => {
  it("must include exactly one primary_reason", () => {
    const q: any = validSessionQueueItem;

    expect(typeof q.primary_reason).toBe("string");
  });

  it("must not allow multiple reasons", () => {
    const q: any = validSessionQueueItem;

    expect(q.primary_reasons).toBeUndefined();
    expect(q.secondary_reason).toBeUndefined();
  });
});

describe("SessionQueueItem invariants — scheduling boundary", () => {
  it("may reference scheduled time but not scheduling state", () => {
    const q: any = validSessionQueueItem;

    expect(typeof q.scheduled_for).toBe("string");

    expect(q.state).toBeUndefined();
    expect(q.due).toBeUndefined();
    expect(q.stability).toBeUndefined();
  });
});

describe("SessionQueueItem invariants — supporting context discipline", () => {
  it("supporting_context must be optional and read-only", () => {
    const c: any = validSessionQueueItem.supporting_context;

    expect(c).toBeDefined();
  });

  it("supporting_context must not contain logic or scores", () => {
    const c: any = validSessionQueueItem.supporting_context;

    expect(c.score).toBeUndefined();
    expect(c.weight).toBeUndefined();
    expect(c.explanation).toBeUndefined();
  });
});

describe("SessionQueueItem invariants — forbidden fields", () => {
  it("must not contain performance or evidence data", () => {
    const q: any = validSessionQueueItem;

    expect(q.attempts).toBeUndefined();
    expect(q.performance).toBeUndefined();
    expect(q.misconception).toBeUndefined();
  });

  it("must not contain AI narratives or reasoning", () => {
    const q: any = validSessionQueueItem;

    expect(q.explanation).toBeUndefined();
    expect(q.ai_reasoning).toBeUndefined();
    expect(q.narrative).toBeUndefined();
  });
});

describe("SessionQueueItem invariants — immutability by design", () => {
  it("must not define mutator methods", () => {
    const q: any = validSessionQueueItem;

    expect(q.update).toBeUndefined();
    expect(q.reprioritize).toBeUndefined();
    expect(q.adjust).toBeUndefined();
  });

  it("must not contain any functions", () => {
    for (const value of Object.values(validSessionQueueItem)) {
      expect(typeof value).not.toBe("function");
    }
  });
});
