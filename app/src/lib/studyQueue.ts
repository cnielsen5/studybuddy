import type { CardScheduleView, StudyCard } from "./types";

export type QueueReason = "new" | "due" | "overdue";

export interface QueuedStudyCard extends StudyCard {
  queueReason: QueueReason;
  dueAt?: string;
  schedule?: CardScheduleView;
}

export interface StudyQueueStats {
  total: number;
  newCount: number;
  dueCount: number;
  overdueCount: number;
}

export function buildStudyQueue(
  studyCards: StudyCard[],
  schedules: CardScheduleView[],
  now: Date = new Date()
): QueuedStudyCard[] {
  const cardMap = new Map(studyCards.map((c) => [c.id, c]));
  const scheduledIds = new Set(schedules.map((s) => s.card_id));
  const nowMs = now.getTime();

  const newCards: QueuedStudyCard[] = studyCards
    .filter((c) => !scheduledIds.has(c.id))
    .map((c) => ({ ...c, queueReason: "new" as const }));

  const dueCards: QueuedStudyCard[] = [];
  for (const schedule of schedules) {
    if (new Date(schedule.due_at).getTime() > nowMs) continue;

    const card = cardMap.get(schedule.card_id);
    if (!card) continue;

    const dueMs = new Date(schedule.due_at).getTime();
    const daysOverdue = (nowMs - dueMs) / (1000 * 60 * 60 * 24);
    const queueReason: QueueReason = daysOverdue >= 1 ? "overdue" : "due";

    dueCards.push({
      ...card,
      queueReason,
      dueAt: schedule.due_at,
      schedule,
    });
  }
  dueCards.sort((a, b) => new Date(a.dueAt!).getTime() - new Date(b.dueAt!).getTime());

  return [...newCards, ...dueCards];
}

export function getStudyQueueStats(queue: QueuedStudyCard[]): StudyQueueStats {
  const newCount = queue.filter((c) => c.queueReason === "new").length;
  const overdueCount = queue.filter((c) => c.queueReason === "overdue").length;
  const dueCount = queue.filter((c) => c.queueReason === "due").length;

  return {
    total: queue.length,
    newCount,
    dueCount,
    overdueCount,
  };
}

export function formatQueueReason(card: QueuedStudyCard): string {
  if (card.queueReason === "new") return "New";
  if (card.queueReason === "overdue") {
    return card.dueAt
      ? `Overdue · ${new Date(card.dueAt).toLocaleDateString()}`
      : "Overdue";
  }
  return card.dueAt
    ? `Due · ${new Date(card.dueAt).toLocaleString()}`
    : "Due";
}
