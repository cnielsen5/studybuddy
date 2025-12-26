import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { setGlobalOptions } from "firebase-functions/v2";

// Initialize Admin SDK FIRST before any other operations
// Wrap in try-catch to prevent startup failures
try {
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }
} catch (error) {
  // Admin might already be initialized - that's okay
  console.error("Admin SDK initialization note:", error);
}

// Export the triggers so Firebase knows they exist
export * from "./triggers";

const db = admin.firestore();

// Set global options for v2 functions
setGlobalOptions({ maxInstances: 10 });

const AUTH_ERROR = "The request must be authenticated.";

function requireAuth(request: functions.https.CallableRequest): string {
  if (!request.auth) {
    throw new functions.https.HttpsError("unauthenticated", AUTH_ERROR);
  }
  return request.auth.uid;
}

// --- 1. The Sync Endpoint ---
// Returns RAW data. The Client does the sorting.
interface SyncRequest {
  lastSyncTimestamp?: string; // ISO String
}

export const syncUserData = functions.https.onCall(
  async (request: functions.https.CallableRequest) => {
    const userId = requireAuth(request);
    const data = request.data as SyncRequest;
    
    // Default to 1970 if no timestamp provided (Full Sync)
    const lastSync = data.lastSyncTimestamp 
      ? new Date(data.lastSyncTimestamp) 
      : new Date(0);
      
    const lastSyncFirestore = admin.firestore.Timestamp.fromDate(lastSync);

    try {
      // A. Fetch Updates to User Progress (What changed since I last logged in?)
      // We look for writes where 'updatedAt' > lastSync
      const progressSnapshot = await db.collection("UserProgress")
        .where("userId", "==", userId)
        .where("updatedAt", ">", lastSyncFirestore)
        .get();

      const updatedProgress = progressSnapshot.docs.map(doc => doc.data());

      // B. Fetch New Cards (Optional Logic)
      // In a real app, you might sync specific Libraries here.
      // For now, let's assume the client manages library downloads separately.

      const currentServerTime = new Date().toISOString();

      return {
        success: true,
        syncedUntil: currentServerTime,
        changes: {
          progress: updatedProgress,
          // If you had logic to track deleted items, you'd send IDs here
          deletedProgressIds: [] 
        }
      };

    } catch (error) {
      logger.error("Sync Error", error);
      throw new functions.https.HttpsError("internal", "Sync failed");
    }
  }
);

// --- 2. Simplified CRUD ---
// Standard creation/deletion. 
// Note: Logic for vectors and cleanup is now handled by triggers.ts

export const createCard = functions.https.onCall(async (request: functions.https.CallableRequest) => {
    requireAuth(request);
    const data = request.data as any;
    // Validate inputs...
    if (!data.question || !data.answer || !data.conceptId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing fields");
    }

    const ref = db.collection("cards").doc();
    await ref.set({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        // We explicitly set these to null/empty so the Trigger knows to fill them
        cardVector: null, 
        similarity: null
    });

    return { success: true, cardId: ref.id };
});

export const deleteCard = functions.https.onCall(async (request: functions.https.CallableRequest) => {
    requireAuth(request);
    const data = request.data as any;
    if (!data.cardId) throw new functions.https.HttpsError("invalid-argument", "Missing ID");
    
    // The trigger in triggers.ts will handle the cleanup of UserProgress!
    await db.collection("cards").doc(data.cardId).delete();
    
    return { success: true };
});

interface OfflineProgressUpdate {
    cardId: string;
    // The full progress object from the client
    data: {
      userId: string;
      cardId: string;
      nextReviewDate: string; // ISO String
      lastReviewDate: string; // ISO String
      updatedAt: string;      // ISO String (CRITICAL for conflict res)
      // ... other FSRS fields (stability, difficulty, etc)
    };
  }
  
  export const syncOfflineProgress = functions.https.onCall(
      async (request: functions.https.CallableRequest) => {
      const userId = requireAuth(request);
      const data = request.data as any;
      const updates = data.updates as OfflineProgressUpdate[];
      
      if (!updates || updates.length === 0) return { success: true, processed: 0 };
  
      const batch = db.batch();
      const refsToRead: FirebaseFirestore.DocumentReference[] = [];
  
      // 1. Prepare Reads
      // We need to check the CURRENT server state for every card being updated
      updates.forEach((update) => {
        const ref = db.collection("UserProgress").doc(`${userId}_${update.cardId}`);
        refsToRead.push(ref);
      });
  
      // 2. Read current server state (Chunked if > 10 items in production)
      // Note: In heavy production, use runTransaction for strict atomicity, 
      // but getAll + batch is cheaper and sufficient for 99% of single-user cases.
      const serverSnapshots = await db.getAll(...refsToRead);
  
      let processedCount = 0;
      let conflictCount = 0;
  
      // 3. Conflict Resolution Loop
      updates.forEach((update, index) => {
        const serverDoc = serverSnapshots[index];
        const clientTimestamp = new Date(update.data.updatedAt).getTime();
        
        let shouldWrite = true;
  
        if (serverDoc.exists) {
          const serverData = serverDoc.data();
          const serverTimestamp = serverData?.updatedAt 
            ? serverData.updatedAt.toMillis() 
            : 0;
  
          // CONFLICT LOGIC: Last-Write-Wins
          // If the server has a NEWER timestamp than the client, ignore the client.
          // This happens if I studied on my iPad (online) AFTER studying on my iPhone (offline).
          if (serverTimestamp > clientTimestamp) {
            shouldWrite = false;
            conflictCount++;
            logger.info(`Conflict: ID ${update.cardId} - Server is newer. Ignoring client update.`);
          }
        }
  
        if (shouldWrite) {
          // Convert ISO strings back to Firestore Timestamps for storage
          const safeData = {
            ...update.data,
            nextReviewDate: admin.firestore.Timestamp.fromDate(new Date(update.data.nextReviewDate)),
            lastReviewDate: admin.firestore.Timestamp.fromDate(new Date(update.data.lastReviewDate)),
            updatedAt: admin.firestore.Timestamp.fromMillis(clientTimestamp)
          };
          
          batch.set(refsToRead[index], safeData, { merge: true });
          processedCount++;
        }
      });
  
      // 4. Commit Writes
      if (processedCount > 0) {
        await batch.commit();
      }
  
      return { 
        success: true, 
        processed: processedCount, 
        conflicts: conflictCount 
      };
    }
  );