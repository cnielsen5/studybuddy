# Socrates L4/L5 Sample Generation — Review Outline

**10 L3 parents** across 7 domains · generated 2026-06-13 · status: `draft-for-review`

Format: **L4/L5 title**, spine id, one-line summary, prereqs within sample, flags.

**Depth rules applied:** L4 where `max_resolution_in_context ≥ 4`; L5 only where `max_resolution_in_context = 5`.

---

## 1. Exponential Decay → Medicine (Preclinical)

**L3:** Exponential Decay · `spine_mathematics_l3_exponential_decay`  
**Domain context:** Drug Clearance & Elimination Kinetics · max **5** · audience: Step 1 medical student

### L4
- **First-Order Elimination Model** `spine_medicine_preclinical_l4_first_order_elimination_model`  
  Proportional elimination producing exponential plasma decline; default model for most drugs.  
  _[shared]_ Mathematically identical to first-order chemical kinetics (`spine_chemistry_l3_integrated_rate_laws`).

- **Elimination Rate Constant (ke)** `spine_medicine_preclinical_l4_elimination_rate_constant`  
  Fraction eliminated per unit time (time⁻¹); links decay math to measurable PK.  
  Prereqs: `first_order_elimination_model`

- **Drug Half-Life (t½)** `spine_medicine_preclinical_l4_drug_half_life`  
  Time for concentration to fall by half under first-order kinetics.  
  Prereqs: `elimination_rate_constant`

- **Clearance and Elimination Relationship** `spine_medicine_preclinical_l4_clearance_elimination_relationship`  
  CL = ke × Vd; connects elimination rate to volume of distribution.  
  Prereqs: `elimination_rate_constant`  
  _[forward ref]_ unlocks existing L3 `spine_medicine_preclinical_l3_steady_state_concentration`

- **Zero-Order vs First-Order Elimination** `spine_medicine_preclinical_l4_zero_order_vs_first_order_elimination`  
  Saturated elimination pathways vs proportional loss; phenytoin/ethanol examples.  
  Prereqs: `first_order_elimination_model`

- **Dosing Interval and Accumulation Principles** `spine_medicine_preclinical_l4_dosing_interval_accumulation`  
  How dosing frequency interacts with half-life before steady-state concepts.  
  Prereqs: `drug_half_life`

#### L5 (under Elimination Rate Constant)
- **ke–t½ Relationship (0.693 Rule)** `spine_medicine_preclinical_l5_ke_half_life_equation`  
  t½ = 0.693/ke; high-yield calculation link.

- **Factors That Alter ke** `spine_medicine_preclinical_l5_factors_altering_ke`  
  Hepatic/renal function, enzyme induction/inhibition, age.

#### L5 (under Drug Half-Life)
- **Time to Steady State (4–5 Half-Lives)** `spine_medicine_preclinical_l5_time_to_steady_state`  
  Rule of thumb for accumulation and washout.

- **Half-Life in Renal and Hepatic Impairment** `spine_medicine_preclinical_l5_half_life_organ_impairment`  
  When to adjust dosing intervals clinically.

---

## 2. Enzyme Kinetics → Chemistry

**L3:** Enzyme Kinetics and Michaelis–Menten · `spine_chemistry_l3_enzyme_kinetics_michaelis_menten`  
**Domain context:** Enzyme Kinetics · max **5** · audience: undergraduate chemistry/biochemistry

### L4
- **Michaelis–Menten Equation** `spine_chemistry_l4_michaelis_menten_equation`  
  v = Vmax[S]/(Km + [S]); hyperbolic rate–substrate relationship.

- **Vmax and Km Interpretation** `spine_chemistry_l4_vmax_km_interpretation`  
  Catalytic capacity vs substrate affinity; units and meaning.  
  Prereqs: `michaelis_menten_equation`

- **Lineweaver–Burk Double-Reciprocal Plot** `spine_chemistry_l4_lineweaver_burk_plot`  
  Graphical Km and Vmax determination from 1/v vs 1/[S].  
  Prereqs: `michaelis_menten_equation`

