# Socrates L4/L5 — Review Outline (Universal Model)

**49 anchors** · 2026-06-26 · status: `draft`

**Totals:** 336 L4 · 81 L5 · 417 child concepts

Format: **title**, spine id, level, member domain contexts, prereqs, flags.

---

## 1. Action Potential

**L3:** `spine_biology_l3_action_potential`

### L4
- **Action Potential Phases** `spine_biology_l4_action_potential_phases`
  Depolarization follows rapid Na⁺ entry; repolarization results from Na⁺ inactivation and K⁺ efflux.
  Contexts: biology, medicine_preclinical, psychology_neuroscience
  Prereqs: `voltage_gated_ion_channels`
  _[shared]_ Also used in psychology_neuroscience (neural signaling) and medicine_preclinical (cardiac/neural electrophysiology).
  _[reviewer note]_ MERGED from 3 contexts: biology:spine_biology_l4_action_potential_phases, psychology_neuroscience:spine_psychology_neuroscience_l4_neuronal_ap_phases, medicine_preclinical:spine_medicine_preclinical_l4_neuronal_ap_phases

#### L5 (under Action Potential Phases)
- **Saltatory Conduction in Myelinated Axons** `spine_biology_l5_saltatory_conduction` · contexts: medicine_preclinical, psychology_neuroscience
  Saltatory conduction increases conduction velocity and metabolic efficiency.
  _[reviewer note]_ MERGED from 2 contexts: psychology_neuroscience:spine_psychology_neuroscience_l5_saltatory_conduction, medicine_preclinical:spine_medicine_preclinical_l5_saltatory_conduction

- **Threshold and All-or-None Response** `spine_biology_l4_action_potential_threshold`
  Excitable cells integrate subthreshold inputs until threshold is reached, then fire an all-or-none action potential that propagates without decrement.
  Contexts: biology, medicine_preclinical, psychology_neuroscience
  _[shared]_ Also used in psychology_neuroscience (neural signaling) and medicine_preclinical (cardiac/neural electrophysiology).
  _[reviewer note]_ MERGED from 3 contexts: biology:spine_biology_l4_action_potential_threshold, psychology_neuroscience:spine_psychology_neuroscience_l4_action_potential_threshold, medicine_preclinical:spine_medicine_preclinical_l4_action_potential_threshold

- **Axonal Propagation and Conduction** `spine_biology_l4_axonal_propagation`
  Local current loops depolarize adjacent membrane; myelin reduces capacitance and metabolic load.
  Contexts: psychology_neuroscience
  Prereqs: `voltage_gated_ion_channels`
  _[shared]_ Also used in psychology_neuroscience (neural signaling) and medicine_preclinical (cardiac/neural electrophysiology).

- **Cardiac Action Potential Overview (Non-Pacemaker)** `spine_biology_l4_cardiac_ap_ventricular`
  Cardiac myocytes have a longer action potential due to L-type calcium channel-mediated plateau.
  Contexts: medicine_preclinical
  Prereqs: `voltage_gated_ion_channels`
  _[reviewer note]_ Do not add L5 antiarrhythmic detail here — forward reference to antiarrhythmic_drug_classes L3.

- **Local Anesthetic Mechanism (Na⁺ Channel Blockade)** `spine_biology_l4_local_anesthetic_na_blockade`
  Local anesthetics bind sodium channels from the intracellular side preferentially in open or inactivated states, blocking propagation in high-frequency firing fibers first.
  Contexts: medicine_preclinical
  Prereqs: `action_potential_phases`

- **Absolute and Relative Refractory Periods** `spine_biology_l4_refractory_periods`
  The absolute refractory period enforces unidirectional propagation.
  Contexts: biology, medicine_preclinical, psychology_neuroscience
  Prereqs: `action_potential_phases`
  _[shared]_ Also used in psychology_neuroscience (neural signaling) and medicine_preclinical (cardiac/neural electrophysiology).
  _[reviewer note]_ MERGED from 3 contexts: biology:spine_biology_l4_refractory_periods, psychology_neuroscience:spine_psychology_neuroscience_l5_refractory_periods, medicine_preclinical:spine_medicine_preclinical_l5_refractory_periods | DEPTH RECONCILED: members authored at mixed L4/L5; promoted to L4 so shallow contexts can include it. Confirm L4 vs L5.

- **Continuous and Saltatory Conduction** `spine_biology_l4_signal_propagation`
  Myelin increases conduction velocity by insulating internodal regions and concentrating current at nodes.
  Contexts: biology
  Prereqs: `action_potential_phases`

- **Voltage-Gated Na⁺ and K⁺ Channel Sequence** `spine_biology_l4_voltage_gated_ion_channels`
  Sodium influx drives rapid depolarization; sodium inactivation and potassium efflux restore negative membrane potential and define action potential shape.
  Contexts: biology, medicine_preclinical, psychology_neuroscience
  Prereqs: `action_potential_threshold`
  _[shared]_ Also used in psychology_neuroscience (neural signaling) and medicine_preclinical (cardiac/neural electrophysiology).
  _[reviewer note]_ MERGED from 3 contexts: biology:spine_biology_l4_voltage_gated_ion_channels, psychology_neuroscience:spine_psychology_neuroscience_l4_voltage_gated_na_k_channels, medicine_preclinical:spine_medicine_preclinical_l4_voltage_gated_na_k_channels

---

## 2. Adaptive Immunity Overview

**L3:** `spine_biology_l3_adaptive_immunity_overview`

### L4
- **Clonal Selection and Lymphocyte Expansion** `spine_biology_l4_clonal_selection`
  Clonal selection explains antigen specificity and memory in adaptive immunity.
  Contexts: biology

- **Clonal Selection and Affinity Maturation** `spine_biology_l4_clonal_selection_principle`
  Clonal selection explains how a vast receptor repertoire yields a focused response.
  Contexts: medicine_preclinical

#### L5 (under Clonal Selection and Affinity Maturation)
- **Germinal Center Affinity Maturation** `spine_biology_l5_germinal_center_affinity_maturation` · contexts: medicine_preclinical
  B cells compete for antigen and T follicular helper signals in germinal centers.

- **Humoral and Cell-Mediated Immunity** `spine_biology_l4_humoral_vs_cell_mediated`
  Humoral immunity targets extracellular pathogens via antibody neutralization and opsonization.
  Contexts: biology, medicine_preclinical
  Prereqs: `clonal_selection_principle`
  _[reviewer note]_ MERGED from 2 contexts: biology:spine_biology_l4_humoral_vs_cell_mediated, medicine_preclinical:spine_medicine_preclinical_l4_humoral_vs_cell_mediated_immunity

- **Immunologic Memory Mechanisms** `spine_biology_l4_immunologic_memory_mechanisms`
  Memory lymphocytes circulate and reside in lymphoid and peripheral tissues.
  Contexts: medicine_preclinical
  Prereqs: `primary_secondary_response`, `lymphocyte_activation`

#### L5 (under Immunologic Memory Mechanisms)
- **Central vs Effector Memory T Cells** `spine_biology_l5_memory_t_cell_subsets` · contexts: medicine_preclinical
  Central memory T cells (CCR7+) circulate through lymph nodes for rapid reactivation.

- **Immunological Memory Cells** `spine_biology_l4_immunological_memory`
  Memory cells provide durable protection without continuous antigen exposure.
  Contexts: biology
  Prereqs: `clonal_selection`

- **Lymphocyte Activation Requirements** `spine_biology_l4_lymphocyte_activation`
  T cells require MHC-presented peptide antigen and co-stimulation to avoid anergy.
  Contexts: biology, medicine_preclinical
  Prereqs: `humoral_vs_cell_mediated`
  _[reviewer note]_ MERGED from 2 contexts: biology:spine_biology_l4_lymphocyte_activation, medicine_preclinical:spine_medicine_preclinical_l4_lymphocyte_activation_requirements

- **Primary vs Secondary Immune Response** `spine_biology_l4_primary_secondary_response`
  Primary responses generate effector cells and memory over days to weeks.
  Contexts: biology, medicine_preclinical
  Prereqs: `clonal_selection`, `clonal_selection_principle`
  _[reviewer note]_ MERGED from 2 contexts: biology:spine_biology_l4_primary_secondary_response, medicine_preclinical:spine_medicine_preclinical_l4_primary_secondary_immune_response

#### L5 (under Primary vs Secondary Immune Response)
- **Secondary Response IgM-to-IgG Switch** `spine_biology_l5_secondary_response_igm_igg_switch` · contexts: medicine_preclinical
  Memory B cells rapidly differentiate into plasma cells upon re-exposure.

---

## 3. Autoimmunity

**L3:** `spine_biology_l3_autoimmunity`

### L4
- **Autoantibody Effector Mechanisms** `spine_biology_l4_autoantibody_effector_mechanisms`
  Autoantibodies cause disease through complement-mediated lysis, opsonization, immune complex inflammation, or functional receptor modulation.
  Contexts: medicine_preclinical
  Prereqs: `molecular_mimicry`, `epitope_spreading`

#### L5 (under Autoantibody Effector Mechanisms)
- **SLE and Anti-dsDNA Antibodies** `spine_biology_l5_sle_anti_dsdna` · contexts: medicine_preclinical
  Anti-dsDNA correlates with disease activity and lupus nephritis.

- **Representative Autoimmune Diseases** `spine_biology_l4_autoimmune_disease_examples`
  Autoimmune diseases reflect which self antigens are targeted.
  Contexts: biology
  Prereqs: `molecular_mimicry`

- **Central and Peripheral Tolerance** `spine_biology_l4_central_peripheral_tolerance`
  Central tolerance removes strongly autoreactive clones in thymus and bone marrow.
  Contexts: medicine_preclinical

#### L5 (under Central and Peripheral Tolerance)
- **Type 1 Diabetes Autoimmunity** `spine_biology_l5_type_1_diabetes_autoimmunity` · contexts: medicine_preclinical
  Insulitis reflects autoreactive T-cell attack on islets.

- **Central Tolerance** `spine_biology_l4_central_tolerance`
  Negative selection in the thymus eliminates most autoreactive T cells.
  Contexts: biology
  Prereqs: `self_tolerance`

- **Epitope Spreading** `spine_biology_l4_epitope_spreading`
  Initial tissue damage releases cryptic self-antigens.
  Contexts: medicine_preclinical
  Prereqs: `central_peripheral_tolerance`

- **HLA and Genetic Susceptibility** `spine_biology_l4_hla_genetic_susceptibility`
  HLA-DR4 links to RA; HLA-B27 to spondyloarthropathies.
  Contexts: medicine_preclinical
  Prereqs: `autoantibody_effector_mechanisms`

#### L5 (under HLA and Genetic Susceptibility)
- **Rheumatoid Arthritis Pathogenesis** `spine_biology_l5_rheumatoid_arthritis_mechanism` · contexts: medicine_preclinical
  Anti-CCP antibodies are highly specific for RA.

- **Molecular Mimicry and Epitope Spreading** `spine_biology_l4_molecular_mimicry`
  Molecular mimicry links infection to autoimmunity when cross-reactive antibodies attack host tissues.
  Contexts: biology, medicine_preclinical
  Prereqs: `central_tolerance`, `peripheral_tolerance`
  _[reviewer note]_ MERGED from 2 contexts: biology:spine_biology_l4_molecular_mimicry, medicine_preclinical:spine_medicine_preclinical_l4_molecular_mimicry

- **Peripheral Tolerance** `spine_biology_l4_peripheral_tolerance`
  Peripheral tolerance provides a second line of defense.
  Contexts: biology
  Prereqs: `self_tolerance`

- **Self-Tolerance Overview** `spine_biology_l4_self_tolerance`
  Self-tolerance prevents autoimmunity under normal conditions.
  Contexts: biology

---

## 4. Homeostasis and Feedback Control

**L3:** `spine_biology_l3_homeostasis_and_feedback`

### L4
- **Homeostatic Disruption in Disease** `spine_biology_l4_homeostatic_disruption_disease`
  Disease can reflect sensor failure, effector failure, or inappropriate gain in feedback loops.
  Contexts: medicine_preclinical
  Prereqs: `positive_feedback_loops`, `set_point_compensation`

- **Negative Feedback Loops** `spine_biology_l4_negative_feedback_loops`
  Negative feedback stabilizes temperature, blood pressure, and hormone levels.
  Contexts: medicine_preclinical

- **Positive Feedback Loops** `spine_biology_l4_positive_feedback_loops`
  Positive feedback drives events requiring rapid completion such as childbirth (oxytocin) and blood clotting cascade amplification.
  Contexts: medicine_preclinical

- **Set Point and Compensatory Mechanisms** `spine_biology_l4_set_point_compensation`
  Compensation may fully correct (respiratory alkalosis compensation) or partially restore (cardiac remodeling in heart failure).
  Contexts: medicine_preclinical
  Prereqs: `negative_feedback_loops`

---

## 5. Hypersensitivity Reactions

**L3:** `spine_biology_l3_hypersensitivity_reactions`

### L4
- **Gell and Coombs Classification Overview** `spine_biology_l4_hypersensitivity_classification_overview`
  Type classification predicts timing, mediators, and clinical examples.
  Contexts: medicine_preclinical

- **Type I IgE-Mediated Hypersensitivity** `spine_biology_l4_hypersensitivity_type_i`
  Type I reactions include hay fever, asthma, and anaphylaxis.
  Contexts: biology, medicine_preclinical
  _[reviewer note]_ MERGED from 2 contexts: biology:spine_biology_l4_hypersensitivity_type_i, medicine_preclinical:spine_medicine_preclinical_l4_type_i_ige_immediate

#### L5 (under Type I IgE-Mediated Hypersensitivity)
- **Anaphylaxis Mediators and Treatment** `spine_biology_l5_anaphylaxis_mediators` · contexts: medicine_preclinical
  Anaphylaxis requires immediate IM epinephrine.

- **Type II Antibody-Mediated Cytotoxicity** `spine_biology_l4_hypersensitivity_type_ii`
  Type II reactions destroy host cells bearing targeted antigens.
  Contexts: biology
  Prereqs: `hypersensitivity_type_i`

- **Type III Immune Complex Disease** `spine_biology_l4_hypersensitivity_type_iii`
  Type III reactions cause serum sickness and Arthus reactions.
  Contexts: biology
  Prereqs: `hypersensitivity_type_ii`

- **Type IV T Cell-Mediated Hypersensitivity** `spine_biology_l4_hypersensitivity_type_iv`
  Type IV reactions include contact dermatitis and tuberculin skin tests.
  Contexts: biology
  Prereqs: `hypersensitivity_type_iii`

- **Type II (Cytotoxic Antibody) Hypersensitivity** `spine_biology_l4_type_ii_cytotoxic_antibody`
  IgG or IgM binds fixed tissue antigens.
  Contexts: medicine_preclinical

#### L5 (under Type II (Cytotoxic Antibody) Hypersensitivity)
- **Autoimmune Hemolytic Anemia (Type II)** `spine_biology_l5_autoimmune_hemolytic_anemia` · contexts: medicine_preclinical
  Warm AIHA involves IgG against Rh antigens with splenic sequestration.

- **Type III (Immune Complex) Hypersensitivity** `spine_biology_l4_type_iii_immune_complex`
  Complex size and solubility determine deposition sites.
  Contexts: medicine_preclinical

#### L5 (under Type III (Immune Complex) Hypersensitivity)
- **Serum Sickness Mechanism** `spine_biology_l5_serum_sickness_mechanism` · contexts: medicine_preclinical
  Serum sickness follows antitoxin or drug-protein conjugate administration.

