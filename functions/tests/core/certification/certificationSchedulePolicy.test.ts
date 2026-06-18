import {
  classifyCertificationScheduleAction,
} from "../../../src/core/certification/certificationSchedulePolicy";
import { reduceCertificationScheduleEffect } from "../../../src/projector/reducers/certificationScheduleReducers";
import { validMasteryCertificationCompletedEvent } from "../../fixtures/masteryCertificationCompleted.fixture";

describe("certification schedule policy", () => {
  const fsrsRecallCore = {
    cardId: "card_fsrs_stability_def",
    conceptId: "concept_fsrs",
    cardTier: "core" as const,
    pedagogicalRole: "recall",
  };

  const fsrsApplicationCore = {
    cardId: "card_fsrs_cloze_interval",
    conceptId: "concept_fsrs",
    cardTier: "core" as const,
    pedagogicalRole: "application",
  };

  const fsrsExtension = {
    cardId: "card_example_extension",
    conceptId: "concept_fsrs",
    cardTier: "extension" as const,
    pedagogicalRole: "synthesis",
  };

  it("partial certification suppresses introductory core cards", () => {
    expect(
      classifyCertificationScheduleAction("partial", fsrsRecallCore)
    ).toBe("suppress");
  });

  it("partial certification accelerates application and nuance cards", () => {
    expect(
      classifyCertificationScheduleAction("partial", fsrsApplicationCore)
    ).toBe("accelerate");
    expect(classifyCertificationScheduleAction("partial", fsrsExtension)).toBe(
      "accelerate"
    );
  });

  it("full certification suppresses core cards and accelerates extension", () => {
    expect(classifyCertificationScheduleAction("full", fsrsRecallCore)).toBe(
      "suppress"
    );
    expect(classifyCertificationScheduleAction("full", fsrsExtension)).toBe(
      "accelerate"
    );
  });

  it("none certification clears prior marks", () => {
    expect(classifyCertificationScheduleAction("none", fsrsRecallCore)).toBe(
      "clear"
    );
  });
});

describe("reduceCertificationScheduleEffect", () => {
  it("marks suppressed cards with far-future due dates", () => {
    const updated = reduceCertificationScheduleEffect(
      undefined,
      "card_fsrs_stability_def",
      validMasteryCertificationCompletedEvent,
      { certificationResult: "partial", action: "suppress" }
    );

    expect(updated).toBeDefined();
    expect(updated!.suppressed).toBe(true);
    expect(updated!.suppression_reason).toBe("certification_partial");
    expect(updated!.state).toBe(3);
    expect(new Date(updated!.due_at).getTime()).toBeGreaterThan(Date.now());
  });

  it("accelerates nuance cards with higher stability", () => {
    const updated = reduceCertificationScheduleEffect(
      undefined,
      "card_fsrs_cloze_interval",
      validMasteryCertificationCompletedEvent,
      { certificationResult: "partial", action: "accelerate" }
    );

    expect(updated).toBeDefined();
    expect(updated!.suppressed).toBe(false);
    expect(updated!.certification_applied).toBe(true);
    expect(updated!.stability).toBeGreaterThanOrEqual(21);
  });

  it("is idempotent for the same certification event", () => {
    const first = reduceCertificationScheduleEffect(
      undefined,
      "card_fsrs_stability_def",
      validMasteryCertificationCompletedEvent,
      { certificationResult: "partial", action: "suppress" }
    );

    const second = reduceCertificationScheduleEffect(
      first!,
      "card_fsrs_stability_def",
      validMasteryCertificationCompletedEvent,
      { certificationResult: "partial", action: "suppress" }
    );

    expect(second).toBeNull();
  });
});
