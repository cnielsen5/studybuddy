export enum CardState {
  NEW = 0,
  LEARNING = 1,
  REVIEW = 2,
  RELEARNING = 3
}

export enum CardType {
  BASIC = "basic",
  CLOZE = "cloze",
  IMAGE_OCCLUSION = "image_occlusion",
  RELATIONSHIP = "relationship"
}

export enum CardWeight {
  RECOGNITION = "recognition",
  RECALL = "recall",
  SYNTHESIS = "synthesis",
  APPLICATION/ANALYSIS = "application/analysis",
  INTEGRATION = "integration" 
}

export enum QuestionType {
  MCQ = "mcq",
  SELECT_ALL = "select_all",
  MATCHING = "matching"
}

export enum CognitiveLevel {
  PATHOPHYSIOLOGY = "pathophysiology",
  DIAGNOSIS = "diagnosis",
  MANAGEMENT = "management",
  MECHANISM = "mechanism"
}

export enum ErrorType {
  MISCONCEPTION = "misconception",
  RETRIEVAL_FAILURE = "retrieval_failure",
  MISREADING = "misreading",
  STRATEGY_ERROR = "strategy_error",
  TIME_PRESSURE = "time_pressure"
}

export enum PrimaryReason {
  DUE = "due",
  NEW_CARD = "new_card",
  CRAM_MODE = "cram_mode",
  MISCONCEPTION_REMEDIATION = "misconception_remediation",
  PREREQUISITE_UNLOCK = "prerequisite_unlock",
  RELATIONSHIP_SYNTHESIS = "relationship_synthesis",
  DIAGNOSTIC_PROBE = "diagnostic_probe",
  TARGETED_REINFORCEMENT = "targeted_reinforcement"
}