- **Type IV (Delayed T-Cell) Hypersensitivity** `spine_biology_l4_type_iv_delayed_tcell`
  Delayed-type hypersensitivity involves macrophage activation and cytotoxic T-cell killing.
  Contexts: medicine_preclinical

#### L5 (under Type IV (Delayed T-Cell) Hypersensitivity)
- **PPD and TB Skin Test (Type IV)** `spine_biology_l5_ppd_tb_skin_test` · contexts: medicine_preclinical
  PPD tests cell-mediated immunity, not antibody.

---

## 6. Innate Immunity

**L3:** `spine_biology_l3_innate_immunity`

### L4
- **Complement System Activation** `spine_biology_l4_complement_activation`
  Complement amplifies innate clearance via opsonization, anaphylatoxin release, and direct lysis.
  Contexts: medicine_preclinical

#### L5 (under Complement System Activation)
- **C5a and C3a Anaphylatoxins** `spine_biology_l5_complement_anaphylatoxins` · contexts: medicine_preclinical
  Anaphylatoxins link complement activation to rapid inflammatory cell influx.
- **MAC (C5b-9) and Cell Lysis** `spine_biology_l5_membrane_attack_complex` · contexts: medicine_preclinical
  MAC provides direct bactericidal activity especially against Neisseria.

- **Complement System** `spine_biology_l4_complement_system`
  Complement bridges innate recognition and effector functions.
  Contexts: biology
  Prereqs: `pattern_recognition_receptors`

- **Inflammatory Mediator Release** `spine_biology_l4_inflammatory_mediators_innate`
  Innate activation produces a coordinated mediator profile causing cardinal signs of inflammation.
  Contexts: medicine_preclinical
  Prereqs: `tlr_signaling_mydd88`

- **Inflammatory Response** `spine_biology_l4_inflammatory_response`
  Inflammation confines infection and initiates repair.
  Contexts: biology
  Prereqs: `pattern_recognition_receptors`

- **Pattern-Recognition Receptors** `spine_biology_l4_pattern_recognition_receptors`
  TLRs, NLRs, and RLRs distinguish self from non-self at the molecular level.
  Contexts: biology, medicine_preclinical
  Prereqs: `physical_barriers`
  _[reviewer note]_ MERGED from 2 contexts: biology:spine_biology_l4_pattern_recognition_receptors, medicine_preclinical:spine_medicine_preclinical_l4_pattern_recognition_receptors

- **Phagocytosis and Opsonization** `spine_biology_l4_phagocytosis`
  Phagocytes internalize microbes into phagolysosomes for enzymatic killing.
  Contexts: biology, medicine_preclinical
  Prereqs: `pattern_recognition_receptors`, `complement_system`, `complement_activation`
  _[reviewer note]_ MERGED from 2 contexts: biology:spine_biology_l4_phagocytosis, medicine_preclinical:spine_medicine_preclinical_l4_phagocytosis_opsonization

- **Physical and Anatomic Barriers** `spine_biology_l4_physical_barriers`
  Physical barriers exclude most microbes before immune recognition occurs.
  Contexts: biology, medicine_preclinical
  _[reviewer note]_ MERGED from 2 contexts: biology:spine_biology_l4_physical_barriers, medicine_preclinical:spine_medicine_preclinical_l4_innate_anatomic_barriers

- **TLR Signaling and MyD88 Pathway** `spine_biology_l4_tlr_signaling_mydd88`
  MyD88-dependent TLR signaling drives rapid cytokine release in bacterial infection.
  Contexts: medicine_preclinical
  Prereqs: `pattern_recognition_receptors`

#### L5 (under TLR Signaling and MyD88 Pathway)
- **LPS–TLR4–MD2 Complex (Endotoxin)** `spine_biology_l5_lps_tlr4_endotoxin` · contexts: medicine_preclinical
  Endotoxin is the canonical TLR4 ligand driving septic shock physiology.
- **TLR Location: Cell Surface vs Endosomal** `spine_biology_l5_tlr_localization` · contexts: medicine_preclinical
  TLR4 and TLR5 localize to the plasma membrane, whereas TLR3, TLR7, TLR8, and TLR9 signal from endosomes after ligand internalization.

---

## 7. Membrane Potential

**L3:** `spine_biology_l3_membrane_potential`

### L4
- **Electrochemical Driving Force on Ions** `spine_biology_l4_electrochemical_driving_force`
  Driving force = Vm − Eion.
  Contexts: medicine_preclinical
  Prereqs: `resting_membrane_potential`

- **Electrochemical Gradient** `spine_biology_l4_electrochemical_gradient`
  Ions move down their electrochemical gradients through open channels.
  Contexts: biology
  Prereqs: `sodium_potassium_pump`

- **Equilibrium vs Steady-State Membrane Potential** `spine_biology_l4_equilibrium_vs_steady_state`
  True equilibrium would require zero net flux for all ions simultaneously, which does not hold in living cells.
  Contexts: psychology_neuroscience
  Prereqs: `goldman_hodgkin_katz_equation`, `sodium_potassium_pump`
  _[shared]_ Merged resting_membrane_potential (psych), cell_membrane_resting_potential (medicine_preclinical neuronal), and general excitable-tissue potential. Cardiac membrane potential remains a separate med node (B2).

- **Goldman–Hodgkin–Katz Resting Potential** `spine_biology_l4_goldman_hodgkin_katz_equation`
  Resting potential sits near E_K because potassium permeability dominates at rest.
  Contexts: psychology_neuroscience
  Prereqs: `nernst_equilibrium_potential`
  _[shared]_ Merged resting_membrane_potential (psych), cell_membrane_resting_potential (medicine_preclinical neuronal), and general excitable-tissue potential. Cardiac membrane potential remains a separate med node (B2).

#### L5 (under Goldman–Hodgkin–Katz Resting Potential)
- **Depolarizing vs Hyperpolarizing Shifts in Baseline** `spine_biology_l5_baseline_potential_shifts` · contexts: psychology_neuroscience
  Clinical hyperkalemia narrows excitability margins by depolarizing rest.
- **Relative Permeability and Emphasis on K⁺ at Rest** `spine_biology_l5_gkh_potassium_dominance` · contexts: psychology_neuroscience
  Increasing sodium permeability depolarizes resting baseline toward threshold.

- **Ion Concentration Gradients** `spine_biology_l4_ion_concentration_gradients`
  High intracellular K⁺ and low intracellular Na⁺ create chemical gradients that drive ion movement.
  Contexts: biology, medicine_preclinical, psychology_neuroscience
  _[shared]_ Merged resting_membrane_potential (psych), cell_membrane_resting_potential (medicine_preclinical neuronal), and general excitable-tissue potential. Cardiac membrane potential remains a separate med node (B2).
  _[reviewer note]_ MERGED from 3 contexts: biology:spine_biology_l4_ion_concentration_gradients, medicine_preclinical:spine_medicine_preclinical_l4_ion_concentration_gradients, psychology_neuroscience:spine_psychology_neuroscience_l4_ion_concentration_gradients

- **Na+/K+-ATPase and Resting Potential Maintenance** `spine_biology_l4_na_k_atpase_role`
  The Na+/K+ pump is electrogenic and consumes significant metabolic energy in neurons.
  Contexts: medicine_preclinical
  Prereqs: `ion_concentration_gradients`

- **Nernst Equilibrium Potential** `spine_biology_l4_nernst_equilibrium_potential`
  Each permeable ion contributes an equilibrium potential.
  Contexts: medicine_preclinical, psychology_neuroscience
  Prereqs: `ion_concentration_gradients`
  _[shared]_ Merged resting_membrane_potential (psych), cell_membrane_resting_potential (medicine_preclinical neuronal), and general excitable-tissue potential. Cardiac membrane potential remains a separate med node (B2).
  _[reviewer note]_ MERGED from 2 contexts: medicine_preclinical:spine_medicine_preclinical_l4_nernst_equilibrium_potential, psychology_neuroscience:spine_psychology_neuroscience_l4_nernst_equilibrium_potential

#### L5 (under Nernst Equilibrium Potential)
- **Goldman-Hodgkin-Katz Voltage Equation** `spine_biology_l5_goldman_hodgkin_katz` · contexts: medicine_preclinical
  GHK equation shows resting potential lies between individual equilibrium potentials, closer to the ion with highest relative permeability.
- **Calculating Single-Ion Reversal Potentials** `spine_biology_l5_nernst_calculation` · contexts: psychology_neuroscience
  Practice with E_K and E_Na builds intuition for synaptic driving forces.

- **Resting Membrane Potential** `spine_biology_l4_resting_membrane_potential`
  Resting potential represents a steady state, not equilibrium.
  Contexts: biology, medicine_preclinical
  Prereqs: `selective_permeability`, `sodium_potassium_pump`, `nernst_equilibrium_potential`, `na_k_atpase_role`
  _[reviewer note]_ MERGED from 2 contexts: biology:spine_biology_l4_resting_membrane_potential, medicine_preclinical:spine_medicine_preclinical_l4_resting_membrane_potential

#### L5 (under Resting Membrane Potential)
- **Hypokalemia and Membrane Hyperpolarization** `spine_biology_l5_hypokalemia_membrane_effects` · contexts: medicine_preclinical
  Low [K+]o increases K+ equilibrium potential magnitude, making cells harder to depolarize to threshold.

- **Selective Membrane Permeability** `spine_biology_l4_selective_permeability`
  Membrane permeability determines which ions contribute most to membrane voltage.
  Contexts: biology
  Prereqs: `ion_concentration_gradients`

- **Na⁺/K⁺-ATPase Pump** `spine_biology_l4_sodium_potassium_pump`
  The Na⁺/K⁺-ATPase is essential for long-term gradient maintenance.
  Contexts: biology, psychology_neuroscience
  Prereqs: `ion_concentration_gradients`
  _[shared]_ Merged resting_membrane_potential (psych), cell_membrane_resting_potential (medicine_preclinical neuronal), and general excitable-tissue potential. Cardiac membrane potential remains a separate med node (B2).
  _[reviewer note]_ MERGED from 2 contexts: biology:spine_biology_l4_sodium_potassium_pump, psychology_neuroscience:spine_psychology_neuroscience_l4_sodium_potassium_pump

---

## 8. Neurotransmitters and Receptors

**L3:** `spine_biology_l3_neurotransmitters_and_receptors`

### L4
- **Catecholamine and Dopamine Signaling** `spine_biology_l4_catecholamine_dopamine_signaling`
  Catecholamines act through GPCRs.
  Contexts: medicine_preclinical
  Prereqs: `ligand_gated_vs_gpcr_receptors`

#### L5 (under Catecholamine and Dopamine Signaling)
- **Parkinson Disease and Dopamine Deficiency** `spine_biology_l5_parkinson_dopamine_deficiency` · contexts: medicine_preclinical
  L-DOPA crosses the blood-brain barrier and replenishes dopamine.

- **Cholinergic Signaling** `spine_biology_l4_cholinergic_signaling`
  ACh is synthesized from choline and acetyl-CoA.
  Contexts: medicine_preclinical
  Prereqs: `ligand_gated_vs_gpcr_receptors`

#### L5 (under Cholinergic Signaling)
- **Nicotinic ACh at the Neuromuscular Junction** `spine_biology_l5_neuromuscular_nicotinic_ach` · contexts: medicine_preclinical
  NMJ nicotinic receptors are ligand-gated Na+/K+ channels.

- **Excitatory vs Inhibitory Neurotransmitters** `spine_biology_l4_excitatory_inhibitory_neurotransmitters`
  Balance of EPSPs and IPSPs determines neuronal output.
  Contexts: medicine_preclinical
  Prereqs: `neurotransmitter_synthesis_release`

- **Ionotropic Receptors** `spine_biology_l4_ionotropic_receptors`
  Ionotropic receptors mediate fast synaptic transmission.
  Contexts: biology
  Prereqs: `neurotransmitter_synthesis_release`

- **Ligand-Gated Ion Channels vs Metabotropic Receptors** `spine_biology_l4_ligand_gated_vs_gpcr_receptors`
  Nicotinic ACh and GABA-A are ionotropic.
  Contexts: medicine_preclinical
  Prereqs: `excitatory_inhibitory_neurotransmitters`

#### L5 (under Ligand-Gated Ion Channels vs Metabotropic Receptors)
- **GABA-A Receptor and Benzodiazepine Site** `spine_biology_l5_gaba_a_benzodiazepine_site` · contexts: medicine_preclinical
  Benzodiazepines increase frequency of Cl− channel opening.

- **Major Neurotransmitter Systems** `spine_biology_l4_major_neurotransmitter_systems`
  Each neurotransmitter system has characteristic anatomical distribution and behavioral correlates.
  Contexts: biology, psychology_neuroscience
  Prereqs: `metabotropic_receptors`, `receptor_types_ionotropic_metabotropic`
  _[shared]_ Merged neurotransmitters_and_receptors (psychology_neuroscience and medicine_preclinical).
  _[reviewer note]_ MERGED from 2 contexts: biology:spine_biology_l4_major_neurotransmitter_systems, psychology_neuroscience:spine_psychology_neuroscience_l4_major_neurotransmitter_systems

#### L5 (under Major Neurotransmitter Systems)
- **Mesolimbic and Nigrostriatal Dopamine Pathways** `spine_biology_l5_dopamine_pathways_overview` · contexts: psychology_neuroscience
  Hyperdopaminergic mesolimbic signaling is implicated in positive psychotic symptoms.

- **Metabotropic Receptors** `spine_biology_l4_metabotropic_receptors`
  Metabotropic receptors amplify signals through second messengers.
  Contexts: biology
  Prereqs: `neurotransmitter_synthesis_release`

- **Reuptake, Enzymatic Degradation, and Clearance** `spine_biology_l4_neurotransmitter_clearance_reuptake`
  Reuptake transporters are targets for antidepressants and stimulants.
  Contexts: psychology_neuroscience
  Prereqs: `major_neurotransmitter_systems`
  _[shared]_ Merged neurotransmitters_and_receptors (psychology_neuroscience and medicine_preclinical).

- **Neurotransmitter Synthesis and Release** `spine_biology_l4_neurotransmitter_synthesis_release`
  Neurotransmitter availability depends on synthesis, vesicle loading, and regulated release.
  Contexts: biology, medicine_preclinical, psychology_neuroscience
  _[shared]_ Merged neurotransmitters_and_receptors (psychology_neuroscience and medicine_preclinical).
  _[reviewer note]_ MERGED from 3 contexts: biology:spine_biology_l4_neurotransmitter_synthesis_release, medicine_preclinical:spine_medicine_preclinical_l4_neurotransmitter_synthesis_storage, psychology_neuroscience:spine_psychology_neuroscience_l4_neurotransmitter_synthesis_release

- **Ionotropic vs Metabotropic Receptors** `spine_biology_l4_receptor_types_ionotropic_metabotropic`
  Ionotropic receptors produce fast EPSPs/IPSPs; metabotropic receptors alter second messengers and channel phosphorylation.
  Contexts: psychology_neuroscience
  Prereqs: `neurotransmitter_synthesis_release`
  _[shared]_ Merged neurotransmitters_and_receptors (psychology_neuroscience and medicine_preclinical).

#### L5 (under Ionotropic vs Metabotropic Receptors)
- **Ionotropic Receptor Kinetics and Conductances** `spine_biology_l5_ionotropic_receptor_kinetics` · contexts: psychology_neuroscience
  NMDA receptor magnesium block links channel opening to depolarization.

- **EPSPs, IPSPs, and Synaptic Integration** `spine_biology_l4_synaptic_integration`
  Multiple synaptic inputs combine algebraically.
  Contexts: biology
  Prereqs: `ionotropic_receptors`

