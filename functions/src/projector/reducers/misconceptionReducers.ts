/**
 * Misconception View Reducers
 * 
 * Pure functions for misconception edge view updates.
 */

import { UserEvent } from "../eventProjector";
import { z } from "zod";

const MisconceptionProbeResultPayloadSchema = z.object({
  confirmed: z.boolean(),
  explanation_quality: z.enum(["good", "weak"]).optional(),
  seconds_spent: z.number().nonnegative(),
});

type MisconceptionProbeResultPayload = z.infer<typeof MisconceptionProbeResultPayloadSchema>;

export interface MisconceptionEdgeView {
  type: "misconception_edge_view";
  misconception_id: string;
  library_id: string;
  user_id: string;
  concept_a_id: string;
  concept_b_id: string;
  direction: {
    from: string;
    to: string;
    error_type?: string;
  };
  misconception_type: string;
  strength: number;
  status: "active" | "strong" | "resolved";
  first_observed_at: string;
  last_observed_at: string;
  evidence: {
    relationship_failures: number;
    high_confidence_errors: number;
    probe_confirmations: number;
  };
  last_applied: {
    received_at: string;
    event_id: string;
  };
  updated_at: string;
}

export function reduceMisconceptionEdge(
  prev: MisconceptionEdgeView | undefined,
  event: UserEvent
): MisconceptionEdgeView {
  const payload = MisconceptionProbeResultPayloadSchema.parse(event.payload);
  const misconceptionId = event.entity.id;

  // Initialize defaults if no previous state
  const currentStrength = prev?.strength || 0.5;
  const currentEvidence = prev?.evidence || {
    relationship_failures: 0,
    high_confidence_errors: 0,
    probe_confirmations: 0,
  };

  // Update strength based on confirmation (monotonic: bounded between 0 and 1)
  let newStrength = currentStrength;
  if (payload.confirmed) {
    newStrength = Math.min(1.0, currentStrength + 0.1);
  } else {
    newStrength = Math.max(0.0, currentStrength - 0.05);
  }

  // Update evidence (monotonic: probe_confirmations only increases)
  const newEvidence = {
    relationship_failures: currentEvidence.relationship_failures || 0,
    high_confidence_errors: currentEvidence.high_confidence_errors || 0,
    probe_confirmations: (currentEvidence.probe_confirmations || 0) + (payload.confirmed ? 1 : 0),
  };

  // Update status based on strength (monotonic: status transitions are deterministic)
  let newStatus: "active" | "strong" | "resolved";
  if (newStrength < 0.2) {
    newStatus = "resolved";
  } else if (newStrength > 0.8) {
    newStatus = "strong";
  } else {
    newStatus = "active";
  }

  return {
    type: "misconception_edge_view",
    misconception_id: misconceptionId,
    library_id: event.library_id,
    user_id: event.user_id,
    concept_a_id: prev?.concept_a_id || "",
    concept_b_id: prev?.concept_b_id || "",
    direction: prev?.direction || { from: "", to: "", error_type: undefined },
    misconception_type: prev?.misconception_type || "unknown",
    strength: newStrength,
    status: newStatus,
    first_observed_at: prev?.first_observed_at || event.occurred_at,
    last_observed_at: event.occurred_at,
    evidence: newEvidence,
    last_applied: {
      received_at: event.received_at,
      event_id: event.event_id,
    },
    updated_at: new Date().toISOString(),
  };
}

export function shouldApplyMisconceptionEvent(
  prev: MisconceptionEdgeView | undefined,
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

