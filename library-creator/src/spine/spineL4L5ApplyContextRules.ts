/**
 * CTX-1/3/4/0 follow-up pass: note cleanup, domain context addition, R-MIG-Z promotions.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  type SpineL4L5AnchorBundle,
  type SpineL4L5Concept,
  type SpineL4L5DomainContext,
  validateSpineL4L5AnchorBundle,
} from "./spineL4L5Schema.js";
import { reconcileConceptContexts } from "./spineL4L5Bundler.js";
import {
  applyMergeRules,
  type TaggedProposal,
} from "./spineL4L5ApplyMergeRules.js";

const BUNDLE_DIR = "content/spine/l4-l5-bundles";

const ELECTROPHYS_DOMAINS = ["biology", "medicine_preclinical", "psychology_neuroscience"] as const;

/** concept id → domains that must be present (CTX-3) */
const ELECTROPHYS_CONTEXT_ADDITIONS: Record<string, readonly string[]> = {
  spine_biology_l4_axonal_propagation: ["biology", "medicine_preclinical"],
  spine_biology_l5_saltatory_conduction: ["biology"],
};

/** concept id → domains to add (CTX-4 / CTX-0 decay) */
const DECAY_CONTEXT_ADDITIONS: Record<string, readonly string[]> = {
  spine_mathematics_l4_elimination_rate_constant: ["chemistry", "physics"],
  spine_mathematics_l4_exponential_decay_law: ["chemistry", "medicine_preclinical"],
};

/** Domains erroneously added by an earlier pass — strip before rebuild */
const DECAY_CONTEXT_STRIP: Record<string, readonly string[]> = {
  spine_mathematics_l4_elimination_rate_constant: ["mathematics"],
};

/** CTX-0: behavioral science → medicine_preclinical context */
const BEHAVIORAL_MED_CONTEXT_IDS = [
  "spine_psychology_neuroscience_l4_classical_conditioning_applications",
  "spine_psychology_neuroscience_l4_generalization_discrimination",
  "spine_psychology_neuroscience_l4_pavlovian_conditioning_paradigm",
  "spine_psychology_neuroscience_l4_reinforcement_punishment",
  "spine_psychology_neuroscience_l4_schedules_of_reinforcement",
  "spine_psychology_neuroscience_l4_shaping_chaining",
];

export interface ApplyContextRulesResult {
  sharedNotesCleaned: number;
  reviewerNotesCleaned: number;
  contextsAdded: number;
  promotionsApplied: number;
  bundlesWritten: number;
}

function collectBundleFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => join(dir, name));
}

function cleanupSharedNote(note: string | null | undefined): string | null {
  if (!note) return null;
  let cleaned = note
    .replace(/^Merged [^(]+\([^)]+\)(?:,\s*[^(]+\([^)]+\))*\.\s*/i, "")
    .replace(/^Merged [^.]+\.\s*/i, "")
    .replace(/\(merged duplicate[^)]*\)/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length < 12) return null;
  return cleaned;
}

function cleanupReviewerNote(note: string | null | undefined): string | undefined {
  if (!note) return undefined;
  const parts = note
    .split("|")
    .map((p) => p.trim())
    .filter(
      (p) =>
        p &&
        !/^MERGED from \d+ contexts:/i.test(p) &&
        !/^Shared L3 anchor/i.test(p) &&
        !/^DEPTH RECONCILED:/i.test(p) &&
        !/ \(rules apply pass\)$/i.test(p)
    );
  return parts.length ? parts.join(" | ") : undefined;
}

function buildDomainMembership(
  bundles: Map<string, SpineL4L5AnchorBundle>
): Map<string, Set<string>> {
  const membership = new Map<string, Set<string>>();
  for (const bundle of bundles.values()) {
    for (const concept of bundle.concepts) {
      membership.set(
        concept.id,
        new Set(concept.domain_contexts.map((d) => d.domain_id))
      );
    }
  }
  return membership;
}

function filterContextDeps(
  membership: Map<string, Set<string>>,
  domainId: string,
  prerequisites: readonly string[],
  unlocks: readonly string[]
): SpineL4L5DomainContext["dependency_graph"] {
  const inDomain = (id: string) => membership.get(id)?.has(domainId) ?? false;
  return {
    prerequisites_in_context: prerequisites.filter(inDomain),
    unlocks_in_context: unlocks.filter(inDomain),
  };
}