---

## 9. Prokaryotic Cell Structure

**L3:** `spine_biology_l3_prokaryotic_cell_structure`

### L4
- **Flagella and Pili** `spine_biology_l4_bacterial_appendages`
  Flagellar rotation is powered by proton motive force.
  Contexts: biology
  Prereqs: `prokaryotic_genome`

- **Bacterial Cell Envelope** `spine_biology_l4_bacterial_cell_envelope`
  The cell envelope provides shape, osmotic protection, and a permeability barrier.
  Contexts: biology
  Prereqs: `prokaryotic_vs_eukaryotic`

- **Bacterial Flagella and Pili** `spine_biology_l4_bacterial_flagella_pili`
  Flagella rotate for chemotaxis.
  Contexts: medicine_preclinical
  Prereqs: `prokaryotic_cell_envelope`

- **Bacterial Ribosomes and Antibiotic Targets** `spine_biology_l4_bacterial_ribosomes_antibiotic_targets`
  Antibiotics exploit structural differences in ribosomal RNA and proteins.
  Contexts: medicine_preclinical
  Prereqs: `bacterial_flagella_pili`

- **Gram-Positive vs Gram-Negative Classification** `spine_biology_l4_gram_stain_classification`
  Gram classification reflects fundamental envelope architecture.
  Contexts: biology
  Prereqs: `bacterial_cell_envelope`

- **Gram Stain and Cell Wall Properties** `spine_biology_l4_gram_stain_properties`
  Crystal violet retention in thick peptidoglycan defines gram-positive organisms.
  Contexts: medicine_preclinical
  Prereqs: `prokaryotic_cell_envelope`

#### L5 (under Gram Stain and Cell Wall Properties)
- **Gram-Negative Outer Membrane and LPS** `spine_biology_l5_outer_membrane_lps` · contexts: medicine_preclinical
  LPS lipid A triggers TLR4-mediated inflammation.

- **Plasmids and Horizontal Gene Transfer** `spine_biology_l4_plasmids_horizontal_gene_transfer`
  Horizontal transfer accelerates antibiotic resistance spread.
  Contexts: medicine_preclinical
  Prereqs: `bacterial_ribosomes_antibiotic_targets`

- **Prokaryotic Cell Envelope (Wall and Membrane)** `spine_biology_l4_prokaryotic_cell_envelope`
  The envelope provides osmotic protection and antibiotic targets.
  Contexts: medicine_preclinical

#### L5 (under Prokaryotic Cell Envelope (Wall and Membrane))
- **Beta-Lactam Antibiotics and Cell Wall Synthesis** `spine_biology_l5_beta_lactam_cell_wall` · contexts: medicine_preclinical
  Bactericidal effect is greatest on actively dividing bacteria with intact cell wall synthesis.

- **Prokaryotic Genome and Plasmids** `spine_biology_l4_prokaryotic_genome`
  Prokaryotic genomes are compact with little noncoding DNA.
  Contexts: biology
  Prereqs: `prokaryotic_vs_eukaryotic`

- **Prokaryotic vs Eukaryotic Organization** `spine_biology_l4_prokaryotic_vs_eukaryotic`
  Prokaryotes include bacteria and archaea.
  Contexts: biology

---

## 10. Synaptic Transmission

**L3:** `spine_biology_l3_synaptic_transmission`

### L4
- **Calcium-Triggered Vesicle Fusion** `spine_biology_l4_calcium_triggered_vesicle_release`
  Calcium sensors trigger fusion of docked vesicles, releasing neurotransmitter into the cleft.
  Contexts: psychology_neuroscience
  Prereqs: `chemical_synapse_structure`
  _[shared]_ Merged synapse_structure (biology), synaptic_transmission (psych), synaptic_transmission_physiology (medicine_preclinical).

- **Chemical Synapse Structure** `spine_biology_l4_chemical_synapse_structure`
  Synaptic structure determines transmission direction and specificity.
  Contexts: biology, psychology_neuroscience
  _[shared]_ Merged synapse_structure (biology), synaptic_transmission (psych), synaptic_transmission_physiology (medicine_preclinical).
  _[reviewer note]_ MERGED from 2 contexts: biology:spine_biology_l4_chemical_synapse_structure, psychology_neuroscience:spine_psychology_neuroscience_l4_chemical_synapse_structure

- **Excitatory vs Inhibitory Synapses** `spine_biology_l4_excitatory_inhibitory_synapses`
  Excitatory synapses bring membrane potential toward threshold; inhibitory synapses move it away.
  Contexts: biology
  Prereqs: `postsynaptic_potentials`

- **Postsynaptic Potentials** `spine_biology_l4_postsynaptic_potentials`
  Postsynaptic potentials are subthreshold and decremental.
  Contexts: biology, medicine_preclinical, psychology_neuroscience
  Prereqs: `synaptic_vesicle_release`, `presynaptic_vesicle_release`, `synaptic_cleft_clearance`, `calcium_triggered_vesicle_release`
  _[shared]_ Merged synapse_structure (biology), synaptic_transmission (psych), synaptic_transmission_physiology (medicine_preclinical).
  _[reviewer note]_ MERGED from 3 contexts: biology:spine_biology_l4_postsynaptic_potentials, medicine_preclinical:spine_medicine_preclinical_l4_postsynaptic_potentials, psychology_neuroscience:spine_psychology_neuroscience_l4_postsynaptic_potentials

- **Presynaptic Vesicle Release Machinery** `spine_biology_l4_presynaptic_vesicle_release`
  Action potential invasion opens voltage-gated Ca2+ channels.
  Contexts: medicine_preclinical

#### L5 (under Presynaptic Vesicle Release Machinery)
- **Botulinum and Tetanus Toxin Mechanisms** `spine_biology_l5_botulinum_tetanus_toxins` · contexts: medicine_preclinical
  Both toxins are proteases targeting VAMP, SNAP-25, or syntaxin.

- **Short-Term Synaptic Plasticity** `spine_biology_l4_short_term_synaptic_plasticity`
  Presynaptic vesicle depletion and calcium buildup tune synaptic gain during burst firing.
  Contexts: psychology_neuroscience
  Prereqs: `synaptic_integration_shunting`
  _[shared]_ Merged synapse_structure (biology), synaptic_transmission (psych), synaptic_transmission_physiology (medicine_preclinical).

- **Synaptic Cleft Clearance Mechanisms** `spine_biology_l4_synaptic_cleft_clearance`
  SSRIs block serotonin reuptake.
  Contexts: medicine_preclinical, psychology_neuroscience
  Prereqs: `presynaptic_vesicle_release`, `postsynaptic_potentials`
  _[shared]_ Merged synapse_structure (biology), synaptic_transmission (psych), synaptic_transmission_physiology (medicine_preclinical).
  _[reviewer note]_ MERGED from 2 contexts: medicine_preclinical:spine_medicine_preclinical_l4_synaptic_cleft_clearance, psychology_neuroscience:spine_psychology_neuroscience_l5_synaptic_cleft_clearance | DEPTH RECONCILED: members authored at mixed L4/L5; promoted to L4 so shallow contexts can include it. Confirm L4 vs L5.

#### L5 (under Synaptic Cleft Clearance Mechanisms)
- **SSRI Mechanism (Serotonin Reuptake Inhibition)** `spine_biology_l5_ssri_serotonin_reuptake` · contexts: medicine_preclinical
  SSRIs are first-line antidepressants.

- **Synaptic Integration and Shunting Inhibition** `spine_biology_l4_synaptic_integration_shunting`
  Inhibition can veto excitation locally without large hyperpolarization.
  Contexts: psychology_neuroscience
  Prereqs: `postsynaptic_potentials`
  _[shared]_ Merged synapse_structure (biology), synaptic_transmission (psych), synaptic_transmission_physiology (medicine_preclinical).

- **Synaptic Plasticity Basics** `spine_biology_l4_synaptic_plasticity_basics`
  Repeated co-activation of pre- and postsynaptic neurons can persistently alter synaptic strength.
  Contexts: biology
  Prereqs: `excitatory_inhibitory_synapses`

- **Synaptic Plasticity and LTP** `spine_biology_l4_synaptic_plasticity_ltp`
  NMDA receptor coincidence detection (glutamate + depolarization) triggers Ca2+-dependent strengthening.
  Contexts: medicine_preclinical
  Prereqs: `postsynaptic_potentials`

#### L5 (under Synaptic Plasticity and LTP)
- **NMDA Receptor Coincidence Detection in LTP** `spine_biology_l5_nmda_ltp_coincidence` · contexts: medicine_preclinical
  Coincidence detection implements Hebbian learning: cells that fire together wire together.

- **Synaptic Vesicle Release** `spine_biology_l4_synaptic_vesicle_release`
  Vesicle release is quantal: each fusion event releases a fixed amount of neurotransmitter.
  Contexts: biology
  Prereqs: `chemical_synapse_structure`

---

## 11. Vaccination Principles

**L3:** `spine_biology_l3_vaccination_principles`

### L4
- **Active Immunization** `spine_biology_l4_active_immunization`
  Active immunization primes B and T lymphocytes for faster secondary responses.
  Contexts: biology

- **Active Immunization Principle** `spine_biology_l4_active_immunization_principle`
  Active immunization generates endogenous immunity.
  Contexts: medicine_preclinical

#### L5 (under Active Immunization Principle)
- **Booster Dose Rationale** `spine_biology_l5_booster_dose_rationale` · contexts: medicine_preclinical
  Primary series establishes memory; boosters expand clone size and drive affinity maturation.

- **Booster Immunization** `spine_biology_l4_booster_immunization`
  Boosters exploit secondary immune responses for rapid, high-titer antibody production.
  Contexts: biology
  Prereqs: `active_immunization`

- **Herd Immunity** `spine_biology_l4_herd_immunity`
  Herd immunity thresholds depend on pathogen transmissibility.
  Contexts: biology
  Prereqs: `active_immunization`

- **Herd Immunity and Coverage Thresholds** `spine_biology_l4_herd_immunity_threshold`
  Threshold depends on R0: higher transmissibility requires higher coverage.
  Contexts: medicine_preclinical
  Prereqs: `subunit_conjugate_vaccines`

- **Live Attenuated vs Inactivated Vaccines** `spine_biology_l4_live_attenuated_vs_inactivated`
  Live vaccines generally produce stronger, longer-lasting immunity but carry contraindications in immunocompromised hosts.
  Contexts: medicine_preclinical
  Prereqs: `active_immunization_principle`

#### L5 (under Live Attenuated vs Inactivated Vaccines)
- **Pregnancy and Live Vaccine Contraindication** `spine_biology_l5_pregnancy_live_vaccine_contraindication` · contexts: medicine_preclinical
  Rubella vaccination prevents congenital rubella syndrome but must be given pre-conception or postpartum, not during pregnancy.

- **Passive Immunization** `spine_biology_l4_passive_immunization`
  Passive immunization is used for post-exposure prophylaxis and toxin neutralization.
  Contexts: biology
  Prereqs: `vaccine_types`

- **Subunit, Conjugate, and Nucleic Acid Vaccines** `spine_biology_l4_subunit_conjugate_vaccines`
  Conjugate vaccines improve T-dependent responses to polysaccharides.
  Contexts: medicine_preclinical
  Prereqs: `active_immunization_principle`

#### L5 (under Subunit, Conjugate, and Nucleic Acid Vaccines)
- **mRNA Vaccine Mechanism** `spine_biology_l5_mrna_vaccine_mechanism` · contexts: medicine_preclinical
  mRNA does not integrate into genome.

- **Vaccine Adverse Events and Contraindications** `spine_biology_l4_vaccine_adverse_events_contraindications`
  Most reactions are mild (soreness, fever).
  Contexts: medicine_preclinical
  Prereqs: `herd_immunity_threshold`

- **Vaccine Types** `spine_biology_l4_vaccine_types`
  Live attenuated vaccines mimic natural infection with strong memory but contraindications in immunocompromised hosts.
  Contexts: biology
  Prereqs: `active_immunization`

---

## 12. Enzyme Kinetics and Michaelis–Menten

**L3:** `spine_chemistry_l3_enzyme_kinetics_michaelis_menten`

### L4
- **Competitive Inhibition** `spine_chemistry_l4_competitive_inhibition`
  Competitive inhibitors resemble substrate structure.
  Contexts: chemistry, medicine_preclinical
  Prereqs: `vmax_km_interpretation`, `lineweaver_burk_plot`, `km_and_substrate_affinity`
  _[reviewer note]_ MERGED from 2 contexts: chemistry:spine_chemistry_l4_competitive_inhibition, medicine_preclinical:spine_medicine_preclinical_l4_competitive_inhibition

#### L5 (under Competitive Inhibition)
- **Apparent Km and Inhibitor Concentration** `spine_chemistry_l5_competitive_apparent_km` · contexts: chemistry
  Higher inhibitor concentration raises apparent Km without changing Vmax.
- **Clinical and Industrial Competitive Inhibitors** `spine_chemistry_l5_competitive_inhibitor_examples` · contexts: chemistry
  Competitive inhibition is exploited in drug design to block specific metabolic enzymes.
- **Competitive Inhibition Lineweaver-Burk Pattern** `spine_chemistry_l5_competitive_inhibitor_lineweaver` · contexts: medicine_preclinical
  Lines converge at y-axis for competitive inhibition.

- **Enzyme–Substrate Binding and Catalytic Cycle** `spine_chemistry_l4_enzyme_catalytic_cycle`
  Enzymes lower activation energy by stabilizing the transition state.
  Contexts: chemistry
  Prereqs: `michaelis_menten_equation`

- **Km and Substrate Affinity** `spine_chemistry_l4_km_and_substrate_affinity`
  Low Km indicates high affinity (less substrate needed for half Vmax).
  Contexts: medicine_preclinical
  Prereqs: `michaelis_menten_equation`

- **Lineweaver–Burk Double-Reciprocal Plot** `spine_chemistry_l4_lineweaver_burk_plot`
  Lineweaver–Burk plots yield a straight line with y-intercept 1/Vmax and x-intercept −1/Km.
  Contexts: chemistry, medicine_preclinical
  Prereqs: `michaelis_menten_equation`, `km_and_substrate_affinity`
  _[reviewer note]_ MERGED from 2 contexts: chemistry:spine_chemistry_l4_lineweaver_burk_plot, medicine_preclinical:spine_medicine_preclinical_l4_lineweaver_burk_plot

#### L5 (under Lineweaver–Burk Double-Reciprocal Plot)
- **Distinguishing Inhibition Types on LB Plots** `spine_chemistry_l5_lb_plot_inhibitor_patterns` · contexts: chemistry
  LB plot patterns provide rapid visual classification of inhibitor mechanism.

- **Michaelis–Menten Equation** `spine_chemistry_l4_michaelis_menten_equation`
  The Michaelis–Menten model assumes rapid equilibrium or steady-state formation of an enzyme–substrate complex.
  Contexts: chemistry, medicine_preclinical
  _[reviewer note]_ MERGED from 2 contexts: chemistry:spine_chemistry_l4_michaelis_menten_equation, medicine_preclinical:spine_medicine_preclinical_l4_michaelis_menten_equation

- **Noncompetitive Enzyme Inhibition** `spine_chemistry_l4_noncompetitive_inhibition`
  Noncompetitive inhibition reduces catalytically active enzyme fraction.
  Contexts: medicine_preclinical
  Prereqs: `lineweaver_burk_plot`, `vmax_catalytic_capacity`

