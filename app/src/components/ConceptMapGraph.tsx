import { useCallback, useMemo, useRef, useState, type PointerEvent, type WheelEvent } from "react";
import type { CardScheduleView, ConceptCertificationView, QuestionPerformanceView, StudyCard } from "../lib/types";
import type { LibraryBundle } from "../lib/libraryTypes";
import { buildConceptMapEdges, getStructuralEdges, type ConceptMapEdge } from "../lib/conceptMapGraph";
import {
  CONCEPT_STATE_ORDER,
  conceptStateColor,
  conceptStateLabel,
  conceptStateStroke,
  deriveAggregateMetrics,
} from "../lib/conceptDerivedMetrics";
import { certificationResultShortLabel } from "../lib/certification";
import {
  buildTaxonomyTree,
  levelLabel,
  nodesAtLevel,
  zoomScaleToLevel,
  type TaxonomyNode,
} from "../lib/conceptMapHierarchy";
import {
  computeDomainRegions,
  layoutConceptPositions,
  layoutTaxonomyNodes,
  nodeRadius,
} from "../lib/conceptMapForceLayout";
import { computeConceptGraphMetrics } from "../lib/conceptMapMetrics";

interface ConceptMapGraphProps {
  bundle: LibraryBundle;
  studyCards: StudyCard[];
  schedules: CardScheduleView[];
  performances: QuestionPerformanceView[];
  certifications: Map<string, ConceptCertificationView>;
  selectedId: string | null;
  onSelect: (id: string | null, node: TaxonomyNode | null) => void;
}

const VIEW_SIZE = 720;
const MIN_SCALE = 0.35;
const MAX_SCALE = 2.4;