function electrophysContext(
  concept: SpineL4L5Concept,
  domainId: string,
  membership: Map<string, Set<string>>
): SpineL4L5DomainContext {
  const title = concept.content.title;
  const subtopic = title.split(" ").slice(-2).join(" ") || title;
  const maxResolution = concept.resolution_level === 5 ? 5 : 4;
  const baseDeps = filterContextDeps(
    membership,
    domainId,
    concept.dependency_graph.prerequisites,
    concept.dependency_graph.unlocks
  );
  if (domainId === "biology") {
    return {
      domain_id: "biology",
      framing: {
        title_in_context: title,
        relevance: "Links ion channel kinetics to signal propagation in excitable cells.",
        applications: ["Axonal conduction", "Myelin and nodes of Ranvier"],
        max_resolution_in_context: maxResolution,
      },
      hierarchy_location: {
        category: "Cell Biology",
        subcategory: "Membrane Physiology",
        topic: "Electrical Signaling",
        subtopic,
      },
      dependency_graph: baseDeps,
      linked_content: { by_library: {} },
    };
  }
  if (domainId === "medicine_preclinical") {
    return {
      domain_id: "medicine_preclinical",
      framing: {
        title_in_context: title,
        relevance: "Neural and neuromuscular conduction; demyelination in disease.",
        applications: ["Conduction velocity", "Local anesthetic targets"],
        max_resolution_in_context: maxResolution,
      },
      hierarchy_location: {
        category: "Physiology",
        subcategory: "Electrophysiology",
        topic: "Action Potential",
        subtopic,
      },
      dependency_graph: baseDeps,
      linked_content: { by_library: {} },
    };
  }
  return {
    domain_id: "psychology_neuroscience",
    framing: {
      title_in_context: title,
      relevance: "Foundation of information coding and transmission in the nervous system.",
      applications: ["Spike timing", "Neural encoding"],
      max_resolution_in_context: maxResolution,
    },
    hierarchy_location: {
      category: "Biological Psychology & Neuroscience",
      subcategory: "Cellular Neuroscience",
      topic: "Neuronal Excitability",
      subtopic,
    },
    dependency_graph: baseDeps,
    linked_content: { by_library: {} },
  };
}

function behavioralMedContext(
  concept: SpineL4L5Concept,
  membership: Map<string, Set<string>>
): SpineL4L5DomainContext {
  const psych = concept.domain_contexts.find((d) => d.domain_id === "psychology_neuroscience");
  const subtopic = psych?.hierarchy_location.subtopic ?? concept.content.title;
  const psychDeps = psych?.dependency_graph ?? {
    prerequisites_in_context: concept.dependency_graph.prerequisites,
    unlocks_in_context: concept.dependency_graph.unlocks,
  };
  return {
    domain_id: "medicine_preclinical",
    framing: {
      title_in_context: concept.content.title,
      relevance:
        "Behavioral medicine applications including patient adherence, aversive conditioning, and reinforcement in clinical settings.",
      applications: ["Patient adherence", "Behavioral change protocols"],
      max_resolution_in_context: 4,
    },
    hierarchy_location: {
      category: "Behavioral Science",
      subcategory: "Learning & Conditioning",
      topic: psych?.hierarchy_location.topic ?? "Conditioning",
      subtopic,
    },
    dependency_graph: filterContextDeps(
      membership,
      "medicine_preclinical",
      psychDeps.prerequisites_in_context,
      psychDeps.unlocks_in_context
    ),
    linked_content: { by_library: {} },
  };
}

function cloneContextFromTemplate(
  concept: SpineL4L5Concept,
  template: SpineL4L5DomainContext,
  domainId: string
): SpineL4L5DomainContext {
  return {
    ...template,
    domain_id: domainId,
    framing: {
      ...template.framing,
      title_in_context: template.framing.title_in_context ?? concept.content.title,
    },
    dependency_graph: {
      prerequisites_in_context: [...template.dependency_graph.prerequisites_in_context],
      unlocks_in_context: [...template.dependency_graph.unlocks_in_context],
    },
    linked_content: { by_library: {} },
  };
}

function ensureDomains(
  concept: SpineL4L5Concept,
  required: readonly string[],
  builder: (domainId: string) => SpineL4L5DomainContext
): { concept: SpineL4L5Concept; added: string[] } {
  const have = new Set(concept.domain_contexts.map((d) => d.domain_id));
  const added: string[] = [];
  const contexts = [...concept.domain_contexts];
  for (const domainId of required) {
    if (have.has(domainId)) continue;
    contexts.push(builder(domainId));
    added.push(domainId);
  }
  if (!added.length) return { concept, added };
  return {
    concept: {
      ...concept,
      domain_contexts: contexts.sort((a, b) => a.domain_id.localeCompare(b.domain_id)),
    },
    added,
  };
}

