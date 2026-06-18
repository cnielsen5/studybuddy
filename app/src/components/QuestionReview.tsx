import { useEffect, useState } from "react";
import type { StudyQuestion } from "../lib/libraryTypes";
import { formatUsageRole } from "../lib/questionQueue";

interface QuestionReviewProps {
  question: StudyQuestion;
  onAttempt: (
    selectedOptionId: string,
    correct: boolean,
    secondsSpent: number
  ) => Promise<void>;
  disabled?: boolean;
}

type Phase = "select" | "result";

export function QuestionReview({ question, onAttempt, disabled }: QuestionReviewProps) {
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isCorrect = selectedId === question.correctOptionId;

  useEffect(() => {
    setPhase("select");
    setSelectedId(null);
    setSubmitting(false);
    setUploadError(null);
    setStartedAt(Date.now());
  }, [question.id]);

  async function handleSubmit(optionId?: string) {
    const choice = optionId ?? selectedId;
    if (!choice || phase !== "select") return;

    setSubmitting(true);
    setUploadError(null);
    const secondsSpent = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const correct = choice === question.correctOptionId;

    try {
      await onAttempt(choice, correct, secondsSpent);
      setPhase("result");
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (disabled || submitting || phase !== "select") return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const index = Number(e.key) - 1;
      if (index >= 0 && index < question.options.length) {
        e.preventDefault();
        setSelectedId(question.options[index].id);
        return;
      }

      if (e.key === "Enter" && selectedId) {
        e.preventDefault();
        void handleSubmit(selectedId);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [disabled, submitting, phase, question.id, question.options, selectedId]);

  function optionClass(optionId: string): string {
    if (phase === "select") {
      return selectedId === optionId ? "option-btn option-selected" : "option-btn";
    }

    if (optionId === question.correctOptionId) return "option-btn option-correct";
    if (optionId === selectedId && !isCorrect) return "option-btn option-wrong";
    return "option-btn option-muted";
  }

  return (
    <div className="question-review">
      <p className="card-meta">
        {question.id}
        {question.conceptIds.length > 0 && (
          <> · {question.conceptIds.join(", ")}</>
        )}
        <> · {formatUsageRole(question.usageRole)}</>
        <> · {question.difficulty}</>
      </p>

      <div className="card-face">
        <p className="card-label">Question</p>
        <p className="card-text">{question.stem}</p>
      </div>

      <div className="option-list" role="radiogroup" aria-label="Answer options">
        {question.options.map((option, index) => (
          <button
            key={option.id}
            type="button"
            className={optionClass(option.id)}
            onClick={() => phase === "select" && setSelectedId(option.id)}
            disabled={disabled || submitting || phase === "result"}
            aria-pressed={selectedId === option.id}
          >
            <span className="option-id">{index + 1}</span>
            <span className="option-text">{option.text}</span>
          </button>
        ))}
      </div>

      {phase === "select" ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => handleSubmit()}
          disabled={disabled || submitting || !selectedId}
        >
          {submitting ? "Submitting…" : "Submit answer"}
          <span className="kbd-hint">Enter</span>
        </button>
      ) : (
        <div className={`result-panel ${isCorrect ? "result-correct" : "result-wrong"}`}>
          <p className="result-heading">{isCorrect ? "Correct" : "Incorrect"}</p>
          <p className="card-text">{question.explanations.general}</p>
          {!isCorrect && selectedId && question.explanations.distractors?.[selectedId] && (
            <p className="hint">
              Your choice: {question.explanations.distractors[selectedId]}
            </p>
          )}
        </div>
      )}

      {uploadError && (
        <div className="banner banner-error">
          <p>Upload failed: {uploadError}</p>
        </div>
      )}
    </div>
  );
}
