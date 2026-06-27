import { Firestore } from "@google-cloud/firestore";
import { getConceptCardMeta } from "../content/libraryCatalog";
import {
  resolveCertificationScheduleAction,
  type CertificationResult,
} from "../core/certification/certificationSchedulePolicy";
import { UserEvent } from "./eventProjector";
import { CardScheduleView } from "./reducers/cardReducers";
import { reduceCertificationScheduleEffect } from "./reducers/certificationScheduleReducers";
import { getCardScheduleViewPath } from "../viewPaths";

export async function applyCertificationScheduleEffects(
  firestore: Firestore,
  event: UserEvent,
  conceptId: string,
  certificationResult: CertificationResult
): Promise<number> {
  const cardMeta = getConceptCardMeta(event.library_id, conceptId);
  if (cardMeta.length === 0) {
    return 0;
  }

  const scheduleReads = await Promise.all(
    cardMeta.map(async (meta) => {
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

  for (const { meta, path, schedule } of scheduleReads) {
    const action = resolveCertificationScheduleAction(
      certificationResult,
      meta,
      schedule
    );
    const updated = reduceCertificationScheduleEffect(schedule, meta.cardId, event, {
      certificationResult,
      action,
    });

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
