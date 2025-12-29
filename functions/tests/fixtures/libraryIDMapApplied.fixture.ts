import { validUserEvent } from "./userEvent.fixture";

export const validLibraryIdMapAppliedEvent = {
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
} as const;
