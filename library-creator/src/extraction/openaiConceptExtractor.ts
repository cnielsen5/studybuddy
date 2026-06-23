import type { DomainProfile } from "../types/domainProfile.js";
import type { LibraryCreationIntent } from "../types/intent.js";
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
    subtopic?: string;
    difficulty?: "basic" | "intermediate" | "advanced";
    high_yield_score?: number;
    prerequisites?: string[];
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
            "You extract atomic learnable concepts for a spaced-repetition library. " +
            "One concept = one learnable idea, not a chapter heading. Return JSON only.",
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
    .map(
      (s, i) =>
        `[${i + 1}] (${"#".repeat(s.level)}) ${s.title}\n${s.body.slice(0, 400)}`
    )
    .join("\n\n");

  return `Extract up to ${maxConcepts} atomic concepts for a Socrates content library.

Domain: ${intent.domain}
Audience: ${intent.audience.level}, depth ${intent.audience.targetDepth}
Purpose: ${intent.purpose}
Out of scope: ${intent.scopeBoundaries.join(", ") || "none"}
Domain archetype: ${domainProfile.archetypeId}

Rules:
- One concept = one learnable idea (not a whole chapter)
- Skip intro/overview/reference sections
- Respect scope boundaries
- prerequisites refer to other concept titles from your list

Return JSON:
{
  "concepts": [
    {
      "title": "...",
      "definition": "one sentence",
      "summary": "2-3 sentences",
      "category": "...",
      "subtopic": "...",
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

  const concepts = response.concepts.slice(0, maxConcepts).map((item) => {
    const slug = slugify(item.title);
    const id = uniqueConceptIdFromSlug(slug, usedIds);
    titleToId.set(item.title.toLowerCase(), id);

    return {
      id,
      type: "concept" as const,
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
        category: item.category ?? intent.domain,
        subcategory: intent.purpose.replace(/_/g, " "),
        topic: item.title,
        subtopic: item.subtopic,
      },
      content: {
        title: item.title,
        definition: item.definition,
        summary: item.summary,
      },
      dependency_graph: {
        prerequisites: [],
        unlocks: [],
        related_concepts: [],
        child_concepts: [],
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
  });

  const suggestedPrerequisites: ConceptGraphDraft["suggestedPrerequisites"] = [];

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
