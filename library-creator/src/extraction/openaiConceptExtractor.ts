import type { DomainProfile } from "../types/domainProfile.js";
import type { LibraryCreationIntent } from "../types/intent.js";
import {
  buildDomainContextFromLegacy,
  ensureLinkedContentAggregate,
} from "../types/domainContext.js";
import {
  inferResolutionFromHierarchy,
  isWithinResolutionRange,
} from "../types/resolution.js";
import type { ParsedSource } from "../types/parsedSource.js";
import {
  ConceptGraphDraftSchema,
  type ConceptGraphDraft,
} from "../types/draftConcept.js";
import {
  slugify,
  uniqueConceptIdFromSlug,
} from "./heuristicConceptExtractor.js";

interface OpenAIOptions {
  maxConcepts?: number;
  model?: string;
}

interface OpenAIConceptResponse {
  concepts: Array<{
    title: string;
    definition: string;
    summary: string;
    category?: string;
    subcategory?: string;
    topic?: string;
    subtopic?: string;
    difficulty?: "basic" | "intermediate" | "advanced";
    high_yield_score?: number;
    prerequisites?: string[];
    spine_concept_id?: string;
    /** Title of the parent concept in this list (mirrors provided content hierarchy). */
    parent_title?: string;
    parent_concept_id?: string;
  }>;
}

export async function extractConceptGraphOpenAI(
  parsedSource: ParsedSource,
  intent: LibraryCreationIntent,
  domainProfile: DomainProfile,
  apiKey: string,
  options: OpenAIOptions = {}
): Promise<ConceptGraphDraft> {
  const model = options.model ?? process.env.LIBRARY_CREATOR_OPENAI_MODEL ?? "gpt-4o-mini";
  const maxConcepts = options.maxConcepts ?? 20;

  const prompt = buildPrompt(parsedSource, intent, domainProfile, maxConcepts);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You extract concepts for a spaced-repetition library and organise them into a " +
            "hierarchy. When the source has structure, identify its layers and mirror them: " +
            "broad sections become parent concepts, nested headings become children. " +
            "Leaf concepts are single learnable ideas. Return JSON only.",
        },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${body.slice(0, 200)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned empty content");
  }

  const parsed = JSON.parse(content) as OpenAIConceptResponse;
  if (!parsed.concepts?.length) {
    throw new Error("OpenAI returned no concepts");
  }

  return normalizeOpenAIResponse(
    parsed,
    intent,
    domainProfile,
    maxConcepts
  );
}

function buildPrompt(
  parsedSource: ParsedSource,
  intent: LibraryCreationIntent,
  domainProfile: DomainProfile,
  maxConcepts: number
): string {
  const sectionSummaries = parsedSource.sections
    .map((s, i) => {
      const trail = s.structuralHeadingTrail?.filter(Boolean) ?? [];
      const trailStr = trail.length ? `  [under: ${trail.join(" › ")}]` : "";
      return `[${i + 1}] (${"#".repeat(Math.max(1, s.level))}) ${s.title}${trailStr}\n${s.body.slice(0, 400)}`;
    })
    .join("\n\n");

  return `Extract up to ${maxConcepts} concepts for a Socrates content library.

Domain: ${intent.domain}
Audience: ${intent.audience.level}, depth ${intent.audience.targetDepth}
Purpose: ${intent.purpose}
Out of scope: ${intent.scopeBoundaries.join(", ") || "none"}
Domain archetype: ${domainProfile.archetypeId}

The source below includes heading levels (#, ##, ###) and a "[under: …]" trail showing
each block's place in the document hierarchy.

Rules:
- IDENTIFY THE HIERARCHICAL LAYERS in the provided content and REFLECT that structure
  in your output. Broad sections become higher-level concepts; nested headings become
  their children. Decide what each layer most logically represents (category →
  subcategory → topic → subtopic), shallow→broad and deep→specific.
- Set "parent_title" to the title of the concept that directly contains this one
  (omit for top-level concepts), so the concept map mirrors the source nesting.
- Fill category / subcategory / topic / subtopic to place each concept in the hierarchy.
- One leaf concept = one learnable idea; keep meaningful parent/section concepts too so
  the map's structure is preserved.
- Respect scope boundaries; skip pure intro/reference/table-of-contents sections.
- "prerequisites" refer to other concept titles from your list.

Return JSON:
{
  "concepts": [
    {
      "title": "...",
      "definition": "one sentence",
      "summary": "2-3 sentences",
      "category": "broadest layer",
      "subcategory": "next layer",
      "topic": "this concept's topic",
      "subtopic": "finest layer (optional)",
      "parent_title": "title of the containing concept (optional)",
      "difficulty": "basic|intermediate|advanced",
      "high_yield_score": 1-10,
      "prerequisites": ["prior concept title"]
    }
  ]
}

Source sections:
${sectionSummaries}`;
}

