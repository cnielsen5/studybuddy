import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { QuestionReview } from "../components/QuestionReview";
import { useAuth } from "../lib/auth";
import { useLibrary } from "../lib/libraryContext";
import { getConceptTitle } from "../lib/libraryTypes";
import { formatUsageRole } from "../lib/questionQueue";
import { useQuestionQueue } from "../lib/useQuestionQueue";

export function QuestionsPage() {
  const { client, user } = useAuth();
  const { bundle, studyQuestions, loading: libraryLoading, error: libraryError } = useLibrary();
  const [searchParams] = useSearchParams();

  const conceptFilter = useMemo(() => {
    const raw = searchParams.get("concepts") ?? searchParams.get("concept");
    if (!raw) return null;
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }, [searchParams]);

  const filterLabel = useMemo(() => {
    if (!conceptFilter?.length || !bundle) return null;
    return conceptFilter.map((id) => getConceptTitle(bundle, id)).join(", ");
  }, [conceptFilter, bundle]);

  const {
    queue,
    stats,
    loading: queueLoading,
    refreshing,
    error: queueError,
    currentQuestion,
    position,
    refresh,
    advanceAfterAttempt,
  } = useQuestionQueue(client, studyQuestions, libraryLoading, conceptFilter);

  const [message, setMessage] = useState<string | null>(null);
  const [lastPerf, setLastPerf] = useState<string | null>(null);
  const [showNext, setShowNext] = useState(false);

  const progress =
    queue.length > 0 ? `${position} / ${queue.length}` : "0 / 0";

  const handleAttempt = useCallback(
    async (selectedOptionId: string, correct: boolean, secondsSpent: number) => {
      if (!client || !currentQuestion) {
        throw new Error("Client not ready — sign in from the home page.");
      }

      setMessage(null);
      setLastPerf(null);

      const result = await client.attemptQuestion(
        currentQuestion.id,
        selectedOptionId,
        correct,
        secondsSpent
      );

      if (!result.success) {
        throw new Error(result.error ?? "unknown error");
      }

      setMessage(
        result.idempotent
          ? `Event already recorded (${result.eventId})`
          : `Attempt uploaded (${result.eventId})`
      );
      setShowNext(true);

      await new Promise((r) => setTimeout(r, 2500));
      const perf = await client.getQuestionPerformance(currentQuestion.id);
      if (perf) {
        setLastPerf(
          `Accuracy ${(perf.accuracy_rate * 100).toFixed(0)}% · ${perf.total_attempts} attempt${perf.total_attempts === 1 ? "" : "s"}`
        );
      }
    },
    [client, currentQuestion]
  );

  const handleNext = useCallback(() => {
    if (!currentQuestion) return;
    advanceAfterAttempt(currentQuestion.id);
    setShowNext(false);
    setMessage(null);
    setLastPerf(null);
    void refresh();
  }, [currentQuestion, advanceAfterAttempt, refresh]);

  if (!user) {
    return (
      <div className="page">
        <p>
          <Link to="/">Sign in on the home page</Link> to practice questions.
        </p>
      </div>
    );
  }

  if (libraryLoading || queueLoading) {
    return (
      <div className="page">
        <p className="status">Loading question queue…</p>
      </div>
    );
  }

  if (libraryError) {
    return (
      <div className="page">
        <p className="banner banner-error">{libraryError}</p>
        <Link to="/" className="btn">Home</Link>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="page">
        <header className="page-header row">
          <div>
            <h1>Questions</h1>
            <p className="subtitle">
              {conceptFilter ? `No questions for: ${filterLabel}` : "Queue complete"}
            </p>
          </div>
          <Link to="/" className="btn">Home</Link>
        </header>

        {conceptFilter && (
          <p className="banner banner-warn">
            Filtered to {conceptFilter.length} concept{conceptFilter.length === 1 ? "" : "s"}.{" "}
            <Link to="/questions">Clear filter</Link> or{" "}
            <Link to="/concept-map">return to concept map</Link>.
          </p>
        )}

        <section className="panel">
          <p>
            {conceptFilter
              ? "No questions linked to the selected concepts."
              : `You've worked through all ${studyQuestions.length} questions in the queue.`}
          </p>
          <button type="button" className="btn btn-primary" onClick={() => refresh()}>
            Reload queue
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header row">
        <div>
          <h1>Questions</h1>
          <p className="subtitle">
            {progress}
            {stats.newCount > 0 && <> · {stats.newCount} new</>}
            {stats.reviewCount > 0 && <> · {stats.reviewCount} review</>}
          </p>
          {filterLabel && (
            <p className="hint">
              Filtered: {filterLabel} · <Link to="/questions">all concepts</Link>
            </p>
          )}
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="btn"
            onClick={() => refresh()}
            disabled={refreshing}
          >
            {refreshing ? "…" : "Refresh"}
          </button>
          <Link to="/concept-map" className="btn btn-secondary">
            Map
          </Link>
          <Link to="/" className="btn">Home</Link>
        </div>
      </header>

      {queueError && (
        <div className="banner banner-warn">
          <p>Could not load performance views — showing all as new. {queueError}</p>
        </div>
      )}

      <p className="queue-badge">
        {currentQuestion.queueReason === "new"
          ? "New"
          : `Review · ${((currentQuestion.performance?.accuracy_rate ?? 0) * 100).toFixed(0)}% accuracy`}
        {" · "}
        {formatUsageRole(currentQuestion.usageRole)}
      </p>

      {message && <div className="banner banner-ok"><p>{message}</p></div>}
      {lastPerf && <p className="hint">{lastPerf}</p>}

      <QuestionReview
        key={currentQuestion.id}
        question={currentQuestion}
        onAttempt={handleAttempt}
        disabled={!client || refreshing}
      />

      {showNext && (
        <button type="button" className="btn btn-primary question-next" onClick={handleNext}>
          Next question
        </button>
      )}
    </div>
  );
}
