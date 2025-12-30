/**
 * Event Router Tests
 * 
 * Tests for event routing by type
 */

import { routeEvent } from "../../src/projector/eventRouter";
import { Firestore } from "@google-cloud/firestore";
import { validCardReviewedEvent } from "../fixtures/cardReviewed.fixture.ts";
import { validUserEvent } from "../fixtures/userEvent.fixture.ts";

// Mock Firestore and card projector
jest.mock("@google-cloud/firestore");
jest.mock("../../src/projector/cardProjector", () => ({
  projectCardReviewedEvent: jest.fn(),
}));

import { projectCardReviewedEvent } from "../../src/projector/cardProjector";

describe("Event Router", () => {
  let mockFirestore: jest.Mocked<Firestore>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockFirestore = {} as any;
  });

  describe("routeEvent", () => {
    it("should route card_reviewed events to CardProjector", async () => {
      (projectCardReviewedEvent as jest.Mock).mockResolvedValue({
        success: true,
        eventId: validCardReviewedEvent.event_id,
        cardId: "card_0001",
        scheduleViewUpdated: true,
        performanceViewUpdated: true,
        idempotent: false,
      });

      const result = await routeEvent(mockFirestore, validCardReviewedEvent);

      expect(projectCardReviewedEvent).toHaveBeenCalledWith(
        mockFirestore,
        validCardReviewedEvent
      );
      expect(result.success).toBe(true);
      expect(result.eventId).toBe(validCardReviewedEvent.event_id);
    });

    it("should handle unknown event types gracefully", async () => {
      const unknownEvent = {
        ...validUserEvent,
        type: "unknown_event_type",
      };

      const result = await routeEvent(mockFirestore, unknownEvent);

      expect(result.success).toBe(true);
      expect(result.error).toContain("No projector for event type");
      expect(projectCardReviewedEvent).not.toHaveBeenCalled();
    });

    it("should propagate errors from projectors", async () => {
      (projectCardReviewedEvent as jest.Mock).mockResolvedValue({
        success: false,
        eventId: validCardReviewedEvent.event_id,
        cardId: "card_0001",
        scheduleViewUpdated: false,
        performanceViewUpdated: false,
        idempotent: false,
        error: "Projection failed",
      });

      const result = await routeEvent(mockFirestore, validCardReviewedEvent);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Projection failed");
    });
  });
});

