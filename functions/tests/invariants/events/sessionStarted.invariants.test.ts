import { validUserEvent } from "../../fixtures/userEvent.fixture.ts";
import { expectIdPrefix, ID_PREFIXES } from "../../helpers/ids.ts";
import {
  expectEventImmutability,
  expectNoPayloadAggregates
} from "../../helpers/invariantHelpers.ts";

const validSessionStartedEvent = {
  ...validUserEvent,
  type: "session_started",
  entity: { kind: "session", id: "session_0001" },
  payload: {
    planned_load: 42,
    queue_size: 38,
    cram_mode: false
  }
};

describe("Event payload invariants — session_started", () => {
  it("must have entity.kind === 'session'", () => {
    expect(validSessionStartedEvent.entity.kind).toBe("session");
    expectIdPrefix(validSessionStartedEvent.entity.id, ID_PREFIXES.SESSION, "SessionStartedEvent.entity.id");
  });

  it("must include planned_load, queue_size, and optional cram_mode", () => {
    const p: any = validSessionStartedEvent.payload;

    expect(typeof p.planned_load).toBe("number");
    expect(p.planned_load).toBeGreaterThanOrEqual(0);

    expect(typeof p.queue_size).toBe("number");
    expect(p.queue_size).toBeGreaterThanOrEqual(0);

    if (p.cram_mode !== undefined) {
      expect(typeof p.cram_mode).toBe("boolean");
    }
  });

  it("must not include session outcomes or aggregates", () => {
    const p: any = validSessionStartedEvent.payload;

    expect(p.actual_load).toBeUndefined();
    expect(p.retention_delta).toBeUndefined();
    expect(p.cards_reviewed).toBeUndefined();
    expect(p.questions_attempted).toBeUndefined();
    expect(p.accuracy_rate).toBeUndefined();
  });

  it("must not contain mutation-indicating fields", () => {
    expectEventImmutability(validSessionStartedEvent, "SessionStartedEvent");
  });

  it("must not contain aggregate fields in payload", () => {
    expectNoPayloadAggregates(validSessionStartedEvent.payload, "SessionStartedEvent.payload");
  });
});

