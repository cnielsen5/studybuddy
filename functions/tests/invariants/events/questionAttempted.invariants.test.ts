import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";
import { expectIdPrefix, ID_PREFIXES } from "../../helpers/ids.ts";
import {
  expectEventImmutability,
  expectNoPayloadAggregates
} from "../../helpers/invariantHelpers.ts";

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
    expectIdPrefix(validQuestionAttemptedEvent.entity.id, ID_PREFIXES.QUESTION, "QuestionAttemptedEvent.entity.id");
  });

  it("must include selected_option_id, correct, seconds_spent", () => {
    const p: any = validQuestionAttemptedEvent.payload;

    expect(typeof p.selected_option_id).toBe("string");
    expectIdPrefix(p.selected_option_id, ID_PREFIXES.OPTION, "QuestionAttemptedEvent.payload.selected_option_id");

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

  it("must not contain mutation-indicating fields", () => {
    expectEventImmutability(validQuestionAttemptedEvent, "QuestionAttemptedEvent");
  });

  it("must not contain aggregate fields in payload", () => {
    expectNoPayloadAggregates(validQuestionAttemptedEvent.payload, "QuestionAttemptedEvent.payload");
  });
});
