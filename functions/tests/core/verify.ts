/**
 * Manual Verification Script for Core Modules
 * 
 * Run with: npx ts-node tests/core/verify.ts
 * 
 * This script tests the core modules without Jest to verify they work correctly.
 */

import { calculateNextSchedule, initializeCardSchedule, DEFAULT_FSRS_PARAMS } from "../../src/core/scheduler/fsrs";
import { normalizeStability, normalizeDifficulty } from "../../src/core/scheduler/normalization";
import { checkEligibility, isDue } from "../../src/core/queue/eligibility";
import { buildQueue, getQueueStats, DEFAULT_QUEUE_OPTIONS } from "../../src/core/queue/queueBuilder";
import { explainQueueItem, explainQueueSummary } from "../../src/core/queue/explainability";
import { buildConceptGraph, hasPrerequisitesMastered } from "../../src/core/graph/conceptGraph";
import { CardState } from "../../src/domain/enums";
import { PrimaryReason } from "../../src/domain/enums";

// Test results
let testsPassed = 0;
let testsFailed = 0;

function test(name: string, fn: () => boolean) {
  try {
    if (fn()) {
      console.log(`✅ ${name}`);
      testsPassed++;
    } else {
      console.log(`❌ ${name}`);
      testsFailed++;
    }
  } catch (error) {
    console.log(`❌ ${name} - Error: ${error}`);
    testsFailed++;
  }
}

console.log("🧪 Testing Core Modules...\n");

// FSRS Tests
console.log("📅 FSRS Scheduler Tests:");
test("initializeCardSchedule creates new card", () => {
  const schedule = initializeCardSchedule();
  return schedule.state === CardState.NEW && schedule.reps === 0;
});

test("calculateNextSchedule increases stability on 'good' grade", () => {
  const input = initializeCardSchedule();
  const result = calculateNextSchedule(input, "good");
  return result.stability > input.stability;
});

test("calculateNextSchedule handles 'again' grade (lapse)", () => {
  const input = {
    ...initializeCardSchedule(),
    stability: 10.0,
    state: CardState.REVIEW,
  };
  const result = calculateNextSchedule(input, "again");
  return result.stability < input.stability && result.lapses === 1;
});

// Normalization Tests
console.log("\n🔧 Normalization Tests:");
test("normalizeStability clamps to valid range", () => {
  const normalized = normalizeStability(1000.0);
  return normalized <= DEFAULT_FSRS_PARAMS.maxStability;
});

test("normalizeDifficulty handles NaN", () => {
  const normalized = normalizeDifficulty(NaN);
  return normalized === DEFAULT_FSRS_PARAMS.initialDifficulty;
});

// Eligibility Tests
console.log("\n✅ Eligibility Tests:");
test("checkEligibility marks new cards as eligible", () => {
  const schedule = {
    card_id: "card_001",
    state: CardState.NEW,
    due_at: new Date().toISOString(),
    stability: 1.0,
    difficulty: 5.0,
    interval_days: 1,
    last_reviewed_at: new Date().toISOString(),
  };
  const result = checkEligibility(schedule);
  return result.eligible && result.reason === PrimaryReason.NEW_CARD;
});

test("isDue returns true for overdue cards", () => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() - 1);
  const schedule = {
    card_id: "card_001",
    state: CardState.REVIEW,
    due_at: dueDate.toISOString(),
    stability: 10.0,
    difficulty: 5.0,
    interval_days: 10,
    last_reviewed_at: new Date().toISOString(),
  };
  return isDue(schedule);
});

// Queue Builder Tests
console.log("\n📋 Queue Builder Tests:");
test("buildQueue creates queue from eligible cards", () => {
  const schedules = [
    {
      card_id: "card_001",
      state: CardState.NEW,
      due_at: new Date().toISOString(),
      stability: 1.0,
      difficulty: 5.0,
      interval_days: 1,
      last_reviewed_at: new Date().toISOString(),
    },
    {
      card_id: "card_002",
      state: CardState.REVIEW,
      due_at: new Date().toISOString(),
      stability: 10.0,
      difficulty: 5.0,
      interval_days: 10,
      last_reviewed_at: new Date().toISOString(),
    },
  ];
  const queue = buildQueue(schedules, { ...DEFAULT_QUEUE_OPTIONS, maxSize: 10 });
  return queue.length === 2 && queue[0].card_id === "card_001";
});

test("getQueueStats calculates correct statistics", () => {
  const schedules = [
    {
      card_id: "card_001",
      state: CardState.NEW,
      due_at: new Date().toISOString(),
      stability: 1.0,
      difficulty: 5.0,
      interval_days: 1,
      last_reviewed_at: new Date().toISOString(),
    },
  ];
  const queue = buildQueue(schedules);
  const stats = getQueueStats(queue);
  return stats.total === 1 && stats.new === 1;
});

