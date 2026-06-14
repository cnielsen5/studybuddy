export function getViewsCollectionPath(userId: string, libraryId: string): string {
  return `users/${userId}/libraries/${libraryId}/views`;
}

export function getViewPath(
  userId: string,
  libraryId: string,
  viewType: string,
  entityId: string
): string {
  return `${getViewsCollectionPath(userId, libraryId)}/${viewType}__${entityId}`;
}

export function getCardScheduleViewPath(
  userId: string,
  libraryId: string,
  cardId: string
): string {
  return getViewPath(userId, libraryId, "card_schedule", cardId);
}

export function getEventPath(
  userId: string,
  libraryId: string,
  eventId: string
): string {
  return `users/${userId}/libraries/${libraryId}/events/${eventId}`;
}
