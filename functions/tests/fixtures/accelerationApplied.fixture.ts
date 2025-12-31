import { validUserEvent } from "./userEvent.fixture.ts";

export const validAccelerationAppliedEvent = {
  ...validUserEvent,
  type: "acceleration_applied",
  entity: { kind: "card", id: "card_0001" },
  payload: {
    acceleration_factor: 1.25, // Multiplier to apply to current stability (> 1.0)
    trigger: "correct_reasoning_in_probing" // Why the acceleration was applied
  }
} as const;

