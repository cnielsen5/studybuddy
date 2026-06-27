import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useLibrary } from "../lib/libraryContext";
import { useDeckStats } from "../lib/useDeckStats";

export function HomePage() {
  const { user, loading, configured, error, signIn, signOutUser, userId, libraryId, client } =
    useAuth();
  const { bundle, studyCards, studyQuestions, loading: libLoading, error: libError } = useLibrary();
  const { stats: deckStats, loading: deckLoading, error: deckError } = useDeckStats(
    client,
    studyCards,
    libLoading
  );

  if (loading) {
    return <p className="status">Loading…</p>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Socrates</h1>
        <p className="subtitle">Offline-first spaced repetition</p>
      </header>

      {!configured && (
        <div className="banner banner-warn">
          <p>
            Firebase is not configured. Copy <code>.env.example</code> to{" "}
            <code>.env.local</code> and add your staging credentials.
          </p>
        </div>
      )}

      {error && (
        <div className="banner banner-error">
          <p>{error}</p>
        </div>
      )}

      {libError && (
        <div className="banner banner-error">
          <p>Library: {libError}</p>
        </div>
      )}

      {user && bundle && (
        <section className="panel">
          <h2>Deck</h2>
          {deckLoading ? (
            <p className="status">Loading deck stats…</p>
          ) : deckStats ? (
            <>
              <div className="deck-stats">
                <div className="stat-box">
                  <span className="stat-value">{deckStats.total}</span>
                  <span className="stat-label">In deck</span>
                </div>
                <div className="stat-box stat-learn">
                  <span className="stat-value">{deckStats.toLearn}</span>
                  <span className="stat-label">To learn</span>
                </div>
                <div className="stat-box stat-due">
                  <span className="stat-value">{deckStats.dueToReview}</span>
                  <span className="stat-label">Due</span>
                </div>
              </div>
              {deckError && (
                <p className="hint">Schedule sync issue — counts may be approximate.</p>
              )}
            </>
          ) : null}
        </section>
      )}

      <section className="panel">
        <h2>Session</h2>
        {user ? (
          <>
            <p>
              Signed in as <code>{user.email ?? user.uid}</code>
            </p>
            <p>
              User ID: <code>{userId}</code> · Library: <code>{libraryId}</code>
            </p>
            {bundle && (
              <p className="hint">
                {bundle.manifest.name} — {studyQuestions.length} questions
              </p>
            )}
            <button type="button" className="btn" onClick={() => signOutUser()}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <p>Sign in to upload reviews to staging Firestore.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => signIn()}
              disabled={!configured}
            >
              Sign in (dev)
            </button>
          </>
        )}
      </section>

      <section className="panel">
        <h2>Study</h2>
        <p>Review due cards or practice MCQs from the library.</p>
        <div className="nav-grid">
          <Link
            to="/study"
            className={`btn btn-primary ${!user || libLoading ? "btn-disabled" : ""}`}
            aria-disabled={!user || libLoading}
            onClick={(e) => {
              if (!user || libLoading) e.preventDefault();
            }}
          >
            {libLoading ? "Loading…" : "Cards"}
          </Link>
          <Link
            to="/questions"
            className={`btn btn-primary ${!user || libLoading ? "btn-disabled" : ""}`}
            aria-disabled={!user || libLoading}
            onClick={(e) => {
              if (!user || libLoading) e.preventDefault();
            }}
          >
            Questions
          </Link>
        </div>
        {!user && (
          <p className="hint">Sign in first — Firestore rules require authentication.</p>
        )}
      </section>

      <section className="panel">
        <h2>Content</h2>
        <p>Browse the full library and explore the concept map.</p>
        <div className="nav-grid">
          <Link to="/library" className="btn">
            Browse library
          </Link>
          <Link to="/concept-map" className="btn">
            Concept map
          </Link>
          <Link to="/create-library" className="btn btn-primary">
            Create library
          </Link>
        </div>
      </section>
    </div>
  );
}