- **Competitive Inhibition** `spine_chemistry_l4_competitive_inhibition`  
  Inhibitor competes for active site; apparent Km changes, Vmax unchanged.  
  Prereqs: `vmax_km_interpretation`

- **Noncompetitive and Uncompetitive Inhibition** `spine_chemistry_l4_noncompetitive_uncompetitive_inhibition`  
  Vmax and Km effects distinguishing inhibitor classes.  
  Prereqs: `competitive_inhibition`

- **Enzyme–Substrate Binding and Catalytic Cycle** `spine_chemistry_l4_enzyme_catalytic_cycle`  
  ES complex formation, product release, rate-limiting steps.  
  Prereqs: `michaelis_menten_equation`

#### L5 (under Competitive Inhibition)
- **Apparent Km and Inhibitor Concentration** `spine_chemistry_l5_competitive_apparent_km`  
  Km,app = Km(1 + [I]/Ki).

- **Clinical and Industrial Competitive Inhibitors** `spine_chemistry_l5_competitive_inhibitor_examples`  
  Statins, ACE inhibitors as enzyme-target examples.

#### L5 (under Lineweaver–Burk)
- **Distinguishing Inhibition Types on LB Plots** `spine_chemistry_l5_lb_plot_inhibitor_patterns`  
  Line intersections identify competitive vs noncompetitive.

---

## 3. Membrane Potential → Psychology & Neuroscience

**L3:** Membrane Potential · `spine_biology_l3_membrane_potential`  
**Domain context:** Resting Membrane Potential · max **5** · audience: neuroscience/psychology undergraduate

### L4
- **Ion Concentration Gradients Across the Membrane** `spine_psychology_neuroscience_l4_ion_concentration_gradients`  
  Na⁺, K⁺, Cl⁻ distribution establishing electrochemical potential.

- **Nernst Equilibrium Potential** `spine_psychology_neuroscience_l4_nernst_equilibrium_potential`  
  Potential at which one ion's diffusion and electrical forces balance.

- **Goldman–Hodgkin–Katz Resting Potential** `spine_psychology_neuroscience_l4_goldman_hodgkin_katz_equation`  
  Multi-ion weighted resting potential from relative permeabilities.  
  Prereqs: `nernst_equilibrium_potential`

- **Na⁺/K⁺-ATPase and the Resting State** `spine_psychology_neuroscience_l4_sodium_potassium_pump`  
  Active transport maintaining gradients consumed during signaling.  
  Prereqs: `ion_concentration_gradients`

- **Equilibrium vs Steady-State Membrane Potential** `spine_psychology_neuroscience_l4_equilibrium_vs_steady_state`  
  Why resting potential is steady-state, not true equilibrium.  
  Prereqs: `goldman_hodgkin_katz_equation`, `sodium_potassium_pump`

#### L5 (under Goldman–Hodgkin–Katz)
- **Relative Permeability and Emphasis on K⁺ at Rest** `spine_psychology_neuroscience_l5_gkh_potassium_dominance`  
  Why resting potential sits near E_K.

- **Depolarizing vs Hyperpolarizing Shifts in Baseline** `spine_psychology_neuroscience_l5_baseline_potential_shifts`  
  Permeability changes alter resting level before AP.

#### L5 (under Nernst)
- **Calculating Single-Ion Reversal Potentials** `spine_psychology_neuroscience_l5_nernst_calculation`  
  Log form and sign conventions for neurons.

---

## 4. Innate Immunity → Medicine (Preclinical)

**L3:** Innate Immunity · `spine_biology_l3_innate_immunity`  
**Domain context:** Innate Immunity and Pattern Recognition · max **5** · audience: Step 1 medical student

### L4
- **Physical and Anatomic Barriers** `spine_medicine_preclinical_l4_innate_anatomic_barriers`  
  Skin, mucosa, cilia, low pH as first-line defense.

