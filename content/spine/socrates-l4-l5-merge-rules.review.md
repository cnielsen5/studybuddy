# Socrates L4/L5 — Rules-Based Merge Review

**Purpose:** Approve **rules** once; each rule resolves many proposals automatically.  
**Proposals file:** `socrates-l4-l5-merge-proposals.json` (308 items)  
**Tagged audit:** `socrates-l4-l5-merge-proposals.tagged.json` (`npm run tag:merge-proposals`)  
**Status:** Rules approved 2026-06-25 (see decisions table).  
**Next:** implement `npm run apply:merge-rules`, then rebuild spine drafts.

---

## How to use this document

1. Read each **Rule** below (default action + rationale + count).
2. Mark: **Approve** · **Reject** · **Modify** (note change in chat).
3. Rules marked Approve become spine governance — future placement/merges follow them.
4. Only **exceptions** listed need individual review.

---

## Tier 0 — Global principles (apply everywhere)

### G1 — Universal node, not per-domain duplicate ✅
**Action:** MERGE when two proposals are the **same learnable unit** in different domain silos.  
**Do not merge** when they are **siblings** in a teachable sequence (prerequisite chain).

**Test:** Would a single flashcard deck cover both without redundancy?  
- Yes → merge (add `domain_contexts[]`)  
- No → keep separate

### G2 — Sibling inhibition / disorder types / pathway steps ✅
**Action:** KEEP SEPARATE nodes that are intentionally sequential or categorical siblings.  
**Applies to:** competitive vs noncompetitive inhibition, Type I vs Type II hypersensitivity, distinct anxiety disorders (panic vs phobia).

### G3 — Cross-anchor similarity gate ✅ (modified)
**Action:** REJECT merge when **titleDice < 0.55** (false positive from shared vocabulary).  
**Additional gate:** Even when titleDice ≥ 0.55, require **defDice ≥ 0.45** before considering merge.  
**Count:** ~72 auto-reject (low title); ~15 medium band auto-reject unless manually promoted.  
**Exception:** Explicit shared-note rules (Tier 5).

### G4 — Migration auto-merge threshold ✅ (modified)
**Action:** AUTO-MERGE if slug-equal OR title-equal OR titleDice ≥ **0.85**.  
**Manual band:** titleDice **0.72–0.85** → R-MIG-G (approved merge after spot-check).  
**Below 0.72:** default keep separate (R-MIG-Z) unless a named sub-rule applies.

---

## Tier 1 — Depth reconciliation (3 proposals)

### R-DEPTH-1 — Mixed L4/L5 across contexts → promote to L4 ✅
**Action:** CONFIRM **L4** when **any** member context has `max_resolution ≤ 4`.  
**Rationale:** Shallow contexts (biology max=4) must be able to include the concept.  
**Applies to (all confirmed L4):**
- `spine_biology_l4_refractory_periods` (bio + med + psych)
- `spine_biology_l4_synaptic_cleft_clearance` (med + psych)
- `spine_mathematics_l4_half_life_decay_constant` (chemistry + physics)

**L5 deep-dive:** Only if a **separate** L5 child is needed for max=5 contexts (e.g. saltatory conduction model).

---

## Tier 2 — Migration pairs (128 proposals)

### R-MIG-A — Hypersensitivity type alignment ✅
**Action:** MERGE biology `hypersensitivity_type_{i,ii,iii,iv}` with medicine `type_{i,ii,iii,iv}_*` **per type** (I↔I only, never I↔IV).  
**Dice:** 0.62–0.75  
**Exception:** `H_same_domain_collision` pair already kept separate (Type IV vs Type I).

### R-MIG-B — Conduction / propagation atomicity ✅
**Action:** **KEEP SEPARATE** (already resolved in action_potential sample).  
- L4 `signal_propagation` = overview (continuous + intro)  
- L5 `saltatory_conduction` = deep mechanism (med + psych only)  
- Do **not** merge `axonal_propagation` into `signal_propagation` without reviewer note.

### R-MIG-C — Enzyme kinetics siblings ✅
**Action:** **KEEP SEPARATE** — competitive, noncompetitive, uncompetitive, mixed are distinct teachable units.  
High Dice (0.72–0.82) reflects shared vocabulary, not duplicate content.

