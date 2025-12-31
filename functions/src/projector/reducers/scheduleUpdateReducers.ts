/**
 * Schedule Update Reducers
 * 
 * Pure functions for explicit schedule updates (acceleration, lapse).
 */

import { UserEvent } from "../eventProjector";
import { CardScheduleView } from "./cardReducers";
import { z } from "zod";
import {
  AccelerationAppliedPayloadSchema,
  LapseAppliedPayloadSchema,
} from "../../validation/schemas";

type AccelerationAppliedPayload = z.infer<typeof AccelerationAppliedPayloadSchema>;
type LapseAppliedPayload = z.infer<typeof LapseAppliedPayloadSchema>;


export function reduceAccelerationApplied(
  prev: CardScheduleView | undefined,
  event: UserEvent
): CardScheduleView {
  const payload = AccelerationAppliedPayloadSchema.parse(event.payload);
  const cardId = event.entity.id;

  if (!prev) {
    throw new Error("Cannot apply acceleration to non-existent card schedule view");
  }

  // Calculate new stability from current stability * acceleration factor
  const newStability = prev.stability * payload.acceleration_factor;
  
  // Calculate new interval based on new stability
  const newIntervalDays = Math.max(1, Math.floor(newStability));
  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + newIntervalDays);

  return {
    type: "card_schedule_view",
    card_id: cardId,
    library_id: event.library_id,
    user_id: event.user_id,
    state: prev.state, // Keep current state
    due_at: nextDueDate.toISOString(),
    stability: newStability,
    difficulty: prev.difficulty, // Difficulty unchanged by acceleration
    interval_days: newIntervalDays,
    last_reviewed_at: prev.last_reviewed_at, // Don't update last_reviewed_at for interventions
    last_grade: prev.last_grade,
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

  if (!prev) {
    throw new Error("Cannot apply lapse to non-existent card schedule view");
  }

  // Calculate new stability from current stability * penalty factor
  const newStability = Math.max(0.1, prev.stability * payload.penalty_factor);
  
  // Calculate new interval based on new stability
  const daysUntilDue = Math.max(1, Math.floor(newStability));
  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + daysUntilDue);

  // Lapse moves card back to learning/relearning state
  const newState = prev.state === 2 ? 3 : Math.max(1, prev.state - 1); // REVIEW -> RELEARNING, or decrement

  return {
    type: "card_schedule_view",
    card_id: cardId,
    library_id: event.library_id,
    user_id: event.user_id,
    state: newState,
    due_at: nextDueDate.toISOString(),
    stability: newStability,
    difficulty: Math.min(10.0, prev.difficulty + 0.1), // Increase difficulty on lapse
    interval_days: daysUntilDue,
    last_reviewed_at: prev.last_reviewed_at, // Don't update last_reviewed_at for interventions
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

