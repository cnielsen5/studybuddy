import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  UniversalConceptMasterSchema,
  buildDomainContextFromLegacy,
  getEffectiveHierarchy,
  slugifyDomainId,
  writeLinkedContentToDomainContext,
} from "../src/types/domainContext.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const masterTemplatePath = join(
  __dirname,
  "../../content/templates/universal-concept.master.json"
);

describe("domainContext", () => {
  it("builds a domain context from legacy hierarchy fields", () => {
    const { knowledge_graph, domain_context } = buildDomainContextFromLegacy({
      domain: "Mathematics",
      libraryId: "lib_math",
      hierarchy: {
        category: "Algebra",
        subcategory: "Functions",
        topic: "Exponential Decay",
      },
      resolutionLevel: 3,
    });

    expect(knowledge_graph.primary_domain).toBe("mathematics");
    expect(knowledge_graph.knowledge_area).toBe("Mathematics");
    expect(domain_context.hierarchy_location.topic).toBe("Exponential Decay");
    expect(domain_context.framing.max_resolution_in_context).toBe(3);
  });

  it("writes card and question ids back into the active domain context", () => {
    const concept = {
      domain_contexts: [
        {
          domain_id: "mathematics",
          framing: {
            relevance: "Formal properties",
            applications: [],
            max_resolution_in_context: 4 as const,
          },
          hierarchy_location: {
            category: "Algebra",
            subcategory: "Functions",
            topic: "Exponential Decay",
            subtopic: null,
          },
          dependency_graph: {
            prerequisites_in_context: [],
            unlocks_in_context: [],
          },
          linked_content: { card_ids: [], question_ids: [] },
        },
      ],
      knowledge_graph: {
        knowledge_area: "Quantitative Reasoning",
        knowledge_cluster: "Change & Rate",
        primary_domain: "mathematics",
      },
    };

    writeLinkedContentToDomainContext(
      concept,
      "mathematics",
      ["card_exp_notation"],
      ["q_exp_01"]
    );

    expect(concept.domain_contexts![0].linked_content.card_ids).toEqual([
      "card_exp_notation",
    ]);
    expect(concept.linked_content?.card_ids).toEqual(["card_exp_notation"]);
  });

  it("validates the universal concept master template", () => {
    const parsed = UniversalConceptMasterSchema.parse(
      JSON.parse(readFileSync(masterTemplatePath, "utf8"))
    );

    expect(parsed.id).toBe("concept_exponential_decay");
    expect(parsed.domain_contexts).toHaveLength(3);
    expect(parsed.domain_contexts[0].linked_content.card_ids).toEqual([]);
    expect(parsed.metadata.source_references).toHaveLength(2);
  });

  it("resolves effective hierarchy through the active domain lens", () => {
    const concept = {
      content: { title: "Exponential Decay", definition: "", summary: "" },
      knowledge_graph: {
        knowledge_area: "Quantitative Reasoning",
        knowledge_cluster: "Change & Rate",
        primary_domain: "mathematics",
      },
      domain_contexts: [
        {
          domain_id: "mathematics",
          framing: {
            relevance: "Formal properties",
            applications: ["derivation"],
            max_resolution_in_context: 4 as const,
          },
          hierarchy_location: {
            category: "Algebra",
            subcategory: "Functions",
            topic: "Exponential Decay",
            subtopic: null,
          },
          dependency_graph: {
            prerequisites_in_context: [],
            unlocks_in_context: [],
          },
          linked_content: { card_ids: [], question_ids: [] },
        },
        {
          domain_id: "biology",
          framing: {
            relevance: "Population dynamics",
            applications: ["bacterial growth"],
            max_resolution_in_context: 3 as const,
          },
          hierarchy_location: {
            category: "Ecology",
            subcategory: "Population",
            topic: "Exponential Growth",
          },
          dependency_graph: {
            prerequisites_in_context: [],
            unlocks_in_context: [],
          },
          linked_content: { card_ids: [], question_ids: [] },
        },
      ],
    };

    const mathView = getEffectiveHierarchy(
      concept,
      { manifest: { domain: "Mathematics" } },
      "mathematics"
    );
    const bioView = getEffectiveHierarchy(
      concept,
      { manifest: { domain: "Biology" } },
      "biology"
    );

    expect(mathView.category).toBe("Algebra");
    expect(bioView.category).toBe("Ecology");
    expect(slugifyDomainId("Pre-Clinical Medicine")).toBe("pre_clinical_medicine");
  });
});
