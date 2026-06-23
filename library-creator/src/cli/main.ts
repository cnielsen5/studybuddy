#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { collectLibraryCreationIntent } from "../intent/collectIntent.js";
import { collectDomainProfile } from "../domain-profile/collectDomainProfile.js";
import { PipelineGateError } from "../pipeline/gates.js";
import {
  isApprovableStage,
  LibraryCreationService,
} from "../pipeline/service.js";
import {
  loadDomainProfile,
  suggestDomainArchetype,
} from "../profiles/loadProfile.js";
import type { PipelineStage } from "../types/pipeline.js";
import { PIPELINE_STAGES } from "../types/pipeline.js";

const service = new LibraryCreationService();

const JOB_ID_PATTERN = /^lc_[a-z0-9]{8,24}$/;

function parseJobId(raw: string): string {
  const jobId = raw.trim();
  if (!JOB_ID_PATTERN.test(jobId)) {
    throw new Error(
      `Invalid job id "${raw}". Expected format like lc_mqr948xw7tms8u.\n` +
        `Run: npm run cli -- list`
    );
  }
  return jobId;
}

async function loadJobOrHint(jobId: string) {
  try {
    return await service.getJob(jobId);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      throw new Error(
        `Job not found: ${jobId}\nRun: npm run cli -- list`
      );
    }
    throw error;
  }
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === "help" || command === "--help") {
    printHelp();
    return;
  }

  try {
    switch (command) {
      case "create":
        await cmdCreate(args);
        break;
      case "list":
        await cmdList();
        break;
      case "status":
        await cmdStatus(parseJobId(requireArg(args, "job id")));
        break;
      case "show":
        await cmdShow(parseJobId(requireArg(args, "job id")), args[1]);
        break;
      case "ingest":
        await cmdIngest(args);
        break;
      case "reingest":
        await cmdReingest(args);
        break;
      case "intent":
        await cmdIntent(parseJobId(requireArg(args, "job id")));
        break;
      case "domain-profile":
        await cmdDomainProfile(parseJobId(requireArg(args, "job id")));
        break;
      case "extract-concepts":
        await cmdExtractConcepts(args);
        break;
      case "concepts":
        await cmdConcepts(args);
        break;
      case "generate-cards":
        await cmdGenerateCards(args);
        break;
      case "cards":
        await cmdCards(args);
        break;
      case "map-relationships":
        await cmdMapRelationships(args);
        break;
      case "relationships":
        await cmdRelationships(args);
        break;
      case "export":
        await cmdExport(args);
        break;
      case "approve":
        await cmdApprove(
          parseJobId(requireArg(args, "job id")),
          requireArg(args.slice(1), "stage")
        );
        break;
      case "profile":
        await cmdProfile(args);
        break;
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    if (error instanceof PipelineGateError) {
      console.error(`\n✗ ${error.message}`);
      process.exitCode = 1;
      return;
    }
    throw error;
  }
}

