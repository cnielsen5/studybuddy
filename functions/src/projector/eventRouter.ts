/**
 * Event Router
 * 
 * Routes events by type to appropriate projectors.
 * 
 * Current projectors:
 * - card_reviewed → CardProjector
 * 
 * Future projectors:
 * - question_attempted → QuestionProjector
 * - relationship_reviewed → RelationshipProjector
 * - misconception_probe_result → MisconceptionProjector
 */

import { Firestore } from "@google-cloud/firestore";
import { UserEvent, ProjectionResult } from "./eventProjector";
import { projectCardReviewedEvent } from "./cardProjector";

/**
 * Routes an event to the appropriate projector based on event.type
 */
export async function routeEvent(
  firestore: Firestore,
  event: UserEvent
): Promise<ProjectionResult> {
  switch (event.type) {
    case "card_reviewed":
      const cardResult = await projectCardReviewedEvent(firestore, event);
      return {
        success: cardResult.success,
        eventId: cardResult.eventId,
        error: cardResult.error,
      };

    // Future event types:
    // case "question_attempted":
    //   return await projectQuestionAttemptedEvent(firestore, event);
    // case "relationship_reviewed":
    //   return await projectRelationshipReviewedEvent(firestore, event);
    // case "misconception_probe_result":
    //   return await projectMisconceptionProbeEvent(firestore, event);

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

