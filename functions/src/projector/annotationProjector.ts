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
import {
  reduceCardAnnotation,
  shouldApplyAnnotationEvent,
  CardAnnotationView,
} from "./reducers/annotationReducers";

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

    if (event.entity.kind !== "card") {
      return {
        success: false,
        eventId: event.event_id,
        cardId: event.entity.id,
        viewUpdated: false,
        idempotent: false,
        error: `Expected entity.kind to be "card", got "${event.entity.kind}"`,
      };
    }

    const cardId = event.entity.id;
    const viewPath = getCardAnnotationViewPath(event.user_id, event.library_id, cardId);
    const viewRef = firestore.doc(viewPath);

    const viewDoc = await viewRef.get();
    const currentView = viewDoc.exists ? (viewDoc.data() as CardAnnotationView) : undefined;

    const shouldApply = shouldApplyAnnotationEvent(currentView, event);
    if (!shouldApply) {
      return {
        success: true,
        eventId: event.event_id,
        cardId: cardId,
        viewUpdated: false,
        idempotent: true,
      };
    }

    const updatedView = reduceCardAnnotation(currentView, event);
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

