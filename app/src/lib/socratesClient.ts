import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
  type Firestore,
} from "firebase/firestore";
import { createCardReviewedEvent } from "./events";
import type { CardScheduleView, ReviewGrade, UserEvent } from "./types";
import {
  getCardScheduleViewPath,
  getEventPath,
  getViewsCollectionPath,
} from "./viewPaths";

export interface UploadResult {
  success: boolean;
  eventId: string;
  path: string;
  idempotent: boolean;
  error?: string;
}

export class SocratesClient {
  private firestore: Firestore;
  private userId: string;
  private libraryId: string;
  private deviceId: string;

  constructor(
    firestore: Firestore,
    userId: string,
    libraryId: string,
    deviceId: string = "unknown"
  ) {
    this.firestore = firestore;
    this.userId = userId;
    this.libraryId = libraryId;
    this.deviceId = deviceId;
  }

  async uploadEvent(event: UserEvent): Promise<UploadResult> {
    const path = getEventPath(event.user_id, event.library_id, event.event_id);
    const eventRef = doc(this.firestore, path);

    try {
      const existing = await getDoc(eventRef);
      if (existing.exists()) {
        return {
          success: true,
          eventId: event.event_id,
          path,
          idempotent: true,
        };
      }

      await setDoc(eventRef, event);
      return {
        success: true,
        eventId: event.event_id,
        path,
        idempotent: false,
      };
    } catch (error) {
      return {
        success: false,
        eventId: event.event_id,
        path,
        idempotent: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  async reviewCard(
    cardId: string,
    grade: ReviewGrade,
    secondsSpent: number
  ): Promise<UploadResult> {
    const event = createCardReviewedEvent({
      userId: this.userId,
      libraryId: this.libraryId,
      cardId,
      grade,
      secondsSpent,
      deviceId: this.deviceId,
    });
    return this.uploadEvent(event);
  }

  async getCardSchedule(cardId: string): Promise<CardScheduleView | null> {
    const path = getCardScheduleViewPath(this.userId, this.libraryId, cardId);
    const snap = await getDoc(doc(this.firestore, path));
    if (!snap.exists()) return null;
    return snap.data() as CardScheduleView;
  }

  async getDueCards(max = 50): Promise<CardScheduleView[]> {
    const now = new Date().toISOString();
    const viewsPath = getViewsCollectionPath(this.userId, this.libraryId);
    const q = query(
      collection(this.firestore, viewsPath),
      where("type", "==", "card_schedule_view"),
      where("due_at", "<=", now),
      orderBy("due_at", "asc"),
      limit(max)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as CardScheduleView);
  }

  async getAllCardSchedules(max = 200): Promise<CardScheduleView[]> {
    const viewsPath = getViewsCollectionPath(this.userId, this.libraryId);
    const q = query(
      collection(this.firestore, viewsPath),
      where("type", "==", "card_schedule_view"),
      limit(max)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => d.data() as CardScheduleView);
  }
}
