import { validateLibraryBundle } from "../export/libraryConformance.js";
import type { LibraryBundle } from "../types/libraryBundle.js";
import { LibraryBundleSchema } from "../types/libraryBundle.js";
import { inferResolutionFromHierarchy } from "../types/resolution.js";
import {
  buildDomainContextFromLegacy,
  ensureLinkedContentAggregate,
  slugifyDomainId,
} from "../types/domainContext.js";
import { parseCsv, rowsToRecords } from "./parseCsv.js";

export interface SheetsImportInput {
  conceptsCsv: string;
  cardsCsv: string;
  questionsCsv: string;
  libraryId?: string;
  publish?: boolean;
}

const LIBRARY_ID = "lib_orthobullets_recon";
const OPTION_LETTERS = ["A", "B", "C", "D", "E"] as const;

export function importSheetsToLibraryBundle(
  input: SheetsImportInput
): LibraryBundle {
  const conceptRecords = rowsToRecords(parseCsv(input.conceptsCsv));
  const cardRecords = rowsToRecords(parseCsv(input.cardsCsv));
  const questionRecords = rowsToRecords(parseCsv(input.questionsCsv));

  const libraryId = input.libraryId ?? LIBRARY_ID;
  const publish = input.publish ?? true;
  const contentStatus = publish ? "published" : "draft";
  const now = new Date().toISOString();

  const conceptIdMap = new Map<string, string>();
  for (const record of conceptRecords) {
    const rawId = record.ID?.trim();
    if (!rawId) {
      continue;
    }
    conceptIdMap.set(rawId, toConceptId(rawId));
  }

  const concepts: LibraryBundle["concepts"] = [];

  for (const record of conceptRecords) {
    const rawId = record.ID?.trim();
    if (!rawId || isTruthy(record.isSuspended)) {
      continue;
    }

    const conceptId = toConceptId(rawId);
    const domainLabel = record.domain || "Recon";
    const resolutionLevel = inferResolutionFromHierarchy({
      domain: domainLabel,
      category: record.category || domainLabel,
      subcategory: record.subcategory || record.category || "General",
      topic: record.topic || record.concept_title || rawId,
      subtopic: record.subtopic || undefined,
    });
    const { knowledge_graph, domain_context } = buildDomainContextFromLegacy({
      domain: domainLabel,
      libraryId,
      hierarchy: {
        category: record.category || domainLabel,
        subcategory: record.subcategory || record.category || "General",
        topic: record.topic || record.concept_title || rawId,
        subtopic: record.subtopic || undefined,
      },
      resolutionLevel,
      relevance: record.source_name
        ? `Imported from ${record.source_name}`
        : undefined,
    });

    const concept: LibraryBundle["concepts"][number] = {
      id: conceptId,
      type: "concept",
      resolution_level: resolutionLevel,
      metadata: {
        created_at: parseSheetDate(record.created_at, now),
        updated_at: parseSheetDate(record.updated_at, now),
        created_by: record.created_by || "orthobullets_sheets",
        last_updated_by: record.last_updated_by || "orthobullets_sheets",
        version: record.version || "1.0",
        status: mapConceptStatus(record.status, contentStatus),
        tags: splitList(record.tags),
        search_keywords: splitList(record.search_keywords),
        version_history: [],
      },
      editorial: {
        difficulty: mapConceptDifficulty(record.difficulty),
        high_yield_score: mapHighYield(record.high_yield_score),
      },
      hierarchy: {
        library_id: libraryId,
        domain: domainLabel,
        category: record.category || domainLabel,
        subcategory: record.subcategory || record.category || "General",
        topic: record.topic || record.concept_title || rawId,
        subtopic: record.subtopic || undefined,
      },
      knowledge_graph,
      domain_contexts: [domain_context],
      content: {
        title: record.concept_title || rawId,
        definition: record.concept_definition || record.concept_title || "",
        summary: record.concept_summary || record.concept_definition || "",
      },
      dependency_graph: {
        parent_concept_id: undefined,
        prerequisites: splitList(record.prerequisites).map(toConceptId),
        unlocks: [],
        related_concepts: [],
        child_concepts: [],
        semantic_relations: [],
      },
      mastery_config: {
        threshold: 0.8,
        decay_rate: "standard",
        min_questions_correct: 1,
      },
      media: [],
      references: record.source_name
        ? [{ source: record.source_name, chapter: record.source_chapter }]
        : [],
      linked_content: { card_ids: [], question_ids: [] },
    };
    ensureLinkedContentAggregate(concept);
    concepts.push(concept);
  }

  const importDomainId = slugifyDomainId(conceptRecords[0]?.domain || "recon");

  const cards: LibraryBundle["cards"] = cardRecords
    .filter((record) => record["Card ID"]?.trim())
    .map((record) => {
      const cardId = toCardId(record["Card ID"]);
      const conceptId = toConceptId(record["Concept ID"]);
      const cardType = normalizeCardType(record["Card Type"]);
      const front = record["Front (Question)"] || "";
      const back = record["Back (Answer)"] || front;
      const clozeData =
        cardType === "cloze" ? buildClozeData(front, record) : undefined;

      return {
        id: cardId,
        type: "card" as const,
        relations: { concept_id: conceptId, domain_id: importDomainId },
        config: {
          card_type: cardType,
          pedagogical_role: mapPedagogicalRole(record.pedagogicalRole, cardType),
          card_tier: "core" as const,
        },
        content: {
          front,
          back: clozeData?.template_text ?? back,
          cloze_data: clozeData ?? null,
        },
        media: [],
        editorial: {
          difficulty: "medium" as const,
          tags: ["imported", "orthobullets"],
        },
        metadata: {
          created_at: now,
          updated_at: now,
          created_by: "orthobullets_sheets",
          status: contentStatus,
          version: "1.0",
        },
      };
    });

  const questions: LibraryBundle["questions"] = questionRecords
    .filter((record) => record.id?.trim())
    .map((record) => {
      const options = buildQuestionOptions(record);
      const correctIndex = Number(record["content.correct_option_id"] || "1");
      const correctOptionId =
        options[correctIndex - 1]?.id ?? options[0]?.id ?? "opt_A";
      const conceptIds = uniqueIds(
        OPTION_LETTERS.map(
          (_, index) => record[`relations.concept_id_${String(index + 1).padStart(2, "0")}`]
        )
      )
        .filter((id) => conceptIdMap.has(id))
        .map(toConceptId);

      const relatedCardIds = uniqueIds(
        OPTION_LETTERS.map(
          (_, index) => record[`relations.card_id_${String(index + 1).padStart(2, "0")}`]
        )
      ).map(toCardId);

      const distractors: Record<string, string> = {};
      for (const letter of OPTION_LETTERS) {
        const key = `explanations.distractors.opt_${letter}`;
        const value = record[key];
        if (value?.trim()) {
          distractors[`opt_${letter}`] = value.trim();
        }
      }

      return {
        id: record.id.trim(),
        type: "question" as const,
        relations: {
          concept_ids: conceptIds.length > 0 ? conceptIds : [findConceptForQuestion(record, conceptIdMap)],
          related_card_ids: relatedCardIds,
        },
        source: {
          origin: publish ? ("validated" as const) : ("ai_generated" as const),
          provider: "orthobullets_sheets",
          subscription_required: false,
        },
        classification: {
          question_type: "mcq" as const,
          usage_role: "generic" as const,
          cognitive_level: mapCognitiveLevel(record["config.cognitive_level"]),
        },
        content: {
          stem: record["content.stem"] || "",
          options,
          correct_option_id: correctOptionId,
        },
        explanations: {
          general: record["explanations.general"] || "",
          distractors: Object.keys(distractors).length > 0 ? distractors : undefined,
        },
        editorial: {
          difficulty: mapQuestionDifficulty(record["metadata.difficulty"]),
          tags: splitList(record["metadata.tags"]),
        },
        media: [],
        references: record["references.source"]
          ? [{ source: record["references.source"], topic: record["references.topic"] }]
          : [],
        metadata: {
          created_at: parseSheetDate(record["metadata.created_at"], now),
          updated_at: parseSheetDate(record["metadata.updated_at"], now),
          created_by: record["metadata.created_by"] || "orthobullets_sheets",
          status: mapConceptStatus(record["metadata.status"], contentStatus),
          version: record["metadata.version"] || "1.0",
        },
      };
    });

  const conceptById = new Map(concepts.map((concept) => [concept.id, concept]));

  for (const card of cards) {
    const concept = conceptById.get(card.relations.concept_id);
    if (!concept) {
      continue;
    }
    const domainContext = concept.domain_contexts?.find(
      (context) => context.domain_id === importDomainId
    );
    const linked = domainContext?.linked_content ?? concept.linked_content;
    if (!linked) {
      continue;
    }
    if (!linked.card_ids.includes(card.id)) {
      linked.card_ids.push(card.id);
    }
    ensureLinkedContentAggregate(concept);
  }

  for (const question of questions) {
    for (const conceptId of question.relations.concept_ids) {
      const concept = conceptById.get(conceptId);
      if (!concept) {
        continue;
      }
      const domainContext = concept.domain_contexts?.find(
        (context) => context.domain_id === importDomainId
      );
      const linked = domainContext?.linked_content ?? concept.linked_content;
      if (!linked) {
        continue;
      }
      if (!linked.question_ids.includes(question.id)) {
        linked.question_ids.push(question.id);
      }
      ensureLinkedContentAggregate(concept);
    }
  }

  const manifestName =
    conceptRecords[0]?.Library?.trim() || "OrthoBullets Recon";

  const bundle: LibraryBundle = {
    manifest: {
      id: libraryId,
      name: `${manifestName} — Recon`,
      version: "1.0.0",
      description:
        "OrthoBullets reconstruction library imported from Google Sheets (concepts, cards, and questions).",
      domain: conceptRecords[0]?.domain || "Recon",
      created_at: parseSheetDate(conceptRecords[0]?.created_at, now),
      updated_at: now,
      status: contentStatus,
      tags: ["orthobullets", "recon", "imported"],
    },
    concepts,
    relationships: [],
    cards,
    questions,
  };

  const parsed = LibraryBundleSchema.parse(bundle);
  const validation = validateLibraryBundle(parsed);
  if (!validation.valid) {
    const summary = validation.issues
      .filter((issue) => issue.severity === "error")
      .map((issue) => issue.message)
      .join("; ");
    throw new Error(`Imported library failed conformance: ${summary}`);
  }

  return parsed;
}

