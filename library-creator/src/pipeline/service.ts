import { ingestText, ingestTextFile, ingestWebsite } from "../ingestors/index.js";
import { mergeParsedSources } from "../ingestors/mergeParsedSources.js";
import { extractConceptGraph } from "../extraction/extractConceptGraph.js";
import {
  formatConceptGraphSummary,
  removeConceptFromDraft,
  validateConceptGraphDraft,
} from "../extraction/conceptGraphValidator.js";
import { generateCardsQuestions } from "../generation/generateCardsQuestions.js";
import {
  formatCardsQuestionsSummary,
  validateCardsQuestionsDraft,
} from "../generation/cardsQuestionsValidator.js";
import { mapRelationships } from "../relationships/mapRelationships.js";
import {
  formatRelationshipsSummary,
  validateRelationshipsDraft,
} from "../relationships/relationshipValidator.js";
import type { ConceptGraphDraft } from "../types/draftConcept.js";
import type { CardsQuestionsDraft } from "../types/draftCardQuestion.js";
import {
  exportLibraryBundle,
  formatLibraryExportSummary,
  validateLibraryBundle,
} from "../export/exportLibrary.js";
import type { RelationshipsDraft } from "../types/draftRelationship.js";
import { RelationshipsDraftSchema } from "../types/draftRelationship.js";
import { LibraryExportRecordSchema } from "../types/libraryBundle.js";
import type { DomainProfile } from "../types/domainProfile.js";
import type { LibraryCreationIntent } from "../types/intent.js";
import type { ParsedSource, SourceRef } from "../types/parsedSource.js";
import {
  createEmptyJob,
  type LibraryCreationJob,
  type PipelineStage,
} from "../types/pipeline.js";
import { ParsedSourceSchema } from "../types/parsedSource.js";
import { LibraryCreationIntentSchema } from "../types/intent.js";
import { DomainProfileSchema } from "../types/domainProfile.js";
import { ConceptGraphDraftSchema } from "../types/draftConcept.js";
import { CardsQuestionsDraftSchema } from "../types/draftCardQuestion.js";
import {
  approveStage,
  assertCurrentStage,
  assertStageApproved,
  markStage,
} from "./gates.js";
import { createJobId, JobStore } from "./jobStore.js";

export const APPROVABLE_STAGES = [
  "ingestion",
  "intent",
  "domain_profile",
  "concept_graph",
  "cards_questions",
  "relationships",
  "export",
] as const;

export type ApprovableStage = (typeof APPROVABLE_STAGES)[number];

export function isApprovableStage(stage: string): stage is ApprovableStage {
  return (APPROVABLE_STAGES as readonly string[]).includes(stage);
}

export class LibraryCreationService {
  constructor(private readonly store: JobStore = new JobStore()) {}

  getStore(): JobStore {
    return this.store;
  }

  async createJob(name: string): Promise<LibraryCreationJob> {
    const job = createEmptyJob(name, createJobId());
    await this.store.save(job);
    return job;
  }

  async getJob(jobId: string): Promise<LibraryCreationJob> {
    return this.store.load(jobId);
  }

