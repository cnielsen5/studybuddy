import type { ReviewGrade, UserEvent } from "./types";

export function generateEventId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `evt_${timestamp}_${random}`;
}

export function createCardReviewedEvent(params: {
  userId: string;
  libraryId: string;
  cardId: string;
  grade: ReviewGrade;
  secondsSpent: number;
  deviceId?: string;
}): UserEvent {
  const now = new Date().toISOString();

  return {
    event_id: generateEventId(),
    type: "card_reviewed",
    user_id: params.userId,
    library_id: params.libraryId,
    occurred_at: now,
    received_at: now,
    device_id: params.deviceId ?? "unknown",
    entity: { kind: "card", id: params.cardId },
    payload: {
      grade: params.grade,
      seconds_spent: params.secondsSpent,
    },
    schema_version: "1.0",
  };
}
