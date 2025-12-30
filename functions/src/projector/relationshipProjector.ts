/**
 * Relationship Event Projector
 * 
 * Projects relationship_reviewed events to:
 * - RelationshipScheduleView: users/{uid}/libraries/{libraryId}/views/relationship_schedule/{relationshipCardId}
 * - RelationshipPerformanceView: users/{uid}/libraries/{libraryId}/views/relationship_perf/{relationshipCardId}
 * 
 * Similar to card_reviewed but for relationship cards.
 */

import { Firestore } from "@google-cloud/firestore";
import { UserEvent } from "./eventProjector";
import { z } from "zod";
import {
  reduceRelationshipSchedule,
  reduceRelationshipPerformance,
  shouldApplyRelationshipEvent,
  RelationshipScheduleView,
  RelationshipPerformanceView,
} from "./reducers/relationshipReducers";

const RelationshipReviewedPayloadSchema = z.object({
  concept_a_id: z.string(),
  concept_b_id: z.string(),
  direction: z.object({
    from: z.string(),
    to: z.string(),
  }),
  correct: z.boolean(),
  high_confidence: z.boolean(),
  seconds_spent: z.number().nonnegative(),
});

export interface RelationshipProjectionResult {
  success: boolean;
  eventId: string;
  relationshipCardId: string;
  scheduleViewUpdated: boolean;
  performanceViewUpdated: boolean;
  idempotent: boolean;
  error?: string;
}

function getRelationshipScheduleViewPath(userId: string, libraryId: string, relationshipCardId: string): string {
  return `users/${userId}/libraries/${libraryId}/views/relationship_schedule/${relationshipCardId}`;
}

function getRelationshipPerformanceViewPath(userId: string, libraryId: string, relationshipCardId: string): string {
  return `users/${userId}/libraries/${libraryId}/views/relationship_perf/${relationshipCardId}`;
}


export async function projectRelationshipReviewedEvent(
  firestore: Firestore,
  event: UserEvent
): Promise<RelationshipProjectionResult> {
  try {
    const payloadValidation = RelationshipReviewedPayloadSchema.safeParse(event.payload);
    if (!payloadValidation.success) {
      return {
        success: false,
        eventId: event.event_id,
        relationshipCardId: event.entity.id,
        scheduleViewUpdated: false,
        performanceViewUpdated: false,
        idempotent: false,
        error: `Invalid payload: ${payloadValidation.error.errors.map((e) => e.message).join(", ")}`,
      };
    }

    if (event.entity.kind !== "relationship_card") {
      return {
        success: false,
        eventId: event.event_id,
        relationshipCardId: event.entity.id,
        scheduleViewUpdated: false,
        performanceViewUpdated: false,
        idempotent: false,
        error: `Expected entity.kind to be "relationship_card", got "${event.entity.kind}"`,
      };
    }

    const relationshipCardId = event.entity.id;

    const result = await firestore.runTransaction(async (transaction) => {
      const scheduleViewPath = getRelationshipScheduleViewPath(event.user_id, event.library_id, relationshipCardId);
      const performanceViewPath = getRelationshipPerformanceViewPath(event.user_id, event.library_id, relationshipCardId);

      const scheduleViewRef = firestore.doc(scheduleViewPath);
      const performanceViewRef = firestore.doc(performanceViewPath);

      const [scheduleViewDoc, performanceViewDoc] = await Promise.all([
        transaction.get(scheduleViewRef),
        transaction.get(performanceViewRef),
      ]);

      const scheduleView = scheduleViewDoc.exists
        ? (scheduleViewDoc.data() as RelationshipScheduleView)
        : undefined;
      const performanceView = performanceViewDoc.exists
        ? (performanceViewDoc.data() as RelationshipPerformanceView)
        : undefined;

      const shouldApplySchedule = shouldApplyRelationshipEvent(scheduleView, event);
      const shouldApplyPerformance = shouldApplyRelationshipEvent(performanceView, event);

      if (!shouldApplySchedule && !shouldApplyPerformance) {
        return {
          scheduleUpdated: false,
          performanceUpdated: false,
          idempotent: true,
        };
      }

      const scheduleUpdate = shouldApplySchedule
        ? reduceRelationshipSchedule(scheduleView, event)
        : null;
      const performanceUpdate = shouldApplyPerformance
        ? reduceRelationshipPerformance(performanceView, event)
        : null;

      if (scheduleUpdate) {
        transaction.set(scheduleViewRef, scheduleUpdate, { merge: false });
      }
      if (performanceUpdate) {
        transaction.set(performanceViewRef, performanceUpdate, { merge: false });
      }

      return {
        scheduleUpdated: shouldApplySchedule,
        performanceUpdated: shouldApplyPerformance,
        idempotent: false,
      };
    });

    return {
      success: true,
      eventId: event.event_id,
      relationshipCardId: relationshipCardId,
      scheduleViewUpdated: result.scheduleUpdated,
      performanceViewUpdated: result.performanceUpdated,
      idempotent: result.idempotent,
    };
  } catch (error) {
    return {
      success: false,
      eventId: event.event_id,
      relationshipCardId: event.entity.id,
      scheduleViewUpdated: false,
      performanceViewUpdated: false,
      idempotent: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

