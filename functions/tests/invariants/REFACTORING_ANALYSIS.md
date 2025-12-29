# Invariant Tests Refactoring Analysis

## Executive Summary

This document outlines redundancies, inconsistencies, and opportunities for improvement in the invariant test suite. The analysis identified significant duplication that can be reduced through shared fixtures and test helpers.

## Key Findings

### 1. Duplicate Test Data (High Priority)

**Relationship Objects Duplicated Across 4 Files:**
- `relationshipCardEndpointConsistency.invariants.test.ts`
- `relationshipCardRelationConsistency.invariants.test.ts`
- `relationshipGraphMetricsEndpointConsistency.invariants.test.ts`
- `relationshipGraphMetricsRelationConsistency.invariants.test.ts`

**Solution:** Created shared fixtures:
- `fixtures/relationship.fixture.ts`
- `fixtures/relationshipCard.fixture.ts`
- `fixtures/relationshipGraphMetrics.fixture.ts`

### 2. Repeated Test Patterns (High Priority)

**Nearly Identical "Forbidden Fields" Tests:**
- Found in all GraphMetrics files (Card, Concept, Question, Relationship)
- Same fields checked: `user_id`, `session_id`, `state`, `due`, `stability`, `avg_seconds`, `attempts`, `explanation`, etc.
- ~30 lines of nearly identical code per file

**Solution:** Created `helpers/invariantHelpers.ts` with:
- `GRAPH_METRICS_FORBIDDEN_FIELDS` constant
- `GOLDEN_MASTER_FORBIDDEN_FIELDS` constant
- `expectForbiddenFieldsAbsent()` helper function

**Nearly Identical "Immutability" Tests:**
- Every file has identical immutability checks:
  - Mutator methods check (~10-15 lines)
  - Functions check (~5 lines)
- Same methods checked: `update`, `mutate`, `recompute`, etc.

**Solution:** Created helpers:
- `COMMON_MUTATOR_METHODS` constant
- `expectNoMutatorMethods()` helper
- `expectNoFunctions()` helper

### 3. Naming Inconsistencies (Medium Priority)

**Inconsistent Constant Naming:**
- Some use `valid*` (lowercase): `validCard`, `validRelationship`
- Some use `VALID_*` (uppercase): `VALID_QUESTION`, `VALID_CONCEPT`

**Recommendation:** Standardize on `valid*` (lowercase) for consistency with existing fixtures.

### 4. Missing Fixtures (Medium Priority)

**Objects Defined Inline That Should Be Fixtures:**
- `validCard` / `validBasicCard` / `validClozeCard` → `fixtures/card.fixture.ts`
- `VALID_QUESTION` → `fixtures/question.fixture.ts`
- `VALID_CONCEPT` → `fixtures/concept.fixture.ts`
- `validCardGraphMetrics` → `fixtures/cardGraphMetrics.fixture.ts`
- `validConceptGraphMetrics` → `fixtures/conceptGraphMetrics.fixture.ts`
- `validQuestionGraphMetrics` → `fixtures/questionGraphMetrics.fixture.ts`
- `validCardPerformanceMetrics` → `fixtures/cardPerformanceMetrics.fixture.ts`
- `validCardScheduleState` → `fixtures/cardScheduleState.fixture.ts`
- `validSessionQueueItem` → `fixtures/sessionQueueItem.fixture.ts`
- `validSessionSummary` → `fixtures/sessionSummary.fixture.ts`
- `validPrimaryReason` → `fixtures/primaryReason.fixture.ts`
- `validMisconceptionEdge` → `fixtures/misconceptionEdge.fixture.ts`

**Note:** `questionAttempt.fixture.ts` already exists and is used correctly.

### 5. Test Structure Patterns (Low Priority)

**Common Patterns That Could Be Standardized:**
1. **Identity checks:** `type` field + ID field(s)
2. **Structure checks:** Required top-level sections
3. **Type validation:** Enum values, string arrays, etc.
4. **Forbidden fields:** Cross-domain contamination prevention
5. **Immutability:** No mutators, no functions

**Recommendation:** Create additional helpers for common patterns as needed.

## Refactoring Priority