### R-MIG-D — Exponential decay / first-order family ✅
**Action:** MERGE only when **same mathematical object** across domain naming:

| Merge | Do not merge |
|-------|----------------|
| `exponential_decay_model` ↔ `exponential_decay_law` | `first_order_reaction_model` ↔ `first_order_elimination_model` (different anchors — use forward ref or shared context) |
| `decay_constant_half_life` ↔ `half_life_decay_constant` | Reaction model vs elimination model (related but different framing) |

**Sub-rule:** Math↔chemistry↔physics identity → **add domain_context**, don't duplicate L3.

### R-MIG-E — Membrane / electrophysiology ✅
**Action:**

| Merge | Keep separate |
|-------|----------------|
| `goldman_hodgkin_katz` ↔ `goldman_hodgkin_katz_equation` | `na_k_atpase` ↔ `goldman_hodgkin_katz` (pump vs equation) |
| `nernst_equilibrium_potential` duplicates across contexts | `resting_membrane_potential` ↔ `equilibrium_vs_steady_state` (related, not same) |
| `sodium_potassium_pump` ↔ `na_k_atpase_role` | |

### R-MIG-F — Psych / clinical disorder ↔ features ✅ (broad)
**Action:** **MERGE** all clinical↔psych pairs within disorder anchors (`anxiety_disorders`, `eating_disorders`, `personality_disorders_overview`, `schizophrenia_spectrum`, `substance_use_disorders`).  
Survivor preference: `_clusters` / `_disorder` / `_presentation` over management/treatment slugs; absorb `domain_contexts[]` from absorbed node.

### R-MIG-G — High-confidence near-duplicates (titleDice 0.72–0.85) ✅
**Action:** **MERGE** after spot-check — includes:
- `peripheral_tolerance` ↔ `central_peripheral_tolerance`
- `synaptic_vesicle_release` ↔ `presynaptic_vesicle_release`
- `active_immunization` ↔ `active_immunization_principle`
- `type_errors_significance` ↔ `type_i_ii_errors_power`
- (full list tagged `rule:R-MIG-G` in JSON after apply)

### R-MIG-Z — Remaining low-confidence (~48 pairs) ✅
**Action:** Default **KEEP SEPARATE** unless reviewer moves to R-MIG-G after spot-check.  
**Spot-check anchors:** `synaptic_transmission`, `neurotransmitters_and_receptors`, `adaptive_immunity_overview`.

---

## Tier 3 — Shared concept flags / context addition (84 proposals)

### R-CTX-1 — Post-merge metadata notes ✅
**Action:** **NO FURTHER MERGE** — note documents completed migration (`Merged X from Y`).  
**Follow-up:** Strip merge boilerplate from `_shared_concept_note` after review; keep only forward-looking cross-domain flags.

### R-CTX-2 — Psychopathology med/clinical framing ✅
**Action:** **DEFER** adding `medicine_clinical` context until clinical psychiatry pass is intentional.  
**For now:** Cards attach to existing `psychology_neuroscience` (+ clinical where already present).  
**Not:** duplicate nodes per domain.

### R-CTX-3 — Neuroscience ↔ medicine_preclinical physiology crossover ✅
**Action:** When concept is **same mechanism** (resting potential, ion channels): **add domain_context** to universal node if missing.  
**When** concept is **clinical-only** (local anesthetics, toxins): single-context member is correct.

### R-CTX-4 — Math / chemistry / physics identity ✅
**Action:** **Add domain_context** on the math-owned universal node; link to chemistry L3 via forward reference — do **not** merge distinct L3 anchors.

---

## Tier 4 — Cross-anchor similarity (90 proposals)

### R-XA-1 — Low similarity (titleDice < 0.55): reject ✅
**Action:** **REJECT** merge — pedagogical neighbors, not duplicates.  
**Count:** ~72

### R-XA-2 — Medium similarity (0.55–0.70) ✅ (modified)
**Action:** **REJECT** by default — too noisy in mathematics; manually promote only if defDice ≥ 0.45 and same definition.  
**Count:** ~15