function printHelp(): void {
  console.log(`
StudyBuddy Library Creator (CLI — Option B)

Commands:
  create <name>                 Start a new library creation job
  list                          List local jobs
  status <jobId>                Show pipeline status
  show <jobId> [stage]          Print artifact JSON
  ingest <jobId> --url <url>    Ingest a single web page
  ingest <jobId> --urls a,b,c   Ingest multiple pages (merged source)
  ingest <jobId> --url-file f   Ingest URLs listed in a file (one per line)
  reingest <jobId> --url ...    Re-ingest (same URL flags as ingest)
  ingest <jobId> --text <...>   Ingest pasted text/markdown
  ingest <jobId> --file <path>  Ingest a .txt / .md file
  intent <jobId>                Run the intent questionnaire
  domain-profile <jobId>        Choose domain archetype (stage 3)
  extract-concepts <jobId>      Extract draft concept graph (stage 4)
    [--ai]                      Use OpenAI when OPENAI_API_KEY is set
  concepts list <jobId>         Human-readable concept graph summary
  concepts validate <jobId>     Validate concept graph (errors + warnings)
  concepts remove <jobId> <id>  Remove a draft concept by id
  generate-cards <jobId>        Generate draft cards + questions (stage 5)
    [--ai]                      Reserved for future OpenAI generation
  cards list <jobId>            Human-readable cards/questions summary
  cards validate <jobId>        Validate cards/questions draft
  map-relationships <jobId>     Map concept graph edges (stage 6)
    [--ai]                      Reserved for future OpenAI mapping
  relationships list <jobId>    Human-readable relationship summary
  relationships validate <jobId> Validate relationship graph consistency
  export <jobId>                Export Golden Master library.json (stage 7)
    [--publish]                 Mark bundle status as published
    [--version <semver>]        Manifest version (default 0.1.0)
    [--out <path>]              Also write library.json to this path
  export validate <jobId>       Re-run library conformance checks
  export summary <jobId>        Print export stats
  approve <jobId> <stage>       Approve any stage through export
  profile suggest <domain>      Preview suggested domain archetype

Pipeline after intent:
  approve <jobId> intent
  domain-profile <jobId>
  approve <jobId> domain_profile
  extract-concepts <jobId>
  approve <jobId> concept_graph
  generate-cards <jobId>
  approve <jobId> cards_questions
  map-relationships <jobId>
  approve <jobId> relationships
  export <jobId>
  approve <jobId> export

Examples:
  npm run cli -- create "OpenStax Anatomy Sample"
  npm run cli -- list
  npm run cli -- ingest lc_mqr948xw7tms8u --url https://openstax.org/books/anatomy-and-physiology/pages/1-introduction
  npm run cli -- ingest lc_mqr948xw7tms8u --urls "https://.../1-introduction,https://.../1-1-overview"
  npm run cli -- concepts list lc_mqr948xw7tms8u
  npm run cli -- approve lc_mqr948xw7tms8u ingestion
  npm run cli -- intent lc_mqr948xw7tms8u
  npm run cli -- approve lc_abc123 intent

TODO (Option A): Move to /create-library wizard in the app with Firestore-backed jobs.
See library-creator/TODO.md
`);
}

async function cmdCreate(args: string[]): Promise<void> {
  const name = args.join(" ").trim();
  if (!name) {
    throw new Error("Usage: create <library name>");
  }
  const job = await service.createJob(name);
  console.log(`Created job ${job.id} — "${job.name}"`);
  console.log(`Jobs dir: ${service.getStore().jobDir(job.id)}`);
}

async function cmdList(): Promise<void> {
  const jobs = await service.listJobs();
  if (jobs.length === 0) {
    console.log("No jobs yet. Run: npm run cli -- create \"My Library\"");
    return;
  }
  for (const job of jobs) {
    console.log(
      `${job.id}  ${job.name}  stage=${job.currentStage}  status=${job.status}`
    );
  }
}

async function cmdStatus(jobId: string): Promise<void> {
  const job = await loadJobOrHint(jobId);
  console.log(`Job: ${job.id} — ${job.name}`);
  console.log(`Status: ${job.status}  Current stage: ${job.currentStage}`);
  console.log("");
  for (const stage of PIPELINE_STAGES) {
    const record = job.stages[stage];
    const marker = stage === job.currentStage ? "→" : " ";
    console.log(
      `${marker} ${stage.padEnd(18)} ${record.status.padEnd(16)} ${record.artifactPath ?? ""}`
    );
  }
  if (job.sourceRefs.length > 0) {
    console.log("\nSources:");
    for (const ref of job.sourceRefs) {
      console.log(`  - [${ref.kind}] ${ref.value}`);
    }
  }
}

async function cmdShow(jobId: string, stage?: string): Promise<void> {
  const job = await loadJobOrHint(jobId);
  const target = (stage ?? job.currentStage) as PipelineStage;

  if (target === "ingestion" && job.artifacts?.parsedSource) {
    console.log(JSON.stringify(job.artifacts.parsedSource, null, 2));
    return;
  }
  if (target === "intent" && job.artifacts?.intent) {
    console.log(JSON.stringify(job.artifacts.intent, null, 2));
    return;
  }
  if (target === "domain_profile" && job.artifacts?.domainProfile) {
    console.log(JSON.stringify(job.artifacts.domainProfile, null, 2));
    return;
  }
  if (target === "concept_graph" && job.artifacts?.conceptGraph) {
    console.log(JSON.stringify(job.artifacts.conceptGraph, null, 2));
    return;
  }
  if (target === "cards_questions" && job.artifacts?.cardsQuestions) {
    console.log(JSON.stringify(job.artifacts.cardsQuestions, null, 2));
    return;
  }
  if (target === "relationships" && job.artifacts?.relationships) {
    console.log(JSON.stringify(job.artifacts.relationships, null, 2));
    return;
  }
  if (target === "export" && job.artifacts?.libraryBundle) {
    console.log(JSON.stringify(job.artifacts.libraryBundle, null, 2));
    return;
  }

  const path = job.stages[target]?.artifactPath;
  if (path) {
    console.log(await readFile(path, "utf8"));
    return;
  }

  console.log(`No artifact for stage "${target}" on job ${jobId}.`);
}

