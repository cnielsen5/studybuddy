/**
 * Cross-object integration invariants
 * Purpose: Ensure QuestionAttempt is compatible with Question Golden Master
 * without importing or embedding Question objects.
 */

import { validQuestionAttempt } from "../fixtures/questionAttempt.fixture.ts";
import { expectIdPrefix, ID_PREFIXES } from "../helpers/ids.ts";

describe("QuestionAttempt ↔ Question integration invariants", () => {
  it("question_id must follow Question ID naming convention", () => {
    const a: any = validQuestionAttempt;
    expect(typeof a.question_id).toBe("string");
    expectIdPrefix(a.question_id, ID_PREFIXES.QUESTION, "QuestionAttempt.question_id");
  });

  it("attempt_id must follow attempt ID naming convention", () => {
    const a: any = validQuestionAttempt;
    expect(typeof a.attempt_id).toBe("string");
    expectIdPrefix(a.attempt_id, ID_PREFIXES.ATTEMPT, "QuestionAttempt.attempt_id");
  });

  it("selected_option_id must follow Question option ID naming convention", () => {
    const r: any = validQuestionAttempt.response;
    expect(typeof r.selected_option_id).toBe("string");
    expectIdPrefix(r.selected_option_id, ID_PREFIXES.OPTION, "QuestionAttempt.response.selected_option_id");
  });

  it("must not redundantly store question correctness key", () => {
    const a: any = validQuestionAttempt;
    expect(a.correct_option_id).toBeUndefined();
    expect(a.answer_key).toBeUndefined();
  });

  it("must not depend on question_type at runtime", () => {
    const a: any = validQuestionAttempt;
    expect(a.question_type).toBeUndefined();
    expect(a.classification).toBeUndefined();
  });

  it("must not embed or cache Question content snapshots", () => {
    const a: any = validQuestionAttempt;
    expect(a.stem).toBeUndefined();
    expect(a.options).toBeUndefined();
    expect(a.explanations).toBeUndefined();
    expect(a.references).toBeUndefined();
  });

  it("must be evaluable without access to QuestionGraphMetrics", () => {
    const a: any = validQuestionAttempt;
    expect(a.semantic_embedding).toBeUndefined();
    expect(a.graph_context).toBeUndefined();
    expect(a.concept_alignment).toBeUndefined();
    expect(a.complexity).toBeUndefined();
  });
});
