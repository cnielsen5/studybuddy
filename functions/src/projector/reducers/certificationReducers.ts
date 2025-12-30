/**
 * Certification View Reducers
 * 
 * Pure functions for concept certification view updates.
 */

import { UserEvent } from "../eventProjector";
import { MasteryCertificationCompletedPayloadSchema } from "../../validation/schemas";
import { z } from "zod";

type MasteryCertificationCompletedPayload = z.infer<typeof MasteryCertificationCompletedPayloadSchema>;

export interface ConceptCertificationView {
  type: "concept_certification_view";
  concept_id: string;
  library_id: string;
  user_id: string;
  certification_result: "full" | "partial" | "none";
  certification_date: string;
  questions_answered: number;
  correct_count: number;
  accuracy: number;
  reasoning_quality?: "good" | "weak";
  certification_history: Array<{
    certification_result: "full" | "partial" | "none";
    date: string;
    questions_answered: number;
    correct_count: number;
    reasoning_quality?: "good" | "weak";
  }>;
  last_applied: {
    received_at: string;
    event_id: string;
  };
  updated_at: string;
}

export function reduceConceptCertification(
  prev: ConceptCertificationView | undefined,
  event: UserEvent
): ConceptCertificationView {
  const payload = MasteryCertificationCompletedPayloadSchema.parse(event.payload);
  const conceptId = event.entity.id;

  // Calculate accuracy (monotonic: bounded between 0 and 1)
  const accuracy = payload.questions_answered > 0
    ? Math.max(0, Math.min(1, payload.correct_count / payload.questions_answered))
    : 0;

  return {
    type: "concept_certification_view",
    concept_id: conceptId,
    library_id: event.library_id,
    user_id: event.user_id,
    certification_result: payload.certification_result,
    certification_date: event.occurred_at,
    questions_answered: payload.questions_answered,
    correct_count: payload.correct_count,
    accuracy: accuracy,
    reasoning_quality: payload.reasoning_quality,
    certification_history: [
      ...(prev?.certification_history || []),
      {
        certification_result: payload.certification_result,
        date: event.occurred_at,
        questions_answered: payload.questions_answered,
        correct_count: payload.correct_count,
        reasoning_quality: payload.reasoning_quality,
      },
    ],
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };
}

export function shouldApplyCertificationEvent(
  prev: ConceptCertificationView | undefined,
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

