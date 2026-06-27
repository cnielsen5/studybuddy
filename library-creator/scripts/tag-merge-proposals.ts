#!/usr/bin/env tsx
/**
 * Tags each merge proposal with a rule_id for rules-based batch review.
 * Does not apply merges — produces tagged JSON for audit.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = join(__dirname, "../..");
const inPath = join(repoRoot, "content/spine/socrates-l4-l5-merge-proposals.json");
const outPath = join(repoRoot, "content/spine/socrates-l4-l5-merge-proposals.tagged.json");

/** Approved governance thresholds (2026-06-25) — see socrates-l4-l5-merge-rules.review.md */
const CROSS_ANCHOR_REJECT_TITLE = 0.55;
const CROSS_ANCHOR_CONSIDER_DEF = 0.45;
const MIG_AUTO_MERGE_TITLE = 0.85;
const MIG_MANUAL_MERGE_MIN = 0.72;

interface Proposal {
  kind: string;
  anchor?: string;
  reason?: string;
  members: string[];
  titleDice?: number;
  defDice?: number;
  sharedNote?: string;
  rule_id?: string;
  rule_action?: string;
}

function slug(id: string): string {
  const m = id.match(/_l[345]_(.+)$/);
  return m ? m[1] : id;
}

function parseTitleDice(reason?: string): number {
  const m = reason?.match(/titleDice=([\d.]+)/);
  return m ? Number(m[1]) : 0;
}

function parseDefDice(reason?: string): number {
  const m = reason?.match(/defDice=([\d.]+)/);
  return m ? Number(m[1]) : 0;
}

/** R-MIG-F: merge clinical + psych pairs within disorder anchors (broad). */
function migFBroadMerge(anchor: string): boolean {
  return [
    "anxiety_disorders",
    "eating_disorders",
    "personality_disorders",
    "schizophrenia_spectrum",
    "substance_use",
  ].some((k) => anchor.includes(k));
}