function toConceptId(raw: string): string {
  const trimmed = raw.trim();
  return trimmed.startsWith("concept_") ? trimmed : `concept_${trimmed}`;
}

function toCardId(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("card_")) {
    return trimmed;
  }
  if (trimmed.startsWith("cd_")) {
    return `card_${trimmed.slice(3)}`;
  }
  return `card_${trimmed}`;
}

function splitList(value?: string): string[] {
  if (!value?.trim()) {
    return [];
  }
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function uniqueIds(values: Array<string | undefined>): string[] {
  return [
    ...new Set(
      values
        .filter((value): value is string => typeof value === "string")
        .map((value) => value.trim())
        .filter(Boolean)
    ),
  ];
}

function isTruthy(value?: string): boolean {
  return value?.trim().toLowerCase() === "true";
}

function parseSheetDate(value: string | undefined, fallback: string): string {
  if (!value?.trim()) {
    return fallback;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? fallback : parsed.toISOString();
}

function mapConceptStatus(
  value: string | undefined,
  fallback: "draft" | "published"
): "draft" | "published" {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "published") {
    return "published";
  }
  if (normalized === "draft" || normalized === "pending review") {
    return fallback;
  }
  return fallback;
}

function mapConceptDifficulty(value?: string): "basic" | "intermediate" | "advanced" {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    if (numeric <= 4) {
      return "basic";
    }
    if (numeric <= 7) {
      return "intermediate";
    }
    return "advanced";
  }
  return "intermediate";
}