async function cmdIngest(args: string[]): Promise<void> {
  const jobId = parseJobId(requireArg(args, "job id"));
  const rest = args.slice(1);
  const flags = parseFlags(rest);

  let job;
  const urls = await parseUrlList(rest);
  if (urls.length > 0) {
    if (urls.length === 1) {
      console.log(`Fetching ${urls[0]} ...`);
    } else {
      console.log(`Fetching ${urls.length} URLs ...`);
      for (const url of urls) {
        console.log(`  • ${url}`);
      }
    }
    job = await service.ingestFromUrls(jobId, urls, { label: flags.label });
  } else if (flags.text) {
    job = await service.ingestFromText(jobId, flags.text, flags.label);
  } else if (flags.file) {
    job = await service.ingestFromFile(jobId, flags.file);
  } else {
    throw new Error("Provide --url, --urls, --url-file, --text, or --file");
  }

  const sections = job.artifacts?.parsedSource?.sections.length ?? 0;
  const sourceUrls = job.artifacts?.parsedSource?.metadata?.sourceUrls;
  console.log(`Ingestion complete — ${sections} sections extracted.`);
  if (sourceUrls && sourceUrls.length > 1) {
    console.log(`Merged from ${sourceUrls.length} pages.`);
  }
  console.log(`Review: npm run cli -- show ${jobId} ingestion`);
  console.log(`Then:   npm run cli -- approve ${jobId} ingestion`);
}

async function cmdReingest(args: string[]): Promise<void> {
  const jobId = parseJobId(requireArg(args, "job id"));
  const rest = args.slice(1);
  const flags = parseFlags(rest);
  const urls = await parseUrlList(rest);

  if (urls.length === 0) {
    throw new Error("reingest requires --url, --urls, or --url-file");
  }

  if (urls.length === 1) {
    console.log(`Re-ingesting ${urls[0]} (resets downstream stages)...`);
  } else {
    console.log(
      `Re-ingesting ${urls.length} URLs (resets downstream stages)...`
    );
  }
  const job = await service.reingestFromUrls(jobId, urls, { label: flags.label });
  const sections = job.artifacts?.parsedSource?.sections.length ?? 0;
  console.log(`Ingestion complete — ${sections} content blocks extracted.`);
  console.log(`Review: npm run cli -- show ${jobId} ingestion`);
  console.log(`Then:   npm run cli -- approve ${jobId} ingestion`);
}

async function cmdIntent(jobId: string): Promise<void> {
  const job = await loadJobOrHint(jobId);
  const defaults = {
    libraryTitle: job.name,
    domain: job.artifacts?.parsedSource?.sourceLabel,
  };
  const intent = await collectLibraryCreationIntent(defaults);
  const updated = await service.saveIntent(jobId, intent);

  const suggested = suggestDomainArchetype(intent.domain);
  console.log(`\nIntent saved. Suggested domain profile: ${suggested}`);
  console.log(`Preview: npm run cli -- profile suggest "${intent.domain}"`);
  console.log(`Then:    npm run cli -- approve ${jobId} intent`);
  void updated;
}

async function cmdDomainProfile(jobId: string): Promise<void> {
  const job = await loadJobOrHint(jobId);
  const domain =
    job.artifacts?.intent?.domain ??
    job.artifacts?.parsedSource?.sourceLabel ??
    job.name;

  const profile = await collectDomainProfile(domain);
  await service.saveDomainProfile(jobId, profile);

  console.log(`\nDomain profile saved: ${profile.archetypeId}`);
  console.log(`Review: npm run cli -- show ${jobId} domain_profile`);
  console.log(`Then:   npm run cli -- approve ${jobId} domain_profile`);
}

async function cmdExtractConcepts(args: string[]): Promise<void> {
  const jobId = parseJobId(requireArg(args, "job id"));
  const useAi = args.includes("--ai");

  console.log(
    useAi
      ? "Extracting concepts (AI with heuristic fallback)..."
      : "Extracting concepts (heuristic)..."
  );

  const job = await service.extractConceptGraph(jobId, { useAi });
  const count = job.artifacts?.conceptGraph?.concepts.length ?? 0;
  const libraryId = job.artifacts?.conceptGraph?.proposedLibraryId;

  console.log(`Extracted ${count} draft concepts → ${libraryId}`);
  console.log(`Summary: npm run cli -- concepts list ${jobId}`);
  console.log(`Review: npm run cli -- show ${jobId} concept_graph`);
  console.log(`Then:   npm run cli -- approve ${jobId} concept_graph`);
}