- **Pattern-Recognition Receptors (PRRs)** `spine_medicine_preclinical_l4_pattern_recognition_receptors`  
  TLRs, NLRs, RLRs detecting PAMPs and DAMPs.

- **TLR Signaling and MyD88 Pathway** `spine_medicine_preclinical_l4_tlr_signaling_mydd88`  
  NF-κB activation and cytokine release downstream of TLR4/TLR2.  
  Prereqs: `pattern_recognition_receptors`

- **Complement System Activation** `spine_medicine_preclinical_l4_complement_activation`  
  Classical, alternative, lectin pathways; C3 convertase and opsonization.

- **Phagocytosis and Opsonization** `spine_medicine_preclinical_l4_phagocytosis_opsonization`  
  Neutrophils/macrophages; C3b and antibody-mediated uptake.  
  Prereqs: `complement_activation`

- **Inflammatory Mediator Release** `spine_medicine_preclinical_l4_inflammatory_mediators_innate`  
  Cytokines, prostaglandins, bradykinin in acute inflammation.  
  Prereqs: `tlr_signaling_mydd88`

#### L5 (under TLR Signaling)
- **LPS–TLR4–MD2 Complex (Endotoxin)** `spine_medicine_preclinical_l5_lps_tlr4_endotoxin`  
  Gram-negative sepsis mechanism; high-yield Step 1.

- **TLR Location: Cell Surface vs Endosomal** `spine_medicine_preclinical_l5_tlr_localization`  
  TLR4 surface vs TLR3/7/8/9 endosomal nucleic acid sensing.

#### L5 (under Complement)
- **C5a and C3a Anaphylatoxins** `spine_medicine_preclinical_l5_complement_anaphylatoxins`  
  Chemotaxis and mast cell degranulation.

- **MAC (C5b-9) and Cell Lysis** `spine_medicine_preclinical_l5_membrane_attack_complex`  
  Terminal complement lysis of pathogens.

---

## 5. Renal Filtration and GFR → Medicine (Preclinical)

**L3:** Renal Filtration and GFR · `spine_medicine_preclinical_l3_renal_filtration_and_gfr`  
**Domain context:** Renal Filtration and GFR · max **5** · audience: Step 1 medical student

### L4
- **Glomerular Filtration Barrier** `spine_medicine_preclinical_l4_glomerular_filtration_barrier`  
  Fenestrated endothelium, basement membrane, podocyte slit diaphragm.

- **Starling Forces Across the Glomerulus** `spine_medicine_preclinical_l4_glomerular_starling_forces`  
  GFR driven by hydrostatic vs oncotic pressure gradients.  
  Prereqs: `glomerular_filtration_barrier`

- **GFR Measurement and Estimation** `spine_medicine_preclinical_l4_gfr_measurement_estimation`  
  Inulin clearance gold standard; creatinine-based eGFR equations.  
  Prereqs: `glomerular_starling_forces`

- **Renal Blood Flow and Filtration Fraction** `spine_medicine_preclinical_l4_filtration_fraction`  
  FF = GFR/RPF; autoregulation overview.  
  Prereqs: `gfr_measurement_estimation`

- **Autoregulation of GFR (Myogenic and TGF)** `spine_medicine_preclinical_l4_gfr_autoregulation`  
  Afferent/efferent tone maintaining GFR across MAP changes.  
  Prereqs: `filtration_fraction`

#### L5 (under Starling Forces)
- **Afferent vs Efferent Arteriolar Effects on GFR** `spine_medicine_preclinical_l5_afferent_efferent_gfr`  
  Angiotensin II preferential efferent constriction.

- **Net Filtration Pressure Equation** `spine_medicine_preclinical_l5_net_filtration_pressure`  
  Components and sign conventions for Step 1.

#### L5 (under GFR Estimation)
- **Creatinine Clearance Limitations** `spine_medicine_preclinical_l5_creatinine_clearance_caveats`  
  Secretion, muscle mass, non-GFR sources of creatinine.  
  _[forward ref]_ unlocks `spine_medicine_clinical_l3_chronic_kidney_disease_staging`

