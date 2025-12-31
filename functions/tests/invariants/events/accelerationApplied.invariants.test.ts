import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";
import { expectIdPrefix, ID_PREFIXES } from "../../helpers/ids.ts";
import {
  expectEventImmutability,
  expectNoPayloadAggregates
} from "../../helpers/invariantHelpers.ts";
import { validAccelerationAppliedEvent } from "../../fixtures/accelerationApplied.fixture.ts";

describe("Event payload invariants — acceleration_applied", () => {
  it("must have entity.kind === 'card'", () => {
    expect(validAccelerationAppliedEvent.entity.kind).toBe("card");
    expectIdPrefix(validAccelerationAppliedEvent.entity.id, ID_PREFIXES.CARD, "AccelerationAppliedEvent.entity.id");
  });

  it("must include acceleration_factor and trigger", () => {
    const p: any = validAccelerationAppliedEvent.payload;

    expect(typeof p.acceleration_factor).toBe("number");
    expect(p.acceleration_factor).toBeGreaterThanOrEqual(1.0);
    expect(typeof p.trigger).toBe("string");
  });

  it("must NOT include algorithm-specific derived fields", () => {
    const p: any = validAccelerationAppliedEvent.payload;

    // Algorithm-agnostic: no stability, difficulty, or interval in events
    expect(p.original_stability).toBeUndefined();
    expect(p.new_stability).toBeUndefined();
    expect(p.stability).toBeUndefined();
    expect(p.difficulty).toBeUndefined();
    expect(p.interval_days).toBeUndefined();
    expect(p.next_due_days).toBeUndefined();
    expect(p.due_at).toBeUndefined();
  });

  it("must not contain mutation-indicating fields", () => {
    expectEventImmutability(validAccelerationAppliedEvent, "AccelerationAppliedEvent");
  });

  it("must not contain aggregate fields in payload", () => {
    expectNoPayloadAggregates(validAccelerationAppliedEvent.payload, "AccelerationAppliedEvent.payload");
  });
});