// Explainability Tests
console.log("\n💬 Explainability Tests:");
test("explainQueueItem generates explanation", () => {
  const schedules = [
    {
      card_id: "card_001",
      state: CardState.NEW,
      due_at: new Date().toISOString(),
      stability: 1.0,
      difficulty: 5.0,
      interval_days: 1,
      last_reviewed_at: new Date().toISOString(),
    },
  ];
  const queue = buildQueue(schedules);
  const explanation = explainQueueItem(queue[0]);
  return explanation.explanation.length > 0 && explanation.card_id === "card_001";
});

test("explainQueueSummary handles empty queue", () => {
  const summary = explainQueueSummary([]);
  return summary.includes("No cards");
});

// Concept Graph Tests
console.log("\n🕸️  Concept Graph Tests:");
test("buildConceptGraph creates graph from concepts", () => {
  const concepts = [
    {
      id: "concept_1",
      type: "concept" as const,
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "user_001",
        last_updated_by: "user_001",
        version: 1,
        status: "published" as const,
        tags: [],
        difficulty: "basic" as const,
        high_yield_score: 0.5,
      },
      hierarchy: {
        library_id: "lib_001",
        domain: "domain",
        category: "category",
        subcategory: "subcategory",
        topic: "topic",
      },
      content: {
        title: "Concept 1",
        definition: "Definition",
        summary: "Summary",
      },
      dependency_graph: {
        prerequisites: ["concept_2"],
        unlocks: [],
        related_concepts: [],
        child_concepts: [],
      },
      mastery_config: {
        threshold: 0.8,
        decay_rate: "standard" as const,
        min_questions_correct: 3,
      },
      linked_content: {
        card_ids: [],
        question_ids: [],
      },
    },
    {
      id: "concept_2",
      type: "concept" as const,
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "user_001",
        last_updated_by: "user_001",
        version: 1,
        status: "published" as const,
        tags: [],
        difficulty: "basic" as const,
        high_yield_score: 0.5,
      },
      hierarchy: {
        library_id: "lib_001",
        domain: "domain",
        category: "category",
        subcategory: "subcategory",
        topic: "topic",
      },
      content: {
        title: "Concept 2",
        definition: "Definition",
        summary: "Summary",
      },
      dependency_graph: {
        prerequisites: [],
        unlocks: [],
        related_concepts: [],
        child_concepts: [],
      },
      mastery_config: {
        threshold: 0.8,
        decay_rate: "standard" as const,
        min_questions_correct: 3,
      },
      linked_content: {
        card_ids: [],
        question_ids: [],
      },
    },
  ];

  const graph = buildConceptGraph(concepts);
  return graph.nodes.size === 2 && graph.nodes.has("concept_1");
});

test("hasPrerequisitesMastered returns true when prerequisites are mastered", () => {
  const concepts = [
    {
      id: "concept_1",
      type: "concept" as const,
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "user_001",
        last_updated_by: "user_001",
        version: 1,
        status: "published" as const,
        tags: [],
        difficulty: "basic" as const,
        high_yield_score: 0.5,
      },
      hierarchy: {
        library_id: "lib_001",
        domain: "domain",
        category: "category",
        subcategory: "subcategory",
        topic: "topic",
      },
      content: {
        title: "Concept 1",
        definition: "Definition",
        summary: "Summary",
      },
      dependency_graph: {
        prerequisites: ["concept_2"],
        unlocks: [],
        related_concepts: [],
        child_concepts: [],
      },
      mastery_config: {
        threshold: 0.8,
        decay_rate: "standard" as const,
        min_questions_correct: 3,
      },
      linked_content: {
        card_ids: [],
        question_ids: [],
      },
    },
    {
      id: "concept_2",
      type: "concept" as const,
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: "user_001",
        last_updated_by: "user_001",
        version: 1,
        status: "published" as const,
        tags: [],
        difficulty: "basic" as const,
        high_yield_score: 0.5,
      },
      hierarchy: {
        library_id: "lib_001",
        domain: "domain",
        category: "category",
        subcategory: "subcategory",
        topic: "topic",
      },
      content: {
        title: "Concept 2",
        definition: "Definition",
        summary: "Summary",
      },
      dependency_graph: {
        prerequisites: [],
        unlocks: [],
        related_concepts: [],
        child_concepts: [],
      },
      mastery_config: {
        threshold: 0.8,
        decay_rate: "standard" as const,
        min_questions_correct: 3,
      },
      linked_content: {
        card_ids: [],
        question_ids: [],
      },
    },
  ];

  const graph = buildConceptGraph(concepts);
  const mastered = new Set(["concept_2"]);
  return hasPrerequisitesMastered(graph, "concept_1", mastered);
});

// Summary
console.log("\n" + "=".repeat(50));
console.log(`📊 Test Results: ${testsPassed} passed, ${testsFailed} failed`);
console.log("=".repeat(50));

if (testsFailed === 0) {
  console.log("🎉 All tests passed!");
  process.exit(0);
} else {
  console.log("⚠️  Some tests failed. Please review the output above.");
  process.exit(1);
}

