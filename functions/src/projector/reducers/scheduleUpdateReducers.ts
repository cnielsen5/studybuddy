/**
 * Schedule Update Reducers
 * 
 * Pure functions for explicit schedule updates (acceleration, lapse).
 */

import { UserEvent } from "../eventProjector";
import { CardScheduleView } from "./cardReducers";
import { z } from "zod";

const AccelerationAppliedPayloadSchema = z.object({
  original_stability: z.number().positive(),
  new_stability: z.number().positive(),
  next_due_days: z.number().nonnegative(),
  trigger: z.string(),
});

const LapseAppliedPayloadSchema = z.object({
  original_stability: z.number().positive(),
  new_stability: z.number().positive(),
  effective_penalty: z.number().min(0).max(1),
  trigger: z.string(),
});

type AccelerationAppliedPayload = z.infer<typeof AccelerationAppliedPayloadSchema>;
type LapseAppliedPayload = z.infer<typeof LapseAppliedPayloadSchema>;


export function reduceAccelerationApplied(
  prev: CardScheduleView | undefined,
  event: UserEvent
): CardScheduleView {
  const payload = AccelerationAppliedPayloadSchema.parse(event.payload);
  const cardId = event.entity.id;

  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + payload.next_due_days);

  return {
    type: "card_schedule_view",
    card_id: cardId,
    library_id: event.library_id,
    user_id: event.user_id,
    state: prev?.state || 2, // review state
    due_at: nextDueDate.toISOString(),
    stability: payload.new_stability,
    difficulty: prev?.difficulty || 5.0,
    interval_days: payload.next_due_days,
    last_reviewed_at: prev?.last_reviewed_at || event.occurred_at,
    last_grade: prev?.last_grade || "good",
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };
}

export function reduceLapseApplied(
  prev: CardScheduleView | undefined,
  event: UserEvent
): CardScheduleView {
  const payload = LapseAppliedPayloadSchema.parse(event.payload);
  const cardId = event.entity.id;

  const daysUntilDue = Math.max(1, Math.floor(payload.new_stability));
  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + daysUntilDue);

  // Lapse moves card back to learning state
  const newState = Math.max(1, (prev?.state || 2) - 1);

  return {
    type: "card_schedule_view",
    card_id: cardId,
    library_id: event.library_id,
    user_id: event.user_id,
    state: newState,
    due_at: nextDueDate.toISOString(),
    stability: payload.new_stability,
    difficulty: Math.min(10.0, (prev?.difficulty || 5.0) + 0.1), // Increase difficulty on lapse
    interval_days: daysUntilDue,
    last_reviewed_at: prev?.last_reviewed_at || event.occurred_at,
    last_grade: "again",
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };
}

export function shouldApplyScheduleUpdateEvent(
  prev: CardScheduleView | undefined,
  event: UserEvent
): boolean {
  if (!prev) return true;
  const viewTimestamp = new Date(prev.last_applied.received_at).getTime();
  const eventTimestamp = new Date(event.received_at).getTime();
  if (eventTimestamp > viewTimestamp) return true;
  if (eventTimestamp === viewTimestamp && event.event_id !== prev.last_applied.event_id) return true;
  if (event.event_id === prev.last_applied.event_id) return false;
  return false;
}

