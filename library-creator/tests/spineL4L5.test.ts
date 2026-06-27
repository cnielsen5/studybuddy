import { mergeSpineL4L5Draft } from "../src/spine/spineL4L5Bundler.js";
import { loadGenerationUnitsFromRepo } from "../src/spine/spineL4L5Units.js";
import { validateSpineL4L5Graph } from "../src/spine/spineL4L5Schema.js";
import { join } from "node:path";

const repoRoot = join(import.meta.dirname, "../..");

describe("spine L4/L5 draft (universal model)", () => {
  it("merges universal anchor bundles without hard errors", () => {
    const { bundle, validation } = mergeSpineL4L5Draft({ repoRoot });
    validateSpineL4L5Graph(bundle);
    expect(validation.hardErrors).toEqual([]);
    expect(bundle._meta.anchor_count).toBeGreaterThanOrEqual(1);
    expect(bundle._meta.concept_counts.level_4).toBeGreaterThan(0);
  });

  it("uses universal domain_contexts[] on every concept", () => {
    const { bundle } = mergeSpineL4L5Draft({ repoRoot });
    for (const concept of bundle.concepts) {
      expect(concept.domain_contexts.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("expects generation units from L3 spine with ortho domain contexts", () => {
    const units = loadGenerationUnitsFromRepo(repoRoot);
    // 75 base + 4 perioperative existing nodes with medicine_clinical ortho context (max ≥4)
    expect(units.length).toBeGreaterThanOrEqual(75);
  });
});
