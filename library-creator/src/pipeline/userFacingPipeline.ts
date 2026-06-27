import { existsSync } from "node:fs";
import { join } from "node:path";
import { anchorConceptGraphToSpine } from "../extraction/anchorConceptGraphToSpine.js";
import { extractConceptGraph } from "../extraction/extractConceptGraph.js";
import { loadCurriculumLensFile } from "../lens/loadLens.js";
import { ingestText } from "../ingestors/text.js";
import { buildIntentFromDialogue } from "../intent/buildIntentFromDialogue.js";
import { collectIntentDialogue } from "../intent/collectIntentDialogue.js";
import { loadDomainProfile, suggestDomainArchetype } from "../profiles/loadProfile.js";
import type { DomainArchetypeId } from "../types/domainProfile.js";
import { loadSpineIndex } from "../spine/spineIndex.js";
import { buildSourceConfiguration } from "../sources/buildSourceConfiguration.js";
import { resolveSourceText } from "../sources/resolveSourceText.js";
import {
  seedConceptGraphFromSpine,
  type SpineSeedResult,
} from "../sources/seedConceptGraphFromSpine.js";
import type { IntentDialogueAnswers } from "../types/intentDialogue.js";
import type { LibraryCreationIntent } from "../types/intent.js";
import type { SourceConfiguration } from "../types/sourceConfig.js";
import type { GenerationProgressStep, LibraryReviewState } from "../types/reconcile.js";
import type { ParsedSource } from "../types/parsedSource.js";
import type { ConceptGraphDraft } from "../types/draftConcept.js";
import type { CardsQuestionsDraft } from "../types/draftCardQuestion.js";
import type { CurriculumLens } from "../types/curriculumLens.js";
import { buildLibraryReviewState } from "./libraryPreview.js";
import {
  applyDefaultResolutions,
  buildReconcileFlags,
} from "./reconcileFlags.js";
import { selfCorrectFlags } from "./selfCorrectFlags.js";
import { LibraryCreationService } from "./service.js";
import { appendSpineContributionCandidates } from "../spine/spineContributionQueue.js";
import { repoRootFromModule } from "./repoRoot.js";

export const USER_PIPELINE_STAGES = [
  "intent_dialogue",
  "source_configuration",
  "automated_generation",
  "review_reconcile",
  "publish_learn",
] as const;

export type UserPipelineStage = (typeof USER_PIPELINE_STAGES)[number];

export interface UserFacingPipelineResult {
  intent: LibraryCreationIntent;
  sourceConfiguration: SourceConfiguration;
  parsedSource: ParsedSource;
  conceptGraph: ConceptGraphDraft;
  cardsQuestions: CardsQuestionsDraft;
  review: LibraryReviewState;
  jobId: string;
  progress: GenerationProgressStep[];
  placements: ReturnType<typeof anchorConceptGraphToSpine>["placements"];
}

function resolveProfilesDir(repoRoot: string): string | undefined {
  const runtimeProfiles = join(repoRoot, "profiles");
  if (existsSync(runtimeProfiles)) return runtimeProfiles;
  const packageProfiles = join(repoRoot, "library-creator/profiles");
  if (existsSync(packageProfiles)) return packageProfiles;
  return undefined;
}

function defaultProgress(): GenerationProgressStep[] {
  return [
    {
      id: "understand_material",
      label: "Understanding your material…",
      status: "pending",
    },
    {
      id: "map_foundations",
      label: "Mapping to knowledge foundations…",
      status: "pending",
    },
    {
      id: "build_concept_map",
      label: "Building your concept map…",
      status: "pending",
    },
    {
      id: "generate_cards",
      label: "Generating cards and questions…",
      status: "pending",
    },
  ];
}

function setStep(
  steps: GenerationProgressStep[],
  id: GenerationProgressStep["id"],
  status: GenerationProgressStep["status"],
  detail?: string
): GenerationProgressStep[] {
  return steps.map((s) => (s.id === id ? { ...s, status, detail } : s));
}

function buildSeedOriginNote(seed: SpineSeedResult, count: number): string {
  const noun = count === 1 ? "concept" : "concepts";
  const grainHint =
    seed.grain === "chapter"
      ? "These are the main subject areas — pick a topic to go deeper, or paste your own notes to expand the library."
      : "These are chapter-level topics already in our knowledge base — review the selection, or paste your own notes to go deeper.";
  return `We found a selection of ${count} ${seed.scopeLabel} ${noun} that fit what you're looking for. ${grainHint}`;
}

function loadLens(intent: LibraryCreationIntent, repoRoot: string): CurriculumLens | undefined {
  if (!intent.curriculumLensId) return undefined;
  const lensPath = join(repoRoot, "content/lenses", `${intent.curriculumLensId}.json`);
  if (!existsSync(lensPath)) return undefined;
  return loadCurriculumLensFile(lensPath);
}

export interface RunUserPipelineOptions {
  repoRoot?: string;
  jobName?: string;
  dialogueAnswers?: IntentDialogueAnswers;
  intent?: LibraryCreationIntent;
  sourceText: string;
  sourceConfiguration?: SourceConfiguration;
  useAi?: boolean;
  userId?: string;
  onProgress?: (steps: GenerationProgressStep[]) => void;
}

/**
 * Five-stage user-facing library creation pipeline.
 * Wraps the gated LibraryCreationService with spine anchoring and reconcile flags.
 */
export class UserFacingLibraryPipeline {
  private readonly service: LibraryCreationService;
  private readonly repoRoot: string;

  constructor(options?: {
    service?: LibraryCreationService;
    repoRoot?: string;
  }) {
    this.service = options?.service ?? new LibraryCreationService();
    this.repoRoot = options?.repoRoot ?? repoRootFromModule();
  }

