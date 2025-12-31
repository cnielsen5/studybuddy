/**
 * Session View Reducers
 * 
 * Pure functions for session view and summary updates.
 */

import { UserEvent } from "../eventProjector";
import { SessionStartedPayloadSchema, SessionEndedPayloadSchema } from "../../validation/schemas";

// Types for payload validation (used implicitly via schema.parse)
// type SessionStartedPayload = z.infer<typeof SessionStartedPayloadSchema>;
// type SessionEndedPayload = z.infer<typeof SessionEndedPayloadSchema>;

export interface SessionView {
  type: "session_view";
  session_id: string;
  library_id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  planned_load?: number;
  actual_load?: number;
  queue_size?: number;
  cram_mode: boolean;
  status: "active" | "completed";
  retention_delta?: number;
  fatigue_hit?: boolean;
  user_accepted_intervention?: boolean;
  last_applied: {
    received_at: string;
    event_id: string;
  };
  updated_at: string;
}

export interface SessionSummary {
  type: "session_summary";
  session_id: string;
  user_id: string;
  started_at: string;
  ended_at: string;
  totals: {
    cards_reviewed: number;
    questions_answered: number;
    total_time_seconds: number;
  };
  retention_delta?: number;
  fatigue_hit?: boolean;
  last_applied: {
    received_at: string;
    event_id: string;
  };
  updated_at: string;
}

export function reduceSessionStarted(
  prev: SessionView | undefined,
  event: UserEvent
): SessionView {
  const payload = SessionStartedPayloadSchema.parse(event.payload);
  const sessionId = event.entity.id;

  return {
    type: "session_view",
    session_id: sessionId,
    library_id: event.library_id,
    user_id: event.user_id,
    started_at: event.occurred_at,
    planned_load: payload.planned_load,
    queue_size: payload.queue_size,
    cram_mode: payload.cram_mode || false,
    status: "active",
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };
}

export function reduceSessionEnded(
  prev: SessionView | undefined,
  event: UserEvent
): SessionView {
  const payload = SessionEndedPayloadSchema.parse(event.payload);
  const sessionId = event.entity.id;

  return {
    type: "session_view",
    session_id: sessionId,
    library_id: event.library_id,
    user_id: event.user_id,
    started_at: prev?.started_at || event.occurred_at,
    ended_at: event.occurred_at,
    planned_load: prev?.planned_load,
    actual_load: payload.actual_load,
    queue_size: prev?.queue_size,
    cram_mode: prev?.cram_mode || false,
    retention_delta: payload.retention_delta,
    fatigue_hit: payload.fatigue_hit,
    user_accepted_intervention: payload.user_accepted_intervention,
    status: "completed",
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };
}

export function reduceSessionSummary(
  sessionView: SessionView | undefined,
  event: UserEvent
): SessionSummary {
  const payload = SessionEndedPayloadSchema.parse(event.payload);
  const sessionId = event.entity.id;

  return {
    type: "session_summary",
    session_id: sessionId,
    user_id: event.user_id,
    started_at: sessionView?.started_at || event.occurred_at,
    ended_at: event.occurred_at,
    totals: {
      cards_reviewed: 0, // Would be calculated from other events
      questions_answered: 0, // Would be calculated from other events
      total_time_seconds: 0, // Would be calculated
    },
    retention_delta: payload.retention_delta,
    fatigue_hit: payload.fatigue_hit,
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };
}

export function shouldApplySessionEvent(
  prev: SessionView | undefined,
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

