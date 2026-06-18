import type { CardScheduleView } from "./types";
import type { StudyCard } from "./libraryTypes";

/** 0 = unlearned, 1 = mastered */
export function cardMasteryScore(schedule: CardScheduleView | undefined): number {
  if (!schedule) return 0;
  if (schedule.state >= 2 && schedule.stability >= 90) return 1;
  if (schedule.state >= 2 && schedule.stability >= 21) return 0.85;
  if (schedule.state >= 2) return 0.65;
  if (schedule.state >= 1) return 0.4;
  return 0.15;
}

export function conceptMasteryScore(
  conceptId: string,
  studyCards: StudyCard[],
  schedules: CardScheduleView[]
): number {
  const scheduleByCard = new Map(schedules.map((s) => [s.card_id, s]));
  const conceptCards = studyCards.filter((c) => c.conceptId === conceptId);
  if (conceptCards.length === 0) return 0;

  const total = conceptCards.reduce(
    (sum, card) => sum + cardMasteryScore(scheduleByCard.get(card.id)),
    0
  );
  return total / conceptCards.length;
}

/** Red (0) → orange → yellow → green (1) */
export function masteryColor(score: number): string {
  const t = Math.max(0, Math.min(1, score));
  const hue = t * 120;
  const lightness = 44 + t * 14;
  const saturation = 68 + t * 12;
  return `hsl(${hue.toFixed(1)}, ${saturation.toFixed(0)}%, ${lightness.toFixed(0)}%)`;
}

export function masteryStrokeColor(score: number): string {
  const t = Math.max(0, Math.min(1, score));
  const hue = t * 120;
  return `hsl(${hue.toFixed(1)}, 55%, ${28 + t * 10}%)`;
}

export function aggregateMastery(
  conceptIds: string[],
  studyCards: StudyCard[],
  schedules: CardScheduleView[]
): number {
  if (conceptIds.length === 0) return 0;
  const total = conceptIds.reduce(
    (sum, id) => sum + conceptMasteryScore(id, studyCards, schedules),
    0
  );
  return total / conceptIds.length;
}