  async listJobs(): Promise<LibraryCreationJob[]> {
    const ids = await this.store.listJobIds();
    const jobs = await Promise.all(ids.map((id) => this.store.load(id)));
    return jobs.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async ingestFromUrl(jobId: string, url: string): Promise<LibraryCreationJob> {
    return this.ingestFromUrls(jobId, [url]);
  }

  async ingestFromUrls(
    jobId: string,
    urls: string[],
    options: { label?: string } = {}
  ): Promise<LibraryCreationJob> {
    const job = await this.store.load(jobId);
    assertCurrentStage(job, "ingestion");

    if (urls.length === 0) {
      throw new Error("At least one URL is required");
    }

    const parsedSources = await Promise.all(urls.map((url) => ingestWebsite(url)));
    const parsed =
      parsedSources.length === 1
        ? parsedSources[0]
        : mergeParsedSources(parsedSources, { label: options.label });

    return this.completeIngestion(job, parsed, {
      kind: "url",
      value: urls.length === 1 ? urls[0] : `${urls.length} urls`,
    });
  }

  async ingestFromText(
    jobId: string,
    text: string,
    label?: string
  ): Promise<LibraryCreationJob> {
    const job = await this.store.load(jobId);
    assertCurrentStage(job, "ingestion");

    const parsed = ingestText(text, { label });
    return this.completeIngestion(job, parsed, {
      kind: "paste",
      value: label ?? "pasted-text",
    });
  }

  async ingestFromFile(
    jobId: string,
    filePath: string
  ): Promise<LibraryCreationJob> {
    const job = await this.store.load(jobId);
    assertCurrentStage(job, "ingestion");

    const parsed = await ingestTextFile(filePath);
    return this.completeIngestion(job, parsed, { kind: "file", value: filePath });
  }

  private async completeIngestion(
    job: LibraryCreationJob,
    parsed: ParsedSource,
    sourceRef: Omit<SourceRef, "addedAt">
  ): Promise<LibraryCreationJob> {
    ParsedSourceSchema.parse(parsed);
    const artifactPath = await this.store.saveArtifact(
      job.id,
      "parsed-source.json",
      parsed
    );

    const now = new Date().toISOString();
    const updated = markStage(
      {
        ...job,
        sourceRefs: [...job.sourceRefs, { ...sourceRef, addedAt: now }],
        artifacts: {
          ...job.artifacts,
          parsedSource: parsed,
        },
      },
      "ingestion",
      "awaiting_review",
      artifactPath
    );

    await this.store.save(updated);
    return updated;
  }

  async saveIntent(
    jobId: string,
    intent: LibraryCreationIntent
  ): Promise<LibraryCreationJob> {
    const job = await this.store.load(jobId);
    assertCurrentStage(job, "intent");
    assertStageApproved(job, "ingestion");

    LibraryCreationIntentSchema.parse(intent);
    const artifactPath = await this.store.saveArtifact(jobId, "intent.json", intent);

    const updated = markStage(
      {
        ...job,
        artifacts: {
          ...job.artifacts,
          intent,
        },
      },
      "intent",
      "awaiting_review",
      artifactPath
    );

    await this.store.save(updated);
    return updated;
  }

  async saveDomainProfile(
    jobId: string,
    profile: DomainProfile
  ): Promise<LibraryCreationJob> {
    const job = await this.store.load(jobId);
    assertCurrentStage(job, "domain_profile");
    assertStageApproved(job, "intent");

    DomainProfileSchema.parse(profile);
    const artifactPath = await this.store.saveArtifact(
      jobId,
      "domain-profile.json",
      profile
    );

    const updated = markStage(
      {
        ...job,
        artifacts: {
          ...job.artifacts,
          domainProfile: profile,
        },
      },
      "domain_profile",
      "awaiting_review",
      artifactPath
    );

    await this.store.save(updated);
    return updated;
  }

  async extractConceptGraph(
    jobId: string,
    options: { useAi?: boolean; maxConcepts?: number } = {}
  ): Promise<LibraryCreationJob> {
    const job = await this.store.load(jobId);
    assertCurrentStage(job, "concept_graph");
    assertStageApproved(job, "domain_profile");

    const parsedSource = job.artifacts?.parsedSource;
    const intent = job.artifacts?.intent;
    const domainProfile = job.artifacts?.domainProfile;

    if (!parsedSource || !intent || !domainProfile) {
      throw new Error(
        "Missing parsed source, intent, or domain profile artifacts."
      );
    }

    const draft = await extractConceptGraph(
      parsedSource,
      intent,
      domainProfile,
      options
    );
    const validation = validateConceptGraphDraft(draft);
    if (!validation.valid) {
      const summary = validation.issues
        .filter((i) => i.severity === "error")
        .map((i) => i.message)
        .join("; ");
      throw new Error(`Concept graph validation failed: ${summary}`);
    }

    const draftWithNotes: ConceptGraphDraft = {
      ...draft,
      notes: [
        ...(draft.notes ?? []),
        ...validation.issues
          .filter((i) => i.severity === "warning")
          .map((i) => `Warning: ${i.message}`),
      ],
    };
    ConceptGraphDraftSchema.parse(draftWithNotes);

    const artifactPath = await this.store.saveArtifact(
      jobId,
      "concept-graph.json",
      draftWithNotes
    );

    const updated = markStage(
      {
        ...job,
        artifacts: {
          ...job.artifacts,
          conceptGraph: draftWithNotes,
        },
      },
      "concept_graph",
      "awaiting_review",
      artifactPath
    );

    await this.store.save(updated);
    return updated;
  }

  async removeConcept(
    jobId: string,
    conceptId: string
  ): Promise<LibraryCreationJob> {
    const job = await this.store.load(jobId);
    const draft = job.artifacts?.conceptGraph;
    if (!draft) {
      throw new Error("No concept graph to edit. Run extract-concepts first.");
    }

    const updatedDraft = removeConceptFromDraft(draft, conceptId);
    const validation = validateConceptGraphDraft(updatedDraft);
    if (!validation.valid) {
      throw new Error("Removing this concept would leave an invalid graph");
    }

    const artifactPath = await this.store.saveArtifact(
      jobId,
      "concept-graph.json",
      updatedDraft
    );

    const updated = markStage(
      {
        ...job,
        artifacts: {
          ...job.artifacts,
          conceptGraph: updatedDraft,
        },
      },
      "concept_graph",
      "awaiting_review",
      artifactPath
    );

    await this.store.save(updated);
    return updated;
  }

  async validateConceptGraph(jobId: string) {
    const job = await this.getJob(jobId);
    const draft = job.artifacts?.conceptGraph;
    if (!draft) {
      throw new Error("No concept graph found. Run extract-concepts first.");
    }
    return validateConceptGraphDraft(draft);
  }

  async formatConceptGraphSummary(jobId: string): Promise<string> {
    const job = await this.getJob(jobId);
    const draft = job.artifacts?.conceptGraph;
    if (!draft) {
      throw new Error("No concept graph found. Run extract-concepts first.");
    }
    return formatConceptGraphSummary(draft);
  }

  async generateCardsQuestions(
    jobId: string,
    options: { useAi?: boolean } = {}
  ): Promise<LibraryCreationJob> {
    const job = await this.store.load(jobId);
    assertCurrentStage(job, "cards_questions");
    assertStageApproved(job, "concept_graph");

    const conceptGraph = job.artifacts?.conceptGraph;
    const intent = job.artifacts?.intent;
    const domainProfile = job.artifacts?.domainProfile;

    if (!conceptGraph || !intent || !domainProfile) {
      throw new Error(
        "Missing concept graph, intent, or domain profile artifacts."
      );
    }

    const { draft, concepts } = await generateCardsQuestions(
      conceptGraph,
      intent,
      domainProfile,
      options
    );

    const updatedConceptGraph: ConceptGraphDraft = ConceptGraphDraftSchema.parse({
      ...conceptGraph,
      concepts,
    });

    const validation = validateCardsQuestionsDraft(draft, concepts);
    if (!validation.valid) {
      const summary = validation.issues
        .filter((i) => i.severity === "error")
        .map((i) => i.message)
        .join("; ");
      throw new Error(`Cards/questions validation failed: ${summary}`);
    }

    const draftWithNotes: CardsQuestionsDraft = {
      ...draft,
      notes: [
        ...(draft.notes ?? []),
        ...validation.issues
          .filter((i) => i.severity === "warning")
          .map((i) => `Warning: ${i.message}`),
      ],
    };
    CardsQuestionsDraftSchema.parse(draftWithNotes);

    const conceptGraphPath = await this.store.saveArtifact(
      jobId,
      "concept-graph.json",
      updatedConceptGraph
    );
    const cardsQuestionsPath = await this.store.saveArtifact(
      jobId,
      "cards-questions.json",
      draftWithNotes
    );

    const updated = markStage(
      {
        ...job,
        artifacts: {
          ...job.artifacts,
          conceptGraph: updatedConceptGraph,
          cardsQuestions: draftWithNotes,
        },
      },
      "cards_questions",
      "awaiting_review",
      cardsQuestionsPath
    );

    updated.stages.concept_graph = {
      ...updated.stages.concept_graph,
      artifactPath: conceptGraphPath,
    };

    await this.store.save(updated);
    return updated;
  }

  async validateCardsQuestions(jobId: string) {
    const job = await this.getJob(jobId);
    const draft = job.artifacts?.cardsQuestions;
    const concepts = job.artifacts?.conceptGraph?.concepts;
    if (!draft || !concepts) {
      throw new Error(
        "No cards/questions found. Run generate-cards first."
      );
    }
    return validateCardsQuestionsDraft(draft, concepts);
  }

  async formatCardsQuestionsSummary(jobId: string): Promise<string> {
    const job = await this.getJob(jobId);
    const draft = job.artifacts?.cardsQuestions;
    const concepts = job.artifacts?.conceptGraph?.concepts;
    if (!draft || !concepts) {
      throw new Error(
        "No cards/questions found. Run generate-cards first."
      );
    }
    return formatCardsQuestionsSummary(draft, concepts);
  }

  async mapRelationships(
    jobId: string,
    options: { useAi?: boolean } = {}
  ): Promise<LibraryCreationJob> {
    const job = await this.store.load(jobId);
    assertCurrentStage(job, "relationships");
    assertStageApproved(job, "cards_questions");

    const conceptGraph = job.artifacts?.conceptGraph;
    const intent = job.artifacts?.intent;
    const domainProfile = job.artifacts?.domainProfile;

    if (!conceptGraph || !intent || !domainProfile) {
      throw new Error(
        "Missing concept graph, intent, or domain profile artifacts."
      );
    }

    const { draft, concepts } = await mapRelationships(
      conceptGraph,
      intent,
      domainProfile,
      options
    );

    const updatedConceptGraph: ConceptGraphDraft = ConceptGraphDraftSchema.parse({
      ...conceptGraph,
      concepts,
    });

    const validation = validateRelationshipsDraft(draft, concepts);
    if (!validation.valid) {
      const summary = validation.issues
        .filter((i) => i.severity === "error")
        .map((i) => i.message)
        .join("; ");
      throw new Error(`Relationship validation failed: ${summary}`);
    }

    const draftWithNotes: RelationshipsDraft = {
      ...draft,
      notes: [
        ...(draft.notes ?? []),
        ...validation.issues
          .filter((i) => i.severity === "warning")
          .map((i) => `Warning: ${i.message}`),
      ],
    };
    RelationshipsDraftSchema.parse(draftWithNotes);

    const conceptGraphPath = await this.store.saveArtifact(
      jobId,
      "concept-graph.json",
      updatedConceptGraph
    );
    const relationshipsPath = await this.store.saveArtifact(
      jobId,
      "relationships.json",
      draftWithNotes
    );

    const updated = markStage(
      {
        ...job,
        artifacts: {
          ...job.artifacts,
          conceptGraph: updatedConceptGraph,
          relationships: draftWithNotes,
        },
      },
      "relationships",
      "awaiting_review",
      relationshipsPath
    );

    updated.stages.concept_graph = {
      ...updated.stages.concept_graph,
      artifactPath: conceptGraphPath,
    };

    await this.store.save(updated);
    return updated;
  }

  async validateRelationships(jobId: string) {
    const job = await this.getJob(jobId);
    const draft = job.artifacts?.relationships;
    const concepts = job.artifacts?.conceptGraph?.concepts;
    if (!draft || !concepts) {
      throw new Error("No relationships found. Run map-relationships first.");
    }
    return validateRelationshipsDraft(draft, concepts);
  }

  async formatRelationshipsSummary(jobId: string): Promise<string> {
    const job = await this.getJob(jobId);
    const draft = job.artifacts?.relationships;
    const concepts = job.artifacts?.conceptGraph?.concepts;
    if (!draft || !concepts) {
      throw new Error("No relationships found. Run map-relationships first.");
    }
    return formatRelationshipsSummary(draft, concepts);
  }

  async exportLibrary(
    jobId: string,
    options: { publish?: boolean; version?: string; outPath?: string } = {}
  ): Promise<LibraryCreationJob> {
    const job = await this.store.load(jobId);
    assertCurrentStage(job, "export");
    assertStageApproved(job, "relationships");

    const conceptGraph = job.artifacts?.conceptGraph;
    const cardsQuestions = job.artifacts?.cardsQuestions;
    const relationships = job.artifacts?.relationships;
    const intent = job.artifacts?.intent;

    if (!conceptGraph || !cardsQuestions || !relationships || !intent) {
      throw new Error(
        "Missing concept graph, cards/questions, relationships, or intent artifacts."
      );
    }

    const artifactPath = this.store.artifactPath(jobId, "library.json");
    const { bundle, record } = await exportLibraryBundle(
      {
        job: {
          id: job.id,
          name: job.name,
          createdAt: job.createdAt,
        },
        intent,
        conceptGraph,
        cardsQuestions,
        relationships,
        options: {
          publish: options.publish,
          version: options.version,
        },
      },
      artifactPath,
      options
    );

    LibraryExportRecordSchema.parse(record);

    const updated = markStage(
      {
        ...job,
        artifacts: {
          ...job.artifacts,
          libraryBundle: bundle,
          exportRecord: record,
        },
      },
      "export",
      "awaiting_review",
      artifactPath
    );

    await this.store.save(updated);
    return updated;
  }

  async validateLibraryExport(jobId: string) {
    const job = await this.getJob(jobId);
    const bundle = job.artifacts?.libraryBundle;
    if (!bundle) {
      throw new Error("No library export found. Run export first.");
    }
    return validateLibraryBundle(bundle);
  }

  async formatLibraryExportSummary(jobId: string): Promise<string> {
    const job = await this.getJob(jobId);
    const bundle = job.artifacts?.libraryBundle;
    if (!bundle) {
      throw new Error("No library export found. Run export first.");
    }
    return formatLibraryExportSummary(bundle);
  }

  async approve(
    jobId: string,
    stage: ApprovableStage
  ): Promise<LibraryCreationJob> {
    const job = await this.store.load(jobId);
    let updated = approveStage(job, stage);
    if (stage === "export") {
      updated = {
        ...updated,
        status: "completed",
      };
    }
    await this.store.save(updated);
    return updated;
  }

  /** Re-run ingestion and reset downstream stages (for iterating on extractors). */
  async reingestFromUrl(jobId: string, url: string): Promise<LibraryCreationJob> {
    return this.reingestFromUrls(jobId, [url]);
  }

  async reingestFromUrls(
    jobId: string,
    urls: string[],
    options: { label?: string } = {}
  ): Promise<LibraryCreationJob> {
    let job = await this.store.load(jobId);
    job = resetFromIngestion(job);
    await this.store.save(job);
    return this.ingestFromUrls(jobId, urls, options);
  }

  async reingestFromText(
    jobId: string,
    text: string,
    label?: string
  ): Promise<LibraryCreationJob> {
    let job = await this.store.load(jobId);
    job = resetFromIngestion(job);
    await this.store.save(job);
    return this.ingestFromText(jobId, text, label);
  }
}

function resetFromIngestion(job: LibraryCreationJob): LibraryCreationJob {
  const now = new Date().toISOString();
  return {
    ...job,
    updatedAt: now,
    currentStage: "ingestion",
    status: "in_progress",
    artifacts: {},
    stages: {
      ingestion: { status: "in_progress", updatedAt: now },
      intent: { status: "pending", updatedAt: now },
      domain_profile: { status: "pending", updatedAt: now },
      concept_graph: { status: "pending", updatedAt: now },
      cards_questions: { status: "pending", updatedAt: now },
      relationships: { status: "pending", updatedAt: now },
      export: { status: "pending", updatedAt: now },
    },
  };
}
