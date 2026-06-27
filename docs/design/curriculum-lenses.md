# Curriculum Lenses

> **Status:** Schema + runtime helpers implemented (2026-06-27). ABOS and Orthobullets orthopaedic lenses populated (137 + 136 mappings).

## Concept

A **curriculum lens** is a named organizational view over the same underlying spine concept graph. Concepts, cards, and performance data do not change when a user switches lenses. What changes:

- Which concepts are **in scope** for navigation and prioritization
- How they are **grouped and labeled**
- **Presentation order** within groups
- What is **high-yield** within that curriculum

This sits **above** `domain_contexts[]`:

| Layer | Analogy | Example |
|-------|---------|---------|
| Spine concept | Universal node | `spine_medicine_clinical_l4_fracture_healing` |
| `domain_contexts[]` | Subject framing | Mathematics vs Chemistry vs Clinical |
| **Curriculum lens** | Exam / curriculum outline | ABOS Basic Science vs Orthobullets Trauma → Bone Biology |

The same concept can appear in **multiple sections** within one lens (different order, depth, high-yield flags) — e.g. fracture healing under ABOS Basic Science and under Trauma → Bone Biology.

## Data model

Types: `library-creator/src/types/curriculumLens.ts`

Storage: `content/lenses/*.json` (one file per lens)

```typescript
interface CurriculumLens {
  id: string;                        // lens_abos_blueprint_2024
  name: string;
  source: string;
  domain_id: string;                 // medicine_clinical
  version: string;
  description: string;
  intended_audience: string;
  sections: CurriculumSection[];     // flat rows; nest via parent_section_id
  concept_mappings: ConceptMapping[];
  metadata: { created_at, source_url?, status: "active" | "archived" };
}
```

Sections use a **flat list** with `parent_section_id` for nesting. Use `buildSectionTree()` / `flattenSections()` for UI trees.

## Runtime

Helpers: `library-creator/src/lens/applyLens.ts`

- **`applyLens(concepts, lens, resolutionRange)`** — returns `LensView` with sections, sorted mapped concepts, and `unmapped_concept_ids`
- **`getEffectiveHighYieldScore(concept, lens, { sectionId?, sectionWeight? })`** — lens high-yield floor (8) + optional section-weight boost
- **`getDepthInLens(concept, lens)`** — generation / study depth override
- **`getTitleInLens(concept, mapping)`** — optional rename within lens

Switching lenses is a **UI state change**: re-run `applyLens` on the loaded concept set; no re-fetch of concept bodies or card schedules.

## Library creation

When a user creates a library and selects a lens:

1. Use lens **sections** as the organizational scaffold (not raw spine hierarchy)
2. Generate cards to **`depth_in_lens`** per mapping
3. Set **`editorial.high_yield_score`** from `high_yield_in_lens` + section `weight`
4. Order learning sequence by **`order_in_section`**

Lens data is lightweight: outline + mapping table only (~300–500 rows for a full ABOS ortho lens).

## Building lens data

### ABOS blueprint

1. Parse public ABOS blueprint PDF → `sections[]` (AI-assisted one-pass works well)
2. Map each blueprint item → closest `spine_*` concept ID (semi-automated suggest + human validate)
3. Set `order_in_section`, `high_yield_in_lens`, `depth_in_lens` from exam weight and clinical judgment

### Orthobullets taxonomy

Same process using their public topic tree as `sections[]`.

## Validation

```bash
cd library-creator && npm run validate:lenses
```

Checks Zod schema, section graph integrity, duplicate mappings, and (when spine draft exists) known spine concept IDs.

## Active lenses

| File | Mappings | Audience |
|------|----------|----------|
| `lens_abos_orthopaedic_2025.json` | 137 | ABOS board certification blueprint 2025 |
| `lens_orthobullets_orthopaedic_2026.json` | 136 | Orthobullets subspecialty topic navigation |

Both lenses map `medicine_clinical` orthopaedic spine concepts. High-yield flags exist only in lens mappings (G60), not on spine concept JSON.

## Stubs / archived

- `content/lenses/lens_abos_blueprint_2024.stub.json` — ABOS section outline, empty mappings (schema reference)
- `content/lenses/lens_orthobullets_topic_taxonomy.stub.archived.json` — superseded by `lens_orthobullets_orthopaedic_2026.json`

## Integration roadmap

| Consumer | Use |
|----------|-----|
| App concept map | Render `LensView.sections` as primary nav |
| Session queue builder | `getEffectiveHighYieldScore` + section weights |
| Library creator CLI | Lens selection in intent → scaffold + card density |
| Firestore (future) | User preference: `active_lens_id` per library enrollment |