#### L5 (under Noncompetitive Enzyme Inhibition)
- **Mixed and Uncompetitive Inhibition** `spine_chemistry_l5_mixed_vs_uncompetitive` · contexts: medicine_preclinical
  Uncompetitive inhibition rare in drugs but tested conceptually.

- **Noncompetitive and Uncompetitive Inhibition** `spine_chemistry_l4_noncompetitive_uncompetitive_inhibition`
  Noncompetitive inhibitors reduce Vmax without changing Km.
  Contexts: chemistry
  Prereqs: `competitive_inhibition`

- **Vmax and Catalytic Capacity** `spine_chemistry_l4_vmax_catalytic_capacity`
  Vmax increases with enzyme concentration.
  Contexts: medicine_preclinical
  Prereqs: `michaelis_menten_equation`

- **Vmax and Km Interpretation** `spine_chemistry_l4_vmax_km_interpretation`
  Low Km indicates high substrate affinity.
  Contexts: chemistry
  Prereqs: `michaelis_menten_equation`

---

## 13. Glycolysis and Central Metabolism

**L3:** `spine_chemistry_l3_glycolysis_and_central_metabolism`

### L4
- **Fermentation Pathways** `spine_chemistry_l4_fermentation_pathways`
  Fermentation recycles NAD⁺ so glycolysis can sustain ATP production under anaerobic conditions.
  Contexts: chemistry
  Prereqs: `glycolysis_energy_payoff`

- **Gluconeogenesis Overview** `spine_chemistry_l4_gluconeogenesis_overview`
  Gluconeogenesis is essential during fasting.
  Contexts: chemistry
  Prereqs: `glycolysis_regulation`

- **Glycolysis Energy Investment Phase** `spine_chemistry_l4_glycolysis_energy_investment`
  Hexokinase and phosphofructokinase-1 catalyze irreversible, ATP-consuming steps.
  Contexts: chemistry
  Prereqs: `glycolysis_pathway_overview`

- **Glycolysis Energy Payoff Phase** `spine_chemistry_l4_glycolysis_energy_payoff`
  The payoff phase yields a net gain of two ATP and two NADH per glucose.
  Contexts: chemistry
  Prereqs: `glycolysis_pathway_overview`

- **Glycolysis Pathway Overview** `spine_chemistry_l4_glycolysis_pathway_overview`
  Glycolysis is the universal first stage of glucose catabolism.
  Contexts: chemistry, medicine_preclinical
  _[reviewer note]_ MERGED from 2 contexts: chemistry:spine_chemistry_l4_glycolysis_pathway_overview, medicine_preclinical:spine_medicine_preclinical_l4_glycolysis_pathway_overview

#### L5 (under Glycolysis Pathway Overview)
- **Net ATP Yield from Glycolysis** `spine_chemistry_l5_net_atp_yield_glycolysis` · contexts: chemistry
  Per-glucose stoichiometry: 2 ATP consumed, 4 ATP produced, net +2 ATP.

- **Glycolysis Regulatory Steps** `spine_chemistry_l4_glycolysis_regulation`
  PFK-1 is the primary flux-control step, inhibited by ATP and citrate and activated by AMP.
  Contexts: chemistry, medicine_preclinical
  Prereqs: `glycolysis_energy_investment`, `glycolysis_pathway_overview`
  _[reviewer note]_ MERGED from 2 contexts: chemistry:spine_chemistry_l4_glycolysis_regulation, medicine_preclinical:spine_medicine_preclinical_l4_glycolysis_regulatory_steps

#### L5 (under Glycolysis Regulatory Steps)
- **Insulin and Glucagon Effects on Glycolysis** `spine_chemistry_l5_insulin_glucagon_glycolysis` · contexts: chemistry
  Insulin lowers blood glucose by enhancing glycolytic flux.
- **PFK-1 Allosteric Regulation** `spine_chemistry_l5_pfk1_allosteric_regulation` · contexts: chemistry
  PFK-1 integrates cellular energy status.
- **Warburg Effect (Aerobic Glycolysis)** `spine_chemistry_l5_warburg_effect_glycolysis` · contexts: medicine_preclinical
  Warburg effect reflects altered PFK and mitochondrial regulation, not simply hypoxia.

- **Oxidative Phosphorylation and ATP Yield** `spine_chemistry_l4_oxidative_phosphorylation_coupling`
  Oxidative phosphorylation is the major ATP source aerobically.
  Contexts: medicine_preclinical
  Prereqs: `tca_cycle_overview`

#### L5 (under Oxidative Phosphorylation and ATP Yield)
- **Cyanide and Electron Transport Chain Inhibition** `spine_chemistry_l5_cyanide_complex_iv` · contexts: medicine_preclinical
  Cells shift to anaerobic metabolism causing severe lactic acidosis.

- **Pyruvate Fate: Aerobic vs Anaerobic** `spine_chemistry_l4_pyruvate_fate_aerobic_anaerobic`
  Lactate dehydrogenase reaction sustains glycolysis in hypoxic tissue.
  Contexts: medicine_preclinical
  Prereqs: `glycolysis_regulation`

#### L5 (under Pyruvate Fate: Aerobic vs Anaerobic)
- **Pyruvate Dehydrogenase Deficiency** `spine_chemistry_l5_pyruvate_dehydrogenase_deficiency` · contexts: medicine_preclinical
  Treatment includes ketogenic diet providing alternative brain fuel.

- **TCA (Krebs) Cycle Overview** `spine_chemistry_l4_tca_cycle_overview`
  Each acetyl-CoA turn produces 3 NADH, 1 FADH2, 1 GTP.
  Contexts: medicine_preclinical
  Prereqs: `pyruvate_fate_aerobic_anaerobic`

---

## 14. Nucleic Acid Structure

**L3:** `spine_chemistry_l3_nucleic_acid_structure`

### L4
- **DNA Double Helix and Base Pairing** `spine_chemistry_l4_dna_double_helix_base_pairing`
  Watson–Crick base pairing specifies complementary strands and underlies replication fidelity.
  Contexts: chemistry
  Prereqs: `nucleotide_structure`
  _[shared]_ Biology process of replication covered under spine_biology_l3_dna_structure_replication.

#### L5 (under DNA Double Helix and Base Pairing)
- **Mismatch Effects on Helix Stability** `spine_chemistry_l5_base_mismatch_stability` · contexts: chemistry
  Mismatches lower melting temperature and can trigger repair or translational ambiguity.

- **Major and Minor Grooves** `spine_chemistry_l4_dna_grooves`
  The major groove exposes distinct hydrogen-bond patterns for each base pair, enabling proteins to read DNA sequence.
  Contexts: chemistry
  Prereqs: `dna_double_helix_base_pairing`

- **DNA Melting Temperature and Stability** `spine_chemistry_l4_dna_melting_temperature`
  Higher GC content increases helix stability and melting temperature because G–C pairs form three hydrogen bonds.
  Contexts: chemistry
  Prereqs: `dna_double_helix_base_pairing`

#### L5 (under DNA Melting Temperature and Stability)
- **Factors Affecting Hybridization Stringency** `spine_chemistry_l5_hybridization_stringency` · contexts: chemistry
  Higher stringency favors perfect matches over partial complementarity.

- **Nucleotide Components and Linkage** `spine_chemistry_l4_nucleotide_structure`
  Nucleotides are the building blocks of DNA and RNA.
  Contexts: chemistry

- **RNA Structure and Single-Stranded Conformation** `spine_chemistry_l4_rna_structure`
  RNA's 2′-OH increases reactivity and enables diverse folding.
  Contexts: chemistry
  Prereqs: `nucleotide_structure`

---

## 15. Applications of Derivatives

**L3:** `spine_mathematics_l3_applications_of_derivatives`

### L4
- **Concavity and Second Derivative Test** `spine_mathematics_l4_concavity_second_derivative`
  Second-derivative information refines curve shape beyond increasing/decreasing intervals and provides a shortcut for classifying critical points.
  Contexts: mathematics
  Prereqs: `critical_points_first_derivative`

- **Critical Points and First Derivative Test** `spine_mathematics_l4_critical_points_first_derivative`
  Finding where the rate of change vanishes locates candidate extrema.
  Contexts: mathematics

- **Curve Sketching with Derivatives** `spine_mathematics_l4_curve_sketching`
  Combining first- and second-derivative analyses yields complete qualitative graphs without plotting every point.
  Contexts: mathematics
  Prereqs: `concavity_second_derivative`

- **Mean Value Theorem** `spine_mathematics_l4_mean_value_theorem`
  The MVT guarantees at least one point where instantaneous rate equals average rate over an interval, underpinning monotonicity and error bounds.
  Contexts: mathematics

- **Optimization Problems** `spine_mathematics_l4_optimization_problems`
  Optimization translates word problems into calculus: define variables, write the function to optimize, differentiate, and interpret results in context.
  Contexts: mathematics
  Prereqs: `critical_points_first_derivative`

- **Related Rates** `spine_mathematics_l4_related_rates`
  Related rates apply the chain rule to dynamic geometric and physical situations such as expanding balloons, sliding ladders, and filling tanks.
  Contexts: mathematics

---

## 16. Definite Integrals

**L3:** `spine_mathematics_l3_definite_integrals`

### L4
- **Average Value of a Function** `spine_mathematics_l4_average_value_function`
  Average value connects integration to mean output over an interval, used in physics and economics for time-averaged quantities.
  Contexts: mathematics
  Prereqs: `definite_integral_definition`

- **Definite Integral Definition** `spine_mathematics_l4_definite_integral_definition`
  When the limit exists, f is integrable on [a, b] and the integral accumulates signed area, accounting for regions below the axis.
  Contexts: mathematics
  Prereqs: `riemann_sums`

- **Properties of Definite Integrals** `spine_mathematics_l4_definite_integral_properties`
  Integral properties allow splitting domains, combining integrands, and estimating values without explicit antiderivatives.
  Contexts: mathematics
  Prereqs: `definite_integral_definition`

- **Riemann Sums and Area Approximation** `spine_mathematics_l4_riemann_sums`
  Riemann sums motivate the definite integral as a limit of better and better area approximations.
  Contexts: mathematics

- **Substitution in Definite Integrals** `spine_mathematics_l4_substitution_definite_integrals`
  u-substitution evaluates definite integrals by reversing the chain rule, requiring limit transformation when bounds change.
  Contexts: mathematics
  Prereqs: `definite_integral_properties`

---

## 17. Derivatives and Differentiation Rules

**L3:** `spine_mathematics_l3_derivatives`

### L4
- **Power, Sum, and Constant Multiple Rules** `spine_mathematics_l4_basic_differentiation_rules`
  These elementary rules differentiate polynomials and linear combinations efficiently without returning to the limit definition each time.
  Contexts: mathematics
  Prereqs: `derivative_rate_of_change`

- **Chain Rule** `spine_mathematics_l4_chain_rule`
  The chain rule handles nested functions and is essential for implicit differentiation, related rates, and transcendental derivatives.
  Contexts: mathematics
  Prereqs: `basic_differentiation_rules`

- **Derivative as Instantaneous Rate of Change** `spine_mathematics_l4_derivative_rate_of_change`
  The limit definition connects secant-line slopes to tangent-line slope.
  Contexts: mathematics

- **Derivatives of Exponential and Logarithmic Functions** `spine_mathematics_l4_exp_log_derivatives`
  Exponential and logarithmic derivatives underpin growth, decay, and logarithmic-differentiation techniques used throughout calculus and differential equations.
  Contexts: mathematics
  Prereqs: `chain_rule`

- **Implicit Differentiation** `spine_mathematics_l4_implicit_differentiation`
  Implicit differentiation finds slopes of curves not expressible as y = f(x), including circles, ellipses, and inverse-function relationships.
  Contexts: mathematics
  Prereqs: `chain_rule`

- **Product and Quotient Rules** `spine_mathematics_l4_product_quotient_rules`
  When functions are multiplied or divided rather than added, the product and quotient rules extend basic rules to composite algebraic forms.
  Contexts: mathematics
  Prereqs: `basic_differentiation_rules`

---

## 18. Descriptive Statistics

**L3:** `spine_mathematics_l3_descriptive_statistics`

### L4
- **Correlation as Descriptive Association** `spine_mathematics_l4_correlation_descriptive_association`
  Correlation does not imply causation; confounds and directionality require experimental design.
  Contexts: psychology_neuroscience
  Prereqs: `distribution_shape_normality`
  _[shared]_ Merged descriptive_statistics (mathematics and psychology_neuroscience research methods).

- **Data Visualization** `spine_mathematics_l4_data_visualization`
  Visual inspection reveals modality, skew, gaps, and outliers before formal inference.
  Contexts: mathematics

- **Distribution Shape and Skewness** `spine_mathematics_l4_distribution_shape`
  Skewness affects interpretation of mean vs median and informs choice of inferential methods.
  Contexts: mathematics
  Prereqs: `measures_central_tendency`

- **Distribution Shape and Normality** `spine_mathematics_l4_distribution_shape_normality`
  Psychology data are often skewed; recognizing shape guides analysis choices.
  Contexts: psychology_neuroscience
  Prereqs: `variability_standard_deviation`
  _[shared]_ Merged descriptive_statistics (mathematics and psychology_neuroscience research methods).

- **Five-Number Summary and Box Plots** `spine_mathematics_l4_five_number_summary`
  Box plots compactly show center, spread, and outliers and enable comparison across groups.
  Contexts: mathematics
  Prereqs: `measures_spread`, `data_visualization`

- **Measures of Central Tendency** `spine_mathematics_l4_measures_central_tendency`
  Choice of center measure depends on distribution shape and outliers; median resists skew influence better than mean.
  Contexts: mathematics, psychology_neuroscience
  _[shared]_ Merged descriptive_statistics (mathematics and psychology_neuroscience research methods).
  _[reviewer note]_ MERGED from 2 contexts: mathematics:spine_mathematics_l4_measures_central_tendency, psychology_neuroscience:spine_mathematics_l4_measures_of_central_tendency | Shared L3 anchor — verify cross-domain context in consolidation pass.

- **Measures of Spread** `spine_mathematics_l4_measures_spread`
  Spread measures quantify dispersion around center; standard deviation is the most common metric for symmetric distributions.
  Contexts: mathematics
  Prereqs: `measures_central_tendency`

- **Outliers and Robust Statistics** `spine_mathematics_l4_outliers_robust_statistics`
  Outlier detection and robust summaries prevent misleading descriptions when data contain extreme values.
  Contexts: mathematics
  Prereqs: `five_number_summary`
  _[reviewer note]_ Contains forward reference to existing L3 node — verify target exists in spine.

- **Variability and Standard Deviation** `spine_mathematics_l4_variability_standard_deviation`
  SD links to normal models and z-scores used throughout inferential testing.
  Contexts: psychology_neuroscience
  Prereqs: `measures_central_tendency`
  _[shared]_ Merged descriptive_statistics (mathematics and psychology_neuroscience research methods).

---

## 19. Eigenvalues and Eigenvectors

**L3:** `spine_mathematics_l3_eigenvalues_and_eigenvectors`

### L4
- **Characteristic Polynomial** `spine_mathematics_l4_characteristic_polynomial`
  The characteristic polynomial systematically finds all eigenvalues of a square matrix.
  Contexts: mathematics
  Prereqs: `eigenvector_definition`

- **Matrix Diagonalization** `spine_mathematics_l4_diagonalization_concept`
  Diagonalization decouples coupled linear dynamics into independent scalar modes.
  Contexts: mathematics
  Prereqs: `finding_eigenvectors`
  _[reviewer note]_ Contains forward reference to existing L3 node — verify target exists in spine.

