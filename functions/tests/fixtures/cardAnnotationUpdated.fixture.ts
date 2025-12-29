import { validUserEvent } from "./userEvent.fixture.ts";

export const validCardAnnotationUpdatedEvent = {
  ...validUserEvent,
  type: "card_annotation_updated",
  entity: { kind: "card", id: "card_0001" },
  payload: {
    action: "added",
    tags: ["cram", "high-priority"],
    pinned: true
  }
} as const;

