import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { SpineGrowthProposal, SpinePlacementInput } from "./spinePlacement.js";

export type GrowthQueueStatus = "pending_review" | "accepted" | "rejected" | "deferred";

export interface SpineGrowthQueueEntry {
  id: string;
  created_at: string;
  status: GrowthQueueStatus;
  input: SpinePlacementInput;
  placement: SpineGrowthProposal;
}

export interface SpineGrowthQueue {
  _meta: {
    status: "open";
    last_updated: string;
    notes: string;
  };
  entries: SpineGrowthQueueEntry[];
}

const QUEUE_REL = "content/spine/spine-growth-queue.json";

export function growthQueuePath(repoRoot: string): string {
  return join(repoRoot, QUEUE_REL);
}

export function loadGrowthQueue(repoRoot: string): SpineGrowthQueue {
  const path = growthQueuePath(repoRoot);
  if (!existsSync(path)) {
    return {
      _meta: {
        status: "open",
        last_updated: new Date().toISOString(),
        notes: "Pending spine growth proposals from placement checks and library pipeline.",
      },
      entries: [],
    };
  }
  return JSON.parse(readFileSync(path, "utf8")) as SpineGrowthQueue;
}

export function appendGrowthQueueEntry(
  repoRoot: string,
  input: SpinePlacementInput,
  placement: SpineGrowthProposal
): SpineGrowthQueueEntry {
  const queue = loadGrowthQueue(repoRoot);
  const slug = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
  const entry: SpineGrowthQueueEntry = {
    id: `growth_${slug || "item"}_${Date.now()}`,
    created_at: new Date().toISOString(),
    status: "pending_review",
    input,
    placement,
  };
  queue.entries.push(entry);
  queue._meta.last_updated = entry.created_at;
  writeFileSync(growthQueuePath(repoRoot), `${JSON.stringify(queue, null, 2)}\n`, "utf8");
  return entry;
}

export function shouldQueuePlacement(placement: SpineGrowthProposal): boolean {
  return placement.recommendation !== "use_existing";
}
