import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";
import { expectIdPrefix, ID_PREFIXES } from "../../helpers/ids.ts";
import {
  expectEventImmutability,
  expectNoPayloadAggregates
} from "../../helpers/invariantHelpers.ts";
import { validInterventionAcceptedEvent } from "../../fixtures/interventionAccepted.fixture.ts";

describe("Event payload invariants — intervention_accepted", () => {
  it("must have entity.kind matching intervention target", () => {
    expect(["card", "relationship_card", "concept"]).toContain(validInterventionAcceptedEvent.entity.kind);
    
    if (validInterventionAcceptedEvent.entity.kind === "card") {
      expectIdPrefix(validInterventionAcceptedEvent.entity.id, ID_PREFIXES.CARD, "InterventionAcceptedEvent.entity.id");
    }
  });

  it("must include intervention_type and factor", () => {
    const p: any = validInterventionAcceptedEvent.payload;

    expect(["accelerate", "lapse", "reset"]).toContain(p.intervention_type);
    expect(typeof p.factor).toBe("number");
    expect(p.factor).toBeGreaterThan(0);
  });

  it("must NOT include algorithm-specific derived fields", () => {
    const p: any = validInterventionAcceptedEvent.payload;

    // Algorithm-agnostic: no stability, difficulty, or interval in events
    expect(p.original_stability).toBeUndefined();
    expect(p.new_stability).toBeUndefined();
    expect(p.stability).toBeUndefined();
    expect(p.difficulty).toBeUndefined();
    expect(p.interval_days).toBeUndefined();
    expect(p.due_at).toBeUndefined();
  });

  it("must not include scheduling state or derived metrics", () => {
    const p: any = validInterventionAcceptedEvent.payload;

    expect(p.due).toBeUndefined();
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

