import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  type SpineL4L5AnchorBundle,
  type SpineL4L5Concept,
  type SpineL4L5DomainContext,
  type SpineL4L5UnlockRef,
  isForwardRef,
  unlockRefId,
  validateSpineL4L5AnchorBundle,
} from "./spineL4L5Schema.js";
import { reconcileConceptContexts } from "./spineL4L5Bundler.js";

const BUNDLE_DIR = "content/spine/l4-l5-bundles";

const MERGE_ACTIONS = new Set([
  "merge",
  "merge_auto",
  "merge_manual_band",
  "merge_per_type",
  "merge_clinical_psych_broad",
]);

export interface TaggedProposal {
  id: string;
  kind: string;
  anchor?: string;
  anchor_b?: string;
  reason?: string;
  members: string[];
  sharedNote?: string;
  rule_id?: string;
  rule_action?: string;
}

export interface ApplyMergeRulesResult {
  mergesApplied: number;
  mergesSkipped: Array<{ proposalId: string; reason: string }>;
  notesCleaned: number;
  forwardRefsAdded: number;
  bundlesWritten: number;
}

interface ConceptRef {
  anchor: string;
  bundle: SpineL4L5AnchorBundle;
  index: number;
  concept: SpineL4L5Concept;
}

function collectBundleFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => join(dir, name));
}

function extractSlug(id: string): string {
  const m = id.match(/_l[345]_(.+)$/);
  return m ? m[1] : id;
}

function extractHypersensitivityType(id: string): string | null {
  const slug = extractSlug(id);
  const h = slug.match(/hypersensitivity_type_([iv]+)/);
  if (h) return h[1];
  const t = slug.match(/type_([iv]+)/);
  return t ? t[1] : null;
}

function mergeUnlocks(lists: SpineL4L5UnlockRef[][]): SpineL4L5UnlockRef[] {
  const byId = new Map<string, SpineL4L5UnlockRef>();
  for (const list of lists) {
    for (const ref of list) {
      const id = unlockRefId(ref);
      const existing = byId.get(id);
      if (!existing) byId.set(id, ref);
      else if (isForwardRef(ref) && !isForwardRef(existing)) byId.set(id, ref);
    }
  }
  return [...byId.values()];
}

