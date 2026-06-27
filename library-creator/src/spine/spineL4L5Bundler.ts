import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  type SpineL4L5AnchorBundle,
  type SpineL4L5Concept,
  type SpineL4L5GraphBundle,
  unlockRefId,
  validateSpineL4L5AnchorBundle,
  validateSpineL4L5Structure,
} from "./spineL4L5Schema.js";
import { loadSpineL3Draft } from "./spineL4L5Units.js";

const BUNDLE_DIR = "content/spine/l4-l5-bundles";

function collectBundleFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => join(dir, name));
}

function readAnchorBundle(path: string): SpineL4L5AnchorBundle {
  return validateSpineL4L5AnchorBundle(JSON.parse(readFileSync(path, "utf8")));
}

/**
 * Surface universal edges into every domain context whose member set includes
 * the edge target. Keeps universal ⊇ context (consistency) while ensuring each
 * universal edge that points at a same-context concept is reflected in-context.
 * Deterministic and idempotent.
 */
export function reconcileConceptContexts(concepts: SpineL4L5Concept[]): SpineL4L5Concept[] {
  const memberDomains = new Map<string, Set<string>>();
  for (const c of concepts) {
    memberDomains.set(c.id, new Set(c.domain_contexts.map((dc) => dc.domain_id)));
  }

  return concepts.map((concept) => ({
    ...concept,
    domain_contexts: concept.domain_contexts.map((dc) => {
      const prereqs = new Set(dc.dependency_graph.prerequisites_in_context);
      for (const p of concept.dependency_graph.prerequisites) {
        if (memberDomains.get(p)?.has(dc.domain_id)) prereqs.add(p);
      }
      const unlockRefs = [...dc.dependency_graph.unlocks_in_context];
      const unlockIds = new Set(unlockRefs.map(unlockRefId));
      for (const u of concept.dependency_graph.unlocks) {
        const uid = unlockRefId(u);
        if (!unlockIds.has(uid) && memberDomains.get(uid)?.has(dc.domain_id)) {
          unlockRefs.push(u);
          unlockIds.add(uid);
        }
      }
      return {
        ...dc,
        dependency_graph: {
          prerequisites_in_context: [...prereqs],
          unlocks_in_context: unlockRefs,
        },
      };
    }),
  }));
}

export interface MergeL4L5Options {
  repoRoot: string;
  generationDate?: string;
}

export interface MergeL4L5Result {
  bundle: SpineL4L5GraphBundle;
  loadedAnchors: string[];
  missingAnchors: string[];
  validation: ReturnType<typeof validateSpineL4L5Structure>;
}

export function mergeSpineL4L5Draft(options: MergeL4L5Options): MergeL4L5Result {
  const { repoRoot, generationDate = new Date().toISOString().slice(0, 10) } = options;
  const bundleDir = join(repoRoot, BUNDLE_DIR);

  const byAnchor = new Map<string, SpineL4L5Concept[]>();
  const loadedAnchors: string[] = [];

  for (const filePath of collectBundleFiles(bundleDir)) {
    const anchorBundle = readAnchorBundle(filePath);
    const anchor = anchorBundle._meta.anchor_l3_id;
    if (byAnchor.has(anchor)) {
      throw new Error(`Duplicate anchor file for ${anchor}: ${filePath}`);
    }
    byAnchor.set(anchor, anchorBundle.concepts);
    loadedAnchors.push(anchor);
  }

  const spineL3 = loadSpineL3Draft(repoRoot);
  const expectedAnchors = new Set<string>();
  for (const concept of spineL3.concepts) {
    if (concept.resolution_level !== 3) continue;
    if (concept.domain_contexts.some((ctx) => ctx.framing.max_resolution_in_context >= 4)) {
      expectedAnchors.add(concept.id);
    }
  }

  const missingAnchors = [...expectedAnchors].filter((id) => !byAnchor.has(id)).sort();
  const concepts = reconcileConceptContexts([...byAnchor.values()].flat());

  const level4 = concepts.filter((c) => c.resolution_level === 4).length;
  const level5 = concepts.filter((c) => c.resolution_level === 5).length;

  const spineL3Ids = new Set(
    spineL3.concepts.filter((c) => c.resolution_level === 3).map((c) => c.id)
  );

  const bundle: SpineL4L5GraphBundle = {
    _meta: {
      spine_version: "0.2-draft",
      generation_date: generationDate,
      status: missingAnchors.length === 0 ? "draft" : "partial-draft",
      notes:
        missingAnchors.length === 0
          ? "Universal L4/L5 expansion for all anchors with max_resolution >= 4."
          : `${missingAnchors.length} anchors still missing universal bundle files.`,
      anchor_count: byAnchor.size,
      concept_counts: { level_4: level4, level_5: level5, total: concepts.length },
      forward_reference_warnings: [],
      graph_consistency_warnings: [],
      l5_membership_warnings: [],
      citation_uniformity_warnings: [],
    },
    concepts,
  };

  const validation = validateSpineL4L5Structure(bundle, spineL3Ids);

  const allIds = new Set([...spineL3Ids, ...concepts.map((c) => c.id)]);
  bundle._meta.forward_reference_warnings = validation.forwardReferences.filter(
    (ref) => !allIds.has(ref.to)
  );
  bundle._meta.graph_consistency_warnings = validation.graphConsistencyWarnings;
  bundle._meta.l5_membership_warnings = validation.l5MembershipWarnings;
  bundle._meta.citation_uniformity_warnings = validation.citationUniformityWarnings;

  return { bundle, loadedAnchors, missingAnchors, validation };
}

export function countConceptsByAnchor(
  concepts: SpineL4L5Concept[]
): Map<string, { l4: number; l5: number }> {
  const counts = new Map<string, { l4: number; l5: number }>();
  for (const concept of concepts) {
    const entry = counts.get(concept.anchor_concept_id) ?? { l4: 0, l5: 0 };
    if (concept.resolution_level === 4) entry.l4 += 1;
    else entry.l5 += 1;
    counts.set(concept.anchor_concept_id, entry);
  }
  return counts;
}

export function formatUnlockRef(ref: SpineL4L5Concept["dependency_graph"]["unlocks"][number]): string {
  const id = unlockRefId(ref);
  if (typeof ref === "object" && ref._forward_reference) {
    return `${id} [forward ref]`;
  }
  return id;
}
