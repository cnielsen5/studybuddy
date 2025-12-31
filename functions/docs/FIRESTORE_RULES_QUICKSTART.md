# Firestore Rules Testing - Quick Start

## Installation

```bash
npm install --save-dev @firebase/rules-unit-testing firebase-tools
```

## Running Tests

### Option 1: Automatic (Recommended)

Use `firebase emulators:exec` which automatically starts and stops the emulator:

```bash
npm run test:rules
```

This runs: `firebase emulators:exec --only firestore 'jest tests/integration/firestoreRules.integration.test.ts'`

### Option 2: Manual Emulator

1. Start the emulator in one terminal:
   ```bash
   npm run emulators:start
   # or
   firebase emulators:start --only firestore
   ```

2. Run tests in another terminal:
   ```bash
   npm run test:rules:manual
   # or
   jest tests/integration/firestoreRules.integration.test.ts
   ```

### Option 3: CI/CD

For continuous integration, use `emulators:exec` (same as Option 1):

```bash
npm run test:rules
```

## What Gets Tested

The integration tests verify:

✅ **Event Creation**
- Authenticated users can create their own events
- Unauthenticated users are denied
- Users cannot create events for other users
- Path validation (event_id, user_id, library_id must match)
- Idempotency (duplicate creates are denied)

✅ **Event Updates**
- Updates are always denied (events are immutable)

✅ **Event Deletion**
- Deletes are always denied (events are append-only)

✅ **Event Reads**
- Users can read their own events
- Unauthenticated users are denied
- Users cannot read other users' events

## Files Created

- `firestore.rules` - Security rules definition
- `firebase.json` - Emulator configuration
- `tests/integration/firestoreRules.integration.test.ts` - Integration tests
- `docs/FIRESTORE_RULES_TESTING.md` - Detailed guide

## Troubleshooting

**Issue**: "Cannot find module '@firebase/rules-unit-testing'"
- **Solution**: Run `npm install --save-dev @firebase/rules-unit-testing`

**Issue**: "Rules file not found"
- **Solution**: Ensure `firestore.rules` exists in the functions directory

**Issue**: "Java Runtime not found" or "Unable to locate a Java Runtime"
- **Solution**: The Firestore emulator requires Java. See `docs/JAVA_SETUP.md` for installation instructions
- **Quick fix**: Install Java 17: `brew install openjdk@17`
- **Alternative**: Use programmatic tests instead: `npm run test:rules:programmatic`

**Issue**: Tests skip with warning
- **Solution**: The emulator should start automatically. If not, check that `firebase-tools` is installed.

## Next Steps

See `docs/FIRESTORE_RULES_TESTING.md` for:
- Detailed test examples
- Advanced scenarios
- Best practices
- Troubleshooting guide

