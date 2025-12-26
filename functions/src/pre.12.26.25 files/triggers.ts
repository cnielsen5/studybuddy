// functions/src/triggers.ts
import { onDocumentCreated, onDocumentDeleted } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";
import { generateEmbedding } from "./ai"; // Import our new Genkit helper

// Initialize Admin SDK if not already done
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

// --- 1. Vector Generation Trigger ---
// Listens for new Cards. Calls Gemini via Genkit. Updates Card.
export const onCardCreated = onDocumentCreated("cards/{cardId}", async (event) => {
    const cardData = event.data?.data();
    const cardId = event.params.cardId;

    // Safety Check: Don't waste AI tokens on empty cards
    if (!cardData || !cardData.question || !cardData.answer) {
      logger.warn(`Skipping vector generation for incomplete card: ${cardId}`);
      return;
    }

    try {
      // 1. Generate Embedding (Gemini text-embedding-004)
      // We combine Question and Answer for richer semantic context
      const combinedText = `Q: ${cardData.question} A: ${cardData.answer}`;
      const vector = await generateEmbedding(combinedText);

      // 2. Find Similar Cards (Placeholder for Vector Search Logic)
      // NOTE: When you implement real Vector Search (Pinecone/Firestore Vector Search),
      // ensure you configure your index for 768 dimensions!
      const similarCardIds: string[] = []; // Implementation depends on your vector DB choice

      // 3. Update the Card with the Vector
      await event.data?.ref.update({
        cardVector: vector, // 768-dimensional array
        similarity: {
          similar_card_ids: similarCardIds,
        },
        // Denormalize Concept ID if missing, or log if it's orphaned
        conceptId: cardData.conceptId || "orphaned_concept"
      });

      // 4. Update the Parent Concept Centroid
      if (cardData.conceptId) {
        await updateConceptCentroid(cardData.conceptId, vector);
      }

      logger.info(`Generated Gemini vectors for card ${cardId}`);
    } catch (error) {
      logger.error(`Vector generation failed for ${cardId}`, error);
    }
  });

// --- 2. Concept Centroid Updater ---
// Recalculates the average vector for a concept when a card is added
async function updateConceptCentroid(conceptId: string, newCardVector: number[]) {
    const conceptRef = db.collection("concepts").doc(conceptId);
    
    // Using a transaction ensures we don't have race conditions if 
    // two users add cards to the same concept simultaneously.
    await db.runTransaction(async (t) => {
        const conceptDoc = await t.get(conceptRef);
        if (!conceptDoc.exists) return;

        const data = conceptDoc.data();
        const currentCount = data?.cardCount || 0;
        const currentCentroid = data?.conceptCentroidVector;

        // Math: Incremental Mean Calculation
        // NewAverage = (OldAverage * OldCount + NewVector) / (OldCount + 1)
        const newCount = currentCount + 1;
        let newCentroid: number[] = [];

        if (!currentCentroid || currentCentroid.length !== newCardVector.length) {
            // First card or data mismatch: Reset to the new vector
            newCentroid = newCardVector;
        } else {
            newCentroid = currentCentroid.map((val: number, index: number) => {
                return ((val * currentCount) + newCardVector[index]) / newCount;
            });
        }
        
        t.update(conceptRef, {
            cardCount: newCount,
            conceptCentroidVector: newCentroid
        });
    });
}

// --- 3. The Cleanup Trigger (Widow Maker Fix) ---
// If a card is deleted, delete all UserProgress associated with it
export const onCardDeleted = onDocumentDeleted("cards/{cardId}", async (event) => {
    const cardId = event.params.cardId;
    
    const batch = db.batch();
    const progressDocs = await db.collection("UserProgress")
      .where("cardId", "==", cardId)
      .get();

    if (progressDocs.empty) return;

    progressDocs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    logger.info(`Cleaned up ${progressDocs.size} progress records for deleted card ${cardId}`);
  });