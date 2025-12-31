/**
 * Sync Cursor Tests
 * 
 * Tests for sync cursor functionality including:
 * - Getting and updating cursors
 * - Per-library cursor isolation
 * - Cursor clearing
 */

import { MemoryCursorStore, SyncCursor } from "../../../src/client/sync/syncCursor";

describe("Sync Cursor", () => {
  let cursorStore: MemoryCursorStore;

  beforeEach(() => {
    cursorStore = new MemoryCursorStore();
  });

  describe("getCursor", () => {
    it("should return null for non-existent cursor", async () => {
      const cursor = await cursorStore.getCursor("lib_abc");
      expect(cursor).toBeNull();
    });

    it("should return cursor after update", async () => {
      await cursorStore.updateCursor("lib_abc", "2025-01-01T00:00:00.000Z", "evt_001");

      const cursor = await cursorStore.getCursor("lib_abc");
      expect(cursor).not.toBeNull();
      expect(cursor?.library_id).toBe("lib_abc");
      expect(cursor?.last_received_at).toBe("2025-01-01T00:00:00.000Z");
      expect(cursor?.last_event_id).toBe("evt_001");
    });
  });

  describe("updateCursor", () => {
    it("should create new cursor", async () => {
      await cursorStore.updateCursor("lib_abc", "2025-01-01T00:00:00.000Z", "evt_001");

      const cursor = await cursorStore.getCursor("lib_abc");
      expect(cursor).not.toBeNull();
      expect(cursor?.last_received_at).toBe("2025-01-01T00:00:00.000Z");
      expect(cursor?.last_event_id).toBe("evt_001");
    });

    it("should update existing cursor", async () => {
      await cursorStore.updateCursor("lib_abc", "2025-01-01T00:00:00.000Z", "evt_001");
      await cursorStore.updateCursor("lib_abc", "2025-01-02T00:00:00.000Z", "evt_002");

      const cursor = await cursorStore.getCursor("lib_abc");
      expect(cursor?.last_received_at).toBe("2025-01-02T00:00:00.000Z");
      expect(cursor?.last_event_id).toBe("evt_002");
    });

    it("should set synced_at timestamp", async () => {
      const before = new Date().toISOString();
      await cursorStore.updateCursor("lib_abc", "2025-01-01T00:00:00.000Z", "evt_001");
      const after = new Date().toISOString();

      const cursor = await cursorStore.getCursor("lib_abc");
      expect(cursor?.synced_at).toBeDefined();
      expect(cursor?.synced_at >= before).toBe(true);
      expect(cursor?.synced_at <= after).toBe(true);
    });
  });

  describe("getAllCursors", () => {
    it("should return all cursors", async () => {
      await cursorStore.updateCursor("lib_abc", "2025-01-01T00:00:00.000Z", "evt_001");
      await cursorStore.updateCursor("lib_xyz", "2025-01-02T00:00:00.000Z", "evt_002");

      const cursors = await cursorStore.getAllCursors();
      expect(cursors).toHaveLength(2);
      expect(cursors.find((c) => c.library_id === "lib_abc")).toBeDefined();
      expect(cursors.find((c) => c.library_id === "lib_xyz")).toBeDefined();
    });

    it("should return empty array when no cursors", async () => {
      const cursors = await cursorStore.getAllCursors();
      expect(cursors).toEqual([]);
    });
  });

  describe("clearCursor", () => {
    it("should remove cursor", async () => {
      await cursorStore.updateCursor("lib_abc", "2025-01-01T00:00:00.000Z", "evt_001");

      await cursorStore.clearCursor("lib_abc");

      const cursor = await cursorStore.getCursor("lib_abc");
      expect(cursor).toBeNull();
    });

    it("should not affect other cursors", async () => {
      await cursorStore.updateCursor("lib_abc", "2025-01-01T00:00:00.000Z", "evt_001");
      await cursorStore.updateCursor("lib_xyz", "2025-01-02T00:00:00.000Z", "evt_002");

      await cursorStore.clearCursor("lib_abc");

      const cursorAbc = await cursorStore.getCursor("lib_abc");
      const cursorXyz = await cursorStore.getCursor("lib_xyz");

      expect(cursorAbc).toBeNull();
      expect(cursorXyz).not.toBeNull();
    });
  });

  describe("per-library isolation", () => {
    it("should maintain separate cursors per library", async () => {
      await cursorStore.updateCursor("lib_abc", "2025-01-01T00:00:00.000Z", "evt_001");
      await cursorStore.updateCursor("lib_xyz", "2025-01-02T00:00:00.000Z", "evt_002");

      const cursorAbc = await cursorStore.getCursor("lib_abc");
      const cursorXyz = await cursorStore.getCursor("lib_xyz");

      expect(cursorAbc?.last_received_at).toBe("2025-01-01T00:00:00.000Z");
      expect(cursorXyz?.last_received_at).toBe("2025-01-02T00:00:00.000Z");
    });
  });
});

