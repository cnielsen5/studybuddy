# Core Domain Logic Implementation

## Overview

The core domain logic consists of pure functions (no I/O, no side effects) that implement the business logic for spaced repetition, queue management, and concept mastery tracking.

## Modules

### 1. Scheduler (`src/core/scheduler/`)

#### `fsrs.ts` - FSRS Algorithm
- **Purpose**: Implements the Free Spaced Repetition Scheduler algorithm
- **Key Functions**:
  - `calculateNextSchedule()` - Calculates next review schedule based on grade
  - `calculateRetention()` - Calculates retention probability
  - `calculateOptimalInterval()` - Finds optimal interval for target retention
  - `initializeCardSchedule()` - Initializes a new card's schedule

**Features**:
- Handles state transitions (NEW → LEARNING → REVIEW → RELEARNING)
- Updates stability and difficulty based on review grades
- Calculates intervals based on stability
- Respects configurable parameters (min/max stability, difficulty, etc.)

#### `normalization.ts` - Parameter Normalization
- **Purpose**: Normalizes and validates scheduling parameters
- **Key Functions**:
  - `normalizeStability()` - Clamps stability to valid range
  - `normalizeDifficulty()` - Clamps difficulty to valid range
  - `normalizeInterval()` - Ensures interval is at least 1 day
  - `validateFSRSParameters()` - Validates FSRS parameter configuration

### 2. Queue (`src/core/queue/`)

#### `eligibility.ts` - Card Eligibility Checker
- **Purpose**: Determines if cards are eligible for review
- **Key Functions**:
  - `checkEligibility()` - Checks if a card is eligible based on state, due date, etc.
  - `isDue()` - Simple check if card is due
  - `isNew()`, `isLearning()`, `isReview()` - State checks

**Features**:
- Filters by card state (NEW, LEARNING, REVIEW, RELEARNING)
- Respects overdue limits
- Checks stability/difficulty bounds
- Supports prerequisite checking (framework ready)

#### `queueBuilder.ts` - Queue Construction
- **Purpose**: Builds prioritized study queues from eligible cards
- **Key Functions**:
  - `buildQueue()` - Builds a study queue with prioritization
  - `getQueueStats()` - Gets statistics about the queue

**Prioritization Strategies**:
- `due_first` - Prioritize most overdue cards
- `new_first` - Prioritize new cards
- `difficulty` - Prioritize difficult cards
- `stability` - Prioritize low-stability cards
- `balanced` - Balanced approach considering multiple factors

**Features**:
- Configurable queue size limits
- Balancing new vs review cards (configurable ratio)
- Optional shuffling
- Priority scoring based on multiple factors

#### `explainability.ts` - Queue Explanations
- **Purpose**: Provides human-readable explanations for queue decisions
- **Key Functions**:
  - `explainQueueItem()` - Explains why a card is in the queue
  - `explainQueue()` - Explains all items
  - `explainQueueSummary()` - Provides queue summary
  - `explainPriority()` - Explains priority score

**Features**:
- Context-aware explanations (overdue, new, difficult, etc.)
- Retention probability context
- State-specific messaging

### 3. Graph (`src/core/graph/`)

#### `conceptGraph.ts` - Concept Graph Utilities
- **Purpose**: Manages concept relationships and dependencies
- **Key Functions**:
  - `buildConceptGraph()` - Builds graph from concepts
  - `getAllPrerequisites()` - Gets transitive prerequisites
  - `getAllUnlocks()` - Gets transitive unlocks
  - `hasPrerequisitesMastered()` - Checks if prerequisites are mastered
  - `findReadyConcepts()` - Finds concepts ready to learn
  - `findLearningPath()` - Finds optimal learning order
  - `hasCycle()` - Detects cycles in dependency graph

**Features**:
- Graph traversal (DFS)
- Prerequisite checking
- Learning path optimization
- Cycle detection

#### `metrics.ts` - Concept Mastery Metrics
- **Purpose**: Calculates mastery metrics for concepts
- **Key Functions**:
  - `calculateConceptMastery()` - Calculates metrics for a single concept
  - `calculateAllConceptMastery()` - Calculates metrics for all concepts
  - `isConceptMastered()` - Checks if concept is mastered
  - `getConceptsByMastery()` - Sorts concepts by mastery score

**Metrics Calculated**:
- Mastery score (0-1, weighted combination of stability and accuracy)
- Total/mastered card counts
- Average stability, difficulty, accuracy
- Card state distribution (new, learning, review)

## Design Principles

### Pure Functions
All functions are pure:
- No I/O operations
- No side effects
- Deterministic (same input = same output)
- Functions in → functions out

### Testability
- All modules have comprehensive unit tests
- Tests cover edge cases, boundary conditions, and error handling
- Tests are fast (no I/O, no async operations)

### Modularity
- Each module has a single responsibility
- Modules can be used independently
- Clear interfaces between modules

## Usage Examples

### FSRS Scheduling

```typescript
import { calculateNextSchedule, initializeCardSchedule } from './core/scheduler/fsrs';

// Initialize a new card
const initial = initializeCardSchedule();

// Review with "good" grade
const result = calculateNextSchedule(initial, "good");
// result.stability increased, result.state = LEARNING, result.intervalDays = ...
```

### Queue Building

```typescript
import { buildQueue } from './core/queue/queueBuilder';
import { checkEligibility } from './core/queue/eligibility';

// Get eligible cards
const eligible = schedules.filter(s => checkEligibility(s).eligible);

// Build queue
const queue = buildQueue(eligible, {
  maxSize: 50,
  strategy: "balanced",
  balanceNewAndReview: true,
  newCardRatio: 0.3,
});
```

### Concept Mastery

```typescript
import { calculateConceptMastery } from './core/graph/metrics';

const metrics = calculateConceptMastery(
  concept,
  cardMappings,
  scheduleViews,
  performanceViews
);

if (metrics.masteryScore >= 0.8) {
  // Concept is mastered
}
```

## Testing

All modules have comprehensive test coverage:

- `tests/core/scheduler/fsrs.test.ts` - FSRS algorithm tests
- `tests/core/scheduler/normalization.test.ts` - Normalization tests
- `tests/core/queue/eligibility.test.ts` - Eligibility tests
- `tests/core/queue/queueBuilder.test.ts` - Queue builder tests
- `tests/core/queue/explainability.test.ts` - Explainability tests
- `tests/core/graph/conceptGraph.test.ts` - Concept graph tests

Run tests with:
```bash
npm test -- tests/core/
```

## Next Steps

These core modules can now be integrated with:
1. **Application Layer** (`src/application/`) - Use these functions to build study sessions
2. **Policies** (`src/policies/`) - Business rules that use these functions
3. **Projectors** - Can use FSRS to update schedule views (already partially done in reducers)

