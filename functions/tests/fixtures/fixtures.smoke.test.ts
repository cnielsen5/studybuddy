/**
 * Fixtures Smoke Test
 * 
 * Purpose: Import all fixtures and verify they are defined.
 * This catches broken import paths and circular dependencies before
 * writing real ingestion code.
 * 
 * This is a "compile-time" smoke test - if this passes, all fixtures
 * can be imported successfully.
 */

// Domain fixtures
import { validCard } from "./card.fixture.ts";
import { validBasicCard } from "./card.fixture.ts";
import { validClozeCard } from "./card.fixture.ts";
import { validQuestion } from "./question.fixture.ts";
import { validConcept } from "./concept.fixture.ts";
import { validQuestionAttempt } from "./questionAttempt.fixture.ts";
import { validRelationship } from "./relationship.fixture.ts";
import { validRelationshipCard } from "./relationshipCard.fixture.ts";
import { validRelationshipGraphMetrics } from "./relationshipGraphMetrics.fixture.ts";

// Event fixtures
import { validUserEvent } from "./userEvent.fixture.ts";
import { validCardReviewedEvent } from "./cardReviewed.fixture.ts";
import { validRelationshipReviewedEvent } from "./relationshipReviewed.fixture.ts";
import { validMisconceptionProbeResultEvent } from "./misconceptionProbeResult.fixture.ts";
import { validLibraryIdMapAppliedEvent } from "./libraryIDMapApplied.fixture.ts";
import { validSessionStartedEvent } from "./sessionStarted.fixture.ts";
import { validSessionEndedEvent } from "./sessionEnded.fixture.ts";
import { validContentFlaggedEvent } from "./contentFlagged.fixture.ts";
import { validCardAnnotationUpdatedEvent } from "./cardAnnotationUpdated.fixture.ts";
import { validMasteryCertificationStartedEvent } from "./masteryCertificationStarted.fixture.ts";
import { validMasteryCertificationCompletedEvent } from "./masteryCertificationCompleted.fixture.ts";
import { validInterventionAcceptedEvent } from "./interventionAccepted.fixture.ts";
import { validInterventionRejectedEvent } from "./interventionRejected.fixture.ts";
import { validAccelerationAppliedEvent } from "./accelerationApplied.fixture.ts";
import { validLapseAppliedEvent } from "./lapseApplied.fixture.ts";

// View fixtures
import { validCardScheduleView } from "./views/cardScheduleView.fixture.ts";
import { validCardPerformanceView } from "./views/cardPerformanceView.fixture.ts";
import { validMisconceptionEdgeView } from "./views/misconceptionEdgeView.fixture.ts";

