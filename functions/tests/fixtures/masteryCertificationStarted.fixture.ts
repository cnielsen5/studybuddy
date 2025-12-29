import { validUserEvent } from "./userEvent.fixture.ts";

export const validMasteryCertificationStartedEvent = {
  ...validUserEvent,
  type: "mastery_certification_started",
  entity: { kind: "concept", id: "concept_0001" },
  payload: {
    certification_type: "full"
  }
} as const;

