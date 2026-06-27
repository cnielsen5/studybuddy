import { buildDefaultSourceText, resolveSourceText } from "../src/sources/resolveSourceText.js";
import { buildSourceConfiguration } from "../src/sources/buildSourceConfiguration.js";
import type { LibraryCreationIntent } from "../src/types/intent.js";

const orthoIntent: LibraryCreationIntent = {
  domain: "Orthopaedic Surgery",
  libraryTitle: "ABOS Boards",
  purposeStatement: "ABOS orthopaedic board prep",
  spineDomainId: "medicine_clinical",
  purpose: "exam_prep",
  audience: {
    level: "professional",
    priorKnowledge: [],
    targetDepth: "working",
    resolutionRange: { min: 3, max: 5 },
  },
  scopeBoundaries: [],
  externalAugmentationAllowed: true,
  similarityThreshold: 0.9,
  curriculumLensId: "lens_abos_orthopaedic_2025",
};

describe("resolveSourceText", () => {
  it("builds default text from curated catalog when paste is empty", () => {
    const config = buildSourceConfiguration(orthoIntent);
    const text = resolveSourceText("", orthoIntent, config);
    expect(text).toContain("Curated open references");
    expect(text).toContain("StatPearls");
    expect(text.length).toBeGreaterThan(100);
  });

  it("returns pasted text unchanged when provided", () => {
    const config = buildSourceConfiguration(orthoIntent);
    const pasted = "# My notes\n\nFracture healing overview.";
    expect(resolveSourceText(pasted, orthoIntent, config)).toBe(pasted);
  });

  it("includes lens catalog stub when lens file is not loaded", () => {
    const config = buildSourceConfiguration(orthoIntent);
    const text = buildDefaultSourceText(orthoIntent, config);
    expect(text).toContain("ABOS");
  });
});
