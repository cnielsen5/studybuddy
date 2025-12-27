export const validQuestionAttempt = {
  attempt_id: "attempt_0001",
  type: "question_attempt",

  user_id: "user_123",
  question_id: "q_0001",

  timestamp: "2025-11-08T09:04:00Z",

  response: {
    selected_option_id: "opt_B"
  },

  result: {
    correct: true
  },

  timing: {
    seconds_spent: 18
  }
} as const;
