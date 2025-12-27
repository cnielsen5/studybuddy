export interface QuestionAttempt {
  attempt_id: string;
  user_id: string;
  question_id: string;

  result: {
    selected_option_id: string;
    correct: boolean;
  };

  confidence_rating?: number;

  error_analysis?: {
    error_type: ErrorType;
    confidence_mismatch: boolean;
    derived_from: "question" | "followup";
  };

  timing: {
    time_taken_seconds: number;
  };

  context: {
    mode: "practice" | "exam_sim" | "diagnostic";
  };

  parent_attempt_id?: string;

  timestamp: string;
}
