import {
  detectSourceStructure,
  extractConceptGraphStructured,
} from "../src/extraction/structuredConceptExtractor.js";
import { extractConceptGraph } from "../src/extraction/extractConceptGraph.js";
import { loadDomainProfile } from "../src/profiles/loadProfile.js";
import type { LibraryCreationIntent } from "../src/types/intent.js";
import type { ParsedSource } from "../src/types/parsedSource.js";
import { normalizeParsedSection } from "../src/types/parsedSource.js";

const intent: LibraryCreationIntent = {
  libraryTitle: "Cardiology Course",
  domain: "Cardiology",
  purpose: "exam_prep",
  audience: {
    level: "professional",
    priorKnowledge: [],
    targetDepth: "working",
    resolutionRange: { min: 2, max: 4 },
  },
  scopeBoundaries: [],
  externalAugmentationAllowed: false,
  similarityThreshold: 0.9,
};

const heading = (title: string, level: number, trail: string[], seq: number, body = "") =>
  normalizeParsedSection({
    title,
    body,
    sequence: seq,
    level,
    blockType: "heading_section",
    structuralHeadingTrail: trail,
  });

const structuredSource: ParsedSource = {
  sourceType: "text",
  sections: [
    heading("Cardiology", 1, [], 1),
    heading("Arrhythmias", 2, ["Cardiology"], 2),
    heading("Atrial Fibrillation", 3, ["Cardiology", "Arrhythmias"], 3, "Atrial fibrillation is an irregular, often rapid atrial rhythm. It increases stroke risk."),
    heading("Ventricular Tachycardia", 3, ["Cardiology", "Arrhythmias"], 4, "Ventricular tachycardia is a fast rhythm arising from the ventricles."),
    heading("Heart Failure", 2, ["Cardiology"], 5),
    heading("Systolic Heart Failure", 3, ["Cardiology", "Heart Failure"], 6, "Reduced ejection fraction with impaired contractility."),
  ],
  rawText: "",
};

const byTitle = (draft: { concepts: Array<{ content: { title: string } }> }, title: string) =>
  draft.concepts.find((c) => c.content.title === title)!;

describe("structure-preserving extraction", () => {
  it("detects meaningful hierarchy in structured content", () => {
    const report = detectSourceStructure(structuredSource);
    expect(report.hasStructure).toBe(true);
    expect(report.maxDepth).toBe(3);
    expect(report.depths).toEqual([1, 2, 3]);
  });

  it("does not flag flat content as structured", () => {
    const flat: ParsedSource = {
      sourceType: "text",
      sections: [
        normalizeParsedSection({
          title: "Cells",
          body: "The cell is the basic unit of life.",
          sequence: 1,
          level: 0,
          blockType: "paragraph",
          structuralHeadingTrail: [],
        }),
      ],
      rawText: "",
    };
    expect(detectSourceStructure(flat).hasStructure).toBe(false);
  });

  it("mirrors the outline into layered concepts with parent/child edges", () => {
    const draft = extractConceptGraphStructured(structuredSource, intent, loadDomainProfile("mixed"));
    expect(draft.concepts).toHaveLength(6);

    const cardiology = byTitle(draft, "Cardiology");
    const arrhythmias = byTitle(draft, "Arrhythmias");
    const afib = byTitle(draft, "Atrial Fibrillation");

    // Depth → resolution level (shallow = broad, deep = specific).
    expect(cardiology.resolution_level).toBe(2);
    expect(arrhythmias.resolution_level).toBe(3);
    expect(afib.resolution_level).toBe(4);

    // Parent links follow document nesting.
    expect(cardiology.dependency_graph.parent_concept_id).toBeUndefined();
    expect(arrhythmias.dependency_graph.parent_concept_id).toBe(cardiology.id);
    expect(afib.dependency_graph.parent_concept_id).toBe(arrhythmias.id);

    // Parent surfaces children + unlocks; child requires parent.
    expect(cardiology.dependency_graph.child_concepts).toContain(arrhythmias.id);
    expect(arrhythmias.dependency_graph.unlocks).toContain(afib.id);
    expect(afib.dependency_graph.prerequisites).toContain(arrhythmias.id);

    // Hierarchy labels reflect the source layers.
    expect(afib.hierarchy?.category).toBe("Cardiology");
    expect(afib.hierarchy?.subcategory).toBe("Arrhythmias");
  });

  it("routes structured sources through the structure-preserving path by default", async () => {
    const draft = await extractConceptGraph(structuredSource, intent, loadDomainProfile("mixed"));
    expect(draft.concepts.length).toBe(6);
    expect(draft.notes.some((n) => /structure-preserving/i.test(n))).toBe(true);
  });

  it("can be disabled via preserveStructure:false", async () => {
    const draft = await extractConceptGraph(structuredSource, intent, loadDomainProfile("mixed"), {
      preserveStructure: false,
    });
    expect(draft.notes.some((n) => /structure-preserving/i.test(n))).toBe(false);
  });
});
