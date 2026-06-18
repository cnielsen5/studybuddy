import { useEffect, useMemo, useState } from "react";
import {
  buildClozeFieldMap,
  getClozeFieldAnswer,
  splitClozeTemplate,
  type ClozeData,
} from "../lib/cloze";
import type { ReviewGrade, StudyCard } from "../lib/types";

interface CardReviewProps {
  card: StudyCard;
  onReview: (grade: ReviewGrade, secondsSpent: number) => Promise<void>;
  disabled?: boolean;
}

const GRADES: { grade: ReviewGrade; label: string; hint: string; key: string }[] = [
  { grade: "again", label: "Again", hint: "< 1 day", key: "1" },
  { grade: "hard", label: "Hard", hint: "Struggled", key: "2" },
  { grade: "good", label: "Good", hint: "Recalled", key: "3" },
  { grade: "easy", label: "Easy", hint: "Effortless", key: "4" },
];

const GRADE_BY_KEY: Record<string, ReviewGrade> = {
  "1": "again",
  "2": "hard",
  "3": "good",
  "4": "easy",
};

function isClozeCard(card: StudyCard): card is StudyCard & { clozeData: ClozeData } {
  return card.cardType === "cloze" && card.clozeData != null;
}

function ClozeSentence({
  clozeData,
  revealed,
}: {
  clozeData: ClozeData;
  revealed: boolean;
}) {
  const fieldMap = useMemo(
    () => buildClozeFieldMap(clozeData.cloze_fields),
    [clozeData.cloze_fields]
  );
  const segments = useMemo(
    () => splitClozeTemplate(clozeData.template_text),
    [clozeData.template_text]
  );

  return (
    <p className="card-text cloze-sentence">
      {segments.map((segment, i) => {
        if (segment.type === "text") {
          return <span key={i}>{segment.value}</span>;
        }

        const field = fieldMap.get(segment.fieldId);
        const answer = getClozeFieldAnswer(segment.fieldId, fieldMap);

        if (revealed) {
          return (
            <span key={i} className="cloze-answer" title={field?.hint}>
              {answer}
            </span>
          );
        }

        return (
          <span key={i} className="cloze-blank" title={field?.hint}>
            ________
          </span>
        );
      })}
    </p>
  );
}

function GradeButtons({
  onGrade,
  disabled,
}: {
  onGrade: (grade: ReviewGrade) => void;
  disabled: boolean;
}) {
  return (
    <div className="grade-grid">
      {GRADES.map(({ grade, label, hint, key }) => (
        <button
          key={grade}
          type="button"
          className={`btn grade-btn grade-${grade}`}
          onClick={() => onGrade(grade)}
          disabled={disabled}
        >
          <span className="grade-key">{key}</span>
          <span className="grade-label">{label}</span>
          <span className="grade-hint">
            {hint}
            {grade === "good" && " · Space"}
          </span>
        </button>
      ))}
    </div>
  );
}

export function CardReview({ card, onReview, disabled }: CardReviewProps) {
  const [revealed, setRevealed] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);

  const cloze = isClozeCard(card);

  useEffect(() => {
    setRevealed(false);
    setSubmitting(false);
    setStartedAt(Date.now());
  }, [card.id]);

  async function handleGrade(grade: ReviewGrade) {
    if (submitting || disabled) return;
    setSubmitting(true);
    const secondsSpent = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    try {
      await onReview(grade, secondsSpent);
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (disabled || submitting) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (!revealed) {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          setRevealed(true);
        }
        return;
      }

      if (e.key === " ") {
        e.preventDefault();
        void handleGrade("good");
        return;
      }

      const grade = GRADE_BY_KEY[e.key];
      if (grade) {
        e.preventDefault();
        void handleGrade(grade);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [revealed, disabled, submitting, card.id]);

  return (
    <div className="card-review">
      <p className="card-meta">
        {card.id} · {card.conceptId}
        {card.role && <> · {card.role}</>}
        {cloze && <> · cloze</>}
      </p>

      {cloze ? (
        <>
          <div className={`card-face ${revealed ? "card-back" : ""}`}>
            <p className="card-label">
              {revealed ? "Answers" : "Fill in the blanks"}
            </p>
            <ClozeSentence clozeData={card.clozeData} revealed={revealed} />
          </div>

          {!revealed ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setRevealed(true)}
              disabled={disabled || submitting}
            >
              Reveal answers <span className="kbd-hint">Space</span>
            </button>
          ) : (
            <GradeButtons onGrade={handleGrade} disabled={disabled || submitting} />
          )}
        </>
      ) : (
        <>
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
              Show answer <span className="kbd-hint">Space</span>
            </button>
          ) : (
            <>
              <div className="card-face card-back">
                <p className="card-label">Back</p>
                <p className="card-text">{card.back}</p>
              </div>
              <GradeButtons onGrade={handleGrade} disabled={disabled || submitting} />
            </>
          )}
        </>
      )}

      {submitting && <p className="status">Uploading review…</p>}
    </div>
  );
}