function dedupeSourceRefs(
  refs: SpineL4L5Concept["metadata"]["source_references"]
): SpineL4L5Concept["metadata"]["source_references"] {
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

function survivorScore(concept: SpineL4L5Concept): number {
  const slug = extractSlug(concept.id);
  let score = 0;
  if (slug.includes("hypersensitivity_type_")) score += 20;
  if (slug.includes("clusters")) score += 14;
  if (slug.includes("disorder")) score += 15;
  if (slug.includes("features")) score += 10;
  if (slug.includes("presentation")) score += 9;
  if (slug.includes("symptoms")) score += 8;
  if (slug.includes("clusters")) score += 7;
  if (concept.domain_contexts.some((d) => d.domain_id === "medicine_clinical")) score += 5;
  if (concept.domain_contexts.some((d) => d.domain_id === "psychology_neuroscience")) score += 3;
  score += concept.domain_contexts.length;
  score += concept.content.definition.length / 500;
  return score;
}

function pickSurvivor(a: SpineL4L5Concept, b: SpineL4L5Concept): [SpineL4L5Concept, SpineL4L5Concept] {
  return survivorScore(a) >= survivorScore(b) ? [a, b] : [b, a];
}

function mergeDomainContexts(
  primary: SpineL4L5DomainContext[],
  secondary: SpineL4L5DomainContext[]
): SpineL4L5DomainContext[] {
  const byDomain = new Map(primary.map((d) => [d.domain_id, d]));
  for (const ctx of secondary) {
    if (!byDomain.has(ctx.domain_id)) byDomain.set(ctx.domain_id, ctx);
  }
  return [...byDomain.values()].sort((a, b) => a.domain_id.localeCompare(b.domain_id));
}

function mergeConceptPair(
  survivor: SpineL4L5Concept,
  absorbed: SpineL4L5Concept,
  primaryDomain: string
): SpineL4L5Concept {
  const resolutionLevel: 4 | 5 =
    survivor.resolution_level === 4 || absorbed.resolution_level === 4 ? 4 : 5;

  const selfId = survivor.id;
  const prereqSet = new Set([
    ...survivor.dependency_graph.prerequisites,
    ...absorbed.dependency_graph.prerequisites,
  ]);
  const mergedUnlocks = mergeUnlocks([
    survivor.dependency_graph.unlocks,
    absorbed.dependency_graph.unlocks,
  ]);

  const cleanPrereqs = [...prereqSet].filter((p) => p !== selfId && p !== absorbed.id);
  const cleanUnlocks = mergedUnlocks.filter(
    (u) => unlockRefId(u) !== selfId && unlockRefId(u) !== absorbed.id
  );

  const domainContexts = mergeDomainContexts(
    survivor.domain_contexts,
    absorbed.domain_contexts
  ).map((dc) => ({
    ...dc,
    dependency_graph: {
      prerequisites_in_context: [
        ...new Set(
          dc.dependency_graph.prerequisites_in_context.filter(
            (p) => p !== selfId && p !== absorbed.id
          )
        ),
      ],
      unlocks_in_context: dc.dependency_graph.unlocks_in_context.filter(
        (u) => unlockRefId(u) !== selfId && unlockRefId(u) !== absorbed.id
      ),
    },
  }));

  const sharedNotes = [
    survivor.knowledge_graph._shared_concept_note,
    absorbed.knowledge_graph._shared_concept_note,
  ].filter((n): n is string => Boolean(n));

  const reviewerBits = [
    survivor._reviewer_note,
    absorbed._reviewer_note,
    `MERGED ${absorbed.id} into ${survivor.id} (rules apply pass)`,
  ].filter((n): n is string => Boolean(n));

  const rep =
    survivor.content.definition.length >= absorbed.content.definition.length
      ? survivor
      : absorbed;

  return {
    ...survivor,
    resolution_level: resolutionLevel,
    content: rep.content,
    knowledge_graph: {
      ...survivor.knowledge_graph,
      primary_domain: primaryDomain,
      _shared_concept_note: sharedNotes[0] ?? null,
    },
    dependency_graph: {
      parent_concept_id: survivor.dependency_graph.parent_concept_id,
      prerequisites: cleanPrereqs,
      unlocks: cleanUnlocks,
    },
    domain_contexts: domainContexts,
    metadata: {
      ...survivor.metadata,
      updated_at: new Date().toISOString(),
      source_references: dedupeSourceRefs([
        ...survivor.metadata.source_references,
        ...absorbed.metadata.source_references,
      ]),
    },
    _reviewer_note: reviewerBits.join(" | "),
  };
}

function remapRef(ref: SpineL4L5UnlockRef, remap: Map<string, string>): SpineL4L5UnlockRef {
  if (typeof ref === "string") return remap.get(ref) ?? ref;
  const mapped = remap.get(ref.concept_id) ?? ref.concept_id;
  return { concept_id: mapped, _forward_reference: ref._forward_reference };
}

function remapConceptIds(concept: SpineL4L5Concept, remap: Map<string, string>): SpineL4L5Concept {
  const mapId = (id: string) => remap.get(id) ?? id;
  return {
    ...concept,
    dependency_graph: {
      parent_concept_id: mapId(concept.dependency_graph.parent_concept_id),
      prerequisites: concept.dependency_graph.prerequisites.map(mapId),
      unlocks: concept.dependency_graph.unlocks.map((u) => remapRef(u, remap)),
    },
    domain_contexts: concept.domain_contexts.map((dc) => ({
      ...dc,
      dependency_graph: {
        prerequisites_in_context: dc.dependency_graph.prerequisites_in_context.map(mapId),
        unlocks_in_context: dc.dependency_graph.unlocks_in_context.map((u) => remapRef(u, remap)),
      },
    })),
  };
}

function cleanupSharedNote(note: string | null | undefined): string | null {
  if (!note) return null;
  let cleaned = note
    .replace(/^Merged [^(]+\([^)]+\)(?:,\s*[^(]+\([^)]+\))*\.\s*/i, "")
    .replace(/^Merged [^.]+\.\s*/i, "")
    .replace(/\(merged duplicate[^)]*\)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length < 12) return null;
  return cleaned;
}

