import { PrimaryReason } from "./enums";

export interface SessionSummary {
  session_id: string;
  user_id: string;

  started_at: string;
  ended_at: string;

  items_seen: {
    item_id: string;
    item_type: "card" | "relationship_card" | "question";
    primary_reason: PrimaryReason;
  }[];

  totals: {
    cards_reviewed: number;
    questions_answered: number;
    total_time_seconds: number;
  };
}
