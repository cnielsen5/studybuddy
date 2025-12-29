import { validUserEvent } from "./userEvent.fixture.ts";

export const validInterventionAcceptedEvent = {
  ...validUserEvent,
  type: "intervention_accepted",
  entity: { kind: "card", id: "card_0001" },
  payload: {
    intervention_type: "accelerate",
    original_stability: 45.5,
    new_stability: 56.875
  }
} as const;

