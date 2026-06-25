# Socrates Spine Concept Graph — Level 1–3 Draft Brief

Authoritative specification for the universal spine concept graph. The generated draft lives at:

`content/spine/socrates-spine-l1-l3.draft.json`

Rebuild with:

```bash
cd library-creator && npm run build:spine
```

Human review outline (titles + ids only):

```bash
cd library-creator && npm run build:spine-review
# → content/spine/socrates-spine-l1-l3.review.md
```

Source data: `library-creator/src/spine/data/*L3.ts`, shared concepts in `spineSharedConcepts.ts`, schema in `spineSchema.ts`.

## Critical architecture principles

1. **Concepts are universal, not domain-owned.** One node per underlying idea; multiple domains attach via `domain_contexts[]`.
2. **Spine stops at level 3.** Level 4–5 are drafted separately and anchor to level-3 nodes.
3. **Level-3 nodes are discrete learnable chunks** — evenly distributed across L2 subdivisions for v0.1. Card count and high-yield weighting belong in the editorial review pass, not spine granularity decisions. L3 anchors may support well more than 5–15 cards when deeper audiences need them.
4. **Prerequisite edges** are universal (`dependency_graph`) and context-specific (`domain_contexts[].dependency_graph`). Keep cross-domain prerequisites sparse — CLKT handles competence demonstration without forcing long unlock chains (E1/E2: no physics→med hemodynamics or E&M→cardiac edges).
5. **L2 `unlocks`** are sparse cross-subdivision gates only (e.g. Single-Variable Calculus → Multivariable Calculus, Differential Equations, Classical Mechanics) — not listings of every L3 child. See `spineL2Unlocks.ts`.
6. **Source references** are mandatory on every level-3 concept (OpenStax preferred; NCBI StatPearls sufficient for medicine v0.1).
7. **Definitions are domain-neutral**; domain framing belongs in `domain_contexts[].framing.relevance`.

## Domains and level-3 targets

| Domain | Level-2 subdivisions | L3 target |
|--------|---------------------|-----------|
| mathematics | Arithmetic through Discrete Math & Logic (10) | ~50 |
| physics | Classical Mechanics through Nuclear Physics (8) | ~45 |
| chemistry | General through Spectroscopy (8) | ~60 |
| biology | Cell Biology through Anatomy (8) | ~65 |
| medicine_preclinical | Gross Anatomy through Behavioral Science (12) | ~130 |
| medicine_clinical | Cardiology through Surgery (13) | ~110 |
| psychology_neuroscience | Biological Psych through Research Methods (9) | ~70 |

**Draft totals:** 7 L1, 68 L2, 532 L3 (607 concepts).

## ID naming

- L1: `spine_{domain}` (mathematics → `spine_math`)
- L2: `spine_{domain}_l2_{short_name}`
- L3: `spine_{domain}_l3_{short_name}`
- Primary domain in ID for shared concepts

Domain IDs: `mathematics`, `physics`, `chemistry`, `biology`, `medicine_preclinical`, `medicine_clinical`, `psychology_neuroscience`

## Shared concepts

When a concept spans domains: add `domain_contexts[]` to the existing node; set `knowledge_graph._shared_concept_note`; do not duplicate nodes.

**Draft shared examples:** `spine_mathematics_l3_exponential_decay`, `spine_biology_l3_action_potential`. Human review should expand shared-node coverage (e.g. statistics, membrane potential, acid-base).

## Human review checklist

- [ ] Placement of biology vs medicine_preclinical boundaries
- [ ] Chemistry (mechanism) vs biology (function) splits — chemistry owns DNA replication/transcription **chemistry**; biology owns central dogma **process**
- [ ] Cross-domain prerequisite accuracy
- [ ] OpenStax chapter/section citations
- [ ] Additional shared concepts vs duplicate nodes
- [ ] Level-3 granularity for card-bearing audiences

## Status

`draft-for-review` — not published. `metadata.status` is `draft` on all concepts.
