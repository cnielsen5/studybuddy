# Library Creator — TODO

## Option A reminder (app UI)

**Current mode: Option B — CLI only** (`npm run cli` in this package).

When the ingestion + intent flow is stable, migrate to **Option A**:

- [ ] Add `/create-library` wizard in `app/` (TanStack Router page)
- [ ] Persist `LibraryCreationJob` to Firestore instead of `library-creator/.jobs/`
- [ ] Reuse types from `@studybuddy/library-creator` (or extract shared package)
- [ ] Stage review UI: approve/edit artifacts between pipeline stages
- [ ] File upload for PDF/PPTX (Cloud Storage + ingestion worker)

Until then, dogfood via CLI and keep artifacts in `.jobs/` (gitignored).

## Pipeline stages not yet implemented

- [x] Stage 3: Domain profile selection (CLI)
- [x] Stage 4: Concept graph extraction (heuristic + optional OpenAI)
- [ ] Stage 5: Card + question generation per concept
- [ ] Stage 6: Relationship mapping
- [ ] Stage 7: Golden Master bundle export + `libraryConformance` validation
- [ ] Stage 8 (Phase 2+): External source augmentation

## Ingestion backlog

- [ ] PDF parser (pdfplumber sidecar or pdf-parse MVP)
- [ ] PPTX parser (python-pptx sidecar)
- [ ] Multi-URL ingest (user-provided URL list, not open crawl)
- [ ] Sitemap subset ingest (scoped)
