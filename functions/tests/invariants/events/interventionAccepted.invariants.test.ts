import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";
import { expectIdPrefix, ID_PREFIXES } from "../../helpers/ids.ts";
import {
  expectEventImmutability,
  expectNoPayloadAggregates
} from "../../helpers/invariantHelpers.ts";

const validInterventionAcceptedEvent = {
  ...validUserEvent,
  type: "intervention_accepted",
  entity: { kind: "card", id: "card_0001" },
  payload: {
    intervention_type: "accelerate",
    original_stability: 45.5,
    new_stability: 56.875
  }
};

describe("Event payload invariants — intervention_accepted", () => {
  it("must have entity.kind matching intervention target", () => {
    expect(["card", "relationship_card", "concept"]).toContain(validInterventionAcceptedEvent.entity.kind);
    
    if (validInterventionAcceptedEvent.entity.kind === "card") {
      expectIdPrefix(validInterventionAcceptedEvent.entity.id, ID_PREFIXES.CARD, "InterventionAcceptedEvent.entity.id");
    }
  });

  it("must include intervention_type with valid enum value", () => {
    const p: any = validInterventionAcceptedEvent.payload;

    expect(["accelerate", "lapse", "remediation", "suppress"]).toContain(p.intervention_type);

    if (p.original_stability !== undefined) {
      expect(typeof p.original_stability).toBe("number");
      expect(p.original_stability).toBeGreaterThan(0);
    }

    if (p.new_stability !== undefined) {
      expect(typeof p.new_stability).toBe("number");
      expect(p.new_stability).toBeGreaterThan(0);
    }
  });

  it("must not include scheduling state or derived metrics", () => {
    const p: any = validInterventionAcceptedEvent.payload;

    expect(p.due).toBeUndefined();
    expect(p.interval_days).toBeUndefined();
    expect(p.accuracy_rate).toBeUndefined();
    expect(p.total_attempts).toBeUndefined();
  });

  it("must not contain mutation-indicating fields", () => {
    expectEventImmutability(validInterventionAcceptedEvent, "InterventionAcceptedEvent");
  });

  it("must not contain aggregate fields in payload", () => {
    expectNoPayloadAggregates(validInterventionAcceptedEvent.payload, "InterventionAcceptedEvent.payload");
  });
});

