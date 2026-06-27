import { Link } from "react-router-dom";
import { useLibrary } from "../lib/libraryContext";
import { getConceptTitle } from "../lib/libraryTypes";

export function LibraryPage() {
  const { bundle, studyCards, loading, error } = useLibrary();

  if (loading) return <p className="status">Loading library…</p>;
  if (error || !bundle) {
    return (
      <div className="page">
        <p className="banner banner-error">{error ?? "Library not loaded"}</p>
        <Link to="/" className="btn">Home</Link>
      </div>
    );
  }

  const cardsByConcept = new Map<string, typeof studyCards>();
  for (const card of studyCards) {
    const list = cardsByConcept.get(card.conceptId) ?? [];
    list.push(card);
    cardsByConcept.set(card.conceptId, list);
  }

  return (
    <div className="page">
      <header className="page-header row">
        <div>
          <h1>Library</h1>
          <p className="subtitle">{bundle.manifest.name} v{bundle.manifest.version}</p>
        </div>
        <Link to="/" className="btn">Home</Link>
      </header>

      <section className="panel">
        <p>{bundle.manifest.description}</p>
        <p className="hint">
          {bundle.concepts.length} concepts · {bundle.relationships.length} relationships ·{" "}
          {bundle.cards.length} cards · {bundle.questions.length} questions
        </p>
      </section>

      {bundle.concepts.map((concept) => {
        const cards = cardsByConcept.get(concept.id) ?? [];
        const questions = bundle.questions.filter((q) => q.relations.concept_ids.includes(concept.id));
        return (
          <section key={concept.id} className="panel">
            <h2>{concept.content.title}</h2>
            <p className="concept-def">{concept.content.summary}</p>
            <p className="hint">
              <code>{concept.id}</code> · {concept.editorial?.difficulty ?? "—"} · high-yield{" "}
              {concept.editorial?.high_yield_score ?? "—"}
            </p>

            {cards.length > 0 && (
              <>
                <h3 className="section-label">Cards ({cards.length})</h3>
                <ul className="content-list">
                  {cards.map((card) => (
                    <li key={card.id}>
                      <code>{card.id}</code>
                      <span className="tag">{card.role}</span>
                      <span className="tag">{card.cardType}</span>
                      <p>{card.front}</p>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {questions.length > 0 && (
              <>
                <h3 className="section-label">Questions ({questions.length})</h3>
                <ul className="content-list">
                  {questions.map((q) => (
                    <li key={q.id}>
                      <code>{q.id}</code>
                      <span className="tag">{q.classification.usage_role}</span>
                      <p>{q.content.stem}</p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        );
      })}

      <section className="panel">
        <h2>Relationships</h2>
        <ul className="content-list">
          {bundle.relationships.map((r) => (
            <li key={r.relationship_id}>
              <code>{r.relationship_id}</code>
              <span className="tag">{r.relation.relationship_type}</span>
              <p>
                {getConceptTitle(bundle, r.endpoints.from_concept_id)} →{" "}
                {getConceptTitle(bundle, r.endpoints.to_concept_id)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
