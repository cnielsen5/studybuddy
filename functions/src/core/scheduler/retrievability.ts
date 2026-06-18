/** FSRS v6 retrievability — shared by scheduler and concept metrics (no enum deps). */

const W19 = 0.15;
const W20 = 0.8;

export function calculateRetention(stability: number, elapsedDays: number): number {
  if (elapsedDays <= 0) return 1;
  if (stability <= 0) return 0;

  const decay = W19 + (W20 - W19) * Math.exp(-elapsedDays / Math.max(stability, 0.1));
  const r = Math.pow(1 + elapsedDays / (9 * stability), -decay);
  return Math.max(0, Math.min(1, r));
}

export function elapsedDaysSince(isoDate: string, now: Date = new Date()): number {
  const last = new Date(isoDate).getTime();
  return Math.max(0, (now.getTime() - last) / (1000 * 60 * 60 * 24));
}