~~Removed: CKD Staging by eGFR — clinical staging belongs under clinical CKD L3, not preclinical physiology.~~

---

## 6. Meningitis and Encephalitis → Medicine (Clinical)

**L3:** Meningitis and Encephalitis · `spine_medicine_clinical_l3_meningitis_and_encephalitis`  
**Domain context:** Meningitis and Encephalitis · max **5** · audience: clinical clerkship / Step 2 CK level

### L4
- **Meningitis vs Encephalitis Clinical Distinction** `spine_medicine_clinical_l4_meningitis_vs_encephalitis`  
  Meningeal signs vs altered mental status, seizures, focal deficits.

- **Lumbar Puncture and CSF Interpretation** `spine_medicine_clinical_l4_csf_interpretation`  
  Opening pressure, cell count, glucose, protein, Gram stain.  
  Prereqs: `meningitis_vs_encephalitis`

- **Bacterial Meningitis Empiric Antibiotic Therapy** `spine_medicine_clinical_l4_bacterial_meningitis_empiric_therapy`  
  Age-based regimens; dexamethasone adjunct in adults.  
  Prereqs: `csf_interpretation`

- **Viral Meningitis and HSV Encephalitis** `spine_medicine_clinical_l4_viral_cns_infection_management`  
  Supportive care vs urgent acyclovir for HSV.  
  Prereqs: `csf_interpretation`

- **Meningococcal Prophylaxis for Contacts** `spine_medicine_clinical_l4_meningococcal_prophylaxis`  
  Rifampin, ciprofloxacin, ceftriaxone post-exposure.  
  Prereqs: `bacterial_meningitis_empiric_therapy`

#### L5 (under CSF Interpretation)
- **CSF Findings: Bacterial vs Viral vs Fungal/TB** `spine_medicine_clinical_l5_csf_pattern_comparison`  
  High-yield table patterns for boards.

- **Contraindications to Lumbar Puncture** `spine_medicine_clinical_l5_lp_contraindications`  
  Increased ICP, coagulopathy, local infection.

#### L5 (under Empiric Therapy)
- **Neonatal and Elderly Meningitis Regimens** `spine_medicine_clinical_l5_age_specific_meningitis_antibiotics`  
  Listeria coverage in extremes of age.

---

## 7. Anxiety Disorders → Medicine (Clinical)

**L3:** Anxiety Disorders · `spine_psychology_neuroscience_l3_anxiety_disorders`  
**Domain context:** Anxiety Disorders (clinical management) · max **5** · audience: clinical psychiatry / Step 2

### L4
- **Generalized Anxiety Disorder Diagnosis** `spine_medicine_clinical_l4_generalized_anxiety_disorder`  
  Excessive worry ≥6 months with associated somatic/cognitive symptoms.

- **Panic Disorder and Agoraphobia** `spine_medicine_clinical_l4_panic_disorder_agoraphobia`  
  Unexpected panic attacks and situational avoidance patterns.  
  Prereqs: _(none — parallel diagnostic category to GAD)_

- **Specific Phobia and Social Anxiety Disorder** `spine_medicine_clinical_l4_phobia_social_anxiety`  
  Cue-triggered fear vs performance/social scrutiny contexts.

- **First-Line Pharmacotherapy for Anxiety** `spine_medicine_clinical_l4_anxiety_first_line_pharmacotherapy`  
  SSRIs/SNRIs; buspirone; short-term benzodiazepine cautions.  
  Prereqs: `generalized_anxiety_disorder`, `panic_disorder_agoraphobia`

- **Psychotherapy for Anxiety (CBT and Exposure)** `spine_medicine_clinical_l4_anxiety_cbt_exposure_therapy`  
  Cognitive restructuring and graded exposure protocols.  
  Prereqs: _(none — first-line or adjunct for all anxiety disorders)_

