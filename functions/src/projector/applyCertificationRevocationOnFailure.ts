import { Firestore } from "@google-cloud/firestore";
import { getCardConceptId, getConceptCardMeta } from "../content/libraryCatalog";
import { UserEvent } from "./eventProjector";
import { CardScheduleView } from "./reducers/cardReducers";
import { reduceCertificationSuppressionRevocation } from "./reducers/certificationScheduleReducers";
import { getCardScheduleViewPath } from "../viewPaths";

/**
 * When a user fails a card review, revoke certification suppression on sibling
 * cards in the same concept (organizer §13.8).
 */
export async function applyCertificationRevocationOnFailure(
  firestore: Firestore,
  event: UserEvent,
  reviewedCardId: string
): Promise<number> {
  const conceptId = getCardConceptId(event.library_id, reviewedCardId);
  if (!conceptId) {
    return 0;
  }

  const siblingMeta = getConceptCardMeta(event.library_id, conceptId);
  if (siblingMeta.length === 0) {
    return 0;
  }

  const scheduleReads = await Promise.all(
    siblingMeta.map(async (meta) => {
      const path = getCardScheduleViewPath(
        event.user_id,
        event.library_id,
        meta.cardId
      );
      const doc = await firestore.doc(path).get();
      return {
        meta,
        path,
        schedule: doc.exists ? (doc.data() as CardScheduleView) : undefined,
      };
    })
  );

  const batch = firestore.batch();
  let schedulesUpdated = 0;

  for (const { path, schedule } of scheduleReads) {
    const updated = reduceCertificationSuppressionRevocation(schedule, event);
    if (updated) {
      batch.set(firestore.doc(path), updated, { merge: false });
      schedulesUpdated++;
    }
  }

  if (schedulesUpdated > 0) {
    await batch.commit();
  }

  return schedulesUpdated;
}
