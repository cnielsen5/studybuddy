import { useCallback, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CardReview } from "../components/CardReview";
import { useAuth } from "../lib/auth";
import { useLibrary } from "../lib/libraryContext";
import { getConceptTitle } from "../lib/libraryTypes";
import { formatQueueReason } from "../lib/studyQueue";
import { useStudyQueue } from "../lib/useStudyQueue";
import type { ReviewGrade } from "../lib/types";

export function StudyPage() {
  const { client, user } = useAuth();
  const { bundle, studyCards, loading: libraryLoading, error: libraryError } = useLibrary();
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
    currentCard,
    position,
    refresh,
    advanceAfterReview,
  } = useStudyQueue(client, studyCards, libraryLoading, conceptFilter);

  const [message, setMessage] = useState<string | null>(null);
  const [lastSchedule, setLastSchedule] = useState<string | null>(null);

  const progress = queue.length > 0 ? `${position} / ${queue.length}` : "0 / 0";

  const handleReview = useCallback(
    async (grade: ReviewGrade, secondsSpent: number) => {
      if (!client || !currentCard) {
        setMessage("Client not ready — sign in from the home page.");
        return;
      }

      const cardId = currentCard.id;
      setMessage(null);
      setLastSchedule(null);

      const result = await client.reviewCard(cardId, grade, secondsSpent);

      if (!result.success) {
        setMessage(`Upload failed: ${result.error ?? "unknown error"}`);
        return;
      }

      setMessage(
        result.idempotent
          ? `Event already recorded (${result.eventId})`
          : `Review uploaded (${result.eventId})`
      );

      advanceAfterReview(cardId);

      await new Promise((r) => setTimeout(r, 2500));
      const schedule = await client.getCardSchedule(cardId);
      if (schedule) {
        setLastSchedule(
          `Next due: ${new Date(schedule.due_at).toLocaleString()} · stability ${schedule.stability.toFixed(2)}`
        );
      }

      await refresh();
    },
    [client, currentCard, advanceAfterReview, refresh]
  );

  if (!user) {
    return (
      <div className="page">
        <p>
          <Link to="/">Sign in on the home page</Link> to study.
        </p>
      </div>
    );
  }

  if (libraryLoading || queueLoading) {
    return (
      <div className="page">
        <p className="status">Loading study queue…</p>
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

  if (!currentCard) {
    return (
      <div className="page">
        <header className="page-header row">
          <div>
            <h1>Study</h1>
            <p className="subtitle">
              {conceptFilter ? `Nothing due for: ${filterLabel}` : "Nothing due right now"}
            </p>
          </div>
          <Link to="/" className="btn">Home</Link>
        </header>

        {conceptFilter && (
          <p className="banner banner-warn">
            Filtered to {conceptFilter.length} concept{conceptFilter.length === 1 ? "" : "s"}.{" "}
            <Link to="/study">Clear filter</Link> or{" "}
            <Link to="/concept-map">return to concept map</Link>.
          </p>
        )}

        {queueError && (
          <div className="banner banner-warn">
            <p>Could not load schedules: {queueError}</p>
          </div>
        )}

        <section className="panel">
          <p>All caught up — no new or due cards in the queue.</p>
          <p className="hint">
            {studyCards.length} cards in library. Schedules appear after your first review.
          </p>
          <button type="button" className="btn" onClick={() => refresh()} disabled={refreshing}>
            {refreshing ? "Refreshing…" : "Refresh queue"}
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header row">
        <div>
          <h1>Study</h1>
          <p className="subtitle">
            Card {progress}
            {stats.newCount > 0 && <> · {stats.newCount} new</>}
            {stats.overdueCount > 0 && <> · {stats.overdueCount} overdue</>}
            {stats.dueCount > 0 && <> · {stats.dueCount} due</>}
          </p>
          {filterLabel && (
            <p className="hint">
              Filtered: {filterLabel} · <Link to="/study">all concepts</Link>
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
          <p>Schedule query issue — showing new cards only. {queueError}</p>
        </div>
      )}

      {message && <div className="banner banner-ok"><p>{message}</p></div>}
      {lastSchedule && <p className="hint">{lastSchedule}</p>}

      <p className="queue-badge">{formatQueueReason(currentCard)}</p>

      <CardReview
        key={currentCard.id}
        card={currentCard}
        onReview={handleReview}
        disabled={!client || refreshing}
      />
    </div>
  );
}
