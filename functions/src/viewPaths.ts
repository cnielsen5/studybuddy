/**
 * Firestore view document paths.
 *
 * Views live at:
 *   users/{userId}/libraries/{libraryId}/views/{viewDocId}
 *
 * where viewDocId = "{viewType}__{entityId}" (6 path segments total).
 *
 * Firestore document paths require an even number of segments.
 * The previous 7-segment layout (views/{viewType}/{entityId}) was invalid.
 */

export const VIEW_DOC_ID_SEPARATOR = "__" as const;

export type ViewType =
  | "card_schedule"
  | "card_perf"
  | "question_perf"
  | "relationship_schedule"
  | "relationship_perf"
  | "misconception_edge"
  | "session"
  | "card_annotation"
  | "concept_certification";

export function buildViewDocId(viewType: ViewType, entityId: string): string {
  return `${viewType}${VIEW_DOC_ID_SEPARATOR}${entityId}`;
}

export function getViewsCollectionPath(userId: string, libraryId: string): string {
  return `users/${userId}/libraries/${libraryId}/views`;
}

export function getViewPath(
  userId: string,
  libraryId: string,
  viewType: ViewType,
  entityId: string
): string {
  return `${getViewsCollectionPath(userId, libraryId)}/${buildViewDocId(viewType, entityId)}`;
}

export function getCardScheduleViewPath(
  userId: string,
  libraryId: string,
  cardId: string
): string {
  return getViewPath(userId, libraryId, "card_schedule", cardId);
}

export function getCardPerformanceViewPath(
  userId: string,
  libraryId: string,
  cardId: string
): string {
  return getViewPath(userId, libraryId, "card_perf", cardId);
}

export function getQuestionPerformanceViewPath(
  userId: string,
  libraryId: string,
  questionId: string
): string {
  return getViewPath(userId, libraryId, "question_perf", questionId);
}

export function getRelationshipScheduleViewPath(
  userId: string,
  libraryId: string,
  relationshipCardId: string
): string {
  return getViewPath(userId, libraryId, "relationship_schedule", relationshipCardId);
}

export function getRelationshipPerformanceViewPath(
  userId: string,
  libraryId: string,
  relationshipCardId: string
): string {
  return getViewPath(userId, libraryId, "relationship_perf", relationshipCardId);
}

export function getMisconceptionEdgeViewPath(
  userId: string,
  libraryId: string,
  misconceptionId: string
): string {
  return getViewPath(userId, libraryId, "misconception_edge", misconceptionId);
}

export function getSessionViewPath(
  userId: string,
  libraryId: string,
  sessionId: string
): string {
  return getViewPath(userId, libraryId, "session", sessionId);
}

export function getCardAnnotationViewPath(
  userId: string,
  libraryId: string,
  cardId: string
): string {
  return getViewPath(userId, libraryId, "card_annotation", cardId);
}

export function getConceptCertificationViewPath(
  userId: string,
  libraryId: string,
  conceptId: string
): string {
  return getViewPath(userId, libraryId, "concept_certification", conceptId);
}

export function getSessionSummaryPath(
  userId: string,
  libraryId: string,
  sessionId: string
): string {
  return `users/${userId}/libraries/${libraryId}/session_summaries/${sessionId}`;
}
