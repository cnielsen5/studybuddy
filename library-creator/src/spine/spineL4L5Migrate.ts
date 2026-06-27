import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  type SpineL4L5AnchorBundle,
  type SpineL4L5Concept,
  type SpineL4L5DomainContext,
  type SpineL4L5LegacyConcept,
  type SpineL4L5UnlockRef,
  isForwardRef,
  unlockRefId,
  validateSpineL4L5LegacyUnitBundle,
} from "./spineL4L5Schema.js";
import { loadSpineL3Draft } from "./spineL4L5Units.js";

const SAMPLE_DIR = "content/spine/l4-l5-samples";
const BUNDLE_DIR = "content/spine/l4-l5-bundles";

const AUTO_MERGE_TITLE_DICE = 0.82;
const PROPOSE_TITLE_DICE = 0.45;
const PROPOSE_DEF_DICE = 0.6;

// ---------------------------------------------------------------------------
// Text normalization + similarity
// ---------------------------------------------------------------------------

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bigrams(text: string): Map<string, number> {
  const norm = normalize(text).replace(/ /g, "");
  const grams = new Map<string, number>();
  for (let i = 0; i < norm.length - 1; i++) {
    const g = norm.slice(i, i + 2);
    grams.set(g, (grams.get(g) ?? 0) + 1);
  }
  return grams;
}

/** Sørensen–Dice coefficient over character bigrams. */
function diceCoefficient(a: string, b: string): number {
  const ga = bigrams(a);
  const gb = bigrams(b);
  if (ga.size === 0 || gb.size === 0) return a === b ? 1 : 0;
  let intersection = 0;
  for (const [g, count] of ga) {
    const other = gb.get(g);
    if (other) intersection += Math.min(count, other);
  }
  const total = [...ga.values()].reduce((s, v) => s + v, 0) +
    [...gb.values()].reduce((s, v) => s + v, 0);
  return (2 * intersection) / total;
}

// ---------------------------------------------------------------------------
// Loading legacy units (samples override bundles for the same unit key)
// ---------------------------------------------------------------------------

interface LegacyUnit {
  parentL3Id: string;
  domainId: string;
  concepts: SpineL4L5LegacyConcept[];
  sourceFile: string;
}

function collectBundleFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => join(dir, name));
}

export function loadLegacyUnits(repoRoot: string): LegacyUnit[] {
  const byKey = new Map<string, LegacyUnit>();
  const order: Array<{ dir: string; fromSamples: boolean }> = [
    { dir: join(repoRoot, BUNDLE_DIR), fromSamples: false },
    { dir: join(repoRoot, SAMPLE_DIR), fromSamples: true }, // samples win
  ];
  for (const { dir, fromSamples } of order) {
    for (const filePath of collectBundleFiles(dir)) {
      const parsed = validateSpineL4L5LegacyUnitBundle(
        JSON.parse(readFileSync(filePath, "utf8"))
      );
      const key = `${parsed._meta.parent_l3_id}.${parsed._meta.domain_id}`;
      if (byKey.has(key) && !fromSamples) continue;
      byKey.set(key, {
        parentL3Id: parsed._meta.parent_l3_id,
        domainId: parsed._meta.domain_id,
        concepts: parsed.concepts,
        sourceFile: filePath.slice(repoRoot.length + 1),
      });
    }
  }
  return [...byKey.values()];
}

// ---------------------------------------------------------------------------
// Migration
// ---------------------------------------------------------------------------

interface CarriedConcept {
  legacy: SpineL4L5LegacyConcept;
  domainId: string;
  slug: string;
}

interface MergeProposal {
  anchor: string;
  reason: string;
  members: string[];
  titleDice: number;
}

export interface MigrationResult {
  anchorBundles: SpineL4L5AnchorBundle[];
  idRemap: Map<string, string>;
  proposals: MergeProposal[];
  collisions: string[];
  unmappedEdges: Array<{ from: string; to: string }>;
}

