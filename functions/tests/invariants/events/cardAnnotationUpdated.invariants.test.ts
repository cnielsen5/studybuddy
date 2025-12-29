import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";
import { expectIdPrefix, ID_PREFIXES } from "../../helpers/ids.ts";
import {
  expectEventImmutability,
  expectNoPayloadAggregates
} from "../../helpers/invariantHelpers.ts";

const validCardAnnotationUpdatedEvent = {
  ...validUserEvent,
  type: "card_annotation_updated",
  entity: { kind: "card", id: "card_0001" },
  payload: {
    action: "added",
    tags: ["cram", "high-priority"],
    pinned: true
  }
};

describe("Event payload invariants — card_annotation_updated", () => {
  it("must have entity.kind === 'card'", () => {
    expect(validCardAnnotationUpdatedEvent.entity.kind).toBe("card");
    expectIdPrefix(validCardAnnotationUpdatedEvent.entity.id, ID_PREFIXES.CARD, "CardAnnotationUpdatedEvent.entity.id");
  });

  it("must include action with valid enum value", () => {
    const p: any = validCardAnnotationUpdatedEvent.payload;

    expect(["added", "removed", "updated"]).toContain(p.action);

    if (p.tags !== undefined) {
      expect(Array.isArray(p.tags)).toBe(true);
      for (const tag of p.tags) {
        expect(typeof tag).toBe("string");
      }
    }

    if (p.pinned !== undefined) {
      expect(typeof p.pinned).toBe("boolean");
    }
  });

  it("must not include card content or scheduling state", () => {
    const p: any = validCardAnnotationUpdatedEvent.payload;

    expect(p.front).toBeUndefined();
    expect(p.back).toBeUndefined();
    expect(p.content).toBeUndefined();
    expect(p.due).toBeUndefined();
    expect(p.stability).toBeUndefined();
  });

  it("must not contain mutation-indicating fields", () => {
    expectEventImmutability(validCardAnnotationUpdatedEvent, "CardAnnotationUpdatedEvent");
  });

  it("must not contain aggregate fields in payload", () => {
    expectNoPayloadAggregates(validCardAnnotationUpdatedEvent.payload, "CardAnnotationUpdatedEvent.payload");
  });
});

