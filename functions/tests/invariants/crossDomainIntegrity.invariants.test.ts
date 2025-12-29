/**
 * Cross-Domain Integrity Invariants
 * 
 * Purpose: Validate join keys and naming conventions across fixtures without importing production code.
 * These tests catch drift immediately when fixtures/schemas are updated.
 * 
 * These are "cheap, high value" tests that ensure:
 * - Referential integrity between related objects
 * - ID naming convention consistency
 * - Option ID validity in question attempts
 */

import { validQuestionAttempt } from "../fixtures/questionAttempt.fixture.ts";
import { validQuestion } from "../fixtures/question.fixture.ts";
import { validCard } from "../fixtures/card.fixture.ts";
import { validRelationshipCard } from "../fixtures/relationshipCard.fixture.ts";
import { validCardScheduleView } from "../fixtures/views/cardScheduleView.fixture.ts";
import { validCardPerformanceView } from "../fixtures/views/cardPerformanceView.fixture.ts";
import { validUserEvent } from "../fixtures/userEvent.fixture.ts";
import { validCardReviewedEvent } from "../fixtures/cardReviewed.fixture.ts";
import { validRelationshipReviewedEvent } from "../fixtures/relationshipReviewed.fixture.ts";
import { validMisconceptionProbeResultEvent } from "../fixtures/misconceptionProbeResult.fixture.ts";
import { validLibraryIdMapAppliedEvent } from "../fixtures/libraryIDMapApplied.fixture.ts";

// Define questionAttemptedEvent inline (not in a separate fixture file)
const validQuestionAttemptedEvent = {
  ...validUserEvent,
  type: "question_attempted",
  entity: { kind: "question", id: "q_0001" },
  payload: {
    selected_option_id: "opt_B",
    correct: true,
    seconds_spent: 35
  }
} as const;

// ============================================================================
// Attempt → Question Integrity
// ============================================================================

describe("Cross-Domain Integrity: QuestionAttempt → Question", () => {
  it("question_id must match Question.id exactly", () => {
    expect(validQuestionAttempt.question_id).toBe(validQuestion.id);
  });

  it("question_id must follow Question ID naming convention (q_ prefix)", () => {
    expect(validQuestionAttempt.question_id).toMatch(/^q_/);
    expect(validQuestion.id).toMatch(/^q_/);
  });

  it("selected_option_id must exist in Question.content.options", () => {
    const optionIds = validQuestion.content.options.map((opt) => opt.id);
    expect(optionIds).toContain(validQuestionAttempt.response.selected_option_id);
  });

  it("selected_option_id must be a valid option ID format (opt_ prefix)", () => {
    expect(validQuestionAttempt.response.selected_option_id).toMatch(/^opt_/);
    
    // Verify all question options also follow the convention
    for (const option of validQuestion.content.options) {
      expect(option.id).toMatch(/^opt_/);
    }
  });
});

// ============================================================================
// Card State/Views → Card Integrity
// ============================================================================

describe("Cross-Domain Integrity: CardScheduleView → Card", () => {
  it("card_id must match a Card.id", () => {
    expect(validCardScheduleView.card_id).toBe(validCard.id);
  });

  it("card_id must follow Card ID naming convention (card_ prefix)", () => {
    expect(validCardScheduleView.card_id).toMatch(/^card_/);
    expect(validCard.id).toMatch(/^card_/);
  });
});

describe("Cross-Domain Integrity: CardPerformanceView → Card", () => {
  it("card_id must match a Card.id", () => {
    expect(validCardPerformanceView.card_id).toBe(validCard.id);
  });

  it("card_id must follow Card ID naming convention (card_ prefix)", () => {
    expect(validCardPerformanceView.card_id).toMatch(/^card_/);
    expect(validCard.id).toMatch(/^card_/);
  });
});

// ============================================================================
// Event → Entity IDs Integrity
// ============================================================================

/**
 * Maps entity kinds to their expected ID prefixes
 */
const ENTITY_KIND_TO_PREFIX: Record<string, string> = {
  card: "card_",
  question: "q_",
  relationship_card: "card_rel_", // Relationship cards use card_rel_ prefix (standardized)
  relcard: "card_rel_", // Alternative naming (also uses card_rel_)
  relationship: "rel_",
  concept: "concept_",
  misconception_edge: "mis_edge_",
  library_version: "", // Library versions may have different formats
};

