/**
 * Local Event Queue Tests
 * 
 * Tests for local event queue functionality including:
 * - Enqueueing events
 * - Getting pending events
 * - Acknowledging events
 * - Removing events
 * - Attempt counting
 */

import { MemoryEventQueue, QueuedEvent } from "../../../src/client/sync/localEventQueue";
import { validCardReviewedEvent } from "../../fixtures/cardReviewed.fixture.ts";

describe("Local Event Queue", () => {
  let queue: MemoryEventQueue;

  beforeEach(() => {
    queue = new MemoryEventQueue();
  });

  describe("enqueue", () => {
    it("should add event to queue", async () => {
      await queue.enqueue(validCardReviewedEvent);

      const pending = await queue.getPendingEvents();
      expect(pending).toHaveLength(1);
      expect(pending[0].event.event_id).toBe(validCardReviewedEvent.event_id);
      expect(pending[0].acknowledged).toBe(false);
      expect(pending[0].attempts).toBe(0);
    });

    it("should queue multiple events", async () => {
      const event1 = { ...validCardReviewedEvent, event_id: "evt_001" };
      const event2 = { ...validCardReviewedEvent, event_id: "evt_002" };
      const event3 = { ...validCardReviewedEvent, event_id: "evt_003" };

      await queue.enqueue(event1);
      await queue.enqueue(event2);
      await queue.enqueue(event3);

      const pending = await queue.getPendingEvents();
      expect(pending).toHaveLength(3);
    });

    it("should set queuedAt timestamp", async () => {
      const before = new Date().toISOString();
      await queue.enqueue(validCardReviewedEvent);
      const after = new Date().toISOString();

      const pending = await queue.getPendingEvents();
      expect(pending[0].queuedAt).toBeDefined();
      expect(pending[0].queuedAt >= before).toBe(true);
      expect(pending[0].queuedAt <= after).toBe(true);
    });
  });

  describe("getPendingEvents", () => {
    it("should return only unacknowledged events", async () => {
      const event1 = { ...validCardReviewedEvent, event_id: "evt_001" };
      const event2 = { ...validCardReviewedEvent, event_id: "evt_002" };

      await queue.enqueue(event1);
      await queue.enqueue(event2);

      await queue.acknowledge("evt_001");

      const pending = await queue.getPendingEvents();
      expect(pending).toHaveLength(1);
      expect(pending[0].event.event_id).toBe("evt_002");
    });

    it("should return empty array when no pending events", async () => {
      const pending = await queue.getPendingEvents();
      expect(pending).toEqual([]);
    });
  });

  describe("acknowledge", () => {
    it("should mark event as acknowledged", async () => {
      await queue.enqueue(validCardReviewedEvent);

      await queue.acknowledge(validCardReviewedEvent.event_id);

      const pending = await queue.getPendingEvents();
      expect(pending).toHaveLength(0);
    });

    it("should not affect other events", async () => {
      const event1 = { ...validCardReviewedEvent, event_id: "evt_001" };
      const event2 = { ...validCardReviewedEvent, event_id: "evt_002" };

      await queue.enqueue(event1);
      await queue.enqueue(event2);

      await queue.acknowledge("evt_001");

      const pending = await queue.getPendingEvents();
      expect(pending).toHaveLength(1);
      expect(pending[0].event.event_id).toBe("evt_002");
    });

    it("should handle acknowledging non-existent event gracefully", async () => {
      await expect(queue.acknowledge("nonexistent")).resolves.not.toThrow();
    });
  });

  describe("remove", () => {
    it("should remove event from queue", async () => {
      await queue.enqueue(validCardReviewedEvent);

      await queue.remove(validCardReviewedEvent.event_id);

      const pending = await queue.getPendingEvents();
      expect(pending).toHaveLength(0);
    });

    it("should remove acknowledged events", async () => {
      await queue.enqueue(validCardReviewedEvent);
      await queue.acknowledge(validCardReviewedEvent.event_id);

      await queue.remove(validCardReviewedEvent.event_id);

      const pending = await queue.getPendingEvents();
      expect(pending).toHaveLength(0);
    });
  });

  describe("getPendingCount", () => {
    it("should return correct count of pending events", async () => {
      expect(await queue.getPendingCount()).toBe(0);

      await queue.enqueue(validCardReviewedEvent);
      expect(await queue.getPendingCount()).toBe(1);

      const event2 = { ...validCardReviewedEvent, event_id: "evt_002" };
      await queue.enqueue(event2);
      expect(await queue.getPendingCount()).toBe(2);

      await queue.acknowledge("evt_002");
      expect(await queue.getPendingCount()).toBe(1);
    });
  });

  describe("clearAcknowledged", () => {
    it("should remove all acknowledged events", async () => {
      const event1 = { ...validCardReviewedEvent, event_id: "evt_001" };
      const event2 = { ...validCardReviewedEvent, event_id: "evt_002" };
      const event3 = { ...validCardReviewedEvent, event_id: "evt_003" };

      await queue.enqueue(event1);
      await queue.enqueue(event2);
      await queue.enqueue(event3);

      await queue.acknowledge("evt_001");
      await queue.acknowledge("evt_003");

      await queue.clearAcknowledged();

      const pending = await queue.getPendingEvents();
      expect(pending).toHaveLength(1);
      expect(pending[0].event.event_id).toBe("evt_002");
    });
  });

  describe("incrementAttempt", () => {
    it("should increment attempt count", async () => {
      await queue.enqueue(validCardReviewedEvent);

      await queue.incrementAttempt(validCardReviewedEvent.event_id);
      await queue.incrementAttempt(validCardReviewedEvent.event_id);

      const pending = await queue.getPendingEvents();
      expect(pending[0].attempts).toBe(2);
      expect(pending[0].lastAttemptAt).toBeDefined();
    });

    it("should update lastAttemptAt timestamp", async () => {
      await queue.enqueue(validCardReviewedEvent);

      const before = new Date().toISOString();
      await queue.incrementAttempt(validCardReviewedEvent.event_id);
      const after = new Date().toISOString();

      const pending = await queue.getPendingEvents();
      expect(pending[0].lastAttemptAt).toBeDefined();
      expect(pending[0].lastAttemptAt! >= before).toBe(true);
      expect(pending[0].lastAttemptAt! <= after).toBe(true);
    });
  });
});