#### L5 (under First-Line Pharmacotherapy)
- **SSRI Onset and Partial Response Management** `spine_medicine_clinical_l5_ssri_anxiety_titration`  
  Lag to effect; dose optimization and augmentation.

- **Benzodiazepine Risks and Dependence** `spine_medicine_clinical_l5_benzodiazepine_risks_anxiety`  
  Fall risk, dependence, avoid monotherapy long-term.

#### L5 (under Panic Disorder)
- **Acute Panic Attack Management** `spine_medicine_clinical_l5_acute_panic_management`  
  Reassurance, breathing, when to use short-acting agents.

---

## 8. Derivatives → Mathematics

**L3:** Derivatives and Differentiation Rules · `spine_mathematics_l3_derivatives`  
**Domain context:** Derivatives · max **4** · audience: undergraduate calculus · **no L5**

### L4
- **Derivative as Instantaneous Rate of Change** `spine_mathematics_l4_derivative_rate_of_change`  
  Limit definition of f′(x) as slope of tangent line.

- **Power, Sum, and Constant Multiple Rules** `spine_mathematics_l4_basic_differentiation_rules`  
  Polynomial differentiation shortcuts.  
  Prereqs: `derivative_rate_of_change`

- **Product and Quotient Rules** `spine_mathematics_l4_product_quotient_rules`  
  Differentiating products and ratios of functions.  
  Prereqs: `basic_differentiation_rules`

- **Chain Rule** `spine_mathematics_l4_chain_rule`  
  Composition differentiation; inner and outer functions.  
  Prereqs: `basic_differentiation_rules`

- **Derivatives of Exponential and Logarithmic Functions** `spine_mathematics_l4_exp_log_derivatives`  
  d/dx eˣ, ln x; foundation for growth/decay models.  
  Prereqs: `chain_rule`

- **Implicit Differentiation** `spine_mathematics_l4_implicit_differentiation`  
  Finding dy/dx when y is not isolated.  
  Prereqs: `chain_rule`

---

## 9. Nucleic Acid Structure → Chemistry

**L3:** Nucleic Acid Structure · `spine_chemistry_l3_nucleic_acid_structure`  
**Domain context:** Nucleic Acid Structure · max **5** · audience: undergraduate biochemistry

### L4
- **Nucleotide Components and Linkage** `spine_chemistry_l4_nucleotide_structure`  
  Base, sugar (ribose/deoxyribose), phosphate; 3′–5′ phosphodiester bonds.

- **DNA Double Helix and Base Pairing** `spine_chemistry_l4_dna_double_helix_base_pairing`  
  Antiparallel strands; A–T, G–C hydrogen bonding.  
  Prereqs: `nucleotide_structure`

- **RNA Structure and Single-Stranded Conformation** `spine_chemistry_l4_rna_structure`  
  2′-OH, uracil, hairpins and base pairing in RNA.  
  Prereqs: `nucleotide_structure`

- **DNA Melting Temperature and Stability** `spine_chemistry_l4_dna_melting_temperature`  
  GC content and Tm; relevance to hybridization.  
  Prereqs: `dna_double_helix_base_pairing`

- **Major and Minor Grooves** `spine_chemistry_l4_dna_grooves`  
  Protein–DNA interaction surfaces.  
  Prereqs: `dna_double_helix_base_pairing`

#### L5 (under Base Pairing)
- **Mismatch Effects on Helix Stability** `spine_chemistry_l5_base_mismatch_stability`  
  Bulges, wobble pairs (G–U), mutation relevance.

~~Removed: Watson–Crick vs Hoogsteen Pairing — out of scope for undergraduate biochemistry.~~

#### L5 (under Melting Temperature)
- **Factors Affecting Hybridization Stringency** `spine_chemistry_l5_hybridization_stringency`  
  Salt, formamide, PCR annealing temperature.

---

## 10. Action Potential → Medicine (Preclinical)

