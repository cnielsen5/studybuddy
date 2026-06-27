import { useEffect, useMemo, useState } from "react";
import type { LibraryReviewState } from "../../lib/libraryCreation/types.ts";

interface Props {
  review: LibraryReviewState;
  onBack: () => void;
  onPublish: () => void;
}

export function LibraryReviewStep({ review, onBack, onPublish }: Props) {
  const [flags, setFlags] = useState(review.flags);
  const [selectedId, setSelectedId] = useState(review.concepts[0]?.id ?? "");
  const [flagIndex, setFlagIndex] = useState(0);
  const [showFlags, setShowFlags] = useState(review.flags.length > 0);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantLog, setAssistantLog] = useState<string[]>([]);

  const pendingFlags = flags.filter((f) => f.resolution === "pending");
  const selectedConcept = review.concepts.find((c) => c.id === selectedId);
  const currentFlag = pendingFlags[flagIndex];

  useEffect(() => {
    if (pendingFlags.length === 0) setShowFlags(false);
  }, [pendingFlags.length]);

  const summary = review.summary;

  function resolveFlag(id: string, resolution: string) {
    setFlags((prev) => prev.map((f) => (f.id === id ? { ...f, resolution } : f)));
  }

  function skipAllFlags() {
    setFlags((prev) =>
      prev.map((f) =>
        f.resolution === "pending" ? { ...f, resolution: f.defaultResolution } : f
      )
    );
    setShowFlags(false);
  }

  function askAssistant() {
    const q = assistantInput.trim();
    if (!q) return;
    setAssistantLog((log) => [
      ...log,
      `You: ${q}`,
      `Assistant: I can explain flags and counts for this preview library. Full edits run after publish. (${summary.conceptCount} concepts, ${summary.cardCount} cards.)`,
    ]);
    setAssistantInput("");
  }

  const detailPanel = useMemo(() => {
    if (showFlags && currentFlag) {
      return (
        <div className="flag-card">
          <p className="flag-counter">
            {pendingFlags.length} thing{pendingFlags.length === 1 ? "" : "s"} to review —{" "}
            {flagIndex + 1} of {pendingFlags.length}
          </p>
          <h3>{currentFlag.title}</h3>
          <p className="flag-body">{currentFlag.body}</p>
          <div className="flag-actions">
            <button
              type="button"
              className="btn primary"
              onClick={() => {
                resolveFlag(currentFlag.id, currentFlag.defaultResolution);
                setFlagIndex(0);
              }}
            >
              {currentFlag.primaryAction}
            </button>
            {currentFlag.secondaryAction && (
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  resolveFlag(
                    currentFlag.id,
                    currentFlag.type === "scope_question" ? "exclude" : "skip_known"
                  );
                  setFlagIndex(0);
                }}
              >
                {currentFlag.secondaryAction}
              </button>
            )}
          </div>
          <button type="button" className="link-btn" onClick={() => setAssistantOpen(true)}>
            Not sure? Ask the assistant
          </button>
          <div className="flag-nav">
            <button
              type="button"
              disabled={flagIndex <= 0}
              onClick={() => setFlagIndex((i) => Math.max(0, i - 1))}
            >
              ←
            </button>
            <button
              type="button"
              disabled={flagIndex >= pendingFlags.length - 1}
              onClick={() => setFlagIndex((i) => Math.min(pendingFlags.length - 1, i + 1))}
            >
              →
            </button>
            <button type="button" className="link-btn" onClick={skipAllFlags}>
              Skip all — looks good
            </button>
          </div>
        </div>
      );
    }

    if (pendingFlags.length === 0 && review.flags.length === 0) {
      return (
        <div className="success-card">
          <h3>✓ Your library looks great</h3>
          <p>
            {summary.originNote ??
              "We didn't find anything that needs your attention. Browse the concept map on the left, or create your library now."}
          </p>
        </div>
      );
    }

    if (!selectedConcept) {
      return <p className="muted">Select a concept to inspect.</p>;
    }

    return (
      <div className="concept-detail">
        <h3>{selectedConcept.title}</h3>
        {selectedConcept.sectionPath && (
          <p className="muted">{selectedConcept.sectionPath.join(" → ")}</p>
        )}
        <p>
          {selectedConcept.cardCount} cards · {selectedConcept.questionCount} questions
        </p>
        <div className="detail-actions">
          <button type="button" className="btn secondary">
            Edit title
          </button>
          <button type="button" className="btn secondary">
            Merge…
          </button>
          <button type="button" className="btn secondary">
            Remove
          </button>
        </div>
      </div>
    );
  }, [
    showFlags,
    currentFlag,
    pendingFlags.length,
    flagIndex,
    selectedConcept,
    review.flags.length,
    summary.originNote,
  ]);

  return (
    <div className="review-layout">
      <aside className="review-left panel">
        <div className="library-summary-card">
          <h3>Your Library</h3>
          <ul className="summary-stats">
            <li>{summary.conceptCount} concepts</li>
            <li>{summary.cardCount} cards</li>
            <li>{summary.questionCount} questions</li>
          </ul>
          {summary.coveragePercent != null && summary.coverageLabel && (
            <div className="coverage">
              <span>Coverage of {summary.coverageLabel}</span>
              <div className="coverage-bar">
                <div style={{ width: `${summary.coveragePercent}%` }} />
              </div>
              <span>{summary.coveragePercent}%</span>
            </div>
          )}
          {summary.estimatedStudyHours != null && (
            <p className="muted">Estimated study time: ~{summary.estimatedStudyHours} hrs</p>
          )}
          {summary.originNote && (
            <p className="origin-note">{summary.originNote}</p>
          )}
        </div>
        <ul className="concept-tree">
          {review.concepts.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={
                  selectedId === c.id ? "concept-node selected" : "concept-node"
                }
                onClick={() => {
                  setSelectedId(c.id);
                  setShowFlags(false);
                }}
              >
                <span className={`status-dot ${c.status}`} />
                <span>{c.title}</span>
                <span className="node-meta">{c.cardCount}c</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="review-center panel">{detailPanel}</section>

      <aside className={`review-assistant ${assistantOpen ? "open" : "collapsed"}`}>
        {assistantOpen ? (
          <div className="assistant-panel panel">
            <header>
              <h3>Library assistant</h3>
              <button type="button" onClick={() => setAssistantOpen(false)}>
                ×
              </button>
            </header>
            <div className="assistant-log">
              {assistantLog.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <div className="assistant-input">
              <input
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                placeholder="Ask about this library…"
                onKeyDown={(e) => e.key === "Enter" && askAssistant()}
              />
              <button type="button" onClick={askAssistant}>
                Send
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="assistant-tab" onClick={() => setAssistantOpen(true)}>
            Ask anything about your library
          </button>
        )}
      </aside>

      <footer className="review-footer">
        <span>
          {pendingFlags.length > 0
            ? `${pendingFlags.length} flag${pendingFlags.length === 1 ? "" : "s"} remaining`
            : "Ready to publish"}
        </span>
        <div>
          {pendingFlags.length > 0 && (
            <button type="button" className="btn secondary" onClick={() => setShowFlags(true)}>
              Review flags
            </button>
          )}
          <button type="button" className="btn secondary" onClick={onBack}>
            ← Back
          </button>
          <button type="button" className="btn primary" onClick={onPublish}>
            Create Library →
          </button>
        </div>
      </footer>
    </div>
  );
}
