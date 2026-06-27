import { sectionsFromMarkdown } from "../src/ingestors/sectionsFromHeadings.js";
import {
  expandDenseBlocks,
  extractContentBlocksFromHtml,
} from "../src/ingestors/contentBlockExtractor.js";
import { parseWebsiteHtml } from "../src/ingestors/website.js";
import { ingestText } from "../src/ingestors/text.js";
import { approveStage, markStage } from "../src/pipeline/gates.js";
import { JobStore, createJobId } from "../src/pipeline/jobStore.js";
import { createEmptyJob } from "../src/types/pipeline.js";

const OPENSTAX_LIKE_HTML = `
<html><head><title>Ch. 1 Introduction - Anatomy and Physiology | OpenStax</title></head>
<body><main data-type="page">
  <h1>Introduction</h1>
  <p>After studying this chapter, you will be able to:</p>
  <ul>
    <li>Distinguish between anatomy and physiology, and identify several branches of each</li>
    <li>Describe the structure of the body in terms of the six levels of organization</li>
    <li>Define homeostasis and explain its importance to normal human functioning</li>
  </ul>
  <h2>Overview</h2>
  <p>Though you may approach a course in anatomy and physiology strictly as a requirement for your field of study, the knowledge you gain will serve you well in many aspects of life.</p>
  <p>This chapter begins with an overview of anatomy and physiology and a preview of the body regions and functions.</p>
</main></body></html>`;

describe("sectionsFromMarkdown", () => {
  it("splits markdown headings into blocks with structural trail", () => {
    const sections = sectionsFromMarkdown(`# Intro

Body one.

## Details

Body two.`);

    expect(sections).toHaveLength(2);
    expect(sections[0].blockType).toBe("heading_section");
    expect(sections[0].level).toBe(1);
    expect(sections[1].title).toBe("Details");
  });

  it("extracts markdown bullets as list/objective blocks", () => {
    const sections = sectionsFromMarkdown(`## Objectives

- Define homeostasis and explain its importance
- Identify the four requirements for human survival`);

    expect(sections.some((s) => s.blockType === "objective_item")).toBe(true);
  });
});

describe("extractContentBlocksFromHtml", () => {
  it("extracts objectives, paragraphs, and structural trails from educational HTML", () => {
    const { sections } = extractContentBlocksFromHtml(OPENSTAX_LIKE_HTML, {
      pageTitle: "Ch. 1 Introduction",
    });

    expect(sections.length).toBeGreaterThanOrEqual(5);
    expect(sections.filter((s) => s.blockType === "objective_item").length).toBe(3);
    expect(sections.some((s) => s.blockType === "paragraph")).toBe(true);
    expect(sections[0].level).toBe(0);
  });
});

describe("expandDenseBlocks", () => {
  it("splits merged objective bodies into atomic blocks", () => {
    const expanded = expandDenseBlocks([
      {
        title: "Chapter Objectives",
        body: "Distinguish between anatomy and physiology\nDefine homeostasis and explain its importance",
        sequence: 1,
        pageOrSlide: 1,
        level: 2,
        blockType: "heading_section",
        structuralHeadingTrail: [],
      },
    ]);

    expect(expanded.filter((s) => s.blockType === "objective_item")).toHaveLength(2);
  });
});

describe("parseWebsiteHtml", () => {
  it("extracts multiple content blocks from OpenStax-like pages", () => {
    const parsed = parseWebsiteHtml(
      OPENSTAX_LIKE_HTML,
      "https://openstax.org/books/anatomy-and-physiology/pages/1-introduction"
    );

    expect(parsed.sections.length).toBeGreaterThanOrEqual(5);
    expect(parsed.metadata?.extractionNotes).toBeDefined();
  });
});

describe("ingestText", () => {
  it("detects syllabus-like content", () => {
    const parsed = ingestText("# Course Syllabus\n\nWeek 1: Atoms");
    expect(parsed.sourceType).toBe("syllabus");
    expect(parsed.sections.length).toBeGreaterThan(0);
  });
});

describe("JobStore", () => {
  let jobsDir: string;
  let store: JobStore;

  beforeEach(async () => {
    const { mkdtemp } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const { tmpdir } = await import("node:os");
    jobsDir = await mkdtemp(join(tmpdir(), "lc-jobs-"));
    store = new JobStore(jobsDir);
  });

  afterEach(async () => {
    const { rm } = await import("node:fs/promises");
    await rm(jobsDir, { recursive: true, force: true });
  });

  it("persists and loads jobs", async () => {
    const job = createEmptyJob("Test", createJobId());
    await store.save(job);
    const loaded = await store.load(job.id);
    expect(loaded.name).toBe("Test");
  });
});

describe("pipeline gates", () => {
  it("approves ingestion and advances current stage", () => {
    const job = createEmptyJob("Test", createJobId());
    const awaiting = markStage(job, "ingestion", "awaiting_review");
    const approved = approveStage(awaiting, "ingestion");
    expect(approved.stages.ingestion.status).toBe("approved");
    expect(approved.currentStage).toBe("intent");
  });
});
