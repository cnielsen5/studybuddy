import { validUserEvent } from "./userEvent.fixture";

export const validMisconceptionProbeResultEvent = {
  ...validUserEvent,
  type: "misconception_probe_result",
  entity: { kind: "misconception_edge", id: "mis_edge_001" },
  payload: {
    confirmed: true,
    explanation_quality: "good",
    seconds_spent: 40
  }
} as const;
