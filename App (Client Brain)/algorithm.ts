/**
 * Sorts the due cards based on Priority Index and applies VDB-based
 * interleaving logic to create the final queue.
 * @param {any[]} dueCardsWithP Array of cards with calculated P-Index.
 * @param {Map<string, any>} cardDetailsMap Map of static card details.
 * @param {Map<string, any>} conceptDetailsMap Map of static concept details.
 * @param {Map<string, string[]>} similarityCache Cache of similar card IDs.
 * @return {any[]} The final, optimally interleaved session queue.
 */
function finalizeReviewQueue(
    dueCardsWithP: any[],
    cardDetailsMap: Map<string, any>,
    conceptDetailsMap: Map<string, any>,
    similarityCache: Map<string, string[]>
  ): any[] {
    // --- Phase 1: Primary Sorting (P-Index) ---
    const sortedQueue = dueCardsWithP.sort(
      (a, b) => b.priorityIndex - a.priorityIndex
    );
  
    // --- Phase 2: Interleaving Pass ---
    const finalQueue: any[] = [];
    const recentlyUsedConceptIds = new Set<string>();
    const recentlyUsedCardIds = new Set<string>();
  
    while (sortedQueue.length > 0) {
      let bestCardIndex = -1;
      for (let i = 0; i < sortedQueue.length; i++) {
        const card = sortedQueue[i];
        const cardDetails = cardDetailsMap.get(card.cardId);
        const conceptId = cardDetails ? cardDetails.conceptId : null;
  
        // Rule 1: Avoid back-to-back concepts (Coarse Interleaving)
        if (recentlyUsedConceptIds.has(conceptId)) continue;
  
        // Rule 2: Avoid similar cards (Fine-Grained Interleaving)
        const similarCards = similarityCache.get(card.cardId) || [];
        const hasSimilarRecentlyUsed = similarCards.some(
          (simId) => recentlyUsedCardIds.has(simId)
        );
        if (hasSimilarRecentlyUsed) continue;
  
        bestCardIndex = i;
        break;
      }
  
      if (bestCardIndex !== -1) {
        const card = sortedQueue.splice(bestCardIndex, 1)[0];
        const cardDetails = cardDetailsMap.get(card.cardId);
  
        // Update recent history with simple decay
        recentlyUsedConceptIds.add(cardDetails.conceptId);
        recentlyUsedCardIds.add(card.cardId);
        if (recentlyUsedConceptIds.size > 3) {
          recentlyUsedConceptIds.delete(Array.from(recentlyUsedConceptIds)[0]);
        }
        if (recentlyUsedCardIds.size > 5) {
          recentlyUsedCardIds.delete(Array.from(recentlyUsedCardIds)[0]);
        }
  
        finalQueue.push(card);
      } else {
        // If unable to interleave, append the rest (prioritized)
        finalQueue.push(...sortedQueue);
        break;
      }
    }
  
    return finalQueue;
  }
  
  /**
   * Generates the Master Review Queue for the next 7 days, prioritizing by
   * P-Index.
   * @param {string} userId The ID of the current user.
   * @param {number} daysAhead The number of days to look ahead (7).
   * @return {Promise<any[]>} An array of prioritized, interleaved cards.
   */
  async function generateMasterReviewQueue(
    userId: string,
    daysAhead: number
  ): Promise<any[]> {
    const now = admin.firestore.Timestamp.now();
    const futureMs = now.toMillis() + daysAhead * 24 * 60 * 60 * 1000;
    const future = admin.firestore.Timestamp.fromMillis(futureMs);
  
    // 1. Fetch all UserProgress due in the next 7 days
    const progressSnapshot = await db
      .collection("UserProgress")
      .where("userId", "==", userId)
      .where("nextReviewDate", "<=", future)
      .orderBy("nextReviewDate", "asc")
      .get();
  
    const dueCardsWithP: any[] = [];
    const cardIdsToQuery: string[] = [];
  
    progressSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const nextTimeMs = data.nextReviewDate.toMillis();
      const lastTimeMs = data.lastReviewDate ?
        data.lastReviewDate.toMillis() :
        nextTimeMs - 3 * 24 * 60 * 60 * 1000; // Default 3 days for Learning
  
      // --- P Index Calculation ---
      const currentTimeMs = Date.now();
      const timeOverdueMs = Math.max(0, currentTimeMs - nextTimeMs);
      const currentIntervalMs = Math.max(1, nextTimeMs - lastTimeMs);
  
      const priorityIndex = timeOverdueMs / currentIntervalMs;
  
      dueCardsWithP.push({
        ...data,
        priorityIndex: priorityIndex,
        cardId: data.cardId,
      });
      cardIdsToQuery.push(data.cardId);
    });
  
    // 2. Fetch Card Vectors and Concept Centroids
    const [cardDetailsMap] = await fetchCardAndConceptDetails(cardIdsToQuery);
  
    // 3. VDB Query for Interleaving Data
    const similarityCacheObj = await batchQueryVDB(cardDetailsMap);
    const similarityCache = new Map<string, string[]>(
      Object.entries(similarityCacheObj)
    );
  
    // 4. Final Interleaving and Sorting
    return finalizeReviewQueue(
      dueCardsWithP,
      cardDetailsMap,
      new Map(),
      similarityCache
    );
  }

  

