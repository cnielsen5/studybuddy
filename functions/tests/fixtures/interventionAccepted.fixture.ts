import { validUserEvent } from "./userEvent.fixture.ts";

export const validInterventionAcceptedEvent = {
  ...validUserEvent,
  type: "intervention_accepted",
  entity: { kind: "card", id: "card_0001" },
  payload: {
    intervention_type: "accelerate", // "accelerate" | "lapse" | "reset"
    factor: 1.25 // The factor that will be applied (for accelerate: > 1.0, for lapse: 0.0-1.0)
  }
} as const;

