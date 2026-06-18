import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { QuestionReview } from "../components/QuestionReview";
import { useAuth } from "../lib/auth";
import {
  buildCertificationQuestions,
  certificationResultDescription,
  certificationResultLabel,
  computeCertificationOutcome,
  type CertificationOutcome,
} from "../lib/certification";
import { useLibrary } from "../lib/libraryContext";
import { getConceptTitle } from "../lib/libraryTypes";

type Phase = "intro" | "questions" | "result";

export function CertificationPage() {
  const { client, user } = useAuth();
  const { bundle, studyQuestions, loading: libraryLoading, error: libraryError } = useLibrary();
  const [searchParams] = useSearchParams();
  const conceptId = searchParams.get("concept");

  const concept = useMemo(
    () => bundle?.concepts.find((c) => c.id === conceptId) ?? null,
    [bundle, conceptId]
  );

  const questions = useMemo(() => {
    if (!concept) return [];
    return buildCertificationQuestions(concept, studyQuestions);
  }, [concept, studyQuestions]);

  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [outcome, setOutcome] = useState<CertificationOutcome | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[index] ?? null;
  const progress =
    questions.length > 0 ? `${Math.min(index + 1, questions.length)} / ${questions.length}` : "0 / 0";

  const threshold = concept?.mastery_config?.threshold ?? 0.8;
  const minForFull = concept?.mastery_config?.min_questions_correct ?? 2;

  const handleAttempt = useCallback(
    async (selectedOptionId: string, correct: boolean, secondsSpent: number) => {
      if (!client || !currentQuestion) {
        throw new Error("Client not ready — sign in from the home page.");
      }

      const attemptResult = await client.attemptQuestion(
        currentQuestion.id,
        selectedOptionId,
        correct,
        secondsSpent
      );

      if (!attemptResult.success) {
        throw new Error(attemptResult.error ?? "Failed to record attempt");
      }

      const nextCorrect = correctCount + (correct ? 1 : 0);
      setCorrectCount(nextCorrect);

      const isLast = index >= questions.length - 1;
      if (!isLast) {
        setIndex((i) => i + 1);
        return;
      }

      const computed = computeCertificationOutcome(
        nextCorrect,
        questions.length,
        threshold,
        minForFull
      );
      setOutcome(computed);
      setPhase("result");
      setSubmitting(true);
      setUploadMessage(null);
      setUploadError(null);

      try {
        const certResult = await client.completeCertification(
          concept!.id,
          computed.result,
          computed.questionsAnswered,
          computed.correctCount
        );

        if (!certResult.success) {
          throw new Error(certResult.error ?? "Failed to record certification");
        }

        setUploadMessage(
          certResult.idempotent
            ? `Certification already recorded (${certResult.eventId})`
            : `Certification uploaded (${certResult.eventId})`
        );
      } catch (e) {
        setUploadError(e instanceof Error ? e.message : String(e));
      } finally {
        setSubmitting(false);
      }
    },
    [
      client,
      concept,
      correctCount,
      currentQuestion,
      index,
      minForFull,
      questions.length,
      threshold,
    ]
  );

  function resetFlow() {
    setPhase("intro");
    setIndex(0);
    setCorrectCount(0);
    setOutcome(null);
    setUploadMessage(null);
    setUploadError(null);
    setSubmitting(false);
  }

  if (libraryLoading) return <p className="status">Loading library…</p>;

  if (libraryError || !bundle) {
    return (
      <div className="page">
        <p className="banner banner-error">{libraryError ?? "Library not loaded"}</p>
        <Link to="/" className="btn">
          Home
        </Link>
      </div>
    );
  }

  if (!conceptId || !concept) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>Certification</h1>
          <p className="subtitle">Select a concept from the map to certify.</p>
        </header>
        <Link to="/concept-map" className="btn">
          Concept Map
        </Link>
      </div>
    );
  }

  if (!user || !client) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>Certify: {concept.content.title}</h1>
        </header>
        <p className="banner banner-warn">Sign in from the home page to run certification.</p>
        <Link to="/" className="btn">
          Home
        </Link>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>Certify: {concept.content.title}</h1>
        </header>
        <p className="banner banner-warn">
          No linked certification questions for this concept yet.
        </p>
        <Link to="/concept-map" className="btn">
          Back to Concept Map
        </Link>
      </div>
    );
  }

  return (
    <div className="page certification-page">
      <header className="page-header row">
        <div>
          <h1>Certify: {concept.content.title}</h1>
          <p className="subtitle">
            Answer linked questions to demonstrate mastery. Pass threshold:{" "}
            {Math.round(threshold * 100)}%.
          </p>
        </div>
        <div className="header-actions">
          <Link to="/concept-map" className="btn btn-secondary">
            Map
          </Link>
        </div>
      </header>

      {phase === "intro" && (
        <section className="panel">
          <h2>Certification gate</h2>
          <p className="hint">{concept.content.definition}</p>
          <p className="hint">
            {questions.length} question{questions.length === 1 ? "" : "s"} · partial pass at{" "}
            {Math.round(threshold * 100)}% · full certification requires perfect accuracy with at
            least {minForFull} correct.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => setPhase("questions")}>
            Start certification
          </button>
        </section>
      )}

      {phase === "questions" && currentQuestion && (
        <section className="panel">
          <p className="queue-badge">Certification · {progress}</p>
          <QuestionReview
            key={currentQuestion.id}
            question={currentQuestion}
            onAttempt={handleAttempt}
            disabled={submitting}
          />
        </section>
      )}

      {phase === "result" && outcome && (
        <section className="panel certification-result">
          <h2>{certificationResultLabel(outcome.result)}</h2>
          <p className="hint">
            {outcome.correctCount} / {outcome.questionsAnswered} correct (
            {Math.round(outcome.accuracy * 100)}%)
          </p>
          <p>{certificationResultDescription(outcome.result)}</p>

          {uploadMessage && <p className="banner banner-ok">{uploadMessage}</p>}
          {uploadError && <p className="banner banner-error">{uploadError}</p>}

          <div className="certification-result-actions">
            <button type="button" className="btn btn-secondary" onClick={resetFlow}>
              Retry
            </button>
            <Link
              to={`/concept-map?concept=${concept.id}`}
              className="btn btn-primary"
            >
              Back to {getConceptTitle(bundle, concept.id)}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