**L3:** Action Potential · `spine_biology_l3_action_potential`  
**Domain context:** Cardiac & Neural Action Potentials · max **5** · audience: Step 1 medical student

### L4
- **Threshold and All-or-None Response** `spine_medicine_preclinical_l4_action_potential_threshold`  
  Subthreshold EPSP/IPSP summation vs AP firing.

- **Voltage-Gated Na⁺ and K⁺ Channel Sequence** `spine_medicine_preclinical_l4_voltage_gated_na_k_channels`  
  Depolarization, inactivation, repolarization phases.  
  Prereqs: `action_potential_threshold`

- **Neuronal Action Potential Phases** `spine_medicine_preclinical_l4_neuronal_ap_phases`  
  Overshoot, relative/absolute refractory periods.  
  Prereqs: `voltage_gated_na_k_channels`

- **Cardiac Action Potential Overview (Non-Pacemaker)** `spine_medicine_preclinical_l4_cardiac_ap_ventricular`  
  Plateau phase contrast only — comparative, not detailed phase 0–4.  
  Prereqs: `voltage_gated_na_k_channels`  
  _[forward ref]_ unlocks `cardiac_membrane_potential` L3 and `antiarrhythmic_drug_classes` L3

- **Local Anesthetic Mechanism (Na⁺ Channel Blockade)** `spine_medicine_preclinical_l4_local_anesthetic_na_blockade`  
  Use-dependent block of voltage-gated Na⁺ channels.  
  Prereqs: `neuronal_ap_phases`

#### L5 (under Neuronal AP Phases)
- **Absolute vs Relative Refractory Period** `spine_medicine_preclinical_l5_refractory_periods`  
  Inactivation gate logic; limits maximal firing frequency.

- **Saltatory Conduction in Myelinated Axons** `spine_medicine_preclinical_l5_saltatory_conduction`  
  Node of Ranvier propagation efficiency.

~~Removed: Phase 2 Plateau and Antiarrhythmic Targets L5 — forward ref to `antiarrhythmic_drug_classes` L3 instead.~~

---

## Summary for Reviewer

| # | L3 parent | Domain context | L4 count | L5 count | Notes |
|---|-----------|----------------|----------|----------|-------|
| 1 | Exponential Decay | medicine_preclinical | 6 | 4 | Shared with chemistry kinetics |
| 2 | Enzyme Kinetics | chemistry | 6 | 3 | |
| 3 | Membrane Potential | psychology_neuroscience | 5 | 4 | Shared anchor `spine_biology_l3_membrane_potential` |
| 4 | Innate Immunity | medicine_preclinical | 6 | 4 | Shared anchor biology L3 |
| 5 | Renal Filtration/GFR | medicine_preclinical | 5 | 4 | |
| 6 | Meningitis/Encephalitis | medicine_clinical | 5 | 4 | |
| 7 | Anxiety Disorders | medicine_clinical | 5 | 4 | Psych-owned L3, clinical context |
| 8 | Derivatives | mathematics | 6 | 0 | max=4, no L5 |
| 9 | Nucleic Acid Structure | chemistry | 5 | 4 | Biology context stops at L3 |
| 10 | Action Potential | medicine_preclinical | 5 | 4 | Watch overlap with cardiac membrane L3 |

**Total sample:** 10 L3 expansions · **55 L4** · **35 L5** · **90 child concepts**

### Questions for your review
1. **Granularity** — Are L4 nodes card-sized (~5–15 cards), or still too broad/narrow?
2. **L5 depth** — Is Step 1/clinical L5 detail appropriate, or defer to editorial high-yield pass?
3. **Overlap** — Action potential vs cardiac membrane potential (#10) — split correctly?
4. **Shared nodes** — Should L4s like `first_order_elimination_model` get chemistry domain contexts immediately?
5. **IDs** — Approve naming pattern before batch generation?

_Regenerate this outline after spine changes with `npm run build:spine-review`. Full schema JSON can be exported from approved samples on request._