describe("Cross-Domain Integrity: Events → Entity IDs", () => {
  describe("card_reviewed event", () => {
    it("entity.kind must imply correct ID prefix", () => {
      const event = validCardReviewedEvent;
      const expectedPrefix = ENTITY_KIND_TO_PREFIX[event.entity.kind];
      
      expect(expectedPrefix).toBeDefined();
      expect(event.entity.id).toMatch(new RegExp(`^${expectedPrefix}`));
    });

    it("entity.id must match Card.id when kind is 'card'", () => {
      const event = validCardReviewedEvent;
      if (event.entity.kind === "card") {
        expect(event.entity.id).toBe(validCard.id);
      }
    });
  });

  describe("question_attempted event", () => {
    it("entity.kind must imply correct ID prefix", () => {
      const event = validQuestionAttemptedEvent;
      const expectedPrefix = ENTITY_KIND_TO_PREFIX[event.entity.kind];
      
      expect(expectedPrefix).toBeDefined();
      expect(event.entity.id).toMatch(new RegExp(`^${expectedPrefix}`));
    });

    it("entity.id must match Question.id when kind is 'question'", () => {
      const event = validQuestionAttemptedEvent;
      if (event.entity.kind === "question") {
        expect(event.entity.id).toBe(validQuestion.id);
      }
    });
  });

  describe("relationship_reviewed event", () => {
    it("entity.kind must imply correct ID prefix", () => {
      const event = validRelationshipReviewedEvent;
      const expectedPrefix = ENTITY_KIND_TO_PREFIX[event.entity.kind];
      
      expect(expectedPrefix).toBeDefined();
      expect(event.entity.id).toMatch(new RegExp(`^${expectedPrefix}`));
    });

    it("entity.id must match RelationshipCard.id when kind is 'relationship_card'", () => {
      const event = validRelationshipReviewedEvent;
      if (event.entity.kind === "relationship_card") {
        expect(event.entity.id).toBe(validRelationshipCard.id);
      }
    });
  });

  describe("misconception_probe_result event", () => {
    it("entity.kind must imply correct ID prefix", () => {
      const event = validMisconceptionProbeResultEvent;
      const expectedPrefix = ENTITY_KIND_TO_PREFIX[event.entity.kind];
      
      expect(expectedPrefix).toBeDefined();
      if (expectedPrefix) {
        expect(event.entity.id).toMatch(new RegExp(`^${expectedPrefix}`));
      }
    });
  });

  describe("library_id_map_applied event", () => {
    it("entity.kind must be defined", () => {
      const event = validLibraryIdMapAppliedEvent;
      expect(event.entity.kind).toBeDefined();
      // Library versions may have custom ID formats, so we just check it exists
      expect(event.entity.id).toBeDefined();
    });
  });

  describe("base userEvent fixture", () => {
    it("entity.kind must imply correct ID prefix", () => {
      const event = validUserEvent;
      const expectedPrefix = ENTITY_KIND_TO_PREFIX[event.entity.kind];
      
      expect(expectedPrefix).toBeDefined();
      expect(event.entity.id).toMatch(new RegExp(`^${expectedPrefix}`));
    });
  });
});

// ============================================================================
// ID Naming Convention Consistency
// ============================================================================

describe("Cross-Domain Integrity: ID Naming Conventions", () => {
  it("all Card IDs must follow card_ prefix", () => {
    expect(validCard.id).toMatch(/^card_/);
    expect(validCardScheduleView.card_id).toMatch(/^card_/);
    expect(validCardPerformanceView.card_id).toMatch(/^card_/);
  });

  it("all Question IDs must follow q_ prefix", () => {
    expect(validQuestion.id).toMatch(/^q_/);
    expect(validQuestionAttempt.question_id).toMatch(/^q_/);
  });

  it("all Option IDs must follow opt_ prefix", () => {
    expect(validQuestionAttempt.response.selected_option_id).toMatch(/^opt_/);
    for (const option of validQuestion.content.options) {
      expect(option.id).toMatch(/^opt_/);
    }
  });

  it("all Attempt IDs must follow attempt_ prefix", () => {
    expect(validQuestionAttempt.attempt_id).toMatch(/^attempt_/);
  });

  it("all Event IDs must follow evt_ prefix", () => {
    expect(validUserEvent.event_id).toMatch(/^evt_/);
    expect(validCardReviewedEvent.event_id).toMatch(/^evt_/);
    expect(validQuestionAttemptedEvent.event_id).toMatch(/^evt_/);
    expect(validRelationshipReviewedEvent.event_id).toMatch(/^evt_/);
    expect(validMisconceptionProbeResultEvent.event_id).toMatch(/^evt_/);
    expect(validLibraryIdMapAppliedEvent.event_id).toMatch(/^evt_/);
  });
});

