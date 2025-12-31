/**
 * View Client Tests
 * 
 * Tests for client-side view reading functionality including:
 * - Reading single views
 * - Querying due cards
 * - Batch reading multiple views
 */

import {
  getCardScheduleView,
  getCardPerformanceView,
  getDueCards,
  getCardScheduleViews,
  getCardPerformanceViews,
  CardScheduleView,
  CardPerformanceView,
} from "../../src/client/viewClient";
import { Firestore } from "@google-cloud/firestore";

// Mock Firestore
jest.mock("@google-cloud/firestore");

describe("View Client", () => {
  let mockFirestore: jest.Mocked<Firestore>;
  let mockDoc: jest.Mock;
  let mockGet: jest.Mock;
  let mockGetAll: jest.Mock;
  let mockCollection: jest.Mock;
  let mockWhere: jest.Mock;
  let mockOrderBy: jest.Mock;
  let mockLimit: jest.Mock;
  let mockQueryGet: jest.Mock;

  const validCardScheduleView: CardScheduleView = {
    type: "card_schedule_view",
    card_id: "card_0001",
    library_id: "lib_abc",
    user_id: "user_123",
    state: 2,
    due_at: "2025-12-30T09:00:00.000Z",
    stability: 3.2,
    difficulty: 5.1,
    interval_days: 3,
    last_reviewed_at: "2025-12-29T12:34:56.000Z",
    last_grade: "good",
    last_applied: {
      received_at: "2025-12-29T12:34:57.000Z",
      event_id: "evt_01JHXYZ...",
    },
    updated_at: "2025-12-29T12:34:57.000Z",
  };

  const validCardPerformanceView: CardPerformanceView = {
    type: "card_performance_view",
    card_id: "card_0001",
    library_id: "lib_abc",
    user_id: "user_123",
    total_reviews: 10,
    correct_reviews: 8,
    accuracy_rate: 0.8,
    avg_seconds: 15.5,
    streak: 3,
    max_streak: 5,
    last_reviewed_at: "2025-12-29T12:34:56.000Z",
    last_applied: {
      received_at: "2025-12-29T12:34:57.000Z",
      event_id: "evt_01JHXYZ...",
    },
    updated_at: "2025-12-29T12:34:57.000Z",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockGet = jest.fn();
    mockGetAll = jest.fn();
    mockQueryGet = jest.fn();

    mockLimit = jest.fn().mockReturnValue({
      get: mockQueryGet,
    });

    mockOrderBy = jest.fn().mockReturnValue({
      limit: mockLimit,
    });

    mockWhere = jest.fn().mockReturnValue({
      orderBy: mockOrderBy,
    });

    mockCollection = jest.fn().mockReturnValue({
      where: mockWhere,
    });

    mockDoc = jest.fn((path: string) => ({
      path,
      get: mockGet,
    }));

    mockFirestore = {
      doc: mockDoc,
      collection: mockCollection,
      getAll: mockGetAll,
    } as any;
  });

  describe("getCardScheduleView", () => {
    it("should return card schedule view if it exists", async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => validCardScheduleView,
      });

      const result = await getCardScheduleView(mockFirestore, "user_123", "lib_abc", "card_0001");

      expect(result).toEqual(validCardScheduleView);
      expect(mockDoc).toHaveBeenCalledWith(
        "users/user_123/libraries/lib_abc/views/card_schedule/card_0001"
      );
    });

    it("should return null if view does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      const result = await getCardScheduleView(mockFirestore, "user_123", "lib_abc", "card_0001");

      expect(result).toBeNull();
    });
  });

  describe("getCardPerformanceView", () => {
    it("should return card performance view if it exists", async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => validCardPerformanceView,
      });

      const result = await getCardPerformanceView(mockFirestore, "user_123", "lib_abc", "card_0001");

      expect(result).toEqual(validCardPerformanceView);
      expect(mockDoc).toHaveBeenCalledWith(
        "users/user_123/libraries/lib_abc/views/card_perf/card_0001"
      );
    });

    it("should return null if view does not exist", async () => {
      mockGet.mockResolvedValue({
        exists: false,
        data: () => undefined,
      });

      const result = await getCardPerformanceView(mockFirestore, "user_123", "lib_abc", "card_0001");

      expect(result).toBeNull();
    });
  });

  describe("getDueCards", () => {
    it("should return due cards ordered by due_at", async () => {
      const now = new Date().toISOString();
      const dueCard1 = { ...validCardScheduleView, card_id: "card_0001", due_at: now };
      const dueCard2 = { ...validCardScheduleView, card_id: "card_0002", due_at: now };

      mockQueryGet.mockResolvedValue({
        docs: [
          { data: () => dueCard1 },
          { data: () => dueCard2 },
        ],
      });

      const result = await getDueCards(mockFirestore, "user_123", "lib_abc", 50);

      expect(result).toHaveLength(2);
      expect(result[0].card_id).toBe("card_0001");
      expect(result[1].card_id).toBe("card_0002");
      expect(mockCollection).toHaveBeenCalledWith(
        "users/user_123/libraries/lib_abc/views/card_schedule"
      );
      expect(mockWhere).toHaveBeenCalledWith("due_at", "<=", expect.any(String));
      expect(mockOrderBy).toHaveBeenCalledWith("due_at", "asc");
      expect(mockLimit).toHaveBeenCalledWith(50);
    });

    it("should return empty array if no cards are due", async () => {
      mockQueryGet.mockResolvedValue({
        docs: [],
      });

      const result = await getDueCards(mockFirestore, "user_123", "lib_abc", 50);

      expect(result).toEqual([]);
    });

    it("should use default limit of 50 if not specified", async () => {
      mockQueryGet.mockResolvedValue({
        docs: [],
      });

      await getDueCards(mockFirestore, "user_123", "lib_abc");

      expect(mockLimit).toHaveBeenCalledWith(50);
    });
  });

  describe("getCardScheduleViews", () => {
    it("should return multiple card schedule views", async () => {
      const view1 = { ...validCardScheduleView, card_id: "card_0001" };
      const view2 = { ...validCardScheduleView, card_id: "card_0002" };

      mockGetAll.mockResolvedValue([
        { exists: true, data: () => view1 },
        { exists: true, data: () => view2 },
      ]);

      const result = await getCardScheduleViews(mockFirestore, "user_123", "lib_abc", [
        "card_0001",
        "card_0002",
      ]);

      expect(result.size).toBe(2);
      expect(result.get("card_0001")).toEqual(view1);
      expect(result.get("card_0002")).toEqual(view2);
    });

    it("should handle batches larger than 10", async () => {
      const cardIds = Array.from({ length: 25 }, (_, i) => `card_${String(i).padStart(4, "0")}`);
      const views = cardIds.map((cardId) => ({
        ...validCardScheduleView,
        card_id: cardId,
      }));

      // Mock getAll to return views in batches
      mockGetAll
        .mockResolvedValueOnce(
          views.slice(0, 10).map((v) => ({ exists: true, data: () => v }))
        )
        .mockResolvedValueOnce(
          views.slice(10, 20).map((v) => ({ exists: true, data: () => v }))
        )
        .mockResolvedValueOnce(
          views.slice(20, 25).map((v) => ({ exists: true, data: () => v }))
        );

      const result = await getCardScheduleViews(mockFirestore, "user_123", "lib_abc", cardIds);

      expect(result.size).toBe(25);
      expect(mockGetAll).toHaveBeenCalledTimes(3); // 3 batches: 10 + 10 + 5
    });

    it("should skip views that do not exist", async () => {
      mockGetAll.mockResolvedValue([
        { exists: true, data: () => validCardScheduleView },
        { exists: false, data: () => undefined },
      ]);

      const result = await getCardScheduleViews(mockFirestore, "user_123", "lib_abc", [
        "card_0001",
        "card_0002",
      ]);

      expect(result.size).toBe(1);
      expect(result.get("card_0001")).toBeDefined();
      expect(result.get("card_0002")).toBeUndefined();
    });
  });

  describe("getCardPerformanceViews", () => {
    it("should return multiple card performance views", async () => {
      const view1 = { ...validCardPerformanceView, card_id: "card_0001" };
      const view2 = { ...validCardPerformanceView, card_id: "card_0002" };

      mockGetAll.mockResolvedValue([
        { exists: true, data: () => view1 },
        { exists: true, data: () => view2 },
      ]);

      const result = await getCardPerformanceViews(mockFirestore, "user_123", "lib_abc", [
        "card_0001",
        "card_0002",
      ]);

      expect(result.size).toBe(2);
      expect(result.get("card_0001")).toEqual(view1);
      expect(result.get("card_0002")).toEqual(view2);
    });
  });
});

