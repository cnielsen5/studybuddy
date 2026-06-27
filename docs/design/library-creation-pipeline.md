# Library Creation Pipeline

> **Status:** Foundation implemented (2026-06-27). Stage 3 generation runs in `library-creator` CLI; app wizard covers Stages 1–2 and 4 with client-side preview.

## Core design principle

The user converses with an expert librarian — not a configuration panel. Spine anchoring, source selection, concept graph generation, and lens mapping happen invisibly. The user sees questions, progress, and a concept map preview. Reconciliation feels like light editing, not debugging.

## Five user-facing stages

| Stage | Name | Duration | User sees |
|-------|------|----------|-----------|
| 1 | Intent dialogue | 2–3 min | 4–6 conversational questions |
| 2 | Source configuration | 1–2 min | Uploads + curated catalog tiles |
| 3 | Automated generation | Background | Plain-language progress steps |
| 4 | Review & reconcile | 3–5 min | Concept map preview + flag cards |
| 5 | Publish & learn | Instant | Library in catalog; spine candidates queued |

Maps to the existing 7-stage CLI pipeline (`ingestion` → `export`) via `UserFacingLibraryPipeline` in `library-creator/src/pipeline/userFacingPipeline.ts`.

## Stage 1 — Intent dialogue

**Output:** `LibraryCreationIntent` (user never sees JSON)

| # | Question | Field |
|---|----------|-------|
| 1 | What is this library for? | `purposeStatement`, inferred `libraryTitle`, `domain`, `spineDomainId` |
| 2 | What level are you studying at? | `audience.level`, `audience.resolutionRange` |
| 3 | Curriculum / exam / syllabus? | `curriculum` — `custom` \| `catalog` \| `logical` |
| 4 | Topics to include or leave out? | `scopeNotes`, `scopeBoundaries` |
| 5 | How will you use this library? | `purpose` — `exam_prep` \| `deep_understanding` \| `reference` |

**Code:** `library-creator/src/intent/buildIntentFromDialogue.ts`, `collectIntentDialogue.ts`, `lensCatalog.ts`

## Stage 2 — Source configuration

**Output:** `SourceConfiguration` — uploads, URLs, curated catalog selections

- Default `similarityThreshold: 0.90` (not exposed to users)
- Curated tiles filtered by `spineDomainId` / domain

**Code:** `library-creator/src/sources/sourceCatalog.ts`, `buildSourceConfiguration.ts`

## Stage 3 — Automated generation

Plain-language progress labels:

1. Understanding your material… (`ingestion`)
2. Mapping to knowledge foundations… (`anchorConceptGraphToSpine`)
3. Building your concept map… (`concept_graph` + lens ordering)
4. Generating cards and questions… (`cards_questions`, `relationships`)

**Quality drivers:**

- Spine anchoring before generation (`extraction/anchorConceptGraphToSpine.ts`)
- Source section order respected as learning-sequence prior
- Per-concept generation (existing heuristic / future OpenAI per-concept)

**Self-correction:** If >8 reconcile flags, `selfCorrectFlags()` runs before Stage 4.

**Code:** `library-creator/src/pipeline/automatedGeneration.ts`

## Stage 4 — Review & reconcile

**Output:** `LibraryReviewState` — preview summary, concept tree, reconcile flags

Three-panel UI (app):

- Left: concept map outline + summary card (coverage % when lens active)
- Center: concept detail OR flag walkthrough (scope / missing coverage / new concept)
- Right: AI assistant (collapsed by default; explicit requests only)

**Flag types:** `scope_question`, `missing_coverage`, `new_concept_confirmation`

Unresolved flags default conservatively (include content, add foundational coverage).

**Code:** `library-creator/src/pipeline/reconcileFlags.ts`, `libraryPreview.ts`

## Stage 5 — Publish & learn

**Immediate:** Export Golden Master bundle → user's library catalog.

**Background:** `SpineContributionCandidate` queue for L4/L5 nodes not yet on universal spine.

**Code:** `library-creator/src/spine/spineContributionQueue.ts`

## Build priority (implemented order)

1. ✅ Stage 1 dialogue → `LibraryCreationIntent`
2. ✅ Stage 3b spine anchoring
3. ✅ Stage 4 reconcile engine + app review UI
4. 🟡 Stage 2 source catalog (static catalog; PDF/PPTX parsers deferred)
5. 🟡 Stage 3a full ingestion (web/text today; PDF/PPTX backlog)
6. ✅ Stage 5 spine contribution types + queue file

## Commands

```bash
# Full 5-stage CLI flow (text source + dialogue)
cd library-creator && npm run pipeline:create -- --text "..." --name "My Library"

# Legacy gated 7-stage job
npm run cli -- create "My Library"
```

## App entry

`/create-library` — wizard: Intent → Sources → Generation (progress) → Review → Publish

## Related docs

- `socrates-structure-and-organizer.md` §5.2 — universal spine + lenses
- `curriculum-lenses.md` — lens schema and `applyLens`
- `spine-growth-and-placement.md` — `placeOnSpine` heuristics
