import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { ConceptPlacementRecord } from "../extraction/anchorConceptGraphToSpine.js";
import type { ConceptGraphDraft } from "../types/draftConcept.js";
import {
  SpineContributionCandidateSchema,
  SpineContributionQueueSchema,
  type SpineContributionCandidate,
  type SpineContributionQueue,
} from "../types/spineContribution.js";

const QUEUE_REL_PATH = "content/spine/spine-contribution-queue.json";

function queuePath(repoRoot: string): string {
  return join(repoRoot, QUEUE_REL_PATH);
}

export function loadSpineContributionQueue(repoRoot: string): SpineContributionQueue {
  const path = queuePath(repoRoot);
  if (!existsSync(path)) {
    return {
      version: 1,
      updated_at: new Date().toISOString(),
      candidates: [],
    };
  }
  const raw = JSON.parse(readFileSync(path, "utf8"));
  return SpineContributionQueueSchema.parse(raw);
}

export function saveSpineContributionQueue(
  repoRoot: string,
  queue: SpineContributionQueue
): void {
  const path = queuePath(repoRoot);
  mkdirSync(join(repoRoot, "content/spine"), { recursive: true });
  writeFileSync(path, `${JSON.stringify(queue, null, 2)}\n`, "utf8");
}

export function collectSpineContributionCandidates(
  conceptGraph: ConceptGraphDraft,
  placements: ConceptPlacementRecord[],
  options: { libraryId: string; userId: string }
): SpineContributionCandidate[] {
  const now = new Date().toISOString();
  const candidates: SpineContributionCandidate[] = [];

  for (const row of placements) {
    const rec = row.proposal.recommendation;
    if (
      rec !== "create_l4_child" &&
      rec !== "create_l5_child" &&
      rec !== "create_l3_node"
    ) {
      continue;
    }

    const concept = conceptGraph.concepts.find((c) => c.id === row.concept_id);
    if (!concept) continue;

    const anchor =
      row.proposal.suggested_anchor_l3_id ??
      row.proposal.suggested_parent_id ??
      row.proposal.target_concept_id ??
      concept.id;

    const sourceCitations = concept.references?.length ?? 0;

    candidates.push(
      SpineContributionCandidateSchema.parse({
        concept_id: concept.id,
        anchor_spine_id: anchor,
        domain_id: concept.knowledge_graph?.primary_domain ?? "mixed",
        title: concept.content.title,
        generated_for_library: options.libraryId,
        generated_for_user: options.userId,
        quality_signals: {
          source_citations: sourceCitations,
          similar_user_count: 0,
        },
        recommendation:
          sourceCitations >= 2 ? "review_needed" : "too_specific",
        created_at: now,
      })
    );
  }

  return candidates;
}

export function appendSpineContributionCandidates(
  repoRoot: string,
  conceptGraph: ConceptGraphDraft,
  placements: ConceptPlacementRecord[],
  options: { libraryId: string; userId: string }
): SpineContributionCandidate[] {
  const incoming = collectSpineContributionCandidates(
    conceptGraph,
    placements,
    options
  );
  if (incoming.length === 0) return [];

  const queue = loadSpineContributionQueue(repoRoot);
  const existingIds = new Set(queue.candidates.map((c) => c.concept_id));
  const merged = [...queue.candidates];

  for (const candidate of incoming) {
    if (existingIds.has(candidate.concept_id)) continue;
    merged.push(candidate);
    existingIds.add(candidate.concept_id);
  }

  saveSpineContributionQueue(repoRoot, {
    version: 1,
    updated_at: new Date().toISOString(),
    candidates: merged,
  });

  return incoming;
}
