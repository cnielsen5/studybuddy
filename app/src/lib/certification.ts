import type { LibraryConcept, StudyQuestion } from "./libraryTypes";

export type CertificationResult = "full" | "partial" | "none";

export interface CertificationOutcome {
  result: CertificationResult;
  questionsAnswered: number;
  correctCount: number;
  accuracy: number;
}

/** Select linked questions for a certification gate (cap at maxQuestions). */
export function buildCertificationQuestions(
  concept: LibraryConcept,
  allQuestions: StudyQuestion[],
  maxQuestions = 5
): StudyQuestion[] {
  const linked = new Set(concept.linked_content.question_ids);
  const rolePriority: Record<string, number> = {
    diagnostic: 0,
    misconception_directed: 1,
    targeted: 2,
    establishment: 3,
    generic: 4,
  };

  return allQuestions
    .filter((q) => linked.has(q.id) && q.conceptIds.includes(concept.id))
    .sort(
      (a, b) =>
        (rolePriority[a.usageRole] ?? 99) - (rolePriority[b.usageRole] ?? 99)
    )
    .slice(0, maxQuestions);
}

/**
 * Certification outcomes aligned with organizer §11.5:
 * - full: ≥90% accuracy, all correct, meets min question bar
 * - partial: ≥ mastery_config.threshold (default 80%)
 * - none: below threshold
 */
export function computeCertificationOutcome(
  correctCount: number,
  questionsAnswered: number,
  threshold = 0.8,
  minForFull = 2
): CertificationOutcome {
  if (questionsAnswered === 0) {
    return { result: "none", questionsAnswered: 0, correctCount: 0, accuracy: 0 };
  }

  const accuracy = correctCount / questionsAnswered;
  let result: CertificationResult = "none";

  if (
    accuracy >= 0.9 &&
    correctCount >= minForFull &&
    correctCount === questionsAnswered
  ) {
    result = "full";
  } else if (accuracy >= threshold) {
    result = "partial";
  }

  return { result, questionsAnswered, correctCount, accuracy };
}

export function certificationResultLabel(result: CertificationResult): string {
  const labels: Record<CertificationResult, string> = {
    full: "Full certification",
    partial: "Partial certification",
    none: "No certification",
  };
  return labels[result];
}

export function certificationResultDescription(result: CertificationResult): string {
  const descriptions: Record<CertificationResult, string> = {
    full: "Concept marked pre-mastered. Core cards may be suppressed; minimal review scheduled.",
    partial: "Introductory cards may be skipped. Focus on relationship and nuance cards.",
    none: "Continue learning this concept through the normal study queue.",
  };
  return descriptions[result];
}
