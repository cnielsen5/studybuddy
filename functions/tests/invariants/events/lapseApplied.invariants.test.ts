import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";
import { expectIdPrefix, ID_PREFIXES } from "../../helpers/ids.ts";
import {
  expectEventImmutability,
  expectNoPayloadAggregates
} from "../../helpers/invariantHelpers.ts";
import { validLapseAppliedEvent } from "../../fixtures/lapseApplied.fixture.ts";

describe("Event payload invariants — lapse_applied", () => {
  it("must have entity.kind === 'card'", () => {
    expect(validLapseAppliedEvent.entity.kind).toBe("card");
    expectIdPrefix(validLapseAppliedEvent.entity.id, ID_PREFIXES.CARD, "LapseAppliedEvent.entity.id");
  });

  it("must include penalty_factor and trigger", () => {
    const p: any = validLapseAppliedEvent.payload;

    expect(typeof p.penalty_factor).toBe("number");
    expect(p.penalty_factor).toBeGreaterThanOrEqual(0);
    expect(p.penalty_factor).toBeLessThanOrEqual(1);
    expect(typeof p.trigger).toBe("string");
  });

  it("must NOT include algorithm-specific derived fields", () => {
    const p: any = validLapseAppliedEvent.payload;

    // Algorithm-agnostic: no stability, difficulty, or interval in events
    expect(p.original_stability).toBeUndefined();
    expect(p.new_stability).toBeUndefined();
    expect(p.stability).toBeUndefined();
    expect(p.difficulty).toBeUndefined();
    expect(p.interval_days).toBeUndefined();
    expect(p.due_at).toBeUndefined();
  });

  it("must not contain mutation-indicating fields", () => {
    expectEventImmutability(validLapseAppliedEvent, "LapseAppliedEvent");
  });

  it("must not contain aggregate fields in payload", () => {
    expectNoPayloadAggregates(validLapseAppliedEvent.payload, "LapseAppliedEvent.payload");
  });
});
