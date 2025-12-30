# Reducer Architecture

## Overview

The projector system uses **pure reducer functions** to separate business logic from I/O operations. This architecture provides:

- **Testability**: Pure functions are easy to unit test
- **Determinism**: Same input always produces same output
- **Idempotency**: Reducers handle idempotency checks
- **Monotonic Constraints**: Built-in validation of business rules

## Architecture Pattern

```
Event → Idempotency Check → Pure Reducer → Updated View → Firestore Write
```

### Components

1. **Idempotency Check** (`shouldApply*Event`)
   - Checks `last_applied` cursor
   - Returns `true` if event should be applied
   - Returns `false` if event is idempotent or out-of-order

2. **Pure Reducer** (`reduce*`)
   - Takes previous view state (or `undefined` for new)
   - Takes event
   - Returns new view state
   - No side effects, no Firestore calls

3. **Projector** (I/O layer)
   - Reads from Firestore
   - Calls idempotency check
   - Calls reducer
   - Writes to Firestore

## Implemented Reducers

### Card Reducers (`cardReducers.ts`)

- **`reduceCardSchedule(prev, event) → CardScheduleView`**
  - Updates FSRS-like scheduling state
  - Monotonic constraints:
    - `stability >= 0.1`
    - `difficulty` between 0.1 and 10.0
    - `interval_days >= 1`
    - `state` between 0 and 3

- **`reduceCardPerformance(prev, event) → CardPerformanceView`**
  - Updates performance metrics
  - Monotonic constraints:
    - `total_reviews >= 0` (monotonically increasing)
    - `correct_reviews >= 0`
    - `accuracy_rate` between 0 and 1
    - `avg_seconds >= 0`
    - `streak >= 0`
    - `max_streak >= streak`

- **`shouldApplyCardEvent(prev, event) → boolean`**
  - Idempotency check for card events

### Question Reducers (`questionReducers.ts`)

- **`reduceQuestionPerformance(prev, event) → QuestionPerformanceView`**
  - Updates question performance metrics
  - Similar constraints to `reduceCardPerformance`

- **`shouldApplyQuestionEvent(prev, event) → boolean`**
  - Idempotency check for question events

## Testing Strategy

### Unit Tests for Reducers

1. **Determinism Tests**
   ```typescript
   const result1 = reduceCardSchedule(prev, event);
   const result2 = reduceCardSchedule(prev, event);
   expect(result1).toEqual(result2); // Same input = same output
   ```

2. **Monotonic Constraint Tests**
   ```typescript
   const result = reduceCardSchedule(prev, event);
   expect(result.stability).toBeGreaterThanOrEqual(0.1);
   expect(result.accuracy_rate).toBeGreaterThanOrEqual(0);
   expect(result.accuracy_rate).toBeLessThanOrEqual(1);
   ```

3. **Idempotency Tests** (at reducer level)
   ```typescript
   // Applying same event twice (if idempotency check fails)
   const result1 = reduceCardSchedule(prev, event);
   const result2 = reduceCardSchedule(result1, event);
   // Verify consistent behavior
   ```

4. **State Transition Tests**
   ```typescript
   // Verify state transitions (new -> learning -> review -> mastered)
   let current = undefined;
   current = reduceCardSchedule(current, goodEvent);
   expect(current.state).toBe(1); // learning
   ```

## Benefits

### 1. **Separation of Concerns**
- Business logic (reducers) is separate from I/O (projectors)
- Easy to test business logic without mocking Firestore

### 2. **Determinism**
- Same input always produces same output
- Critical for event sourcing and replay

### 3. **Testability**
- Pure functions are easy to unit test
- No need to mock Firestore for reducer tests
- Fast test execution

### 4. **Monotonic Constraints**
- Built-in validation of business rules
- Prevents invalid states (negative values, out-of-bounds)

### 5. **Idempotency**
- Reducers can be called multiple times safely
- Idempotency check prevents duplicate processing

## Future Reducers

To be implemented:
- `reduceRelationshipSchedule` / `reduceRelationshipPerformance`
- `reduceMisconceptionEdge`
- `reduceSessionView` / `reduceSessionSummary`
- `reduceConceptCertification`
- `reduceCardAnnotation`

## Usage Example

```typescript
// In projector
const currentView = await firestore.doc(viewPath).get();
const shouldApply = shouldApplyCardEvent(currentView?.data(), event);

if (shouldApply) {
  const updatedView = reduceCardSchedule(currentView?.data(), event);
  await firestore.doc(viewPath).set(updatedView);
}
```

## Best Practices

1. **Keep reducers pure**: No side effects, no I/O
2. **Enforce monotonic constraints**: Always validate bounds
3. **Test determinism**: Same input = same output
4. **Test idempotency**: Applying same event twice should be safe
5. **Document constraints**: Make monotonic rules explicit