- **Eigenvector and Eigenvalue Definition** `spine_mathematics_l4_eigenvector_definition`
  Eigenvectors reveal directions preserved by a linear transformation.
  Contexts: mathematics

- **Finding Eigenvectors** `spine_mathematics_l4_finding_eigenvectors`
  Eigenspace for λ is the set of all eigenvectors plus zero, forming a subspace.
  Contexts: mathematics
  Prereqs: `characteristic_polynomial`

- **Geometric Interpretation of Eigenvalues** `spine_mathematics_l4_geometric_interpretation_eigen`
  Geometric view connects eigenanalysis to transformation behavior in the plane and space.
  Contexts: mathematics
  Prereqs: `eigenvector_definition`

---

## 20. Exponential Decay

**L3:** `spine_mathematics_l3_exponential_decay`

### L4
- **Activity and Decay Rate (Becquerels)** `spine_mathematics_l4_activity_and_decay_rate`
  Activity decreases exponentially alongside N.
  Contexts: physics
  Prereqs: `half_life_decay_constant`

- **Clearance and Elimination Relationship** `spine_mathematics_l4_clearance_elimination_relationship`
  Clearance integrates elimination rate and distribution volume into a single measure of body capacity to remove a substance.
  Contexts: medicine_preclinical
  Prereqs: `elimination_rate_constant`

- **Decay Constant and Half-Life** `spine_mathematics_l4_decay_constant_half_life`
  Half-life provides an intuitive timescale for decay processes from radioactivity to drug clearance.
  Contexts: mathematics
  Prereqs: `exponential_decay_model`

- **Exponential Decay vs Growth Comparison** `spine_mathematics_l4_decay_vs_growth_comparison`
  Growth and decay share the same mathematical structure with opposite sign of rate constant, unifying population and financial models.
  Contexts: mathematics
  Prereqs: `exponential_decay_model`

- **Dosing Interval and Accumulation Principles** `spine_mathematics_l4_dosing_interval_accumulation`
  When doses are given repeatedly at intervals shorter than about five half-lives, accumulation occurs until input equals elimination.
  Contexts: medicine_preclinical
  Prereqs: `drug_half_life`

- **Drug Half-Life (t½)** `spine_mathematics_l4_drug_half_life`
  Under first-order elimination, half-life is constant and independent of starting concentration.
  Contexts: medicine_preclinical
  Prereqs: `elimination_rate_constant`

#### L5 (under Drug Half-Life (t½))
- **Half-Life in Renal and Hepatic Impairment** `spine_mathematics_l5_half_life_organ_impairment` · contexts: medicine_preclinical
  Drugs cleared primarily by the kidney or liver accumulate when GFR or metabolic capacity falls.
- **Time to Steady State (4–5 Half-Lives)** `spine_mathematics_l5_time_to_steady_state` · contexts: medicine_preclinical
  Steady state is approached asymptotically; four to five half-lives is the practical rule for both accumulation and washout.

- **Elimination Rate Constant (ke)** `spine_mathematics_l4_elimination_rate_constant`
  ke quantifies how rapidly a substance is cleared from a compartment under proportional elimination.
  Contexts: medicine_preclinical
  Prereqs: `first_order_elimination_model`
  _[shared]_ Mathematically equivalent to decay constant λ in physics and rate constant k in first-order chemical reactions.

#### L5 (under Elimination Rate Constant (ke))
- **Factors That Alter ke** `spine_mathematics_l5_factors_altering_ke` · contexts: medicine_preclinical
  Because ke determines half-life, any factor that accelerates or slows elimination directly shifts dosing requirements.
- **ke–t½ Relationship (0.693 Rule)** `spine_mathematics_l5_ke_half_life_equation` · contexts: medicine_preclinical
  This identity converts between ke and t½ for any first-order system.

- **Exponential Decay Law N(t) = N₀e^(−λt)** `spine_mathematics_l4_exponential_decay_law`
  Exponential decay predicts constant fractional loss per unit time.
  Contexts: physics

- **Exponential Decay Model N(t) = N₀e^{−λt}** `spine_mathematics_l4_exponential_decay_model`
  The exponential decay model is the solution to dN/dt = −λN and describes any proportional-loss process.
  Contexts: mathematics
  _[shared]_ Also used in chemistry (first-order kinetics), medicine_preclinical (drug elimination), physics (radioactive decay).
  _[reviewer note]_ Shared L3 anchor — verify cross-domain context in consolidation pass.

- **First-Order Elimination Model** `spine_mathematics_l4_first_order_elimination_model`
  First-order elimination predicts that a constant fraction of remaining drug is cleared per unit time, producing exponential decline in concentration.
  Contexts: medicine_preclinical
  _[shared]_ Mathematically identical to first-order reaction kinetics in chemistry (spine_chemistry_l3_integrated_rate_laws). Add chemistry domain context in consolidation pass.

- **First-Order Reaction Model** `spine_mathematics_l4_first_order_reaction_model`
  First-order reactions have a constant half-life independent of initial concentration.
  Contexts: chemistry
  _[shared]_ Mathematically identical to exponential decay (spine_mathematics_l3_exponential_decay) and first-order drug elimination in pharmacokinetics.

- **Half-Life and Decay Constant Relationship** `spine_mathematics_l4_half_life_decay_constant`
  Half-life is an intrinsic property of each radionuclide.
  Contexts: chemistry, physics
  Prereqs: `rate_constant_first_order`, `exponential_decay_law`
  _[reviewer note]_ MERGED from 2 contexts: chemistry:spine_chemistry_l5_half_life_k_equation, physics:spine_physics_l4_half_life_decay_constant | DEPTH RECONCILED: members authored at mixed L4/L5; promoted to L4 so shallow contexts can include it. Confirm L4 vs L5.

- **First-Order Half-Life** `spine_mathematics_l4_half_life_first_order`
  Constant half-life is the hallmark of first-order kinetics.
  Contexts: chemistry
  Prereqs: `rate_constant_first_order`

#### L5 (under First-Order Half-Life)
- **Radiometric Dating Applications** `spine_mathematics_l5_radioactive_dating_half_life` · contexts: chemistry
  Carbon-14 dating covers archaeological timescales; uranium-lead dating covers geological timescales.

- **Integrated First-Order Rate Law** `spine_mathematics_l4_integrated_rate_law_first_order`
  The integrated form enables calculation of concentration at any time or determination of k from experimental data.
  Contexts: chemistry
  Prereqs: `first_order_reaction_model`

- **Mean Lifetime of Radioactive Nuclei** `spine_mathematics_l4_mean_lifetime_radioactive`
  Mean lifetime exceeds half-life by factor 1/ln(2) ≈ 1.
  Contexts: physics
  Prereqs: `activity_and_decay_rate`

- **Proportional Rate of Change** `spine_mathematics_l4_proportional_decay_rate`
  Proportionality is the defining differential-equation condition whose solution is exponential decay.
  Contexts: mathematics
  Prereqs: `exponential_decay_model`
  _[reviewer note]_ Contains forward reference to existing L3 node — verify target exists in spine.

- **Radioactive Decay Kinetics** `spine_mathematics_l4_radioactive_decay_kinetics`
  Radioactive decay follows first-order kinetics.
  Contexts: chemistry
  Prereqs: `first_order_reaction_model`

- **First-Order Rate Constant (k)** `spine_mathematics_l4_rate_constant_first_order`
  A larger k means faster reaction.
  Contexts: chemistry
  Prereqs: `first_order_reaction_model`

#### L5 (under First-Order Rate Constant (k))
- **Temperature Effect on Rate Constant** `spine_mathematics_l5_temperature_effect_rate_constant` · contexts: chemistry
  Higher temperature provides more molecules with energy exceeding the activation barrier.

- **Solving Exponential Decay Problems** `spine_mathematics_l4_solving_decay_problems`
  Applied decay problems require translating context into N₀, λ, and t, then solving exponential or logarithmic equations.
  Contexts: mathematics
  Prereqs: `decay_constant_half_life`

- **Zero-Order vs First-Order Elimination** `spine_mathematics_l4_zero_order_vs_first_order_elimination`
  Most drugs follow first-order kinetics at therapeutic concentrations.
  Contexts: medicine_preclinical
  Prereqs: `first_order_elimination_model`

---

## 21. Exponential Functions

**L3:** `spine_mathematics_l3_exponential_functions`

### L4
- **Compound Interest and Continuous Growth** `spine_mathematics_l4_compound_interest_growth`
  Financial and population growth applications motivate exponential functions and the transition from discrete to continuous compounding.
  Contexts: mathematics
  Prereqs: `natural_base_e`

- **Solving Exponential Equations** `spine_mathematics_l4_exponential_equations`
  Solving exponential equations connects to logarithmic functions and appears in half-life and doubling-time problems.
  Contexts: mathematics
  Prereqs: `laws_of_exponents`

- **Exponential Function Definition and Graph** `spine_mathematics_l4_exponential_function_definition`
  Exponential graphs rise or fall depending on whether b > 1 or 0 < b < 1, always passing through (0, 1).
  Contexts: mathematics

- **Transformations of Exponential Graphs** `spine_mathematics_l4_exponential_transformations`
  Transformations model scaled, shifted, and reflected growth or decay processes in applied settings.
  Contexts: mathematics
  Prereqs: `exponential_function_definition`

- **Laws of Exponents** `spine_mathematics_l4_laws_of_exponents`
  Exponent laws simplify products, quotients, and powers of exponential terms before applying logarithms or calculus.
  Contexts: mathematics

- **The Natural Base e** `spine_mathematics_l4_natural_base_e`
  e is the unique base where instantaneous rate of change equals the function value, central to calculus and continuous growth models.
  Contexts: mathematics
  Prereqs: `exponential_function_definition`

---

## 22. First-Order Ordinary Differential Equations

**L3:** `spine_mathematics_l3_first_order_odes`

### L4
- **Direction Fields and Slope Visualization** `spine_mathematics_l4_direction_fields`
  Direction fields preview equilibria, stability, and asymptotic behavior without explicit solutions.
  Contexts: mathematics
  Prereqs: `ode_classification`

- **Euler's Method** `spine_mathematics_l4_eulers_method`
  Euler's method provides numerical solutions when analytic methods fail and introduces numerical error concepts.
  Contexts: mathematics
  Prereqs: `direction_fields`

- **Integrating Factor Method** `spine_mathematics_l4_integrating_factor_method`
  Integrating factors extend beyond ODEs to exact equations and appear in standard form derivations.
  Contexts: mathematics
  Prereqs: `linear_first_order_odes`
  _[reviewer note]_ Contains forward reference to existing L3 node — verify target exists in spine.

- **Linear First-Order ODEs** `spine_mathematics_l4_linear_first_order_odes`
  The integrating factor method converts linear first-order ODEs to integrable total derivatives.
  Contexts: mathematics
  Prereqs: `ode_classification`

- **ODE Classification and Order** `spine_mathematics_l4_ode_classification`
  Classification by order and linearity determines which solution technique applies.
  Contexts: mathematics

---

## 23. Fundamental Theorem of Calculus

**L3:** `spine_mathematics_l3_fundamental_theorem_of_calculus`

### L4
- **Accumulation Functions** `spine_mathematics_l4_accumulation_functions`
  Accumulation functions model running totals and their derivatives recover the instantaneous rate being accumulated.
  Contexts: mathematics
  Prereqs: `ftc_part1`

- **Fundamental Theorem of Calculus Part 1** `spine_mathematics_l4_ftc_part1`
  Part 1 shows differentiation undoes integration: the rate of change of accumulated area equals the integrand.
  Contexts: mathematics

- **Fundamental Theorem of Calculus Part 2** `spine_mathematics_l4_ftc_part2`
  Part 2 enables evaluation of definite integrals via antiderivatives, completing the link between rates and totals.
  Contexts: mathematics
  Prereqs: `ftc_part1`

- **Net Change Theorem** `spine_mathematics_l4_net_change_theorem`
  Net change interprets integration physically: integrating velocity gives displacement; integrating marginal cost gives total cost change.
  Contexts: mathematics
  Prereqs: `ftc_part2`

---

## 24. Hypothesis Testing

**L3:** `spine_mathematics_l3_hypothesis_testing`

### L4
- **Chi-Square Goodness-of-Fit Test** `spine_mathematics_l4_chi_square_goodness_of_fit`
  Goodness-of-fit tests whether sample data match a specified categorical distribution.
  Contexts: mathematics
  Prereqs: `test_statistics`
  _[reviewer note]_ Contains forward reference to existing L3 node — verify target exists in spine.

- **Null and Alternative Hypotheses** `spine_mathematics_l4_null_alternative_hypotheses`
  Hypothesis testing begins by formalizing competing claims about a population parameter.
  Contexts: mathematics, psychology_neuroscience
  _[shared]_ Merged hypothesis_testing (mathematics) and inferential_statistics_hypothesis_testing (psychology_neuroscience).
  _[reviewer note]_ MERGED from 2 contexts: mathematics:spine_mathematics_l4_null_alternative_hypotheses, psychology_neuroscience:spine_mathematics_l4_null_alternative_hypotheses | Shared L3 anchor — verify cross-domain context in consolidation pass.

- **One-Sample t-Test** `spine_mathematics_l4_one_sample_t_test`
  The one-sample t-test compares a sample mean to a hypothesized population mean with unknown variance.
  Contexts: mathematics
  Prereqs: `test_statistics`

#### L5 (under One-Sample t-Test)
- **One-Tailed vs Two-Tailed Tests** `spine_mathematics_l5_one_vs_two_tailed_tests` · contexts: mathematics
  Tail choice must be pre-specified; one-tailed tests have greater power for directional hypotheses but cannot detect effects in the opposite direction.
- **t-Test Assumptions** `spine_mathematics_l5_t_test_assumptions` · contexts: mathematics
  Violations of assumptions affect validity; robust alternatives exist for non-normal small samples.

- **P-Values and Decision Rules** `spine_mathematics_l4_p_values`
  Compare p-value to α: reject H₀ if p ≤ α; otherwise fail to reject.
  Contexts: mathematics
  Prereqs: `type_errors_significance`

#### L5 (under P-Values and Decision Rules)
- **Interpreting P-Values Correctly** `spine_mathematics_l5_interpreting_p_values` · contexts: mathematics
  Correct interpretation avoids the common inverse-probability fallacy in reporting statistical results.
- **Common P-Value Misinterpretations** `spine_mathematics_l5_p_value_misinterpretations` · contexts: mathematics
  Recognizing misinterpretations supports critical reading of published studies and experimental design.

- **p-Values and Statistical Significance** `spine_mathematics_l4_p_values_significance`
  Alpha levels control Type I error rate; p-values do not measure effect size or clinical importance.
  Contexts: psychology_neuroscience
  Prereqs: `null_alternative_hypotheses`
  _[shared]_ Merged hypothesis_testing (mathematics) and inferential_statistics_hypothesis_testing (psychology_neuroscience).

- **Parametric vs Nonparametric Tests Overview** `spine_mathematics_l4_parametric_nonparametric_overview`
  Choosing tests requires matching data type, design, and assumption checks.
  Contexts: psychology_neuroscience
  Prereqs: `type_i_ii_errors_power`
  _[shared]_ Merged hypothesis_testing (mathematics) and inferential_statistics_hypothesis_testing (psychology_neuroscience).

- **Test Statistics and Sampling Distributions** `spine_mathematics_l4_test_statistics`
  Choosing the correct test statistic depends on parameter, sample size, and distributional assumptions.
  Contexts: mathematics
  Prereqs: `null_alternative_hypotheses`

