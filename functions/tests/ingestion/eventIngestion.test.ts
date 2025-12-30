/**
 * Event Ingestion Tests
 * 
 * Tests for event ingestion including:
 * - Single event ingestion
 * - Batch ingestion
 * - Idempotency handling
 * - Validation error handling
 */

import { ingestEvent, ingestEventsBatch, checkEventExists } from "../../src/ingestion/eventIngestion";
import { Firestore } from "@google-cloud/firestore";
import { validUserEvent } from "../fixtures/userEvent.fixture.ts";
import { validCardReviewedEvent } from "../fixtures/cardReviewed.fixture.ts";
import { z } from "zod";

// Mock Firestore
jest.mock("@google-cloud/firestore");

describe("Event Ingestion", () => {
  let mockFirestore: jest.Mocked<Firestore>;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;
  let mockBatch: jest.Mock;
  let mockCommit: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup Firestore mocks
    mockGet = jest.fn();
    mockSet = jest.fn();
    mockCommit = jest.fn();
    mockDoc = jest.fn(() => ({
      get: mockGet,
      set: mockSet,
    }));
    mockBatch = jest.fn(() => ({
      set: jest.fn(),
      commit: mockCommit,
    }));

    mockFirestore = {
      doc: mockDoc,
      batch: mockBatch,
    } as any;
  });

  describe("ingestEvent", () => {
    it("should successfully ingest a new event", async () => {
      // Mock: document doesn't exist
      mockGet.mockResolvedValue({ exists: false });

      const result = await ingestEvent(mockFirestore, validUserEvent);

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(false);
      expect(result.eventId).toBe(validUserEvent.event_id);
      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    it("should handle idempotent event (already exists)", async () => {
      // Mock: document already exists
      mockGet.mockResolvedValue({ exists: true });

      const result = await ingestEvent(mockFirestore, validUserEvent);

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
      expect(result.eventId).toBe(validUserEvent.event_id);
      expect(mockSet).not.toHaveBeenCalled();
    });

    it("should return error for invalid event", async () => {
      const invalidEvent = { ...validUserEvent, event_id: "invalid" };

      const result = await ingestEvent(mockFirestore, invalidEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation failed");
      expect(mockSet).not.toHaveBeenCalled();
    });

    it("should return error for missing required fields", async () => {
      const invalidEvent = { ...validUserEvent };
      delete (invalidEvent as any).user_id;

      const result = await ingestEvent(mockFirestore, invalidEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation failed");
    });

    it("should handle Firestore errors", async () => {
      mockGet.mockRejectedValue(new Error("Firestore error"));

      const result = await ingestEvent(mockFirestore, validUserEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Firestore error");
    });
  });

  describe("ingestEventsBatch", () => {
    it("should successfully ingest multiple new events", async () => {
      const events = [validUserEvent, validCardReviewedEvent];

      // Mock: documents don't exist
      mockGet.mockResolvedValue({ exists: false });

      const results = await ingestEventsBatch(mockFirestore, events);

      expect(results).toHaveLength(2);
      expect(results.every((r) => r.success)).toBe(true);
      expect(results.every((r) => !r.idempotent)).toBe(true);
      expect(mockCommit).toHaveBeenCalledTimes(1);
    });

    it("should handle mix of new and existing events", async () => {
      const events = [validUserEvent, validCardReviewedEvent];

      // Mock: first exists, second doesn't
      mockGet
        .mockResolvedValueOnce({ exists: true })
        .mockResolvedValueOnce({ exists: false });

      const results = await ingestEventsBatch(mockFirestore, events);

      expect(results).toHaveLength(2);
      expect(results[0].idempotent).toBe(true);
      expect(results[1].idempotent).toBe(false);
    });

    it("should handle validation errors in batch", async () => {
      const events = [validUserEvent, { ...validCardReviewedEvent, event_id: "invalid" }];

      mockGet.mockResolvedValue({ exists: false });

      const results = await ingestEventsBatch(mockFirestore, events);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
    });
  });

  describe("checkEventExists", () => {
    it("should return exists: true when event exists", async () => {
      mockGet.mockResolvedValue({ exists: true });

      const result = await checkEventExists(
        mockFirestore,
        "user_123",
        "lib_abc",
        "evt_001"
      );

      expect(result.exists).toBe(true);
      expect(result.alreadyProcessed).toBe(true);
    });

    it("should return exists: false when event doesn't exist", async () => {
      mockGet.mockResolvedValue({ exists: false });

      const result = await checkEventExists(
        mockFirestore,
        "user_123",
        "lib_abc",
        "evt_001"
      );

      expect(result.exists).toBe(false);
      expect(result.alreadyProcessed).toBe(false);
    });
  });
});

