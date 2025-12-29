/**
 * Fixture Validation Tests
 * 
 * Purpose: Verify that all fixtures pass Zod runtime validation.
 * This ensures fixtures match the expected schema structure and will
 * work correctly in production ingestion/projector code.
 * 
 * These tests complement the invariant tests by providing runtime
 * validation that can be used in production code.
 */

import {
  CardSchema,
  QuestionSchema,
  ConceptSchema,
  QuestionAttemptSchema,
  UserEventSchema,
  CardScheduleViewSchema,
  CardPerformanceViewSchema,
  CardReviewedPayloadSchema,
  QuestionAttemptedPayloadSchema,
  SessionStartedPayloadSchema,
  SessionEndedPayloadSchema,
  ContentFlaggedPayloadSchema,
  CardAnnotationUpdatedPayloadSchema,
  MasteryCertificationCompletedPayloadSchema,
} from "../../src/validation/schemas.ts";

// Domain fixtures
import { validCard, validBasicCard, validClozeCard } from "../fixtures/card.fixture.ts";
import { validQuestion } from "../fixtures/question.fixture.ts";
import { validConcept } from "../fixtures/concept.fixture.ts";
import { validQuestionAttempt } from "../fixtures/questionAttempt.fixture.ts";

// Event fixtures
import { validUserEvent } from "../fixtures/userEvent.fixture.ts";
import { validCardReviewedEvent } from "../fixtures/cardReviewed.fixture.ts";
import { validRelationshipReviewedEvent } from "../fixtures/relationshipReviewed.fixture.ts";
import { validMisconceptionProbeResultEvent } from "../fixtures/misconceptionProbeResult.fixture.ts";
import { validLibraryIdMapAppliedEvent } from "../fixtures/libraryIDMapApplied.fixture.ts";
import { validSessionStartedEvent } from "../fixtures/sessionStarted.fixture.ts";
import { validSessionEndedEvent } from "../fixtures/sessionEnded.fixture.ts";
import { validContentFlaggedEvent } from "../fixtures/contentFlagged.fixture.ts";
import { validCardAnnotationUpdatedEvent } from "../fixtures/cardAnnotationUpdated.fixture.ts";
import { validMasteryCertificationCompletedEvent } from "../fixtures/masteryCertificationCompleted.fixture.ts";
import { validInterventionAcceptedEvent } from "../fixtures/interventionAccepted.fixture.ts";
import { validInterventionRejectedEvent } from "../fixtures/interventionRejected.fixture.ts";
import { validAccelerationAppliedEvent } from "../fixtures/accelerationApplied.fixture.ts";
import { validLapseAppliedEvent } from "../fixtures/lapseApplied.fixture.ts";

// View fixtures
import { validCardScheduleView } from "../fixtures/views/cardScheduleView.fixture.ts";
import { validCardPerformanceView } from "../fixtures/views/cardPerformanceView.fixture.ts";
import { validMisconceptionEdgeView } from "../fixtures/views/misconceptionEdgeView.fixture.ts";