- **Type I and Type II Errors** `spine_mathematics_l4_type_errors_significance`
  Error types and α quantify the risk of wrong conclusions in hypothesis testing.
  Contexts: mathematics
  Prereqs: `null_alternative_hypotheses`

#### L5 (under Type I and Type II Errors)
- **Choosing Significance Level α** `spine_mathematics_l5_alpha_level_selection` · contexts: mathematics
  α selection reflects context-specific cost of false positive vs false negative.

- **Type I, Type II Errors, and Power** `spine_mathematics_l4_type_i_ii_errors_power`
  Underpowered studies risk missing real effects; multiple comparisons inflate Type I error.
  Contexts: psychology_neuroscience
  Prereqs: `p_values_significance`
  _[shared]_ Merged hypothesis_testing (mathematics) and inferential_statistics_hypothesis_testing (psychology_neuroscience).

---

## 25. Limits and Continuity

**L3:** `spine_mathematics_l3_limits_and_continuity`

### L4
- **Continuity at a Point** `spine_mathematics_l4_continuity_definition`
  Continuity means no breaks, jumps, or holes at a point; continuous functions preserve limit structure under composition and algebraic operations.
  Contexts: mathematics
  Prereqs: `one_sided_limits`

- **Intermediate Value Theorem** `spine_mathematics_l4_intermediate_value_theorem`
  The IVT guarantees that continuous functions take every intermediate value, enabling root-finding arguments and existence proofs.
  Contexts: mathematics
  Prereqs: `continuity_definition`

- **Limit Definition and Notation** `spine_mathematics_l4_limit_definition`
  Limits describe intended output value as input approaches a point, even when the function is undefined or discontinuous at that point.
  Contexts: mathematics

- **Limit Laws** `spine_mathematics_l4_limit_laws`
  Limit laws reduce complex limit calculations to simpler component limits, analogous to derivative rules.
  Contexts: mathematics
  Prereqs: `limit_definition`

- **Limits at Infinity and Horizontal Asymptotes** `spine_mathematics_l4_limits_at_infinity`
  End-behavior limits classify long-term growth or decay and identify horizontal asymptotes for rational and transcendental functions.
  Contexts: mathematics
  Prereqs: `limit_laws`

- **One-Sided Limits** `spine_mathematics_l4_one_sided_limits`
  One-sided limits resolve piecewise behavior and are essential for defining continuity at endpoints and analyzing jump discontinuities.
  Contexts: mathematics
  Prereqs: `limit_definition`

---

## 26. Line Integrals

**L3:** `spine_mathematics_l3_line_integrals`

### L4
- **Path Independence and Conservative Fields** `spine_mathematics_l4_path_independence`
  Conservative fields simplify work calculations to potential difference: ∫_C F·dr = f(B) − f(A).
  Contexts: mathematics
  Prereqs: `vector_line_integrals`

- **Scalar Line Integrals** `spine_mathematics_l4_scalar_line_integrals`
  Scalar line integrals generalize arc length to weighted accumulation along curves.
  Contexts: mathematics

- **Vector Line Integrals** `spine_mathematics_l4_vector_line_integrals`
  Vector line integrals measure circulation and work and depend on path unless the field is conservative.
  Contexts: mathematics
  Prereqs: `scalar_line_integrals`

- **Work Done by a Force Field** `spine_mathematics_l4_work_by_force_field`
  Work integrals connect vector calculus to physics problems involving variable forces along curved paths.
  Contexts: mathematics
  Prereqs: `vector_line_integrals`

---

## 27. Logarithmic Functions

**L3:** `spine_mathematics_l3_logarithmic_functions`

### L4
- **Change-of-Base Formula** `spine_mathematics_l4_change_of_base`
  Change of base enables calculator evaluation of logs in arbitrary bases and appears in algorithm analysis.
  Contexts: mathematics
  Prereqs: `logarithm_properties`

- **Logarithm as Inverse of Exponential** `spine_mathematics_l4_logarithm_as_inverse`
  Logarithmic and exponential functions are inverses, interchanging exponent and output roles.
  Contexts: mathematics

- **Properties of Logarithms** `spine_mathematics_l4_logarithm_properties`
  Log properties convert products to sums and powers to products, essential for solving equations and differentiating log functions.
  Contexts: mathematics
  Prereqs: `logarithm_as_inverse`

- **Solving Logarithmic and Exponential Equations** `spine_mathematics_l4_logarithmic_equations`
  Unified exponential-log equation solving supports separable differential equations and half-life calculations.
  Contexts: mathematics
  Prereqs: `logarithm_properties`

- **Logarithmic Graphs and Transformations** `spine_mathematics_l4_logarithmic_graphs`
  Log graphs rise slowly, reflecting compressed scale for large multiplicative ranges such as pH and decibels.
  Contexts: mathematics
  Prereqs: `logarithm_as_inverse`

- **Natural Logarithm (ln)** `spine_mathematics_l4_natural_logarithm`
  ln x appears in growth/decay models, entropy, and as the antiderivative of 1/x for x > 0.
  Contexts: mathematics
  Prereqs: `logarithm_as_inverse`

---

## 28. Multiple Integrals

**L3:** `spine_mathematics_l3_multiple_integrals`

### L4
- **Double Integrals over General Regions** `spine_mathematics_l4_double_integrals_general_regions`
  Setting correct integration limits for non-rectangular domains is the main skill in applied double integration.
  Contexts: mathematics
  Prereqs: `iterated_integrals`

- **Double Integrals over Rectangles** `spine_mathematics_l4_double_integrals_rectangles`
  Double integrals extend accumulation to functions of two variables over planar regions.
  Contexts: mathematics

- **Iterated Integrals and Fubini's Theorem** `spine_mathematics_l4_iterated_integrals`
  Fubini's theorem reduces double integration to sequential single integrals, making computation tractable.
  Contexts: mathematics
  Prereqs: `double_integrals_rectangles`

- **Double Integrals in Polar Coordinates** `spine_mathematics_l4_polar_coordinates_integration`
  Polar coordinates exploit circular symmetry in disks, annuli, and rotationally symmetric density functions.
  Contexts: mathematics
  Prereqs: `double_integrals_general_regions`

- **Triple Integrals** `spine_mathematics_l4_triple_integrals`
  Triple integrals compute mass, center of mass, and volume in 3D when density varies spatially.
  Contexts: mathematics
  Prereqs: `iterated_integrals`

- **Volume and Mass Applications** `spine_mathematics_l4_volume_mass_applications`
  Geometric and physical applications motivate setting up and evaluating multiple integrals in practice.
  Contexts: mathematics
  Prereqs: `triple_integrals`
  _[reviewer note]_ Contains forward reference to existing L3 node — verify target exists in spine.

---

## 29. Normal Distribution

**L3:** `spine_mathematics_l3_normal_distribution`

### L4
- **Central Limit Theorem (Introduction)** `spine_mathematics_l4_central_limit_theorem_intro`
  The CLT justifies normal approximations for sample means and is the bridge from descriptive statistics to inference.
  Contexts: mathematics
  Prereqs: `normal_curve_properties`

- **Empirical Rule (68–95–99.7)** `spine_mathematics_l4_empirical_rule`
  The empirical rule provides quick probability estimates without tables for roughly normal datasets.
  Contexts: mathematics
  Prereqs: `normal_curve_properties`

- **Normal Curve Properties** `spine_mathematics_l4_normal_curve_properties`
  Normal curves model many natural and measurement phenomena and are fully characterized by μ and σ.
  Contexts: mathematics

- **Normal Probability Calculation** `spine_mathematics_l4_normal_probability_calculation`
  Probability calculation connects normal models to hypothesis tests and confidence intervals.
  Contexts: mathematics
  Prereqs: `standard_normal_z`
  _[reviewer note]_ Contains forward reference to existing L3 node — verify target exists in spine.

- **Standard Normal and Z-Scores** `spine_mathematics_l4_standard_normal_z`
  Z-scores express how many standard deviations a value lies from the mean, enabling probability calculations.
  Contexts: mathematics
  Prereqs: `normal_curve_properties`

---

## 30. Partial Derivatives

**L3:** `spine_mathematics_l3_partial_derivatives`

### L4
- **Clairaut's Theorem on Mixed Partials** `spine_mathematics_l4_clairaut_theorem`
  Equality of mixed partials simplifies computation and guarantees symmetric Hessian entries for optimization.
  Contexts: mathematics
  Prereqs: `higher_order_partials`

- **Functions of Several Variables** `spine_mathematics_l4_functions_several_variables`
  Multivariable functions model quantities depending on several independent variables such as temperature over space and time.
  Contexts: mathematics

- **Gradient Vector** `spine_mathematics_l4_gradient_vector`
  The gradient is central to optimization, level curves, and vector field definitions.
  Contexts: mathematics
  Prereqs: `partial_derivative_definition`

- **Higher-Order Partial Derivatives** `spine_mathematics_l4_higher_order_partials`
  Mixed partials describe interaction effects between variables and appear in heat equation and optimization tests.
  Contexts: mathematics
  Prereqs: `partial_derivative_definition`

- **Multivariable Chain Rule** `spine_mathematics_l4_multivariable_chain_rule`
  The multivariable chain rule tracks total rate of change through composed dependencies.
  Contexts: mathematics
  Prereqs: `gradient_vector`

- **Partial Derivative Definition** `spine_mathematics_l4_partial_derivative_definition`
  Partial derivatives isolate sensitivity to one input while holding others constant.
  Contexts: mathematics
  Prereqs: `functions_several_variables`

---

## 31. Second-Order Linear Differential Equations

**L3:** `spine_mathematics_l3_second_order_linear_odes`

### L4
- **Characteristic Equation** `spine_mathematics_l4_characteristic_equation`
  The characteristic polynomial reduces second-order ODEs to algebraic root-finding.
  Contexts: mathematics
  Prereqs: `second_order_linear_classification`

- **Complex Conjugate Roots** `spine_mathematics_l4_complex_conjugate_roots`
  Complex roots model damped or undamped oscillations in mechanical and electrical systems.
  Contexts: mathematics
  Prereqs: `characteristic_equation`

- **Real Distinct Roots** `spine_mathematics_l4_real_distinct_roots`
  Real distinct roots produce exponential modes without oscillation.
  Contexts: mathematics
  Prereqs: `characteristic_equation`

- **Repeated Roots** `spine_mathematics_l4_repeated_roots`
  Repeated roots require multiplying by x to obtain a second linearly independent solution.
  Contexts: mathematics
  Prereqs: `characteristic_equation`
  _[reviewer note]_ Contains forward reference to existing L3 node — verify target exists in spine.

- **Second-Order Linear ODE Classification** `spine_mathematics_l4_second_order_linear_classification`
  Classification determines whether superposition and characteristic equation methods apply.
  Contexts: mathematics

---

## 32. Separable Differential Equations

**L3:** `spine_mathematics_l3_separable_differential_equations`

### L4
- **Equilibrium Solutions** `spine_mathematics_l4_equilibrium_solutions`
  Equilibria are fixed points of dynamics; stability analysis begins by locating them.
  Contexts: mathematics
  Prereqs: `separable_equation_form`
  _[reviewer note]_ Contains forward reference to existing L3 node — verify target exists in spine.

- **Growth and Decay Applications** `spine_mathematics_l4_growth_decay_applications`
  Separable ODEs unify population, radioactive, and financial exponential models under one technique.
  Contexts: mathematics
  Prereqs: `initial_value_problems_separable`

- **Initial Value Problems** `spine_mathematics_l4_initial_value_problems_separable`
  IVPs select the unique solution curve passing through a given point in the direction field.
  Contexts: mathematics
  Prereqs: `separation_of_variables_procedure`

- **Separable Equation Form** `spine_mathematics_l4_separable_equation_form`
  Separability is the simplest analytic technique for first-order ODEs and includes exponential growth/decay.
  Contexts: mathematics

- **Separation of Variables Procedure** `spine_mathematics_l4_separation_of_variables_procedure`
  Integration after separation yields implicit or explicit general solutions.
  Contexts: mathematics
  Prereqs: `separable_equation_form`

---

## 33. Systems of Differential Equations

**L3:** `spine_mathematics_l3_systems_of_odes`

### L4
- **Eigenvalue Method for Linear Systems** `spine_mathematics_l4_eigenvalue_method_systems`
  The eigenvalue method diagonalizes linear system dynamics into independent exponential modes.
  Contexts: mathematics
  Prereqs: `matrix_form_linear_systems`

- **Matrix Form x′ = Ax** `spine_mathematics_l4_matrix_form_linear_systems`
  Matrix notation compactly expresses coupled linear dynamics and connects to linear algebra.
  Contexts: mathematics
  Prereqs: `system_formulation`

- **Phase Plane Analysis** `spine_mathematics_l4_phase_plane`
  Phase portraits visualize long-term behavior of coupled systems without explicit time-series plots.
  Contexts: mathematics
  Prereqs: `system_formulation`

- **Equilibrium Stability Classification** `spine_mathematics_l4_stability_classification`
  Stability determines whether small perturbations decay or grow, critical for population and control models.
  Contexts: mathematics
  Prereqs: `eigenvalue_method_systems`, `phase_plane`

- **System Formulation** `spine_mathematics_l4_system_formulation`
  Many higher-order ODEs convert to first-order systems by introducing auxiliary variables.
  Contexts: mathematics

---

## 34. Unit Circle and Radian Measure

**L3:** `spine_mathematics_l3_unit_circle_and_radians`

### L4
- **Arc Length and Radian Measure** `spine_mathematics_l4_arc_length_radian_measure`
  Radian measure makes arc length proportional to angle, simplifying circular motion and integration over angular domains.
  Contexts: mathematics
  Prereqs: `degree_radian_conversion`

- **Degree–Radian Conversion** `spine_mathematics_l4_degree_radian_conversion`
  Calculus requires radian measure for correct derivative formulas of trigonometric functions.
  Contexts: mathematics

- **Reference Angles** `spine_mathematics_l4_reference_angles`
  Reference angles reduce trigonometric evaluation to first-quadrant values while preserving correct signs.
  Contexts: mathematics
  Prereqs: `unit_circle_coordinates`

- **Trigonometric Functions on the Unit Circle** `spine_mathematics_l4_trig_unit_circle`
  Unit-circle definitions unify all six trig functions and reveal periodicity and symmetry properties.
  Contexts: mathematics
  Prereqs: `unit_circle_coordinates`

- **Trigonometric Periodicity** `spine_mathematics_l4_trigonometric_periodicity`
  Periodicity explains oscillatory behavior in models of waves, seasons, and circular motion.
  Contexts: mathematics
  Prereqs: `trig_unit_circle`

- **Unit Circle Coordinates** `spine_mathematics_l4_unit_circle_coordinates`
  The unit circle extends trigonometry beyond right triangles to all angles and provides the domain for periodic functions.
  Contexts: mathematics
  Prereqs: `arc_length_radian_measure`

---

## 35. Vector Fields

**L3:** `spine_mathematics_l3_vector_fields`

### L4
- **Curl of a Vector Field** `spine_mathematics_l4_curl`
  Curl identifies rotational components in fluid and electromagnetic fields.
  Contexts: mathematics
  Prereqs: `vector_field_definition`

- **Divergence of a Vector Field** `spine_mathematics_l4_divergence`
  Positive divergence indicates source behavior; negative divergence indicates sink behavior in fluid flow models.
  Contexts: mathematics
  Prereqs: `vector_field_definition`

- **Flow Lines and Streamlines** `spine_mathematics_l4_flow_lines`
  Flow lines visualize field direction and are used to interpret physical motion without solving full PDEs.
  Contexts: mathematics
  Prereqs: `vector_field_definition`

