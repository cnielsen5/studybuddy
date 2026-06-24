import { buildSpineGraphDraft } from "../src/spine/spineBuilder.js";
import { SPINE_DOMAINS } from "../src/spine/spineDomains.js";
import { SPINE_SHARED_CONCEPTS } from "../src/spine/spineSharedConceptsIndex.js";
import {
  reconcileForwardReferences,
  validateSpineGraph,
  validateSpineGraphStructure,
} from "../src/spine/spineSchema.js";

describe("spine graph draft", () => {
  it("builds all seven domains with merged shared concepts", () => {
    const bundle = validateSpineGraph(buildSpineGraphDraft());
    const { hardErrors, forwardReferences } = validateSpineGraphStructure(bundle);
    expect(hardErrors).toEqual([]);

    const spineIds = new Set(bundle.concepts.map((concept) => concept.id));
    const unresolved = reconcileForwardReferences(forwardReferences, spineIds);
    expect(unresolved).toEqual([]);

    expect(bundle._meta.domains_included).toHaveLength(7);
    expect(bundle._meta.concept_counts?.level_1).toBe(7);
    expect(bundle._meta.concept_counts?.level_2).toBe(68);
    expect(bundle._meta.concept_counts?.level_3).toBeLessThan(532);
    expect(bundle._meta.concept_counts?.level_3).toBeGreaterThan(500);

    const sharedWithNote = bundle.concepts.filter(
      (c) => c.knowledge_graph._shared_concept_note
    );
    expect(sharedWithNote.length).toBeGreaterThanOrEqual(12);
  });

  it("includes shared cross-domain concepts with multiple domain contexts", () => {
    for (const shared of SPINE_SHARED_CONCEPTS) {
      if (shared.knowledge_graph._shared_concept_note) {
        expect(shared.domain_contexts.length).toBeGreaterThan(1);
      }
      if (shared.resolution_level === 3) {
        expect(shared.metadata.source_references?.length).toBeGreaterThan(0);
      }
    }
  });
});
