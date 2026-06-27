import {
  GenerateLibraryPreviewRequestSchema,
  LibraryCreationIntentPayloadSchema,
} from "../src/validation/libraryCreationSchemas";

describe("libraryCreationSchemas", () => {
  it("accepts a minimal valid generation request", () => {
    const payload = {
      jobId: "lc_test123",
      intent: {
        domain: "Orthopaedic Surgery",
        libraryTitle: "ABOS Part I",
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
      },
      sourceText: "# Fracture healing\n\nInflammatory phase…",
    };

    expect(GenerateLibraryPreviewRequestSchema.parse(payload).jobId).toBe("lc_test123");
    expect(LibraryCreationIntentPayloadSchema.parse(payload.intent).libraryTitle).toBe(
      "ABOS Part I"
    );
  });

  it("accepts null optional fields from Firebase JSON round-trips", () => {
    const payload = {
      jobId: "lc_test123",
      intent: {
        domain: "Orthopaedic Surgery",
        libraryTitle: "ABOS Part I",
        purpose: "exam_prep",
        purposeStatement: null,
        libraryDescription: null,
        audience: {
          level: "professional",
          priorKnowledge: [],
          targetDepth: "working",
          resolutionRange: { min: 3, max: 5 },
        },
        scopeBoundaries: [],
        externalAugmentationAllowed: true,
        similarityThreshold: 0.9,
      },
      sourceText: "# Fracture healing\n\nInflammatory phase…",
    };

    expect(GenerateLibraryPreviewRequestSchema.parse(payload).jobId).toBe("lc_test123");
  });

  it("accepts empty sourceText when curated catalog is selected", () => {
    const payload = {
      jobId: "lc_catalog1",
      intent: {
        domain: "Orthopaedic Surgery",
        libraryTitle: "ABOS Part I",
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
      },
      sourceText: "",
      sourceConfiguration: {
        uploads: [],
        webUrls: [],
        selectedCatalogIds: ["statpearls_msk", "openstax_anatomy_physiology_2e"],
      },
    };

    expect(GenerateLibraryPreviewRequestSchema.parse(payload).sourceText).toBe("");
  });

  it("rejects empty source with no curated sources", () => {
    expect(() =>
      GenerateLibraryPreviewRequestSchema.parse({
        jobId: "lc_x",
        intent: {
          domain: "X",
          libraryTitle: "T",
          purpose: "reference",
          audience: {
            level: "undergrad",
            priorKnowledge: [],
            targetDepth: "survey",
            resolutionRange: { min: 2, max: 3 },
          },
          scopeBoundaries: [],
          externalAugmentationAllowed: true,
          similarityThreshold: 0.9,
        },
        sourceText: "",
      })
    ).toThrow();
  });

  it("rejects oversized source text", () => {
    expect(() =>
      GenerateLibraryPreviewRequestSchema.parse({
        jobId: "lc_x",
        intent: {
          domain: "X",
          libraryTitle: "T",
          purpose: "reference",
          audience: {
            level: "undergrad",
            priorKnowledge: [],
            targetDepth: "survey",
            resolutionRange: { min: 2, max: 3 },
          },
          scopeBoundaries: [],
          externalAugmentationAllowed: true,
          similarityThreshold: 0.9,
        },
        sourceText: "x".repeat(500_001),
      })
    ).toThrow();
  });
});