async function cmdConcepts(args: string[]): Promise<void> {
  const sub = requireArg(args, "concepts subcommand");
  const jobId = parseJobId(requireArg(args.slice(1), "job id"));

  switch (sub) {
    case "list": {
      console.log(await service.formatConceptGraphSummary(jobId));
      break;
    }
    case "validate": {
      const result = await service.validateConceptGraph(jobId);
      console.log(result.valid ? "Valid" : "Invalid");
      for (const issue of result.issues) {
        const prefix = issue.severity === "error" ? "✗" : "⚠";
        const id = issue.conceptId ? ` [${issue.conceptId}]` : "";
        console.log(`${prefix}${id} ${issue.message}`);
      }
      if (!result.valid) {
        process.exitCode = 1;
      }
      break;
    }
    case "remove": {
      const conceptId = requireArg(args.slice(2), "concept id");
      await service.removeConcept(jobId, conceptId);
      console.log(`Removed concept ${conceptId}.`);
      console.log(`Review: npm run cli -- concepts list ${jobId}`);
      break;
    }
    default:
      throw new Error(
        "Usage: concepts list|validate|remove <jobId> [conceptId]"
      );
  }
}

async function cmdGenerateCards(args: string[]): Promise<void> {
  const jobId = parseJobId(requireArg(args, "job id"));
  const useAi = args.includes("--ai");

  console.log(
    useAi
      ? "Generating cards and questions (AI not yet available — heuristic)..."
      : "Generating cards and questions (heuristic)..."
  );

  const job = await service.generateCardsQuestions(jobId, { useAi });
  const cards = job.artifacts?.cardsQuestions?.cards.length ?? 0;
  const questions = job.artifacts?.cardsQuestions?.questions.length ?? 0;

  console.log(`Generated ${cards} cards and ${questions} questions.`);
  console.log(`Summary: npm run cli -- cards list ${jobId}`);
  console.log(`Review: npm run cli -- show ${jobId} cards_questions`);
  console.log(`Then:   npm run cli -- approve ${jobId} cards_questions`);
}

async function cmdCards(args: string[]): Promise<void> {
  const sub = requireArg(args, "cards subcommand");
  const jobId = parseJobId(requireArg(args.slice(1), "job id"));

  switch (sub) {
    case "list": {
      console.log(await service.formatCardsQuestionsSummary(jobId));
      break;
    }
    case "validate": {
      const result = await service.validateCardsQuestions(jobId);
      console.log(result.valid ? "Valid" : "Invalid");
      for (const issue of result.issues) {
        const prefix = issue.severity === "error" ? "✗" : "⚠";
        const id = issue.entityId ? ` [${issue.entityId}]` : "";
        console.log(`${prefix}${id} ${issue.message}`);
      }
      if (!result.valid) {
        process.exitCode = 1;
      }
      break;
    }
    default:
      throw new Error("Usage: cards list|validate <jobId>");
  }
}

async function cmdMapRelationships(args: string[]): Promise<void> {
  const jobId = parseJobId(requireArg(args, "job id"));
  const useAi = args.includes("--ai");

  console.log(
    useAi
      ? "Mapping relationships (AI not yet available — heuristic)..."
      : "Mapping relationships (heuristic)..."
  );

  const job = await service.mapRelationships(jobId, { useAi });
  const count = job.artifacts?.relationships?.relationships.length ?? 0;

  console.log(`Mapped ${count} relationships.`);
  console.log(`Summary: npm run cli -- relationships list ${jobId}`);
  console.log(`Review: npm run cli -- show ${jobId} relationships`);
  console.log(`Then:   npm run cli -- approve ${jobId} relationships`);
}

async function cmdRelationships(args: string[]): Promise<void> {
  const sub = requireArg(args, "relationships subcommand");
  const jobId = parseJobId(requireArg(args.slice(1), "job id"));

  switch (sub) {
    case "list": {
      console.log(await service.formatRelationshipsSummary(jobId));
      break;
    }
    case "validate": {
      const result = await service.validateRelationships(jobId);
      console.log(result.valid ? "Valid" : "Invalid");
      for (const issue of result.issues) {
        const prefix = issue.severity === "error" ? "✗" : "⚠";
        const id = issue.relationshipId ? ` [${issue.relationshipId}]` : "";
        console.log(`${prefix}${id} ${issue.message}`);
      }
      if (!result.valid) {
        process.exitCode = 1;
      }
      break;
    }
    default:
      throw new Error("Usage: relationships list|validate <jobId>");
  }
}

