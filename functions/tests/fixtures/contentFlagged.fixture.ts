import { validUserEvent } from "./userEvent.fixture.ts";

export const validContentFlaggedEvent = {
  ...validUserEvent,
  type: "content_flagged",
  entity: { kind: "card", id: "card_0001" },
  payload: {
    reason: "incorrect",
    comment: "The answer is wrong"
  }
} as const;

