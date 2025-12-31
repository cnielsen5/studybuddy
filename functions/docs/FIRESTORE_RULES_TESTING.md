# Firestore Security Rules Testing Guide

This guide explains how to test Firestore security rules using the Firebase Emulator Suite and `@firebase/rules-unit-testing`.

## Prerequisites

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Install required packages**:
   ```bash
   npm install --save-dev @firebase/rules-unit-testing firebase-tools
   ```

## Setup

### 1. Firebase Configuration

Create or update `firebase.json` in your project root:

```json
{
  "firestore": {
    "rules": "firestore.rules"
  },
  "emulators": {
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

### 2. Firestore Rules File

Ensure you have `firestore.rules` with your security rules (already created in this project).

### 3. Test Setup

Create a test helper to initialize the emulator:

```typescript
// tests/helpers/firestoreEmulator.ts
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { getFirestore } from '@firebase/firestore';

let testEnv: RulesTestEnvironment;

export async function setupFirestoreEmulator(): Promise<RulesTestEnvironment> {
  if (!testEnv) {
    testEnv = await initializeTestEnvironment({
      projectId: 'test-project',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
      },
    });
  }
  return testEnv;
}

export async function cleanupFirestoreEmulator() {
  if (testEnv) {
    await testEnv.cleanup();
    testEnv = null;
  }
}
```

## Writing Tests

### Example: Testing Event Creation Rules

```typescript
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { getFirestore } from '@firebase/firestore';
import * as fs from 'fs';

describe('Firestore Security Rules - Events', () => {
  let testEnv: RulesTestEnvironment;
  let authenticatedDb: ReturnType<typeof getFirestore>;
  let unauthenticatedDb: ReturnType<typeof getFirestore>;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'test-project',
      firestore: {
        rules: fs.readFileSync('firestore.rules', 'utf8'),
      },
    });
  });

  beforeEach(() => {
    // Create authenticated context (user_123)
    authenticatedDb = testEnv.authenticatedContext('user_123').firestore();
    
    // Create unauthenticated context
    unauthenticatedDb = testEnv.unauthenticatedContext().firestore();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  describe('Event creation', () => {
    it('should allow authenticated user to create their own event', async () => {
      const eventRef = authenticatedDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      await expect(
        eventRef.set({
          event_id: 'evt_001',
          user_id: 'user_123',
          library_id: 'lib_abc',
          type: 'card_reviewed',
          // ... other fields
        })
      ).resolves.not.toThrow();
    });

    it('should deny unauthenticated user from creating event', async () => {
      const eventRef = unauthenticatedDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      await expect(
        eventRef.set({
          event_id: 'evt_001',
          user_id: 'user_123',
          library_id: 'lib_abc',
          type: 'card_reviewed',
        })
      ).rejects.toThrow();
    });

    it('should deny user from creating event for another user', async () => {
      const eventRef = authenticatedDb
        .collection('users')
        .doc('user_456') // Different user
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      await expect(
        eventRef.set({
          event_id: 'evt_001',
          user_id: 'user_456', // Mismatch with auth.uid
          library_id: 'lib_abc',
          type: 'card_reviewed',
        })
      ).rejects.toThrow();
    });

    it('should deny creating event if event_id mismatch', async () => {
      const eventRef = authenticatedDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      await expect(
        eventRef.set({
          event_id: 'evt_wrong', // Mismatch with document ID
          user_id: 'user_123',
          library_id: 'lib_abc',
          type: 'card_reviewed',
        })
      ).rejects.toThrow();
    });

    it('should deny creating event if document already exists (idempotency)', async () => {
      const eventRef = authenticatedDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      // First create should succeed
      await eventRef.set({
        event_id: 'evt_001',
        user_id: 'user_123',
        library_id: 'lib_abc',
        type: 'card_reviewed',
      });

      // Second create should be denied (idempotency check)
      await expect(
        eventRef.set({
          event_id: 'evt_001',
          user_id: 'user_123',
          library_id: 'lib_abc',
          type: 'card_reviewed',
        })
      ).rejects.toThrow();
    });
  });

  describe('Event updates', () => {
    it('should deny updating an existing event', async () => {
      const eventRef = authenticatedDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      // Create event first
      await eventRef.set({
        event_id: 'evt_001',
        user_id: 'user_123',
        library_id: 'lib_abc',
        type: 'card_reviewed',
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
      const eventRef = authenticatedDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      // Create event first
      await eventRef.set({
        event_id: 'evt_001',
        user_id: 'user_123',
        library_id: 'lib_abc',
        type: 'card_reviewed',
      });

      // Delete should be denied
      await expect(eventRef.delete()).rejects.toThrow();
    });
  });

  describe('Event reads', () => {
    it('should allow authenticated user to read their own events', async () => {
      const eventRef = authenticatedDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      // Create event first
      await testEnv.withSecurityRulesDisabled(async (context) => {
        await context.firestore()
          .collection('users')
          .doc('user_123')
          .collection('libraries')
          .doc('lib_abc')
          .collection('events')
          .doc('evt_001')
          .set({
            event_id: 'evt_001',
            user_id: 'user_123',
            library_id: 'lib_abc',
            type: 'card_reviewed',
          });
      });

      // Read should succeed
      await expect(eventRef.get()).resolves.not.toThrow();
    });

    it('should deny unauthenticated user from reading events', async () => {
      const eventRef = unauthenticatedDb
        .collection('users')
        .doc('user_123')
        .collection('libraries')
        .doc('lib_abc')
        .collection('events')
        .doc('evt_001');

      await expect(eventRef.get()).rejects.toThrow();
    });
  });
});
```

## Running Tests

### Option 1: Run with Jest (Recommended)

Add to your `package.json`:

```json
{
  "scripts": {
    "test:rules": "jest tests/integration/firestoreRules.integration.test.ts",
    "test:all": "npm test && npm run test:rules"
  }
}
```

Run:
```bash
npm run test:rules
```

### Option 2: Manual Emulator Start

1. Start the emulator:
   ```bash
   firebase emulators:start --only firestore
   ```

2. Run tests (they will connect to the running emulator):
   ```bash
   npm test -- tests/integration/firestoreRules.integration.test.ts
   ```

## Best Practices

1. **Isolate Tests**: Each test should clean up after itself or use unique document IDs
2. **Test Both Sides**: Test both allowed and denied operations
3. **Test Edge Cases**: Test boundary conditions (empty strings, null values, etc.)
4. **Use Fixtures**: Reuse event fixtures from your existing test suite
5. **Test Idempotency**: Verify that duplicate creates are handled correctly

## Troubleshooting

### Issue: "Firestore emulator not running"

**Solution**: Make sure the emulator is started:
```bash
firebase emulators:start --only firestore
```

### Issue: "Rules file not found"

**Solution**: Ensure `firestore.rules` exists and the path in `firebase.json` is correct.

### Issue: "Permission denied" when it should be allowed

**Solution**: Check that:
- User is authenticated (`request.auth != null`)
- User ID matches (`request.auth.uid == userId`)
- Path components match (`event_id == eventId`, etc.)
- Document doesn't exist for creates (`!exists(...)`)

## Additional Resources

- [Firebase Emulator Suite Documentation](https://firebase.google.com/docs/emulator-suite)
- [@firebase/rules-unit-testing Documentation](https://github.com/firebase/firebase-js-sdk/tree/master/packages/rules-unit-testing)
- [Firestore Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)