- **Gradient Fields and Potential Functions** `spine_mathematics_l4_gradient_fields`
  Gradient fields connect scalar potentials to vector fields and enable path-independent line integrals.
  Contexts: mathematics
  Prereqs: `vector_field_definition`
  _[reviewer note]_ Contains forward reference to existing L3 node — verify target exists in spine.

- **Vector Field Definition** `spine_mathematics_l4_vector_field_definition`
  Vector fields represent velocity flows, gravitational forces, and electromagnetic fields.
  Contexts: mathematics

---

## 36. Vectors in Two and Three Dimensions

**L3:** `spine_mathematics_l3_vectors_in_space`

### L4
- **Cross Product** `spine_mathematics_l4_cross_product`
  Cross products yield area of parallelograms, torque vectors, and surface normal directions.
  Contexts: mathematics
  Prereqs: `vector_components_magnitude`

- **Dot Product** `spine_mathematics_l4_dot_product`
  The dot product measures alignment of vectors, yields projections, and tests orthogonality when u · v = 0.
  Contexts: mathematics
  Prereqs: `vector_components_magnitude`

- **Equations of Lines and Planes** `spine_mathematics_l4_lines_and_planes`
  Line and plane equations are essential for intersection problems and multivariable optimization constraints.
  Contexts: mathematics
  Prereqs: `cross_product`

- **Three-Dimensional Coordinate System** `spine_mathematics_l4_three_dimensional_coordinates`
  The 3D coordinate system extends plane geometry to model spatial positions and vector components.
  Contexts: mathematics

- **Vector Components and Magnitude** `spine_mathematics_l4_vector_components_magnitude`
  Component form enables algebraic vector operations and connects geometry to linear algebra.
  Contexts: mathematics
  Prereqs: `three_dimensional_coordinates`

- **Vector Projections** `spine_mathematics_l4_vector_projections`
  Projections decompose forces and velocities into parallel and perpendicular components.
  Contexts: mathematics
  Prereqs: `dot_product`

---

## 37. Meningitis and Encephalitis

**L3:** `spine_medicine_clinical_l3_meningitis_and_encephalitis`

### L4
- **Bacterial Meningitis Empiric Antibiotic Therapy** `spine_medicine_clinical_l4_bacterial_meningitis_empiric_therapy`
  Delay in antibiotics worsens outcomes; blood cultures should not postpone treatment.
  Contexts: medicine_clinical
  Prereqs: `csf_interpretation`

#### L5 (under Bacterial Meningitis Empiric Antibiotic Therapy)
- **Neonatal and Elderly Meningitis Regimens** `spine_medicine_clinical_l5_age_specific_meningitis_antibiotics` · contexts: medicine_clinical
  Immunocompromised patients may need broader coverage including cryptococcus or TB.

- **Lumbar Puncture and CSF Interpretation** `spine_medicine_clinical_l4_csf_interpretation`
  Bacterial patterns show neutrophilic pleocytosis and low glucose; viral often lymphocytic.
  Contexts: medicine_clinical
  Prereqs: `meningitis_vs_encephalitis`

#### L5 (under Lumbar Puncture and CSF Interpretation)
- **CSF Findings: Bacterial vs Viral vs Fungal/TB** `spine_medicine_clinical_l5_csf_pattern_comparison` · contexts: medicine_clinical
  TB and fungal meningitis often present subacutely with lymphocytes and very low glucose.
- **Contraindications to Lumbar Puncture** `spine_medicine_clinical_l5_lp_contraindications` · contexts: medicine_clinical
  CT may be needed before LP when focal deficits or papilledema are present.

- **Meningitis vs Encephalitis Clinical Distinction** `spine_medicine_clinical_l4_meningitis_vs_encephalitis`
  Encephalitis may present with personality change and parenchymal findings on MRI.
  Contexts: medicine_clinical

- **Meningococcal Prophylaxis for Contacts** `spine_medicine_clinical_l4_meningococcal_prophylaxis`
  Prophylaxis targets nasopharyngeal carriage to prevent secondary cases.
  Contexts: medicine_clinical
  Prereqs: `bacterial_meningitis_empiric_therapy`

- **Viral Meningitis and HSV Encephalitis** `spine_medicine_clinical_l4_viral_cns_infection_management`
  Temporal lobe involvement and CSF PCR guide HSV therapy.
  Contexts: medicine_clinical
  Prereqs: `csf_interpretation`

---

## 38. Cardiac Physiology

**L3:** `spine_medicine_preclinical_l3_cardiac_physiology`

### L4
- **Cardiac Cycle Phases** `spine_medicine_preclinical_l4_cardiac_cycle_phases`
  Understanding the cardiac cycle links heart sounds, murmurs, and pressure tracings to mechanical events.
  Contexts: medicine_preclinical

#### L5 (under Cardiac Cycle Phases)
- **Murmur Timing in the Cardiac Cycle** `spine_medicine_preclinical_l5_murmur_timing_cardiac_cycle` · contexts: medicine_preclinical
  Timing narrows differential diagnosis before echocardiography.

- **Cardiac Output Determinants** `spine_medicine_preclinical_l4_cardiac_output_determinants`
  Sympathetic stimulation increases HR and contractility.
  Contexts: medicine_preclinical
  Prereqs: `frank_starling_mechanism`

#### L5 (under Cardiac Output Determinants)
- **Baroreceptor Reflex and Cardiac Output** `spine_medicine_preclinical_l5_baroreceptor_reflex_cardiac` · contexts: medicine_preclinical
  Hypotension triggers sympathetic increase in HR and contractility.

- **Frank-Starling Mechanism** `spine_medicine_preclinical_l4_frank_starling_mechanism`
  Greater stretch produces stronger contraction via optimal actin-myosin overlap.
  Contexts: medicine_preclinical
  Prereqs: `preload_afterload_concepts`

#### L5 (under Frank-Starling Mechanism)
- **Starling Curve in Heart Failure** `spine_medicine_preclinical_l5_starling_curve_failure` · contexts: medicine_preclinical
  Compensatory fluid retention initially supports preload but eventually worsens congestion without improving output.

- **Preload and Afterload** `spine_medicine_preclinical_l4_preload_afterload_concepts`
  Frank-Starling mechanism links preload to stroke volume.
  Contexts: medicine_preclinical
  Prereqs: `cardiac_cycle_phases`

---

## 39. Gas Exchange and Ventilation-Perfusion Matching

**L3:** `spine_medicine_preclinical_l3_gas_exchange_and_ventilation_perfusion`

### L4
- **Alveolar-Arterial (A-a) Oxygen Gradient** `spine_medicine_preclinical_l4_alveolar_arterial_gradient`
  A-a gradient = PAO2 − PaO2.
  Contexts: medicine_preclinical
  Prereqs: `shunt_vs_dead_space`

- **Alveolar Gas Exchange by Diffusion** `spine_medicine_preclinical_l4_alveolar_gas_exchange_diffusion`
  Diffusion is rapid due to large surface area and short diffusion distance.
  Contexts: medicine_preclinical

- **Dissolved vs Hemoglobin-Bound Oxygen** `spine_medicine_preclinical_l4_oxygen_dissolved_vs_bound`
  PaO2 reflects dissolved O2; pulse oximetry estimates SaO2.
  Contexts: medicine_preclinical
  Prereqs: `alveolar_gas_exchange_diffusion`

- **Shunt vs Dead Space Physiology** `spine_medicine_preclinical_l4_shunt_vs_dead_space`
  True shunt does not correct fully with supplemental O2.
  Contexts: medicine_preclinical
  Prereqs: `ventilation_perfusion_ratio`

#### L5 (under Shunt vs Dead Space Physiology)
- **Refractory Hypoxemia from Shunt** `spine_medicine_preclinical_l5_refractory_hypoxemia_shunt` · contexts: medicine_preclinical
  Shunt physiology explains refractory hypoxemia in ARDS and severe pneumonia.

- **Ventilation-Perfusion (V/Q) Ratio** `spine_medicine_preclinical_l4_ventilation_perfusion_ratio`
  V/Q mismatch is the most common cause of hypoxemia.
  Contexts: medicine_preclinical
  Prereqs: `alveolar_gas_exchange_diffusion`

#### L5 (under Ventilation-Perfusion (V/Q) Ratio)
- **Pulmonary Embolism V/Q Mismatch** `spine_medicine_preclinical_l5_pulmonary_embolism_vq` · contexts: medicine_preclinical
  Sudden dyspnea and hypoxemia with clear chest X-ray suggest PE.

---

## 40. Muscle Contraction

**L3:** `spine_medicine_preclinical_l3_muscle_contraction`

### L4
- **Excitation-Contraction Coupling** `spine_medicine_preclinical_l4_excitation_contraction_coupling`
  AP spreads along T-tubules; DHP receptors trigger RyR opening; Ca2+ floods cytosol initiating contraction.
  Contexts: medicine_preclinical
  Prereqs: `tropomyosin_troponin_regulation`

#### L5 (under Excitation-Contraction Coupling)
- **Malignant Hyperthermia (RyR1)** `spine_medicine_preclinical_l5_malignant_hyperthermia_ryr` · contexts: medicine_preclinical
  Treatment is dantrolene, which blocks RyR-mediated Ca2+ release.

- **Motor Unit Recruitment and Force Grading** `spine_medicine_preclinical_l4_motor_unit_recruitment`
  Recruitment and rate coding modulate tension.
  Contexts: medicine_preclinical
  Prereqs: `excitation_contraction_coupling`

#### L5 (under Motor Unit Recruitment and Force Grading)
- **Lambert-Eaton Myasthenic Syndrome** `spine_medicine_preclinical_l5_lambert_eaton_nm_junction` · contexts: medicine_preclinical
  LEMS associates with small cell lung cancer.

- **Sliding Filament Mechanism** `spine_medicine_preclinical_l4_sliding_filament_mechanism`
  Cross-bridge cycling involves myosin head attachment, power stroke, detachment, and re-cocking.
  Contexts: medicine_preclinical

#### L5 (under Sliding Filament Mechanism)
- **Rigor Mortis and ATP Depletion** `spine_medicine_preclinical_l5_rigor_mortis_atp_depletion` · contexts: medicine_preclinical
  Rigor mortis onset reflects ATP loss.

- **Tropomyosin-Troponin Calcium Regulation** `spine_medicine_preclinical_l4_tropomyosin_troponin_regulation`
  At rest, tropomyosin blocks actin sites.
  Contexts: medicine_preclinical
  Prereqs: `sliding_filament_mechanism`

---

## 41. Nutrient Absorption Physiology

**L3:** `spine_medicine_preclinical_l3_nutrient_absorption_physiology`

### L4
- **Carbohydrate Digestion and Absorption** `spine_medicine_preclinical_l4_carbohydrate_digestion_absorption`
  SGLT1 cotransports glucose and galactose with Na+.
  Contexts: medicine_preclinical

#### L5 (under Carbohydrate Digestion and Absorption)
- **Lactose Intolerance** `spine_medicine_preclinical_l5_lactose_intolerance` · contexts: medicine_preclinical
  Primary lactase non-persistence is common in adults.

- **Iron Absorption and Regulation** `spine_medicine_preclinical_l4_iron_absorption_regulation`
  Hepcidin blocks ferroportin in iron overload.
  Contexts: medicine_preclinical
  Prereqs: `vitamin_b12_intrinsic_factor`

- **Lipid Digestion and Absorption** `spine_medicine_preclinical_l4_lipid_digestion_absorption`
  Bile salts form micelles delivering lipid digestion products to enterocytes.
  Contexts: medicine_preclinical
  Prereqs: `protein_digestion_absorption`

#### L5 (under Lipid Digestion and Absorption)
- **Celiac Disease Malabsorption** `spine_medicine_preclinical_l5_celiac_malabsorption` · contexts: medicine_preclinical
  Anti-tTG antibodies are diagnostic.

- **Protein Digestion and Absorption** `spine_medicine_preclinical_l4_protein_digestion_absorption`
  Pepsin initiates in stomach; trypsin and chymotrypsin complete in duodenum.
  Contexts: medicine_preclinical
  Prereqs: `carbohydrate_digestion_absorption`

- **Vitamin B12 and Intrinsic Factor** `spine_medicine_preclinical_l4_vitamin_b12_intrinsic_factor`
  B12 deficiency causes megaloblastic anemia and neurologic deficits.
  Contexts: medicine_preclinical
  Prereqs: `lipid_digestion_absorption`

#### L5 (under Vitamin B12 and Intrinsic Factor)
- **Pernicious Anemia (Intrinsic Factor Deficiency)** `spine_medicine_preclinical_l5_pernicious_anemia_if` · contexts: medicine_preclinical
  Anti-parietal cell and anti-IF antibodies present.

---

## 42. Renal Filtration and GFR

**L3:** `spine_medicine_preclinical_l3_renal_filtration_and_gfr`

### L4
- **Renal Blood Flow and Filtration Fraction** `spine_medicine_preclinical_l4_filtration_fraction`
  Normal filtration fraction is about 20%.
  Contexts: medicine_preclinical
  Prereqs: `gfr_measurement_estimation`

- **Autoregulation of GFR (Myogenic and TGF)** `spine_medicine_preclinical_l4_gfr_autoregulation`
  Autoregulation protects GFR when blood pressure fluctuates within normal limits.
  Contexts: medicine_preclinical
  Prereqs: `filtration_fraction`

- **GFR Measurement and Estimation** `spine_medicine_preclinical_l4_gfr_measurement_estimation`
  Inulin clearance is the gold standard for GFR.
  Contexts: medicine_preclinical
  Prereqs: `glomerular_starling_forces`

#### L5 (under GFR Measurement and Estimation)
- **Creatinine Clearance Limitations** `spine_medicine_preclinical_l5_creatinine_clearance_caveats` · contexts: medicine_preclinical
  Creatinine is not a perfect GFR marker because it is secreted by tubules and produced proportionally to muscle mass.

- **Glomerular Filtration Barrier** `spine_medicine_preclinical_l4_glomerular_filtration_barrier`
  The filtration barrier determines what enters the glomerular filtrate.
  Contexts: medicine_preclinical

- **Starling Forces Across the Glomerulus** `spine_medicine_preclinical_l4_glomerular_starling_forces`
  Net filtration pressure is the sum of favoring and opposing forces across the capillary.
  Contexts: medicine_preclinical
  Prereqs: `glomerular_filtration_barrier`

#### L5 (under Starling Forces Across the Glomerulus)
- **Afferent vs Efferent Arteriolar Effects on GFR** `spine_medicine_preclinical_l5_afferent_efferent_gfr` · contexts: medicine_preclinical
  Afferent constriction lowers GFR; efferent constriction raises GFR initially by increasing glomerular pressure.
- **Net Filtration Pressure Equation** `spine_medicine_preclinical_l5_net_filtration_pressure` · contexts: medicine_preclinical
  Net filtration pressure = PGC − PBS − πGC.

---

## 43. Anxiety Disorders

**L3:** `spine_psychology_neuroscience_l3_anxiety_disorders`

### L4
- **Biopsychosocial Etiology of Anxiety** `spine_psychology_neuroscience_l4_anxiety_biopsychosocial_etiology`
  Amygdala and prefrontal regulation models connect biology to CBT targets.
  Contexts: psychology_neuroscience
  Prereqs: `generalized_anxiety_features`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Psychotherapy for Anxiety (CBT and Exposure)** `spine_psychology_neuroscience_l4_anxiety_cbt_exposure_therapy`
  CBT addresses maladaptive cognitions and behavioral avoidance.
  Contexts: medicine_clinical

