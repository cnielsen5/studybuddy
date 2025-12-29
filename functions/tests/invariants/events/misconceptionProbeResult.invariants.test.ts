import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";
import {
  expectEventImmutability,
  expectNoPayloadAggregates
} from "../../helpers/invariantHelpers.ts";

const validMisconceptionProbeEvent = {
  ...validUserEvent,
  type: "misconception_probe_result",
  entity: { kind: "misconception_edge", id: "mis_edge_001" },
  payload: {
    confirmed: true,
    explanation_quality: "good",
    seconds_spent: 40
  }
};

describe("Event payload invariants — misconception_probe_result", () => {
  it("must have entity.kind === 'misconception_edge'", () => {
    expect(validMisconceptionProbeEvent.entity.kind).toBe("misconception_edge");
  });

  it("must include confirmed, explanation_quality, seconds_spent", () => {
    const p: any = validMisconceptionProbeEvent.payload;

    expect(typeof p.confirmed).toBe("boolean");
    expect(["good", "weak"]).toContain(p.explanation_quality);

    expect(typeof p.seconds_spent).toBe("number");
    expect(p.seconds_spent).toBeGreaterThanOrEqual(0);
  });

  it("must not include free-text reasoning", () => {
    const p: any = validMisconceptionProbeEvent.payload;

    expect(p.explanation).toBeUndefined();
    expect(p.ai_reasoning).toBeUndefined();
    expect(p.narrative).toBeUndefined();
  });

  it("must not contain mutation-indicating fields", () => {
    expectEventImmutability(validMisconceptionProbeEvent, "MisconceptionProbeResultEvent");
  });

  it("must not contain aggregate fields in payload", () => {
    expectNoPayloadAggregates(validMisconceptionProbeEvent.payload, "MisconceptionProbeResultEvent.payload");
  });
});
