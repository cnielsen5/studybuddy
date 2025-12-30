/**
 * Annotation Event Projector
 * 
 * Projects card_annotation_updated events to:
 * - CardAnnotationView: users/{uid}/libraries/{libraryId}/views/card_annotation/{cardId}
 * 
 * Tracks user preferences: tags, pinned status, personal organization.
 */

import { Firestore } from "@google-cloud/firestore";
import { UserEvent } from "./eventProjector";
import { CardAnnotationUpdatedPayloadSchema } from "../validation/schemas";
import { z } from "zod";

type CardAnnotationUpdatedPayload = z.infer<typeof CardAnnotationUpdatedPayloadSchema>;

export interface AnnotationProjectionResult {
  success: boolean;
  eventId: string;
  cardId: string;
  viewUpdated: boolean;
  idempotent: boolean;
  error?: string;
}

/**
 * Gets the view path for CardAnnotationView
 */
function getCardAnnotationViewPath(userId: string, libraryId: string, cardId: string): string {
  return `users/${userId}/libraries/${libraryId}/views/card_annotation/${cardId}`;
}

/**
 * Checks if event should be applied based on last_applied cursor
 */
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

/**
 * Projects a card_annotation_updated event to CardAnnotationView
 */
export async function projectCardAnnotationUpdatedEvent(
  firestore: Firestore,
  event: UserEvent
): Promise<AnnotationProjectionResult> {
  try {
    const payloadValidation = CardAnnotationUpdatedPayloadSchema.safeParse(event.payload);
    if (!payloadValidation.success) {
      return {
        success: false,
        eventId: event.event_id,
        cardId: event.entity.id,
        viewUpdated: false,
        idempotent: false,
        error: `Invalid payload: ${payloadValidation.error.errors.map((e) => e.message).join(", ")}`,
      };
    }

    const payload = payloadValidation.data;
    const cardId = event.entity.id;

    if (event.entity.kind !== "card") {
      return {
        success: false,
        eventId: event.event_id,
        cardId: cardId,
        viewUpdated: false,
        idempotent: false,
        error: `Expected entity.kind to be "card", got "${event.entity.kind}"`,
      };
    }

    const viewPath = getCardAnnotationViewPath(event.user_id, event.library_id, cardId);
    const viewRef = firestore.doc(viewPath);

    const viewDoc = await viewRef.get();
    const currentView = viewDoc.exists ? viewDoc.data() : undefined;

    const shouldApply = shouldApplyEvent(currentView?.last_applied, event);
    if (!shouldApply) {
      return {
        success: true,
        eventId: event.event_id,
        cardId: cardId,
        viewUpdated: false,
        idempotent: true,
      };
    }

    // Handle different actions (added, removed, updated)
    let updatedTags: string[] = currentView?.tags || [];
    let updatedPinned: boolean = currentView?.pinned || false;

    if (payload.action === "added") {
      // Add new tags (merge with existing, avoid duplicates)
      if (payload.tags) {
        const newTags = payload.tags.filter((tag) => !updatedTags.includes(tag));
        updatedTags = [...updatedTags, ...newTags];
      }
      if (payload.pinned !== undefined) {
        updatedPinned = payload.pinned;
      }
    } else if (payload.action === "removed") {
      // Remove specified tags
      if (payload.tags) {
        updatedTags = updatedTags.filter((tag) => !payload.tags!.includes(tag));
      }
      if (payload.pinned === false) {
        updatedPinned = false;
      }
    } else if (payload.action === "updated") {
      // Replace tags and pinned status
      if (payload.tags !== undefined) {
        updatedTags = payload.tags;
      }
      if (payload.pinned !== undefined) {
        updatedPinned = payload.pinned;
      }
    }

    // Build updated view
    const updatedView = {
      type: "card_annotation_view",
      card_id: cardId,
      library_id: event.library_id,
      user_id: event.user_id,
      tags: updatedTags,
      pinned: updatedPinned,
      last_updated_at: event.occurred_at,
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
      cardId: cardId,
      viewUpdated: true,
      idempotent: false,
    };
  } catch (error) {
    return {
      success: false,
      eventId: event.event_id,
      cardId: event.entity.id,
      viewUpdated: false,
      idempotent: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

