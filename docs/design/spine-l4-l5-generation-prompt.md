# Socrates Spine — L4/L5 Concept Generation Prompt (Universal Model)

Authoritative specification for expanding L3 spine nodes into universal L4/L5 child concepts with per-domain context membership.

**Anchor bundles:** `content/spine/l4-l5-bundles/{anchor_l3_id}.json`  
**Generation queue:** `content/spine/l4-l5-generation-queue.json` (export via `npm run export:l4-l5-queue`)  
**Merge:** `cd library-creator && npm run build:spine-l4-l5`  
**Full L1–L5:** `npm run build:spine-l1-l5`

---

## Your Role

You are expanding the Socrates universal spine concept graph. You receive one **L3 anchor** and one **target domain context**. Your job is to ensure that anchor has complete, high-quality L4/L5 coverage for that context — without duplicating concepts that already exist on the same anchor or elsewhere in the spine.

Every concept is a **universal node** with a `domain_contexts[]` array. Domain contexts define relevance, framing, hierarchy, and in-context dependency graphs — not separate copies of the same idea.

These child concepts are card-bearing nodes (5–15 flashcards each). Flag uncertainty with `_reviewer_note` rather than guessing silently.

---

## Universal Model (Critical)

**One concept, many contexts.** If "Nernst Equilibrium Potential" is the same learnable unit in medicine_preclinical and psychology_neuroscience, there is ONE node (`spine_biology_l4_nernst_equilibrium_potential`) with two entries in `domain_contexts[]`.

**Child IDs use the anchor's primary domain**, not the generating context:
- Anchor `spine_biology_l3_membrane_potential` → children are `spine_biology_l4_*` / `spine_biology_l5_*`
- Medical-only relevance is expressed via single-context membership in `domain_contexts[]`

**L5 per-context membership:** An L5 concept may appear in only some of its parent L4's contexts (e.g. saltatory conduction in med + psych but not biology when biology max=4).

---

## Two-Pass Workflow (Run in Order)

### Pass 1 — Relevance (before generating anything)

Given the anchor's **existing universal concepts** (from the anchor bundle, if any) and the **target domain context**:

1. List which existing concepts should **gain** a new `domain_contexts[]` entry for this domain (same node, context-specific framing/hierarchy/graph).
2. List which existing concepts are **irrelevant** to this domain (do not add context).
3. Do **not** create a new node if an existing universal concept on this anchor already covers the same learnable unit.

When adding a context to an existing concept, copy the universal `dependency_graph` edges that apply in this domain and write context-specific framing from the L3 domain context template.

### Pass 2 — Gap (only after Pass 1)

Generate **new** universal concepts only for learnable units that:
- Are in scope for the L3 node and target domain context
- Have no existing universal node on this anchor (Pass 1 found no match)
- Meet atomicity and depth rules below

---

## Input Format

```json
{
  "anchor_l3_id": "spine_biology_l3_action_potential",
  "anchor_primary_domain": "biology",
  "parent_l3_concept": { "...": "full L3 spine concept" },
  "target_domain_context": { "...": "one domain_context from parent.domain_contexts" },
  "existing_anchor_concepts": [ "... universal L4/L5 concepts already in the anchor bundle, may be [] ..." ],
  "generation_parameters": {
    "max_resolution_in_context": 5,
    "audience_level": "medical_student",
    "audience_description": "...",
    "source_preference": ["OpenStax", "LibreTexts", "NCBI Bookshelf / StatPearls"],
    "target_l4_count": "4-8 new L4 nodes if gap pass needed",
    "target_l5_count": "2-4 new L5 per L4 parent where max_resolution_in_context = 5"
  }
}
```

Queue entries are exported to `content/spine/l4-l5-generation-queue.json`.

---

## Output Format

**Update the anchor bundle** — output the full anchor file (existing concepts updated + any new concepts appended):

```json
{
  "_meta": {
    "anchor_l3_id": "spine_biology_l3_action_potential",
    "anchor_primary_domain": "biology",
    "model": "universal-l4-l5",
    "generation_date": "YYYY-MM-DD",
    "status": "draft",
    "notes": "Pass 1: added psych context to 3 existing nodes. Pass 2: generated 2 new L5 nodes."
  },
  "concepts": [ "... all universal concepts for this anchor ..." ]
}
```

Each concept schema:

```json
{
  "id": "spine_biology_l4_action_potential_threshold",
  "resolution_level": 4,
  "anchor_concept_id": "spine_biology_l3_action_potential",
  "content": {
    "title": "Threshold and All-or-None Response",
    "definition": "Domain-neutral definition.",
    "summary": "2–3 sentences."
  },
  "knowledge_graph": {
    "knowledge_area": "Life Sciences",
    "knowledge_cluster": "Cell Signaling",
    "primary_domain": "biology",
    "_shared_concept_note": null
  },
  "dependency_graph": {
    "parent_concept_id": "spine_biology_l3_action_potential",
    "prerequisites": [],
    "unlocks": ["spine_biology_l4_voltage_gated_ion_channels"]
  },
  "domain_contexts": [
    {
      "domain_id": "biology",
      "framing": {
        "title_in_context": "Threshold and All-or-None Response",
        "relevance": "...",
        "applications": ["..."],
        "max_resolution_in_context": 4
      },
      "hierarchy_location": {
        "category": "...",
        "subcategory": "...",
        "topic": "...",
        "subtopic": "..."
      },
      "dependency_graph": {
        "prerequisites_in_context": [],
        "unlocks_in_context": ["spine_biology_l4_voltage_gated_ion_channels"]
      },
      "linked_content": { "by_library": {} }
    },
    {
      "domain_id": "medicine_preclinical",
      "framing": { "...": "context-specific framing for this domain" },
      "hierarchy_location": { "...": "..." },
      "dependency_graph": {
        "prerequisites_in_context": [],
        "unlocks_in_context": ["spine_biology_l4_voltage_gated_ion_channels"]
      },
      "linked_content": { "by_library": {} }
    }
  ],
  "metadata": {
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z",
    "created_by": "ai_draft",
    "version": "0.2-draft",
    "status": "draft",
    "source_references": [
      { "source": "OpenStax Biology 2e", "chapter": "33", "section": "33.2 — Threshold" }
    ]
  }
}
```

