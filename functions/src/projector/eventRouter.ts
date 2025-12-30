/**
 * Event Router
 * 
 * Routes events by type to appropriate projectors.
 * 
 * Supported event types:
 * - card_reviewed → CardProjector
 * - question_attempted → QuestionProjector
 * - relationship_reviewed → RelationshipProjector
 * - misconception_probe_result → MisconceptionProjector
 * - session_started → SessionProjector
 * - session_ended → SessionProjector
 * - acceleration_applied → ScheduleUpdateProjector
 * - lapse_applied → ScheduleUpdateProjector
 */

import { Firestore } from "@google-cloud/firestore";
import { UserEvent, ProjectionResult } from "./eventProjector";
import { projectCardReviewedEvent } from "./cardProjector";
import { projectQuestionAttemptedEvent } from "./questionProjector";
import { projectRelationshipReviewedEvent } from "./relationshipProjector";
import { projectMisconceptionProbeResultEvent } from "./misconceptionProjector";
import { projectSessionStartedEvent, projectSessionEndedEvent } from "./sessionProjector";
import { projectAccelerationAppliedEvent, projectLapseAppliedEvent } from "./scheduleUpdateProjector";

/**
 * Routes an event to the appropriate projector based on event.type
 */
export async function routeEvent(
  firestore: Firestore,
  event: UserEvent
): Promise<ProjectionResult> {
  switch (event.type) {
    case "card_reviewed": {
      const cardResult = await projectCardReviewedEvent(firestore, event);
      return {
        success: cardResult.success,
        eventId: cardResult.eventId,
        error: cardResult.error,
      };
    }

    case "question_attempted": {
      const questionResult = await projectQuestionAttemptedEvent(firestore, event);
      return {
        success: questionResult.success,
        eventId: questionResult.eventId,
        error: questionResult.error,
      };
    }

    case "relationship_reviewed": {
      const relationshipResult = await projectRelationshipReviewedEvent(firestore, event);
      return {
        success: relationshipResult.success,
        eventId: relationshipResult.eventId,
        error: relationshipResult.error,
      };
    }

    case "misconception_probe_result": {
      const misconceptionResult = await projectMisconceptionProbeResultEvent(firestore, event);
      return {
        success: misconceptionResult.success,
        eventId: misconceptionResult.eventId,
        error: misconceptionResult.error,
      };
    }

    case "session_started": {
      const sessionResult = await projectSessionStartedEvent(firestore, event);
      return {
        success: sessionResult.success,
        eventId: sessionResult.eventId,
        error: sessionResult.error,
      };
    }

    case "session_ended": {
      const sessionResult = await projectSessionEndedEvent(firestore, event);
      return {
        success: sessionResult.success,
        eventId: sessionResult.eventId,
        error: sessionResult.error,
      };
    }

    case "acceleration_applied": {
      const scheduleResult = await projectAccelerationAppliedEvent(firestore, event);
      return {
        success: scheduleResult.success,
        eventId: scheduleResult.eventId,
        error: scheduleResult.error,
      };
    }

    case "lapse_applied": {
      const scheduleResult = await projectLapseAppliedEvent(firestore, event);
      return {
        success: scheduleResult.success,
        eventId: scheduleResult.eventId,
        error: scheduleResult.error,
      };
    }

    // Events that don't need projection (or are handled elsewhere):
    // - library_id_map_applied: System event, no view needed
    // - content_flagged: Moderation event, may have separate workflow
    // - card_annotation_updated: User preference, may be handled separately
    // - mastery_certification_started/completed: May need separate projector
    // - intervention_accepted/rejected: Analytics events, may not need views

    default:
      // Unknown event type - log but don't fail
      // This allows new event types to be added without breaking the projector
      return {
        success: true,
        eventId: event.event_id,
        error: `No projector for event type: ${event.type}`,
      };
  }
}

