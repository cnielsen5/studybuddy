import type { LibraryCreationIntent } from "../types/intent.js";
import type { IntentDialogueAnswers } from "../types/intentDialogue.js";
import { defaultResolutionRangeForLevel } from "../types/resolution.js";
import { getLensCatalogEntry } from "./lensCatalog.js";

const DOMAIN_KEYWORDS: Array<{ pattern: RegExp; domain: string; spineDomainId: string }> = [
  {
    pattern: /\b(usmle|step\s*[12]|nbme|comlex|medical board)\b/i,
    domain: "Medicine",
    spineDomainId: "medicine_clinical",
  },
  {
    pattern: /\b(abos|orthopaedic|orthopedic|ortho\s*boards?)\b/i,
    domain: "Orthopaedic Surgery",
    spineDomainId: "medicine_clinical",
  },
  {
    pattern: /\b(anatomy|physiology|a\s*&\s*p)\b/i,
    domain: "Anatomy and Physiology",
    spineDomainId: "medicine_preclinical",
  },
  {
    pattern: /\b(organic|chemistry|biochem)\b/i,
    domain: "Chemistry",
    spineDomainId: "chemistry",
  },
  {
    pattern: /\b(calculus|algebra|precalc|mathematics|math)\b/i,
    domain: "Mathematics",
    spineDomainId: "mathematics",
  },
  {
    pattern: /\b(physics|mechanics|thermodynamics)\b/i,
    domain: "Physics",
    spineDomainId: "physics",
  },
  {
    pattern: /\b(biology|genetics|cell bio)\b/i,
    domain: "Biology",
    spineDomainId: "biology",
  },
  {
    pattern: /\b(psychology|neuroscience|psych)\b/i,
    domain: "Psychology and Neuroscience",
    spineDomainId: "psychology_neuroscience",
  },
];

export function inferDomainFromPurpose(purposeStatement: string): {
  domain: string;
  spineDomainId: string;
} {
  for (const row of DOMAIN_KEYWORDS) {
    if (row.pattern.test(purposeStatement)) {
      return { domain: row.domain, spineDomainId: row.spineDomainId };
    }
  }
  return { domain: "General", spineDomainId: "mixed" };
}

export function inferLibraryTitle(purposeStatement: string): string {
  const trimmed = purposeStatement.trim();
  if (trimmed.length <= 60) {
    return trimmed;
  }
  const firstSentence = trimmed.split(/[.!?]/)[0]?.trim() ?? trimmed;
  if (firstSentence.length <= 60) {
    return firstSentence;
  }
  return `${firstSentence.slice(0, 57)}…`;
}

function mapAudienceLevel(
  level: IntentDialogueAnswers["audienceLevel"]
): LibraryCreationIntent["audience"]["level"] {
  return level;
}

function mapTargetDepth(
  usage: IntentDialogueAnswers["usagePurpose"]
): LibraryCreationIntent["audience"]["targetDepth"] {
  switch (usage) {
    case "exam_prep":
      return "working";
    case "deep_understanding":
      return "mastery";
    case "reference":
      return "survey";
  }
}

function parseScopeBoundaries(scopeNotes?: string): string[] {
  if (!scopeNotes?.trim()) return [];
  return scopeNotes
    .split(/[,;]|(?:\band\b)/i)
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && /leave out|skip|exclude|not include|without/i.test(s))
    .map((s) => s.replace(/^(leave out|skip|exclude|not include|without)\s*/i, "").trim())
    .filter(Boolean);
}

/**
 * Convert Stage 1 dialogue answers into a fully populated LibraryCreationIntent.
 * The user never sees this object — it drives the rest of the pipeline.
 */
export function buildIntentFromDialogue(
  answers: IntentDialogueAnswers
): LibraryCreationIntent {
  const inferred = inferDomainFromPurpose(answers.purposeStatement);
  const catalogLens =
    answers.curriculum.mode === "catalog"
      ? getLensCatalogEntry(answers.curriculum.lensId)
      : undefined;

  const domain = catalogLens?.name.includes("ABOS")
    ? "Orthopaedic Surgery"
    : inferred.domain;
  const spineDomainId = catalogLens?.domainId ?? inferred.spineDomainId;

  const audienceLevel = mapAudienceLevel(answers.audienceLevel);
  const resolutionRange = defaultResolutionRangeForLevel(audienceLevel);

  return {
    libraryTitle: inferLibraryTitle(answers.purposeStatement),
    libraryDescription: answers.purposeStatement.trim(),
    purposeStatement: answers.purposeStatement.trim(),
    domain,
    spineDomainId,
    purpose: answers.usagePurpose,
    audience: {
      level: audienceLevel,
      priorKnowledge: [],
      targetDepth: mapTargetDepth(answers.usagePurpose),
      resolutionRange,
    },
    scopeBoundaries: parseScopeBoundaries(answers.scopeNotes),
    scopeNotes: answers.scopeNotes?.trim() || undefined,
    curriculum: answers.curriculum,
    curriculumLensId:
      answers.curriculum.mode === "catalog" ? answers.curriculum.lensId : undefined,
    externalAugmentationAllowed: true,
    similarityThreshold: 0.9,
  };
}