**Do not emit** per-context siloed fields (`domain_id` on the concept root, singular `domain_context`).

---

## ID Naming Convention

- **L4:** `spine_{anchor_primary_domain}_l4_{short_descriptive_name}`
- **L5:** `spine_{anchor_primary_domain}_l5_{short_descriptive_name}`

Lowercase, underscore-separated, subject-derived (not positional). IDs are stable across context additions.

---

## Core Generation Rules

### Rule 1 — Atomicity
Each concept = exactly one learnable idea. Split definitions joined by distinct "and" ideas.

### Rule 2 — Card-bearing granularity
5–15 focused flashcards per concept. Merge if <5; split if >15.

### Rule 3 — Domain-neutral definitions
`content.definition` must not assume a specific audience. Domain framing goes in each `domain_contexts[].framing`.

### Rule 4 — Depth calibration
- L4 when `max_resolution_in_context >= 4` for a member context.
- L5 only in contexts where `max_resolution_in_context = 5`.
- L5 `domain_contexts[]` must be a subset of its parent L4's contexts.

### Rule 5 — Prerequisite ordering
Concepts array ordered teachably — prerequisites before dependents.

### Rule 6 — Prerequisites within siblings
Use real prerequisite edges between generated siblings; don't leave empty when dependency exists.

### Rule 7 — Forward references
For unlocks to concepts not yet in the spine:

```json
"unlocks": [
  { "concept_id": "spine_medicine_preclinical_l3_steady_state_concentration", "_forward_reference": true }
]
```

Same format allowed in `unlocks_in_context`.

### Rule 8 — Shared concept flagging
When a concept likely exists under another L3 anchor or domain, set `knowledge_graph._shared_concept_note` with the target spine id. **Do not duplicate nodes.** A batch consolidation pass adds cross-anchor contexts later.

### Rule 9 — Source references are mandatory

Every L4 and L5 concept must include at least one source reference. Prefer OpenStax, LibreTexts, NCBI Bookshelf / StatPearls.

**Each concept must have a source reference specific to that concept's content. Do not reuse the same chapter and section for every concept in a file. If uncertain of the exact section, cite the chapter only rather than guessing a section number.**

If no open-source reference exists:

```json
{
  "source": "No open-source reference identified — requires manual citation",
  "url": null
}
```

Never fabricate a citation.

### Rule 10 — Flag uncertainty
Use `_reviewer_note` on the concept when scope, level, or merge candidacy is uncertain.

### Rule 11 — Graph consistency (universal ↔ each domain context)

For each `domain_contexts[]` entry, `prerequisites_in_context` / `unlocks_in_context` must reflect the subset of universal edges whose targets are members of that same context (or are forward references / L3 nodes).

Universal `dependency_graph` = union of all in-context edges across member contexts (plus forward refs to external nodes).

Note intentional divergence with `_reviewer_note`.

### Rule 12 — No duplicate generation
Before creating a new concept, check `existing_anchor_concepts`. If title/definition match an existing node, add a domain context (Pass 1) instead of creating a duplicate. If uncertain, flag in output notes for merge review.

---

## Depth Calibration by Audience

| Audience | L4 granularity | L5 |
|----------|----------------|-----|
| highschool | Single mechanism, no derivations | None |
| undergrad | Mechanism + one conditional layer | Specialist extension, optional |
| medical_student | Clinical application, Step 1 exceptions | High-yield exam distinctions |
| resident | Protocols, decision thresholds | Subspecialty nuance |

---

## Scope Boundaries

**Generate:** concepts within L3 semantic scope and domain context framing/applications at audience depth.

**Do not generate:** different L3 parent's content; pure eponyms without relevance; L2-broad chapters; duplicate existing L3 nodes; a second universal node when Pass 1 should add a context instead.

---

## Quality Checklist

- [ ] Universal model: `domain_contexts[]` array, no root `domain_id`
- [ ] IDs use anchor primary domain (`spine_{anchor_domain}_l4_*`)
- [ ] Pass 1 relevance assessment documented in `_meta.notes`
- [ ] No duplicate nodes where Pass 1 should have added context
- [ ] `resolution_level` 4 or 5 only
- [ ] L5 only in max=5 contexts; L5 contexts ⊆ parent L4 contexts
- [ ] Domain-neutral definition
- [ ] L5 `parent_concept_id` → L4 parent in same anchor file
- [ ] Teachable array order
- [ ] Concept-specific source references
- [ ] Universal and per-context dependency graphs consistent
- [ ] `linked_content.by_library` = `{}`
- [ ] `metadata.status` = `"draft"`, `created_by` = `"ai_draft"`
- [ ] Forward refs flagged
- [ ] Count within target ranges

---

## Post-generation (batch, not per unit)

1. **Merge review:** Run `npm run build:merge-proposals` — human reviews all merge candidates before merging.
2. **Shared concept consolidation:** Collect all `_shared_concept_note` flags; add cross-anchor domain contexts in one batch pass.
3. **Build:** `npm run build:spine-l4-l5` then `npm run build:spine-l1-l5`.
