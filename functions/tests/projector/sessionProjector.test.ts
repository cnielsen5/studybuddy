/**
 * Session Projector Tests
 * 
 * Tests for session_started and session_ended event projection including:
 * - Projection to SessionView
 * - Projection to SessionSummary (on session_ended)
 * - Idempotency via last_applied cursor
 */

import {
  projectSessionStartedEvent,
  projectSessionEndedEvent,
} from "../../src/projector/sessionProjector";
import { Firestore } from "@google-cloud/firestore";
import { validUserEvent } from "../fixtures/userEvent.fixture.ts";
import { validSessionStartedEvent } from "../fixtures/sessionStarted.fixture.ts";
import { validSessionEndedEvent } from "../fixtures/sessionEnded.fixture.ts";

// Mock Firestore
jest.mock("@google-cloud/firestore");

describe("Session Projector", () => {
  let mockFirestore: jest.Mocked<Firestore>;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockSet: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGet = jest.fn();
    mockSet = jest.fn().mockResolvedValue(undefined);
    mockDoc = jest.fn(() => ({
      get: mockGet,
      set: mockSet,
    }));

    mockFirestore = {
      doc: mockDoc,
    } as any;
  });

  describe("projectSessionStartedEvent", () => {
    it("should successfully project new session_started event", async () => {
      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      const result = await projectSessionStartedEvent(mockFirestore, validSessionStartedEvent);

      expect(result.success).toBe(true);
      expect(result.viewUpdated).toBe(true);
      expect(result.idempotent).toBe(false);
      expect(result.sessionId).toBe(validSessionStartedEvent.entity.id);
      expect(mockSet).toHaveBeenCalledTimes(1);
    });

    it("should handle idempotent event", async () => {
      const existingView = {
        type: "session_view",
        session_id: "session_0001",
        last_applied: {
          received_at: validSessionStartedEvent.received_at,
          event_id: validSessionStartedEvent.event_id,
        },
      };

      mockGet.mockResolvedValue({
        exists: true,
        data: () => existingView,
      });

      const result = await projectSessionStartedEvent(mockFirestore, validSessionStartedEvent);

      expect(result.success).toBe(true);
      expect(result.idempotent).toBe(true);
      expect(result.viewUpdated).toBe(false);
    });

    it("should return error for invalid payload", async () => {
      const invalidEvent = {
        ...validSessionStartedEvent,
        payload: { planned_load: -1 }, // Invalid
      };

      const result = await projectSessionStartedEvent(mockFirestore, invalidEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid payload");
    });

    it("should create session view with correct fields", async () => {
      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      let capturedUpdate: any = null;
      mockSet.mockImplementation((data: any) => {
        capturedUpdate = data;
      });

      await projectSessionStartedEvent(mockFirestore, validSessionStartedEvent);

      expect(capturedUpdate).toBeDefined();
      expect(capturedUpdate.type).toBe("session_view");
      expect(capturedUpdate.session_id).toBe(validSessionStartedEvent.entity.id);
      expect(capturedUpdate.status).toBe("active");
      expect(capturedUpdate.planned_load).toBe(validSessionStartedEvent.payload.planned_load);
      expect(capturedUpdate.queue_size).toBe(validSessionStartedEvent.payload.queue_size);
    });
  });

  describe("projectSessionEndedEvent", () => {
    it("should successfully project session_ended event", async () => {
      const existingView = {
        type: "session_view",
        session_id: "session_0001",
        started_at: "2025-12-29T12:00:00.000Z",
        status: "active",
        last_applied: {
          received_at: "2025-01-01T00:00:00.000Z",
          event_id: "evt_old",
        },
      };

      mockDoc.mockImplementation((path: string) => {
        return {
          path,
          get: async () => {
            if (path.includes("session_summaries")) {
              return { exists: false, data: () => undefined };
            }
            // Session view
            return {
              exists: true,
              data: () => existingView,
            };
          },
          set: async (data: any) => {
            await mockSet(data);
          },
        };
      });

      const result = await projectSessionEndedEvent(mockFirestore, validSessionEndedEvent);

      expect(result.success).toBe(true);
      expect(result.viewUpdated).toBe(true);
      expect(result.sessionId).toBe(validSessionEndedEvent.entity.id);
      // Should update both session view and create summary
      expect(mockSet).toHaveBeenCalledTimes(2);
    });

    it("should update session view status to completed", async () => {
      const existingView = {
        type: "session_view",
        session_id: "session_0001",
        started_at: "2025-12-29T12:00:00.000Z",
        status: "active",
        last_applied: {
          received_at: "2025-01-01T00:00:00.000Z",
          event_id: "evt_old",
        },
      };

      let capturedViewUpdate: any = null;

      mockDoc.mockImplementation((path: string) => {
        return {
          path,
          get: async () => {
            if (path.includes("session_summaries")) {
              return { exists: false, data: () => undefined };
            }
            return { exists: true, data: () => existingView };
          },
          set: async (data: any) => {
            if (data.type === "session_view") {
              capturedViewUpdate = data;
            }
            await mockSet(data);
          },
        };
      });

      await projectSessionEndedEvent(mockFirestore, validSessionEndedEvent);

      expect(capturedViewUpdate).toBeDefined();
      expect(capturedViewUpdate).not.toBeNull();
      expect(capturedViewUpdate.status).toBe("completed");
      expect(capturedViewUpdate.ended_at).toBe(validSessionEndedEvent.occurred_at);
    });

    it("should create session summary", async () => {
      const existingView = {
        type: "session_view",
        session_id: "session_0001",
        started_at: "2025-12-29T12:00:00.000Z",
        status: "active",
        last_applied: {
          received_at: "2025-01-01T00:00:00.000Z",
          event_id: "evt_old",
        },
      };

      let capturedSummary: any = null;
      let capturedViewUpdate: any = null;

      mockDoc.mockImplementation((path: string) => {
        return {
          path,
          get: async () => {
            if (path.includes("session_summaries")) {
              return { exists: false, data: () => undefined };
            }
            return {
              exists: true,
              data: () => existingView,
            };
          },
          set: async (data: any) => {
            if (data.type === "session_summary") {
              capturedSummary = data;
            } else if (data.type === "session_view") {
              capturedViewUpdate = data;
            }
            await mockSet(data);
          },
        };
      });

      await projectSessionEndedEvent(mockFirestore, validSessionEndedEvent);

      expect(capturedSummary).toBeDefined();
      expect(capturedSummary).not.toBeNull();
      expect(capturedSummary.type).toBe("session_summary");
      expect(capturedSummary.session_id).toBe(validSessionEndedEvent.entity.id);
      expect(capturedSummary.ended_at).toBe(validSessionEndedEvent.occurred_at);
    });

    it("should return error for invalid payload", async () => {
      const invalidEvent = {
        ...validSessionEndedEvent,
        payload: { actual_load: -1 }, // Invalid
      };

      const result = await projectSessionEndedEvent(mockFirestore, invalidEvent);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Invalid payload");
    });
  });
});