function setManagedDomains(
  concept: SpineL4L5Concept,
  domainIds: readonly string[],
  builder: (domainId: string) => SpineL4L5DomainContext
): { concept: SpineL4L5Concept; replaced: string[] } {
  const managed = new Set(domainIds);
  const keep = concept.domain_contexts.filter((d) => !managed.has(d.domain_id));
  const replaced = domainIds.map((domainId) => builder(domainId));
  return {
    concept: {
      ...concept,
      domain_contexts: [...keep, ...replaced].sort((a, b) =>
        a.domain_id.localeCompare(b.domain_id)
      ),
    },
    replaced: [...domainIds],
  };
}

function stripDomains(concept: SpineL4L5Concept, domainIds: readonly string[]): SpineL4L5Concept {
  const remove = new Set(domainIds);
  return {
    ...concept,
    domain_contexts: concept.domain_contexts.filter((d) => !remove.has(d.domain_id)),
  };
}

function buildDecayContext(
  concept: SpineL4L5Concept,
  domainId: string,
  membership: Map<string, Set<string>>,
  bundles: Map<string, SpineL4L5AnchorBundle>
): SpineL4L5DomainContext {
  if (concept.id === "spine_mathematics_l4_elimination_rate_constant") {
    const templateId =
      domainId === "chemistry"
        ? "spine_mathematics_l4_rate_constant_first_order"
        : "spine_mathematics_l4_exponential_decay_law";
    const templateCtx = findConceptTemplate(bundles, templateId, domainId);
    const deps = filterContextDeps(
      membership,
      domainId,
      concept.dependency_graph.prerequisites,
      concept.dependency_graph.unlocks
    );
    if (templateCtx) {
      return {
        ...cloneContextFromTemplate(concept, templateCtx, domainId),
        dependency_graph: deps,
      };
    }
  }

  if (concept.id === "spine_mathematics_l4_exponential_decay_law") {
    if (domainId === "chemistry") {
      const physics = concept.domain_contexts.find((d) => d.domain_id === "physics");
      return {
        domain_id: "chemistry",
        framing: {
          title_in_context: concept.content.title,
          relevance: "First-order kinetics: concentration decays exponentially with time.",
          applications: ["Integrated rate law", "Half-life calculations"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Physical Chemistry",
          subcategory: "Chemical Kinetics",
          topic: "Reaction Orders",
          subtopic: "Exponential Decay",
        },
        dependency_graph: filterContextDeps(
          membership,
          "chemistry",
          physics?.dependency_graph.prerequisites_in_context ?? [],
          physics?.dependency_graph.unlocks_in_context ?? []
        ),
        linked_content: { by_library: {} },
      };
    }
    if (domainId === "medicine_preclinical") {
      return {
        domain_id: "medicine_preclinical",
        framing: {
          title_in_context: concept.content.title,
          relevance: "Drug elimination and washout follow first-order exponential decay.",
          applications: ["Plasma concentration curves", "Half-life and dosing intervals"],
          max_resolution_in_context: 4,
        },
        hierarchy_location: {
          category: "Pharmacology",
          subcategory: "Pharmacokinetics",
          topic: "Drug Elimination",
          subtopic: "Exponential Elimination",
        },
        dependency_graph: filterContextDeps(
          membership,
          "medicine_preclinical",
          concept.dependency_graph.prerequisites,
          concept.dependency_graph.unlocks
        ),
        linked_content: { by_library: {} },
      };
    }
  }

  const templateCtx = findConceptTemplate(bundles, concept.id, domainId);
  if (templateCtx) return cloneContextFromTemplate(concept, templateCtx, domainId);
  return {
    domain_id: domainId,
    framing: {
      title_in_context: concept.content.title,
      relevance: concept.content.summary,
      applications: [],
      max_resolution_in_context: concept.resolution_level,
    },
    hierarchy_location: concept.domain_contexts[0]?.hierarchy_location ?? {
      category: "General",
      subcategory: "General",
      topic: concept.content.title,
      subtopic: null,
    },
    dependency_graph: filterContextDeps(
      membership,
      domainId,
      concept.dependency_graph.prerequisites,
      concept.dependency_graph.unlocks
    ),
    linked_content: { by_library: {} },
  };
}

function findConceptTemplate(
  bundles: Map<string, SpineL4L5AnchorBundle>,
  conceptId: string,
  domainId: string
): SpineL4L5DomainContext | null {
  for (const bundle of bundles.values()) {
    for (const c of bundle.concepts) {
      if (c.id !== conceptId) continue;
      const ctx = c.domain_contexts.find((d) => d.domain_id === domainId);
      if (ctx) return ctx;
    }
  }
  return null;
}

export function applyContextRules(repoRoot: string): ApplyContextRulesResult {
  const bundleDir = join(repoRoot, BUNDLE_DIR);
  const bundles = new Map<string, SpineL4L5AnchorBundle>();

  for (const filePath of collectBundleFiles(bundleDir)) {
    const bundle = validateSpineL4L5AnchorBundle(
      JSON.parse(readFileSync(filePath, "utf8"))
    );
    bundles.set(bundle._meta.anchor_l3_id, bundle);
  }

  let sharedNotesCleaned = 0;
  let reviewerNotesCleaned = 0;
  let contextsAdded = 0;
  const membership = buildDomainMembership(bundles);

  for (const [anchor, bundle] of bundles) {
    bundle.concepts = bundle.concepts.map((concept) => {
      let c = concept;

      const cleanedShared = cleanupSharedNote(c.knowledge_graph._shared_concept_note);
      if (cleanedShared !== c.knowledge_graph._shared_concept_note) {
        sharedNotesCleaned++;
        c = {
          ...c,
          knowledge_graph: { ...c.knowledge_graph, _shared_concept_note: cleanedShared },
        };
      }

      const cleanedReviewer = cleanupReviewerNote(c._reviewer_note);
      if (cleanedReviewer !== c._reviewer_note) {
        reviewerNotesCleaned++;
        c = { ...c, _reviewer_note: cleanedReviewer };
      }

      if (ELECTROPHYS_CONTEXT_ADDITIONS[c.id]) {
        const { concept: next, replaced } = setManagedDomains(
          c,
          ELECTROPHYS_CONTEXT_ADDITIONS[c.id],
          (d) => electrophysContext(c, d, membership)
        );
        contextsAdded += replaced.length;
        c = next;
        for (const domainId of replaced) membership.get(c.id)?.add(domainId);
      }

      if (DECAY_CONTEXT_ADDITIONS[c.id]) {
        if (DECAY_CONTEXT_STRIP[c.id]) {
          c = stripDomains(c, DECAY_CONTEXT_STRIP[c.id]);
        }
        const required = DECAY_CONTEXT_ADDITIONS[c.id];
        const { concept: next, replaced } = setManagedDomains(c, required, (domainId) =>
          buildDecayContext(c, domainId, membership, bundles)
        );
        contextsAdded += replaced.length;
        c = next;
        for (const domainId of replaced) membership.get(c.id)?.add(domainId);
      }

      if (BEHAVIORAL_MED_CONTEXT_IDS.includes(c.id)) {
        const { concept: next, replaced } = setManagedDomains(
          c,
          ["medicine_preclinical"],
          () => behavioralMedContext(c, membership)
        );
        contextsAdded += replaced.length;
        c = next;
        for (const domainId of replaced) membership.get(c.id)?.add(domainId);
      }

      // CTX-3: ensure full electrophys trio when note flags cross-domain use
      const note = c.knowledge_graph._shared_concept_note ?? "";
      if (
        note.includes("neural signaling") &&
        note.includes("medicine_preclinical") &&
        c.anchor_concept_id === "spine_biology_l3_action_potential"
      ) {
        const { concept: next, added } = ensureDomains(
          c,
          ELECTROPHYS_DOMAINS,
          (d) => electrophysContext(c, d, membership)
        );
        contextsAdded += added.length;
        c = next;
        for (const domainId of added) membership.get(c.id)?.add(domainId);
      }

      return c;
    });
    bundles.set(anchor, bundle);
  }

  let bundlesWritten = 0;
  for (const [anchor, bundle] of bundles) {
    bundle.concepts = reconcileConceptContexts(bundle.concepts);
    bundle._meta.status = "draft-context-applied";
    writeFileSync(
      join(bundleDir, `${anchor}.json`),
      `${JSON.stringify(bundle, null, 2)}\n`,
      "utf8"
    );
    bundlesWritten++;
  }

  // R-MIG-Z promotion: herd immunity pair (after context pass persisted)
  const promotion: TaggedProposal = {
    id: "promotion:herd_immunity",
    kind: "migration_skipped",
    anchor: "spine_biology_l3_vaccination_principles",
    members: [
      "spine_biology_l4_herd_immunity",
      "spine_biology_l4_herd_immunity_threshold",
    ],
    rule_action: "merge_manual_band",
  };
  const promoResult = applyMergeRules(repoRoot, [promotion]);
  const promotionsApplied = promoResult.mergesApplied;

  return {
    sharedNotesCleaned,
    reviewerNotesCleaned,
    contextsAdded,
    promotionsApplied,
    bundlesWritten,
  };
}
