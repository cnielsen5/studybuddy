import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";
import { expectIdPrefix, ID_PREFIXES } from "../../helpers/ids.ts";
import {
  expectEventImmutability,
  expectNoPayloadAggregates
} from "../../helpers/invariantHelpers.ts";

const validContentFlaggedEvent = {
  ...validUserEvent,
  type: "content_flagged",
  entity: { kind: "card", id: "card_0001" },
  payload: {
    reason: "incorrect",
    comment: "The answer is wrong"
  }
};

describe("Event payload invariants — content_flagged", () => {
  it("must have entity.kind matching flagged content type", () => {
    expect(["card", "question", "relationship_card"]).toContain(validContentFlaggedEvent.entity.kind);
    
    if (validContentFlaggedEvent.entity.kind === "card") {
      expectIdPrefix(validContentFlaggedEvent.entity.id, ID_PREFIXES.CARD, "ContentFlaggedEvent.entity.id");
    } else if (validContentFlaggedEvent.entity.kind === "question") {
      expectIdPrefix(validContentFlaggedEvent.entity.id, ID_PREFIXES.QUESTION, "ContentFlaggedEvent.entity.id");
    }
  });

  it("must include reason with valid enum value", () => {
    const p: any = validContentFlaggedEvent.payload;

    expect(["incorrect", "confusing", "outdated", "poorly_worded"]).toContain(p.reason);

    if (p.comment !== undefined) {
      expect(typeof p.comment).toBe("string");
    }
  });

  it("must not include moderation state or resolution fields", () => {
    const p: any = validContentFlaggedEvent.payload;

    expect(p.status).toBeUndefined();
    expect(p.resolved).toBeUndefined();
    expect(p.resolved_by).toBeUndefined();
    expect(p.resolution).toBeUndefined();
  });

  it("must not contain mutation-indicating fields", () => {
    expectEventImmutability(validContentFlaggedEvent, "ContentFlaggedEvent");
  });

  it("must not contain aggregate fields in payload", () => {
    expectNoPayloadAggregates(validContentFlaggedEvent.payload, "ContentFlaggedEvent.payload");
  });
});

