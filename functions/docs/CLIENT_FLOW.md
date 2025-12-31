# Client Flow - Single Device Loop

This document describes the minimal client flow for a single device, demonstrating the complete event-driven architecture.

## Architecture Overview

```
User Action → Create Event → Validate → Upload → Firestore Trigger → Projector → Update Views → Client Reads Views
```

## Flow Steps

### 1. User Reviews a Card

When a user reviews a card, the client creates a `card_reviewed` event locally.

```typescript
import { StudyBuddyClient } from './src/client';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Initialize Firebase (client SDK)
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

// Create client instance
const client = new StudyBuddyClient(
  firestore,
  'user_123',
  'lib_abc',
  'device_001'
);

// User reviews a card
await client.reviewCard('card_0001', 'good', 18);
```

### 2. Event Upload

The `reviewCard` method:
1. Creates the event locally
2. Validates it with Zod
3. Uploads to Firestore at: `users/{userId}/libraries/{libraryId}/events/{eventId}`

The upload uses **create-only** semantics:
- If event already exists → idempotent success (already processed)
- If event doesn't exist → create it

### 3. Projector Updates Views

When the event is written to Firestore, the `onEventCreated` trigger fires:

1. **Trigger** (`src/triggers/eventProjectorTrigger.ts`):
   - Validates event with Zod
   - Routes to appropriate projector

2. **Projector** (`src/projector/cardProjector.ts`):
   - Reads current views (if they exist)
   - Checks idempotency via `last_applied` cursor
   - Uses pure reducers to compute new view state
   - Transactionally updates:
     - `views/card_schedule/{cardId}`
     - `views/card_perf/{cardId}`

### 4. Client Reads Views

After uploading, the client can read the updated views:

```typescript
// Get due cards
const dueCards = await client.getDueCards(50);
console.log(`Found ${dueCards.length} due cards`);

// Get specific card schedule
const schedule = await client.getCardSchedule('card_0001');
if (schedule) {
  console.log(`Card is due at: ${schedule.due_at}`);
  console.log(`Stability: ${schedule.stability}`);
  console.log(`State: ${schedule.state}`);
}

// Get card performance
const performance = await client.getCardPerformance('card_0001');
if (performance) {
  console.log(`Total reviews: ${performance.total_reviews}`);
  console.log(`Accuracy: ${performance.accuracy_rate}`);
  console.log(`Current streak: ${performance.streak}`);
}
```

## Complete Example

```typescript
import { StudyBuddyClient } from './src/client';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Setup
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const client = new StudyBuddyClient(firestore, 'user_123', 'lib_abc', 'device_001');

// 1. Get due cards
const dueCards = await client.getDueCards(10);
console.log(`Found ${dueCards.length} due cards`);

// 2. User reviews first due card
if (dueCards.length > 0) {
  const card = dueCards[0];
  
  // Simulate user review
  const grade = 'good'; // User's response
  const secondsSpent = 18;
  
  // Upload review event
  const result = await client.reviewCard(card.card_id, grade, secondsSpent);
  
  if (result.success) {
    console.log('Event uploaded successfully');
    
    // 3. Wait a moment for projector to process (in production, use real-time listeners)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 4. Read updated views
    const updatedSchedule = await client.getCardSchedule(card.card_id);
    const updatedPerformance = await client.getCardPerformance(card.card_id);
    
    console.log('Updated schedule:', updatedSchedule);
    console.log('Updated performance:', updatedPerformance);
  }
}
```

## Manual Event Creation

For more control, you can create and upload events manually:

```typescript
import {
  createCardReviewedEvent,
  validateEventBeforeEnqueue,
  uploadEvent,
} from './src/client';

// 1. Create event
const rawEvent = createCardReviewedEvent({
  userId: 'user_123',
  libraryId: 'lib_abc',
  cardId: 'card_0001',
  grade: 'good',
  secondsSpent: 18,
  deviceId: 'device_001',
});

// 2. Validate
try {
  const validatedEvent = validateEventBeforeEnqueue(rawEvent);
  
  // 3. Upload
  const result = await uploadEvent(firestore, validatedEvent);
  
  if (result.success) {
    console.log('Event uploaded:', result.eventId);
  }
} catch (error) {
  console.error('Validation failed:', error);
}
```

## Real-Time Updates

For real-time updates, use Firestore listeners:

```typescript
import { getCardScheduleViewPath } from './src/client/viewClient';

// Listen to card schedule updates
const schedulePath = `users/user_123/libraries/lib_abc/views/card_schedule/card_0001`;
const unsubscribe = firestore.doc(schedulePath).onSnapshot((snapshot) => {
  if (snapshot.exists()) {
    const schedule = snapshot.data() as CardScheduleView;
    console.log('Schedule updated:', schedule);
    // Update UI with new schedule
  }
});

// Later, unsubscribe
unsubscribe();
```

## Error Handling

All functions return result objects for safe error handling:

```typescript
// Safe validation
const validation = safeValidateEventBeforeEnqueue(rawEvent);
if (!validation.success) {
  console.error('Validation errors:', validation.error.errors);
  return;
}

// Upload with error handling
const uploadResult = await uploadEvent(firestore, validation.event);
if (!uploadResult.success) {
  console.error('Upload failed:', uploadResult.error);
  return;
}

console.log('Upload successful:', uploadResult.idempotent ? '(idempotent)' : '(new)');
```

## Idempotency

Events are idempotent by design:

- **Same event uploaded twice**: Second upload returns `idempotent: true` (no error)
- **Projector checks `last_applied`**: Won't apply the same event twice to views
- **Safe for retries**: Network failures can be retried without creating duplicates

## Next Steps

This minimal flow validates the architecture. Future enhancements:

1. **Offline Support**: Queue events locally, upload when online
2. **Batch Upload**: Upload multiple events in a single batch
3. **Full Sync**: Sync events and views across devices
4. **Optimistic Updates**: Update UI immediately, reconcile with server later

