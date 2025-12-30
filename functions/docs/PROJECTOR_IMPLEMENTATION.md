# Event Projector Implementation

## Overview

The server-side projector reads events from Firestore and projects them to read-model views. This implements the CQRS pattern where events are the source of truth and views are optimized for reading.

## Architecture

### Trigger
- **Path**: `users/{userId}/libraries/{libraryId}/events/{eventId}`
- **Trigger**: `onDocumentCreated` (Firestore v2)
- **Function**: `onEventCreated`

### Flow

```
Event Created → Trigger Fires → Validate with Zod → Route by Type → Project to Views
```

## Current Implementation

### MVP: `card_reviewed` Event

**Projected Views:**
1. `users/{uid}/libraries/{libraryId}/views/card_schedule/{cardId}`
2. `users/{uid}/libraries/{libraryId}/views/card_perf/{cardId}`

**Projection Logic:**
- **CardScheduleView**: Updates FSRS-like scheduling state (stability, difficulty, due date, state)
- **CardPerformanceView**: Updates performance metrics (total reviews, accuracy, streaks, timing)

## Idempotency

### Implementation

Idempotency is enforced via `last_applied` cursor comparison:

```typescript
function shouldApplyEvent(
  viewLastApplied: { received_at: string; event_id: string } | undefined,
  event: UserEvent
): boolean {
  if (!viewLastApplied) return true; // No previous event
  
  const viewTimestamp = new Date(viewLastApplied.received_at).getTime();
  const eventTimestamp = new Date(event.received_at).getTime();
  
  if (eventTimestamp > viewTimestamp) return true; // Newer event
  if (event.event_id === viewLastApplied.event_id) return false; // Same event - skip
  return false; // Older event - skip (out of order)
}
```

### Rules

1. **Newer events**: Applied if `event.received_at > view.last_applied.received_at`
2. **Same event**: Skipped if `event.event_id === view.last_applied.event_id` (idempotent)
3. **Older events**: Skipped if `event.received_at < view.last_applied.received_at` (out of order)

## Transactional Updates

Both views are updated in a single Firestore transaction to ensure:
- Atomicity: Both views update or neither does
- Consistency: No partial updates
- Idempotency: Both views check idempotency together

```typescript
await firestore.runTransaction(async (transaction) => {
  // Read both views
  // Check idempotency
  // Calculate updates
  // Apply updates atomically
});
```

## Event Routing

Events are routed by `event.type`:

```typescript
switch (event.type) {
  case "card_reviewed":
    return await projectCardReviewedEvent(firestore, event);
  // Future: question_attempted, relationship_reviewed, etc.
  default:
    return { success: true, error: "No projector for event type" };
}
```

## View Update Logic

### CardScheduleView

**Updated Fields:**
- `stability`: FSRS-like calculation based on grade
- `difficulty`: Adjusted based on performance
- `state`: Transitions (new → learning → review → mastered)
- `due_at`: Calculated from stability
- `last_reviewed_at`: Event timestamp
- `last_grade`: Grade from event
- `last_applied`: Cursor for idempotency
- `updated_at`: Current timestamp

**State Transitions:**
- `new (0)` → `learning (1)`: First review (unless "again")
- `learning (1)` → `review (2)`: Stability > 7 days
- `review (2)` → `mastered (3)`: Stability > 90 days
- Any → Lower: On "again" grade (lapse)

### CardPerformanceView

**Updated Fields:**
- `total_reviews`: Incremented
- `correct_reviews`: Incremented if grade !== "again"
- `accuracy_rate`: Recalculated
- `avg_seconds`: Exponential moving average
- `streak`: Incremented on correct, reset on incorrect
- `max_streak`: Updated if new streak is higher
- `last_reviewed_at`: Event timestamp
- `last_applied`: Cursor for idempotency
- `updated_at`: Current timestamp

## Testing

### Unit Tests

- `tests/projector/cardProjector.test.ts`: Tests projection logic
- `tests/projector/eventRouter.test.ts`: Tests routing
- `tests/triggers/eventProjectorTrigger.test.ts`: Tests trigger

### Test Coverage

✅ **Card Projector**
- New event projection
- Idempotent event handling
- Out-of-order event handling
- Invalid payload handling
- Transactional updates

✅ **Event Router**
- Routing by event type
- Unknown event type handling
- Error propagation

✅ **Trigger**
- Event validation
- Path verification
- Error handling

## Deployment

### Deploy Trigger

```bash
npm run build
firebase deploy --only functions:onEventCreated
```

### Verify Deployment

```bash
firebase functions:log --only onEventCreated
```

## Future Event Types

### Planned Projectors

1. **`question_attempted`** → `QuestionPerformanceView`
2. **`relationship_reviewed`** → `RelationshipScheduleView`, `RelationshipPerformanceView`
3. **`misconception_probe_result`** → `MisconceptionEdgeView`
4. **`session_started`** → `SessionView`
5. **`session_ended`** → `SessionSummary`

### Adding New Projectors

1. Create projector file: `src/projector/{entity}Projector.ts`
2. Implement projection logic
3. Add route in `src/projector/eventRouter.ts`
4. Add tests
5. Deploy

## Monitoring

### Key Metrics

- **Projection success rate**: Should be > 99%
- **Idempotent skips**: Normal for retries
- **Validation failures**: Should be rare (indicates schema drift)
- **Transaction conflicts**: Should be rare (indicates high concurrency)

### Logging

The trigger logs:
- ✅ Successful projections
- ⚠️ Validation failures
- ⚠️ Path mismatches
- ❌ Unexpected errors

## Best Practices

1. **Always validate**: Events are validated with Zod before projection
2. **Idempotent by design**: Views check `last_applied` before updating
3. **Transactional updates**: Related views updated atomically
4. **Error handling**: Errors are logged but don't block other events
5. **Path verification**: Event data must match Firestore path

## Troubleshooting

### Issue: Views not updating
- Check trigger logs: `firebase functions:log`
- Verify event validation passed
- Check idempotency (event may already be processed)

### Issue: Transaction conflicts
- Normal under high concurrency
- Firestore retries automatically
- Consider reducing concurrency if excessive

### Issue: Validation failures
- Check event schema matches Zod schema
- Update schemas if event structure changed
- Check for schema version mismatches

