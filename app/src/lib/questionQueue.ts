import type { QuestionPerformanceView } from "./types";
import type { StudyQuestion } from "./libraryTypes";

export type QuestionQueueReason = "new" | "review";

export interface QueuedQuestion extends StudyQuestion {
  queueReason: QuestionQueueReason;
  performance?: QuestionPerformanceView;
}

export interface QuestionQueueStats {
  total: number;
  newCount: number;
  reviewCount: number;
}

export function buildQuestionQueue(
  questions: StudyQuestion[],
  performances: QuestionPerformanceView[]
): QueuedQuestion[] {
  const perfById = new Map(performances.map((p) => [p.question_id, p]));

  const newQuestions: QueuedQuestion[] = questions
    .filter((q) => !perfById.has(q.id))
    .map((q) => ({ ...q, queueReason: "new" as const }));

  const reviewQuestions: QueuedQuestion[] = questions
    .filter((q) => perfById.has(q.id))
    .map((q) => ({
      ...q,
      queueReason: "review" as const,
      performance: perfById.get(q.id),
    }))
    .sort(
      (a, b) =>
        (a.performance?.accuracy_rate ?? 1) - (b.performance?.accuracy_rate ?? 1)
    );

  return [...newQuestions, ...reviewQuestions];
}

export function getQuestionQueueStats(queue: QueuedQuestion[]): QuestionQueueStats {
  const newCount = queue.filter((q) => q.queueReason === "new").length;
  return {
    total: queue.length,
    newCount,
    reviewCount: queue.length - newCount,
  };
}

export function formatUsageRole(role: string): string {
  return role.replace(/_/g, " ");
}
