import { useState } from "react";
import type { ReviewGrade, StudyCard } from "../lib/types";

interface CardReviewProps {
  card: StudyCard;
  onReview: (grade: ReviewGrade, secondsSpent: number) => Promise<void>;
  disabled?: boolean;
}

const GRADES: { grade: ReviewGrade; label: string; hint: string }[] = [
  { grade: "again", label: "Again", hint: "< 1 day" },
  { grade: "hard", label: "Hard", hint: "Struggled" },
  { grade: "good", label: "Good", hint: "Recalled" },
  { grade: "easy", label: "Easy", hint: "Effortless" },
];

export function CardReview({ card, onReview, disabled }: CardReviewProps) {
  const [revealed, setRevealed] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);

  async function handleGrade(grade: ReviewGrade) {
    setSubmitting(true);
    const secondsSpent = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    try {
      await onReview(grade, secondsSpent);
      setRevealed(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card-review">
      <p className="card-meta">
        {card.id} · {card.conceptId}
        {card.role && <> · {card.role}</>}
      </p>

      <div className="card-face">
        <p className="card-label">Front</p>
        <p className="card-text">{card.front}</p>
      </div>

      {!revealed ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setRevealed(true)}
          disabled={disabled || submitting}
        >
          Show answer
        </button>
      ) : (
        <>
          <div className="card-face card-back">
            <p className="card-label">Back</p>
            <p className="card-text">{card.back}</p>
          </div>

          <div className="grade-grid">
            {GRADES.map(({ grade, label, hint }) => (
              <button
                key={grade}
                type="button"
                className={`btn grade-btn grade-${grade}`}
                onClick={() => handleGrade(grade)}
                disabled={disabled || submitting}
              >
                <span className="grade-label">{label}</span>
                <span className="grade-hint">{hint}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {submitting && <p className="status">Uploading review…</p>}
    </div>
  );
}
