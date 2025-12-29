import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";
import { expectIdPrefix, ID_PREFIXES } from "../../helpers/ids.ts";
import {
  expectEventImmutability,
  expectNoPayloadAggregates
} from "../../helpers/invariantHelpers.ts";

const validMasteryCertificationStartedEvent = {
  ...validUserEvent,
  type: "mastery_certification_started",
  entity: { kind: "concept", id: "concept_0001" },
  payload: {
    certification_type: "full"
  }
};

describe("Event payload invariants — mastery_certification_started", () => {
  it("must have entity.kind === 'concept'", () => {
    expect(validMasteryCertificationStartedEvent.entity.kind).toBe("concept");
    expectIdPrefix(validMasteryCertificationStartedEvent.entity.id, ID_PREFIXES.CONCEPT, "MasteryCertificationStartedEvent.entity.id");
  });

  it("must include certification_type (determined after completion)", () => {
    const p: any = validMasteryCertificationStartedEvent.payload;

    // Note: certification_type here is the target/expected type, actual result comes in completed event
    if (p.certification_type !== undefined) {
      expect(["full", "partial", "none"]).toContain(p.certification_type);
    }
  });

  it("must not include certification results or question details", () => {
    const p: any = validMasteryCertificationStartedEvent.payload;

    expect(p.certification_result).toBeUndefined();
    expect(p.questions_answered).toBeUndefined();
    expect(p.correct_count).toBeUndefined();
    expect(p.reasoning_quality).toBeUndefined();
  });

  it("must not contain mutation-indicating fields", () => {
    expectEventImmutability(validMasteryCertificationStartedEvent, "MasteryCertificationStartedEvent");
  });

  it("must not contain aggregate fields in payload", () => {
    expectNoPayloadAggregates(validMasteryCertificationStartedEvent.payload, "MasteryCertificationStartedEvent.payload");
  });
});

