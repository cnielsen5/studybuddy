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
import {
  reduceSessionStarted,
  reduceSessionEnded,
  reduceSessionSummary,
  shouldApplySessionEvent,
  SessionView,
} from "./reducers/sessionReducers";

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

    if (event.entity.kind !== "session") {
      return {
        success: false,
        eventId: event.event_id,
        sessionId: event.entity.id,
        viewUpdated: false,
        idempotent: false,
        error: `Expected entity.kind to be "session", got "${event.entity.kind}"`,
      };
    }

    const sessionId = event.entity.id;
    const viewPath = getSessionViewPath(event.user_id, event.library_id, sessionId);
    const viewRef = firestore.doc(viewPath);

    const viewDoc = await viewRef.get();
    const currentView = viewDoc.exists ? (viewDoc.data() as SessionView) : undefined;

    const shouldApply = shouldApplySessionEvent(currentView, event);
    if (!shouldApply) {
      return {
        success: true,
        eventId: event.event_id,
        sessionId: sessionId,
        viewUpdated: false,
        idempotent: true,
      };
    }

    const updatedView = reduceSessionStarted(currentView, event);
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

    if (event.entity.kind !== "session") {
      return {
        success: false,
        eventId: event.event_id,
        sessionId: event.entity.id,
        viewUpdated: false,
        idempotent: false,
        error: `Expected entity.kind to be "session", got "${event.entity.kind}"`,
      };
    }

    const sessionId = event.entity.id;

    // Update session view
    const viewPath = getSessionViewPath(event.user_id, event.library_id, sessionId);
    const viewRef = firestore.doc(viewPath);

    const viewDoc = await viewRef.get();
    const currentView = viewDoc.exists ? (viewDoc.data() as SessionView) : undefined;

    const shouldApplyView = shouldApplySessionEvent(currentView, event);
    if (shouldApplyView) {
      const updatedView = reduceSessionEnded(currentView, event);
      await viewRef.set(updatedView, { merge: false });
    }

    // Create/update session summary
    const summaryPath = getSessionSummaryPath(event.user_id, event.library_id, sessionId);
    const summaryRef = firestore.doc(summaryPath);

    const summary = reduceSessionSummary(currentView, event);
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