// ----------------------------------------------------------------------
// NOTE: THIS FUNCTION IS THE FSRS CORE LOGIC (PLACEHOLDER)
// In the final design, the client will run the equivalent logic locally.
// ----------------------------------------------------------------------
/**
 * Calculates new FSRS metrics and applies stage transition rules.
 * NOTE: Conceptual implementation; replace with production FSRS.
 * @param {any} currentProgress Stored progress document.
 * @param {number} ratingScore Numeric score mapped from user rating.
 * @param {number} responseTimeMs Response duration for current card.
 * @return {SrsMetricsUpdate} Updated schedule metrics.
 */
function calculateFSRSAndStage(
    currentProgress: any,
    ratingScore: number,
    responseTimeMs: number
  ): SrsMetricsUpdate {
    const {srsStability = 1, stage = "Learning", timesReviewed = 0} =
      currentProgress || {};
    let newStability: number;
    let newStage = stage;
    let boostMagnitude = 0;
  
    if (stage === "Learning") {
      newStability = srsStability * (ratingScore + 1);
    } else {
      newStability = calculateStabilityFromFSRS(
        srsStability,
        ratingScore,
        responseTimeMs
      );
    }
  
    const newIntervalDays = newStability;
  
    if (newStage === "Learning" && timesReviewed >= 3 && newIntervalDays >= 7) {
      newStage = "Review";
    } else if (
      newStage === "Review" &&
      ratingScore === 3 &&
      newIntervalDays >= 90
    ) {
      newStage = "Mastered";
    } else if (ratingScore <= 0) {
      newStability = 1.3;
      newStage = "Review";
    }
  
    if (ratingScore >= 2 && newStage !== "Review") {
      boostMagnitude = ratingScore === 3 ? 0.07 : 0.05;
    }
  
    // --- 4. Fuzzing of Next Review Date (Randomization) ---
    let fuzzDays: number;
    if (newIntervalDays < 30) {
      // Short intervals (< 1 month): fuzz by up to +/- 1 day.
      fuzzDays = Math.random() * 2 - 1;
    } else {
      // Long intervals: fuzz by up to 5% of interval, max 2 days.
      const maxFuzz = Math.min(newIntervalDays * 0.05, 2);
      fuzzDays = Math.random() * (2 * maxFuzz) - maxFuzz;
    }
  
    const totalIntervalDays = newIntervalDays + fuzzDays;
    const nextReviewDate = admin.firestore.Timestamp.fromMillis(
      Date.now() + totalIntervalDays * 24 * 60 * 60 * 1000
    );
  
    return {
      stage: newStage,
      srsStability: newStability,
      nextReviewDate,
      srsEaseFactor: currentProgress?.srsEaseFactor ?? 2.5,
      boostApplied: boostMagnitude > 0,
      boostMagnitude,
    };
  }
  // ----------------------------------------------------------------------
  
  /**
   * Very rough placeholder for the FSRS stability update function.
   * @param {number} prevStability Prior stability value.
   * @param {number} ratingScore Numeric rating (0-3).
   * @param {number} responseTimeMs Measured response time.
   * @return {number} Updated stability estimate.
   */
  function calculateStabilityFromFSRS(
    prevStability: number,
    ratingScore: number,
    responseTimeMs: number
  ): number {
    const timeFactor = Math.max(0.5, Math.min(1.5, 10000 / (responseTimeMs + 1)));
    const ratingFactor = 1 + ratingScore * 0.15;
    return Math.max(1, prevStability * ratingFactor * timeFactor);
  }

  // --- 6. The Daily Session Generator Endpoint ---