function mapHighYield(value?: string): number {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "high") {
    return 9;
  }
  if (normalized === "medium") {
    return 7;
  }
  if (normalized === "low") {
    return 5;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(10, Math.max(1, numeric)) : 7;
}

function normalizeCardType(value?: string): "basic" | "cloze" {
  return value?.trim().toLowerCase() === "cloze" ? "cloze" : "basic";
}

function mapPedagogicalRole(
  value: string | undefined,
  cardType: "basic" | "cloze"
): LibraryBundle["cards"][number]["config"]["pedagogical_role"] {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "recognition") {
    return "recognition";
  }
  if (normalized === "application") {
    return "application";
  }
  if (normalized === "synthesis") {
    return "synthesis";
  }
  return cardType === "cloze" ? "recall" : "recall";
}

function buildClozeData(
  front: string,
  record: Record<string, string>
): NonNullable<LibraryBundle["cards"][number]["content"]["cloze_data"]> {
  const fields: Array<{ field_id: string; answer: string; hint?: string }> = [];
  let template = front;

  template = template.replace(/\{c(\d+)::([^}]+)\}/g, (_match, index, answer) => {
    const fieldId = `cloze_${index}`;
    fields.push({ field_id: fieldId, answer: String(answer).trim() });
    return `[[${fieldId}]]`;
  });

  for (let index = 1; index <= 8; index += 1) {
    const answer = record[`Cloze${index}`]?.trim();
    const hint = record[`Hint${index}`]?.trim();
    if (!answer) {
      continue;
    }
    const fieldId = `cloze_${index}`;
    if (!fields.some((field) => field.field_id === fieldId)) {
      fields.push({ field_id: fieldId, answer, hint });
      if (!template.includes(`[[${fieldId}]]`)) {
        template = `${template} [[${fieldId}]]`;
      }
    } else {
      const field = fields.find((item) => item.field_id === fieldId);
      if (field && hint) {
        field.hint = hint;
      }
    }
  }

  return {
    template_text: template,
    cloze_fields: fields.length > 0 ? fields : [{ field_id: "cloze_1", answer: "..." }],
  };
}