async function cmdExport(args: string[]): Promise<void> {
  const subcommand = args[0];
  if (subcommand === "validate") {
    const jobId = parseJobId(requireArg(args.slice(1), "job id"));
    const result = await service.validateLibraryExport(jobId);
    console.log(result.valid ? "Valid" : "Invalid");
    for (const issue of result.issues) {
      const prefix = issue.severity === "error" ? "✗" : "⚠";
      const id = issue.entityId ? ` [${issue.entityId}]` : "";
      console.log(`${prefix}${id} ${issue.message}`);
    }
    if (!result.valid) {
      process.exitCode = 1;
    }
    return;
  }

  if (subcommand === "summary") {
    const jobId = parseJobId(requireArg(args.slice(1), "job id"));
    console.log(await service.formatLibraryExportSummary(jobId));
    return;
  }

  const jobId = parseJobId(requireArg(args, "job id"));
  const flags = parseExportFlags(args.slice(1));

  console.log("Exporting Golden Master library.json...");
  const job = await service.exportLibrary(jobId, flags);
  const record = job.artifacts?.exportRecord;
  const path = job.stages.export.artifactPath;

  console.log(await service.formatLibraryExportSummary(jobId));
  if (path) {
    console.log(`\nArtifact: ${path}`);
  }
  if (flags.outPath) {
    console.log(`Copy:     ${flags.outPath}`);
  }
  if (record) {
    console.log(`\nReview: npm run cli -- export summary ${jobId}`);
    console.log(`Then:   npm run cli -- approve ${jobId} export`);
  }
}

async function cmdApprove(jobId: string, stage: string): Promise<void> {
  if (!isApprovableStage(stage)) {
    throw new Error(
      `CLI approve supports: ${["ingestion", "intent", "domain_profile", "concept_graph", "cards_questions", "relationships", "export"].join(", ")}`
    );
  }
  const job = await service.approve(jobId, stage);
  if (stage === "export") {
    console.log(`Approved "${stage}". Job completed.`);
    console.log(`Status: ${job.status}`);
    return;
  }
  console.log(`Approved "${stage}". Current stage: ${job.currentStage}`);
}

async function cmdProfile(args: string[]): Promise<void> {
  if (args[0] !== "suggest") {
    throw new Error("Usage: profile suggest <domain string>");
  }
  const domain = args.slice(1).join(" ").trim();
  if (!domain) {
    throw new Error("Provide a domain string");
  }
  const archetypeId = suggestDomainArchetype(domain);
  const profile = loadDomainProfile(archetypeId);
  console.log(JSON.stringify({ suggested: archetypeId, profile }, null, 2));
}

function requireArg(args: string[], label: string): string {
  const value = args[0];
  if (!value) {
    throw new Error(`Missing ${label}`);
  }
  return value;
}

function parseFlags(args: string[]): {
  url?: string;
  urls?: string;
  "url-file"?: string;
  text?: string;
  file?: string;
  label?: string;
  version?: string;
  out?: string;
} {
  const flags: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (
      arg === "--url" ||
      arg === "--urls" ||
      arg === "--url-file" ||
      arg === "--text" ||
      arg === "--file" ||
      arg === "--label" ||
      arg === "--version" ||
      arg === "--out"
    ) {
      flags[arg.slice(2)] = args[i + 1];
      i += 1;
    }
  }
  return flags;
}

function parseExportFlags(args: string[]): {
  publish?: boolean;
  version?: string;
  outPath?: string;
} {
  const flags = parseFlags(args);
  return {
    publish: args.includes("--publish"),
    version: flags.version,
    outPath: flags.out,
  };
}

async function parseUrlList(args: string[]): Promise<string[]> {
  const flags = parseFlags(args);
  const urls: string[] = [];

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === "--url") {
      const value = args[i + 1];
      if (value && !value.startsWith("--")) {
        urls.push(value.trim());
      }
    }
  }

  if (flags.urls) {
    urls.push(
      ...flags.urls
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean)
    );
  }

  if (flags["url-file"]) {
    const content = await readFile(flags["url-file"], "utf8");
    urls.push(
      ...content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0 && !line.startsWith("#"))
    );
  }

  return [...new Set(urls)];
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
