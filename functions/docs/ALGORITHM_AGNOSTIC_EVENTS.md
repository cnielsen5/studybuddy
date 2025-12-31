# Algorithm-Agnostic Events

## Overview

All events are now **algorithm-agnostic**, meaning they record only **what happened** (raw data), not **derived calculations** (algorithm-specific fields like stability, difficulty, intervals).

This allows you to:
- ✅ Adjust FSRS v6 parameters without invalidating historical events
- ✅ Rebuild all views from the same event log with different algorithms
- ✅ Switch algorithms entirely (e.g., from FSRS v6 to SM-2) without data migration
- ✅ Use events as primary input to optimization (consistent with FSRS ecosystem)

## What Changed

### Before (Algorithm-Specific ❌)

Events contained derived fields:
```typescript
// ❌ BAD: Contains algorithm-specific derived fields
{
  type: "lapse_applied",
  payload: {
    original_stability: 45.5,  // ❌ Algorithm-specific
    new_stability: 27.3,        // ❌ Algorithm-specific
    effective_penalty: 0.4,
    trigger: "diagnostic_probing_confirmed_gap"
  }
}
```

### After (Algorithm-Agnostic ✅)

Events contain only raw data and intervention parameters:
```typescript
// ✅ GOOD: Only intervention parameters, no derived fields
{
  type: "lapse_applied",
  payload: {
    penalty_factor: 0.4,  // ✅ Algorithm-agnostic multiplier
    trigger: "diagnostic_probing_confirmed_gap"
  }
}
```

## Event Payloads

### Review Events

**`card_reviewed`**
- ✅ `grade`: "again" | "hard" | "good" | "easy"
- ✅ `seconds_spent`: number
- ✅ `rating_confidence`: 0-3 (optional)
- ❌ No `stability`, `difficulty`, `interval_days`, `due_at`

**`question_attempted`**
- ✅ `selected_option_id`: string
- ✅ `correct`: boolean
- ✅ `seconds_spent`: number
- ❌ No performance metrics

### Intervention Events

**`lapse_applied`**
- ✅ `penalty_factor`: 0.0 to 1.0 (multiplier)
- ✅ `trigger`: string (why the lapse was applied)
- ❌ No `original_stability`, `new_stability`, `interval_days`

**`acceleration_applied`**
- ✅ `acceleration_factor`: >= 1.0 (multiplier)
- ✅ `trigger`: string (why the acceleration was applied)
- ❌ No `original_stability`, `new_stability`, `next_due_days`

**`intervention_accepted`**
- ✅ `intervention_type`: "accelerate" | "lapse" | "reset"
- ✅ `factor`: number (the factor that will be applied)
- ❌ No `original_stability`, `new_stability`

## How It Works

### Projectors Calculate from Current State

The projectors (reducers) now calculate derived fields from:
1. **Current view state** (existing stability, difficulty, etc.)
2. **Event payload** (intervention parameters)

Example:
```typescript
// Reducer calculates new stability from current state + event
function reduceLapseApplied(prev: CardScheduleView, event: UserEvent) {
  const payload = event.payload; // { penalty_factor: 0.4, trigger: "..." }
  
  // Calculate new stability from current state
  const newStability = prev.stability * payload.penalty_factor;
  
  // Calculate interval from new stability
  const intervalDays = Math.floor(newStability);
  
  return { ...prev, stability: newStability, interval_days: intervalDays };
}
```

### Benefits

1. **Algorithm Independence**: Change FSRS parameters without touching events
2. **Rebuildability**: Rebuild all views from events with different algorithms
3. **Optimization**: Use events as input to FSRS Optimizer
4. **Flexibility**: Switch algorithms (FSRS v6 → SM-2) without migration

## Validation

### Invariant Tests

All events have invariant tests ensuring:
- ✅ No algorithm-specific fields in payloads
- ✅ Only raw data and intervention parameters
- ✅ Immutability (no mutation fields)
- ✅ No aggregates in payloads

See:
- `tests/invariants/events/cardReviewed.invariants.test.ts`
- `tests/invariants/events/lapseApplied.invariants.test.ts`
- `tests/invariants/events/accelerationApplied.invariants.test.ts`
- `tests/invariants/events/interventionAccepted.invariants.test.ts`

### Schema Validation

Zod schemas enforce algorithm-agnostic payloads:
- `AccelerationAppliedPayloadSchema`
- `LapseAppliedPayloadSchema`
- `InterventionAcceptedPayloadSchema`

## Migration Notes

If you have existing events with algorithm-specific fields:
1. **Don't migrate old events** - they're immutable
2. **New events** will use algorithm-agnostic format
3. **Projectors** handle both formats (if needed) or ignore old fields

## References

- FSRS Ecosystem: https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler
- Event Sourcing Best Practices: Events should record facts, not derived state