describe("Fixtures Smoke Test", () => {
  describe("Domain fixtures", () => {
    it("should export validCard", () => {
      expect(validCard).toBeDefined();
      expect(typeof validCard).toBe("object");
    });

    it("should export validBasicCard", () => {
      expect(validBasicCard).toBeDefined();
      expect(typeof validBasicCard).toBe("object");
    });

    it("should export validClozeCard", () => {
      expect(validClozeCard).toBeDefined();
      expect(typeof validClozeCard).toBe("object");
    });

    it("should export validQuestion", () => {
      expect(validQuestion).toBeDefined();
      expect(typeof validQuestion).toBe("object");
    });

    it("should export validConcept", () => {
      expect(validConcept).toBeDefined();
      expect(typeof validConcept).toBe("object");
    });

    it("should export validQuestionAttempt", () => {
      expect(validQuestionAttempt).toBeDefined();
      expect(typeof validQuestionAttempt).toBe("object");
    });

    it("should export validRelationship", () => {
      expect(validRelationship).toBeDefined();
      expect(typeof validRelationship).toBe("object");
    });

    it("should export validRelationshipCard", () => {
      expect(validRelationshipCard).toBeDefined();
      expect(typeof validRelationshipCard).toBe("object");
    });

    it("should export validRelationshipGraphMetrics", () => {
      expect(validRelationshipGraphMetrics).toBeDefined();
      expect(typeof validRelationshipGraphMetrics).toBe("object");
    });
  });

  describe("Event fixtures", () => {
    it("should export validUserEvent", () => {
      expect(validUserEvent).toBeDefined();
      expect(typeof validUserEvent).toBe("object");
    });

    it("should export validCardReviewedEvent", () => {
      expect(validCardReviewedEvent).toBeDefined();
      expect(typeof validCardReviewedEvent).toBe("object");
    });

    it("should export validRelationshipReviewedEvent", () => {
      expect(validRelationshipReviewedEvent).toBeDefined();
      expect(typeof validRelationshipReviewedEvent).toBe("object");
    });

    it("should export validMisconceptionProbeResultEvent", () => {
      expect(validMisconceptionProbeResultEvent).toBeDefined();
      expect(typeof validMisconceptionProbeResultEvent).toBe("object");
    });

    it("should export validLibraryIdMapAppliedEvent", () => {
      expect(validLibraryIdMapAppliedEvent).toBeDefined();
      expect(typeof validLibraryIdMapAppliedEvent).toBe("object");
    });

    it("should export validSessionStartedEvent", () => {
      expect(validSessionStartedEvent).toBeDefined();
      expect(typeof validSessionStartedEvent).toBe("object");
    });

    it("should export validSessionEndedEvent", () => {
      expect(validSessionEndedEvent).toBeDefined();
      expect(typeof validSessionEndedEvent).toBe("object");
    });

    it("should export validContentFlaggedEvent", () => {
      expect(validContentFlaggedEvent).toBeDefined();
      expect(typeof validContentFlaggedEvent).toBe("object");
    });

    it("should export validCardAnnotationUpdatedEvent", () => {
      expect(validCardAnnotationUpdatedEvent).toBeDefined();
      expect(typeof validCardAnnotationUpdatedEvent).toBe("object");
    });

    it("should export validMasteryCertificationStartedEvent", () => {
      expect(validMasteryCertificationStartedEvent).toBeDefined();
      expect(typeof validMasteryCertificationStartedEvent).toBe("object");
    });

    it("should export validMasteryCertificationCompletedEvent", () => {
      expect(validMasteryCertificationCompletedEvent).toBeDefined();
      expect(typeof validMasteryCertificationCompletedEvent).toBe("object");
    });

    it("should export validInterventionAcceptedEvent", () => {
      expect(validInterventionAcceptedEvent).toBeDefined();
      expect(typeof validInterventionAcceptedEvent).toBe("object");
    });

    it("should export validInterventionRejectedEvent", () => {
      expect(validInterventionRejectedEvent).toBeDefined();
      expect(typeof validInterventionRejectedEvent).toBe("object");
    });

    it("should export validAccelerationAppliedEvent", () => {
      expect(validAccelerationAppliedEvent).toBeDefined();
      expect(typeof validAccelerationAppliedEvent).toBe("object");
    });

    it("should export validLapseAppliedEvent", () => {
      expect(validLapseAppliedEvent).toBeDefined();
      expect(typeof validLapseAppliedEvent).toBe("object");
    });
  });

  describe("View fixtures", () => {
    it("should export validCardScheduleView", () => {
      expect(validCardScheduleView).toBeDefined();
      expect(typeof validCardScheduleView).toBe("object");
    });

    it("should export validCardPerformanceView", () => {
      expect(validCardPerformanceView).toBeDefined();
      expect(typeof validCardPerformanceView).toBe("object");
    });

    it("should export validMisconceptionEdgeView", () => {
      expect(validMisconceptionEdgeView).toBeDefined();
      expect(typeof validMisconceptionEdgeView).toBe("object");
    });
  });

  describe("Fixture structure validation", () => {
    it("all domain fixtures should have an id or identifier field", () => {
      expect(validCard.id).toBeDefined();
      expect(validQuestion.id).toBeDefined();
      expect(validConcept.id).toBeDefined();
      expect(validQuestionAttempt.attempt_id).toBeDefined();
      expect(validRelationship.relationship_id).toBeDefined();
      expect(validRelationshipCard.id).toBeDefined();
      expect(validRelationshipGraphMetrics.relationship_id).toBeDefined();
    });

    it("all event fixtures should have event_id and type", () => {
      const events = [
        validUserEvent,
        validCardReviewedEvent,
        validRelationshipReviewedEvent,
        validMisconceptionProbeResultEvent,
        validLibraryIdMapAppliedEvent,
        validSessionStartedEvent,
        validSessionEndedEvent,
        validContentFlaggedEvent,
        validCardAnnotationUpdatedEvent,
        validMasteryCertificationStartedEvent,
        validMasteryCertificationCompletedEvent,
        validInterventionAcceptedEvent,
        validInterventionRejectedEvent,
        validAccelerationAppliedEvent,
        validLapseAppliedEvent,
      ];

      for (const event of events) {
        expect(event.event_id).toBeDefined();
        expect(typeof event.event_id).toBe("string");
        expect(event.type).toBeDefined();
        expect(typeof event.type).toBe("string");
      }
    });

    it("all view fixtures should have type and updated_at", () => {
      expect(validCardScheduleView.type).toBeDefined();
      expect(validCardScheduleView.updated_at).toBeDefined();
      
      expect(validCardPerformanceView.type).toBeDefined();
      expect(validCardPerformanceView.updated_at).toBeDefined();
      
      expect(validMisconceptionEdgeView.type).toBeDefined();
      expect(validMisconceptionEdgeView.updated_at).toBeDefined();
    });
  });
});

