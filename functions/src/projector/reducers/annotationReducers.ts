/**
 * Annotation View Reducers
 * 
 * Pure functions for card annotation view updates.
 */

import { UserEvent } from "../eventProjector";
import { CardAnnotationUpdatedPayloadSchema } from "../../validation/schemas";
import { z } from "zod";

type CardAnnotationUpdatedPayload = z.infer<typeof CardAnnotationUpdatedPayloadSchema>;

export interface CardAnnotationView {
  type: "card_annotation_view";
  card_id: string;
  library_id: string;
  user_id: string;
  tags: string[];
  pinned: boolean;
  last_updated_at: string;
  last_applied: {
    received_at: string;
    event_id: string;
  };
  updated_at: string;
}

export function reduceCardAnnotation(
  prev: CardAnnotationView | undefined,
  event: UserEvent
): CardAnnotationView {
  const payload = CardAnnotationUpdatedPayloadSchema.parse(event.payload);
  const cardId = event.entity.id;

  // Initialize defaults
  let updatedTags: string[] = prev?.tags || [];
  let updatedPinned: boolean = prev?.pinned || false;

  // Handle different actions
  if (payload.action === "added") {
    // Add new tags (merge with existing, avoid duplicates)
    if (payload.tags) {
      const newTags = payload.tags.filter((tag) => !updatedTags.includes(tag));
      updatedTags = [...updatedTags, ...newTags];
    }
    if (payload.pinned !== undefined) {
      updatedPinned = payload.pinned;
    }
  } else if (payload.action === "removed") {
    // Remove specified tags
    if (payload.tags) {
      updatedTags = updatedTags.filter((tag) => !payload.tags!.includes(tag));
    }
    if (payload.pinned === false) {
      updatedPinned = false;
    }
  } else if (payload.action === "updated") {
    // Replace tags and pinned status
    if (payload.tags !== undefined) {
      updatedTags = payload.tags;
    }
    if (payload.pinned !== undefined) {
      updatedPinned = payload.pinned;
    }
  }

  return {
    type: "card_annotation_view",
    card_id: cardId,
    library_id: event.library_id,
    user_id: event.user_id,
    tags: updatedTags,
    pinned: updatedPinned,
    last_updated_at: event.occurred_at,
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };
}

export function shouldApplyAnnotationEvent(
  prev: CardAnnotationView | undefined,
  event: UserEvent
): boolean {
  if (!prev) return true;
  const viewTimestamp = new Date(prev.last_applied.received_at).getTime();
  const eventTimestamp = new Date(event.received_at).getTime();
  if (eventTimestamp > viewTimestamp) return true;
  if (eventTimestamp === viewTimestamp && event.event_id !== prev.last_applied.event_id) return true;
  if (event.event_id === prev.last_applied.event_id) return false;
  return false;
}