function buildQuestionOptions(record: Record<string, string>) {
  const options = OPTION_LETTERS.map((letter) => ({
    id: `opt_${letter}` as const,
    text: record[`content.options.opt_${letter}.text`]?.trim() || "",
  })).filter((option) => option.text.length > 0);

  if (options.length < 2) {
    throw new Error(`Question ${record.id} has fewer than 2 options`);
  }

  return options;
}

function mapCognitiveLevel(
  value?: string
): LibraryBundle["questions"][number]["classification"]["cognitive_level"] {
  const allowed = new Set(["pathophysiology", "diagnosis", "management", "mechanism"]);
  const normalized = value?.trim().toLowerCase();
  if (normalized && allowed.has(normalized)) {
    return normalized as LibraryBundle["questions"][number]["classification"]["cognitive_level"];
  }
  return "mechanism";
}

function mapQuestionDifficulty(value?: string): "easy" | "medium" | "hard" {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "easy") {
    return "easy";
  }
  if (normalized === "hard") {
    return "hard";
  }
  return "medium";
}

function findConceptForQuestion(
  record: Record<string, string>,
  conceptIdMap: Map<string, string>
): string {
  const match = record.id?.match(/^q_(.+?)_\d+$/);
  if (match && conceptIdMap.has(match[1])) {
    return toConceptId(match[1]);
  }
  const first = conceptIdMap.values().next().value;
  if (!first) {
    throw new Error(`Question ${record.id} has no linked concept`);
  }
  return first;
}
