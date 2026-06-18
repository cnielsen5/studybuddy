import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ConceptMapGraph, conceptMapStats } from "../components/ConceptMapGraph";
import { useAuth } from "../lib/auth";
import { useLibrary } from "../lib/libraryContext";
import { aggregateMastery } from "../lib/conceptMapMastery";
import type { TaxonomyNode } from "../lib/conceptMapHierarchy";
import { getConceptTitle } from "../lib/libraryTypes";
import { useConceptMapMastery } from "../lib/useConceptMapMastery";

export function ConceptMapPage() {
  const { bundle, studyCards, loading, error } = useLibrary();
  const { user } = useAuth();
  const { schedules, loading: masteryLoading } = useConceptMapMastery(loading);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<TaxonomyNode | null>(null);

  const stats = useMemo(() => (bundle ? conceptMapStats(bundle) : null), [bundle]);

  const selectedConcept =
    selectedNode?.level === "concept" && selectedNode.conceptIds[0]
      ? bundle?.concepts.find((c) => c.id === selectedNode.conceptIds[0]) ?? null
      : null;

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
          Sign in to color nodes by your card mastery. Unsigned view shows all nodes as unlearned.
        </p>
      )}

      <section className="panel concept-map-controls">
        <p className="hint">
          Zoom out to see domains and categories; zoom in to topics and individual concepts. Node
          size reflects cards and subconcepts. Position uses semantic vectors, structural degree,
          and semantic connectivity (α = 0.25).
        </p>
        {masteryLoading && user && <p className="status">Loading mastery state…</p>}
      </section>

      <div className="concept-map-wrap">
        <ConceptMapGraph
          bundle={bundle}
          studyCards={studyCards}
          schedules={schedules}
          selectedId={selectedId}
          onSelect={(id, node) => {
            setSelectedId(id);
            setSelectedNode(node);
          }}
        />
      </div>

      {selectedNode && (
        <section className="panel concept-detail">
          <div className="concept-detail-header">
            <div>
              <h2>{selectedNode.label}</h2>
              <p className="hint">
                {selectedNode.level} · {selectedNode.cardCount} cards ·{" "}
                {selectedNode.subconceptCount} concepts · mastery{" "}
                {Math.round(
                  aggregateMastery(selectedNode.conceptIds, studyCards, schedules) * 100
                )}
                %
              </p>
            </div>
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
              Aggregated view over {selectedNode.subconceptCount} concept
              {selectedNode.subconceptCount === 1 ? "" : "s"}. Zoom in to inspect individual
              concepts.
            </p>
          )}
        </section>
      )}
    </div>
  );
}
