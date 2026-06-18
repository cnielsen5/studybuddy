import { Link } from "react-router-dom";
import { useLibrary } from "../lib/libraryContext";
import { getConceptMapEdges, getConceptTitle } from "../lib/libraryTypes";

export function ConceptMapPage() {
  const { bundle, loading, error } = useLibrary();

  if (loading) return <p className="status">Loading concept map…</p>;
  if (error || !bundle) {
    return (
      <div className="page">
        <p className="banner banner-error">{error ?? "Library not loaded"}</p>
        <Link to="/" className="btn">Home</Link>
      </div>
    );
  }

  const concepts = bundle.concepts;
  const cols = 3;
  const cellW = 200;
  const cellH = 90;
  const padX = 40;
  const padY = 40;
  const width = cols * cellW + padX * 2;
  const height = Math.ceil(concepts.length / cols) * cellH + padY * 2 + 40;

  const positions = new Map(
    concepts.map((c, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return [
        c.id,
        { x: padX + col * cellW + cellW / 2, y: padY + row * cellH + cellH / 2 },
      ] as const;
    })
  );

  const edges = getConceptMapEdges(bundle);

  return (
    <div className="page">
      <header className="page-header row">
        <div>
          <h1>Concept Map</h1>
          <p className="subtitle">{bundle.manifest.name}</p>
        </div>
        <Link to="/" className="btn">Home</Link>
      </header>

      <div className="concept-map-wrap">
        <svg viewBox={`0 0 ${width} ${height}`} className="concept-map-svg" role="img">
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="#7a8ba8" />
            </marker>
          </defs>

          {edges.map((e) => {
            const from = positions.get(e.from);
            const to = positions.get(e.to);
            if (!from || !to) return null;
            return (
              <g key={e.id}>
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke="#b8c4d9"
                  strokeWidth={2}
                  markerEnd="url(#arrow)"
                />
                <text
                  x={(from.x + to.x) / 2}
                  y={(from.y + to.y) / 2 - 6}
                  textAnchor="middle"
                  className="edge-label"
                >
                  {e.label ?? e.type}
                </text>
              </g>
            );
          })}

          {concepts.map((c) => {
            const pos = positions.get(c.id)!;
            const cardCount = c.linked_content.card_ids.length;
            const qCount = c.linked_content.question_ids.length;
            return (
              <g key={c.id} transform={`translate(${pos.x - 85}, ${pos.y - 32})`}>
                <rect width={170} height={64} rx={8} className="concept-node" />
                <text x={85} y={22} textAnchor="middle" className="concept-node-title">
                  {c.content.title.length > 22
                    ? `${c.content.title.slice(0, 20)}…`
                    : c.content.title}
                </text>
                <text x={85} y={42} textAnchor="middle" className="concept-node-meta">
                  {cardCount} cards · {qCount} questions
                </text>
                <text x={85} y={56} textAnchor="middle" className="concept-node-id">
                  {c.id.replace("concept_", "")}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <section className="panel">
        <h2>Concepts</h2>
        <ul className="concept-list">
          {concepts.map((c) => (
            <li key={c.id}>
              <strong>{c.content.title}</strong>
              <span className="hint">
                {" "}
                — {c.editorial.difficulty} · {c.linked_content.card_ids.length} cards
              </span>
              <p className="concept-def">{c.content.definition}</p>
              {c.dependency_graph.prerequisites.length > 0 && (
                <p className="hint">
                  Prerequisites:{" "}
                  {c.dependency_graph.prerequisites.map((id) => getConceptTitle(bundle, id)).join(", ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
