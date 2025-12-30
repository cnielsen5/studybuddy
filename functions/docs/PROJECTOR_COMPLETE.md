# Event Projector Implementation - Complete

## Overview

All major event types now have projectors implemented. The system follows a consistent pattern:
1. Validate event payload with Zod
2. Check idempotency via `last_applied` cursor
3. Calculate view updates
4. Write to Firestore (transactionally when multiple views are updated)

## Implemented Projectors

### 1. **CardProjector** (`cardProjector.ts`)
- **Event**: `card_reviewed`
- **Views Updated**:
  - `CardScheduleView`: FSRS-like scheduling state
  - `CardPerformanceView`: Performance metrics
- **Path**: `users/{uid}/libraries/{libraryId}/views/card_schedule/{cardId}` and `card_perf/{cardId}`

### 2. **QuestionProjector** (`questionProjector.ts`)
- **Event**: `question_attempted`
- **Views Updated**:
  - `QuestionPerformanceView`: Performance metrics (accuracy, streaks, timing)
- **Path**: `users/{uid}/libraries/{libraryId}/views/question_perf/{questionId}`

### 3. **RelationshipProjector** (`relationshipProjector.ts`)
- **Event**: `relationship_reviewed`
- **Views Updated**:
  - `RelationshipScheduleView`: Scheduling state for relationship cards
  - `RelationshipPerformanceView`: Performance metrics
- **Path**: `users/{uid}/libraries/{libraryId}/views/relationship_schedule/{relationshipCardId}` and `relationship_perf/{relationshipCardId}`
- **Note**: Similar to `card_reviewed` but for relationship cards

### 4. **MisconceptionProjector** (`misconceptionProjector.ts`)
- **Event**: `misconception_probe_result`
- **Views Updated**:
  - `MisconceptionEdgeView`: Misconception strength and evidence
- **Path**: `users/{uid}/libraries/{libraryId}/views/misconception_edge/{misconceptionId}`
- **Logic**: Updates misconception strength based on probe confirmation

### 5. **SessionProjector** (`sessionProjector.ts`)
- **Events**: `session_started`, `session_ended`
- **Views Updated**:
  - `SessionView`: Active session state
  - `SessionSummary`: Final session summary (on `session_ended`)
- **Path**: `users/{uid}/libraries/{libraryId}/views/session/{sessionId}` and `session_summaries/{sessionId}`

### 6. **ScheduleUpdateProjector** (`scheduleUpdateProjector.ts`)
- **Events**: `acceleration_applied`, `lapse_applied`
- **Views Updated**:
  - `CardScheduleView`: Explicit stability/due date updates
- **Path**: `users/{uid}/libraries/{libraryId}/views/card_schedule/{cardId}`
- **Note**: These events explicitly update scheduling without requiring a `card_reviewed` event

## Event Router

The `eventRouter.ts` now handles all implemented event types:

```typescript
switch (event.type) {
  case "card_reviewed": // → CardProjector
  case "question_attempted": // → QuestionProjector
  case "relationship_reviewed": // → RelationshipProjector
  case "misconception_probe_result": // → MisconceptionProjector
  case "session_started": // → SessionProjector
  case "session_ended": // → SessionProjector
  case "acceleration_applied": // → ScheduleUpdateProjector
  case "lapse_applied": // → ScheduleUpdateProjector
  default: // Unknown types return success with error message
}
```

## Events Not Yet Projected

These events exist but don't have projectors yet (may not need views):

- **`library_id_map_applied`**: System event, no view needed
- **`content_flagged`**: Moderation event, may have separate workflow
- **`card_annotation_updated`**: User preference, may be handled separately
- **`mastery_certification_started`**: May need separate projector
- **`mastery_certification_completed`**: May need separate projector
- **`intervention_accepted`**: Analytics event, may not need view
- **`intervention_rejected`**: Analytics event, may not need view

## Common Patterns

All projectors follow these patterns:

### 1. **Idempotency Check**
```typescript
function shouldApplyEvent(
  viewLastApplied: { received_at: string; event_id: string } | undefined,
  event: UserEvent
): boolean {
  if (!viewLastApplied) return true;
  const viewTimestamp = new Date(viewLastApplied.received_at).getTime();
  const eventTimestamp = new Date(event.received_at).getTime();
  if (eventTimestamp > viewTimestamp) return true;
  if (event.event_id === viewLastApplied.event_id) return false; // Idempotent
  return false; // Out of order
}
```

### 2. **Payload Validation**
```typescript
const payloadValidation = PayloadSchema.safeParse(event.payload);
if (!payloadValidation.success) {
  return { success: false, error: "..." };
}
```

### 3. **Entity Kind Validation**
```typescript
if (event.entity.kind !== "expected_kind") {
  return { success: false, error: "..." };
}
```

### 4. **Transactional Updates** (for multiple views)
```typescript
await firestore.runTransaction(async (transaction) => {
  // Read views
  // Check idempotency
  // Calculate updates
  // Apply updates atomically
});
```

## View Path Conventions

All views follow this pattern:
```
users/{userId}/libraries/{libraryId}/views/{view_type}/{entityId}
```

Examples:
- `users/user_123/libraries/lib_abc/views/card_schedule/card_0001`
- `users/user_123/libraries/lib_abc/views/question_perf/q_0001`
- `users/user_123/libraries/lib_abc/views/session/session_0001`

## Testing Status

✅ **CardProjector**: Fully tested
⏳ **QuestionProjector**: Tests needed
⏳ **RelationshipProjector**: Tests needed
⏳ **MisconceptionProjector**: Tests needed
⏳ **SessionProjector**: Tests needed
⏳ **ScheduleUpdateProjector**: Tests needed

## Next Steps

1. **Create tests** for all new projectors (following `cardProjector.test.ts` pattern)
2. **Add remaining event types** if needed (mastery certification, annotations, etc.)
3. **Performance optimization**: Consider batch processing for high-volume events
4. **Monitoring**: Add metrics for projection success/failure rates
5. **Error handling**: Enhance error recovery and retry logic

## Deployment

All projectors are ready for deployment. The Firestore trigger (`onEventCreated`) will automatically route events to the appropriate projector based on `event.type`.

```bash
npm run build
firebase deploy --only functions:onEventCreated
```

