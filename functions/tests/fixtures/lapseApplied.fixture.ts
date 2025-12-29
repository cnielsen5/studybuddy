import { validUserEvent } from "./userEvent.fixture.ts";

export const validLapseAppliedEvent = {
  ...validUserEvent,
  type: "lapse_applied",
  entity: { kind: "card", id: "card_0001" },
  payload: {
    original_stability: 45.5,
    new_stability: 27.3,
    effective_penalty: 0.4,
    trigger: "diagnostic_probing_confirmed_gap"
  }
} as const;

