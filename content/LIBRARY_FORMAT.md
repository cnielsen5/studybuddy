# Socrates Content Library Format

A **library** is an immutable JSON bundle of shared learning content. It is the Content Layer in the Socrates architecture.

## Bundle structure

```json
{
  "manifest": { ... },
  "concepts": [ ... ],
  "relationships": [ ... ],
  "cards": [ ... ],
  "questions": [ ... ]
}
```

| Section | Purpose |
|---------|---------|
| `manifest` | Library identity, version, taxonomy (`id`, `name`, `version`, `description`, `domain`, `status`, `tags`) |
| `concepts` | Nodes in the concept map |
| `relationships` | Edges between concepts (prerequisite, semantic, etc.) |
| `cards` | Atomic study units (basic, cloze, relationship_card) |
| `questions` | MCQ probes for diagnosis, certification, reinforcement |

## ID conventions

| Entity | Prefix | Example |
|--------|--------|---------|
| Library | `lib_` | `lib_learning_science_v1` |
| Concept | `concept_` | `concept_fsrs` |
| Card | `card_` | `card_fsrs_stability_def` |
| Relationship | `rel_` | `rel_active_recall_to_spaced_rep` |
| Relationship card | `card_rel_` | `card_rel_prereq_active_spaced` |
| Question | `q_` | `q_fsrs_diagnostic_01` |

## Concept map

Concepts link via two complementary structures that must stay in sync:

- `dependency_graph.prerequisites` / `unlocks` — learning order on each concept
- `dependency_graph.related_concepts` — soft associations (not prerequisites)
- `dependency_graph.parent_concept_id` — structural parent for leaf concepts anchored to a spine node
- `relationships[]` — typed edges between concepts (first-class entities with cards/questions)

### Resolution vs hierarchy (granularity)

**Location** (where a concept sits in the taxonomy) and **resolution** (how granular the concept is) are orthogonal:

| Field | Purpose |
|-------|---------|
| `knowledge_graph` | Universal graph position — not domain ownership |
| `domain_contexts[]` | Per-domain lens: framing, taxonomy placement, cards, context-specific prerequisites |
| `resolution_level` (1–5) | Granularity of the universal concept node |
| `spine_concept_id` | Legacy spine anchor for leaf concepts during migration |
| `manifest.audience.resolutionRange` | `{ min, max }` — which resolution levels are in scope for this library |

### Universal concepts and domain lenses

Canonical spine master template: **`content/templates/universal-concept.master.json`** (`concept_exponential_decay`).

Concepts are **domain-agnostic at their core**. A single universal node can carry multiple domain contexts:

```json
{
  "id": "concept_exponential_decay",
  "resolution_level": 3,
  "content": { "title": "...", "definition": "...", "summary": "..." },
  "knowledge_graph": {
    "knowledge_area": "Quantitative Reasoning",
    "knowledge_cluster": "Change & Rate",
    "primary_domain": "mathematics"
  },
  "domain_contexts": [
    {
      "domain_id": "mathematics",
      "framing": {
        "title_in_context": "Exponential Decay",
        "relevance": "Core example of differential equation solutions.",
        "applications": ["Population decline", "Cooling curves"],
        "max_resolution_in_context": 4
      },
      "hierarchy_location": {
        "category": "Pre-Calculus & Functions",
        "subcategory": "Function Families",
        "topic": "Exponential & Logarithmic Functions",
        "subtopic": null
      },
      "dependency_graph": {
        "prerequisites_in_context": ["concept_exponential_functions"],
        "unlocks_in_context": ["concept_differential_equations_first_order"]
      },
      "linked_content": { "card_ids": [], "question_ids": [] }
    }
  ],
  "dependency_graph": {
    "parent_concept_id": "spine_math_precalculus",
    "prerequisites": ["concept_exponential_functions"],
    "unlocks": ["concept_half_life"]
  },
  "metadata": {
    "source_references": [
      { "source": "OpenStax Calculus Volume 1", "chapter": "6", "section": "6.8" }
    ]
  }
}
```

