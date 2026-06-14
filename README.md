# Socrates

> **Offline-first, AI-assisted spaced repetition** over concept maps — built on event sourcing, FSRS scheduling, and Firebase.

**→ Track all progress here: [`PROGRESS.md`](PROGRESS.md)** — phases, completed steps, what's next, and where you are (~38% as of June 2026).

---

## Coming Back After a Break?

Read these three things in order:

1. **[`PROGRESS.md`](PROGRESS.md)** — where you are, what's done, what to do next
2. **This file** — how the repo is organized and where to go for each kind of work
3. Run a health check:

```bash
cd functions
nvm use 20          # Node 20 required
npm install
npm test            # Should show 838 tests passing
```

Then verify staging still works (optional but recommended):

```bash
gcloud auth application-default login
gcloud config set project socrates-staging-eedc4
npm run test:projection
```

**Your immediate next milestone:** build the first Study screen (Phase 6) — there is no user-facing app yet. Everything else is backend/domain code that supports it.

---

## What This Project Is

Socrates (formerly StudyBuddy) is a study app where:

- Users learn **concepts** through **cards**, **questions**, and **relationships**
- A **FSRS scheduler** decides what to review and when
- All learning actions are recorded as **immutable events**
- Server **projectors** turn events into **read-model views** (schedule, performance, etc.)
- The client works **offline-first** and syncs to Firebase

**End goal:** A polished app (TanStack Start + mobile/desktop shells) that runs the full study loop locally and syncs progress to the cloud.

**Current reality:** The backend brain is ~60% built and well-tested. The app UI does not exist yet.

---

## Repo Map

```
socrates/  (repo: studybuddy)
│
├── README.md                 ← You are here. Navigation hub.
├── PROGRESS.md               ← Progress tracker. Update as you complete steps.
│
├── docs/design/              ← Vision & architecture (read-only reference)
│   ├── technical-design-document.md
│   ├── socrates-structure-and-organizer.md   ← Full domain spec
│   ├── generic-event-schema.ts
│   └── architecture-diagram.png
│
├── legacy/                   ← Old prototypes — not wired into current code
│   └── client-brain-prototype/algorithm.ts
│
├── firebase.json             ← Firebase config (root)
├── firestore.rules           ← Security rules (deployed with functions)
├── firestore.indexes.json
│
└── app/                ← User-facing UI (Vite + React)
    ├── src/lib/        # SocratesClient, Firebase, auth
    ├── src/pages/      # Home, Study
    └── README.md       # App setup instructions
    ├── src/                  ← Source code (see layer guide below)
    ├── tests/                ← 838 tests
    ├── docs/                 ← Implementation guides
    ├── examples/             ← Runnable client examples
    └── scripts/              ← Deploy & staging test scripts
```

---

## Where to Go for Each Kind of Work

Use this table when you sit down to code. It tells you exactly which folder to open.

| I want to… | Go here | Key docs |
|------------|---------|----------|
| **See what's done / pick next task** | [`PROGRESS.md`](PROGRESS.md) | Recommended Next Actions table |
| **Understand the product vision** | `docs/design/technical-design-document.md` | Start here for high-level architecture |
| **Look up a domain concept or event** | `docs/design/socrates-structure-and-organizer.md` | 1,800-line spec — the source of truth |
| **Work on event ingestion / write path** | `functions/src/ingestion/` | `functions/docs/EVENT_INGESTION.md` |
| **Work on projectors (events → views)** | `functions/src/projector/` | `functions/docs/PROJECTOR_COMPLETE.md` |
| **Work on FSRS / queue / graph logic** | `functions/src/core/` | `functions/docs/CORE_DOMAIN_LOGIC.md` |
| **Build session/review flows** | `functions/src/application/` *(empty — not built)* | `what should live here.md` in that folder |
| **Build AFI / probing / cramming rules** | `functions/src/policies/` *(empty — not built)* | `what should live here.md` in that folder |
| **Work on the client SDK** | `functions/src/client/` | `functions/docs/CLIENT_IMPLEMENTATION.md` |
| **Work on offline sync** | `functions/src/client/sync/` | `functions/docs/SYNC_IMPLEMENTATION_SUMMARY.md` |
| **Add runtime validation (Zod)** | `functions/src/validation/` | `functions/src/validation/README.md` |
| **Add or change domain types** | `functions/src/domain/` | Match patterns in `functions/tests/invariants/` |
| **Write tests** | `functions/tests/` | `functions/tests/TESTING_GUIDE.md` |
| **Deploy to staging** | `functions/scripts/` | `functions/docs/STAGING_QUICKSTART.md` |
| **Build the actual app UI** | `app/` | `app/README.md` |
| **Create study content** | *Does not exist yet — create `content/` at root* | `docs/design/technical-design-document.md` §5 |

