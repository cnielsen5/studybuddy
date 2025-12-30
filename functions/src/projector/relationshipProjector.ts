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

// Relationship reviewed payload schema (similar to card_reviewed)
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

type RelationshipReviewedPayload = z.infer<typeof RelationshipReviewedPayloadSchema>;

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

function calculateScheduleViewUpdate(
  currentView: any,
  event: UserEvent,
  payload: RelationshipReviewedPayload
): any {
  const relationshipCardId = event.entity.id;
  const currentStability = currentView?.stability || 1.0;
  const currentDifficulty = currentView?.difficulty || 5.0;
  const currentState = currentView?.state || 0;

  // Simplified FSRS-like update (grade based on correct/high_confidence)
  let grade: "again" | "hard" | "good" | "easy";
  if (!payload.correct) {
    grade = "again";
  } else if (payload.high_confidence) {
    grade = "easy";
  } else {
    grade = "good";
  }

  const gradeMultipliers: Record<string, number> = {
    again: 0.5,
    hard: 0.8,
    good: 1.2,
    easy: 1.5,
  };
  const multiplier = gradeMultipliers[grade] || 1.0;
  const newStability = Math.max(0.1, currentStability * multiplier);
  const newDifficulty = Math.max(0.1, Math.min(10.0, currentDifficulty + (grade === "again" ? 0.1 : -0.05)));

  const daysUntilDue = Math.max(1, Math.floor(newStability));
  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + daysUntilDue);

  let newState = currentState;
  if (currentState === 0 && grade !== "again") {
    newState = 1;
  } else if (currentState === 1 && newStability > 7 && grade !== "again") {
    newState = 2;
  } else if (currentState === 2 && newStability > 90 && grade !== "again") {
    newState = 3;
  } else if (grade === "again" && currentState > 0) {
    newState = Math.max(1, currentState - 1);
  }

  return {
    type: "relationship_schedule_view",
    relationship_card_id: relationshipCardId,
    library_id: event.library_id,
    user_id: event.user_id,
    state: newState,
    due_at: nextDueDate.toISOString(),
    stability: newStability,
    difficulty: newDifficulty,
    interval_days: daysUntilDue,
    last_reviewed_at: event.occurred_at,
    last_correct: payload.correct,
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };
}

function calculatePerformanceViewUpdate(
  currentView: any,
  event: UserEvent,
  payload: RelationshipReviewedPayload
): any {
  const relationshipCardId = event.entity.id;
  const currentTotalReviews = currentView?.total_reviews || 0;
  const currentCorrectReviews = currentView?.correct_reviews || 0;
  const currentAvgSeconds = currentView?.avg_seconds || 0;
  const currentStreak = currentView?.streak || 0;
  const currentMaxStreak = currentView?.max_streak || 0;

  const newTotalReviews = currentTotalReviews + 1;
  const isCorrect = payload.correct;
  const newCorrectReviews = isCorrect ? currentCorrectReviews + 1 : currentCorrectReviews;
  const newAccuracyRate = newCorrectReviews / newTotalReviews;

  const alpha = 0.2;
  const newAvgSeconds = currentAvgSeconds * (1 - alpha) + payload.seconds_spent * alpha;

  let newStreak = isCorrect ? currentStreak + 1 : 0;
  const newMaxStreak = Math.max(currentMaxStreak, newStreak);

  return {
    type: "relationship_performance_view",
    relationship_card_id: relationshipCardId,
    library_id: event.library_id,
    user_id: event.user_id,
    total_reviews: newTotalReviews,
    correct_reviews: newCorrectReviews,
    accuracy_rate: newAccuracyRate,
    avg_seconds: newAvgSeconds,
    streak: newStreak,
    max_streak: newMaxStreak,
    last_reviewed_at: event.occurred_at,
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };
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

    const payload = payloadValidation.data;
    const relationshipCardId = event.entity.id;

    if (event.entity.kind !== "relationship_card") {
      return {
        success: false,
        eventId: event.event_id,
        relationshipCardId: relationshipCardId,
        scheduleViewUpdated: false,
        performanceViewUpdated: false,
        idempotent: false,
        error: `Expected entity.kind to be "relationship_card", got "${event.entity.kind}"`,
      };
    }

    const result = await firestore.runTransaction(async (transaction) => {
      const scheduleViewPath = getRelationshipScheduleViewPath(event.user_id, event.library_id, relationshipCardId);
      const performanceViewPath = getRelationshipPerformanceViewPath(event.user_id, event.library_id, relationshipCardId);

      const scheduleViewRef = firestore.doc(scheduleViewPath);
      const performanceViewRef = firestore.doc(performanceViewPath);

      const [scheduleViewDoc, performanceViewDoc] = await Promise.all([
        transaction.get(scheduleViewRef),
        transaction.get(performanceViewRef),
      ]);

      const scheduleView = scheduleViewDoc.exists ? scheduleViewDoc.data() : undefined;
      const performanceView = performanceViewDoc.exists ? performanceViewDoc.data() : undefined;

      const shouldApplySchedule = shouldApplyEvent(scheduleView?.last_applied, event);
      const shouldApplyPerformance = shouldApplyEvent(performanceView?.last_applied, event);

      if (!shouldApplySchedule && !shouldApplyPerformance) {
        return {
          scheduleUpdated: false,
          performanceUpdated: false,
          idempotent: true,
        };
      }

      const scheduleUpdate = shouldApplySchedule
        ? calculateScheduleViewUpdate(scheduleView, event, payload)
        : null;
      const performanceUpdate = shouldApplyPerformance
        ? calculatePerformanceViewUpdate(performanceView, event, payload)
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

