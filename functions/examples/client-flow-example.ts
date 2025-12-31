/**
 * Client Flow Example
 * 
 * This demonstrates the complete single-device loop:
 * 1. User reviews a card → create event locally
 * 2. Upload event to Firestore (create-only)
 * 3. Projector updates views (via trigger)
 * 4. Client reads views to show due cards / updated stats
 * 
 * Note: This uses server SDK types for documentation.
 * In a real client app, use Firebase Client SDK (firebase/firestore).
 */

import { StudyBuddyClient } from '../src/client';
import { Firestore } from '@google-cloud/firestore';

// In a real app, initialize Firebase Client SDK:
// import { initializeApp } from 'firebase/app';
// import { getFirestore } from 'firebase/firestore';
// const app = initializeApp(firebaseConfig);
// const firestore = getFirestore(app);

async function exampleClientFlow(firestore: Firestore) {
  const userId = 'user_123';
  const libraryId = 'lib_abc';
  const deviceId = 'device_001';

  // Initialize client
  const client = new StudyBuddyClient(firestore, userId, libraryId, deviceId);

  // ============================================
  // Step 1: Get due cards
  // ============================================
  console.log('Fetching due cards...');
  const dueCards = await client.getDueCards(10);
  console.log(`Found ${dueCards.length} due cards`);

  if (dueCards.length === 0) {
    console.log('No cards due. Exiting.');
    return;
  }

  // ============================================
  // Step 2: User reviews a card
  // ============================================
  const cardToReview = dueCards[0];
  console.log(`\nReviewing card: ${cardToReview.card_id}`);
  console.log(`Current state: ${cardToReview.state}`);
  console.log(`Current stability: ${cardToReview.stability}`);
  console.log(`Due at: ${cardToReview.due_at}`);

  // Simulate user review
  const grade: 'again' | 'hard' | 'good' | 'easy' = 'good';
  const secondsSpent = 18;

  // ============================================
  // Step 3: Upload review event
  // ============================================
  console.log(`\nUploading card_reviewed event (grade: ${grade}, time: ${secondsSpent}s)...`);
  const uploadResult = await client.reviewCard(cardToReview.card_id, grade, secondsSpent);

  if (!uploadResult.success) {
    console.error('Upload failed:', uploadResult.error);
    return;
  }

  console.log(`Event uploaded: ${uploadResult.eventId}`);
  console.log(`Idempotent: ${uploadResult.idempotent ? 'yes (already existed)' : 'no (new event)'}`);

  // ============================================
  // Step 4: Wait for projector to process
  // ============================================
  // In production, use Firestore real-time listeners instead of polling
  console.log('\nWaiting for projector to update views...');
  await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay

  // ============================================
  // Step 5: Read updated views
  // ============================================
  console.log('\nReading updated views...');

  const updatedSchedule = await client.getCardSchedule(cardToReview.card_id);
  if (updatedSchedule) {
    console.log('\nUpdated Schedule:');
    console.log(`  State: ${updatedSchedule.state}`);
    console.log(`  Stability: ${updatedSchedule.stability}`);
    console.log(`  Difficulty: ${updatedSchedule.difficulty}`);
    console.log(`  Interval: ${updatedSchedule.interval_days} days`);
    console.log(`  Due at: ${updatedSchedule.due_at}`);
    console.log(`  Last grade: ${updatedSchedule.last_grade}`);
  } else {
    console.log('Schedule view not found (may not have been created yet)');
  }

  const updatedPerformance = await client.getCardPerformance(cardToReview.card_id);
  if (updatedPerformance) {
    console.log('\nUpdated Performance:');
    console.log(`  Total reviews: ${updatedPerformance.total_reviews}`);
    console.log(`  Correct reviews: ${updatedPerformance.correct_reviews}`);
    console.log(`  Accuracy: ${(updatedPerformance.accuracy_rate * 100).toFixed(1)}%`);
    console.log(`  Avg seconds: ${updatedPerformance.avg_seconds.toFixed(1)}s`);
    console.log(`  Current streak: ${updatedPerformance.streak}`);
    console.log(`  Max streak: ${updatedPerformance.max_streak}`);
  } else {
    console.log('Performance view not found (may not have been created yet)');
  }

  // ============================================
  // Step 6: Get updated due cards list
  // ============================================
  console.log('\nFetching updated due cards list...');
  const updatedDueCards = await client.getDueCards(10);
  console.log(`Now have ${updatedDueCards.length} due cards`);

  // The reviewed card should no longer be in the due list (if interval > 0)
  const stillDue = updatedDueCards.find((c) => c.card_id === cardToReview.card_id);
  if (stillDue) {
    console.log(`Card ${cardToReview.card_id} is still due (new due date: ${stillDue.due_at})`);
  } else {
    console.log(`Card ${cardToReview.card_id} is no longer due (scheduled for future)`);
  }
}

/**
 * Example: Manual event creation and upload
 */
async function exampleManualEventCreation(firestore: Firestore) {
  const userId = 'user_123';
  const libraryId = 'lib_abc';

  // Import helpers
  const {
    createCardReviewedEvent,
    validateEventBeforeEnqueue,
    safeValidateEventBeforeEnqueue,
    uploadEvent,
  } = await import('../src/client');

  // 1. Create event locally
  const rawEvent = createCardReviewedEvent({
    userId,
    libraryId,
    cardId: 'card_0001',
    grade: 'good',
    secondsSpent: 18,
    deviceId: 'device_001',
  });

  console.log('Created event:', rawEvent.event_id);

  // 2. Validate (with error handling)
  const validation = safeValidateEventBeforeEnqueue(rawEvent);
  if (!validation.success) {
    console.error('Validation failed:', validation.error.errors);
    return;
  }

  // 3. Upload
  const result = await uploadEvent(firestore, validation.event);
  if (result.success) {
    console.log('Event uploaded successfully:', result.eventId);
  } else {
    console.error('Upload failed:', result.error);
  }
}

/**
 * Example: Batch upload multiple events
 */
async function exampleBatchUpload(firestore: Firestore) {
  const { StudyBuddyClient } = await import('../src/client');
  const client = new StudyBuddyClient(firestore, 'user_123', 'lib_abc', 'device_001');

  // Create multiple review events
  const events = [
    { cardId: 'card_0001', grade: 'good' as const, secondsSpent: 18 },
    { cardId: 'card_0002', grade: 'easy' as const, secondsSpent: 12 },
    { cardId: 'card_0003', grade: 'hard' as const, secondsSpent: 25 },
  ];

  // Upload all at once
  const results = await Promise.all(
    events.map((e) => client.reviewCard(e.cardId, e.grade, e.secondsSpent))
  );

  const successCount = results.filter((r) => r.success).length;
  console.log(`Uploaded ${successCount}/${events.length} events successfully`);
}

// Export for use in tests or actual app
export { exampleClientFlow, exampleManualEventCreation, exampleBatchUpload };

