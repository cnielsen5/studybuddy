# Spine Growth & Placement

How new information (cards, library concepts, imported content) finds a home on the universal spine — and how the graph grows over time without a upfront full L4/L5 expansion.

**Related:** `spine-l4-l5-generation-prompt.md` · `socrates-spine-l1-l5.draft.json` · `content/spine/spine-growth-queue.json`

---

## Principle

The spine is a **living framework**, not a one-time export.

1. **L1–L3** is the stable domain skeleton (502 concepts today).
2. **L4/L5** exists where already expanded (49 anchors today) — more can be added incrementally.
3. When **new information** appears during library/card work, run **placement** before committing content:
   - Does it fit an existing node?
   - Should an existing universal node gain a new `domain_context`?
   - Does it need a **new child** (L4/L5) under an L3 anchor?
   - Does it need a **new L3** (rare)?

Human review gates any structural spine change. Placement is advisory + queue, not auto-write.

---

## Workflow

```
New content (card, question, draft concept, import chunk)
        │
        ▼
  placeOnSpine()          ← heuristic match against L1–L5 index
        │
        ├── use_existing          → attach cards to spine id (via library anchor)
        ├── add_domain_context    → queue: extend universal node
        ├── create_l4_child       → queue: new L4 under anchor
        ├── create_l5_child       → queue: new L5 under L4
        ├── create_l3_node        → queue: new L3 (rare)
        └── human_review          → queue: ambiguous / cap conflict
        │
        ▼
  spine-growth-queue.json   (pending_review)
        │
        ▼
  Human approves → apply via universal generation prompt / manual JSON edit
        │
        ▼
  npm run build:spine-l4-l5 && npm run build:spine-l1-l5
```

---

## Tools

| Command | Purpose |
|---------|---------|
| `npm run check:spine-placement -- --domain … --title … --definition …` | Check where content fits |
| `… --queue` | Also append to `content/spine/spine-growth-queue.json` |
| `npm run check:spine-placement -- --list` | List queued growth proposals |
| `npm run build:spine-l1-l5` | Rebuild merged index after spine changes |

### Placement input (JSON)

```json
{
  "domain_id": "medicine_preclinical",
  "title": "Use-Dependent Sodium Channel Blockade",
  "definition": "…",
  "hint_concept_id": "spine_biology_l3_action_potential",
  "source": { "kind": "card", "library_id": "lib_…", "entity_id": "card_…" }
}
```

### Recommendations

| Recommendation | Meaning |
|----------------|---------|
| `use_existing` | Attach content to `target_concept_id` |
| `add_domain_context` | Same universal node; add a domain lens |
| `create_l4_child` / `create_l5_child` | New spine child under `suggested_parent_id` |
| `create_l3_node` | No neighborhood match — needs new L3 or different domain |
| `human_review` | Near-duplicate or `max_resolution=3` cap blocks auto L4/L5 |

---

## Resolution caps

L3 `domain_context.framing.max_resolution_in_context` still controls **how deep** an anchor may grow in each domain:

- `max = 3` → placement may attach at L3 only, or flag review to raise cap before L4/L5
- `max = 4` → L4 children allowed
- `max = 5` → L4 + L5 allowed

Caps can be raised during growth review when L3 proves too coarse for new cards.

---

## Library pipeline integration (future)

When library-creator generates cards from source material:

1. After concept/card draft → `placeOnSpine()` per atomic item
2. `use_existing` → set `anchor_concept_id` on library concept
3. Anything else → `--queue` for spine growth review
4. Optional batch: `npm run build:merge-proposals` to catch duplicates after growth

---

## What stays manual for now

- Approving / rejecting queue entries
- Writing new spine JSON (or LLM + universal prompt)
- Merge proposal review (`socrates-l4-l5-merge-proposals.review.md`)
- Raising `max_resolution_in_context` on L3 when appropriate

The infrastructure is in place; automation can tighten as the library pipeline matures.
