# Socrates — Project Progress Pathway

> **Purpose:** Single source of truth for where Socrates is headed, what's done, and what's next.  
> **Navigation:** See [`README.md`](README.md) for full repo map and where to go for each kind of work.  
> **Last updated:** June 14, 2026  
> **Repo:** [github.com/cnielsen5/studybuddy](https://github.com/cnielsen5/studybuddy)  
> **Last code activity:** January 20, 2026

---

## At a Glance

| Metric | Value |
|--------|-------|
| **Overall progress** | **~42%** toward a fully functional, quality product |
| **Current phase** | **Phase 6 — User-Facing App** (in progress) |
| **Tests** | 846+ passing (incl. library validation) |
| **Staging** | Verified June 2026 (`socrates-staging-eedc4`) |
| **Production** | Not deployed |
| **User-facing app** | Vite + React — study, library browse, concept map |

### Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete |
| 🟡 | Started / partial |
| ⬜ | Not started |
| ⏸️ | Deferred / blocked |

---

## Where You Are — June 2026

```
[████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  ~42%

Phase 1  Vision & Design          ████████████████████  100%
Phase 2  Domain Foundation        ██████████████████░░   90%
Phase 3  Backend & Infrastructure ████████████░░░░░░░░   60%
Phase 4  Core Learning Logic      ████████████░░░░░░░░   55%
Phase 5  Client SDK & Sync        ██████████████░░░░░░   70%
Phase 6  User-Facing App          ████████░░░░░░░░░░░░   35%  ← IN PROGRESS
Phase 7  Cloud Ops & Deployment   ████████░░░░░░░░░░░░   35%
Phase 8  AI & Advanced Features   ██░░░░░░░░░░░░░░░░░░   10%
Phase 9  Content & Libraries      ████████░░░░░░░░░░░░   35%  ← IN PROGRESS
Phase 10 Quality & Launch         ████░░░░░░░░░░░░░░░░   20%
```

**In plain terms:** Backend, staging, and a working app shell exist. The Learning Science library (7 concepts, 21 cards) is wired in — you can study, browse content, and view the concept map.

---

## The Full Pathway

Work through phases in order where dependencies exist. Some items within a phase can run in parallel (noted below).

---

### Phase 1 — Vision & Design
**Goal:** Define what Socrates is and how it works architecturally.  
**Phase progress:** 100% ✅

| # | Step | Status | Notes |
|---|------|--------|-------|
| 1.1 | Product vision & principles | ✅ | `docs/design/socrates-structure-and-organizer.md` |
| 1.2 | Technical design document | ✅ | `docs/design/technical-design-document.md` |
| 1.3 | Event-sourced architecture decision | ✅ | Append-only evidence, projected views |
| 1.4 | Offline-first architecture decision | ✅ | Local client + sync to Firebase |
| 1.5 | FSRS-based scheduling decision | ✅ | Card-level scheduling, concept graph overlay |
| 1.6 | Layered model defined (content / user state / evidence) | ✅ | Documented in TDD |
| 1.7 | Platform stack chosen (TanStack, Capacitor, Tauri, Firebase) | ✅ | Documented; not yet implemented |

---

### Phase 2 — Domain Foundation
**Goal:** Define every data type, event, and business rule with tests.  
**Phase progress:** 90% ✅

| # | Step | Status | Notes |
|---|------|--------|-------|
| 2.1 | Core entity types (concept, card, relationship, question) | ✅ | `functions/src/domain/` |
| 2.2 | User state types (schedule, metrics, misconceptions) | ✅ | Full domain model |
| 2.3 | View contracts (projected read models) | ✅ | Frozen minimum view contract |
| 2.4 | Generic event schema | ✅ | `docs/design/generic-event-schema.ts` |
| 2.5 | All event types defined (15+) | ✅ | card_reviewed, session_*, certification_*, etc. |
| 2.6 | Fixtures for all entities and events | ✅ | `functions/tests/fixtures/` |
| 2.7 | Invariant tests for all entities | ✅ | 838 tests passing |
| 2.8 | Cross-domain integrity tests | ✅ | Relationship/graph consistency |
| 2.9 | Type discriminators normalized | ✅ | Consistent across codebase |
| 2.10 | Runtime Zod validation schemas | 🟡 | Partial — see `functions/src/validation/README.md` |
| 2.11 | JSON Schema export for external validation | ⬜ | On validation roadmap |

**Remaining in this phase:** Finish Zod schemas for relationships, graph metrics, and all view types.

---

### Phase 3 — Backend & Infrastructure
**Goal:** Events flow from client → Firestore → projectors → views reliably.  
**Phase progress:** 60% 🟡 ← **CURRENT PHASE**

| # | Step | Status | Notes |
|---|------|--------|-------|
| 3.1 | Canonical event write path | ✅ | `functions/src/ingestion/eventIngestion.ts` |
| 3.2 | Idempotency rules | ✅ | Tested |
| 3.3 | Event projector trigger (Cloud Function) | ✅ | `onEventCreated` |
| 3.4 | Event router | ✅ | Routes by `event.type` |
| 3.5 | Card projector (`card_reviewed`) | ✅ | Schedule + performance views |
| 3.6 | Question projector (`question_attempted`) | ✅ | |
| 3.7 | Relationship projector (`relationship_reviewed`) | ✅ | |
| 3.8 | Misconception projector (`misconception_probe_result`) | ✅ | |
| 3.9 | Session projector (`session_started`, `session_ended`) | ✅ | |
| 3.10 | Schedule update projector (`acceleration_applied`, `lapse_applied`) | ✅ | |
| 3.11 | Certification projector (`mastery_certification_completed`) | 🟡 | View works; card suppression/acceleration TODO |
| 3.12 | Annotation projector (`card_annotation_updated`) | ✅ | |
| 3.13 | Reducer architecture for all projectors | ✅ | `functions/src/projector/reducers/` |
| 3.14 | Projector integration tests | ✅ | All major projectors tested |
| 3.15 | Live staging projection verified | ✅ | Re-verified June 14, 2026 — views created at `views/card_schedule__{cardId}` |
| 3.16 | Projector for `mastery_certification_started` | ⏸️ | Low priority — tracking only |
| 3.17 | Projector for `content_flagged` | ⏸️ | Separate moderation system |
| 3.18 | Projector for `intervention_accepted/rejected` | ⏸️ | Analytics only; effects captured elsewhere |
| 3.19 | Runtime validation at ingestion boundaries | 🟡 | Partial Zod coverage |
| 3.20 | Projection monitoring & error alerting | ⬜ | No metrics/alerting yet |
| 3.21 | Batch / high-volume projection optimization | ⬜ | Future scaling concern |

**Remaining in this phase:** Verify staging end-to-end, finish certification side effects, complete runtime validation, add monitoring.

---

### Phase 4 — Core Learning Logic
**Goal:** Pure algorithms that decide what to study, when, and why.  
**Phase progress:** 55% 🟡

| # | Step | Status | Notes |
|---|------|--------|-------|
| 4.1 | FSRS v6 scheduler | ✅ | `functions/src/core/scheduler/fsrs.ts` |
| 4.2 | FSRS parameter normalization | ✅ | |
| 4.3 | FSRS optimizer | ✅ | |
| 4.4 | Card eligibility checker | ✅ | `functions/src/core/queue/eligibility.ts` |
| 4.5 | Queue builder (prioritization strategies) | ✅ | `functions/src/core/queue/queueBuilder.ts` |
| 4.6 | Queue explainability | ✅ | Human-readable reasons |
| 4.7 | Concept graph utilities | ✅ | Prerequisites, paths, cycles |
| 4.8 | Concept mastery metrics | ✅ | `functions/src/core/graph/metrics.ts` |
| 4.9 | Algorithm-agnostic event payloads | ✅ | Dec 2025 refactor |
| 4.10 | **Policies layer** (`/policies`) | ⬜ | Planned: AFI, probing, cramming, clamps |
| 4.11 | **Application layer** (`/application`) | ⬜ | Planned: sessionManager, reviewFlow, onboarding |
| 4.12 | Session queue shaping (VDB interleaving) | 🟡 | Prototype in `legacy/client-brain-prototype/algorithm.ts`; not integrated |
| 4.13 | Relationship card injection into sessions | ⬜ | Designed in spec |
| 4.14 | Fatigue / capacity metrics | ⬜ | Domain types exist; logic not built |
| 4.15 | Goals & planning logic | ⬜ | Designed in spec |
| 4.16 | Diagnostic probing orchestration | ⬜ | Depends on policies + AI |

**Remaining in this phase:** Build policies and application layers; integrate legacy queue algorithm or replace with new queue builder.

---

### Phase 5 — Client SDK & Sync
**Goal:** A library the app uses to work offline and sync with the cloud.  
**Phase progress:** 70% 🟡

| # | Step | Status | Notes |
|---|------|--------|-------|
| 5.1 | Event creation helpers | ✅ | `functions/src/client/eventHelpers.ts` |
| 5.2 | Client-side event validation | ✅ | |
| 5.3 | Event upload (single + batch) | ✅ | |
| 5.4 | View reader (schedule, performance, due cards) | ✅ | `functions/src/client/viewClient.ts` |
| 5.5 | `StudyBuddyClient` high-level API | ✅ | Rename to Socrates pending |
| 5.6 | Local event queue (in-memory) | ✅ | For testing |
| 5.7 | Local event queue (IndexedDB) | ✅ | For production |
| 5.8 | Sync cursors (in-memory + IndexedDB) | ✅ | |
| 5.9 | Outbound sync (batch upload + retry) | ✅ | |
| 5.10 | Inbound sync (cursor-based fetch) | ✅ | |
| 5.11 | Sync engine (orchestration + auto-sync) | ✅ | |
| 5.12 | Sync integration tests | ✅ | |
| 5.13 | Client flow e2e tests (mocked) | ✅ | |
| 5.14 | Adapt SDK to Firebase **Client** SDK | ⬜ | Still uses server Firestore types |
| 5.15 | Publish SDK as standalone package | ⬜ | Currently lives inside `functions/` |
| 5.16 | Conflict resolution (CRDT rules) | 🟡 | Designed (LWW logs, max strengths); not fully implemented |
| 5.17 | Library content download/sync | ⬜ | Designed; not built |

**Remaining in this phase:** Port client code to Firebase Client SDK; extract into consumable package for the app.

---

### Phase 6 — User-Facing App
**Goal:** A real application someone can open and study with.  
**Phase progress:** 35% 🟡

| # | Step | Status | Notes |
|---|------|--------|-------|
| 6.1 | App project scaffold (Vite + React) | ✅ | Home, Study, Library, Concept Map routes |
| 6.2 | Firebase Auth integration | ✅ | Dev user `user_dev_001` + email sign-in |
| 6.3 | LocalForage persistent storage | ⬜ | |
| 6.4 | Wire up client SDK | ✅ | `SocratesClient` — review, upload, read views |
| 6.5 | **Home screen** (libraries, goals, sync status) | 🟡 | Sign-in + nav to study, library, concept map |
| 6.6 | **Study screen** (card review flow) | 🟡 | E2E with full Learning Science library (21 cards) |
| 6.7 | Question attempt UI | ⬜ | |
| 6.8 | Session lifecycle UI (start/end) | ⬜ | |
| 6.9 | Settings screen | ⬜ | |
| 6.10 | Card annotations UI (tags, pins) | ⬜ | |
| 6.11 | Queue explainability in UI | ⬜ | Backend ready |
| 6.12 | Offline indicator & manual sync controls | ⬜ | Sync engine ready |
| 6.13 | Capacitor mobile shell | ⬜ | |
| 6.14 | Tauri desktop shell | ⬜ | |
| 6.15 | Global AI assistant surface | ⬜ | Read-only unless invoked |
| 6.16 | Mastery certification UI flow | ⬜ | |
| 6.17 | Content flagging / feedback UI | ⬜ | |

**This phase unlocks the product.** Recommended first milestone: **6.6 Study screen** with card review only.

---

### Phase 7 — Cloud Ops & Deployment
**Goal:** Reliable, secure, observable infrastructure.  
**Phase progress:** 35% 🟡

| # | Step | Status | Notes |
|---|------|--------|-------|
| 7.1 | Firestore security rules | ✅ | `firestore.rules` |
| 7.2 | Security rules tests | ✅ | Integration + programmatic |
| 7.3 | Firestore indexes | 🟡 | `firestore.indexes.json` exists; may need more |
| 7.4 | Firebase project (dev/default) | ✅ | `study-buddy-cb8bc` |
| 7.5 | Firebase project (staging) | ✅ | `socrates-staging-eedc4` |
| 7.6 | Staging deployment | ✅ | Dec 31, 2025 |
| 7.7 | Staging deployment docs | ✅ | `functions/docs/STAGING_*.md` |
| 7.8 | Staging smoke test script | ✅ | `functions/scripts/test-event-projection.ts` |
| 7.9 | Re-verify staging (June 2026) | ✅ | Deployed + `npm run test:projection` passed June 14, 2026 |
| 7.10 | Firebase project (production) | ⬜ | |
| 7.11 | Production deployment | ⬜ | Guide exists: `PRODUCTION_DEPLOYMENT.md` |
| 7.12 | Environment config alignment | 🟡 | Root `.firebaserc` vs `functions/.firebaserc` differ |
| 7.13 | CI/CD pipeline (GitHub Actions) | ⬜ | |
| 7.14 | Monitoring & logging dashboards | ⬜ | |
| 7.15 | Error alerting (projection failures) | ⬜ | |
| 7.16 | Rollback procedures tested | ⬜ | Documented, not tested |

---

### Phase 8 — AI & Advanced Features
**Goal:** AI-assisted probing, embeddings, and intelligent interventions.  
**Phase progress:** 10% 🟡

| # | Step | Status | Notes |
|---|------|--------|-------|
| 8.1 | Early Genkit / Vertex AI prototype | 🟡 | `functions/src/pre.12.26.25 files/ai.ts` |
| 8.2 | Genkit dependencies | ⬜ | Removed Dec 2025 |
| 8.3 | Embedding generation pipeline | ⬜ | |
| 8.4 | Semantic similarity for interleaving | ⬜ | Referenced in queue design |
| 8.5 | AI diagnostic probing | ⬜ | Event type exists; no AI backend |
| 8.6 | AI remedial probing | ⬜ | |
| 8.7 | Mastery certification question generation | ⬜ | |
| 8.8 | Intervention proposals (accelerate / lapse) | ⬜ | Events exist; no proposal engine |
| 8.9 | AI assistant (read-only global) | ⬜ | |

**Defer until core study loop works without AI.**

---

### Phase 9 — Content & Libraries
**Goal:** Actual study material users can learn from.  
**Phase progress:** 35% 🟡

| # | Step | Status | Notes |
|---|------|--------|-------|
| 9.1 | Library bundle format (immutable JSON) | ✅ | `content/LIBRARY_FORMAT.md` |
| 9.2 | Sample / seed library | ✅ | `lib_learning_science_v1` — 7 concepts, 21 cards, 10 questions |
| 9.3 | Library hosting in Firestore / Storage | ⬜ | Currently static JSON in `app/public/` |
| 9.4 | Library download to client | 🟡 | App fetches `library.json` at runtime |
| 9.5 | Library version updates & sync | ⬜ | |
| 9.6 | Content authoring workflow | ⏸️ | Explicit non-goal for v1 |
| 9.7 | Community / shared libraries | ⏸️ | Future |

---

### Phase 10 — Quality, Polish & Launch
**Goal:** Ship a reliable product people can trust.  
**Phase progress:** 20% 🟡

| # | Step | Status | Notes |
|---|------|--------|-------|
| 10.1 | Unit + integration test suite | ✅ | 838 tests |
| 10.2 | Invariant test coverage | ✅ | Comprehensive |
| 10.3 | Projector test coverage | ✅ | |
| 10.4 | Client SDK test coverage | ✅ | |
| 10.5 | Firestore rules test coverage | ✅ | |
| 10.6 | End-to-end test against real staging | 🟡 | Script exists; needs run |
| 10.7 | Rename StudyBuddy → Socrates (code + repos) | ⬜ | Staging Firebase already uses `socrates-` |
| 10.8 | Documentation audit & cleanup | 🟡 | 35+ docs; some outdated |
| 10.9 | Performance / load testing | ⬜ | |
| 10.10 | Security audit | ⬜ | |
| 10.11 | Accessibility (a11y) | ⬜ | |
| 10.12 | Beta program | ⬜ | |
| 10.13 | App store / distribution | ⬜ | |
| 10.14 | Production launch | ⬜ | |

---

## Dependency Map

What must happen before what:

```
Phase 1 (Design)
    └── Phase 2 (Domain)
            └── Phase 3 (Backend)
                    ├── Phase 5 (Client SDK) ──┐
                    └── Phase 4 (Logic) ───────┼── Phase 6 (App) ← critical path
                                               │
                    Phase 9 (Content) ─────────┘
                            │
                    Phase 7 (Ops) ← parallel once backend exists
                            │
                    Phase 8 (AI) ← after core loop works
                            │
                    Phase 10 (Launch) ← last
```

**Critical path to first usable product:**
`2.10 → 3.15 → 5.14 → 6.1 → 6.4 → 6.6 → 9.2`

---

## Recommended Next Actions

When you sit down to work, pick from the top of this list:

| Priority | Action | Phase | Effort |
|----------|--------|-------|--------|
| 🔴 1 | ~~Re-verify staging~~ | 3.15, 7.9 | ✅ Done June 14, 2026 |
| 🔴 2 | ~~Scaffold app~~ | 6.1 | ✅ Vite + React in `app/` |
| 🔴 3 | ~~End-to-end test: sign in → study → staging~~ | 6.6 | ✅ Done |
| 🟠 4 | Fill `MESSAGING_SENDER_ID` + `APP_ID` in `.env.local` | 6.1 | 5 min |
| 🟠 5 | Show due cards from Firestore (not just sequential order) | 6.6 | 2–4 hrs |
| 🟠 6 | Set `VITE_LIBRARY_ID=lib_learning_science_v1` in `.env.local` | 9.4 | 1 min |
| 🟡 7 | Finish Zod runtime validation schemas | 2.10 | 4–8 hrs |
| 🟡 8 | Implement certification side effects (card suppression) | 3.11 | 2–4 hrs |
| 🟡 9 | Build policies layer (AFI, cramming) | 4.10 | 1–2 weeks |
| ⚪ 10 | Re-introduce AI / embeddings | 8.x | Later |
| ⚪ 11 | Production deployment | 7.11 | After app MVP |

---

## How to Update This Document

When you complete work:

1. Change the step's **Status** (⬜ → 🟡 → ✅).
2. Update the **phase progress** percentage and bar in "Where You Are."
3. Recalculate **Overall progress** (rough weighted average across phases).
4. Update **Last updated** date at the top.
5. Move items in **Recommended Next Actions** as appropriate.

### Suggested commit message when updating progress:
```
docs: update PROGRESS.md — completed [step name]
```

---

## Quick Links

| Resource | Path |
|----------|------|
| **Navigation hub** | `README.md` |
| Technical design | `docs/design/technical-design-document.md` |
| Full domain spec | `docs/design/socrates-structure-and-organizer.md` |
| Staging quickstart | `functions/docs/STAGING_QUICKSTART.md` |
| Client implementation guide | `functions/docs/CLIENT_IMPLEMENTATION.md` |
| Core domain logic | `functions/docs/CORE_DOMAIN_LOGIC.md` |
| Sync implementation | `functions/docs/SYNC_IMPLEMENTATION_SUMMARY.md` |
| Projector status | `functions/docs/PROJECTOR_COMPLETE.md` |
| Production deployment | `functions/docs/PRODUCTION_DEPLOYMENT.md` |
| Run all tests | `cd functions && npm test` |
| Test staging projection | `cd functions && npm run test:projection` |

---

*This document is the progress monitor. If you're unsure what to work on, start with **Recommended Next Actions** above.*
