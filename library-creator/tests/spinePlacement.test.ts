import { readFileSync } from "node:fs";
import { join } from "node:path";
import { buildSpineIndexFromBundle, type SpineIndex } from "../src/spine/spineIndex.js";
import { placeOnSpine } from "../src/spine/spinePlacement.js";

const repoRoot = join(import.meta.dirname, "../..");

describe("spine placement", () => {
  let index: SpineIndex;

  beforeAll(() => {
    const bundle = JSON.parse(
      readFileSync(join(repoRoot, "content/spine/socrates-spine-l1-l5.draft.json"), "utf8")
    );
    index = buildSpineIndexFromBundle(bundle);
  });

  it("matches existing L4 with high confidence", () => {
    const threshold = index.byId.get("spine_biology_l4_action_potential_threshold");
    expect(threshold).toBeDefined();
    const result = placeOnSpine(index, {
      domain_id: "biology",
      title: threshold!.content.title,
      definition: threshold!.content.definition,
    });
    expect(result.recommendation).toBe("use_existing");
    expect(result.target_concept_id).toBe(threshold!.id);
  });

  it("proposes child or review when content is related but novel", () => {
    const result = placeOnSpine(index, {
      domain_id: "medicine_preclinical",
      title: "Use-Dependent Sodium Channel Blockade by Local Anesthetics",
      definition:
        "Local anesthetics preferentially block inactivated voltage-gated sodium channels during repetitive firing, producing greater block in rapidly firing pain fibers.",
      hint_concept_id: "spine_biology_l3_action_potential",
    });
    expect(["create_l4_child", "create_l5_child", "human_review", "use_existing"]).toContain(
      result.recommendation
    );
    expect(result.matched_concepts.length).toBeGreaterThan(0);
  });

  it("respects max_resolution=3 cap on L3-only anchors", () => {
    const l3Only = index.concepts.find(
      (c) =>
        c.resolution_level === 3 &&
        Object.values(c.max_resolution_by_domain).every((m) => m <= 3)
    );
    expect(l3Only).toBeDefined();
    const domain = l3Only!.domain_ids[0];
    const result = placeOnSpine(index, {
      domain_id: domain,
      title: `${l3Only!.content.title} — novel sub-mechanism detail`,
      definition:
        "A finer-grained mechanistic detail not represented in the current spine node definitions for this topic.",
      hint_concept_id: l3Only!.id,
    });
    expect(["human_review", "use_existing", "create_l3_node"]).toContain(result.recommendation);
  });
});
