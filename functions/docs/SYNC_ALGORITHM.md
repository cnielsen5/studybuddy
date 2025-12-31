# Sync Algorithm Implementation

## Overview

The sync algorithm provides **offline-first, multi-device** event synchronization:

- **Outbound Sync**: Device → Cloud (upload queued events)
- **Inbound Sync**: Cloud → Device (download new events)
- **Offline Support**: Events are queued locally when offline
- **Idempotency**: Duplicate events are handled gracefully

## Architecture

### Components

1. **Local Event Queue** (`localEventQueue.ts`)
   - Stores unsent events in IndexedDB (via localForage)
   - Tracks attempt counts and acknowledgment status
   - Persists across app restarts

2. **Sync Cursor** (`syncCursor.ts`)
   - Tracks last synced event per library
   - Uses `received_at` + `event_id` for tie-breaking
   - Enables incremental sync (only fetch new events)

3. **Outbound Sync** (`outboundSync.ts`)
   - Uploads queued events in batches
   - Marks events as acknowledged on success
   - Retries failed uploads with exponential backoff

4. **Inbound Sync** (`inboundSync.ts`)
   - Queries Firestore for events since cursor
   - Updates cursor after successful sync
   - Stores events locally for audit/rebuild

5. **Sync Engine** (`syncEngine.ts`)
   - Orchestrates outbound and inbound sync
   - Monitors online/offline status
   - Provides automatic periodic sync

## Usage

### Basic Setup (Without Sync)

```typescript
import { StudyBuddyClient } from './client';

const client = new StudyBuddyClient(firestore, userId, libraryId, deviceId);

// Events upload immediately
await client.reviewCard(cardId, 'good', 18);
```

### Offline-First Setup (With Sync)

```typescript
import { StudyBuddyClient, MemoryEventQueue, MemoryCursorStore } from './client';
// In production: import { IndexedDBEventQueue, IndexedDBCursorStore } from './client';

// Create queue and cursor store
const eventQueue = new MemoryEventQueue(); // Use IndexedDBEventQueue in production
const cursorStore = new MemoryCursorStore(); // Use IndexedDBCursorStore in production

// Initialize client with sync
const client = new StudyBuddyClient(
  firestore,
  userId,
  libraryId,
  deviceId,
  eventQueue,
  cursorStore
);

// Events are queued and synced automatically
await client.reviewCard(cardId, 'good', 18);

// Manual sync
await client.syncAll();

// Check sync status
const status = await client.getSyncStatus();
console.log(`Pending events: ${status.outbound.pendingCount}`);
```

### Production Setup (With IndexedDB)

```typescript
import localforage from 'localforage';
import { StudyBuddyClient, IndexedDBEventQueue, IndexedDBCursorStore } from './client';

// Configure localForage
const eventStorage = localforage.createInstance({
  name: 'StudyBuddy',
  storeName: 'eventQueue',
});

const cursorStorage = localforage.createInstance({
  name: 'StudyBuddy',
  storeName: 'syncCursors',
});

// Create queue and cursor store
const eventQueue = new IndexedDBEventQueue(eventStorage);
const cursorStore = new IndexedDBCursorStore(cursorStorage);

// Initialize client
const client = new StudyBuddyClient(
  firestore,
  userId,
  libraryId,
  deviceId,
  eventQueue,
  cursorStore
);
```

## Outbound Sync Flow

1. **User Action** → Create event locally
2. **Queue Event** → Add to local queue (IndexedDB)
3. **If Online** → Attempt immediate upload
4. **If Offline** → Queue for later
5. **Periodic Sync** → Upload queued events in batches
6. **Acknowledge** → Mark as acknowledged on success
7. **Retry** → Retry failed uploads (max 3 attempts)

## Inbound Sync Flow

1. **Get Cursor** → Read last synced event for library
2. **Query Firestore** → Fetch events since cursor
3. **Store Locally** → Save events to local storage
4. **Update Cursor** → Update with latest event's `received_at` + `event_id`
5. **Periodic Sync** → Repeat every minute (configurable)

## Cursor Strategy

The cursor uses:
- `last_received_at`: ISO timestamp of last received event
- `last_event_id`: Event ID for tie-breaking (same timestamp)

This ensures:
- **Incremental sync**: Only fetch new events
- **No duplicates**: Cursor prevents re-fetching
- **Tie-breaking**: Event ID breaks ties for same timestamp

## Read Strategy

**Primary**: Read from views (projected read models)
- `views/card_schedule/{cardId}`
- `views/card_perf/{cardId}`
- Fast, always up-to-date (updated by projector)

**Secondary**: Read from events (for audit/history)
- `events/{eventId}`
- Used for reconciliation, audit trail, rebuild

## Offline Behavior

### When Offline:
- Events are queued locally
- No upload attempts
- Views may be stale (from last sync)

### When Coming Online:
- Automatic outbound sync triggers
- Queued events upload in batches
- Inbound sync fetches new events

## Configuration

```typescript
const syncEngine = new SyncEngine(
  firestore,
  eventQueue,
  cursorStore,
  userId,
  libraryId,
  {
    outboundBatchSize: 50,        // Events per batch
    inboundBatchSize: 100,        // Events per query
    autoSyncIntervalMs: 60000,    // 1 minute
    enableAutoSync: true,         // Enable periodic sync
  }
);
```

## Best Practices

1. **Startup**: Read views first (fast), then sync events (background)
2. **UI Updates**: Use views for display, not events
3. **Error Handling**: Log failed events for manual review
4. **Cleanup**: Periodically clear acknowledged events from queue
5. **Monitoring**: Track sync status and pending counts

## Testing

See `tests/client/sync/` for:
- Local queue tests
- Outbound sync tests
- Inbound sync tests
- Integration tests

## Next Steps

- [ ] Add local event storage (IndexedDB implementation)
- [ ] Add sync conflict resolution
- [ ] Add sync metrics/analytics
- [ ] Add manual sync triggers (pull-to-refresh)
- [ ] Add sync status UI indicators

