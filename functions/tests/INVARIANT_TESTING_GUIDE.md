# Invariant Testing Guide

## Overview

This guide documents the refactoring and patterns established for invariant testing in the StudyBuddy codebase. The refactoring focused on eliminating redundancy, standardizing patterns, and creating reusable fixtures and helpers.

## Table of Contents

1. [What Are Invariants?](#what-are-invariants)
2. [Refactoring Goals](#refactoring-goals)
3. [Fixtures](#fixtures)
4. [Test Helpers](#test-helpers)
5. [Naming Conventions](#naming-conventions)
6. [Writing New Invariant Tests](#writing-new-invariant-tests)
7. [Best Practices](#best-practices)
8. [Examples](#examples)

---

## What Are Invariants?

Invariants are rules and constraints that domain objects must satisfy to maintain data integrity. They ensure:

- **Structural validity**: Objects have required fields and correct types
- **Domain separation**: No leakage between concerns (scheduling, performance, AI narrative, etc.)
- **Immutability**: Objects don't have mutator methods or functions
- **Cross-object consistency**: Related objects maintain referential integrity

### Types of Invariants

1. **Golden Master Invariants**: Test static, read-only content objects (Card, Question, Concept, Relationship)
2. **Derived Metrics Invariants**: Test regenerable analytics (CardGraphMetrics, QuestionGraphMetrics, etc.)
3. **User-Specific Invariants**: Test user-scoped objects (CardPerformanceMetrics, CardScheduleState, etc.)
4. **Cross-Object Invariants**: Test consistency between related objects (e.g., RelationshipCard ↔ Relationship)

---

## Refactoring Goals

The refactoring addressed several issues:

1. **Redundancy**: Duplicate test data across multiple test files
2. **Inconsistency**: Mixed naming conventions (`VALID_*` vs `valid*`)
3. **Maintenance burden**: Changes to domain objects required updates in multiple places
4. **Code duplication**: Repeated patterns for checking forbidden fields, immutability, etc.

### Solutions Implemented

- ✅ **Shared Fixtures**: Centralized test data in `tests/fixtures/`
- ✅ **Test Helpers**: Reusable assertion functions in `tests/helpers/invariantHelpers.ts`
- ✅ **Standardized Naming**: Consistent `valid*` lowercase naming
- ✅ **Consolidated Tests**: Merged duplicate relationship consistency tests

---

## Fixtures

### Location

All fixtures are located in `tests/fixtures/` with the naming pattern: `{objectName}.fixture.ts`

### Available Fixtures

#### Golden Master Fixtures
- `card.fixture.ts` - Exports: `validCard`, `validBasicCard`, `validClozeCard`
- `question.fixture.ts` - Exports: `validQuestion`
- `concept.fixture.ts` - Exports: `validConcept`
- `relationship.fixture.ts` - Exports: `validRelationship`
- `relationshipCard.fixture.ts` - Exports: `validRelationshipCard`

#### Derived Metrics Fixtures
- `cardGraphMetrics.fixture.ts` - Exports: `validCardGraphMetrics`
- `questionGraphMetrics.fixture.ts` - Exports: `validQuestionGraphMetrics`
- `conceptGraphMetrics.fixture.ts` - Exports: `validConceptGraphMetrics`
- `relationshipGraphMetrics.fixture.ts` - Exports: `validRelationshipGraphMetrics`

#### User-Specific Fixtures
- `questionAttempt.fixture.ts` - Exports: `validQuestionAttempt`
- `userEvent.fixture.ts` - Exports: `validUserEvent`
- Event-specific fixtures in `tests/fixtures/events/`
- View-specific fixtures in `tests/fixtures/views/`

### Using Fixtures

```typescript
// Import the fixture
import { validCard } from "../fixtures/card.fixture.ts";

describe("Card invariants", () => {
  it("must have required structure", () => {
    const c: any = validCard;
    expect(c.id).toBeDefined();
    expect(c.type).toBe("card");
  });
});
```

### Creating New Fixtures

1. Create a file: `tests/fixtures/{objectName}.fixture.ts`
2. Export a `valid{ObjectName}` constant with `as const`
3. Ensure the fixture matches the domain object structure exactly
4. Include all required fields and use realistic test data

Example:

```typescript
export const validMyObject = {
  id: "my_object_0001",
  type: "my_object",
  // ... all required fields
} as const;
```

---

## Test Helpers

### Location

Helpers are in `tests/helpers/invariantHelpers.ts`

### Available Helpers

#### Forbidden Fields Checking

```typescript
import { 
  GRAPH_METRICS_FORBIDDEN_FIELDS,
  GOLDEN_MASTER_FORBIDDEN_FIELDS,
  expectForbiddenFieldsAbsent 
} from "../helpers/invariantHelpers.ts";

// Check that graph metrics don't contain user/scheduling/performance fields
expectForbiddenFieldsAbsent(
  validCardGraphMetrics,
  GRAPH_METRICS_FORBIDDEN_FIELDS,
  "CardGraphMetrics"
);
```

#### Immutability Checking

```typescript
import { expectNoMutatorMethods, expectNoFunctions } from "../helpers/invariantHelpers.ts";

// Check no mutator methods exist
expectNoMutatorMethods(validCard);

// Check no functions at all
expectNoFunctions(validCard);
```

#### Type Field Checking

```typescript
import { expectTypeField } from "../helpers/invariantHelpers.ts";

expectTypeField(validCard, "card");
```

#### Structure Checking

```typescript
import { 
  expectTopLevelSections,
  expectStringArray 
} from "../helpers/invariantHelpers.ts";

// Check required top-level sections exist
expectTopLevelSections(validCard, ["id", "type", "relations", "config", "content"]);

// Check array contains only strings
expectStringArray(validCard.relations.related_question_ids);
```

### Forbidden Fields Constants

#### `GRAPH_METRICS_FORBIDDEN_FIELDS`
Fields that should never appear in graph metrics objects:
- `user_session`: `["user_id", "session_id"]`
- `scheduling`: `["state", "due", "stability", "difficulty", "mastery"]`
- `performance`: `["my_avg_seconds", "avg_seconds", "accuracy_rate", "streak", "total_attempts"]`
- `evidence`: `["attempt_ids", "attempts", "history"]`
- `ai_narrative`: `["explanation", "ai_reasoning", "narrative", "ai_notes"]`

#### `GOLDEN_MASTER_FORBIDDEN_FIELDS`
Fields that should never appear in Golden Master objects:
- Similar to graph metrics, plus any user-specific or runtime state

---

## Naming Conventions

### Fixtures

- **Pattern**: `valid{ObjectName}` (lowercase `valid`, PascalCase object name)
- **Examples**: 
  - `validCard`
  - `validQuestionAttempt`
  - `validCardGraphMetrics`

### Test Files

- **Pattern**: `{objectName}.invariants.test.ts`
- **Examples**:
  - `card.invariants.test.ts`
  - `questionAttempt.invariants.test.ts`
  - `cardGraphMetrics.invariants.test.ts`

### Cross-Object Tests

- **Pattern**: `{objectA}{objectB}{ConsistencyType}.invariants.test.ts`
- **Examples**:
  - `relationshipCardEndpointConsistency.invariants.test.ts`
  - `questionQuestionAttemptIntegrity.invariants.test.ts`

---

## Writing New Invariant Tests

### Step 1: Create or Import Fixture

```typescript
import { validMyObject } from "../fixtures/myObject.fixture.ts";
```

### Step 2: Structure Your Tests

```typescript
describe("MyObject invariants — required structure", () => {
  it("must have required fields", () => {
    const obj: any = validMyObject;
    expect(obj.id).toBeDefined();
    expect(obj.type).toBe("my_object");
  });
});

describe("MyObject invariants — forbidden fields", () => {
  it("must not contain user-specific fields", () => {
    expectForbiddenFieldsAbsent(
      validMyObject,
      GOLDEN_MASTER_FORBIDDEN_FIELDS,
      "MyObject"
    );
  });
});

describe("MyObject invariants — immutability", () => {
  it("must not define mutator methods", () => {
    expectNoMutatorMethods(validMyObject);
  });

  it("must not contain functions", () => {
    expectNoFunctions(validMyObject);
  });
});
```

### Step 3: Test Domain-Specific Rules

```typescript
describe("MyObject invariants — domain rules", () => {
  it("must follow naming convention", () => {
    const obj: any = validMyObject;
    expect(obj.id).toMatch(/^my_object_\d+$/);
  });
});
```

---

## Best Practices

### 1. Always Use Fixtures

✅ **DO**: Import and use fixtures
```typescript
import { validCard } from "../fixtures/card.fixture.ts";
```

❌ **DON'T**: Define test data inline
```typescript
const validCard = { id: "card_0001", ... }; // Don't do this
```

### 2. Use Helpers for Common Patterns

✅ **DO**: Use helpers for forbidden fields
```typescript
expectForbiddenFieldsAbsent(obj, GRAPH_METRICS_FORBIDDEN_FIELDS);
```

❌ **DON'T**: Manually check each field
```typescript
expect(obj.user_id).toBeUndefined();
expect(obj.session_id).toBeUndefined();
// ... repeat for every field
```

### 3. Group Related Tests

✅ **DO**: Group by concern
```typescript
describe("Card invariants — structure", () => { ... });
describe("Card invariants — forbidden fields", () => { ... });
describe("Card invariants — immutability", () => { ... });
```

### 4. Use Descriptive Test Names

✅ **DO**: Be specific
```typescript
it("must not contain user-specific or runtime state", () => { ... });
```

❌ **DON'T**: Be vague
```typescript
it("should work", () => { ... });
```

### 5. Test Cross-Object Consistency

When objects reference each other, test the consistency:

```typescript
import { validRelationship } from "../fixtures/relationship.fixture.ts";
import { validRelationshipCard } from "../fixtures/relationshipCard.fixture.ts";

describe("RelationshipCard ↔ Relationship consistency", () => {
  it("endpoints must match", () => {
    expect(validRelationshipCard.relations.from_concept_id)
      .toBe(validRelationship.endpoints.from_concept_id);
  });
});
```

---

## Examples

### Example 1: Golden Master Invariant Test

```typescript
import { validCard } from "../fixtures/card.fixture.ts";
import {
  expectTypeField,
  expectTopLevelSections,
  expectForbiddenFieldsAbsent,
  expectNoMutatorMethods,
  expectNoFunctions,
  GOLDEN_MASTER_FORBIDDEN_FIELDS
} from "../helpers/invariantHelpers.ts";

describe("Card invariants — required structure", () => {
  it("must declare type === 'card'", () => {
    expectTypeField(validCard, "card");
  });

  it("must contain all top-level sections", () => {
    expectTopLevelSections(validCard, [
      "id", "type", "relations", "config", "content", "metadata", "editorial"
    ]);
  });
});

describe("Card invariants — forbidden fields", () => {
  it("must not contain user-specific or runtime state", () => {
    expectForbiddenFieldsAbsent(
      validCard,
      GOLDEN_MASTER_FORBIDDEN_FIELDS,
      "Card"
    );
  });
});

describe("Card invariants — immutability", () => {
  it("must not define mutator methods", () => {
    expectNoMutatorMethods(validCard);
  });

  it("must not contain functions", () => {
    expectNoFunctions(validCard);
  });
});
```

### Example 2: Graph Metrics Invariant Test

```typescript
import { validCardGraphMetrics } from "../fixtures/cardGraphMetrics.fixture.ts";
import {
  expectForbiddenFieldsAbsent,
  GRAPH_METRICS_FORBIDDEN_FIELDS
} from "../helpers/invariantHelpers.ts";

describe("CardGraphMetrics invariants", () => {
  it("must include graph_context provenance", () => {
    const gc = validCardGraphMetrics.graph_context;
    expect(gc.library_id).toBeDefined();
    expect(gc.graph_version).toBeDefined();
    expect(gc.computed_at).toBeDefined();
  });

  it("must not contain user/scheduling/performance fields", () => {
    expectForbiddenFieldsAbsent(
      validCardGraphMetrics,
      GRAPH_METRICS_FORBIDDEN_FIELDS,
      "CardGraphMetrics"
    );
  });
});
```

### Example 3: Cross-Object Consistency Test

```typescript
import { validRelationship } from "../fixtures/relationship.fixture.ts";
import { validRelationshipCard } from "../fixtures/relationshipCard.fixture.ts";

describe("RelationshipCard ↔ Relationship endpoint consistency", () => {
  it("RelationshipCard endpoints must match Relationship endpoints", () => {
    const rel = validRelationship;
    const card = validRelationshipCard;

    expect(card.relations.from_concept_id).toBe(rel.endpoints.from_concept_id);
    expect(card.relations.to_concept_id).toBe(rel.endpoints.to_concept_id);
    expect(card.relations.relationship_id).toBe(rel.relationship_id);
  });
});
```

---

## Migration Checklist

When refactoring existing tests:

- [ ] Replace inline test data with fixture imports
- [ ] Replace `VALID_*` with `valid*` naming
- [ ] Use helpers for forbidden fields checks
- [ ] Use helpers for immutability checks
- [ ] Group tests by concern (structure, forbidden fields, immutability, etc.)
- [ ] Update cross-object tests to use fixtures
- [ ] Remove duplicate test data definitions

---

## Summary

The refactoring established:

1. **Fixtures**: Centralized, reusable test data
2. **Helpers**: Common assertion patterns
3. **Conventions**: Consistent naming and structure
4. **Maintainability**: Single source of truth for test data

This makes the test suite:
- **Easier to maintain**: Update fixtures once, all tests benefit
- **More consistent**: Same patterns across all tests
- **Less redundant**: No duplicate test data
- **More readable**: Clear structure and naming

---

## Questions?

If you need to:
- Create a new fixture: Follow the pattern in `tests/fixtures/`
- Add a new helper: Add to `tests/helpers/invariantHelpers.ts`
- Write a new test: Follow the examples above

For questions or suggestions, refer to existing tests as examples.

