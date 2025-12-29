import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";

const validCardReviewedEvent = {
  ...validUserEvent,
  type: "card_reviewed",
  entity: { kind: "card", id: "card_0001" },
  payload: {
    grade: "good", // again | hard | good | easy
    seconds_spent: 18,
    rating_confidence: 2 // optional: 0..3
  }
};

describe("Event payload invariants — card_reviewed", () => {
  it("must have entity.kind === 'card'", () => {
    expect(validCardReviewedEvent.entity.kind).toBe("card");
    expect(validCardReviewedEvent.entity.id.startsWith("card_")).toBe(true);
  });

  it("must include grade and seconds_spent", () => {
    const p: any = validCardReviewedEvent.payload;

    expect(["again", "hard", "good", "easy"]).toContain(p.grade);
    expect(typeof p.seconds_spent).toBe("number");
    expect(p.seconds_spent).toBeGreaterThanOrEqual(0);
  });

  it("rating_confidence, if present, must be 0..3", () => {
    const p: any = validCardReviewedEvent.payload;
    if (p.rating_confidence !== undefined) {
      expect([0, 1, 2, 3]).toContain(p.rating_confidence);
    }
  });

  it("must not include derived schedule/perf inside payload", () => {
    const p: any = validCardReviewedEvent.payload;

    expect(p.due_at).toBeUndefined();
    expect(p.interval_days).toBeUndefined();
    expect(p.stability).toBeUndefined();
    expect(p.accuracy_rate).toBeUndefined();
  });
});
