import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";
import { expectIdPrefix, ID_PREFIXES } from "../../helpers/ids.ts";
import {
  expectEventImmutability,
  expectNoPayloadAggregates
} from "../../helpers/invariantHelpers.ts";

const validSessionEndedEvent = {
  ...validUserEvent,
  type: "session_ended",
  entity: { kind: "session", id: "session_0001" },
  payload: {
    actual_load: 39,
    retention_delta: 0.08,
    fatigue_hit: true,
    user_accepted_intervention: false
  }
};

describe("Event payload invariants — session_ended", () => {
  it("must have entity.kind === 'session'", () => {
    expect(validSessionEndedEvent.entity.kind).toBe("session");
    expectIdPrefix(validSessionEndedEvent.entity.id, ID_PREFIXES.SESSION, "SessionEndedEvent.entity.id");
  });

  it("must include actual_load and optional metrics", () => {
    const p: any = validSessionEndedEvent.payload;

    expect(typeof p.actual_load).toBe("number");
    expect(p.actual_load).toBeGreaterThanOrEqual(0);

    if (p.retention_delta !== undefined) {
      expect(typeof p.retention_delta).toBe("number");
    }

    if (p.fatigue_hit !== undefined) {
      expect(typeof p.fatigue_hit).toBe("boolean");
    }

    if (p.user_accepted_intervention !== undefined) {
      expect(typeof p.user_accepted_intervention).toBe("boolean");
    }
  });

  it("must not include detailed item lists or raw attempts", () => {
    const p: any = validSessionEndedEvent.payload;

    expect(p.card_ids).toBeUndefined();
    expect(p.question_ids).toBeUndefined();
    expect(p.attempt_ids).toBeUndefined();
    expect(p.items_seen).toBeUndefined();
    expect(p.events).toBeUndefined();
  });

  it("must not contain mutation-indicating fields", () => {
    expectEventImmutability(validSessionEndedEvent, "SessionEndedEvent");
  });

  it("must not contain aggregate fields in payload", () => {
    expectNoPayloadAggregates(validSessionEndedEvent.payload, "SessionEndedEvent.payload");
  });
});

