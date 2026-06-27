import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ConceptMapGraph, conceptMapStats } from "../components/ConceptMapGraph";
import { useAuth } from "../lib/auth";
import {
  certificationResultDescription,
  certificationResultLabel,
} from "../lib/certification";
import {
  deriveAggregateMetrics,
  deriveConceptMetrics,
  formatStageCounts,
  conceptStateLabel,
} from "../lib/conceptDerivedMetrics";
import { useLibrary } from "../lib/libraryContext";
import type { TaxonomyNode } from "../lib/conceptMapHierarchy";
import { getConceptTitle } from "../lib/libraryTypes";
import { useAllConceptCertifications } from "../lib/useAllConceptCertifications";
import { useConceptDerivedData } from "../lib/useConceptDerivedData";
import { buildTaxonomyTree } from "../lib/conceptMapHierarchy";

export function ConceptMapPage() {
  const { bundle, studyCards, loading, error } = useLibrary();
  const { user, client } = useAuth();
  const { schedules, performances, loading: derivedLoading } = useConceptDerivedData(loading);
  const [searchParams] = useSearchParams();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<TaxonomyNode | null>(null);
  const detailRef = useRef<HTMLElement | null>(null);

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
  const certifyUrl =
    selectedConcept && user ? `/certify?concept=${selectedConcept.id}` : null;

  const conceptIds = useMemo(
    () => bundle?.concepts.map((c) => c.id) ?? [],
    [bundle]
  );
  const { certifications, loading: certLoading } = useAllConceptCertifications(
    client,
    conceptIds
  );
  const selectedCertification = selectedConcept
    ? certifications.get(selectedConcept.id) ?? null
    : null;

  const taxonomyTree = useMemo(
    () => (bundle ? buildTaxonomyTree(bundle) : null),
    [bundle]
  );

  useEffect(() => {
    const conceptParam = searchParams.get("concept");
    if (!conceptParam || !taxonomyTree || selectedId) return;

    for (const node of taxonomyTree.values()) {
      if (node.level === "concept" && node.conceptIds[0] === conceptParam) {
        setSelectedId(node.id);
        setSelectedNode(node);
        break;
      }
    }
  }, [searchParams, taxonomyTree, selectedId]);

  useEffect(() => {
    if (selectedNode && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedNode]);

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
            {stats?.resolutionRange && (
              <> · resolution {stats.resolutionRange.min}–{stats.resolutionRange.max}</>
            )}
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
          certifications={certifications}
          selectedId={selectedId}
          onSelect={(id, node) => {
            setSelectedId(id);
            setSelectedNode(node);
          }}
        />
      </div>

      {selectedNode && selectedMetrics && (
        <section ref={detailRef} className="panel concept-detail">
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
              {certifyUrl && (
                <Link to={certifyUrl} className="btn btn-primary btn-sm">
                  Certify
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
              <div className="certification-panel">
                <h3>Certification</h3>
                {certLoading && user ? (
                  <p className="status">Loading certification…</p>
                ) : selectedCertification ? (
                  <>
                    <p className="certification-badge certification-badge--done">
                      <strong>{certificationResultLabel(selectedCertification.certification_result)}</strong>
                      {" · "}
                      {Math.round(selectedCertification.accuracy * 100)}% (
                      {selectedCertification.correct_count}/
                      {selectedCertification.questions_answered} correct)
                    </p>
                    <p className="hint">
                      {certificationResultDescription(selectedCertification.certification_result)}
                    </p>
                  </>
                ) : user ? (
                  <>
                    <p className="certification-badge certification-badge--pending">
                      Not certified yet — run the certification gate to demonstrate mastery.
                    </p>
                    {certifyUrl && (
                      <Link to={certifyUrl} className="btn btn-primary btn-sm">
                        Start certification
                      </Link>
                    )}
                  </>
                ) : (
                  <p className="hint">Sign in to view or earn certification for this concept.</p>
                )}
              </div>
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
