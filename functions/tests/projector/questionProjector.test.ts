/**
 * Question Projector Tests
 * 
 * Tests for question_attempted event projection including:
 * - Projection to QuestionPerformanceView
 * - Idempotency via last_applied cursor
 */

import { projectQuestionAttemptedEvent } from "../../src/projector/questionProjector";
import { Firestore } from "@google-cloud/firestore";
import { validUserEvent } from "../fixtures/userEvent.fixture.ts";

// Mock Firestore
jest.mock("@google-cloud/firestore");

// Create valid question_attempted event (matches fixture pattern)
const validQuestionAttemptedEvent = {
  ...validUserEvent,
  type: "question_attempted",
  entity: { kind: "question", id: "q_0001" },
  payload: {
    selected_option_id: "opt_B",
    correct: true,
    seconds_spent: 35,
  },
} as const;

describe("Question Projector", () => {
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

  describe("projectQuestionAttemptedEvent", () => {
    it("should successfully project new event to performance view", async () => {
      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      const result = await projectQuestionAttemptedEvent(mockFirestore, validQuestionAttemptedEvent);

      expect(result.success).toBe(true);
      expect(result.performanceViewUpdated).toBe(true);
      expect(result.idempotent).toBe(false);
      expect(result.questionId).toBe(validQuestionAttemptedEvent.entity.id);
      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    it("should handle idempotent event (already processed)", async () => {
      const existingView = {
        type: "question_performance_view",
        question_id: "q_0001",
        last_applied: {
          received_at: validQuestionAttemptedEvent.received_at,
          event_id: validQuestionAttemptedEvent.event_id,
        },
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => existingView,
      });

      const result = await projectQuestionAttemptedEvent(mockFirestore, validQuestionAttemptedEvent);

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
      expect(result.performanceViewUpdated).toBe(false);
      expect(mockSet).not.toHaveBeenCalled();
    });

    it("should handle out-of-order events (older than last_applied)", async () => {
      const existingView = {
        type: "question_performance_view",
        question_id: "q_0001",
        last_applied: {
          received_at: new Date(Date.now() + 10000).toISOString(), // Future timestamp
          event_id: "evt_newer_event",
        },
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => existingView,
      });

      const result = await projectQuestionAttemptedEvent(mockFirestore, validQuestionAttemptedEvent);

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
    });

    it("should return error for invalid payload", async () => {
      const invalidEvent = {
        ...validQuestionAttemptedEvent,
        payload: { selected_option_id: "invalid", correct: true, seconds_spent: 35 },
      };

      const result = await projectQuestionAttemptedEvent(mockFirestore, invalidEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid payload");
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should return error for wrong entity kind", async () => {
      const wrongEvent = {
        ...validQuestionAttemptedEvent,
        entity: { kind: "card", id: "card_0001" },
      };

      const result = await projectQuestionAttemptedEvent(mockFirestore, wrongEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Expected entity.kind to be "question"');
    });

    it("should update performance view with correct metrics", async () => {
      let capturedUpdate: any = null;

      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      mockSet.mockImplementation((data: any) => {
        capturedUpdate = data;
      });

      await projectQuestionAttemptedEvent(mockFirestore, validQuestionAttemptedEvent);

      expect(capturedUpdate).toBeDefined();
      expect(capturedUpdate.type).toBe("question_performance_view");
      expect(capturedUpdate.question_id).toBe(validQuestionAttemptedEvent.entity.id);
      expect(capturedUpdate.total_attempts).toBe(1);
      expect(capturedUpdate.correct_attempts).toBe(1);
      expect(capturedUpdate.accuracy_rate).toBe(1.0);
      expect(capturedUpdate.last_applied.event_id).toBe(validQuestionAttemptedEvent.event_id);
    });

    it("should correctly calculate accuracy for incorrect attempts", async () => {
      const incorrectEvent = {
        ...validQuestionAttemptedEvent,
        payload: {
          selected_option_id: "opt_A",
          correct: false,
          seconds_spent: 20,
        },
      };

      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      let capturedUpdate: any = null;
      mockSet.mockImplementation((data: any) => {
        capturedUpdate = data;
      });

      await projectQuestionAttemptedEvent(mockFirestore, incorrectEvent);

      expect(capturedUpdate.total_attempts).toBe(1);
      expect(capturedUpdate.correct_attempts).toBe(0);
      expect(capturedUpdate.accuracy_rate).toBe(0.0);
    });
  });
});

