import { validUserEvent } from "./userEvent.fixture.ts";

export const validSessionStartedEvent = {
  ...validUserEvent,
  type: "session_started",
  entity: { kind: "session", id: "session_0001" },
  payload: {
    planned_load: 42,
    queue_size: 38,
    cram_mode: false
  }
} as const;

