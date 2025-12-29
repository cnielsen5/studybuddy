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
import { validSessionStartedEvent } from "../fixtures/sessionStarted.fixture.ts";
import { validSessionEndedEvent } from "../fixtures/sessionEnded.fixture.ts";
import { validContentFlaggedEvent } from "../fixtures/contentFlagged.fixture.ts";
import { validCardAnnotationUpdatedEvent } from "../fixtures/cardAnnotationUpdated.fixture.ts";
import { validMasteryCertificationStartedEvent } from "../fixtures/masteryCertificationStarted.fixture.ts";
import { validMasteryCertificationCompletedEvent } from "../fixtures/masteryCertificationCompleted.fixture.ts";
import { validInterventionAcceptedEvent } from "../fixtures/interventionAccepted.fixture.ts";
import { validInterventionRejectedEvent } from "../fixtures/interventionRejected.fixture.ts";
import { validAccelerationAppliedEvent } from "../fixtures/accelerationApplied.fixture.ts";
import { validLapseAppliedEvent } from "../fixtures/lapseApplied.fixture.ts";
import { expectIdPrefix, expectIdPrefixes, ID_PREFIXES } from "../helpers/ids.ts";

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
    expectIdPrefix(validQuestionAttempt.question_id, ID_PREFIXES.QUESTION, "QuestionAttempt.question_id");
    expectIdPrefix(validQuestion.id, ID_PREFIXES.QUESTION, "Question.id");
  });

  it("selected_option_id must exist in Question.content.options", () => {
    const optionIds = validQuestion.content.options.map((opt) => opt.id);
    expect(optionIds).toContain(validQuestionAttempt.response.selected_option_id);
  });

  it("selected_option_id must be a valid option ID format (opt_ prefix)", () => {
    expectIdPrefix(validQuestionAttempt.response.selected_option_id, ID_PREFIXES.OPTION, "QuestionAttempt.selected_option_id");
    
    // Verify all question options also follow the convention
    expectIdPrefixes(
      validQuestion.content.options.map(opt => opt.id),
      ID_PREFIXES.OPTION,
      "Question.options[].id"
    );
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
    expectIdPrefix(validCardScheduleView.card_id, ID_PREFIXES.CARD, "CardScheduleView.card_id");
    expectIdPrefix(validCard.id, ID_PREFIXES.CARD, "Card.id");
  });
});

