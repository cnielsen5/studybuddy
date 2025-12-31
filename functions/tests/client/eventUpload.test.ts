/**
 * Event Upload Tests
 * 
 * Tests for client-side event upload functionality including:
 * - Single event upload
 * - Batch event upload
 * - Idempotency handling
 * - Error handling
 */

import { uploadEvent, uploadEventsBatch, checkEventExists } from "../../src/client/eventUpload";
import { Firestore } from "@google-cloud/firestore";
import { validUserEvent } from "../fixtures/userEvent.fixture.ts";
import { validateEventBeforeEnqueue } from "../../src/client/eventClient";

// Mock Firestore
jest.mock("@google-cloud/firestore");

describe("Event Upload", () => {
  let mockFirestore: jest.Mocked<Firestore>;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;
  let mockBatch: jest.Mock;
  let mockCommit: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGet = jest.fn();
    mockSet = jest.fn().mockResolvedValue(undefined);
    mockCommit = jest.fn().mockResolvedValue(undefined);
    mockBatch = jest.fn(() => ({
      set: jest.fn(),
      commit: mockCommit,
    }));

    mockDoc = jest.fn((path: string) => ({
      path,
      get: mockGet,
      set: mockSet,
    }));

    mockFirestore = {
      doc: mockDoc,
      batch: mockBatch,
    } as any;
  });

  describe("uploadEvent", () => {
    it("should upload a new event successfully", async () => {
      const validatedEvent = validateEventBeforeEnqueue(validUserEvent);

      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      const result = await uploadEvent(mockFirestore, validatedEvent);

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(false);
      expect(result.eventId).toBe(validatedEvent.event_id);
      expect(mockSet).toHaveBeenCalledTimes(1);
      expect(mockSet).toHaveBeenCalledWith(validatedEvent);
    });

    it("should return idempotent success if event already exists", async () => {
      const validatedEvent = validateEventBeforeEnqueue(validUserEvent);

      mockGet.mockResolvedValue({
        exists: true,
        data: () => validatedEvent,
      });

      const result = await uploadEvent(mockFirestore, validatedEvent);

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
      expect(result.eventId).toBe(validatedEvent.event_id);
      expect(mockSet).not.toHaveBeenCalled();
    });

    it("should handle upload errors gracefully", async () => {
      const validatedEvent = validateEventBeforeEnqueue(validUserEvent);

      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      mockSet.mockRejectedValue(new Error("Network error"));

      const result = await uploadEvent(mockFirestore, validatedEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Network error");
      expect(result.idempotent).toBe(false);
    });

    it("should construct correct Firestore path", async () => {
      const validatedEvent = validateEventBeforeEnqueue(validUserEvent);

      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      await uploadEvent(mockFirestore, validatedEvent);

      expect(mockDoc).toHaveBeenCalledWith(
        `users/${validatedEvent.user_id}/libraries/${validatedEvent.library_id}/events/${validatedEvent.event_id}`
      );
    });
  });

  describe("uploadEventsBatch", () => {
    it("should upload multiple new events in a batch", async () => {
      const event1 = validateEventBeforeEnqueue({
        ...validUserEvent,
        event_id: "evt_001",
      });
      const event2 = validateEventBeforeEnqueue({
        ...validUserEvent,
        event_id: "evt_002",
      });

      mockGet
        .mockResolvedValueOnce({ exists: false, data: () => undefined })
        .mockResolvedValueOnce({ exists: false, data: () => undefined });

      const batchMock = {
        set: jest.fn(),
        commit: mockCommit,
      };
      mockBatch.mockReturnValue(batchMock);

      const results = await uploadEventsBatch(mockFirestore, [event1, event2]);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[0].idempotent).toBe(false);
      expect(results[1].idempotent).toBe(false);
      expect(batchMock.set).toHaveBeenCalledTimes(2);
      expect(mockCommit).toHaveBeenCalledTimes(1);
    });

    it("should handle idempotent events in batch", async () => {
      const event1 = validateEventBeforeEnqueue({
        ...validUserEvent,
        event_id: "evt_001",
      });
      const event2 = validateEventBeforeEnqueue({
        ...validUserEvent,
        event_id: "evt_002",
      });

      mockGet
        .mockResolvedValueOnce({ exists: true, data: () => event1 })
        .mockResolvedValueOnce({ exists: false, data: () => undefined });

      const batchMock = {
        set: jest.fn(),
        commit: mockCommit,
      };
      mockBatch.mockReturnValue(batchMock);

      const results = await uploadEventsBatch(mockFirestore, [event1, event2]);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[0].idempotent).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[1].idempotent).toBe(false);
      expect(batchMock.set).toHaveBeenCalledTimes(1); // Only event2 added to batch
      expect(mockCommit).toHaveBeenCalledTimes(1);
    });

    it("should not commit batch if all events are idempotent", async () => {
      const event1 = validateEventBeforeEnqueue({
        ...validUserEvent,
        event_id: "evt_001",
      });
      const event2 = validateEventBeforeEnqueue({
        ...validUserEvent,
        event_id: "evt_002",
      });

      mockGet
        .mockResolvedValueOnce({ exists: true, data: () => event1 })
        .mockResolvedValueOnce({ exists: true, data: () => event2 });

      const batchMock = {
        set: jest.fn(),
        commit: mockCommit,
      };
      mockBatch.mockReturnValue(batchMock);

      const results = await uploadEventsBatch(mockFirestore, [event1, event2]);

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.idempotent)).toBe(true);
      expect(batchMock.set).not.toHaveBeenCalled();
      expect(mockCommit).not.toHaveBeenCalled();
    });

    it("should handle errors for individual events in batch", async () => {
      const event1 = validateEventBeforeEnqueue({
        ...validUserEvent,
        event_id: "evt_001",
      });
      // Use invalid event ID format - will fail in getEventPathComponents
      const invalidEvent = {
        event_id: "invalid", // Invalid format (doesn't start with "evt_")
        type: "card_reviewed",
        user_id: "user_123",
        library_id: "lib_abc",
        // This will cause getEventPath to throw
      } as any;

      mockGet.mockResolvedValueOnce({ exists: false, data: () => undefined });

      const results = await uploadEventsBatch(mockFirestore, [event1, invalidEvent]);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBeDefined();
      expect(results[1].error).toContain("Invalid eventId format");
    });
  });

  describe("checkEventExists", () => {
    it("should return true if event exists", async () => {
      const validatedEvent = validateEventBeforeEnqueue(validUserEvent);

      mockGet.mockResolvedValue({
        exists: true,
        data: () => validatedEvent,
      });

      const exists = await checkEventExists(
        mockFirestore,
        validatedEvent.user_id,
        validatedEvent.library_id,
        validatedEvent.event_id
      );

      expect(exists).toBe(true);
    });

    it("should return false if event does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      const exists = await checkEventExists(mockFirestore, "user_123", "lib_abc", "evt_001");

      expect(exists).toBe(false);
    });
  });
});

