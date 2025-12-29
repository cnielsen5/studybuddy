import { validUserEvent } from "./userEvent.fixture.ts";

export const validSessionEndedEvent = {
  ...validUserEvent,
  type: "session_ended",
  entity: { kind: "session", id: "session_0001" },
  payload: {
    actual_load: 39,
    retention_delta: 0.08,
    fatigue_hit: true,
    user_accepted_intervention: false
  }
} as const;