---

## Code Layers (inside `functions/src/`)

The codebase follows a strict layered architecture. Work flows **down** (application calls core) and **out** (client uploads events, projectors write views).

```
┌─────────────────────────────────────────────────────────┐
│  application/     Session flows, user intent  [EMPTY]   │
├─────────────────────────────────────────────────────────┤
│  policies/        AFI, probing, cramming      [EMPTY]   │
├─────────────────────────────────────────────────────────┤
│  client/          SDK: events, views, sync    [BUILT]   │
├─────────────────────────────────────────────────────────┤
│  core/            FSRS, queue, concept graph    [BUILT]   │
├─────────────────────────────────────────────────────────┤
│  projector/       Events → views              [BUILT]   │
│  ingestion/       Canonical event write       [BUILT]   │
│  triggers/        Cloud Function entry        [BUILT]   │
├─────────────────────────────────────────────────────────┤
│  domain/          Type definitions            [BUILT]   │
│  validation/      Zod schemas                 [PARTIAL] │
└─────────────────────────────────────────────────────────┘
```

| Folder | Purpose | Status |
|--------|---------|--------|
| `domain/` | TypeScript types for concepts, cards, events, views | ✅ Complete |
| `validation/` | Zod schemas for runtime validation | 🟡 Partial |
| `ingestion/` | Canonical event write path + idempotency | ✅ Complete |
| `projector/` | Routes events to projectors; reducers update views | ✅ Complete (10 event types) |
| `triggers/` | `onEventCreated` Firestore trigger | ✅ Deployed to staging |
| `core/scheduler/` | FSRS v6 algorithm | ✅ Complete |
| `core/queue/` | Eligibility, queue builder, explainability | ✅ Complete |
| `core/graph/` | Concept graph, mastery metrics | ✅ Complete |
| `client/` | `StudyBuddyClient` SDK, event helpers, view reader | ✅ Complete (needs Client SDK port) |
| `client/sync/` | Offline queue, cursors, inbound/outbound sync | ✅ Complete |
| `application/` | `sessionManager`, `reviewFlow`, `onboardingFlow` | ⬜ Not started |
| `policies/` | `afi`, `probing`, `cramming`, `clamps` | ⬜ Not started |
| `pre.12.26.25 files/` | Old Genkit AI prototype | ⏸️ Archived, deps removed |

---

## Tests (`functions/tests/`)

| Folder | What it tests |
|--------|---------------|
| `invariants/` | Business rules for every entity, event, and view |
| `projector/` | Event projection logic and reducers |
| `client/` | SDK, sync engine, event upload |
| `core/` | FSRS, queue, concept graph |
| `integration/` | End-to-end flows, Firestore rules, concurrency |
| `fixtures/` | Shared test data used across all tests |
| `validation/` | Zod schema ↔ fixture alignment |

```bash
cd functions
npm test                    # All 838 tests
npm run test:rules          # Firestore security rules (needs emulator)
npm run test:projection     # Live staging projection test
```

---

## Documentation Index

### Start here (design)

