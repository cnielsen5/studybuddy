/**
 * Event Ingestion Integration Tests
 * 
 * End-to-end tests for the complete event ingestion flow:
 * - Client validation → Server ingestion → Idempotency
 * - Error handling across layers
 * - Path construction and validation
 */

import { validateEventBeforeEnqueue } from "../../src/client/eventClient";
import { ingestEvent } from "../../src/ingestion/eventIngestion";
import { readAndValidateEvent } from "../../src/projector/eventProjector";
import { Firestore } from "@google-cloud/firestore";
import { validUserEvent } from "../fixtures/userEvent.fixture.ts";
import { validCardReviewedEvent } from "../fixtures/cardReviewed.fixture.ts";

// Mock Firestore
jest.mock("@google-cloud/firestore");

describe("Event Ingestion Integration", () => {
  let mockFirestore: jest.Mocked<Firestore>;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGet = jest.fn();
    mockSet = jest.fn();
    mockDoc = jest.fn(() => ({
      get: mockGet,
      set: mockSet,
    }));

    mockFirestore = {
      doc: mockDoc,
    } as any;
  });

  describe("Complete ingestion flow", () => {
    it("should handle complete flow: client validation → server ingestion", async () => {
      // 1. Client-side validation
      const validatedEvent = validateEventBeforeEnqueue(validUserEvent);
      expect(validatedEvent.event_id).toBe(validUserEvent.event_id);

      // 2. Server-side ingestion
      mockGet.mockResolvedValue({ exists: false });
      const result = await ingestEvent(mockFirestore, validatedEvent);

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(false);
      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    it("should handle idempotent retry flow", async () => {
      // First ingestion
      mockGet.mockResolvedValueOnce({ exists: false });
      const firstResult = await ingestEvent(mockFirestore, validUserEvent);
      expect(firstResult.success).toBe(true);
      expect(firstResult.idempotent).toBe(false);

      // Retry (idempotent)
      mockGet.mockResolvedValueOnce({ exists: true });
      const retryResult = await ingestEvent(mockFirestore, validUserEvent);
      expect(retryResult.success).toBe(true);
      expect(retryResult.idempotent).toBe(true);
    });

    it("should handle validation failure on client", () => {
      const invalidEvent = { ...validUserEvent, event_id: "invalid" };
      expect(() => validateEventBeforeEnqueue(invalidEvent)).toThrow();
    });

    it("should handle validation failure on server", async () => {
      const invalidEvent = { ...validUserEvent, event_id: "invalid" };
      const result = await ingestEvent(mockFirestore, invalidEvent);
      expect(result.success).toBe(false);
      expect(result.error).toContain("Validation failed");
    });
  });

  describe("Projection flow", () => {
    it("should read and validate ingested event for projection", async () => {
      // 1. Ingest event
      mockGet.mockResolvedValueOnce({ exists: false });
      const ingestResult = await ingestEvent(mockFirestore, validUserEvent);
      expect(ingestResult.success).toBe(true);

      // 2. Read and validate for projection
      mockGet.mockResolvedValueOnce({
        exists: true,
        data: () => validUserEvent,
      });

      const projectionResult = await readAndValidateEvent(
        mockFirestore,
        validUserEvent.user_id,
        validUserEvent.library_id,
        validUserEvent.event_id
      );

      expect(projectionResult.success).toBe(true);
      if (projectionResult.success) {
        expect(projectionResult.event.event_id).toBe(validUserEvent.event_id);
      }
    });
  });

  describe("Path consistency", () => {
    it("should use consistent paths across client and server", async () => {
      const event = validCardReviewedEvent;

      // Client prepares path
      const { prepareEventForEnqueue } = require("../../src/client/eventClient");
      const clientPrep = prepareEventForEnqueue(event);
      const clientPath = clientPrep.path;

      // Server constructs same path
      mockGet.mockResolvedValue({ exists: false });
      const serverResult = await ingestEvent(mockFirestore, event);

      // Verify path was used
      expect(mockDoc).toHaveBeenCalledWith(clientPath);
      expect(serverResult.path).toBe(clientPath);
    });
  });

  describe("Error propagation", () => {
    it("should propagate validation errors correctly", () => {
      const invalidEvent = { ...validUserEvent };
      delete (invalidEvent as any).user_id;

      // Client should catch it
      expect(() => validateEventBeforeEnqueue(invalidEvent)).toThrow();

      // Server should also catch it
      return ingestEvent(mockFirestore, invalidEvent).then((result) => {
        expect(result.success).toBe(false);
        expect(result.error).toContain("Validation failed");
      });
    });
  });
});

