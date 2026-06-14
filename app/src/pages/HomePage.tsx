import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useLibrary } from "../lib/libraryContext";

export function HomePage() {
  const { user, loading, configured, error, signIn, signOutUser, userId, libraryId } =
    useAuth();
  const { bundle, studyCards, loading: libLoading, error: libError } = useLibrary();

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
                {bundle.manifest.name} — {studyCards.length} study cards loaded
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
        <p>Review library cards and upload <code>card_reviewed</code> events.</p>
        <Link
          to="/study"
          className={`btn btn-primary ${!user || libLoading ? "btn-disabled" : ""}`}
          aria-disabled={!user || libLoading}
          onClick={(e) => {
            if (!user || libLoading) e.preventDefault();
          }}
        >
          {libLoading ? "Loading library…" : "Start studying"}
        </Link>
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
        </div>
      </section>
    </div>
  );
}
