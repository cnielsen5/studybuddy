import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";
import { expectIdPrefix, ID_PREFIXES } from "../../helpers/ids.ts";
import {
  expectEventImmutability,
  expectNoPayloadAggregates
} from "../../helpers/invariantHelpers.ts";

const validAccelerationAppliedEvent = {
  ...validUserEvent,
  type: "acceleration_applied",
  entity: { kind: "card", id: "card_0001" },
  payload: {
    original_stability: 45.5,
    new_stability: 56.875,
    next_due_days: 5,
    trigger: "correct_reasoning_in_probing"
  }
};

describe("Event payload invariants — acceleration_applied", () => {
  it("must have entity.kind === 'card'", () => {
    expect(validAccelerationAppliedEvent.entity.kind).toBe("card");
    expectIdPrefix(validAccelerationAppliedEvent.entity.id, ID_PREFIXES.CARD, "AccelerationAppliedEvent.entity.id");
  });

  it("must include stability changes and next due date", () => {
    const p: any = validAccelerationAppliedEvent.payload;

    expect(typeof p.original_stability).toBe("number");
    expect(p.original_stability).toBeGreaterThan(0);

    expect(typeof p.new_stability).toBe("number");
    expect(p.new_stability).toBeGreaterThan(0);
    expect(p.new_stability).toBeGreaterThanOrEqual(p.original_stability);

    expect(typeof p.next_due_days).toBe("number");
    expect(p.next_due_days).toBeGreaterThan(0);
    expect(p.next_due_days).toBeLessThanOrEqual(8);

    if (p.trigger !== undefined) {
      expect(typeof p.trigger).toBe("string");
    }
  });

  it("must not include full schedule state or performance metrics", () => {
    const p: any = validAccelerationAppliedEvent.payload;

    expect(p.due).toBeUndefined();
    expect(p.difficulty).toBeUndefined();
    expect(p.interval_days).toBeUndefined();
    expect(p.accuracy_rate).toBeUndefined();
    expect(p.total_attempts).toBeUndefined();
  });

  it("must not contain mutation-indicating fields", () => {
    expectEventImmutability(validAccelerationAppliedEvent, "AccelerationAppliedEvent");
  });

  it("must not contain aggregate fields in payload", () => {
    expectNoPayloadAggregates(validAccelerationAppliedEvent.payload, "AccelerationAppliedEvent.payload");
  });
});