describe("Cross-Domain Integrity: CardPerformanceView → Card", () => {
  it("card_id must match a Card.id", () => {
    expect(validCardPerformanceView.card_id).toBe(validCard.id);
  });

  it("card_id must follow Card ID naming convention (card_ prefix)", () => {
    expectIdPrefix(validCardPerformanceView.card_id, ID_PREFIXES.CARD, "CardPerformanceView.card_id");
    expectIdPrefix(validCard.id, ID_PREFIXES.CARD, "Card.id");
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
  session: "session_",
  library_version: "", // Library versions may have different formats
};

describe("Cross-Domain Integrity: Events → Entity IDs", () => {
  describe("card_reviewed event", () => {
    it("entity.kind must imply correct ID prefix", () => {
      const event = validCardReviewedEvent;
      const expectedPrefix = ENTITY_KIND_TO_PREFIX[event.entity.kind];
      
      expect(expectedPrefix).toBeDefined();
      if (expectedPrefix) {
        expectIdPrefix(event.entity.id, expectedPrefix, `${event.type} entity.id`);
      }
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
      if (expectedPrefix) {
        expectIdPrefix(event.entity.id, expectedPrefix, `${event.type} entity.id`);
      }
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
      if (expectedPrefix) {
        expectIdPrefix(event.entity.id, expectedPrefix, `${event.type} entity.id`);
      }
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
        expectIdPrefix(event.entity.id, expectedPrefix, `${event.type} entity.id`);
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

  describe("session_started event", () => {
    it("entity.kind must imply correct ID prefix", () => {
      const event = validSessionStartedEvent;
      const expectedPrefix = ENTITY_KIND_TO_PREFIX[event.entity.kind];
      
      expect(expectedPrefix).toBeDefined();
      if (expectedPrefix) {
        expectIdPrefix(event.entity.id, expectedPrefix, `${event.type} entity.id`);
      }
    });
  });

  describe("session_ended event", () => {
    it("entity.kind must imply correct ID prefix", () => {
      const event = validSessionEndedEvent;
      const expectedPrefix = ENTITY_KIND_TO_PREFIX[event.entity.kind];
      
      expect(expectedPrefix).toBeDefined();
      if (expectedPrefix) {
        expectIdPrefix(event.entity.id, expectedPrefix, `${event.type} entity.id`);
      }
    });
  });

  describe("content_flagged event", () => {
    it("entity.kind must imply correct ID prefix", () => {
      const event = validContentFlaggedEvent;
      const expectedPrefix = ENTITY_KIND_TO_PREFIX[event.entity.kind];
      
      expect(expectedPrefix).toBeDefined();
      if (expectedPrefix) {
        expectIdPrefix(event.entity.id, expectedPrefix, `${event.type} entity.id`);
      }
    });
  });

  describe("card_annotation_updated event", () => {
    it("entity.kind must imply correct ID prefix", () => {
      const event = validCardAnnotationUpdatedEvent;
      const expectedPrefix = ENTITY_KIND_TO_PREFIX[event.entity.kind];
      
      expect(expectedPrefix).toBeDefined();
      if (expectedPrefix) {
        expectIdPrefix(event.entity.id, expectedPrefix, `${event.type} entity.id`);
      }
    });
  });

  describe("mastery_certification_started event", () => {
    it("entity.kind must imply correct ID prefix", () => {
      const event = validMasteryCertificationStartedEvent;
      const expectedPrefix = ENTITY_KIND_TO_PREFIX[event.entity.kind];
      
      expect(expectedPrefix).toBeDefined();
      if (expectedPrefix) {
        expectIdPrefix(event.entity.id, expectedPrefix, `${event.type} entity.id`);
      }
    });
  });

  describe("mastery_certification_completed event", () => {
    it("entity.kind must imply correct ID prefix", () => {
      const event = validMasteryCertificationCompletedEvent;
      const expectedPrefix = ENTITY_KIND_TO_PREFIX[event.entity.kind];
      
      expect(expectedPrefix).toBeDefined();
      if (expectedPrefix) {
        expectIdPrefix(event.entity.id, expectedPrefix, `${event.type} entity.id`);
      }
    });
  });

  describe("intervention_accepted event", () => {
    it("entity.kind must imply correct ID prefix", () => {
      const event = validInterventionAcceptedEvent;
      const expectedPrefix = ENTITY_KIND_TO_PREFIX[event.entity.kind];
      
      expect(expectedPrefix).toBeDefined();
      if (expectedPrefix) {
        expectIdPrefix(event.entity.id, expectedPrefix, `${event.type} entity.id`);
      }
    });
  });

  describe("intervention_rejected event", () => {
    it("entity.kind must imply correct ID prefix", () => {
      const event = validInterventionRejectedEvent;
      const expectedPrefix = ENTITY_KIND_TO_PREFIX[event.entity.kind];
      
      expect(expectedPrefix).toBeDefined();
      if (expectedPrefix) {
        expectIdPrefix(event.entity.id, expectedPrefix, `${event.type} entity.id`);
      }
    });
  });

  describe("acceleration_applied event", () => {
    it("entity.kind must imply correct ID prefix", () => {
      const event = validAccelerationAppliedEvent;
      const expectedPrefix = ENTITY_KIND_TO_PREFIX[event.entity.kind];
      
      expect(expectedPrefix).toBeDefined();
      if (expectedPrefix) {
        expectIdPrefix(event.entity.id, expectedPrefix, `${event.type} entity.id`);
      }
    });
  });

  describe("lapse_applied event", () => {
    it("entity.kind must imply correct ID prefix", () => {
      const event = validLapseAppliedEvent;
      const expectedPrefix = ENTITY_KIND_TO_PREFIX[event.entity.kind];
      
      expect(expectedPrefix).toBeDefined();
      if (expectedPrefix) {
        expectIdPrefix(event.entity.id, expectedPrefix, `${event.type} entity.id`);
      }
    });
  });

  describe("base userEvent fixture", () => {
    it("entity.kind must imply correct ID prefix", () => {
      const event = validUserEvent;
      const expectedPrefix = ENTITY_KIND_TO_PREFIX[event.entity.kind];
      
      expect(expectedPrefix).toBeDefined();
      if (expectedPrefix) {
        expectIdPrefix(event.entity.id, expectedPrefix, `${event.type} entity.id`);
      }
    });
  });
});

// ============================================================================
// ID Naming Convention Consistency
// ============================================================================

describe("Cross-Domain Integrity: ID Naming Conventions", () => {
  it("all Card IDs must follow card_ prefix", () => {
    expectIdPrefix(validCard.id, ID_PREFIXES.CARD, "Card.id");
    expectIdPrefix(validCardScheduleView.card_id, ID_PREFIXES.CARD, "CardScheduleView.card_id");
    expectIdPrefix(validCardPerformanceView.card_id, ID_PREFIXES.CARD, "CardPerformanceView.card_id");
  });

  it("all Question IDs must follow q_ prefix", () => {
    expectIdPrefix(validQuestion.id, ID_PREFIXES.QUESTION, "Question.id");
    expectIdPrefix(validQuestionAttempt.question_id, ID_PREFIXES.QUESTION, "QuestionAttempt.question_id");
  });

  it("all Option IDs must follow opt_ prefix", () => {
    expectIdPrefix(validQuestionAttempt.response.selected_option_id, ID_PREFIXES.OPTION, "QuestionAttempt.selected_option_id");
    expectIdPrefixes(
      validQuestion.content.options.map(opt => opt.id),
      ID_PREFIXES.OPTION,
      "Question.options[].id"
    );
  });

  it("all Attempt IDs must follow attempt_ prefix", () => {
    expectIdPrefix(validQuestionAttempt.attempt_id, ID_PREFIXES.ATTEMPT, "QuestionAttempt.attempt_id");
  });

  it("all Event IDs must follow evt_ prefix", () => {
    expectIdPrefix(validUserEvent.event_id, ID_PREFIXES.EVENT, "UserEvent.event_id");
    expectIdPrefix(validCardReviewedEvent.event_id, ID_PREFIXES.EVENT, "CardReviewedEvent.event_id");
    expectIdPrefix(validQuestionAttemptedEvent.event_id, ID_PREFIXES.EVENT, "QuestionAttemptedEvent.event_id");
    expectIdPrefix(validRelationshipReviewedEvent.event_id, ID_PREFIXES.EVENT, "RelationshipReviewedEvent.event_id");
    expectIdPrefix(validMisconceptionProbeResultEvent.event_id, ID_PREFIXES.EVENT, "MisconceptionProbeResultEvent.event_id");
    expectIdPrefix(validLibraryIdMapAppliedEvent.event_id, ID_PREFIXES.EVENT, "LibraryIdMapAppliedEvent.event_id");
    expectIdPrefix(validSessionStartedEvent.event_id, ID_PREFIXES.EVENT, "SessionStartedEvent.event_id");
    expectIdPrefix(validSessionEndedEvent.event_id, ID_PREFIXES.EVENT, "SessionEndedEvent.event_id");
    expectIdPrefix(validContentFlaggedEvent.event_id, ID_PREFIXES.EVENT, "ContentFlaggedEvent.event_id");
    expectIdPrefix(validCardAnnotationUpdatedEvent.event_id, ID_PREFIXES.EVENT, "CardAnnotationUpdatedEvent.event_id");
    expectIdPrefix(validMasteryCertificationStartedEvent.event_id, ID_PREFIXES.EVENT, "MasteryCertificationStartedEvent.event_id");
    expectIdPrefix(validMasteryCertificationCompletedEvent.event_id, ID_PREFIXES.EVENT, "MasteryCertificationCompletedEvent.event_id");
    expectIdPrefix(validInterventionAcceptedEvent.event_id, ID_PREFIXES.EVENT, "InterventionAcceptedEvent.event_id");
    expectIdPrefix(validInterventionRejectedEvent.event_id, ID_PREFIXES.EVENT, "InterventionRejectedEvent.event_id");
    expectIdPrefix(validAccelerationAppliedEvent.event_id, ID_PREFIXES.EVENT, "AccelerationAppliedEvent.event_id");
    expectIdPrefix(validLapseAppliedEvent.event_id, ID_PREFIXES.EVENT, "LapseAppliedEvent.event_id");
  });
});

