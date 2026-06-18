import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ConceptMapGraph, conceptMapStats } from "../components/ConceptMapGraph";
import { useAuth } from "../lib/auth";
import {
  deriveAggregateMetrics,
  deriveConceptMetrics,
  formatStageCounts,
  conceptStateLabel,
} from "../lib/conceptDerivedMetrics";
import { useLibrary } from "../lib/libraryContext";
import type { TaxonomyNode } from "../lib/conceptMapHierarchy";
import { getConceptTitle } from "../lib/libraryTypes";
import { useConceptDerivedData } from "../lib/useConceptDerivedData";

export function ConceptMapPage() {
  const { bundle, studyCards, loading, error } = useLibrary();
  const { user } = useAuth();
  const { schedules, performances, loading: derivedLoading } = useConceptDerivedData(loading);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<TaxonomyNode | null>(null);

  const stats = useMemo(() => (bundle ? conceptMapStats(bundle) : null), [bundle]);

  const selectedConcept =
    selectedNode?.level === "concept" && selectedNode.conceptIds[0]
      ? bundle?.concepts.find((c) => c.id === selectedNode.conceptIds[0]) ?? null
      : null;

  const selectedMetrics = useMemo(() => {
    if (!bundle || !selectedNode) return null;
    if (selectedConcept) {
      return deriveConceptMetrics(
        selectedConcept,
        studyCards,
        schedules,
        performances
      );
    }
    return deriveAggregateMetrics(
      selectedNode.conceptIds,
      bundle.concepts,
      studyCards,
      schedules,
      performances
    );
  }, [bundle, selectedNode, selectedConcept, studyCards, schedules, performances]);

  const conceptQuery =
    selectedNode && selectedNode.conceptIds.length > 0
      ? selectedNode.conceptIds.join(",")
      : null;

  const studyUrl = conceptQuery ? `/study?concepts=${conceptQuery}` : null;
  const questionsUrl = conceptQuery ? `/questions?concepts=${conceptQuery}` : null;

  if (loading) return <p className="status">Loading concept map…</p>;
  if (error || !bundle) {
    return (
      <div className="page">
        <p className="banner banner-error">{error ?? "Library not loaded"}</p>
        <Link to="/" className="btn">Home</Link>
      </div>
    );
  }

  return (
    <div className="page concept-map-page">
      <header className="page-header row">
        <div>
          <h1>Concept Map</h1>
          <p className="subtitle">
            {bundle.manifest.name} · {stats?.domains ?? 0} domains · {stats?.categories ?? 0}{" "}
            categories · {stats?.concepts ?? 0} concepts
          </p>
        </div>
        <div className="header-actions">
          <Link to="/library" className="btn btn-secondary">
            Library
          </Link>
          <Link to="/" className="btn">
            Home
          </Link>
        </div>
      </header>

      {!user && (
        <p className="banner banner-warn">
          Sign in to color nodes by ConceptState and retention. Unsigned view shows all nodes as
          unintroduced.
        </p>
      )}

      <section className="panel concept-map-controls">
        <p className="hint">
          Zoom out for domains and categories; zoom in for concepts. Color = ConceptState (depth of
          learning). Opacity = retention (recall likelihood now). Robust requires core cards mastered
          plus certification questions at threshold.
        </p>
        {derivedLoading && user && <p className="status">Loading schedule state…</p>}
      </section>

      <div className="concept-map-wrap">
        <ConceptMapGraph
          bundle={bundle}
          studyCards={studyCards}
          schedules={schedules}
          performances={performances}
          selectedId={selectedId}
          onSelect={(id, node) => {
            setSelectedId(id);
            setSelectedNode(node);
          }}
        />
      </div>

      {selectedNode && selectedMetrics && (
        <section className="panel concept-detail">
          <div className="concept-detail-header">
            <div>
              <h2>{selectedNode.label}</h2>
              <p className="hint">
                {selectedNode.level} · {selectedNode.cardCount} cards ·{" "}
                {selectedNode.subconceptCount} concepts ·{" "}
                <strong>{conceptStateLabel(selectedMetrics.conceptState)}</strong> · retention{" "}
                {Math.round(selectedMetrics.retentionScore * 100)}%
              </p>
              <p className="hint stage-counts">
                Cards: {formatStageCounts(selectedMetrics.stageCounts)}
              </p>
            </div>
            <div className="concept-detail-actions">
              {studyUrl && user && (
                <Link to={studyUrl} className="btn btn-primary btn-sm">
                  Study
                </Link>
              )}
              {questionsUrl && user && (
                <Link to={questionsUrl} className="btn btn-secondary btn-sm">
                  Questions
                </Link>
              )}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSelectedId(null);
                  setSelectedNode(null);
                }}
              >
                Close
              </button>
            </div>
          </div>

          {selectedConcept ? (
            <>
              <p className="concept-def">{selectedConcept.content.definition}</p>
              <p className="hint">{selectedConcept.content.summary}</p>
              {selectedConcept.dependency_graph.prerequisites.length > 0 && (
                <p className="hint">
                  <strong>Prerequisites:</strong>{" "}
                  {selectedConcept.dependency_graph.prerequisites
                    .map((id) => getConceptTitle(bundle, id))
                    .join(", ")}
                </p>
              )}
              {selectedConcept.dependency_graph.unlocks.length > 0 && (
                <p className="hint">
                  <strong>Unlocks:</strong>{" "}
                  {selectedConcept.dependency_graph.unlocks
                    .map((id) => getConceptTitle(bundle, id))
                    .join(", ")}
                </p>
              )}
            </>
          ) : (
            <p className="hint">
              Aggregated view over {selectedNode.subconceptCount} concepts. Zoom in to inspect
              individuals, or study / practice questions for this area.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
