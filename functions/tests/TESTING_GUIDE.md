# Testing Guide

This guide explains how to test the event ingestion, validation, and projection system.

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test Suites
```bash
# Validation tests
npm test -- tests/validation

# Ingestion tests
npm test -- tests/ingestion

# Projector tests
npm test -- tests/projector

# Client tests
npm test -- tests/client

# Integration tests
npm test -- tests/integration
```

### Run a Single Test File
```bash
npm test -- tests/validation/eventValidation.test.ts
```

## Test Structure

### 1. Validation Tests (`tests/validation/eventValidation.test.ts`)

Tests the core validation utilities:
- ✅ Zod validation of events
- ✅ Path construction (`getEventPath`)
- ✅ Path component extraction
- ✅ Event preparation for write

**Key Tests:**
- Valid events pass validation
- Invalid events throw ZodError
- Path construction with correct format
- Path validation (ID prefix checks)

### 2. Ingestion Tests (`tests/ingestion/eventIngestion.test.ts`)

Tests server-side event ingestion:
- ✅ Single event ingestion
- ✅ Batch event ingestion
- ✅ Idempotency handling (duplicate events)
- ✅ Validation error handling
- ✅ Firestore error handling

**Key Tests:**
- New events are created successfully
- Existing events return idempotent success
- Invalid events return validation errors
- Firestore errors are handled gracefully

**Mocking:** Uses mocked Firestore to avoid actual database calls

### 3. Projector Tests (`tests/projector/eventProjector.test.ts`)

Tests event projection validation:
- ✅ Event validation before projection
- ✅ Reading and validating from Firestore
- ✅ Projection error handling

**Key Tests:**
- Valid events pass projection validation
- Invalid events return errors
- Missing events return "not found" errors
- Firestore read errors are handled

**Mocking:** Uses mocked Firestore for read operations

### 4. Client Tests (`tests/client/eventClient.test.ts`)

Tests client-side validation:
- ✅ Validation before enqueue
- ✅ Safe validation with error handling
- ✅ Event creation helpers
- ✅ Path preparation

**Key Tests:**
- Valid events pass client validation
- Invalid events throw/return errors
- Event creation with minimal data
- Timestamp handling

### 5. Integration Tests (`tests/integration/eventIngestion.integration.test.ts`)

End-to-end tests for complete flows:
- ✅ Client → Server ingestion flow
- ✅ Idempotent retry flow
- ✅ Projection flow
- ✅ Path consistency
- ✅ Error propagation

**Key Tests:**
- Complete ingestion flow works
- Idempotent retries are handled correctly
- Projection can read ingested events
- Paths are consistent across layers
- Errors propagate correctly

## Test Coverage

### What's Tested

✅ **Validation**
- Zod schema validation
- ID prefix validation
- Required field validation
- Type validation

✅ **Ingestion**
- Single event ingestion
- Batch ingestion
- Idempotency (duplicate handling)
- Error handling

✅ **Projection**
- Event validation before projection
- Reading from Firestore
- Error handling

✅ **Client**
- Pre-enqueue validation
- Event creation
- Error handling

✅ **Integration**
- End-to-end flows
- Cross-layer consistency
- Error propagation

### What's Not Tested (Yet)

⚠️ **Firestore Security Rules**
- Rules are defined but not automatically tested
- Test manually with Firebase Emulator

⚠️ **Actual Firestore Operations**
- Tests use mocks
- Integration with real Firestore requires Firebase Emulator

⚠️ **Concurrent Writes**
- Idempotency under concurrent access
- Race conditions

⚠️ **Large Batch Operations**
- Performance with many events
- Batch size limits

## Running Tests with Firebase Emulator

For testing with actual Firestore:

```bash
# Start Firebase Emulator
firebase emulators:start --only firestore

# In another terminal, run tests
npm test
```

Then update test files to use emulator instead of mocks (see Firebase Emulator docs).

## Debugging Tests

### View Detailed Output
```bash
npm test -- --verbose
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

## Common Issues

### Issue: "Cannot find module '@google-cloud/firestore'"
**Solution:** Tests mock Firestore, so this shouldn't occur. If it does, ensure `@google-cloud/firestore` is in dependencies.

### Issue: "ZodError: Invalid input"
**Solution:** Check that fixtures match the Zod schemas. Run `npm test -- tests/validation/fixtures.validation.test.ts` to verify.

### Issue: Mock not working
**Solution:** Ensure `jest.mock("@google-cloud/firestore")` is at the top of test files.

## Adding New Tests

### Template for New Test File

```typescript
import { functionToTest } from "../../src/path/to/module";
import { validUserEvent } from "../fixtures/userEvent.fixture.ts";

describe("Module Name", () => {
  it("should do something", () => {
    // Arrange
    const input = validUserEvent;
    
    // Act
    const result = functionToTest(input);
    
    // Assert
    expect(result).toBeDefined();
  });
});
```

## Best Practices

1. **Use fixtures**: Import from `tests/fixtures/` for consistent test data
2. **Test error cases**: Always test both success and failure paths
3. **Mock external dependencies**: Use mocks for Firestore, network calls, etc.
4. **Test idempotency**: Always test duplicate/retry scenarios
5. **Clear test names**: Use descriptive `it()` descriptions
6. **Isolate tests**: Each test should be independent

## Next Steps

- [ ] Add Firestore Emulator integration tests
- [ ] Add performance tests for batch operations
- [ ] Add concurrent write tests
- [ ] Add security rules tests
- [ ] Add load tests for large batches

