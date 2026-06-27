# Library Creator

CLI-first pipeline for building Socrates content libraries from source material.

**Mode:** Option B (CLI). See [TODO.md](./TODO.md) for the planned app wizard (Option A).

## Quick start

```bash
cd library-creator
npm install
npm run cli -- help
```

## Typical workflow

```bash
# 1. Create a job
npm run cli -- create "OpenStax Anatomy Chapter 1"

# 2. Ingest source (website, file, or pasted text)
npm run cli -- ingest lc_xxx --url "https://openstax.org/books/anatomy-and-physiology/pages/1-introduction"
# npm run cli -- ingest lc_xxx --file ./syllabus.md
# npm run cli -- ingest lc_xxx --text "# Week 1\n\n## Intro\n..."

# 3. Review parsed sections
npm run cli -- show lc_xxx ingestion

# 4. Approve ingestion → unlock intent stage
npm run cli -- approve lc_xxx ingestion

# 5. Answer intent questions (audience, purpose, scope)
npm run cli -- intent lc_xxx

# 6. Approve intent → domain profile
npm run cli -- approve lc_YOUR_JOB_ID intent
npm run cli -- domain-profile lc_YOUR_JOB_ID
npm run cli -- approve lc_YOUR_JOB_ID domain_profile

# 7. Extract + approve concept graph
npm run cli -- extract-concepts lc_YOUR_JOB_ID
npm run cli -- show lc_YOUR_JOB_ID concept_graph
npm run cli -- approve lc_YOUR_JOB_ID concept_graph
```

Optional AI extraction (requires `OPENAI_API_KEY`):

```bash
npm run cli -- extract-concepts lc_YOUR_JOB_ID --ai
```

Jobs and artifacts are stored locally under `.jobs/` (gitignored).

## Pipeline stages

| Stage | Status | Output |
|-------|--------|--------|
| 1. Ingestion | **Implemented** | `ParsedSource` |
| 2. Intent dialogue | **Implemented** | `LibraryCreationIntent` |
| 3. Domain profile | **Implemented** | `DomainProfile` archetype selection |
| 4. Concept graph | **Implemented** | Draft concepts (heuristic; optional OpenAI) |
| 5. Cards + questions | Planned | Per-concept content |
| 6. Relationships | Planned | Graph edges |
| 7. Export | Planned | Golden Master `library.json` |

## Ingestors

| Source | Support |
|--------|---------|
| Website (single URL) | Yes — Readability + heading sections |
| Text / Markdown | Yes |
| Syllabus (heuristic) | Yes |
| PDF / PPTX | Not yet |

## Domain profiles

Built-in archetypes in `profiles/`: anatomy, math, chemistry, history, physics, law, mixed.

```bash
npm run cli -- profile suggest "Inorganic Chemistry"
```

## Tests

```bash
npm test
```

## Target output

Final export must validate against `content/LIBRARY_FORMAT.md` and `functions/tests/helpers/libraryConformance.ts`.
