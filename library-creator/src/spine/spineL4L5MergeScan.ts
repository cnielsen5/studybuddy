import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { SpineL4L5Concept } from "./spineL4L5Schema.js";

export type MergeProposalKind =
  | "within_anchor"
  | "cross_anchor_same_domain"
  | "cross_anchor_shared_note"
  | "context_addition"
  | "depth_reconciled"
  | "migration_skipped";

export interface MergeProposal {
  id: string;
  kind: MergeProposalKind;
  anchor?: string;
  anchor_b?: string;
  reason: string;
  members: string[];
  titleDice?: number;
  defDice?: number;
  sharedNote?: string;
  suggestedAction: string;
  domains?: string[];
}

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

export function diceCoefficient(a: string, b: string): number {
  const ga = bigrams(a);
  const gb = bigrams(b);
  if (ga.size === 0 || gb.size === 0) return a === b ? 1 : 0;
  let intersection = 0;
  for (const [g, count] of ga) {
    const other = gb.get(g);
    if (other) intersection += Math.min(count, other);
  }
  const total =
    [...ga.values()].reduce((s, v) => s + v, 0) + [...gb.values()].reduce((s, v) => s + v, 0);
  return (2 * intersection) / total;
}

const SPINE_ID_RE = /spine_[a-z0-9_]+/g;

export interface LoadedAnchorConcept extends SpineL4L5Concept {
  _anchor: string;
}

export function loadAllAnchorConcepts(repoRoot: string): LoadedAnchorConcept[] {
  const dir = join(repoRoot, "content/spine/l4-l5-bundles");
  if (!existsSync(dir)) return [];
  const out: LoadedAnchorConcept[] = [];
  for (const name of readdirSync(dir).filter((n) => n.endsWith(".json"))) {
    const bundle = JSON.parse(readFileSync(join(dir, name), "utf8")) as {
      _meta: { anchor_l3_id: string };
      concepts: SpineL4L5Concept[];
    };
    for (const c of bundle.concepts) {
      out.push({ ...c, _anchor: bundle._meta.anchor_l3_id });
    }
  }
  return out;
}

function memberDomains(c: SpineL4L5Concept): Set<string> {
  return new Set(c.domain_contexts.map((dc) => dc.domain_id));
}

function domainsOverlap(a: Set<string>, b: Set<string>): string[] {
  return [...a].filter((d) => b.has(d));
}

function proposalId(kind: string, members: string[]): string {
  return `${kind}:${members.slice().sort().join("|")}`;
}

export interface ScanOptions {
  withinAnchorTitleDice?: number;
  crossAnchorTitleDice?: number;
  crossAnchorDefDice?: number;
  proposeTitleDice?: number;
}

