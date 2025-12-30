# Event Ingestion Architecture

## Canonical Event Write Path

**Path**: `users/{uid}/libraries/{libraryId}/events/{eventId}`

### Structure
```
users/
  {userId}/           # e.g., "user_123"
    libraries/
      {libraryId}/    # e.g., "lib_abc"
        events/
          {eventId}/  # e.g., "evt_01JHXYZABCDEF1234567890"
```

## Idempotency Rules

### Core Principles

1. **eventId is globally unique**: Each event has a unique identifier (ULID/UUIDv7)
2. **Create-only**: Events are never updated or deleted
3. **Idempotent writes**: If event already exists, treat as success (already processed)

### Implementation

```typescript
// Check if event exists
const eventRef = firestore.doc(path);
const existingDoc = await eventRef.get();

if (existingDoc.exists) {
  // Idempotent success - event already processed
  return { success: true, idempotent: true };
}

// Create event
await eventRef.set(event);
return { success: true, idempotent: false };
```

## Validation Flow

### 1. Client-Side Validation (Before Enqueue)

```typescript
import { validateEventBeforeEnqueue } from "./client/eventClient";

// Validate before adding to upload queue
const event = validateEventBeforeEnqueue(rawEvent);
// If validation fails, ZodError is thrown
```

**Location**: `src/client/eventClient.ts`

**Purpose**: 
- Catch validation errors early
- Prevent invalid events from entering upload queue
- Provide immediate feedback to user

### 2. Server-Side Validation (Before Ingestion)

```typescript
import { ingestEvent } from "./ingestion/eventIngestion";

// Validate and ingest
const result = await ingestEvent(firestore, rawEvent);
if (!result.success) {
  // Handle validation error
}
```

**Location**: `src/ingestion/eventIngestion.ts`

**Purpose**:
- Final validation before persistence
- Enforce idempotency
- Handle duplicate uploads gracefully

### 3. Server-Side Validation (Before Projection)

```typescript
import { validateEventForProjection } from "./projector/eventProjector";

// Validate before projecting
const validation = validateEventForProjection(rawEvent);
if (!validation.success) {
  // Handle validation error
}
```

**Location**: `src/projector/eventProjector.ts`

**Purpose**:
- Ensure event structure is valid before projection
- Prevent corrupted events from affecting views
- Maintain data integrity

## Firestore Security Rules

### Event Path Rules

```javascript
match /users/{userId}/libraries/{libraryId}/events/{eventId} {
  // Allow read: users can read their own events
  allow read: if request.auth != null && request.auth.uid == userId;
  
  // Allow create: only if document doesn't exist (idempotency)
  allow create: if request.auth != null 
                && request.auth.uid == userId
                && !exists(...)  // Document must not exist
                && request.resource.data.event_id == eventId
                && request.resource.data.user_id == userId
                && request.resource.data.library_id == libraryId;
  
  // Deny update: events are immutable
  allow update: if false;
  
  // Deny delete: events are append-only
  allow delete: if false;
}
```

### Key Security Features

1. **User isolation**: Users can only create/read their own events
2. **Create-only enforcement**: Rules prevent updates/deletes
3. **Idempotency check**: Create only allowed if document doesn't exist
4. **Data integrity**: Validates event_id, user_id, library_id match path

## Usage Examples

### Client-Side: Create and Validate Event

```typescript
import { createAndValidateEvent } from "./client/eventClient";

const event = createAndValidateEvent({
  event_id: generateEventId(), // ULID/UUIDv7
  type: "card_reviewed",
  user_id: currentUser.id,
  library_id: currentLibrary.id,
  entity: { kind: "card", id: "card_0001" },
  payload: { grade: "good", seconds_spent: 18 },
  schema_version: "1.0",
});

// Add to upload queue
uploadQueue.enqueue(event);
```

### Server-Side: Ingest Event

```typescript
import { ingestEvent } from "./ingestion/eventIngestion";
import { Firestore } from "@google-cloud/firestore";

const firestore = new Firestore();

// Ingest single event
const result = await ingestEvent(firestore, rawEvent);

if (result.success) {
  if (result.idempotent) {
    console.log(`Event ${result.eventId} already exists - skipped`);
  } else {
    console.log(`Event ${result.eventId} ingested successfully`);
  }
} else {
  console.error(`Ingestion failed: ${result.error}`);
}
```

### Server-Side: Project Event

```typescript
import { readAndValidateEvent, projectEvent } from "./projector/eventProjector";

// Read and validate event
const result = await readAndValidateEvent(
  firestore,
  userId,
  libraryId,
  eventId
);

if (result.success) {
  // Project to views
  await projectEvent(firestore, result.event);
} else {
  console.error(`Projection failed: ${result.error}`);
}
```

## Error Handling

### Validation Errors

```typescript
import { safeValidateEventBeforeEnqueue } from "./client/eventClient";

const validation = safeValidateEventBeforeEnqueue(rawEvent);
if (!validation.success) {
  // Handle ZodError
  validation.error.errors.forEach((error) => {
    console.error(`${error.path.join(".")}: ${error.message}`);
  });
}
```

### Idempotency Handling

```typescript
const result = await ingestEvent(firestore, event);
if (result.idempotent) {
  // Event already processed - this is success, not an error
  return { status: "already_processed", eventId: result.eventId };
}
```

## Best Practices

1. **Always validate on client**: Catch errors before upload
2. **Always validate on server**: Never trust client data
3. **Handle idempotency gracefully**: Duplicate uploads are success, not errors
4. **Use globally unique event IDs**: ULID or UUIDv7 recommended
5. **Never update events**: If correction needed, create new event
6. **Log validation failures**: Track schema drift and issues

## Testing

See `tests/validation/fixtures.validation.test.ts` for validation tests.

## Roadmap

- [ ] Add retry logic for failed validations
- [ ] Add metrics for validation failures
- [ ] Add schema version migration support
- [ ] Add batch ingestion optimization
- [ ] Add event replay capability