| Doc | What it covers |
|-----|----------------|
| [`docs/design/technical-design-document.md`](docs/design/technical-design-document.md) | Architecture, layers, platform choices |
| [`docs/design/socrates-structure-and-organizer.md`](docs/design/socrates-structure-and-organizer.md) | Every entity, event, and business rule in detail |
| [`docs/design/generic-event-schema.ts`](docs/design/generic-event-schema.ts) | Base event shape |

### Implementation guides (`functions/docs/`)

| Doc | What it covers |
|-----|----------------|
| `CORE_DOMAIN_LOGIC.md` | FSRS, queue, graph modules |
| `CLIENT_FLOW.md` | How a study session should work end-to-end |
| `CLIENT_IMPLEMENTATION.md` | Adapting SDK for a real Firebase client app |
| `SYNC_IMPLEMENTATION_SUMMARY.md` | Offline sync architecture |
| `EVENT_INGESTION.md` | Event write path |
| `PROJECTOR_COMPLETE.md` | Which events have projectors |
| `REDUCER_ARCHITECTURE.md` | How reducers work |
| `FSRS_V6_IMPLEMENTATION.md` | Scheduler details |
| `STAGING_QUICKSTART.md` | Deploy and test on staging |
| `PRODUCTION_DEPLOYMENT.md` | Production checklist (not done yet) |

### Testing (`functions/tests/`)

| Doc | What it covers |
|-----|----------------|
| `TESTING_GUIDE.md` | How to run and write tests |
| `INVARIANT_TESTING_GUIDE.md` | Invariant test patterns |
| `QUICK_TEST_REFERENCE.md` | Common test commands |

---

## Firebase Projects

| Environment | Project ID | Config file |
|-------------|------------|-------------|
| Default (dev) | `study-buddy-cb8bc` | Root `.firebaserc` |
| Staging | `socrates-staging-eedc4` | `functions/.firebaserc` |
| Production | *Not set up yet* | — |

All deployment commands run from `functions/`:

```bash
cd functions
npm run deploy:staging       # Deploy to staging
npm run deploy:production    # Not ready yet
firebase functions:log       # View Cloud Function logs
```

---

## Critical Path to First Usable Product

This is the shortest route from where you are now to something you can actually open and study with:

```
1. Verify staging works          → functions/scripts/test-event-projection.ts
2. Scaffold app (TanStack Start) → new app/ folder at repo root
3. Port client SDK to Firebase Client SDK → functions/src/client/
4. Build Study screen            → review card → upload event → read view
5. Create seed content library   → new content/ folder (10–20 cards)
```

Details and checkboxes for each step: **[`PROGRESS.md`](PROGRESS.md)**

---

## Planned Folders (not created yet)

When you reach Phase 6 and 9, add these at the repo root:

| Folder | Purpose | Phase |
|--------|---------|-------|
| `app/` | TanStack Start UI (Home, Study, Settings) | Phase 6 |
| `content/` | Seed libraries and content bundles | Phase 9 |

Keeping them at the root (separate from `functions/`) matches the TDD: backend in Firebase functions, frontend in its own package.

---

## Common Commands

```bash
# App (UI)
cd app && npm install && cp .env.example .env.local && npm run dev

# Backend (from functions/)
cd functions && nvm use 20 && npm install
npm test                   # Run all tests
npm run build              # Compile TypeScript
npm run test:projection    # Live staging projection test
npm run deploy:staging     # Deploy to staging (use: printf 'y\n' | ./scripts/deploy.sh)
```

---

## Naming Note

The codebase still uses **StudyBuddy** in places (`StudyBuddyClient`, GitHub repo `studybuddy`). The product name is **Socrates**. Renaming is tracked in [`PROGRESS.md`](PROGRESS.md) Phase 10.

---

*When in doubt: open [`PROGRESS.md`](PROGRESS.md), find the next unchecked step, and use the "Where to Go" table above to find the right folder.*