function tagProposal(p: Proposal): Proposal {
  const td = p.titleDice ?? parseTitleDice(p.reason);
  const dd = p.defDice ?? parseDefDice(p.reason);
  const anchor = p.anchor ?? "";
  const members = p.members ?? [];
  const a = members[0] ?? "";
  const b = members[1] ?? "";
  const sa = slug(a);
  const sb = slug(b);

  if (p.kind === "depth_reconciled") {
    return { ...p, rule_id: "R-DEPTH-1", rule_action: "confirm_l4" };
  }

  if (p.kind === "cross_anchor_shared_note") {
    if (a.includes("dna_double_helix") || b.includes("dna_structure_replication")) {
      return { ...p, rule_id: "R-SN-1", rule_action: "keep_separate_forward_ref" };
    }
    if (a.includes("first_order_elimination") || b.includes("integrated_rate_laws")) {
      return { ...p, rule_id: "R-SN-2", rule_action: "add_context_or_forward_ref" };
    }
    if (a.includes("first_order_reaction") || b.includes("exponential_decay")) {
      return { ...p, rule_id: "R-SN-3", rule_action: "add_context_or_forward_ref" };
    }
    return { ...p, rule_id: "R-SN-0", rule_action: "human_review" };
  }

  if (p.kind === "context_addition") {
    const note = (p.sharedNote ?? "").toLowerCase();
    if (note.includes("psychopathology classification")) {
      return { ...p, rule_id: "R-CTX-2", rule_action: "defer_clinical_context" };
    }
    if (note.includes("merged ") && (note.includes("psych") || note.includes("medicine"))) {
      return { ...p, rule_id: "R-CTX-1", rule_action: "cleanup_note_only" };
    }
    if (note.includes("neural signaling") || note.includes("cardiac")) {
      return { ...p, rule_id: "R-CTX-3", rule_action: "add_context_if_same_mechanism" };
    }
    if (note.includes("mathematically identical") || note.includes("mathematically equivalent")) {
      return { ...p, rule_id: "R-CTX-4", rule_action: "add_domain_context" };
    }
    return { ...p, rule_id: "R-CTX-0", rule_action: "human_review" };
  }

  if (p.kind === "cross_anchor_same_domain") {
    if (td < CROSS_ANCHOR_REJECT_TITLE) {
      return { ...p, rule_id: "R-XA-1", rule_action: "reject_false_positive" };
    }
    if (dd < CROSS_ANCHOR_CONSIDER_DEF) {
      if (td >= 0.7) {
        return { ...p, rule_id: "R-XA-3", rule_action: "reject_def_gate_failed" };
      }
      return { ...p, rule_id: "R-XA-2", rule_action: "reject_medium_band" };
    }
    if (td >= 0.7) {
      return { ...p, rule_id: "R-XA-3", rule_action: "human_review_high_similarity" };
    }
    return { ...p, rule_id: "R-XA-2", rule_action: "human_review_medium_band" };
  }

  if (p.kind === "migration_skipped") {
    if ((p.reason ?? "").includes("auto-merge skipped")) {
      return { ...p, rule_id: "R-MIG-A", rule_action: "keep_separate_collision" };
    }
    if (anchor.includes("hypersensitivity") && sa.includes("type") && sb.includes("type")) {
      const sameType =
        (sa.includes("type_i") && sb.includes("type_i")) ||
        (sa.includes("type_ii") && sb.includes("type_ii")) ||
        (sa.includes("type_iii") && sb.includes("type_iii")) ||
        (sa.includes("type_iv") && sb.includes("type_iv")) ||
        (sa.includes("hypersensitivity_type_i") && sb.includes("type_i")) ||
        (sa.includes("hypersensitivity_type_ii") && sb.includes("type_ii")) ||
        (sa.includes("hypersensitivity_type_iii") && sb.includes("type_iii")) ||
        (sa.includes("hypersensitivity_type_iv") && sb.includes("type_iv"));
      return {
        ...p,
        rule_id: "R-MIG-A",
        rule_action: sameType ? "merge_per_type" : "keep_separate_sibling_types",
      };
    }
    if (
      anchor.includes("action_potential") &&
      [sa, sb].some((s) =>
        ["propagation", "conduction", "saltatory", "signal", "axonal"].some((k) => s.includes(k))
      )
    ) {
      return { ...p, rule_id: "R-MIG-B", rule_action: "keep_separate_atomicity" };
    }
    if (anchor.includes("enzyme_kinetics") || anchor.includes("michaelis")) {
      return { ...p, rule_id: "R-MIG-C", rule_action: "keep_separate_siblings" };
    }
    if (anchor.includes("exponential_decay")) {
      const mergePairs = [
        ["exponential_decay_model", "exponential_decay_law"],
        ["decay_constant_half_life", "half_life_decay_constant"],
      ];
      const shouldMerge = mergePairs.some(
        ([x, y]) => (sa.includes(x) && sb.includes(y)) || (sa.includes(y) && sb.includes(x))
      );
      return {
        ...p,
        rule_id: "R-MIG-D",
        rule_action: shouldMerge ? "merge" : "keep_separate_or_context",
      };
    }
    if (anchor.includes("membrane_potential")) {
      const mergePairs = [
        ["goldman_hodgkin_katz", "goldman_hodgkin_katz_equation"],
        ["sodium_potassium_pump", "na_k_atpase"],
      ];
      const shouldMerge = mergePairs.some(
        ([x, y]) =>
          (sa.includes(x) && sb.includes(y)) ||
          (sa.includes(y) && sb.includes(x)) ||
          sa === sb
      );
      return {
        ...p,
        rule_id: "R-MIG-E",
        rule_action: shouldMerge ? "merge" : "keep_separate",
      };
    }
    if (
      ["anxiety", "personality", "schizophrenia", "eating", "substance"].some((k) =>
        anchor.includes(k)
      )
    ) {
      return {
        ...p,
        rule_id: "R-MIG-F",
        rule_action: migFBroadMerge(anchor)
          ? "merge_clinical_psych_broad"
          : "keep_separate_cross_diagnosis",
      };
    }
    if (td >= MIG_AUTO_MERGE_TITLE) {
      return { ...p, rule_id: "R-MIG-G", rule_action: "merge_auto" };
    }
    if (td >= MIG_MANUAL_MERGE_MIN) {
      return { ...p, rule_id: "R-MIG-G", rule_action: "merge_manual_band" };
    }
    return { ...p, rule_id: "R-MIG-Z", rule_action: "keep_separate_default" };
  }

  return { ...p, rule_id: "UNTAGGED", rule_action: "human_review" };
}

const data = JSON.parse(readFileSync(inPath, "utf8")) as { proposals: Proposal[] };

const tagged = data.proposals.map(tagProposal);
const byRule = new Map<string, number>();
for (const p of tagged) {
  const id = p.rule_id ?? "UNTAGGED";
  byRule.set(id, (byRule.get(id) ?? 0) + 1);
}

writeFileSync(
  outPath,
  `${JSON.stringify({ ...data, proposals: tagged, rule_counts: Object.fromEntries(byRule) }, null, 2)}\n`,
  "utf8"
);

console.log(`Wrote ${outPath}`);
console.log("Rule counts:");
for (const [k, v] of [...byRule.entries()].sort((a, b) => b[1] - a[1])) {
  console.log(`  ${k}: ${v}`);
}
