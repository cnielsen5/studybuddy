/**
 * Event Projector Trigger Tests
 * 
 * Tests for the Firestore onCreate trigger
 */

// Mock Firebase Admin BEFORE importing the trigger
const mockFirestore = {
  doc: jest.fn(),
  collection: jest.fn(),
  runTransaction: jest.fn(),
};

jest.mock("firebase-admin", () => ({
  apps: [],
  initializeApp: jest.fn(),
  firestore: jest.fn(() => mockFirestore),
}));

import { onEventCreated } from "../../src/triggers/eventProjectorTrigger";
import { validCardReviewedEvent } from "../fixtures/cardReviewed.fixture.ts";
import * as admin from "firebase-admin";
jest.mock("firebase-functions/v2/firestore", () => ({
  onDocumentCreated: jest.fn((config, handler) => handler),
}));
jest.mock("firebase-functions/logger", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock projector
jest.mock("../../src/projector/eventProjector", () => ({
  validateEventForProjection: jest.fn(),
  projectEvent: jest.fn(),
}));

import { validateEventForProjection, projectEvent } from "../../src/projector/eventProjector";
import * as logger from "firebase-functions/logger";

describe("Event Projector Trigger", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should process valid card_reviewed event", async () => {
    const mockEvent = {
      data: {
        data: () => validCardReviewedEvent,
      },
      params: {
        userId: validCardReviewedEvent.user_id,
        libraryId: validCardReviewedEvent.library_id,
        eventId: validCardReviewedEvent.event_id,
      },
    };

    (validateEventForProjection as jest.Mock).mockReturnValue({
      success: true,
      event: validCardReviewedEvent,
    });
    (projectEvent as jest.Mock).mockResolvedValue({
      success: true,
      eventId: validCardReviewedEvent.event_id,
    });

    await onEventCreated(mockEvent as any);

    expect(validateEventForProjection).toHaveBeenCalledWith(validCardReviewedEvent);
    expect(projectEvent).toHaveBeenCalled();
    expect(logger.info).toHaveBeenCalled();
  });

  it("should handle validation failures gracefully", async () => {
    const mockEvent = {
      data: {
        data: () => ({ invalid: "event" }),
      },
      params: {
        userId: "user_123",
        libraryId: "lib_abc",
        eventId: "evt_001",
      },
    };

    (validateEventForProjection as jest.Mock).mockReturnValue({
      success: false,
      error: { errors: [{ message: "Validation failed" }] },
    });

    await onEventCreated(mockEvent as any);

    expect(projectEvent).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalled();
  });

  it("should handle missing event data", async () => {
    const mockEvent = {
      data: null,
      params: {
        userId: "user_123",
        libraryId: "lib_abc",
        eventId: "evt_001",
      },
    };

    await onEventCreated(mockEvent as any);

    expect(validateEventForProjection).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalled();
  });

  it("should verify path matches event data", async () => {
    const mockEvent = {
      data: {
        data: () => validCardReviewedEvent,
      },
      params: {
        userId: "user_wrong",
        libraryId: validCardReviewedEvent.library_id,
        eventId: validCardReviewedEvent.event_id,
      },
    };

    (validateEventForProjection as jest.Mock).mockReturnValue({
      success: true,
      event: validCardReviewedEvent,
    });

    await onEventCreated(mockEvent as any);

    expect(projectEvent).not.toHaveBeenCalled();
    expect(logger.error).toHaveBeenCalledWith(
      expect.stringContaining("User ID mismatch")
    );
  });
});

