import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";
import { expectIdPrefix, ID_PREFIXES } from "../../helpers/ids.ts";
import {
  expectEventImmutability
} from "../../helpers/invariantHelpers.ts";

const validMasteryCertificationCompletedEvent = {
  ...validUserEvent,
  type: "mastery_certification_completed",
  entity: { kind: "concept", id: "concept_0001" },
  payload: {
    certification_result: "partial",
    questions_answered: 4,
    correct_count: 3,
    reasoning_quality: "good"
  }
};

describe("Event payload invariants — mastery_certification_completed", () => {
  it("must have entity.kind === 'concept'", () => {
    expect(validMasteryCertificationCompletedEvent.entity.kind).toBe("concept");
    expectIdPrefix(validMasteryCertificationCompletedEvent.entity.id, ID_PREFIXES.CONCEPT, "MasteryCertificationCompletedEvent.entity.id");
  });

  it("must include certification_result with valid enum value", () => {
    const p: any = validMasteryCertificationCompletedEvent.payload;

    expect(["full", "partial", "none"]).toContain(p.certification_result);

    expect(typeof p.questions_answered).toBe("number");
    expect(p.questions_answered).toBeGreaterThanOrEqual(0);

    expect(typeof p.correct_count).toBe("number");
    expect(p.correct_count).toBeGreaterThanOrEqual(0);
    expect(p.correct_count).toBeLessThanOrEqual(p.questions_answered);

    if (p.reasoning_quality !== undefined) {
      expect(["good", "weak"]).toContain(p.reasoning_quality);
    }
  });

  it("must not include suppressed card lists or scheduling changes", () => {
    const p: any = validMasteryCertificationCompletedEvent.payload;

    expect(p.suppressed_card_ids).toBeUndefined();
    expect(p.accelerated_card_ids).toBeUndefined();
    expect(p.stability_changes).toBeUndefined();
    expect(p.due_date_changes).toBeUndefined();
  });

  it("must not contain mutation-indicating fields", () => {
    expectEventImmutability(validMasteryCertificationCompletedEvent, "MasteryCertificationCompletedEvent");
  });

  it("must not contain aggregate fields in payload", () => {
    const p: any = validMasteryCertificationCompletedEvent.payload;
    
    // correct_count is allowed here as it's a direct measurement from the certification test,
    // not a cumulative aggregate over time. We manually check for other aggregate fields.
    const forbiddenAggregates = [
      "total_attempts",
      "total_reviews",
      "accuracy_rate",
      "avg_seconds",
      "avg_time",
      "streak",
      "max_streak",
      // "correct_count" - allowed for certification events
      // "incorrect_count" - would be allowed if present
      "success_rate",
      "failure_rate",
      "cumulative_score",
      "running_total",
      "aggregate_accuracy",
      "historical_average"
    ];
    
    for (const field of forbiddenAggregates) {
      expect(p[field]).toBeUndefined();
    }
  });
});