export function ConceptMapGraph({
  bundle,
  studyCards,
  schedules,
  performances,
  certifications,
  selectedId,
  onSelect,
}: ConceptMapGraphProps) {
  const [scale, setScale] = useState(0.5);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const dragRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const taxonomyTree = useMemo(() => buildTaxonomyTree(bundle), [bundle]);
  const conceptPositions = useMemo(() => layoutConceptPositions(bundle), [bundle]);
  const allPositions = useMemo(
    () => layoutTaxonomyNodes(taxonomyTree, conceptPositions),
    [taxonomyTree, conceptPositions]
  );
  const metrics = useMemo(() => computeConceptGraphMetrics(bundle), [bundle]);

  const activeLevel = zoomScaleToLevel(scale);
  const visibleNodes = useMemo(
    () => nodesAtLevel(taxonomyTree, activeLevel),
    [taxonomyTree, activeLevel]
  );

  const radii = useMemo(() => {
    const map = new Map<string, number>();
    for (const node of visibleNodes) {
      map.set(node.id, nodeRadius(node.cardCount, node.subconceptCount, scale));
    }
    return map;
  }, [visibleNodes, scale]);

  const showDomainBorders =
    activeLevel === "category" ||
    activeLevel === "subcategory" ||
    activeLevel === "topic" ||
    activeLevel === "concept";

  const domainRegions = useMemo(() => {
    if (!showDomainBorders) return [];
    return computeDomainRegions(visibleNodes, allPositions, radii);
  }, [showDomainBorders, visibleNodes, allPositions, radii]);

  const conceptEdges = useMemo(() => {
    if (activeLevel !== "concept") return [];
    return getStructuralEdges(buildConceptMapEdges(bundle));
  }, [bundle, activeLevel]);

  const conceptNodeByConceptId = useMemo(() => {
    const map = new Map<string, TaxonomyNode>();
    for (const node of taxonomyTree.values()) {
      if (node.level === "concept" && node.conceptIds[0]) {
        map.set(node.conceptIds[0], node);
      }
    }
    return map;
  }, [taxonomyTree]);

  const onWheel = useCallback((e: WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setScale((s) => Math.max(MIN_SCALE, Math.min(MAX_SCALE, s + delta)));
  }, []);

  const onPointerDown = useCallback(
    (e: PointerEvent<SVGSVGElement>) => {
      if ((e.target as Element).closest(".map-node")) return;
      dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [pan]
  );

  const onPointerMove = useCallback((e: PointerEvent<SVGSVGElement>) => {
    if (!dragRef.current) return;
    setPan({
      x: dragRef.current.panX + (e.clientX - dragRef.current.x),
      y: dragRef.current.panY + (e.clientY - dragRef.current.y),
    });
  }, []);

  const onPointerUp = useCallback((e: PointerEvent<SVGSVGElement>) => {
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  const focusId = hoveredId ?? selectedId;

  return (
    <div className="concept-map-graph">
      <div className="concept-map-toolbar">
        <span className="zoom-level-badge">{levelLabel(activeLevel)}</span>
        <div className="zoom-controls">
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setScale((s) => Math.max(MIN_SCALE, s - 0.15))}
            aria-label="Zoom out"
          >
            −
          </button>
          <input
            type="range"
            min={MIN_SCALE}
            max={MAX_SCALE}
            step={0.05}
            value={scale}
            onChange={(e) => setScale(Number(e.target.value))}
            aria-label="Zoom level"
          />
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setScale((s) => Math.min(MAX_SCALE, s + 0.15))}
            aria-label="Zoom in"
          >
            +
          </button>
        </div>
        <span className="hint">Scroll to zoom · drag background to pan · click a node for details below</span>
      </div>

      <svg
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        className="concept-map-svg"
        role="img"
        aria-label={`Concept map for ${bundle.manifest.name}`}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <defs>
          <marker id="map-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#7a8ba8" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x} ${pan.y}) scale(${scale})`}>
          {domainRegions.map((region) => (
            <g key={region.domain}>
              <rect
                x={region.x}
                y={region.y}
                width={region.width}
                height={region.height}
                rx={18}
                className="domain-region"
              />
              <text
                x={region.x + 12}
                y={region.y + 18}
                className="domain-region-label"
              >
                {region.domain}
              </text>
            </g>
          ))}

          {activeLevel === "concept" && (
            <g className="concept-map-edges">
              {conceptEdges.map((edge) => (
                <ConceptEdge
                  key={edge.id}
                  edge={edge}
                  conceptNodeByConceptId={conceptNodeByConceptId}
                  positions={allPositions}
                  radii={radii}
                  dimmed={
                    focusId !== null &&
                    !edgeTouches(edge, focusId, conceptNodeByConceptId)
                  }
                />
              ))}
            </g>
          )}

          {visibleNodes.map((node) => {
            const pos = allPositions.get(node.id);
            if (!pos) return null;
            const r = radii.get(node.id) ?? 16;
            const derived = deriveAggregateMetrics(
              node.conceptIds,
              bundle.concepts,
              studyCards,
              schedules,
              performances
            );
            const isSelected = selectedId === node.id;
            const isHovered = hoveredId === node.id;
            const metric =
              node.level === "concept" && node.conceptIds[0]
                ? metrics.get(node.conceptIds[0])
                : undefined;
            const certification =
              node.level === "concept" && node.conceptIds[0]
                ? certifications.get(node.conceptIds[0])
                : undefined;
            const isPreMastered = certification?.certification_result === "full";

            return (
              <g
                key={node.id}
                className={`map-node${isSelected ? " is-selected" : ""}${isHovered ? " is-hovered" : ""}${isPreMastered ? " is-pre-mastered" : ""}`}
                transform={`translate(${pos.x} ${pos.y})`}
                onClick={() => onSelect(isSelected ? null : node.id, isSelected ? null : node)}
                onMouseEnter={() => setHoveredId(node.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{ cursor: "pointer" }}
                role="button"
                tabIndex={0}
                aria-label={`${node.label}, ${node.cardCount} cards`}
              >
                <circle
                  r={r}
                  fill={conceptStateColor(derived.conceptState)}
                  stroke={conceptStateStroke(derived.conceptState)}
                  strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 1.5}
                  strokeDasharray={isPreMastered ? "5 3" : undefined}
                  className="map-node-circle"
                  opacity={0.55 + derived.retentionScore * 0.45}
                />
                {scale >= 0.7 && (
                  <text y={4} textAnchor="middle" className="map-node-label">
                    {truncate(node.label, r > 22 ? 16 : 10)}
                  </text>
                )}
                {isSelected && (
                  <>
                    <text y={r + 14} textAnchor="middle" className="map-node-metrics">
                      {conceptStateLabel(derived.conceptState)} · retention{" "}
                      {Math.round(derived.retentionScore * 100)}%
                      {metric &&
                        ` · struct ${metric.structuralDegree} · sem ${metric.semanticDegree}`}
                    </text>
                    {node.level === "concept" && (
                      <text y={r + 28} textAnchor="middle" className="map-node-cert">
                        {certification
                          ? certificationResultShortLabel(certification.certification_result)
                          : "Not certified"}
                      </text>
                    )}
                  </>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      <div className="concept-map-legend-row">
        <div className="concept-state-legend" aria-label="ConceptState legend">
          <span className="legend-title">ConceptState</span>
          <div className="concept-state-swatch-row">
            {CONCEPT_STATE_ORDER.map((state) => (
              <span key={state} className="concept-state-swatch-item">
                <span
                  className="concept-state-swatch"
                  style={{ background: conceptStateColor(state) }}
                />
                {conceptStateLabel(state)}
              </span>
            ))}
          </div>
          <p className="hint legend-note">Opacity reflects retention (recall likelihood now)</p>
          <p className="hint legend-note">Dashed node border = pre-mastered (full certification)</p>
        </div>
        {showDomainBorders && (
          <span className="hint domain-border-hint">Dashed borders = domain regions</span>
        )}
      </div>
    </div>
  );
}

function ConceptEdge({
  edge,
  conceptNodeByConceptId,
  positions,
  radii,
  dimmed,
}: {
  edge: ConceptMapEdge;
  conceptNodeByConceptId: Map<string, TaxonomyNode>;
  positions: Map<string, { x: number; y: number }>;
  radii: Map<string, number>;
  dimmed: boolean;
}) {
  const fromNode = conceptNodeByConceptId.get(edge.from);
  const toNode = conceptNodeByConceptId.get(edge.to);
  if (!fromNode || !toNode) return null;

  const from = positions.get(fromNode.id);
  const to = positions.get(toNode.id);
  if (!from || !to) return null;

  const rFrom = radii.get(fromNode.id) ?? 14;
  const rTo = radii.get(toNode.id) ?? 14;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;
  const x1 = from.x + (dx / dist) * rFrom;
  const y1 = from.y + (dy / dist) * rFrom;
  const x2 = to.x - (dx / dist) * rTo;
  const y2 = to.y - (dy / dist) * rTo;

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke="#9eb3d4"
      strokeWidth={dimmed ? 1 : 1.75}
      opacity={dimmed ? 0.2 : 0.75}
      markerEnd="url(#map-arrow)"
    />
  );
}

function edgeTouches(
  edge: ConceptMapEdge,
  focusNodeId: string,
  conceptNodeByConceptId: Map<string, TaxonomyNode>
): boolean {
  const focusConceptIds = new Set<string>();
  for (const [conceptId, node] of conceptNodeByConceptId) {
    if (node.id === focusNodeId) focusConceptIds.add(conceptId);
  }
  return focusConceptIds.has(edge.from) || focusConceptIds.has(edge.to);
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1)}…`;
}

export function conceptMapStats(bundle: LibraryBundle) {
  const tree = buildTaxonomyTree(bundle);
  return {
    domains: nodesAtLevel(tree, "domain").length,
    categories: nodesAtLevel(tree, "category").length,
    concepts: bundle.concepts.length,
  };
}
