export type ReviewGrade = "again" | "hard" | "good" | "easy";

export interface UserEvent {
  event_id: string;
  type: string;
  user_id: string;
  library_id: string;
  occurred_at: string;
  received_at: string;
  device_id: string;
  entity: { kind: string; id: string };
  payload: Record<string, unknown>;
  schema_version: string;
}

export interface CardScheduleView {
  type: "card_schedule_view";
  card_id: string;
  library_id: string;
  user_id: string;
  state: number;
  due_at: string;
  stability: number;
  difficulty: number;
  interval_days: number;
  last_reviewed_at: string;
  last_grade: ReviewGrade;
  last_applied: { received_at: string; event_id: string };
  updated_at: string;
}

export interface StudyCard {
  id: string;
  conceptId: string;
  front: string;
  back: string;
  cardType?: string;
  role?: string;
}

/** @deprecated Use StudyCard from library bundle */
export type SeedCard = StudyCard;
