/**
 * Firestore Security Rules Integration Tests
 * 
 * Tests actual Firestore security rules using Firebase Emulator Suite.
 * 
 * Prerequisites:
 * 1. Install: npm install --save-dev @firebase/rules-unit-testing firebase-tools
 * 2. Start emulator: firebase emulators:start --only firestore
 * 3. Run tests: npm test -- tests/integration/firestoreRules.integration.test.ts
 * 
 * Note: These tests require the Firebase Emulator to be running.
 * For CI/CD, use: firebase emulators:exec --only firestore "npm test -- tests/integration/firestoreRules.integration.test.ts"
 */

import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';
import { validCardReviewedEvent } from '../fixtures/cardReviewed.fixture.ts';

// Check if we're running in a test environment with emulator
// @firebase/rules-unit-testing automatically sets up the emulator
const USE_EMULATOR = true; // Always try to use emulator (it will be initialized)

describe('Firestore Security Rules - Integration Tests', () => {
  let testEnv: RulesTestEnvironment | null = null;
  let authenticatedDb: any = null;
  let unauthenticatedDb: any = null;
  let otherUserDb: any = null;
  let emulatorAvailable = false;

  beforeAll(async () => {
    try {
      // Load rules file
      const rulesPath = path.join(__dirname, '../../firestore.rules');
      const rules = fs.readFileSync(rulesPath, 'utf8');

      // Check if emulator is already running (via FIRESTORE_EMULATOR_HOST env var)
      // or if we need to specify host/port manually
      const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
      
      const firestoreConfig: any = {
        rules: rules,
      };

      // If emulator host is set, use it; otherwise use default localhost:8080
      if (emulatorHost) {
        const [host, port] = emulatorHost.split(':');
        firestoreConfig.host = host;
        firestoreConfig.port = parseInt(port, 10);
      } else {
        // Default emulator settings (matches firebase.json)
        firestoreConfig.host = 'localhost';
        firestoreConfig.port = 8080;
      }

      testEnv = await initializeTestEnvironment({
        projectId: 'test-project',
        firestore: firestoreConfig,
      });

      // Create authenticated context (user_123)
      authenticatedDb = testEnv.authenticatedContext('user_123').firestore();
      
      // Create unauthenticated context
      unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
      
      // Create context for different user (user_456)
      otherUserDb = testEnv.authenticatedContext('user_456').firestore();
      
      emulatorAvailable = true;
    } catch (error: any) {
      // If emulator is not available, skip all tests gracefully
      if (error?.code === 'ECONNREFUSED' || error?.errno === 'ECONNREFUSED' || 
          error?.message?.includes('ECONNREFUSED') || 
          error?.message?.includes('Failed to connect')) {
        console.warn('⚠️  Firestore emulator not available. Skipping Firestore rules integration tests.');
        console.warn('   To run these tests, start the emulator: firebase emulators:start --only firestore');
        emulatorAvailable = false;
        return;
      }
      // For other errors, still throw
      console.error('Failed to initialize test environment:', error);
      console.warn('⚠️  Make sure @firebase/rules-unit-testing is installed: npm install --save-dev @firebase/rules-unit-testing');
      throw error;
    }
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  beforeEach(async () => {
    // Skip all tests if emulator is not available
    if (!emulatorAvailable) {
      return;
    }
    // Clean up test data before each test
    if (testEnv) {
      await testEnv.clearFirestore();
    }
  });

  describe('Event creation', () => {
    it('should allow authenticated user to create their own event', async () => {
      if (!emulatorAvailable || !authenticatedDb) return;

      const eventRef = authenticatedDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      const event = {
        ...validCardReviewedEvent,
        event_id: 'evt_001',
        user_id: 'user_123',
        library_id: 'lib_abc',
      };

      await expect(eventRef.set(event)).resolves.not.toThrow();
    });

    it('should deny unauthenticated user from creating event', async () => {
      if (!emulatorAvailable || !unauthenticatedDb) return;

      const eventRef = unauthenticatedDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      const event = {
        ...validCardReviewedEvent,
        event_id: 'evt_001',
        user_id: 'user_123',
        library_id: 'lib_abc',
      };

      await expect(eventRef.set(event)).rejects.toThrow();
    });

    it('should deny user from creating event for another user', async () => {
      if (!emulatorAvailable || !authenticatedDb) return;

      const eventRef = authenticatedDb
        .collection('users')
        .doc('user_456')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      const event = {
        ...validCardReviewedEvent,
        event_id: 'evt_001',
        user_id: 'user_456', // Different user
        library_id: 'lib_abc',
      };

      await expect(eventRef.set(event)).rejects.toThrow();
    });

    it('should deny creating event if event_id mismatch', async () => {
      if (!emulatorAvailable || !authenticatedDb) return;

      const eventRef = authenticatedDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      const event = {
        ...validCardReviewedEvent,
        event_id: 'evt_wrong', // Mismatch with document ID
        user_id: 'user_123',
        library_id: 'lib_abc',
      };

      await expect(eventRef.set(event)).rejects.toThrow();
    });

    it('should deny creating event if user_id mismatch', async () => {
      if (!emulatorAvailable || !authenticatedDb) return;

      const eventRef = authenticatedDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      const event = {
        ...validCardReviewedEvent,
        event_id: 'evt_001',
        user_id: 'user_wrong', // Mismatch with path
        library_id: 'lib_abc',
      };

      await expect(eventRef.set(event)).rejects.toThrow();
    });

    it('should deny creating event if library_id mismatch', async () => {
      if (!emulatorAvailable || !authenticatedDb) return;

      const eventRef = authenticatedDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      const event = {
        ...validCardReviewedEvent,
        event_id: 'evt_001',
        user_id: 'user_123',
        library_id: 'lib_wrong', // Mismatch with path
      };

      await expect(eventRef.set(event)).rejects.toThrow();
    });

    it('should enforce idempotency (deny duplicate create)', async () => {
      if (!emulatorAvailable || !authenticatedDb) return;

      const eventRef = authenticatedDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      const event = {
        ...validCardReviewedEvent,
        event_id: 'evt_001',
        user_id: 'user_123',
        library_id: 'lib_abc',
      };

      // First create should succeed
      await eventRef.set(event);

      // Second create should be denied (idempotency check)
      await expect(eventRef.set(event)).rejects.toThrow();
    });
  });

  describe('Event updates', () => {
    it('should deny updating an existing event', async () => {
      if (!emulatorAvailable || !authenticatedDb || !testEnv) return;

      const eventRef = authenticatedDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      const event = {
        ...validCardReviewedEvent,
        event_id: 'evt_001',
        user_id: 'user_123',
        library_id: 'lib_abc',
      };

      // Create event first (bypass rules for setup)
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection('users')
          .doc('user_123')
          .collection('libraries')
          .doc('lib_abc')
          .collection('events')
          .doc('evt_001')
          .set(event);
      });

      // Update should be denied
      await expect(
        eventRef.update({
          type: 'question_attempted', // Trying to change event type
        })
      ).rejects.toThrow();
    });
  });

  describe('Event deletion', () => {
    it('should deny deleting an event', async () => {
      if (!emulatorAvailable || !authenticatedDb || !testEnv) return;

      const eventRef = authenticatedDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      const event = {
        ...validCardReviewedEvent,
        event_id: 'evt_001',
        user_id: 'user_123',
        library_id: 'lib_abc',
      };

      // Create event first (bypass rules for setup)
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection('users')
          .doc('user_123')
          .collection('libraries')
          .doc('lib_abc')
          .collection('events')
          .doc('evt_001')
          .set(event);
      });

      // Delete should be denied
      await expect(eventRef.delete()).rejects.toThrow();
    });
  });

  describe('Event reads', () => {
    it('should allow authenticated user to read their own events', async () => {
      if (!emulatorAvailable || !authenticatedDb || !testEnv) return;

      const eventRef = authenticatedDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      const event = {
        ...validCardReviewedEvent,
        event_id: 'evt_001',
        user_id: 'user_123',
        library_id: 'lib_abc',
      };

      // Create event first (bypass rules for setup)
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection('users')
          .doc('user_123')
          .collection('libraries')
          .doc('lib_abc')
          .collection('events')
          .doc('evt_001')
          .set(event);
      });

      // Read should succeed
      const docSnap = await eventRef.get();
      expect(docSnap.exists).toBe(true);
      expect(docSnap.data()?.event_id).toBe('evt_001');
    });

    it('should deny unauthenticated user from reading events', async () => {
      if (!emulatorAvailable || !unauthenticatedDb || !testEnv) return;

      const eventRef = unauthenticatedDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      const event = {
        ...validCardReviewedEvent,
        event_id: 'evt_001',
        user_id: 'user_123',
        library_id: 'lib_abc',
      };

      // Create event first (bypass rules for setup)
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection('users')
          .doc('user_123')
          .collection('libraries')
          .doc('lib_abc')
          .collection('events')
          .doc('evt_001')
          .set(event);
      });

      // Read should be denied
      await expect(eventRef.get()).rejects.toThrow();
    });

    it('should deny user from reading another user\'s events', async () => {
      if (!emulatorAvailable || !otherUserDb || !testEnv) return;

      const eventRef = otherUserDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      const event = {
        ...validCardReviewedEvent,
        event_id: 'evt_001',
        user_id: 'user_123',
        library_id: 'lib_abc',
      };

      // Create event for user_123 (bypass rules for setup)
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context
          .firestore()
          .collection('users')
          .doc('user_123')
          .collection('libraries')
          .doc('lib_abc')
          .collection('events')
          .doc('evt_001')
          .set(event);
      });

      // user_456 trying to read user_123's event should be denied
      await expect(eventRef.get()).rejects.toThrow();
    });
  });
});
