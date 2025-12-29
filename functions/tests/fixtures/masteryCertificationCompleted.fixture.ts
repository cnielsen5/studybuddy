import { validUserEvent } from "./userEvent.fixture.ts";

export const validMasteryCertificationCompletedEvent = {
  ...validUserEvent,
  type: "mastery_certification_completed",
  entity: { kind: "concept", id: "concept_0001" },
  payload: {
    certification_result: "partial",
    questions_answered: 4,
    correct_count: 3,
    reasoning_quality: "good"
  }
} as const;