export function scanMergeProposals(
  concepts: LoadedAnchorConcept[],
  options: ScanOptions = {}
): MergeProposal[] {
  const withinThreshold = options.withinAnchorTitleDice ?? 0.45;
  const crossTitleThreshold = options.crossAnchorTitleDice ?? 0.82;
  const crossDefThreshold = options.crossAnchorDefDice ?? 0.75;
  const proposeTitle = options.proposeTitleDice ?? 0.45;

  const proposals: MergeProposal[] = [];
  const seen = new Set<string>();

  const add = (p: MergeProposal) => {
    const key = proposalId(p.kind, p.members);
    if (seen.has(key)) return;
    seen.add(key);
    proposals.push(p);
  };

  // Depth reconciled + migration notes from _reviewer_note
  for (const c of concepts) {
    const note = c._reviewer_note ?? "";
    if (note.includes("DEPTH RECONCILED")) {
      add({
        id: proposalId("depth_reconciled", [c.id]),
        kind: "depth_reconciled",
        anchor: c._anchor,
        reason: "Mixed L4/L5 across contexts; promoted to L4 during migration",
        members: [c.id],
        suggestedAction: "Confirm L4 vs L5 resolution for all member contexts",
        domains: [...memberDomains(c)],
      });
    }
  }

  // Shared concept notes → context addition / cross-anchor proposals
  for (const c of concepts) {
    const note = c.knowledge_graph._shared_concept_note;
    if (!note) continue;
    const refs = [...new Set(note.match(SPINE_ID_RE) ?? [])].filter((id) => id !== c.id);
    if (refs.length > 0) {
      for (const ref of refs) {
        add({
          id: proposalId("cross_anchor_shared_note", [c.id, ref]),
          kind: "cross_anchor_shared_note",
          anchor: c._anchor,
          reason: `_shared_concept_note references ${ref}`,
          members: [c.id, ref],
          sharedNote: note,
          suggestedAction:
            "Add domain context to existing node OR merge with target anchor concept OR add forward reference",
        });
      }
    } else {
      add({
        id: proposalId("context_addition", [c.id]),
        kind: "context_addition",
        anchor: c._anchor,
        reason: "Concept flagged as shared across domains (no explicit spine id in note)",
        members: [c.id],
        sharedNote: note,
        suggestedAction:
          "Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference",
        domains: [...memberDomains(c)],
      });
    }
  }

  // Pairwise similarity scans
  for (let i = 0; i < concepts.length; i++) {
    for (let j = i + 1; j < concepts.length; j++) {
      const a = concepts[i];
      const b = concepts[j];
      const sameAnchor = a._anchor === b._anchor;
      const overlap = domainsOverlap(memberDomains(a), memberDomains(b));
      if (!sameAnchor && overlap.length === 0) continue;
      if (sameAnchor && overlap.length === 0) continue; // different contexts on same anchor — still compare

      const titleDice = diceCoefficient(a.content.title, b.content.title);
      const defDice = diceCoefficient(a.content.definition, b.content.definition);

      if (sameAnchor) {
        // within anchor: different domain members only
        if (overlap.length > 0 && a.id !== b.id) continue; // already merged if same domains... skip same id
        const aDomains = memberDomains(a);
        const bDomains = memberDomains(b);
        const disjoint = [...aDomains].every((d) => !bDomains.has(d));
        if (!disjoint) continue;

        if (titleDice >= crossTitleThreshold || normalize(a.content.title) === normalize(b.content.title)) {
          // would have auto-merged — skip
          continue;
        }
        if (titleDice >= withinThreshold || defDice >= 0.6) {
          add({
            id: proposalId("within_anchor", [a.id, b.id]),
            kind: "within_anchor",
            anchor: a._anchor,
            reason: `Similar concepts on same anchor (titleDice=${titleDice.toFixed(2)}, defDice=${defDice.toFixed(2)})`,
            members: [a.id, b.id],
            titleDice,
            defDice,
            suggestedAction: "Merge into one universal node with multiple domain_contexts[]",
            domains: [...new Set([...aDomains, ...bDomains])],
          });
        }
      } else {
        // cross anchor, must share at least one domain
        if (titleDice >= crossTitleThreshold || defDice >= crossDefThreshold) {
          add({
            id: proposalId("cross_anchor_same_domain", [a.id, b.id]),
            kind: "cross_anchor_same_domain",
            anchor: a._anchor,
            anchor_b: b._anchor,
            reason: `Cross-anchor similarity in shared domain(s): ${overlap.join(", ")} (titleDice=${titleDice.toFixed(2)}, defDice=${defDice.toFixed(2)})`,
            members: [a.id, b.id],
            titleDice,
            defDice,
            suggestedAction:
              "Evaluate merge vs keep separate with forward reference; likely one should gain a domain context on the other's anchor",
            domains: overlap,
          });
        } else if (titleDice >= proposeTitle && overlap.length > 0) {
          add({
            id: proposalId("cross_anchor_same_domain", [a.id, b.id]),
            kind: "cross_anchor_same_domain",
            anchor: a._anchor,
            anchor_b: b._anchor,
            reason: `Possible cross-anchor overlap in ${overlap.join(", ")} (titleDice=${titleDice.toFixed(2)})`,
            members: [a.id, b.id],
            titleDice,
            defDice,
            suggestedAction: "Review for consolidation or shared-context addition",
            domains: overlap,
          });
        }
      }
    }
  }

  return proposals.sort((x, y) => {
    const kindOrder: Record<MergeProposalKind, number> = {
      depth_reconciled: 0,
      cross_anchor_shared_note: 1,
      cross_anchor_same_domain: 2,
      within_anchor: 3,
      context_addition: 4,
      migration_skipped: 5,
    };
    const kd = kindOrder[x.kind] - kindOrder[y.kind];
    if (kd !== 0) return kd;
    return (x.anchor ?? "").localeCompare(y.anchor ?? "");
  });
}

/** Parse migration review markdown proposals into structured entries. */
export function parseMigrationReviewProposals(md: string): MergeProposal[] {
  const proposals: MergeProposal[] = [];
  let currentAnchor = "";
  const lines = md.split("\n");
  for (const line of lines) {
    const anchorMatch = line.match(/^### (spine_[a-z0-9_]+)$/);
    if (anchorMatch) {
      currentAnchor = anchorMatch[1];
      continue;
    }
    if (!line.startsWith("- possible duplicate") && !line.startsWith("- auto-merge skipped")) continue;
    proposals.push({
      id: `migration:${currentAnchor}:${proposals.length}`,
      kind: "migration_skipped",
      anchor: currentAnchor,
      reason: line.replace(/^- /, ""),
      members: [],
      suggestedAction: "Review from migration pass — merge or keep separate",
    });
  }
  // members on following lines: `  - `id``
  let idx = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.startsWith("- possible duplicate") && !line.startsWith("- auto-merge skipped")) continue;
    const members: string[] = [];
    for (let j = i + 1; j < lines.length; j++) {
      const m = lines[j].match(/^  - `(spine_[^`]+)`/);
      if (!m) break;
      members.push(m[1]);
    }
    if (proposals[idx]) proposals[idx].members = members;
    idx++;
  }
  return proposals;
}