### Phase 1: High Impact, Low Risk
1. ✅ Create shared fixtures for Relationship objects (DONE)
2. ✅ Create test helpers for forbidden fields and immutability (DONE)
3. Refactor consistency tests to use shared fixtures
4. Refactor GraphMetrics tests to use helpers

### Phase 2: Medium Impact, Low Risk
5. Create fixtures for all domain objects
6. Refactor all tests to use fixtures
7. Standardize naming convention

### Phase 3: Low Impact, Optional
8. Create additional helpers for common patterns
9. Consolidate similar test structures

## Example Refactoring

### Before (relationshipCardEndpointConsistency.invariants.test.ts):
```typescript
const validRelationship = {
  relationship_id: "rel_0001",
  // ... 50+ lines
};

const validRelationshipCard = {
  id: "card_rel_0001",
  // ... 40+ lines
};
```

### After:
```typescript
import { validRelationship } from "../../fixtures/relationship.fixture";
import { validRelationshipCard } from "../../fixtures/relationshipCard.fixture";
```

### Before (cardGraphMetrics.invariants.test.ts):
```typescript
describe("CardGraphMetrics invariants — forbidden cross-domain fields", () => {
  it("must not contain user, scheduling, performance, evidence, or AI narrative fields", () => {
    const m: any = validCardGraphMetrics;
    
    expect(m.user_id).toBeUndefined();
    expect(m.session_id).toBeUndefined();
    expect(m.state).toBeUndefined();
    // ... 20+ more lines
  });
});

describe("CardGraphMetrics invariants — immutability by design", () => {
  it("must not define mutator methods", () => {
    const m: any = validCardGraphMetrics;
    expect(m.update).toBeUndefined();
    expect(m.recompute).toBeUndefined();
    // ... 10+ more lines
  });
  
  it("must not contain any functions", () => {
    for (const value of Object.values(validCardGraphMetrics)) {
      expect(typeof value).not.toBe("function");
    }
  });
});
```

### After:
```typescript
import { 
  expectForbiddenFieldsAbsent, 
  expectNoMutatorMethods, 
  expectNoFunctions,
  GRAPH_METRICS_FORBIDDEN_FIELDS 
} from "../../helpers/invariantHelpers";

describe("CardGraphMetrics invariants — forbidden cross-domain fields", () => {
  it("must not contain user, scheduling, performance, evidence, or AI narrative fields", () => {
    expectForbiddenFieldsAbsent(
      validCardGraphMetrics,
      GRAPH_METRICS_FORBIDDEN_FIELDS
    );
  });
});

describe("CardGraphMetrics invariants — immutability by design", () => {
  it("must not define mutator methods", () => {
    expectNoMutatorMethods(validCardGraphMetrics);
  });
  
  it("must not contain any functions", () => {
    expectNoFunctions(validCardGraphMetrics);
  });
});
```

## Metrics

### Current State
- **Total invariant test files:** 30
- **Lines of duplicate test data:** ~500+
- **Lines of duplicate test code:** ~800+
- **Total redundancy:** ~1,300 lines

### After Refactoring (Estimated)
- **Shared fixtures:** ~15 files
- **Test helpers:** 1 file
- **Reduced duplication:** ~70% reduction
- **Estimated lines saved:** ~900 lines

## Consistency Issues Found

1. **Type field checks:** Some check `type` in identity tests, some don't
2. **Forbidden field lists:** Slight variations between files (some include `mastery`, some don't)
3. **Mutator method lists:** Some files check more methods than others
4. **Test descriptions:** Inconsistent wording ("forbidden fields" vs "forbidden cross-domain fields")

## Recommendations

1. **Immediate:** Use the new fixtures and helpers in consistency tests
2. **Short-term:** Create remaining fixtures and refactor all tests
3. **Long-term:** Establish linting rules to prevent future duplication

## Files Created

- ✅ `tests/fixtures/relationship.fixture.ts`
- ✅ `tests/fixtures/relationshipCard.fixture.ts`
- ✅ `tests/fixtures/relationshipGraphMetrics.fixture.ts`
- ✅ `tests/helpers/invariantHelpers.ts`

## Next Steps

1. Refactor consistency tests to use shared fixtures
2. Refactor GraphMetrics tests to use helpers
3. Create remaining fixtures
4. Update all tests to use fixtures and helpers
5. Add tests for helpers themselves

