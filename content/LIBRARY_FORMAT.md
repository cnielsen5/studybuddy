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
- `relationships[]` — typed edges between concepts (first-class entities with cards/questions)

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
