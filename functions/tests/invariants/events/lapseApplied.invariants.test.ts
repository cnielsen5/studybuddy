import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";
import { expectIdPrefix, ID_PREFIXES } from "../../helpers/ids.ts";
import {
  expectEventImmutability,
  expectNoPayloadAggregates
} from "../../helpers/invariantHelpers.ts";

const validLapseAppliedEvent = {
  ...validUserEvent,
  type: "lapse_applied",
  entity: { kind: "card", id: "card_0001" },
  payload: {
    original_stability: 45.5,
    new_stability: 27.3,
    effective_penalty: 0.4,
    trigger: "diagnostic_probing_confirmed_gap"
  }
};

describe("Event payload invariants — lapse_applied", () => {
  it("must have entity.kind === 'card'", () => {
    expect(validLapseAppliedEvent.entity.kind).toBe("card");
    expectIdPrefix(validLapseAppliedEvent.entity.id, ID_PREFIXES.CARD, "LapseAppliedEvent.entity.id");
  });

  it("must include stability changes and penalty", () => {
    const p: any = validLapseAppliedEvent.payload;

    expect(typeof p.original_stability).toBe("number");
    expect(p.original_stability).toBeGreaterThan(0);

    expect(typeof p.new_stability).toBe("number");
    expect(p.new_stability).toBeGreaterThan(0);
    expect(p.new_stability).toBeLessThanOrEqual(p.original_stability);

    expect(typeof p.effective_penalty).toBe("number");
    expect(p.effective_penalty).toBeGreaterThanOrEqual(0);
    expect(p.effective_penalty).toBeLessThanOrEqual(1);

    if (p.trigger !== undefined) {
      expect(typeof p.trigger).toBe("string");
    }
  });

  it("must not include full schedule state or performance metrics", () => {
    const p: any = validLapseAppliedEvent.payload;

    expect(p.due).toBeUndefined();
    expect(p.difficulty).toBeUndefined();
    expect(p.interval_days).toBeUndefined();
    expect(p.accuracy_rate).toBeUndefined();
    expect(p.total_attempts).toBeUndefined();
  });

  it("must not contain mutation-indicating fields", () => {
    expectEventImmutability(validLapseAppliedEvent, "LapseAppliedEvent");
  });

  it("must not contain aggregate fields in payload", () => {
    expectNoPayloadAggregates(validLapseAppliedEvent.payload, "LapseAppliedEvent.payload");
  });
});