### R-XA-3 — High similarity cross-anchor (≥ 0.70) ✅ (via G3 gate)
**Action:** **REJECT** unless defDice ≥ 0.45 (all 3 current pairs fail gate → keep separate).  
**Examples:** exp vs log equations (siblings); ODE classification across anchors; eating vs personality pharmacotherapy limits (different disorders).

---

## Tier 5 — Explicit shared-note links (3 proposals)

### R-SN-1 — DNA helix (chemistry L4) ↔ biology L3 replication ✅
**Action:** **KEEP SEPARATE** — structure (chemistry) vs replication process (biology).  
**Link:** forward reference from chemistry node to biology L3; do not merge.

### R-SN-2 — First-order elimination (math L4) ↔ integrated rate laws (chemistry L3) ✅
**Action:** **Add chemistry domain_context** to math universal node OR forward ref — not merge of L3 anchors.

### R-SN-3 — First-order reaction model (math) ↔ exponential decay L3 ✅
**Action:** Same as R-SN-2 — shared math, different anchors; context + forward ref.

---

## Summary table (post-approval)

| Rule | Decision | ~Count | Effective action |
|------|----------|--------|------------------|
| G1–G2 | ✅ | all | Universal node + sibling separation |
| G3 | ✅ modified | 90 | Reject cross-anchor noise; defDice ≥ 0.45 to consider |
| G4 | ✅ modified | 128 | Auto ≥0.85; manual 0.72–0.85 |
| R-DEPTH-1 | ✅ | 3 | Confirm L4 |
| R-MIG-A,D,E,G | ✅ | ~53 | Merge per sub-rules |
| R-MIG-B,C | ✅ | 16 | Keep separate |
| R-MIG-F | ✅ broad | 11 | Merge all clinical↔psych pairs in disorder anchors |
| R-MIG-Z | ✅ | 48 | Keep; spot-check 3 anchors |
| R-CTX-* | ✅ | 84 | Cleanup / defer / add context |
| R-XA-1,2,3 | ✅ | 90 | Reject (G3 gate) |
| R-SN-* | ✅ | 3 | Forward ref / add context |

**Estimated individual reviews after rules:** ~15–20 (R-CTX-0 misc, R-MIG-F exceptions, R-MIG-Z spot-check promotions).

---

## Approved decisions (2026-06-25)

| Rule | Approve? | Notes |
|------|----------|-------|
| G1–G2 | ✅ | Flashcard-deck test + sibling separation |
| G3 | ✅ modified | titleDice < 0.55 reject; defDice ≥ 0.45 to consider merge |
| G4 | ✅ modified | Auto-merge ≥ 0.85; manual 0.72–0.85 |
| R-DEPTH-1 | ✅ | All 3 nodes stay L4 |
| R-MIG-A,D,E,G | ✅ | Merge families approved |
| R-MIG-B,C | ✅ | Keep separate |
| R-MIG-F | ✅ broad | Merge all clinical↔psych pairs in disorder anchors |
| R-MIG-Z | ✅ | Default keep; spot-check 3 anchors |
| R-CTX-1–4 | ✅ | Cleanup, defer clinical, add context |
| R-XA-1–3 | ✅ | Reject medium band; G3 gate on high band |
| R-SN-1–3 | ✅ | Forward ref / context, not L3 merge |

---

## Exceptions queue (manual only)

| ID | Pair | Why exception |
|----|------|----------------|
| R-MIG-F | `phobia_social_anxiety` ↔ `panic_phobia_presentation` | Different disorders — keep separate |
| R-MIG-F | `ssri_anxiety_titration` ↔ `panic_phobia_presentation` | Treatment vs presentation |
| R-MIG-F | Most eating/personality pairs | Cross-diagnosis or treatment vs features |
| R-MIG-F | `negative_symptom_psychosocial` ↔ `negative_cognitive_symptoms` | Review — may merge as symptom cluster |
| R-MIG-Z | Spot-check ~5–10 pairs in 3 anchors | Promote obvious merges (e.g. herd_immunity) |
| R-CTX-0 | 9 untagged context notes | Human review |
