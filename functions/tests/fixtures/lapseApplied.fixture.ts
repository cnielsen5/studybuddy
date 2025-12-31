import { validUserEvent } from "./userEvent.fixture.ts";

export const validLapseAppliedEvent = {
  ...validUserEvent,
  type: "lapse_applied",
  entity: { kind: "card", id: "card_0001" },
  payload: {
    penalty_factor: 0.4, // Multiplier to apply to current stability (0.0 to 1.0)
    trigger: "diagnostic_probing_confirmed_gap" // Why the lapse was applied
  }
} as const;

