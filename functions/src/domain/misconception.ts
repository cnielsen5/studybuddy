export interface Misconception {
  id: string;

  concept_id: string;

  description: string;

  strength: number;
  last_observed: string;

  trigger_patterns: {
    question_id?: string;
    wrong_option_id?: string;
  }[];
}
