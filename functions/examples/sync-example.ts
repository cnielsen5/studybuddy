/**
 * Sync Algorithm Example
 * 
 * Demonstrates offline-first sync with local event queue and cursor tracking.
 */

import { StudyBuddyClient, MemoryEventQueue, MemoryCursorStore } from '../src/client';
import { Firestore } from '@google-cloud/firestore';

async function syncExample(firestore: Firestore) {
  const userId = 'user_123';
  const libraryId = 'lib_abc';
  const deviceId = 'device_001';

  // ============================================
  // Setup: Create queue and cursor store
  // ============================================
  const eventQueue = new MemoryEventQueue();
  const cursorStore = new MemoryCursorStore();

  // In production, use IndexedDB:
  // import localforage from 'localforage';
  // const eventStorage = localforage.createInstance({ name: 'StudyBuddy', storeName: 'eventQueue' });
  // const cursorStorage = localforage.createInstance({ name: 'StudyBuddy', storeName: 'syncCursors' });
  // const eventQueue = new IndexedDBEventQueue(eventStorage);
  // const cursorStore = new IndexedDBCursorStore(cursorStorage);

  // ============================================
  // Initialize client with sync
  // ============================================
  const client = new StudyBuddyClient(
    firestore,
    userId,
    libraryId,
    deviceId,
    eventQueue,
    cursorStore
  );

  // ============================================
  // Use client normally - events are queued
  // ============================================
  console.log('Reviewing cards (events will be queued)...');
  
  await client.reviewCard('card_0001', 'good', 18);
  await client.reviewCard('card_0002', 'easy', 12);
  await client.reviewCard('card_0003', 'hard', 25);

  // ============================================
  // Check sync status
  // ============================================
  const status = await client.getSyncStatus();
  console.log(`\nSync Status:`);
  console.log(`  Pending events: ${status.outbound.pendingCount}`);
  console.log(`  Online: ${status.isOnline}`);
  if (status.inbound.cursor) {
    console.log(`  Last synced: ${status.inbound.cursor.last_received_at}`);
  }

  // ============================================
  // Manual sync (outbound)
  // ============================================
  console.log('\nSyncing outbound events...');
  const outboundResult = await client.syncOutbound();
  console.log(`  Uploaded: ${outboundResult.uploaded}`);
  console.log(`  Idempotent: ${outboundResult.idempotent}`);
  console.log(`  Failed: ${outboundResult.failed}`);

  // ============================================
  // Manual sync (inbound)
  // ============================================
  console.log('\nSyncing inbound events...');
  const inboundResult = await client.syncInbound();
  console.log(`  Events received: ${inboundResult.eventsReceived}`);
  console.log(`  Cursor updated: ${inboundResult.cursorUpdated}`);

  // ============================================
  // Full sync (both directions)
  // ============================================
  console.log('\nPerforming full sync...');
  const fullSync = await client.syncAll();
  console.log(`  Outbound: ${fullSync.outbound.uploaded} uploaded`);
  console.log(`  Inbound: ${fullSync.inbound.eventsReceived} received`);

  // ============================================
  // Read views (primary read model)
  // ============================================
  console.log('\nReading views (primary read model)...');
  const dueCards = await client.getDueCards(10);
  console.log(`  Due cards: ${dueCards.length}`);

  const schedule = await client.getCardSchedule('card_0001');
  if (schedule) {
    console.log(`  Card 0001 state: ${schedule.state}`);
    console.log(`  Due at: ${schedule.due_at}`);
  }
}

/**
 * Offline-first example
 */
async function offlineFirstExample(firestore: Firestore) {
  const userId = 'user_123';
  const libraryId = 'lib_abc';
  const deviceId = 'device_001';

  const eventQueue = new MemoryEventQueue();
  const cursorStore = new MemoryCursorStore();

  const client = new StudyBuddyClient(
    firestore,
    userId,
    libraryId,
    deviceId,
    eventQueue,
    cursorStore
  );

  // Simulate offline scenario
  console.log('Simulating offline scenario...');
  
  // These events will be queued (not uploaded immediately if offline)
  await client.reviewCard('card_0001', 'good', 18);
  await client.reviewCard('card_0002', 'easy', 12);

  const status = await client.getSyncStatus();
  console.log(`  Queued events: ${status.outbound.pendingCount}`);

  // When coming online, sync automatically triggers
  // Or manually trigger:
  console.log('\nComing online - syncing...');
  await client.syncOutbound();

  const newStatus = await client.getSyncStatus();
  console.log(`  Remaining queued: ${newStatus.outbound.pendingCount}`);
}

/**
 * Startup sequence example
 */
async function startupExample(firestore: Firestore) {
  const userId = 'user_123';
  const libraryId = 'lib_abc';
  const deviceId = 'device_001';

  const eventQueue = new MemoryEventQueue();
  const cursorStore = new MemoryCursorStore();

  const client = new StudyBuddyClient(
    firestore,
    userId,
    libraryId,
    deviceId,
    eventQueue,
    cursorStore
  );

  // ============================================
  // Step 1: Read views first (fast, for UI)
  // ============================================
  console.log('Startup: Reading views...');
  const dueCards = await client.getDueCards(50);
  console.log(`  Found ${dueCards.length} due cards`);

  // ============================================
  // Step 2: Sync in background (non-blocking)
  // ============================================
  console.log('Startup: Syncing in background...');
  client.syncAll().then((result) => {
    console.log(`  Sync complete: ${result.outbound.uploaded} uploaded, ${result.inbound.eventsReceived} received`);
  }).catch((error) => {
    console.error('  Sync failed:', error);
  });

  // UI can render immediately with views
  // Sync happens in background
}

export { syncExample, offlineFirstExample, startupExample };

