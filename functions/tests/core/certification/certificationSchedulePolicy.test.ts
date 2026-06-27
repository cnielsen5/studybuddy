import {
  classifyCertificationScheduleAction,
  hasSuppressionEvidence,
  resolveCertificationScheduleAction,
} from "../../../src/core/certification/certificationSchedulePolicy";
import {
  reduceCertificationScheduleEffect,
  reduceCertificationSuppressionRevocation,
} from "../../../src/projector/reducers/certificationScheduleReducers";
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

  describe("evidence floor (§13.6)", () => {
    it("blocks suppression when the card has never been seen", () => {
      expect(
        resolveCertificationScheduleAction("partial", fsrsRecallCore, undefined)
      ).toBe("unchanged");
    });

    it("allows suppression when the card is not New", () => {
      expect(
        resolveCertificationScheduleAction("partial", fsrsRecallCore, {
          state: 2,
        } as never)
      ).toBe("suppress");
    });

    it("allows suppression when CLKT seeded stability exists", () => {
      expect(
        resolveCertificationScheduleAction("partial", fsrsRecallCore, {
          state: 0,
          transfer_state: { seeded_stability: 14 },
        } as never)
      ).toBe("suppress");
    });

    it("downgrades suppress to accelerate for eligible nuance cards", () => {
      expect(
        resolveCertificationScheduleAction(
          "partial",
          fsrsApplicationCore,
          undefined
        )
      ).toBe("accelerate");
    });

    it("hasSuppressionEvidence reflects state and transfer_state", () => {
      expect(hasSuppressionEvidence(undefined)).toBe(false);
      expect(hasSuppressionEvidence({ state: 0 } as never)).toBe(false);
      expect(hasSuppressionEvidence({ state: 1 } as never)).toBe(true);
      expect(
        hasSuppressionEvidence({
          state: 0,
          transfer_state: { seeded_stability: 7 },
        } as never)
      ).toBe(true);
    });
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

  it("revokes suppression and returns card to learning (§13.8)", () => {
    const suppressed = reduceCertificationScheduleEffect(
      { state: 2, stability: 90 } as never,
      "card_fsrs_stability_def",
      validMasteryCertificationCompletedEvent,
      { certificationResult: "partial", action: "suppress" }
    );

    const revoked = reduceCertificationSuppressionRevocation(
      suppressed!,
      {
        ...validMasteryCertificationCompletedEvent,
        event_id: "evt_revoke_test",
        received_at: "2026-06-13T12:00:00.000Z",
      }
    );

    expect(revoked).toBeDefined();
    expect(revoked!.suppressed).toBe(false);
    expect(revoked!.certification_applied).toBe(false);
    expect(revoked!.state).toBe(1);
    expect(revoked!.stability).toBe(1);
  });
});