  async runFromDialogue(options: RunUserPipelineOptions): Promise<UserFacingPipelineResult> {
    const intent =
      options.intent ??
      (options.dialogueAnswers
        ? buildIntentFromDialogue(options.dialogueAnswers)
        : await collectIntentDialogue());

    return this.runWithIntent(intent, options);
  }

  async runWithIntent(
    intent: LibraryCreationIntent,
    options: Omit<RunUserPipelineOptions, "intent" | "dialogueAnswers">
  ): Promise<UserFacingPipelineResult> {
    const repoRoot = options.repoRoot ?? this.repoRoot;
    let progress = defaultProgress();
    const emit = () => options.onProgress?.(progress);

    const sourceConfiguration =
      options.sourceConfiguration ?? buildSourceConfiguration(intent);

    let lensForSources: CurriculumLens | undefined;
    if (intent.curriculumLensId) {
      const lensPath = join(repoRoot, "content/lenses", `${intent.curriculumLensId}.json`);
      if (existsSync(lensPath)) {
        lensForSources = loadCurriculumLensFile(lensPath);
      }
    }

    const resolvedSourceText = resolveSourceText(
      options.sourceText,
      intent,
      sourceConfiguration,
      { lens: lensForSources }
    );

    progress = setStep(progress, "understand_material", "in_progress");
    emit();

    const parsedSource = ingestText(resolvedSourceText, {
      label: intent.libraryTitle,
    });

    progress = setStep(progress, "understand_material", "complete");
    emit();

    let job = await this.service.createJob(options.jobName ?? intent.libraryTitle);
    job = await this.service.ingestFromText(
      job.id,
      resolvedSourceText,
      intent.libraryTitle
    );
    job = await this.service.approve(job.id, "ingestion");
    job = await this.service.saveIntent(job.id, intent);
    job = await this.service.approve(job.id, "intent");

    const domainProfile = loadDomainProfile(
      suggestDomainArchetype(intent.domain) as DomainArchetypeId,
      resolveProfilesDir(repoRoot)
    );
    job = await this.service.saveDomainProfile(job.id, domainProfile);
    job = await this.service.approve(job.id, "domain_profile");

    progress = setStep(progress, "map_foundations", "in_progress");
    emit();

    // No pasted material → reuse concepts the spine already defines instead of
    // fabricating concepts from the library title or source names.
    const seededFromSpine = options.sourceText.trim()
      ? null
      : seedConceptGraphFromSpine(repoRoot, intent);

    let conceptGraph =
      seededFromSpine?.draft ??
      (await extractConceptGraph(parsedSource, intent, domainProfile, {
        useAi: options.useAi,
      }));

    const spineIndex = loadSpineIndex(repoRoot);
    const anchored = anchorConceptGraphToSpine(conceptGraph, intent, spineIndex, {
      libraryId: conceptGraph.proposedLibraryId,
    });
    conceptGraph = anchored.draft;

    progress = setStep(
      progress,
      "map_foundations",
      "complete",
      `${anchored.anchored_count} anchored · ${anchored.new_concept_count} new`
    );
    progress = setStep(progress, "build_concept_map", "in_progress");
    emit();

    job = await this.service.persistConceptGraph(job.id, conceptGraph);
    job = await this.service.approve(job.id, "concept_graph");

    progress = setStep(progress, "build_concept_map", "complete");
    progress = setStep(progress, "generate_cards", "in_progress");
    emit();

    const lens = loadLens(intent, repoRoot);
    job = await this.service.generateCardsQuestions(job.id, { useAi: options.useAi });
    job = await this.service.approve(job.id, "cards_questions");
    job = await this.service.mapRelationships(job.id);
    job = await this.service.approve(job.id, "relationships");

    conceptGraph = job.artifacts!.conceptGraph!;
    const cardsQuestions = job.artifacts!.cardsQuestions!;

    progress = setStep(progress, "generate_cards", "complete");
    emit();

    let flags = buildReconcileFlags({
      intent,
      conceptGraph,
      placements: anchored.placements,
      cardsQuestions,
      lens,
    });

    flags = selfCorrectFlags(flags).flags;

    const review = buildLibraryReviewState({
      intent,
      conceptGraph,
      cardsQuestions,
      flags,
      lens,
      originNote: seededFromSpine
        ? buildSeedOriginNote(seededFromSpine, conceptGraph.concepts.length)
        : undefined,
    });

    try {
      appendSpineContributionCandidates(repoRoot, conceptGraph, anchored.placements, {
        libraryId: conceptGraph.proposedLibraryId,
        userId: options.userId ?? "local_user",
      });
    } catch {
      // Cloud Functions runtime bundle may be read-only; contribution queue is best-effort.
    }

    return {
      intent,
      sourceConfiguration,
      parsedSource,
      conceptGraph,
      cardsQuestions,
      review,
      jobId: job.id,
      progress,
      placements: anchored.placements,
    };
  }

  /** Apply conservative defaults for unresolved flags and export the library bundle. */
  async publish(jobId: string, review: LibraryReviewState): Promise<{ exportPath: string }> {
    applyDefaultResolutions(review.flags);

    let job = await this.service.exportLibrary(jobId, { publish: true });
    job = await this.service.approve(job.id, "export");

    const record = job.artifacts?.exportRecord;
    if (!record?.artifactPath) {
      throw new Error("Export completed but artifact path is missing.");
    }

    return { exportPath: record.artifactPath };
  }
}

export { buildIntentFromDialogue, buildSourceConfiguration, buildLibraryReviewState };
