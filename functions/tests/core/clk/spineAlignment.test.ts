import {
  alignConceptsAcrossLibraries,
  computeTransferConfidence,
} from "../../../src/core/clk/spineAlignment";

describe("spineAlignment", () => {
  it("matches concepts by shared universal concept id first", () => {
    const matches = alignConceptsAcrossLibraries(
      [{ id: "concept_exponential_decay" }],
      [{ id: "concept_exponential_decay" }, { id: "concept_other" }]
    );

    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      sourceConceptId: "concept_exponential_decay",
      targetConceptId: "concept_exponential_decay",
      matchType: "universal_id",
      alignmentConfidence: 1,
    });
  });

  it("matches concepts by shared spine_concept_id when ids differ", () => {
    const matches = alignConceptsAcrossLibraries(
      [
        { id: "concept_a", spine_concept_id: "spine_cardiovascular_preload" },
      ],
      [
        { id: "concept_b", spine_concept_id: "spine_cardiovascular_preload" },
      ]
    );

    expect(matches).toHaveLength(1);
    expect(matches[0].matchType).toBe("spine_id");
  });

  it("combines alignment and leaf similarity for transfer confidence", () => {
    expect(
      computeTransferConfidence({ alignmentConfidence: 1, leafCosineSimilarity: 0.9 })
    ).toBeCloseTo(0.985);
  });
});
