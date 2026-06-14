import {
  buildViewDocId,
  getCardScheduleViewPath,
  getViewsCollectionPath,
  getViewPath,
} from "../../src/viewPaths";

describe("viewPaths", () => {
  it("builds 6-segment document paths for views", () => {
    const path = getCardScheduleViewPath("user_123", "lib_abc", "card_0001");
    expect(path).toBe("users/user_123/libraries/lib_abc/views/card_schedule__card_0001");
    expect(path.split("/")).toHaveLength(6);
  });

  it("builds view doc ids with type and entity separator", () => {
    expect(buildViewDocId("card_perf", "card_0001")).toBe("card_perf__card_0001");
  });

  it("returns views collection path", () => {
    expect(getViewsCollectionPath("user_123", "lib_abc")).toBe(
      "users/user_123/libraries/lib_abc/views"
    );
  });

  it("supports all view types", () => {
    expect(getViewPath("user_1", "lib_1", "session", "session_1")).toBe(
      "users/user_1/libraries/lib_1/views/session__session_1"
    );
  });
});
