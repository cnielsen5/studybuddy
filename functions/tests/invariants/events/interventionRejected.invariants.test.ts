import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";
import { expectIdPrefix, ID_PREFIXES } from "../../helpers/ids.ts";
import {
  expectEventImmutability,
  expectNoPayloadAggregates
} from "../../helpers/invariantHelpers.ts";

const validInterventionRejectedEvent = {
  ...validUserEvent,
  type: "intervention_rejected",
  entity: { kind: "card", id: "card_0001" },
  payload: {
    intervention_type: "lapse",
    reason: "insufficient_evidence"
  }
};

describe("Event payload invariants — intervention_rejected", () => {
  it("must have entity.kind matching intervention target", () => {
    expect(["card", "relationship_card", "concept"]).toContain(validInterventionRejectedEvent.entity.kind);
    
    if (validInterventionRejectedEvent.entity.kind === "card") {
      expectIdPrefix(validInterventionRejectedEvent.entity.id, ID_PREFIXES.CARD, "InterventionRejectedEvent.entity.id");
    }
  });

  it("must include intervention_type and reason", () => {
    const p: any = validInterventionRejectedEvent.payload;

    expect(["accelerate", "lapse", "remediation", "suppress"]).toContain(p.intervention_type);

    expect(typeof p.reason).toBe("string");
    expect(p.reason.length).toBeGreaterThan(0);
  });

  it("must not include stability changes or scheduling modifications", () => {
    const p: any = validInterventionRejectedEvent.payload;

    expect(p.original_stability).toBeUndefined();
    expect(p.new_stability).toBeUndefined();
    expect(p.stability_delta).toBeUndefined();
    expect(p.due).toBeUndefined();
  });

  it("must not contain mutation-indicating fields", () => {
    expectEventImmutability(validInterventionRejectedEvent, "InterventionRejectedEvent");
  });

  it("must not contain aggregate fields in payload", () => {
    expectNoPayloadAggregates(validInterventionRejectedEvent.payload, "InterventionRejectedEvent.payload");
  });
});