describe("Fixture Runtime Validation (Zod)", () => {
  describe("Domain fixtures", () => {
    it("validCard should pass CardSchema validation", () => {
      expect(() => CardSchema.parse(validCard)).not.toThrow();
    });

    it("validBasicCard should pass CardSchema validation", () => {
      expect(() => CardSchema.parse(validBasicCard)).not.toThrow();
    });

    it("validClozeCard should pass CardSchema validation", () => {
      expect(() => CardSchema.parse(validClozeCard)).not.toThrow();
    });

    it("validQuestion should pass QuestionSchema validation", () => {
      expect(() => QuestionSchema.parse(validQuestion)).not.toThrow();
    });

    it("validConcept should pass ConceptSchema validation", () => {
      expect(() => ConceptSchema.parse(validConcept)).not.toThrow();
    });

    it("validQuestionAttempt should pass QuestionAttemptSchema validation", () => {
      expect(() => QuestionAttemptSchema.parse(validQuestionAttempt)).not.toThrow();
    });
  });

  describe("Event fixtures", () => {
    it("validUserEvent should pass UserEventSchema validation", () => {
      expect(() => UserEventSchema.parse(validUserEvent)).not.toThrow();
    });

    it("validCardReviewedEvent should pass UserEventSchema validation", () => {
      expect(() => UserEventSchema.parse(validCardReviewedEvent)).not.toThrow();
    });

    it("validCardReviewedEvent payload should pass CardReviewedPayloadSchema validation", () => {
      expect(() => CardReviewedPayloadSchema.parse(validCardReviewedEvent.payload)).not.toThrow();
    });

    it("validRelationshipReviewedEvent should pass UserEventSchema validation", () => {
      expect(() => UserEventSchema.parse(validRelationshipReviewedEvent)).not.toThrow();
    });

    it("validMisconceptionProbeResultEvent should pass UserEventSchema validation", () => {
      expect(() => UserEventSchema.parse(validMisconceptionProbeResultEvent)).not.toThrow();
    });

    it("validLibraryIdMapAppliedEvent should pass UserEventSchema validation", () => {
      expect(() => UserEventSchema.parse(validLibraryIdMapAppliedEvent)).not.toThrow();
    });

    it("validSessionStartedEvent should pass UserEventSchema validation", () => {
      expect(() => UserEventSchema.parse(validSessionStartedEvent)).not.toThrow();
    });

    it("validSessionStartedEvent payload should pass SessionStartedPayloadSchema validation", () => {
      expect(() => SessionStartedPayloadSchema.parse(validSessionStartedEvent.payload)).not.toThrow();
    });

    it("validSessionEndedEvent should pass UserEventSchema validation", () => {
      expect(() => UserEventSchema.parse(validSessionEndedEvent)).not.toThrow();
    });

    it("validSessionEndedEvent payload should pass SessionEndedPayloadSchema validation", () => {
      expect(() => SessionEndedPayloadSchema.parse(validSessionEndedEvent.payload)).not.toThrow();
    });

    it("validContentFlaggedEvent should pass UserEventSchema validation", () => {
      expect(() => UserEventSchema.parse(validContentFlaggedEvent)).not.toThrow();
    });

    it("validContentFlaggedEvent payload should pass ContentFlaggedPayloadSchema validation", () => {
      expect(() => ContentFlaggedPayloadSchema.parse(validContentFlaggedEvent.payload)).not.toThrow();
    });

    it("validCardAnnotationUpdatedEvent should pass UserEventSchema validation", () => {
      expect(() => UserEventSchema.parse(validCardAnnotationUpdatedEvent)).not.toThrow();
    });

    it("validCardAnnotationUpdatedEvent payload should pass CardAnnotationUpdatedPayloadSchema validation", () => {
      expect(() => CardAnnotationUpdatedPayloadSchema.parse(validCardAnnotationUpdatedEvent.payload)).not.toThrow();
    });

    it("validMasteryCertificationCompletedEvent should pass UserEventSchema validation", () => {
      expect(() => UserEventSchema.parse(validMasteryCertificationCompletedEvent)).not.toThrow();
    });

    it("validMasteryCertificationCompletedEvent payload should pass MasteryCertificationCompletedPayloadSchema validation", () => {
      expect(() => MasteryCertificationCompletedPayloadSchema.parse(validMasteryCertificationCompletedEvent.payload)).not.toThrow();
    });

    it("validInterventionAcceptedEvent should pass UserEventSchema validation", () => {
      expect(() => UserEventSchema.parse(validInterventionAcceptedEvent)).not.toThrow();
    });

    it("validInterventionRejectedEvent should pass UserEventSchema validation", () => {
      expect(() => UserEventSchema.parse(validInterventionRejectedEvent)).not.toThrow();
    });

    it("validAccelerationAppliedEvent should pass UserEventSchema validation", () => {
      expect(() => UserEventSchema.parse(validAccelerationAppliedEvent)).not.toThrow();
    });

    it("validLapseAppliedEvent should pass UserEventSchema validation", () => {
      expect(() => UserEventSchema.parse(validLapseAppliedEvent)).not.toThrow();
    });
  });

  describe("View fixtures", () => {
    it("validCardScheduleView should pass CardScheduleViewSchema validation", () => {
      expect(() => CardScheduleViewSchema.parse(validCardScheduleView)).not.toThrow();
    });

    it("validCardPerformanceView should pass CardPerformanceViewSchema validation", () => {
      expect(() => CardPerformanceViewSchema.parse(validCardPerformanceView)).not.toThrow();
    });

    // Note: MisconceptionEdgeView schema not yet implemented
    // it("validMisconceptionEdgeView should pass MisconceptionEdgeViewSchema validation", () => {
    //   expect(() => MisconceptionEdgeViewSchema.parse(validMisconceptionEdgeView)).not.toThrow();
    // });
  });

  describe("Validation error details", () => {
    it("should provide detailed error messages for invalid data", () => {
      const invalidCard = { ...validCard, id: "invalid_id" };
      const result = CardSchema.safeParse(invalidCard);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThan(0);
        expect(result.error.errors[0].path).toContain("id");
      }
    });

    it("should validate ID prefixes correctly", () => {
      const invalidQuestion = { ...validQuestion, id: "wrong_prefix_123" };
      const result = QuestionSchema.safeParse(invalidQuestion);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        const idError = result.error.errors.find(e => e.path.includes("id"));
        expect(idError).toBeDefined();
      }
    });
  });
});