function cleanupReviewerNote(note: string | null | undefined): string | undefined {
  if (!note) return undefined;
  const parts = note
    .split("|")
    .map((p) => p.trim())
    .filter(
      (p) =>
        p &&
        !/^MERGED from \d+ contexts:/i.test(p) &&
        !/^Shared L3 anchor/i.test(p) &&
        !/^DEPTH RECONCILED:/i.test(p) &&
        !/ \(rules apply pass\)$/i.test(p)
    );
  return parts.length ? parts.join(" | ") : undefined;
}

function stripSelfReferences(concept: SpineL4L5Concept): SpineL4L5Concept {
  const id = concept.id;
  return {
    ...concept,
    dependency_graph: {
      ...concept.dependency_graph,
      prerequisites: concept.dependency_graph.prerequisites.filter((p) => p !== id),
      unlocks: concept.dependency_graph.unlocks.filter((u) => unlockRefId(u) !== id),
    },
    domain_contexts: concept.domain_contexts.map((dc) => ({
      ...dc,
      dependency_graph: {
        prerequisites_in_context: dc.dependency_graph.prerequisites_in_context.filter(
          (p) => p !== id
        ),
        unlocks_in_context: dc.dependency_graph.unlocks_in_context.filter(
          (u) => unlockRefId(u) !== id
        ),
      },
    })),
  };
}

function addForwardRefToUnlocks(
  unlocks: SpineL4L5UnlockRef[],
  targetId: string
): SpineL4L5UnlockRef[] {
  if (unlocks.some((u) => unlockRefId(u) === targetId)) return unlocks;
  return [...unlocks, { concept_id: targetId, _forward_reference: true }];
}

function shouldMergeProposal(p: TaggedProposal): boolean {
  if (!p.rule_action) return false;
  if (p.rule_action === "merge_per_type") {
    const [a, b] = p.members;
    const ta = extractHypersensitivityType(a);
    const tb = extractHypersensitivityType(b);
    return Boolean(ta && tb && ta === tb);
  }
  if (p.rule_action === "keep_separate_collision") return false;
  return MERGE_ACTIONS.has(p.rule_action);
}

function buildConceptIndex(bundles: Map<string, SpineL4L5AnchorBundle>): Map<string, ConceptRef> {
  const index = new Map<string, ConceptRef>();
  for (const [anchor, bundle] of bundles) {
    bundle.concepts.forEach((concept, i) => {
      index.set(concept.id, { anchor, bundle, index: i, concept });
    });
  }
  return index;
}

function resolveConceptId(
  proposedId: string,
  anchor: string | undefined,
  index: Map<string, ConceptRef>,
  bundles: Map<string, SpineL4L5AnchorBundle>
): string | null {
  if (index.has(proposedId)) return proposedId;

  const slug = extractSlug(proposedId);
  const levelMatch = proposedId.match(/_l([45])_/);
  const level = levelMatch ? (Number(levelMatch[1]) as 4 | 5) : null;

  const searchAnchors = anchor ? [anchor] : [...bundles.keys()];
  for (const a of searchAnchors) {
    const bundle = bundles.get(a);
    if (!bundle) continue;
    for (const c of bundle.concepts) {
      if (extractSlug(c.id) === slug) return c.id;
      if (level && c.resolution_level === level && extractSlug(c.id) === slug) return c.id;
    }
    // legacy medicine_clinical id → concept with that slug + medicine_clinical context
    if (proposedId.includes("medicine_clinical")) {
      for (const c of bundle.concepts) {
        if (
          c.domain_contexts.some((d) => d.domain_id === "medicine_clinical") &&
          (extractSlug(c.id) === slug ||
            c.domain_contexts.some((d) => normalizeSlug(d.framing.title_in_context) === normalizeSlug(slug)))
        ) {
          if (slug.includes("generalized_anxiety_disorder") && c.id.includes("generalized_anxiety_disorder"))
            return c.id;
          if (slug.includes("phobia") && c.id.includes("phobia")) return c.id;
          if (slug.includes("eating_disorder") && extractSlug(c.id).includes("eating")) return c.id;
          if (slug.includes("personality") && extractSlug(c.id).includes("personality")) return c.id;
          if (slug.includes("borderline") && extractSlug(c.id).includes("borderline")) return c.id;
          if (slug.includes("negative_symptom") && extractSlug(c.id).includes("negative")) return c.id;
          if (slug.includes("ssri") && extractSlug(c.id).includes("anxiety")) return c.id;
        }
      }
    }
  }
  return null;
}

function normalizeSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

export function applyMergeRules(
  repoRoot: string,
  proposals: TaggedProposal[]
): ApplyMergeRulesResult {
  const bundleDir = join(repoRoot, BUNDLE_DIR);
  const bundles = new Map<string, SpineL4L5AnchorBundle>();

  for (const filePath of collectBundleFiles(bundleDir)) {
    const bundle = validateSpineL4L5AnchorBundle(
      JSON.parse(readFileSync(filePath, "utf8"))
    );
    bundles.set(bundle._meta.anchor_l3_id, bundle);
  }

  let index = buildConceptIndex(bundles);
  const mergesSkipped: ApplyMergeRulesResult["mergesSkipped"] = [];
  let mergesApplied = 0;

  // Union-find for merge chains
  const parent = new Map<string, string>();
  const find = (id: string): string => {
    const p = parent.get(id) ?? id;
    if (p === id) return id;
    const root = find(p);
    parent.set(id, root);
    return root;
  };
  const union = (a: string, b: string) => {
    const ra = find(a);
    const rb = find(b);
    if (ra !== rb) parent.set(rb, ra);
  };

  const mergePairs: Array<{ a: string; b: string; proposalId: string; anchor?: string }> = [];

  for (const p of proposals) {
    if (!shouldMergeProposal(p)) continue;
    if (p.members.length < 2) continue;

    const anchor = p.anchor;
    const idA = resolveConceptId(p.members[0], anchor, index, bundles);
    const idB = resolveConceptId(p.members[1], anchor ?? p.anchor_b, index, bundles);

    if (!idA || !idB) {
      mergesSkipped.push({
        proposalId: p.id,
        reason: `Could not resolve members: ${p.members.join(", ")}`,
      });
      continue;
    }
    if (idA === idB) {
      mergesSkipped.push({ proposalId: p.id, reason: "Already same concept" });
      continue;
    }

    const refA = index.get(idA);
    const refB = index.get(idB);
    if (!refA || !refB) {
      mergesSkipped.push({ proposalId: p.id, reason: "Concept not in index" });
      continue;
    }
    if (refA.anchor !== refB.anchor) {
      mergesSkipped.push({ proposalId: p.id, reason: "Cross-anchor merge not supported" });
      continue;
    }

    // domain-disjoint guard (same as migration)
    const domainsA = new Set(refA.concept.domain_contexts.map((d) => d.domain_id));
    const domainsB = new Set(refB.concept.domain_contexts.map((d) => d.domain_id));
    let domainOverlap = false;
    for (const d of domainsB) if (domainsA.has(d)) domainOverlap = true;
    if (domainOverlap) {
      mergesSkipped.push({ proposalId: p.id, reason: "Same-domain context collision" });
      continue;
    }

    mergePairs.push({ a: idA, b: idB, proposalId: p.id, anchor: refA.anchor });
    union(idA, idB);
  }

  // Apply merges by cluster
  const clusters = new Map<string, Set<string>>();
  for (const { a, b } of mergePairs) {
    const root = find(a);
    const set = clusters.get(root) ?? new Set<string>();
    set.add(a);
    set.add(b);
    clusters.set(root, set);
  }

  const globalRemap = new Map<string, string>();

  for (const memberIds of clusters.values()) {
    const refs = [...memberIds]
      .map((id) => index.get(id))
      .filter((r): r is ConceptRef => Boolean(r));
    if (refs.length < 2) continue;

    const anchor = refs[0].anchor;
    const bundle = bundles.get(anchor)!;
    const primaryDomain = bundle._meta.anchor_primary_domain;

    const concepts = refs.map((r) => r.concept);
    let survivor = [...concepts].sort((a, b) => survivorScore(b) - survivorScore(a))[0];
    const absorbed = concepts.filter((c) => c.id !== survivor.id);

    for (const other of absorbed) {
      survivor = mergeConceptPair(survivor, other, primaryDomain);
      globalRemap.set(other.id, survivor.id);
    }

    const removeIds = new Set(absorbed.map((c) => c.id));
    bundle.concepts = bundle.concepts
      .map((c) => (c.id === survivor.id ? survivor : c))
      .filter((c) => !removeIds.has(c.id));
    mergesApplied += absorbed.length;

    index = buildConceptIndex(bundles);
  }

  // Remap all references across bundles
  if (globalRemap.size > 0) {
    for (const [anchor, bundle] of bundles) {
      bundle.concepts = reconcileConceptContexts(
        bundle.concepts.map((c) => remapConceptIds(c, globalRemap))
      );
      bundles.set(anchor, bundle);
    }
    index = buildConceptIndex(bundles);
  }

  // CTX-1: cleanup merge boilerplate notes
  let notesCleaned = 0;
  for (const p of proposals) {
    if (p.rule_action !== "cleanup_note_only") continue;
    for (const member of p.members) {
      const id = resolveConceptId(member, p.anchor, index, bundles);
      if (!id) continue;
      const ref = index.get(id);
      if (!ref) continue;
      const cleaned = cleanupSharedNote(ref.concept.knowledge_graph._shared_concept_note);
      if (cleaned !== ref.concept.knowledge_graph._shared_concept_note) {
        ref.concept.knowledge_graph._shared_concept_note = cleaned;
        notesCleaned++;
      }
    }
  }

  // Forward refs: R-SN-1, R-SN-2, R-SN-3
  let forwardRefsAdded = 0;
  for (const p of proposals) {
    if (p.rule_action === "keep_separate_forward_ref" && p.members.length >= 2) {
      const fromId = resolveConceptId(p.members[0], p.anchor, index, bundles);
      const toId = p.members[1].startsWith("spine_") ? p.members[1] : null;
      if (!fromId || !toId) continue;
      const ref = index.get(fromId);
      if (!ref) continue;
      const before = ref.concept.dependency_graph.unlocks.length;
      ref.concept.dependency_graph.unlocks = addForwardRefToUnlocks(
        ref.concept.dependency_graph.unlocks,
        toId
      );
      if (ref.concept.dependency_graph.unlocks.length > before) forwardRefsAdded++;
    }
    if (p.rule_action === "add_context_or_forward_ref" && p.members.length >= 2) {
      const fromId = resolveConceptId(p.members[0], p.anchor, index, bundles);
      const toTarget = p.members[1];
      if (!fromId) continue;
      const ref = index.get(fromId);
      if (!ref) continue;
      const before = ref.concept.dependency_graph.unlocks.length;
      ref.concept.dependency_graph.unlocks = addForwardRefToUnlocks(
        ref.concept.dependency_graph.unlocks,
        toTarget
      );
      if (ref.concept.dependency_graph.unlocks.length > before) forwardRefsAdded++;
    }
  }

  // Write bundles
  let bundlesWritten = 0;
  for (const filePath of collectBundleFiles(bundleDir)) {
    const bundle = validateSpineL4L5AnchorBundle(
      JSON.parse(readFileSync(filePath, "utf8"))
    );
    const updated = bundles.get(bundle._meta.anchor_l3_id);
    if (!updated) continue;
    updated.concepts = reconcileConceptContexts(
      updated.concepts.map(stripSelfReferences)
    );
    updated._meta.status = "draft-rules-applied";
    writeFileSync(filePath, `${JSON.stringify(updated, null, 2)}\n`, "utf8");
    bundlesWritten++;
  }

  return {
    mergesApplied,
    mergesSkipped,
    notesCleaned,
    forwardRefsAdded,
    bundlesWritten,
  };
}