/**
 * Generates the daily study session from the local queues and provides
 * Load-Aware Reporting.
 * @param {object} data Client data including queues and optional maxLoadBudget.
 * @param {functions.https.CallableContext} context Authentication context.
 * @return {Promise<object>} The final session card list and the load report.
 */
interface GetInitialStudySessionRequest {
    sessionLimit?: number;
    maxLoadBudget?: number;
    syncedReviewQueue: any[];
    syncedLearningQueue: any[];
  }
  
  export const getInitialStudySession = functions.https.onCall(
    async (data: any, context: any) => {
      requireAuth(context);
      const requestData = data as GetInitialStudySessionRequest;
      const {
        sessionLimit = 20,
        maxLoadBudget, // Present only if the user requested a less-taxing session
        syncedReviewQueue,
        syncedLearningQueue,
      } = requestData;
  
      // 1. Combine and Prioritize Queues (Learning is prioritized over Review)
      let masterSessionQueue = [
        ...syncedLearningQueue.slice(0, sessionLimit),
        ...syncedReviewQueue, // Review queue is pre-sorted by P-Index
      ];
  
      // Ensure we don't exceed the overall card limit
      masterSessionQueue = masterSessionQueue.slice(0, sessionLimit);
  
      // 2. Calculate Total Load Score
      let sessionLoadScore = 0;
      masterSessionQueue.forEach((card: any) => {
        // Use the defined load scores (0.7, 1.0, 1.3)
        sessionLoadScore += card.cardLoadScore || 1.0;
      });
  
      // 3. Optional: Intervention Check (if maxLoadBudget is provided)
      if (maxLoadBudget && sessionLoadScore > maxLoadBudget) {
        // If the calculated load exceeds the requested budget, filter down.
        const filteredQueue: any[] = [];
        let currentLoad = 0;
  
        for (const card of masterSessionQueue) {
          if (currentLoad + card.cardLoadScore <= maxLoadBudget) {
            filteredQueue.push(card);
            currentLoad += card.cardLoadScore;
          } else {
            // Stop adding cards once the budget is exceeded
            break;
          }
        }
        const finalQueue = filteredQueue;
        sessionLoadScore = currentLoad;
  
        // Update the session queue with the filtered list
        masterSessionQueue = finalQueue;
      }
  
      // 4. Fetch Historical Load Average (Simulation)
      // In production, this would query SessionHistory for the average.
      const averageHistoricalLoad = 22.5;
      const loadReport = {
        sessionLoadScore: sessionLoadScore,
        averageHistoricalLoad: averageHistoricalLoad,
        deviation: (sessionLoadScore - averageHistoricalLoad) /
          averageHistoricalLoad,
      };
  
      // 5. Return the session and the Load-Aware Report
      return {
        success: true,
        cards: masterSessionQueue,
        count: masterSessionQueue.length,
        loadReport: loadReport,
      };
    }
  );
  
  // --- 7. Card Response Handling ---
  
  /**
   * Core function to handle user card response.
   * Responsible for applying online enrichments (boosts, AFI logging).
   */
  export const handleCardResponse = functions.https.onCall(
    async (data: any, context: any) => {
      const userId = requireAuth(context);
      const {
        cardId,
        rating,
        responseTimeMs,
        sessionPerformanceSnapshot,
      } = data as CardResponseData;
  
      try {
        const {progressDoc, similarityCache} = await fetchInitialData(
          userId,
          cardId
        );
  
        const ratingScore = ratingToScore(rating);
        const newSrsMetrics = calculateFSRSAndStage(
          progressDoc.data(),
          ratingScore,
          responseTimeMs
        );
  
        if (newSrsMetrics.boostApplied) {
          await applyMasteryBoost(
            userId,
            cardId,
            newSrsMetrics.boostMagnitude,
            similarityCache
          );
        }
  
        await updateDatabase(
          userId,
          cardId,
          newSrsMetrics,
          rating,
          responseTimeMs,
          sessionPerformanceSnapshot
        );
  
        return {success: true, newNextReviewDate: newSrsMetrics.nextReviewDate};
      } catch (error) {
        logger.error(
          `Error processing card response for ${userId}/${cardId}:`,
          error
        );
        throw new functions.https.HttpsError(
          "internal",
          "Failed to process card response."
        );
      }
    }
  );
  
  /**
   * Extends intervals for cards similar to the one recently reviewed.
   * @param {string} userId The current user ID.
   * @param {string} sourceCardId Card that triggered the boost.
   * @param {number} boostMagnitude Fractional interval increase.
   * @param {Map<string, string[]>} similarityCache Similar card ids.
   * @return {Promise<void>} Resolves when boost writes complete.
   */
  async function applyMasteryBoost(
    userId: string,
    sourceCardId: string,
    boostMagnitude: number,
    similarityCache: Map<string, string[]>
  ) {
    const similarCardIds = similarityCache.get(sourceCardId) || [];
    if (similarCardIds.length === 0) return;
  
    const batch = db.batch();
    const now = admin.firestore.Timestamp.now();
    const nowMs = now.toMillis();
  
    for (const targetCardId of similarCardIds) {
      const targetProgressRef = db
        .collection("UserProgress")
        .doc(`${userId}_${targetCardId}`);
      const targetProgressDoc = await targetProgressRef.get();
      if (!targetProgressDoc.exists) continue;
  
      const targetData = targetProgressDoc.data();
      if (
        !targetData ||
        !targetData.nextReviewDate ||
        !targetData.lastReviewDate ||
        targetData.nextReviewDate.toMillis() <= nowMs
      ) {
        continue;
      }
  
      const currentIntervalMs =
        targetData.nextReviewDate.toMillis() -
        targetData.lastReviewDate.toMillis();
      const boostMs = currentIntervalMs * boostMagnitude;
      const newNextReviewDate = new Date(
        targetData.nextReviewDate.toMillis() + boostMs
      );
  
      batch.update(targetProgressRef, {
        nextReviewDate: newNextReviewDate,
        lastBoostApplied: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
  
    await batch.commit();
  }
  
  /**
   * Persists the recalculated schedule and session history info.
   * @param {string} userId The user identifier.
   * @param {string} cardId The reviewed card id.
   * @param {SrsMetricsUpdate} newSrsMetrics Updated schedule metrics.
   * @param {CardRating} rating User's self-evaluated rating.
   * @param {number} responseTimeMs Response duration in ms.
   * @param {SessionPerformanceSnapshot} sessionPerformanceSnapshot Snapshot
   * used for AFI.
   * @return {Promise<void>} Resolves when writes finish.
   */
  async function updateDatabase(
    userId: string,
    cardId: string,
    newSrsMetrics: any,
    rating: CardRating,
    responseTimeMs: number,
    sessionPerformanceSnapshot: SessionPerformanceSnapshot
  ) {
    const batch = db.batch();
    const now = admin.firestore.FieldValue.serverTimestamp();
  
    const progressRef = db.collection("UserProgress").doc(`${userId}_${cardId}`);
    batch.update(progressRef, {
      ...newSrsMetrics,
      lastReviewDate: now,
      timesReviewed: admin.firestore.FieldValue.increment(1),
      lastRating: rating,
    });
  
    const sessionHistoryRef = db.collection("SessionHistory").doc();
    const currentAfi = calculateAfi(responseTimeMs, sessionPerformanceSnapshot);
  
    batch.set(sessionHistoryRef, {
      userId,
      cardId,
      timestamp: now,
      responseTimeMs,
      currentAFI: currentAfi,
    });
  
    await batch.commit();
  }
  
  interface SrsMetricsUpdate {
    stage: string;
    srsStability: number;
    nextReviewDate: admin.firestore.Timestamp;
    srsEaseFactor: number;
    boostApplied: boolean;
    boostMagnitude: number;
  }
  
  /**
   * Converts human-readable rating labels to numeric FSRS scale.
   * @param {CardRating} rating Rating string sent from the client.
   * @return {number} Integer score in the range [0, 3].
   */
  function ratingToScore(rating: CardRating): number {
    switch (rating) {
    case "Definitely Know It":
      return 3;
    case "Think You Know It":
      return 2;
    case "Guessing":
      return 1;
    case "Did Not Know":
    default:
      return 0;
    }
  }
  
  interface FetchInitialDataResult {
    progressDoc: FirebaseFirestore.DocumentSnapshot;
    cardDoc: FirebaseFirestore.DocumentSnapshot;
    cardDetailsMap: Map<string, any>;
    similarityCache: Map<string, string[]>;
  }
  
  /**
   * Fetches the current progress document and similarity cache.
   * @param {string} userId The user requesting sync.
   * @param {string} cardId The card id under review.
   * @return {Promise<FetchInitialDataResult>} Firestore docs and similarity info.
   */
  async function fetchInitialData(
    userId: string,
    cardId: string
  ): Promise<FetchInitialDataResult> {
    const progressRef = db.collection("UserProgress").doc(`${userId}_${cardId}`);
    const progressDoc = await progressRef.get();
  
    const cardDoc = await db.collection("cards").doc(cardId).get();
    const detailsMap = new Map<string, any>();
    if (cardDoc.exists) {
      detailsMap.set(cardId, cardDoc.data());
    }
    const similarityCache = new Map<string, string[]>(
      Object.entries(await batchQueryVDB(detailsMap))
    );
  
    return {
      progressDoc,
      cardDoc,
      cardDetailsMap: detailsMap,
      similarityCache,
    };
  }

  
/**
 * Calculates the Attention/Fatigue Index (AFI) by comparing current response
 * time to the user's recent historical average.
 * @param {number} currentResponseMs The current card's response time in
 * milliseconds.
 * @param {Array<{responseTimeMs: number}>} recentPerformance Snapshot of
 * recent reviews.
 * @returns {number} The AFI score (1.0 = baseline performance).
 */
function calculateAfi(
    currentResponseMs: number,
    recentPerformance: SessionPerformanceSnapshot
  ): number {
    if (!recentPerformance.length) return 1.0;
  
    // Calculate the weighted average response time from the recent snapshot
    const totalResponseTime = recentPerformance.reduce(
      (sum, item) => sum + item.responseTimeMs,
      0
    );
    const averageHistoricalTime = totalResponseTime / recentPerformance.length;
  
    // Avoid division by zero
    if (currentResponseMs === 0) return 2.0;
  
    // AFI = Avg_Historical / Current_Time
    return averageHistoricalTime / currentResponseMs;
  }

  
/**
 * Simulates the batch query to the external Vector Database service.
 * NOTE: Requires "axios" or "node-fetch" in a real deployment.
 * @param {Map<string, any>} cardDetailsMap Map containing card vectors.
 * @return {Promise<SimilarityCache>} A cache of the top K similar card IDs.
 */
async function batchQueryVDB(
    cardDetailsMap: Map<string, any>
  ): Promise<SimilarityCache> {
    const vectorsToQuery = Array.from(cardDetailsMap.entries()).map(
      ([id, details]) => ({
        id: id,
        vector: details.cardVector,
      })
    );
  
    if (vectorsToQuery.length === 0) return {};
  
    // --- Placeholder Logic for Development ---
    const placeholderCache: SimilarityCache = {};
    vectorsToQuery.forEach((item) => {
      // Generates simple placeholder similarity data for development
      placeholderCache[item.id] = [`sim_${item.id}_1`, `sim_${item.id}_2`];
    });
  
    logger.info(
      "Successfully simulated batch query to VDB for " +
      `${vectorsToQuery.length} cards.`
    );
    return placeholderCache;
  }
  
  // --- 4. Queue Generation Logic ---
  
  /**
   * Generates the Master Learning Queue based on user goals/limits.
   * @param {string} userId The ID of the current user.
   * @param {number} totalLimit The max number of new cards to fetch.
   * @return {Promise<any[]>} An array of cards to learn.
   */
  async function generateMasterLearningQueue(
    userId: string,
    totalLimit: number
  ) {
    // Logic: Prioritize lowest-mastery concepts, fetch new cards up to limit.
    // Placeholder query for eligible new cards:
    const eligibleNewCards = await db
      .collection("cards")
      .where("conceptId", "in", ["concept_001", "concept_002"])
      .limit(totalLimit)
      .get();
  
    const cardsToLearn: any[] = [];
    eligibleNewCards.forEach((doc) => {
      const data = doc.data();
      cardsToLearn.push({
        cardId: doc.id,
        question: data.question,
        cardLoadScore: data.cardLoadScore,
        conceptId: data.conceptId, // essential for grouping/reporting
      });
    });
    return cardsToLearn;
  }
  
  