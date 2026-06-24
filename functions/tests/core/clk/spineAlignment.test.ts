import {
  alignConceptsAcrossLibraries,
  computeTransferConfidence,
} from "../../../src/core/clk/spineAlignment";

describe("spineAlignment", () => {
  it("matches concepts by shared anchor_concept_id only", () => {
    const matches = alignConceptsAcrossLibraries(
      [
        {
          id: "concept_lib_a",
          anchor_concept_id: "spine_mathematics_l3_exponential_decay",
        },
      ],
      [
        {
          id: "concept_lib_b",
          anchor_concept_id: "spine_mathematics_l3_exponential_decay",
        },
        { id: "concept_lib_c", anchor_concept_id: "spine_biology_l3_action_potential" },
      ]
    );

    expect(matches).toHaveLength(1);
    expect(matches[0]).toMatchObject({
      sourceConceptId: "concept_lib_a",
      targetConceptId: "concept_lib_b",
      alignmentKey: "spine_mathematics_l3_exponential_decay",
      matchType: "anchor_concept_id",
      alignmentConfidence: 1,
    });
  });

  it("does not match on library concept ids without a shared anchor", () => {
    const matches = alignConceptsAcrossLibraries(
      [{ id: "concept_same_id" }],
      [{ id: "concept_same_id" }]
    );

    expect(matches).toHaveLength(0);
  });

  it("accepts deprecated spine_concept_id as anchor fallback", () => {
    const matches = alignConceptsAcrossLibraries(
      [{ id: "concept_a", spine_concept_id: "spine_cardiovascular_preload" }],
      [{ id: "concept_b", spine_concept_id: "spine_cardiovascular_preload" }]
    );

    expect(matches).toHaveLength(1);
    expect(matches[0].matchType).toBe("anchor_concept_id");
  });

  it("combines alignment and leaf similarity for transfer confidence", () => {
    expect(
      computeTransferConfidence({ alignmentConfidence: 1, leafCosineSimilarity: 0.9 })
    ).toBeCloseTo(0.985);
  });
});
