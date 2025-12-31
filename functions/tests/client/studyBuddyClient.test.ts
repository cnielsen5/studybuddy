/**
 * StudyBuddyClient Tests
 * 
 * Integration tests for the high-level StudyBuddyClient class.
 */

import { StudyBuddyClient } from "../../src/client";
import { Firestore } from "@google-cloud/firestore";
import * as eventUpload from "../../src/client/eventUpload";
import * as viewClient from "../../src/client/viewClient";
import * as eventHelpers from "../../src/client/eventHelpers";
import * as eventClient from "../../src/client/eventClient";

// Mock dependencies
jest.mock("../../src/client/eventUpload");
jest.mock("../../src/client/viewClient");
jest.mock("../../src/client/eventHelpers");
jest.mock("../../src/client/eventClient");

describe("StudyBuddyClient", () => {
  let mockFirestore: jest.Mocked<Firestore>;
  let client: StudyBuddyClient;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFirestore = {} as any;
    client = new StudyBuddyClient(mockFirestore, "user_123", "lib_abc", "device_001");
  });

  describe("reviewCard", () => {
    it("should create, validate, and upload a card review event", async () => {
      const mockEvent = {
        event_id: "evt_001",
        type: "card_reviewed" as const,
        user_id: "user_123",
        library_id: "lib_abc",
        entity: { kind: "card" as const, id: "card_0001" },
        payload: { grade: "good" as const, seconds_spent: 18 },
        occurred_at: "2025-01-01T00:00:00.000Z",
        received_at: "2025-01-01T00:00:01.000Z",
        device_id: "device_001",
        schema_version: "1.0",
      };

      jest.spyOn(eventHelpers, "createCardReviewedEvent").mockReturnValue(mockEvent as any);
      jest.spyOn(eventClient, "safeValidateEventBeforeEnqueue").mockReturnValue({
        success: true,
        event: mockEvent,
      });
      jest.spyOn(eventUpload, "uploadEvent").mockResolvedValue({
        success: true,
        eventId: "evt_001",
        path: "users/user_123/libraries/lib_abc/events/evt_001",
        idempotent: false,
      });

      const result = await client.reviewCard("card_0001", "good", 18);

      expect(result.success).toBe(true);
      expect(eventHelpers.createCardReviewedEvent).toHaveBeenCalledWith({
        userId: "user_123",
        libraryId: "lib_abc",
        cardId: "card_0001",
        grade: "good",
        secondsSpent: 18,
        deviceId: "device_001",
      });
      expect(eventClient.safeValidateEventBeforeEnqueue).toHaveBeenCalledWith(mockEvent);
      expect(eventUpload.uploadEvent).toHaveBeenCalledWith(mockFirestore, mockEvent);
    });

    it("should return error if validation fails", async () => {
      const mockEvent = {
        event_id: "evt_001",
        type: "card_reviewed" as const,
        user_id: "user_123",
        library_id: "lib_abc",
        entity: { kind: "card" as const, id: "card_0001" },
        payload: { grade: "good" as const, seconds_spent: 18 },
        occurred_at: "2025-01-01T00:00:00.000Z",
        received_at: "2025-01-01T00:00:01.000Z",
        device_id: "device_001",
        schema_version: "1.0",
      };

      jest.spyOn(eventHelpers, "createCardReviewedEvent").mockReturnValue(mockEvent as any);
      jest.spyOn(eventClient, "safeValidateEventBeforeEnqueue").mockReturnValue({
        success: false,
        error: {
          errors: [{ message: "Invalid event_id format", path: ["event_id"] }],
        } as any,
      });

      const result = await client.reviewCard("card_0001", "good", 18);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation failed");
      expect(eventUpload.uploadEvent).not.toHaveBeenCalled();
    });

    it("should use default deviceId if not provided", () => {
      const clientWithoutDevice = new StudyBuddyClient(mockFirestore, "user_123", "lib_abc");
      expect(clientWithoutDevice).toBeDefined();
    });
  });

  describe("getDueCards", () => {
    it("should delegate to viewClient.getDueCards", async () => {
      const mockDueCards = [
        {
          type: "card_schedule_view" as const,
          card_id: "card_0001",
          library_id: "lib_abc",
          user_id: "user_123",
          state: 2,
          due_at: "2025-01-01T00:00:00.000Z",
          stability: 3.2,
          difficulty: 5.1,
          interval_days: 3,
          last_reviewed_at: "2025-01-01T00:00:00.000Z",
          last_grade: "good" as const,
          last_applied: {
            received_at: "2025-01-01T00:00:00.000Z",
            event_id: "evt_001",
          },
          updated_at: "2025-01-01T00:00:00.000Z",
        },
      ];

      jest.spyOn(viewClient, "getDueCards").mockResolvedValue(mockDueCards);

      const result = await client.getDueCards(10);

      expect(result).toEqual(mockDueCards);
      expect(viewClient.getDueCards).toHaveBeenCalledWith(mockFirestore, "user_123", "lib_abc", 10);
    });

    it("should use default limit of 50", async () => {
      jest.spyOn(viewClient, "getDueCards").mockResolvedValue([]);

      await client.getDueCards();

      expect(viewClient.getDueCards).toHaveBeenCalledWith(mockFirestore, "user_123", "lib_abc", 50);
    });
  });

  describe("getCardSchedule", () => {
    it("should delegate to viewClient.getCardScheduleView", async () => {
      const mockSchedule = {
        type: "card_schedule_view" as const,
        card_id: "card_0001",
        library_id: "lib_abc",
        user_id: "user_123",
        state: 2,
        due_at: "2025-01-01T00:00:00.000Z",
        stability: 3.2,
        difficulty: 5.1,
        interval_days: 3,
        last_reviewed_at: "2025-01-01T00:00:00.000Z",
        last_grade: "good" as const,
        last_applied: {
          received_at: "2025-01-01T00:00:00.000Z",
          event_id: "evt_001",
        },
        updated_at: "2025-01-01T00:00:00.000Z",
      };

      jest.spyOn(viewClient, "getCardScheduleView").mockResolvedValue(mockSchedule);

      const result = await client.getCardSchedule("card_0001");

      expect(result).toEqual(mockSchedule);
      expect(viewClient.getCardScheduleView).toHaveBeenCalledWith(
        mockFirestore,
        "user_123",
        "lib_abc",
        "card_0001"
      );
    });
  });

  describe("getCardPerformance", () => {
    it("should delegate to viewClient.getCardPerformanceView", async () => {
      const mockPerformance = {
        type: "card_performance_view" as const,
        card_id: "card_0001",
        library_id: "lib_abc",
        user_id: "user_123",
        total_reviews: 10,
        correct_reviews: 8,
        accuracy_rate: 0.8,
        avg_seconds: 15.5,
        streak: 3,
        max_streak: 5,
        last_reviewed_at: "2025-01-01T00:00:00.000Z",
        last_applied: {
          received_at: "2025-01-01T00:00:00.000Z",
          event_id: "evt_001",
        },
        updated_at: "2025-01-01T00:00:00.000Z",
      };

      jest.spyOn(viewClient, "getCardPerformanceView").mockResolvedValue(mockPerformance);

      const result = await client.getCardPerformance("card_0001");

      expect(result).toEqual(mockPerformance);
      expect(viewClient.getCardPerformanceView).toHaveBeenCalledWith(
        mockFirestore,
        "user_123",
        "lib_abc",
        "card_0001"
      );
    });
  });

  describe("uploadEvent", () => {
    it("should delegate to eventUpload.uploadEvent", async () => {
      const mockEvent = {
        event_id: "evt_001",
        type: "card_reviewed" as const,
        user_id: "user_123",
        library_id: "lib_abc",
        entity: { kind: "card" as const, id: "card_0001" },
        payload: { grade: "good" as const, seconds_spent: 18 },
        occurred_at: "2025-01-01T00:00:00.000Z",
        received_at: "2025-01-01T00:00:01.000Z",
        device_id: "device_001",
        schema_version: "1.0",
      };

      jest.spyOn(eventUpload, "uploadEvent").mockResolvedValue({
        success: true,
        eventId: "evt_001",
        path: "users/user_123/libraries/lib_abc/events/evt_001",
        idempotent: false,
      });

      const result = await client.uploadEvent(mockEvent);

      expect(result.success).toBe(true);
      expect(eventUpload.uploadEvent).toHaveBeenCalledWith(mockFirestore, mockEvent);
    });
  });

  describe("uploadEvents", () => {
    it("should delegate to eventUpload.uploadEventsBatch", async () => {
      const mockEvents = [
        {
          event_id: "evt_001",
          type: "card_reviewed" as const,
          user_id: "user_123",
          library_id: "lib_abc",
          entity: { kind: "card" as const, id: "card_0001" },
          payload: { grade: "good" as const, seconds_spent: 18 },
          occurred_at: "2025-01-01T00:00:00.000Z",
          received_at: "2025-01-01T00:00:01.000Z",
          device_id: "device_001",
          schema_version: "1.0",
        },
      ];

      jest.spyOn(eventUpload, "uploadEventsBatch").mockResolvedValue([
        {
          success: true,
          eventId: "evt_001",
          path: "users/user_123/libraries/lib_abc/events/evt_001",
          idempotent: false,
        },
      ]);

      const result = await client.uploadEvents(mockEvents);

      expect(result).toHaveLength(1);
      expect(eventUpload.uploadEventsBatch).toHaveBeenCalledWith(mockFirestore, mockEvents);
    });
  });
});

