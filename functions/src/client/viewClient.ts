/**
 * Client-Side View Reading
 * 
 * Functions to read projected views from Firestore.
 * Views are the read model updated by the projector.
 */

import { Firestore } from "@google-cloud/firestore";

/**
 * Card Schedule View
 * Read model for card scheduling state
 */
export interface CardScheduleView {
  type: "card_schedule_view";
  card_id: string;
  library_id: string;
  user_id: string;
  state: number; // 0=new, 1=learning, 2=review, 3=mastered
  due_at: string;
  stability: number;
  difficulty: number;
  interval_days: number;
  last_reviewed_at: string;
  last_grade: "again" | "hard" | "good" | "easy";
  last_applied: {
    received_at: string;
    event_id: string;
  };
  updated_at: string;
}

/**
 * Card Performance View
 * Read model for card performance metrics
 */
export interface CardPerformanceView {
  type: "card_performance_view";
  card_id: string;
  library_id: string;
  user_id: string;
  total_reviews: number;
  correct_reviews: number;
  accuracy_rate: number;
  avg_seconds: number;
  streak: number;
  max_streak: number;
  last_reviewed_at: string;
  last_applied: {
    received_at: string;
    event_id: string;
  };
  updated_at: string;
}

/**
 * Gets the Firestore path for a card schedule view
 */
function getCardScheduleViewPath(userId: string, libraryId: string, cardId: string): string {
  return `users/${userId}/libraries/${libraryId}/views/card_schedule/${cardId}`;
}

/**
 * Gets the Firestore path for a card performance view
 */
function getCardPerformanceViewPath(userId: string, libraryId: string, cardId: string): string {
  return `users/${userId}/libraries/${libraryId}/views/card_perf/${cardId}`;
}

/**
 * Reads a card schedule view from Firestore
 * 
 * @param firestore - Firestore instance (client SDK)
 * @param userId - User ID
 * @param libraryId - Library ID
 * @param cardId - Card ID
 * @returns Card schedule view or null if not found
 */
export async function getCardScheduleView(
  firestore: Firestore,
  userId: string,
  libraryId: string,
  cardId: string
): Promise<CardScheduleView | null> {
  const path = getCardScheduleViewPath(userId, libraryId, cardId);
  const doc = await firestore.doc(path).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as CardScheduleView;
}

/**
 * Reads a card performance view from Firestore
 * 
 * @param firestore - Firestore instance (client SDK)
 * @param userId - User ID
 * @param libraryId - Library ID
 * @param cardId - Card ID
 * @returns Card performance view or null if not found
 */
export async function getCardPerformanceView(
  firestore: Firestore,
  userId: string,
  libraryId: string,
  cardId: string
): Promise<CardPerformanceView | null> {
  const path = getCardPerformanceViewPath(userId, libraryId, cardId);
  const doc = await firestore.doc(path).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as CardPerformanceView;
}

/**
 * Queries all due cards for a user/library
 * Returns cards where due_at <= now
 * 
 * @param firestore - Firestore instance (client SDK)
 * @param userId - User ID
 * @param libraryId - Library ID
 * @param limit - Maximum number of cards to return (default: 50)
 * @returns Array of card schedule views that are due
 */
export async function getDueCards(
  firestore: Firestore,
  userId: string,
  libraryId: string,
  limit: number = 50
): Promise<CardScheduleView[]> {
  const now = new Date().toISOString();
  const viewsPath = `users/${userId}/libraries/${libraryId}/views/card_schedule`;

  // Note: In client SDK, use: collection(firestore, viewsPath) instead
  // This is server SDK syntax for documentation
  const collectionRef = (firestore as any).collection(viewsPath);
  const snapshot = await collectionRef
    .where("due_at", "<=", now)
    .orderBy("due_at", "asc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => doc.data() as CardScheduleView);
}

/**
 * Gets multiple card schedule views by card IDs
 * 
 * @param firestore - Firestore instance (client SDK)
 * @param userId - User ID
 * @param libraryId - Library ID
 * @param cardIds - Array of card IDs
 * @returns Map of cardId -> CardScheduleView (only includes cards that exist)
 */
export async function getCardScheduleViews(
  firestore: Firestore,
  userId: string,
  libraryId: string,
  cardIds: string[]
): Promise<Map<string, CardScheduleView>> {
  const views = new Map<string, CardScheduleView>();

  // Firestore getAll supports up to 10 docs at a time
  const batchSize = 10;
  for (let i = 0; i < cardIds.length; i += batchSize) {
    const batch = cardIds.slice(i, i + batchSize);
    const refs = batch.map((cardId) =>
      firestore.doc(getCardScheduleViewPath(userId, libraryId, cardId))
    );

    const docs = await firestore.getAll(...refs);
    docs.forEach((doc) => {
      if (doc.exists) {
        const view = doc.data() as CardScheduleView;
        views.set(view.card_id, view);
      }
    });
  }

  return views;
}

/**
 * Gets multiple card performance views by card IDs
 * 
 * @param firestore - Firestore instance (client SDK)
 * @param userId - User ID
 * @param libraryId - Library ID
 * @param cardIds - Array of card IDs
 * @returns Map of cardId -> CardPerformanceView (only includes cards that exist)
 */
export async function getCardPerformanceViews(
  firestore: Firestore,
  userId: string,
  libraryId: string,
  cardIds: string[]
): Promise<Map<string, CardPerformanceView>> {
  const views = new Map<string, CardPerformanceView>();

  // Firestore getAll supports up to 10 docs at a time
  const batchSize = 10;
  for (let i = 0; i < cardIds.length; i += batchSize) {
    const batch = cardIds.slice(i, i + batchSize);
    const refs = batch.map((cardId) =>
      firestore.doc(getCardPerformanceViewPath(userId, libraryId, cardId))
    );

    const docs = await firestore.getAll(...refs);
    docs.forEach((doc) => {
      if (doc.exists) {
        const view = doc.data() as CardPerformanceView;
        views.set(view.card_id, view);
      }
    });
  }

  return views;
}