function levelToken(level: 4 | 5): string {
  return `l${level}`;
}

function extractSlug(concept: SpineL4L5LegacyConcept): string {
  const prefix = `spine_${concept.domain_id}_${levelToken(concept.resolution_level)}_`;
  if (concept.id.startsWith(prefix)) return concept.id.slice(prefix.length);
  // fallback: strip any spine_<...>_l<n>_
  const m = concept.id.match(/^spine_[a-z0-9_]+?_l[45]_(.+)$/);
  return m ? m[1] : concept.id.replace(/^spine_/, "");
}

function pickRepresentative(
  members: CarriedConcept[],
  primaryDomain: string
): CarriedConcept {
  const primary = members.find((m) => m.domainId === primaryDomain);
  if (primary) return primary;
  return [...members].sort(
    (a, b) => b.legacy.content.definition.length - a.legacy.content.definition.length
  )[0];
}

function dedupeSourceRefs(
  refs: SpineL4L5LegacyConcept["metadata"]["source_references"]
): SpineL4L5LegacyConcept["metadata"]["source_references"] {
  const seen = new Set<string>();
  const out: typeof refs = [];
  for (const ref of refs) {
    const key = `${ref.source}|${ref.chapter ?? ""}|${ref.section ?? ""}|${ref.url ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(ref);
  }
  return out;
}

/** Union of unlock refs, preferring the forward-ref-flagged variant. */
function mergeUnlocks(lists: SpineL4L5UnlockRef[][]): SpineL4L5UnlockRef[] {
  const byId = new Map<string, SpineL4L5UnlockRef>();
  for (const list of lists) {
    for (const ref of list) {
      const id = unlockRefId(ref);
      const existing = byId.get(id);
      if (!existing) {
        byId.set(id, ref);
      } else if (isForwardRef(ref) && !isForwardRef(existing)) {
        byId.set(id, ref);
      }
    }
  }
  return [...byId.values()];
}

export function migrateLegacyToUniversal(repoRoot: string): MigrationResult {
  const units = loadLegacyUnits(repoRoot);
  const spineL3 = loadSpineL3Draft(repoRoot);

  const primaryByAnchor = new Map<string, string>();
  for (const c of spineL3.concepts) {
    if (c.resolution_level === 3) {
      primaryByAnchor.set(c.id, c.knowledge_graph.primary_domain);
    }
  }

  // Group all legacy concepts by anchor.
  const byAnchor = new Map<string, CarriedConcept[]>();
  for (const unit of units) {
    for (const legacy of unit.concepts) {
      const list = byAnchor.get(legacy.anchor_concept_id) ?? [];
      list.push({
        legacy,
        domainId: unit.domainId,
        slug: extractSlug(legacy),
      });
      byAnchor.set(legacy.anchor_concept_id, list);
    }
  }

  const idRemap = new Map<string, string>();
  const proposals: MergeProposal[] = [];
  const usedCanonicalIds = new Set<string>();
  const collisions: string[] = [];

  // First pass: cluster within each anchor and assign canonical ids.
  interface Cluster {
    anchor: string;
    members: CarriedConcept[];
    level: 4 | 5;
    canonicalId: string;
    mixedLevel: boolean;
  }
  const clustersByAnchor = new Map<string, Cluster[]>();

  for (const [anchor, members] of byAnchor) {
    const primaryDomain =
      primaryByAnchor.get(anchor) ?? members[0].domainId;

    // Union-find with a same-domain collision guard. A cluster must never
    // contain two members from the same domain context, so we process candidate
    // merges strongest-first and only union when the merged cluster stays
    // domain-disjoint (prevents e.g. "Type I" and "Type IV" collapsing).
    const parent = members.map((_, i) => i);
    const clusterDomains = members.map((m) => new Set<string>([m.domainId]));
    const find = (x: number): number => {
      while (parent[x] !== x) {
        parent[x] = parent[parent[x]];
        x = parent[x];
      }
      return x;
    };

    interface Candidate {
      i: number;
      j: number;
      score: number;
    }
    const candidates: Candidate[] = [];
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        const a = members[i];
        const b = members[j];
        if (a.domainId === b.domainId) continue; // never merge within one context
        const slugEqual = a.slug === b.slug;
        const titleEqual = normalize(a.legacy.content.title) === normalize(b.legacy.content.title);
        const titleDice = diceCoefficient(a.legacy.content.title, b.legacy.content.title);
        if (slugEqual || titleEqual || titleDice >= AUTO_MERGE_TITLE_DICE) {
          const score = slugEqual ? 3 : titleEqual ? 2 : titleDice;
          candidates.push({ i, j, score });
        } else {
          const defDice = diceCoefficient(a.legacy.content.definition, b.legacy.content.definition);
          if (titleDice >= PROPOSE_TITLE_DICE || defDice >= PROPOSE_DEF_DICE) {
            proposals.push({
              anchor,
              reason: `possible duplicate (titleDice=${titleDice.toFixed(2)}, defDice=${defDice.toFixed(2)})`,
              members: [a.legacy.id, b.legacy.id],
              titleDice,
            });
          }
        }
      }
    }

    candidates.sort((x, y) => y.score - x.score);
    for (const { i, j, score } of candidates) {
      const ri = find(i);
      const rj = find(j);
      if (ri === rj) continue;
      const di = clusterDomains[ri];
      const dj = clusterDomains[rj];
      let collides = false;
      for (const d of dj) if (di.has(d)) collides = true;
      if (collides) {
        proposals.push({
          anchor,
          reason: `auto-merge skipped (same-domain collision, score=${score.toFixed(2)})`,
          members: [members[i].legacy.id, members[j].legacy.id],
          titleDice: score,
        });
        continue;
      }
      parent[rj] = ri;
      for (const d of dj) di.add(d);
    }

    // collect clusters
    const groups = new Map<number, CarriedConcept[]>();
    for (let i = 0; i < members.length; i++) {
      const root = find(i);
      const g = groups.get(root) ?? [];
      g.push(members[i]);
      groups.set(root, g);
    }

    const clusters: Cluster[] = [];
    for (const group of groups.values()) {
      const hasL4 = group.some((m) => m.legacy.resolution_level === 4);
      const hasL5 = group.some((m) => m.legacy.resolution_level === 5);
      const level: 4 | 5 = hasL4 ? 4 : 5;
      const rep = pickRepresentative(group, primaryDomain);
      let canonicalId = `spine_${primaryDomain}_${levelToken(level)}_${rep.slug}`;
      if (usedCanonicalIds.has(canonicalId)) {
        collisions.push(canonicalId);
        let n = 2;
        while (usedCanonicalIds.has(`${canonicalId}_${n}`)) n++;
        canonicalId = `${canonicalId}_${n}`;
      }
      usedCanonicalIds.add(canonicalId);
      for (const m of group) idRemap.set(m.legacy.id, canonicalId);
      clusters.push({ anchor, members: group, level, canonicalId, mixedLevel: hasL4 && hasL5 });
    }
    clustersByAnchor.set(anchor, clusters);
  }

  const remapId = (id: string): string => idRemap.get(id) ?? id;
  const remapUnlock = (ref: SpineL4L5UnlockRef): SpineL4L5UnlockRef => {
    if (typeof ref === "string") return remapId(ref);
    return { concept_id: remapId(ref.concept_id), _forward_reference: true };
  };

  // canonical id -> set of member domain_ids (used to surface universal edges
  // into every context where the edge target is also a member).
  const canonicalDomains = new Map<string, Set<string>>();
  for (const clusters of clustersByAnchor.values()) {
    for (const cluster of clusters) {
      const domains = canonicalDomains.get(cluster.canonicalId) ?? new Set<string>();
      for (const m of cluster.members) domains.add(m.domainId);
      canonicalDomains.set(cluster.canonicalId, domains);
    }
  }

  const allCanonicalIds = new Set(idRemap.values());
  const spineL3Ids = new Set(
    spineL3.concepts.filter((c) => c.resolution_level === 3).map((c) => c.id)
  );
  const unmappedEdges: Array<{ from: string; to: string }> = [];

  // Second pass: build universal concepts with remapped edges.
  const anchorBundles: SpineL4L5AnchorBundle[] = [];

  for (const [anchor, clusters] of clustersByAnchor) {
    const primaryDomain = primaryByAnchor.get(anchor) ?? clusters[0].members[0].domainId;
    const concepts: SpineL4L5Concept[] = [];

    for (const cluster of clusters) {
      const rep = pickRepresentative(cluster.members, primaryDomain);
      const repLegacy = rep.legacy;

      // universal graph = union of all members' universal + in-context edges
      const prereqSet = new Set<string>();
      for (const m of cluster.members) {
        for (const p of m.legacy.dependency_graph.prerequisites) prereqSet.add(remapId(p));
        for (const p of m.legacy.domain_context.dependency_graph.prerequisites_in_context)
          prereqSet.add(remapId(p));
      }
      const unlockLists: SpineL4L5UnlockRef[][] = [];
      for (const m of cluster.members) {
        unlockLists.push(m.legacy.dependency_graph.unlocks.map(remapUnlock));
        unlockLists.push(m.legacy.domain_context.dependency_graph.unlocks_in_context.map(remapUnlock));
      }
      const prerequisites = [...prereqSet];
      const unlocks = mergeUnlocks(unlockLists);

      // domain_contexts: one per member, reconciled so each context surfaces the
      // universal edges whose target is also a member of that same context.
      const domainContexts: SpineL4L5DomainContext[] = cluster.members
        .slice()
        .sort((a, b) => a.domainId.localeCompare(b.domainId))
        .map((m) => {
          const ctxPrereqs = new Set(
            m.legacy.domain_context.dependency_graph.prerequisites_in_context.map(remapId)
          );
          for (const p of prerequisites) {
            if (canonicalDomains.get(p)?.has(m.domainId)) ctxPrereqs.add(p);
          }
          const ctxUnlockRefs = m.legacy.domain_context.dependency_graph.unlocks_in_context.map(
            remapUnlock
          );
          const ctxUnlockIds = new Set(ctxUnlockRefs.map(unlockRefId));
          for (const u of unlocks) {
            const uid = unlockRefId(u);
            if (!ctxUnlockIds.has(uid) && canonicalDomains.get(uid)?.has(m.domainId)) {
              ctxUnlockRefs.push(u);
              ctxUnlockIds.add(uid);
            }
          }
          return {
            domain_id: m.domainId,
            framing: m.legacy.domain_context.framing,
            hierarchy_location: m.legacy.domain_context.hierarchy_location,
            dependency_graph: {
              prerequisites_in_context: [...ctxPrereqs],
              unlocks_in_context: ctxUnlockRefs,
            },
            linked_content: m.legacy.domain_context.linked_content,
          };
        });

      // parent_concept_id
      let parentConceptId: string;
      if (cluster.level === 4) {
        parentConceptId = anchor;
      } else {
        // L5 parent: remap representative's parent
        parentConceptId = remapId(repLegacy.dependency_graph.parent_concept_id);
      }

      // self-edges from remap collisions: drop prereq/unlock equal to self
      const selfId = cluster.canonicalId;
      const cleanPrereqs = prerequisites.filter((p) => p !== selfId);
      const cleanUnlocks = unlocks.filter((u) => unlockRefId(u) !== selfId);

      // track unmapped non-forward edges (potential dangling references)
      for (const p of cleanPrereqs) {
        if (!allCanonicalIds.has(p) && !spineL3Ids.has(p)) {
          unmappedEdges.push({ from: selfId, to: p });
        }
      }

      const reviewerNotes: string[] = [];
      for (const m of cluster.members) {
        if (m.legacy._reviewer_note) reviewerNotes.push(m.legacy._reviewer_note);
      }
      if (cluster.mixedLevel) {
        reviewerNotes.push(
          "DEPTH RECONCILED: members authored at mixed L4/L5; promoted to L4 so shallow contexts can include it. Confirm L4 vs L5."
        );
      }
      if (cluster.members.length > 1) {
        reviewerNotes.unshift(
          `MERGED from ${cluster.members.length} contexts: ${cluster.members
            .map((m) => `${m.domainId}:${m.legacy.id}`)
            .join(", ")}`
        );
      }

      const sharedNotes = cluster.members
        .map((m) => m.legacy.knowledge_graph._shared_concept_note)
        .filter((n): n is string => Boolean(n));

      const concept: SpineL4L5Concept = {
        id: cluster.canonicalId,
        resolution_level: cluster.level,
        anchor_concept_id: anchor,
        content: repLegacy.content,
        knowledge_graph: {
          knowledge_area: repLegacy.knowledge_graph.knowledge_area,
          knowledge_cluster: repLegacy.knowledge_graph.knowledge_cluster,
          primary_domain: primaryDomain,
          _shared_concept_note: sharedNotes.length ? sharedNotes[0] : null,
        },
        dependency_graph: {
          parent_concept_id: parentConceptId,
          prerequisites: cleanPrereqs,
          unlocks: cleanUnlocks,
        },
        domain_contexts: domainContexts,
        metadata: {
          created_at: repLegacy.metadata.created_at,
          updated_at: "2026-06-25T00:00:00Z",
          created_by: repLegacy.metadata.created_by,
          version: "0.2-draft",
          status: "draft",
          source_references: dedupeSourceRefs(
            cluster.members.flatMap((m) => m.legacy.metadata.source_references)
          ),
        },
        ...(reviewerNotes.length ? { _reviewer_note: reviewerNotes.join(" | ") } : {}),
      };
      concepts.push(concept);
    }

    // sort: L4 before L5, then by id
    concepts.sort((a, b) => {
      if (a.resolution_level !== b.resolution_level) return a.resolution_level - b.resolution_level;
      return a.id.localeCompare(b.id);
    });

    const memberFiles = [
      ...new Set(
        units
          .filter((u) => u.parentL3Id === anchor)
          .map((u) => u.sourceFile)
      ),
    ];
    const l4 = concepts.filter((c) => c.resolution_level === 4).length;
    const l5 = concepts.filter((c) => c.resolution_level === 5).length;
    const originalCount = byAnchor.get(anchor)?.length ?? 0;

    anchorBundles.push({
      _meta: {
        anchor_l3_id: anchor,
        anchor_primary_domain: primaryDomain,
        model: "universal-l4-l5",
        migrated_from: memberFiles,
        migration_date: "2026-06-25",
        status: "draft-for-review",
        dedup_summary: `${originalCount} per-context concepts merged into ${concepts.length} universal concepts (${l4} L4 + ${l5} L5).`,
      },
      concepts,
    });
  }

  anchorBundles.sort((a, b) => a._meta.anchor_l3_id.localeCompare(b._meta.anchor_l3_id));

  // dedupe proposals (same member pair)
  const seenProp = new Set<string>();
  const dedupProposals = proposals.filter((p) => {
    const key = p.members.slice().sort().join("|");
    if (seenProp.has(key)) return false;
    seenProp.add(key);
    return true;
  });

  return {
    anchorBundles,
    idRemap,
    proposals: dedupProposals,
    collisions: [...new Set(collisions)],
    unmappedEdges,
  };
}
