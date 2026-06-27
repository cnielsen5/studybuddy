import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LibraryConceptMasterSchema,
  SpineConceptMasterSchema,
  buildDomainContextFromLegacy,
  getEffectiveHierarchy,
  slugifyDomainId,
  writeLinkedContentToLibraryDomainContext,
  writeLinkedContentToSpineDomainContext,
} from "../src/types/domainContext.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const spineTemplatePath = join(
  __dirname,
  "../../content/templates/spine-concept.master.json"
);
const libraryTemplatePath = join(
  __dirname,
  "../../content/templates/library-concept.master.json"
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

  it("writes card and question ids back into a library domain context", () => {
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

    writeLinkedContentToLibraryDomainContext(
      concept,
      "mathematics",
      ["card_exp_notation"],
      ["q_exp_01"]
    );

    expect(concept.domain_contexts![0].linked_content).toEqual({
      card_ids: ["card_exp_notation"],
      question_ids: ["q_exp_01"],
    });
    expect(concept.linked_content?.card_ids).toEqual(["card_exp_notation"]);
  });

  it("writes library-scoped linked content to a spine domain context", () => {
    const spineConcept = {
      domain_contexts: [
        {
          domain_id: "medicine_preclinical",
          framing: {
            relevance: "PK",
            applications: [],
            max_resolution_in_context: 5 as const,
          },
          hierarchy_location: {
            category: "Pharmacology",
            subcategory: "Pharmacokinetics",
            topic: "Drug Elimination",
            subtopic: null,
          },
          dependency_graph: {
            prerequisites_in_context: [],
            unlocks_in_context: [],
          },
          linked_content: { by_library: {} },
        },
      ],
      knowledge_graph: {
        knowledge_area: "Clinical Sciences",
        knowledge_cluster: "Pharmacokinetics",
        primary_domain: "medicine_preclinical",
      },
    };

    writeLinkedContentToSpineDomainContext(
      spineConcept,
      "medicine_preclinical",
      "lib_step1_usmle",
      ["card_pk_01"],
      ["q_pk_01"]
    );

    expect(spineConcept.domain_contexts![0].linked_content).toEqual({
      by_library: {
        lib_step1_usmle: {
          card_ids: ["card_pk_01"],
          question_ids: ["q_pk_01"],
        },
      },
    });
  });

  it("validates the spine concept master template", () => {
    const parsed = SpineConceptMasterSchema.parse(
      JSON.parse(readFileSync(spineTemplatePath, "utf8"))
    );

    expect(parsed.id).toBe("spine_mathematics_l3_exponential_decay");
    expect(parsed.domain_contexts).toHaveLength(3);
    expect(parsed.domain_contexts[0].linked_content).toEqual({ by_library: {} });
    expect(parsed.metadata.source_references).toHaveLength(2);
  });

  it("validates the library concept master template", () => {
    const parsed = LibraryConceptMasterSchema.parse(
      JSON.parse(readFileSync(libraryTemplatePath, "utf8"))
    );

    expect(parsed.id).toBe("concept_lib_step1_pharmacokinetics_001");
    expect(parsed.anchor_concept_id).toBe("spine_mathematics_l3_exponential_decay");
    expect(parsed.resolution_level).toBe(4);
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
          linked_content: { by_library: {} },
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
          linked_content: { by_library: {} },
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
