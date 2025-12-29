import { validUserEvent } from "./userEvent.fixture.ts";

export const validAccelerationAppliedEvent = {
  ...validUserEvent,
  type: "acceleration_applied",
  entity: { kind: "card", id: "card_0001" },
  payload: {
    original_stability: 45.5,
    new_stability: 56.875,
    next_due_days: 5,
    trigger: "correct_reasoning_in_probing"
  }
} as const;

