import { CardState } from "./enums";

export interface CardScheduleState {
  card_id: string;

  state: CardState;
  due: string;

  stability: number;
  difficulty: number;

  elapsed_days: number;
  scheduled_days: number;

  reps: number;
  lapses: number;

  last_review: string;
}
