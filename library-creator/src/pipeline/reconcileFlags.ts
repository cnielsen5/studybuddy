import type { ConceptPlacementRecord } from "../extraction/anchorConceptGraphToSpine.js";
import type { ConceptGraphDraft, DraftConcept } from "../types/draftConcept.js";
import type { CardsQuestionsDraft } from "../types/draftCardQuestion.js";
import type { LibraryCreationIntent } from "../types/intent.js";
import type { CurriculumLens } from "../types/curriculumLens.js";
import type { ReconcileFlag } from "../types/reconcile.js";

export interface BuildReconcileFlagsInput {
  intent: LibraryCreationIntent;
  conceptGraph: ConceptGraphDraft;
  placements: ConceptPlacementRecord[];
  cardsQuestions?: CardsQuestionsDraft;
  lens?: CurriculumLens;
}

function flagId(prefix: string, index: number): string {
  return `flag_${prefix}_${index}`;
}

function conceptMatchesScopeBoundary(title: string, boundaries: string[]): boolean {
  const lower = title.toLowerCase();
  return boundaries.some((b) => {
    const token = b.toLowerCase().trim();
    return token.length > 2 && lower.includes(token);
  });
}

function buildScopeQuestionFlags(
  concepts: DraftConcept[],
  intent: LibraryCreationIntent
): ReconcileFlag[] {
  if (!intent.scopeNotes?.trim() && intent.scopeBoundaries.length === 0) {
    return [];
  }

  const flags: ReconcileFlag[] = [];
  let index = 0;

  for (const concept of concepts) {
    if (intent.scopeBoundaries.some((b) => conceptMatchesScopeBoundary(concept.content.title, [b]))) {
      continue;
    }

    const scopeHint = intent.scopeNotes?.trim();
    if (!scopeHint) continue;

    const suspicious =
      /basic science|anatomy review|gait|biostat|research methods/i.test(
        concept.content.title
      ) && /part i|written exam|clinical only|skip anatomy/i.test(scopeHint);

    if (!suspicious) continue;

    flags.push({
      id: flagId("scope", index++),
      type: "scope_question",
      conceptId: concept.id,
      title: "Quick question",
      body:
        `We found content about "${concept.content.title}" in your sources, but it may be outside the scope of "${scopeHint.slice(0, 80)}".\n\n` +
        `${concept.content.summary.slice(0, 280)}`,
      sourceHint: concept.provenance?.sourceSectionTitle,
      defaultResolution: "include",
      resolution: "pending",
      primaryAction: "Include it",
      secondaryAction: "Leave it out",
    });
  }

  return flags;
}

function buildNewConceptFlags(placements: ConceptPlacementRecord[]): ReconcileFlag[] {
  const flags: ReconcileFlag[] = [];
  let index = 0;

  for (const row of placements) {
    const rec = row.proposal.recommendation;
    if (
      rec !== "create_l3_node" &&
      rec !== "create_l4_child" &&
      rec !== "create_l5_child" &&
      rec !== "human_review"
    ) {
      continue;
    }
    if (row.anchored) continue;

    flags.push({
      id: flagId("new", index++),
      type: "new_concept_confirmation",
      conceptId: row.concept_id,
      title: "New concept created",
      body:
        `We created a concept for something not yet in our knowledge base:\n\n"${row.title}"\n\n` +
        `${row.proposal.rationale}`,
      defaultResolution: "confirmed",
      resolution: "pending",
      primaryAction: "Looks good",
      secondaryAction: "Remove",
    });
  }

  return flags;
}

function buildMissingCoverageFlags(
  conceptGraph: ConceptGraphDraft,
  lens: CurriculumLens | undefined
): ReconcileFlag[] {
  if (!lens) return [];

  const mappedSpineIds = new Set(
    lens.concept_mappings.map((m) => m.spine_concept_id)
  );
  const generatedAnchors = new Set(
    conceptGraph.concepts.map((c) => c.anchor_concept_id).filter(Boolean) as string[]
  );

  const missing = [...mappedSpineIds].filter((id) => !generatedAnchors.has(id));
  if (missing.length === 0) return [];

  const highYieldMissing = lens.concept_mappings
    .filter(
      (m) =>
        missing.includes(m.spine_concept_id) && m.lens_specific.high_yield_in_lens
    )
    .slice(0, 3);

  if (highYieldMissing.length === 0) return [];

  const flags: ReconcileFlag[] = [];
  let index = 0;

  for (const mapping of highYieldMissing) {
    const section = lens.sections.find((s) => s.id === mapping.section_id);
    flags.push({
      id: flagId("gap", index++),
      type: "missing_coverage",
      title: "We noticed a gap",
      body:
        `Your library doesn't yet include spine topic "${mapping.spine_concept_id.replace(/^spine_[a-z]+_l[0-9]+_/, "").replace(/_/g, " ")}"` +
        (section ? ` (${section.title})` : "") +
        `, which is high-yield in ${lens.name}. We can add foundational coverage from curated sources, or skip if you already know this material.`,
      defaultResolution: "add_coverage",
      resolution: "pending",
      primaryAction: "Add foundational coverage",
      secondaryAction: "I know this",
    });
  }

  return flags.slice(0, 5);
}

/** Stage 4 — build user-facing reconcile flags from generation output. */
export function buildReconcileFlags(input: BuildReconcileFlagsInput): ReconcileFlag[] {
  const { intent, conceptGraph, placements, lens } = input;

  return [
    ...buildScopeQuestionFlags(conceptGraph.concepts, intent),
    ...buildMissingCoverageFlags(conceptGraph, lens),
    ...buildNewConceptFlags(placements),
  ];
}

export function applyDefaultResolutions(flags: ReconcileFlag[]): ReconcileFlag[] {
  return flags.map((flag) => {
    if (flag.resolution !== "pending") return flag;
    switch (flag.defaultResolution) {
      case "include":
      case "add_coverage":
      case "confirmed":
        return { ...flag, resolution: flag.defaultResolution };
      default:
        return flag;
    }
  });
}

export function countPendingFlags(flags: ReconcileFlag[]): number {
  return flags.filter((f) => f.resolution === "pending").length;
}
