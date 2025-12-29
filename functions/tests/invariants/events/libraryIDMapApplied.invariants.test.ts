const validLibraryIdMapAppliedEvent = {
  ...validUserEvent,
  type: "library_id_map_applied",
  entity: { kind: "library_version", id: "2025-12-28-01" },
  payload: {
    from_version: "2025-12-01-00",
    to_version: "2025-12-28-01",
    renames: {
      cards: [{ from: "card_old_001", to: "card_new_001" }],
      questions: []
    }
  }
};

describe("Event payload invariants — library_id_map_applied", () => {
  it("must have entity.kind === 'library_version'", () => {
    expect(validLibraryIdMapAppliedEvent.entity.kind).toBe("library_version");
  });

  it("must include from_version, to_version, and renames", () => {
    const p: any = validLibraryIdMapAppliedEvent.payload;

    expect(typeof p.from_version).toBe("string");
    expect(typeof p.to_version).toBe("string");
    expect(p.from_version).not.toBe(p.to_version);

    expect(p.renames).toBeDefined();
    expect(Array.isArray(p.renames.cards)).toBe(true);
  });

  it("rename entries must be {from,to} strings", () => {
    const cards: any[] = validLibraryIdMapAppliedEvent.payload.renames.cards;

    for (const r of cards) {
      expect(typeof r.from).toBe("string");
      expect(typeof r.to).toBe("string");
      expect(r.from).not.toBe(r.to);
    }
  });

  it("must not include user state mutations", () => {
    const p: any = validLibraryIdMapAppliedEvent.payload;

    expect(p.migrate_schedule_state).toBeUndefined();
    expect(p.migrate_perf_metrics).toBeUndefined();
  });
});
