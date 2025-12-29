import { validUserEvent } from "./userEvent.fixture";

export const validCardReviewedEvent = {
  ...validUserEvent,
  type: "card_reviewed",
  entity: { kind: "card", id: "card_0001" },
  payload: {
    grade: "good",
    seconds_spent: 18,
    rating_confidence: 2
  }
} as const;
