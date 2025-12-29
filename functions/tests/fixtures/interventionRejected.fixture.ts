import { validUserEvent } from "./userEvent.fixture.ts";

export const validInterventionRejectedEvent = {
  ...validUserEvent,
  type: "intervention_rejected",
  entity: { kind: "card", id: "card_0001" },
  payload: {
    intervention_type: "lapse",
    reason: "insufficient_evidence"
  }
} as const;