**Linked content lifecycle**

| Stage | `domain_contexts[].linked_content` |
|-------|-------------------------------------|
| Spine build (Phase 1–2) | Empty arrays — expected |
| Library creation (Phase 3+) | **Library creator writes card/question IDs back** into the active domain context via `writeLinkedContentToDomainContext()` |
| Export | Aggregate mirror in top-level `linked_content` for conformance tooling |

Cards carry `relations.domain_id` pointing to the domain context they belong to. CLKT uses shared **universal concept id** as the primary alignment key (exact match).

Legacy bundles may still use top-level `hierarchy` + `linked_content` during migration.

Resolution level guide:

| Level | Typical scope |
|-------|----------------|
| 1 | Domain overview |
| 2 | Major subdivision |
| 3 | Working concept (default; spine ↔ library overlap) |
| 4 | Mechanistic detail |
| 5 | Granular / specialist |

Existing hierarchy tiers map to resolution without adding new tiers: `domain` → 1, `category` → 2, `subcategory` → 2–3, `topic` → 3, `subtopic` → 3–4.

CLKT uses `spine_concept_id` as the primary cross-library alignment key; cosine similarity refines leaf-level transfer confidence.

### Relationship types

| `relationship_type` | Typical `directionality` | Meaning |
|---------------------|--------------------------|---------|
| `prerequisite` | `forward` | Must learn `from` before `to` |
| `unlocks` | `forward` | Completing `from` opens `to` |
| `reinforces` | `bidirectional` | Mutual support |
| `contrasts` | `bidirectional` | Compare / distinguish |
| `causes` | `forward` | Causal link |
| `associated_with` | `bidirectional` | Loose association |

### Graph consistency rules

When exporting or validating a library:

1. Every **forward `prerequisite` relationship** (`from → to`) must appear in `to.dependency_graph.prerequisites`.
2. Every entry in `dependency_graph.prerequisites` must be backed by a matching forward `prerequisite` relationship.
3. For each prerequisite edge, `from.dependency_graph.unlocks` must include `to`.
4. Derived graph metrics (centrality, depth, etc.) are **not** stored in the bundle — they are computed at runtime.

The app merges `relationships[]` and `dependency_graph.prerequisites` when rendering the concept map.

## Card roles (pedagogical)

| Role | Purpose |
|------|---------|
| `recognition` | Identify / recognize |
| `recall` | Free recall (core) |
| `synthesis` | Connect ideas (relationship cards) |
| `application` | Apply to scenario |
| `integration` | Cross-concept integration |

## Card tiers (`config.card_tier`)

| Tier | Purpose |
|------|---------|
| `core` | Essential recall / recognition |
| `extension` | Deeper application or synthesis |
| `certification` | Mastery / integration probes |
| `remedial` | Targeted repair for weak areas |

Every card `config` must include `card_tier` alongside `card_type` and `pedagogical_role`.

## Question roles (usage_role)

| Role | Purpose |
|------|---------|
| `generic` | Standard practice |
| `diagnostic` | Detect misconceptions |
| `establishment` | Introduce new material |
| `targeted` | Reinforce weak area |
| `misconception_directed` | Probe specific error |

## Canonical library

**`content/libraries/learning-science-v1/`** — "Learning Science & Socrates"

- 7 concepts forming a concept map
- 7 structural relationships
- 21 cards (basic, cloze, relationship, core/extension mix)
- 10 questions (generic, diagnostic, establishment)

Export JSON:

```bash
cd content && node scripts/export-library.mjs learning-science-v1
```

## App usage

Set in `app/.env.local`:

```
VITE_LIBRARY_ID=lib_learning_science_v1
```

The app loads `library.json` and uses it for Study, Concept Map, and Library browse screens.