- **First-Line Pharmacotherapy for Anxiety** `spine_psychology_neuroscience_l4_anxiety_first_line_pharmacotherapy`
  SSRIs and SNRIs are first-line for most chronic anxiety disorders.
  Contexts: medicine_clinical
  Prereqs: `generalized_anxiety_disorder`, `panic_disorder_agoraphobia`

#### L5 (under First-Line Pharmacotherapy for Anxiety)
- **Benzodiazepine Risks and Dependence** `spine_psychology_neuroscience_l5_benzodiazepine_risks_anxiety` · contexts: medicine_clinical
  Benzodiazepines are effective for acute anxiety but carry significant long-term risks.
- **SSRI Onset and Partial Response Management** `spine_psychology_neuroscience_l5_ssri_anxiety_titration` · contexts: medicine_clinical
  SSRIs require several weeks for full anxiolytic effect.

- **Evidence-Based Anxiety Treatment Overview** `spine_psychology_neuroscience_l4_anxiety_treatment_overview`
  Combined treatment often outperforms monotherapy for severe or chronic anxiety.
  Contexts: psychology_neuroscience
  Prereqs: `anxiety_biopsychosocial_etiology`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Generalized Anxiety Disorder Diagnosis** `spine_psychology_neuroscience_l4_generalized_anxiety_disorder`
  GAD is defined by persistent generalized worry rather than discrete panic episodes or specific phobic triggers.
  Contexts: medicine_clinical

- **Generalized Anxiety Features** `spine_psychology_neuroscience_l4_generalized_anxiety_features`
  GAD emphasizes chronic apprehension rather than discrete panic attacks.
  Contexts: psychology_neuroscience
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Panic Disorder and Agoraphobia** `spine_psychology_neuroscience_l4_panic_disorder_agoraphobia`
  Panic disorder centers on discrete surges of intense fear peaking within minutes.
  Contexts: medicine_clinical

#### L5 (under Panic Disorder and Agoraphobia)
- **Acute Panic Attack Management** `spine_psychology_neuroscience_l5_acute_panic_management` · contexts: medicine_clinical
  Acute management focuses on safety, reassurance, and exclusion of cardiac or metabolic mimics.

- **Panic, Phobic, and Social Anxiety Presentations** `spine_psychology_neuroscience_l4_panic_phobia_presentation`
  Avoidance maintains anxiety through negative reinforcement learning loops.
  Contexts: psychology_neuroscience
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Specific Phobia and Social Anxiety Disorder** `spine_psychology_neuroscience_l4_phobia_social_anxiety`
  Both disorders involve cue-triggered fear distinct from generalized worry.
  Contexts: medicine_clinical

---

## 44. Classical Conditioning

**L3:** `spine_psychology_neuroscience_l3_classical_conditioning`

### L4
- **Acquisition, Extinction, and Spontaneous Recovery** `spine_psychology_neuroscience_l4_acquisition_extinction_spontaneous_recovery`
  Extinction is new inhibitory learning, not erasure of original memory.
  Contexts: psychology_neuroscience
  Prereqs: `pavlovian_conditioning_paradigm`
  _[shared]_ Medicine preclinical behavioral science (patient adherence, aversive conditioning) is a domain context — not a separate L3.

- **Applications: Fear Learning and Drug Cues** `spine_psychology_neuroscience_l4_classical_conditioning_applications`
  Understanding CS pathways informs exposure-based therapies.
  Contexts: psychology_neuroscience
  Prereqs: `generalization_discrimination`
  _[shared]_ Medicine preclinical behavioral science (patient adherence, aversive conditioning) is a domain context — not a separate L3.

- **Stimulus Generalization and Discrimination** `spine_psychology_neuroscience_l4_generalization_discrimination`
  Discrimination training reduces fear overgeneralization seen in anxiety.
  Contexts: psychology_neuroscience
  Prereqs: `acquisition_extinction_spontaneous_recovery`
  _[shared]_ Medicine preclinical behavioral science (patient adherence, aversive conditioning) is a domain context — not a separate L3.

- **Pavlovian Conditioning Paradigm** `spine_psychology_neuroscience_l4_pavlovian_conditioning_paradigm`
  Temporal contiguity and predictiveness determine learning strength.
  Contexts: psychology_neuroscience
  _[shared]_ Medicine preclinical behavioral science (patient adherence, aversive conditioning) is a domain context — not a separate L3.

---

## 45. Eating Disorders

**L3:** `spine_psychology_neuroscience_l3_eating_disorders`

### L4
- **Anorexia Nervosa Features** `spine_psychology_neuroscience_l4_anorexia_nervosa_features`
  Restricting and binge-purge subtypes differ in behavioral phenotype.
  Contexts: psychology_neuroscience
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Binge Eating Disorder Features** `spine_psychology_neuroscience_l4_binge_eating_disorder_features`
  Marked distress distinguishes BED from occasional overeating.
  Contexts: psychology_neuroscience
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Bulimia Nervosa Features** `spine_psychology_neuroscience_l4_bulimia_nervosa_features`
  Self-evaluation overly tied to shape and weight.
  Contexts: psychology_neuroscience
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Medical Complications of Eating Disorders** `spine_psychology_neuroscience_l4_eating_disorder_medical_complications`
  Purging behaviors cause hypokalemia and arrhythmia risk.
  Contexts: medicine_clinical
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Pharmacotherapy Limits in Eating Disorders** `spine_psychology_neuroscience_l4_eating_disorder_pharmacotherapy_limits`
  Antidepressants treat comorbid mood disorders but do not cure core ED pathology.
  Contexts: medicine_clinical
  Prereqs: `eating_disorder_psychotherapy_medical`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Psychotherapy in Eating Disorder Care** `spine_psychology_neuroscience_l4_eating_disorder_psychotherapy_medical`
  Medical stability precedes intensive psychological work in severe anorexia.
  Contexts: medicine_clinical
  Prereqs: `hospitalization_refeeding_criteria`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Biopsychosocial Risk and Comorbidity** `spine_psychology_neuroscience_l4_eating_disorder_risk_factors`
  Perfectionism and trauma history elevate risk across diagnoses.
  Contexts: psychology_neuroscience
  Prereqs: `anorexia_nervosa_features`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Hospitalization and Refeeding Criteria** `spine_psychology_neuroscience_l4_hospitalization_refeeding_criteria`
  Refeeding syndrome risk mandates phased caloric restoration and monitoring.
  Contexts: medicine_clinical
  Prereqs: `eating_disorder_medical_complications`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

#### L5 (under Hospitalization and Refeeding Criteria)
- **Refeeding Syndrome Monitoring** `spine_psychology_neuroscience_l5_refeeding_syndrome_monitoring` · contexts: medicine_clinical
  Prophylactic supplementation and gradual calories reduce catastrophic refeeding complications.

---

## 46. Operant Conditioning

**L3:** `spine_psychology_neuroscience_l3_operant_conditioning`

### L4
- **Applications in Behavior Modification** `spine_psychology_neuroscience_l4_operant_applications_behavior_mod`
  Functional analysis identifies reinforcers maintaining maladaptive behavior.
  Contexts: psychology_neuroscience
  Prereqs: `shaping_chaining`
  _[shared]_ Medicine preclinical behavioral science (reinforcement in adherence) is a domain context — not a separate L3.

- **Reinforcement and Punishment** `spine_psychology_neuroscience_l4_reinforcement_punishment`
  Positive and negative reinforcement both strengthen behavior via different mechanisms.
  Contexts: psychology_neuroscience
  _[shared]_ Medicine preclinical behavioral science (reinforcement in adherence) is a domain context — not a separate L3.

- **Schedules of Reinforcement** `spine_psychology_neuroscience_l4_schedules_of_reinforcement`
  Variable ratio schedules generate high, persistent responding.
  Contexts: psychology_neuroscience
  Prereqs: `reinforcement_punishment`
  _[shared]_ Medicine preclinical behavioral science (reinforcement in adherence) is a domain context — not a separate L3.

- **Shaping and Behavior Chaining** `spine_psychology_neuroscience_l4_shaping_chaining`
  Token economies apply shaping in educational and clinical settings.
  Contexts: psychology_neuroscience
  Prereqs: `schedules_of_reinforcement`
  _[shared]_ Medicine preclinical behavioral science (reinforcement in adherence) is a domain context — not a separate L3.

---

## 47. Personality Disorders Overview

**L3:** `spine_psychology_neuroscience_l3_personality_disorders_overview`

### L4
- **Antisocial Traits and Legal/Forensic Interface** `spine_psychology_neuroscience_l4_antisocial_management_legal_interface`
  Low empathy and manipulation complicate therapeutic alliance.
  Contexts: medicine_clinical
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Antisocial and Narcissistic Personality Features** `spine_psychology_neuroscience_l4_antisocial_narcissistic_overview`
  Conduct history distinguishes antisocial patterns from situational aggression.
  Contexts: psychology_neuroscience
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Borderline Personality: DBT and Crisis Management** `spine_psychology_neuroscience_l4_borderline_dbt_management`
  Crisis planning reduces ED visits for impulsive self-injury.
  Contexts: medicine_clinical
  Prereqs: `personality_disorder_longitudinal_diagnosis`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

#### L5 (under Borderline Personality: DBT and Crisis Management)
- **Splitting and Countertransference in Care Teams** `spine_psychology_neuroscience_l5_splitting_countertransference` · contexts: medicine_clinical
  Team communication protocols mitigate splitting on inpatient units.

- **Borderline Personality Features** `spine_psychology_neuroscience_l4_borderline_personality_features`
  Invalidation and emotion dysregulation models inform DBT targets.
  Contexts: psychology_neuroscience
  Prereqs: `personality_disorder_clusters`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Dimensional Trait and Functioning Models** `spine_psychology_neuroscience_l4_dimensional_trait_models`
  Trait measures capture subclinical dysfunction and treatment change.
  Contexts: psychology_neuroscience
  Prereqs: `personality_disorder_clusters`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **DSM Personality Disorder Clusters** `spine_psychology_neuroscience_l4_personality_disorder_clusters`
  Clusters organize heterogeneity but dimensional models supplement categorical diagnosis.
  Contexts: psychology_neuroscience
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Longitudinal Personality Disorder Diagnosis** `spine_psychology_neuroscience_l4_personality_disorder_longitudinal_diagnosis`
  Personality change due to medical illness must be excluded.
  Contexts: medicine_clinical
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Pharmacotherapy Limits for Personality Disorders** `spine_psychology_neuroscience_l4_personality_disorder_pharmacotherapy_limits`
  Polypharmacy should be avoided without clear symptom targets.
  Contexts: medicine_clinical
  Prereqs: `borderline_dbt_management`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

---

## 48. Schizophrenia Spectrum Disorders

**L3:** `spine_psychology_neuroscience_l3_schizophrenia_spectrum`

### L4
- **Acute Psychosis Evaluation and Management** `spine_psychology_neuroscience_l4_acute_psychosis_management`
  Agitation may require IM agents while oral adherence is established.
  Contexts: medicine_clinical
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **First- vs Second-Generation Antipsychotics** `spine_psychology_neuroscience_l4_antipsychotic_generation_selection`
  Clozapine reserved for treatment-resistant cases with monitoring requirements.
  Contexts: medicine_clinical
  Prereqs: `acute_psychosis_management`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

#### L5 (under First- vs Second-Generation Antipsychotics)
- **Neuroleptic Malignant Syndrome** `spine_psychology_neuroscience_l5_neuroleptic_malignant_syndrome` · contexts: medicine_clinical
  Immediate cessation of antipsychotic and supportive care in ICU settings.

- **Long-Acting Injectable Antipsychotics** `spine_psychology_neuroscience_l4_long_acting_injectable_antipsychotics`
  Shared decision-making weighs injection burden against relapse prevention.
  Contexts: medicine_clinical
  Prereqs: `antipsychotic_generation_selection`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Negative and Cognitive Symptoms** `spine_psychology_neuroscience_l4_negative_cognitive_symptoms`
  Cognitive symptoms predict vocational outcomes more than positive features alone.
  Contexts: psychology_neuroscience
  Prereqs: `positive_symptoms_psychosis`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Negative Symptom and Functional Rehabilitation** `spine_psychology_neuroscience_l4_negative_symptom_psychosocial_care`
  Negative symptoms respond poorly to dopamine blockade alone.
  Contexts: medicine_clinical
  Prereqs: `antipsychotic_generation_selection`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Neurodevelopmental and Dopamine Models** `spine_psychology_neuroscience_l4_neurodevelopmental_dopamine_models`
  Stress-diathesis frameworks integrate genetic risk with environmental triggers.
  Contexts: psychology_neuroscience
  Prereqs: `negative_cognitive_symptoms`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Positive Symptoms and Psychosis** `spine_psychology_neuroscience_l4_positive_symptoms_psychosis`
  Positive symptoms often respond better to dopamine antagonism than negative symptoms.
  Contexts: psychology_neuroscience
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Antipsychotic and Psychosocial Treatment Overview** `spine_psychology_neuroscience_l4_schizophrenia_treatment_overview`
  Adherence and metabolic monitoring are long-term management challenges.
  Contexts: psychology_neuroscience
  Prereqs: `neurodevelopmental_dopamine_models`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

---

## 49. Substance Use Disorders

**L3:** `spine_psychology_neuroscience_l3_substance_use_disorders`

### L4
- **Behavioral Addictions Overview** `spine_psychology_neuroscience_l4_behavioral_addictions_overview`
  Behavioral addictions lack classic withdrawal but show impaired control patterns.
  Contexts: psychology_neuroscience
  Prereqs: `tolerance_withdrawal`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Motivational Interviewing in Substance Care** `spine_psychology_neuroscience_l4_motivational_interviewing_substance_care`
  MI complements contingency management and community supports.
  Contexts: medicine_clinical
  Prereqs: `opioid_use_disorder_mat`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Medication-Assisted Treatment for Opioid Use Disorder** `spine_psychology_neuroscience_l4_opioid_use_disorder_mat`
  Harm reduction including naloxone distribution is standard of care.
  Contexts: medicine_clinical
  Prereqs: `withdrawal_management_alcohol_benzo`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

#### L5 (under Medication-Assisted Treatment for Opioid Use Disorder)
- **Opioid Overdose and Naloxone Rescue** `spine_psychology_neuroscience_l5_opioid_overdose_naloxone` · contexts: medicine_clinical
  Repeat dosing may be needed with long-acting opioids.

- **Reward Pathways and Incentive Sensitization** `spine_psychology_neuroscience_l4_reward_pathways_addiction`
  Cue reactivity explains relapse vulnerability in conditioned environments.
  Contexts: psychology_neuroscience
  Prereqs: `sud_diagnostic_criteria`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Screening and Brief Intervention** `spine_psychology_neuroscience_l4_substance_screening_brief_intervention`
  SBIRT models identify risky use before dependence develops.
  Contexts: medicine_clinical
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Substance Use Disorder Diagnostic Criteria** `spine_psychology_neuroscience_l4_sud_diagnostic_criteria`
  Severity specifiers count criteria endorsed in the past year.
  Contexts: psychology_neuroscience
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Tolerance and Withdrawal** `spine_psychology_neuroscience_l4_tolerance_withdrawal`
  Withdrawal severity guides medical detoxification needs.
  Contexts: psychology_neuroscience
  Prereqs: `reward_pathways_addiction`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

- **Withdrawal Management: Alcohol and Benzodiazepines** `spine_psychology_neuroscience_l4_withdrawal_management_alcohol_benzo`
  Alcohol withdrawal can be fatal without medical monitoring.
  Contexts: medicine_clinical
  Prereqs: `substance_screening_brief_intervention`
  _[shared]_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).

---

