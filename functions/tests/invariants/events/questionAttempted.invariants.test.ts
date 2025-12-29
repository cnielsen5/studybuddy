const validQuestionAttemptedEvent = {
  ...validUserEvent,
  type: "question_attempted",
  entity: { kind: "question", id: "q_0001" },
  payload: {
    selected_option_id: "opt_B",
    correct: true,
    seconds_spent: 35
  }
};

describe("Event payload invariants — question_attempted", () => {
  it("must have entity.kind === 'question'", () => {
    expect(validQuestionAttemptedEvent.entity.kind).toBe("question");
    expect(validQuestionAttemptedEvent.entity.id.startsWith("q_")).toBe(true);
  });

  it("must include selected_option_id, correct, seconds_spent", () => {
    const p: any = validQuestionAttemptedEvent.payload;

    expect(typeof p.selected_option_id).toBe("string");
    expect(p.selected_option_id.startsWith("opt_")).toBe(true);

    expect(typeof p.correct).toBe("boolean");

    expect(typeof p.seconds_spent).toBe("number");
    expect(p.seconds_spent).toBeGreaterThanOrEqual(0);
  });

  it("must not include question content snapshot", () => {
    const p: any = validQuestionAttemptedEvent.payload;

    expect(p.stem).toBeUndefined();
    expect(p.options).toBeUndefined();
    expect(p.explanations).toBeUndefined();
    expect(p.correct_option_id).toBeUndefined();
  });
});
