import {
  defaultResolutionRangeForLevel,
  filterConceptsByResolution,
  inferResolutionFromHierarchy,
  isWithinResolutionRange,
} from "../src/types/resolution.js";

describe("resolution", () => {
  it("assigns default resolution windows by audience level", () => {
    expect(defaultResolutionRangeForLevel("highschool")).toEqual({ min: 2, max: 3 });
    expect(defaultResolutionRangeForLevel("professional")).toEqual({ min: 3, max: 5 });
  });

  it("infers resolution from hierarchy depth", () => {
    expect(
      inferResolutionFromHierarchy({
        domain: "Pathology",
        category: "Cardiovascular",
        subcategory: "Atherosclerosis",
        topic: "Pathogenesis",
        subtopic: "Early Lesions",
      })
    ).toBe(4);

    expect(
      inferResolutionFromHierarchy({
        domain: "Pathology",
        category: "Cardiovascular",
        subcategory: "Atherosclerosis",
        topic: "Pathogenesis",
      })
    ).toBe(3);
  });

  it("filters concepts by audience resolution range", () => {
    const concepts = [
      { id: "a", resolution_level: 2 as const },
      { id: "b", resolution_level: 3 as const },
      { id: "c", resolution_level: 5 as const },
    ];

    expect(filterConceptsByResolution(concepts, { min: 2, max: 4 })).toHaveLength(2);
    expect(isWithinResolutionRange(3, { min: 3, max: 5 })).toBe(true);
    expect(isWithinResolutionRange(2, { min: 3, max: 5 })).toBe(false);
  });
});
