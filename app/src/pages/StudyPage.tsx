import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { CardReview } from "../components/CardReview";
import { useAuth } from "../lib/auth";
import { useLibrary } from "../lib/libraryContext";
import type { ReviewGrade } from "../lib/types";

export function StudyPage() {
  const { client, user } = useAuth();
  const { studyCards, loading, error } = useLibrary();
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [lastSchedule, setLastSchedule] = useState<string | null>(null);

  const total = studyCards.length;
  const card = total > 0 ? studyCards[index % total] : null;
  const progress = total > 0 ? `${(index % total) + 1} / ${total}` : "0 / 0";

  const handleReview = useCallback(
    async (grade: ReviewGrade, secondsSpent: number) => {
      if (!client || !card) {
        setMessage("Client not ready — sign in from the home page.");
        return;
      }

      setMessage(null);
      const result = await client.reviewCard(card.id, grade, secondsSpent);

      if (!result.success) {
        setMessage(`Upload failed: ${result.error ?? "unknown error"}`);
        return;
      }

      setMessage(
        result.idempotent
          ? `Event already recorded (${result.eventId})`
          : `Review uploaded (${result.eventId})`
      );

      await new Promise((r) => setTimeout(r, 3000));
      const schedule = await client.getCardSchedule(card.id);
      if (schedule) {
        setLastSchedule(
          `Next due: ${new Date(schedule.due_at).toLocaleString()} · stability ${schedule.stability.toFixed(2)}`
        );
      }

      setIndex((i) => i + 1);
    },
    [client, card]
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

  if (loading) {
    return (
      <div className="page">
        <p className="status">Loading library cards…</p>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="page">
        <p className="banner banner-error">{error ?? "No cards in library"}</p>
        <Link to="/" className="btn">Home</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header row">
        <div>
          <h1>Study</h1>
          <p className="subtitle">Card {progress}</p>
        </div>
        <Link to="/" className="btn">
          Home
        </Link>
      </header>

      {message && <div className="banner banner-ok"><p>{message}</p></div>}
      {lastSchedule && <p className="hint">{lastSchedule}</p>}

      <CardReview card={card} onReview={handleReview} disabled={!client} />
    </div>
  );
}