function normalizeOpenAIResponse(
  response: OpenAIConceptResponse,
  intent: LibraryCreationIntent,
  domainProfile: DomainProfile,
  maxConcepts: number
): ConceptGraphDraft {
  const proposedLibraryId = proposeLibraryId(intent.libraryTitle);
  const now = new Date().toISOString();
  const usedIds = new Set<string>();
  const titleToId = new Map<string, string>();

  const concepts = response.concepts
    .slice(0, maxConcepts)
    .map((item) => {
    const slug = slugify(item.title);
    const id = uniqueConceptIdFromSlug(slug, usedIds);
    titleToId.set(item.title.toLowerCase(), id);

    const hierarchyPlacement = {
      category: item.category ?? intent.domain,
      subcategory: item.subcategory ?? item.category ?? intent.purpose.replace(/_/g, " "),
      topic: item.topic ?? item.title,
      subtopic: item.subtopic,
    };
    const resolutionLevel = inferResolutionFromHierarchy({
      domain: intent.domain,
      ...hierarchyPlacement,
    });

    if (!isWithinResolutionRange(resolutionLevel, intent.audience.resolutionRange)) {
      return null;
    }

    const { knowledge_graph, domain_context } = buildDomainContextFromLegacy({
      domain: intent.domain,
      libraryId: proposedLibraryId,
      hierarchy: hierarchyPlacement,
      resolutionLevel,
    });
    const concept = {
      id,
      type: "concept" as const,
      resolution_level: resolutionLevel,
      spine_concept_id: item.spine_concept_id,
      metadata: {
        created_at: now,
        updated_at: now,
        created_by: "library_creator" as const,
        last_updated_by: "library_creator" as const,
        version: "0.1.0",
        status: "draft" as const,
        tags: [slugify(intent.domain), domainProfile.archetypeId],
        search_keywords: item.title.toLowerCase().split(/\s+/).slice(0, 5),
      },
      editorial: {
        difficulty: item.difficulty ?? "basic",
        high_yield_score: item.high_yield_score ?? 7,
      },
      hierarchy: {
        library_id: proposedLibraryId,
        domain: intent.domain,
        ...hierarchyPlacement,
      },
      knowledge_graph,
      domain_contexts: [domain_context],
      content: {
        title: item.title,
        definition: item.definition,
        summary: item.summary,
      },
      dependency_graph: {
        parent_concept_id: undefined as string | undefined,
        prerequisites: [],
        unlocks: [],
        related_concepts: [] as string[],
        child_concepts: [] as string[],
        semantic_relations: [],
      },
      mastery_config: {
        threshold: 0.8,
        decay_rate: "standard" as const,
        min_questions_correct: 1,
      },
      media: [],
      references: [],
      linked_content: { card_ids: [], question_ids: [] },
      provenance: {
        extractionMethod: "openai" as const,
        confidence: 0.8,
      },
    };
    ensureLinkedContentAggregate(concept);
    return concept;
  })
    .filter((concept): concept is NonNullable<typeof concept> => concept !== null);

  if (concepts.length === 0) {
    throw new Error(
      "No AI-extracted concepts fell within the audience resolution window."
    );
  }

  const suggestedPrerequisites: ConceptGraphDraft["suggestedPrerequisites"] = [];

  // Resolve parent links (parent_title → id) so the concept map mirrors the
  // provided content hierarchy.
  for (const concept of concepts) {
    const source = response.concepts.find(
      (c) => c.title.toLowerCase() === concept.content.title.toLowerCase()
    );
    const parentTitle = source?.parent_title ?? source?.parent_concept_id;
    if (!parentTitle) continue;
    const parentId = titleToId.get(parentTitle.toLowerCase());
    if (!parentId || parentId === concept.id) continue;
    concept.dependency_graph.parent_concept_id = parentId;
    const parent = concepts.find((c) => c.id === parentId);
    if (parent && !parent.dependency_graph.child_concepts.includes(concept.id)) {
      parent.dependency_graph.child_concepts.push(concept.id);
    }
    if (!concept.dependency_graph.prerequisites.includes(parentId)) {
      concept.dependency_graph.prerequisites.push(parentId);
    }
    if (parent && !parent.dependency_graph.unlocks.includes(concept.id)) {
      parent.dependency_graph.unlocks.push(concept.id);
    }
  }

  for (const concept of concepts) {
    const source = response.concepts.find(
      (c) => c.title.toLowerCase() === concept.content.title.toLowerCase()
    );
    for (const prereqTitle of source?.prerequisites ?? []) {
      const fromId = titleToId.get(prereqTitle.toLowerCase());
      if (!fromId || fromId === concept.id) {
        continue;
      }
      suggestedPrerequisites.push({
        from_concept_id: fromId,
        to_concept_id: concept.id,
        reason: "AI-inferred prerequisite",
      });
      if (!concept.dependency_graph.prerequisites.includes(fromId)) {
        concept.dependency_graph.prerequisites.push(fromId);
      }
      const fromConcept = concepts.find((c) => c.id === fromId);
      if (fromConcept && !fromConcept.dependency_graph.unlocks.includes(concept.id)) {
        fromConcept.dependency_graph.unlocks.push(concept.id);
      }
    }
  }

  return ConceptGraphDraftSchema.parse({
    proposedLibraryId,
    concepts,
    suggestedPrerequisites,
    extractionMethod: "openai",
    notes: [`AI extracted ${concepts.length} concepts.`],
  });
}

function proposeLibraryId(title: string): string {
  const slug = slugify(title).replace(/^lib_/, "") || "untitled";
  return `lib_${slug}`.slice(0, 48);
}
