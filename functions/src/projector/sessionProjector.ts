/**
 * Session Event Projector
 * 
 * Projects session_started and session_ended events to:
 * - SessionView: users/{uid}/libraries/{libraryId}/views/session/{sessionId}
 * - SessionSummary: users/{uid}/libraries/{libraryId}/session_summaries/{sessionId}
 */

import { Firestore } from "@google-cloud/firestore";
import { UserEvent } from "./eventProjector";
import { SessionStartedPayloadSchema, SessionEndedPayloadSchema } from "../validation/schemas";
import { z } from "zod";

type SessionStartedPayload = z.infer<typeof SessionStartedPayloadSchema>;
type SessionEndedPayload = z.infer<typeof SessionEndedPayloadSchema>;

export interface SessionProjectionResult {
  success: boolean;
  eventId: string;
  sessionId: string;
  viewUpdated: boolean;
  idempotent: boolean;
  error?: string;
}

function getSessionViewPath(userId: string, libraryId: string, sessionId: string): string {
  return `users/${userId}/libraries/${libraryId}/views/session/${sessionId}`;
}

function getSessionSummaryPath(userId: string, libraryId: string, sessionId: string): string {
  return `users/${userId}/libraries/${libraryId}/session_summaries/${sessionId}`;
}

function shouldApplyEvent(
  viewLastApplied: { received_at: string; event_id: string } | undefined,
  event: UserEvent
): boolean {
  if (!viewLastApplied) return true;
  const viewTimestamp = new Date(viewLastApplied.received_at).getTime();
  const eventTimestamp = new Date(event.received_at).getTime();
  if (eventTimestamp > viewTimestamp) return true;
  if (eventTimestamp === viewTimestamp && event.event_id !== viewLastApplied.event_id) return true;
  if (event.event_id === viewLastApplied.event_id) return false;
  return false;
}

export async function projectSessionStartedEvent(
  firestore: Firestore,
  event: UserEvent
): Promise<SessionProjectionResult> {
  try {
    const payloadValidation = SessionStartedPayloadSchema.safeParse(event.payload);
    if (!payloadValidation.success) {
      return {
        success: false,
        eventId: event.event_id,
        sessionId: event.entity.id,
        viewUpdated: false,
        idempotent: false,
        error: `Invalid payload: ${payloadValidation.error.errors.map((e) => e.message).join(", ")}`,
      };
    }

    const payload = payloadValidation.data;
    const sessionId = event.entity.id;

    if (event.entity.kind !== "session") {
      return {
        success: false,
        eventId: event.event_id,
        sessionId: sessionId,
        viewUpdated: false,
        idempotent: false,
        error: `Expected entity.kind to be "session", got "${event.entity.kind}"`,
      };
    }

    const viewPath = getSessionViewPath(event.user_id, event.library_id, sessionId);
    const viewRef = firestore.doc(viewPath);

    const viewDoc = await viewRef.get();
    const currentView = viewDoc.exists ? viewDoc.data() : undefined;

    const shouldApply = shouldApplyEvent(currentView?.last_applied, event);
    if (!shouldApply) {
      return {
        success: true,
        eventId: event.event_id,
        sessionId: sessionId,
        viewUpdated: false,
        idempotent: true,
      };
    }

    const updatedView = {
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

    await viewRef.set(updatedView, { merge: false });

    return {
      success: true,
      eventId: event.event_id,
      sessionId: sessionId,
      viewUpdated: true,
      idempotent: false,
    };
  } catch (error) {
    return {
      success: false,
      eventId: event.event_id,
      sessionId: event.entity.id,
      viewUpdated: false,
      idempotent: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

export async function projectSessionEndedEvent(
  firestore: Firestore,
  event: UserEvent
): Promise<SessionProjectionResult> {
  try {
    const payloadValidation = SessionEndedPayloadSchema.safeParse(event.payload);
    if (!payloadValidation.success) {
      return {
        success: false,
        eventId: event.event_id,
        sessionId: event.entity.id,
        viewUpdated: false,
        idempotent: false,
        error: `Invalid payload: ${payloadValidation.error.errors.map((e) => e.message).join(", ")}`,
      };
    }

    const payload = payloadValidation.data;
    const sessionId = event.entity.id;

    if (event.entity.kind !== "session") {
      return {
        success: false,
        eventId: event.event_id,
        sessionId: sessionId,
        viewUpdated: false,
        idempotent: false,
        error: `Expected entity.kind to be "session", got "${event.entity.kind}"`,
      };
    }

    // Update session view
    const viewPath = getSessionViewPath(event.user_id, event.library_id, sessionId);
    const viewRef = firestore.doc(viewPath);

    const viewDoc = await viewRef.get();
    const currentView = viewDoc.exists ? viewDoc.data() : undefined;

    const shouldApplyView = shouldApplyEvent(currentView?.last_applied, event);
    if (shouldApplyView) {
      const updatedView = {
        ...currentView,
        type: "session_view",
        session_id: sessionId,
        library_id: event.library_id,
        user_id: event.user_id,
        ended_at: event.occurred_at,
        actual_load: payload.actual_load,
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
      await viewRef.set(updatedView, { merge: false });
    }

    // Create/update session summary
    const summaryPath = getSessionSummaryPath(event.user_id, event.library_id, sessionId);
    const summaryRef = firestore.doc(summaryPath);

    const summaryDoc = await summaryRef.get();
    const currentSummary = summaryDoc.exists ? summaryDoc.data() : undefined;

    const summary = {
      type: "session_summary",
      session_id: sessionId,
      user_id: event.user_id,
      started_at: currentView?.started_at || event.occurred_at,
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

    await summaryRef.set(summary, { merge: false });

    return {
      success: true,
      eventId: event.event_id,
      sessionId: sessionId,
      viewUpdated: shouldApplyView,
      idempotent: !shouldApplyView,
    };
  } catch (error) {
    return {
      success: false,
      eventId: event.event_id,
      sessionId: event.entity.id,
      viewUpdated: false,
      idempotent: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

