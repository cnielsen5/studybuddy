# Socrates L4/L5 — Merge & Consolidation Proposals (Master Review List)

Generated **308** proposals for human review. **Do not merge automatically.**

- Live scan: 180
- Migration carryover (not duplicated in scan): 128
- Universal concepts scanned: 418
- Anchors: 49

## Domain coverage (generation units)

| Domain | Units | Status |
|--------|-------|--------|
| biology | 10 | L4/L5 present for all units |
| chemistry | 4 | L4/L5 present for all units |
| mathematics | 22 | L4/L5 present for all units |
| medicine_clinical | 6 | L4/L5 present for all units |
| medicine_preclinical | 19 | L4/L5 present for all units |
| physics | 1 | L4/L5 present for all units |
| psychology_neuroscience | 13 | L4/L5 present for all units |

---

## Depth reconciled (confirm L4 vs L5) (3)

### spine_biology_l3_action_potential

- **Mixed L4/L5 across contexts; promoted to L4 during migration**
  - `spine_biology_l4_refractory_periods`
  - _Action:_ Confirm L4 vs L5 resolution for all member contexts
  - _Domains:_ biology, medicine_preclinical, psychology_neuroscience

### spine_biology_l3_synaptic_transmission

- **Mixed L4/L5 across contexts; promoted to L4 during migration**
  - `spine_biology_l4_synaptic_cleft_clearance`
  - _Action:_ Confirm L4 vs L5 resolution for all member contexts
  - _Domains:_ medicine_preclinical, psychology_neuroscience

### spine_mathematics_l3_exponential_decay

- **Mixed L4/L5 across contexts; promoted to L4 during migration**
  - `spine_mathematics_l4_half_life_decay_constant`
  - _Action:_ Confirm L4 vs L5 resolution for all member contexts
  - _Domains:_ chemistry, physics

---

## Shared concept notes (_shared_concept_note) (3)

### spine_chemistry_l3_nucleic_acid_structure

- **_shared_concept_note references spine_biology_l3_dna_structure_replication**
  - `spine_chemistry_l4_dna_double_helix_base_pairing`
  - `spine_biology_l3_dna_structure_replication`
  - _Action:_ Add domain context to existing node OR merge with target anchor concept OR add forward reference
  - _Note:_ Biology process of replication covered under spine_biology_l3_dna_structure_replication.

### spine_mathematics_l3_exponential_decay

- **_shared_concept_note references spine_chemistry_l3_integrated_rate_laws**
  - `spine_mathematics_l4_first_order_elimination_model`
  - `spine_chemistry_l3_integrated_rate_laws`
  - _Action:_ Add domain context to existing node OR merge with target anchor concept OR add forward reference
  - _Note:_ Mathematically identical to first-order reaction kinetics in chemistry (spine_chemistry_l3_integrated_rate_laws). Add chemistry domain context in consolidation pass.

- **_shared_concept_note references spine_mathematics_l3_exponential_decay**
  - `spine_mathematics_l4_first_order_reaction_model`
  - `spine_mathematics_l3_exponential_decay`
  - _Action:_ Add domain context to existing node OR merge with target anchor concept OR add forward reference
  - _Note:_ Mathematically identical to exponential decay (spine_mathematics_l3_exponential_decay) and first-order drug elimination in pharmacokinetics.

---

## Cross-anchor similarity (same domain) (90)

### spine_biology_l3_action_potential

- **Possible cross-anchor overlap in biology, medicine_preclinical (titleDice=0.47)**
  - `spine_biology_l4_action_potential_phases`
  - `spine_biology_l4_resting_membrane_potential`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ biology, medicine_preclinical

- **Possible cross-anchor overlap in medicine_preclinical (titleDice=0.47)**
  - `spine_biology_l5_saltatory_conduction`
  - `spine_mathematics_l4_elimination_rate_constant`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_preclinical

### spine_biology_l3_adaptive_immunity_overview

- **Possible cross-anchor overlap in medicine_preclinical (titleDice=0.46)**
  - `spine_biology_l4_clonal_selection_principle`
  - `spine_mathematics_l4_clearance_elimination_relationship`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_preclinical

- **Possible cross-anchor overlap in medicine_preclinical (titleDice=0.47)**
  - `spine_biology_l4_clonal_selection_principle`
  - `spine_medicine_preclinical_l5_creatinine_clearance_caveats`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_preclinical

- **Possible cross-anchor overlap in medicine_preclinical (titleDice=0.57)**
  - `spine_biology_l4_lymphocyte_activation`
  - `spine_biology_l4_complement_activation`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_preclinical

### spine_biology_l3_homeostasis_and_feedback

- **Possible cross-anchor overlap in medicine_preclinical (titleDice=0.46)**
  - `spine_biology_l4_set_point_compensation`
  - `spine_biology_l5_botulinum_tetanus_toxins`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_preclinical

### spine_biology_l3_hypersensitivity_reactions

- **Possible cross-anchor overlap in medicine_preclinical (titleDice=0.45)**
  - `spine_biology_l5_anaphylaxis_mediators`
  - `spine_biology_l5_complement_anaphylatoxins`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_preclinical

- **Possible cross-anchor overlap in medicine_preclinical (titleDice=0.45)**
  - `spine_biology_l5_serum_sickness_mechanism`
  - `spine_biology_l5_mrna_vaccine_mechanism`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_preclinical

### spine_biology_l3_innate_immunity

- **Possible cross-anchor overlap in biology (titleDice=0.45)**
  - `spine_biology_l4_pattern_recognition_receptors`
  - `spine_biology_l4_ionotropic_receptors`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ biology

- **Possible cross-anchor overlap in medicine_preclinical (titleDice=0.45)**
  - `spine_biology_l4_pattern_recognition_receptors`
  - `spine_biology_l5_nmda_ltp_coincidence`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_preclinical

### spine_biology_l3_membrane_potential

- **Possible cross-anchor overlap in medicine_preclinical (titleDice=0.54)**
  - `spine_biology_l4_ion_concentration_gradients`
  - `spine_medicine_preclinical_l4_excitation_contraction_coupling`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_preclinical

- **Possible cross-anchor overlap in biology, medicine_preclinical (titleDice=0.45)**
  - `spine_biology_l4_resting_membrane_potential`
  - `spine_biology_l4_postsynaptic_potentials`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ biology, medicine_preclinical

- **Possible cross-anchor overlap in medicine_preclinical (titleDice=0.48)**
  - `spine_biology_l5_hypokalemia_membrane_effects`
  - `spine_biology_l4_prokaryotic_cell_envelope`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_preclinical

### spine_biology_l3_synaptic_transmission

- **Possible cross-anchor overlap in medicine_preclinical (titleDice=0.48)**
  - `spine_biology_l5_botulinum_tetanus_toxins`
  - `spine_medicine_preclinical_l4_frank_starling_mechanism`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_preclinical

- **Possible cross-anchor overlap in medicine_preclinical (titleDice=0.45)**
  - `spine_biology_l5_ssri_serotonin_reuptake`
  - `spine_chemistry_l5_cyanide_complex_iv`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_preclinical

### spine_biology_l3_vaccination_principles

- **Possible cross-anchor overlap in medicine_preclinical (titleDice=0.47)**
  - `spine_biology_l4_active_immunization_principle`
  - `spine_mathematics_l4_dosing_interval_accumulation`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_preclinical

- **Possible cross-anchor overlap in medicine_preclinical (titleDice=0.45)**
  - `spine_biology_l5_mrna_vaccine_mechanism`
  - `spine_medicine_preclinical_l4_frank_starling_mechanism`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_preclinical

### spine_mathematics_l3_applications_of_derivatives

- **Possible cross-anchor overlap in mathematics (titleDice=0.47)**
  - `spine_mathematics_l4_critical_points_first_derivative`
  - `spine_mathematics_l4_exp_log_derivatives`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.46)**
  - `spine_mathematics_l4_critical_points_first_derivative`
  - `spine_mathematics_l4_partial_derivative_definition`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.53)**
  - `spine_mathematics_l4_mean_value_theorem`
  - `spine_mathematics_l4_net_change_theorem`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.63)**
  - `spine_mathematics_l4_mean_value_theorem`
  - `spine_mathematics_l4_intermediate_value_theorem`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.48)**
  - `spine_mathematics_l4_mean_value_theorem`
  - `spine_mathematics_l4_eigenvalue_method_systems`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

### spine_mathematics_l3_definite_integrals

- **Possible cross-anchor overlap in mathematics (titleDice=0.58)**
  - `spine_mathematics_l4_average_value_function`
  - `spine_mathematics_l4_functions_several_variables`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.47)**
  - `spine_mathematics_l4_definite_integral_definition`
  - `spine_mathematics_l4_partial_derivative_definition`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.49)**
  - `spine_mathematics_l4_definite_integral_definition`
  - `spine_mathematics_l4_vector_field_definition`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.49)**
  - `spine_mathematics_l4_definite_integral_properties`
  - `spine_mathematics_l4_logarithm_properties`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.48)**
  - `spine_mathematics_l4_riemann_sums`
  - `spine_mathematics_l4_volume_mass_applications`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.45)**
  - `spine_mathematics_l4_substitution_definite_integrals`
  - `spine_mathematics_l4_exponential_function_definition`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.48)**
  - `spine_mathematics_l4_substitution_definite_integrals`
  - `spine_mathematics_l4_iterated_integrals`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

### spine_mathematics_l3_derivatives

- **Possible cross-anchor overlap in mathematics (titleDice=0.55)**
  - `spine_mathematics_l4_chain_rule`
  - `spine_mathematics_l4_multivariable_chain_rule`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.54)**
  - `spine_mathematics_l4_exp_log_derivatives`
  - `spine_mathematics_l4_exponential_function_definition`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.48)**
  - `spine_mathematics_l4_exp_log_derivatives`
  - `spine_mathematics_l4_exponential_transformations`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.58)**
  - `spine_mathematics_l4_exp_log_derivatives`
  - `spine_mathematics_l4_logarithm_as_inverse`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.67)**
  - `spine_mathematics_l4_exp_log_derivatives`
  - `spine_mathematics_l4_logarithmic_equations`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.50)**
  - `spine_mathematics_l4_exp_log_derivatives`
  - `spine_mathematics_l4_functions_several_variables`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.47)**
  - `spine_mathematics_l4_exp_log_derivatives`
  - `spine_mathematics_l4_partial_derivative_definition`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.45)**
  - `spine_mathematics_l4_product_quotient_rules`
  - `spine_mathematics_l4_dot_product`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

### spine_mathematics_l3_descriptive_statistics

- **Possible cross-anchor overlap in mathematics (titleDice=0.50)**
  - `spine_mathematics_l4_data_visualization`
  - `spine_mathematics_l4_diagonalization_concept`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.47)**
  - `spine_mathematics_l4_data_visualization`
  - `spine_mathematics_l4_direction_fields`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.50)**
  - `spine_mathematics_l4_distribution_shape`
  - `spine_mathematics_l4_test_statistics`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.54)**
  - `spine_mathematics_l4_outliers_robust_statistics`
  - `spine_mathematics_l4_test_statistics`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

### spine_mathematics_l3_eigenvalues_and_eigenvectors

- **Possible cross-anchor overlap in mathematics (titleDice=0.59)**
  - `spine_mathematics_l4_characteristic_polynomial`
  - `spine_mathematics_l4_characteristic_equation`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.47)**
  - `spine_mathematics_l4_eigenvector_definition`
  - `spine_mathematics_l4_partial_derivative_definition`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.53)**
  - `spine_mathematics_l4_eigenvector_definition`
  - `spine_mathematics_l4_vector_field_definition`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.45)**
  - `spine_mathematics_l4_finding_eigenvectors`
  - `spine_mathematics_l4_gradient_vector`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.45)**
  - `spine_mathematics_l4_geometric_interpretation_eigen`
  - `spine_mathematics_l5_interpreting_p_values`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.56)**
  - `spine_mathematics_l4_geometric_interpretation_eigen`
  - `spine_mathematics_l5_p_value_misinterpretations`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

### spine_mathematics_l3_exponential_decay

- **Possible cross-anchor overlap in medicine_preclinical (titleDice=0.70)**
  - `spine_mathematics_l4_clearance_elimination_relationship`
  - `spine_medicine_preclinical_l5_creatinine_clearance_caveats`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_preclinical

- **Possible cross-anchor overlap in mathematics (titleDice=0.47)**
  - `spine_mathematics_l4_decay_vs_growth_comparison`
  - `spine_mathematics_l4_logarithmic_equations`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in medicine_preclinical (titleDice=0.57)**
  - `spine_mathematics_l4_elimination_rate_constant`
  - `spine_medicine_preclinical_l5_creatinine_clearance_caveats`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_preclinical

- **Possible cross-anchor overlap in mathematics (titleDice=0.64)**
  - `spine_mathematics_l4_solving_decay_problems`
  - `spine_mathematics_l4_exponential_equations`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.54)**
  - `spine_mathematics_l4_solving_decay_problems`
  - `spine_mathematics_l4_logarithmic_equations`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.49)**
  - `spine_mathematics_l4_solving_decay_problems`
  - `spine_mathematics_l4_initial_value_problems_separable`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

### spine_mathematics_l3_exponential_functions

- **Possible cross-anchor overlap in mathematics (titleDice=0.76)**
  - `spine_mathematics_l4_exponential_equations`
  - `spine_mathematics_l4_logarithmic_equations`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.49)**
  - `spine_mathematics_l4_exponential_function_definition`
  - `spine_mathematics_l4_limit_definition`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.47)**
  - `spine_mathematics_l4_exponential_function_definition`
  - `spine_mathematics_l4_logarithmic_equations`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.54)**
  - `spine_mathematics_l4_exponential_function_definition`
  - `spine_mathematics_l4_gradient_fields`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.47)**
  - `spine_mathematics_l4_exponential_transformations`
  - `spine_mathematics_l4_logarithmic_equations`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.57)**
  - `spine_mathematics_l4_exponential_transformations`
  - `spine_mathematics_l4_logarithmic_graphs`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.45)**
  - `spine_mathematics_l4_natural_base_e`
  - `spine_mathematics_l4_natural_logarithm`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

### spine_mathematics_l3_first_order_odes

- **Possible cross-anchor overlap in mathematics (titleDice=0.50)**
  - `spine_mathematics_l4_integrating_factor_method`
  - `spine_mathematics_l4_vector_line_integrals`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.50)**
  - `spine_mathematics_l4_linear_first_order_odes`
  - `spine_mathematics_l4_second_order_linear_classification`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.77)**
  - `spine_mathematics_l4_ode_classification`
  - `spine_mathematics_l4_second_order_linear_classification`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.46)**
  - `spine_mathematics_l4_ode_classification`
  - `spine_mathematics_l4_stability_classification`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

### spine_mathematics_l3_hypothesis_testing

- **Possible cross-anchor overlap in mathematics (titleDice=0.46)**
  - `spine_mathematics_l5_p_value_misinterpretations`
  - `spine_mathematics_l4_intermediate_value_theorem`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

### spine_mathematics_l3_limits_and_continuity

- **Possible cross-anchor overlap in mathematics (titleDice=0.54)**
  - `spine_mathematics_l4_intermediate_value_theorem`
  - `spine_mathematics_l4_iterated_integrals`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

### spine_mathematics_l3_line_integrals

- **Possible cross-anchor overlap in mathematics (titleDice=0.45)**
  - `spine_mathematics_l4_path_independence`
  - `spine_mathematics_l4_partial_derivative_definition`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.48)**
  - `spine_mathematics_l4_scalar_line_integrals`
  - `spine_mathematics_l4_polar_coordinates_integration`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.56)**
  - `spine_mathematics_l4_scalar_line_integrals`
  - `spine_mathematics_l4_triple_integrals`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.52)**
  - `spine_mathematics_l4_vector_line_integrals`
  - `spine_mathematics_l4_double_integrals_rectangles`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.56)**
  - `spine_mathematics_l4_vector_line_integrals`
  - `spine_mathematics_l4_triple_integrals`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.52)**
  - `spine_mathematics_l4_vector_line_integrals`
  - `spine_mathematics_l4_gradient_vector`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

### spine_mathematics_l3_multiple_integrals

- **Possible cross-anchor overlap in mathematics (titleDice=0.46)**
  - `spine_mathematics_l4_polar_coordinates_integration`
  - `spine_mathematics_l4_unit_circle_coordinates`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.53)**
  - `spine_mathematics_l4_volume_mass_applications`
  - `spine_mathematics_l4_growth_decay_applications`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

### spine_mathematics_l3_partial_derivatives

- **Possible cross-anchor overlap in mathematics (titleDice=0.51)**
  - `spine_mathematics_l4_functions_several_variables`
  - `spine_mathematics_l4_separation_of_variables_procedure`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

- **Possible cross-anchor overlap in mathematics (titleDice=0.48)**
  - `spine_mathematics_l4_partial_derivative_definition`
  - `spine_mathematics_l4_vector_field_definition`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

### spine_mathematics_l3_separable_differential_equations

- **Possible cross-anchor overlap in mathematics (titleDice=0.54)**
  - `spine_mathematics_l4_equilibrium_solutions`
  - `spine_mathematics_l4_stability_classification`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ mathematics

### spine_medicine_preclinical_l3_cardiac_physiology

- **Possible cross-anchor overlap in medicine_preclinical (titleDice=0.50)**
  - `spine_medicine_preclinical_l4_frank_starling_mechanism`
  - `spine_medicine_preclinical_l4_sliding_filament_mechanism`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_preclinical

### spine_psychology_neuroscience_l3_anxiety_disorders

- **Possible cross-anchor overlap in psychology_neuroscience (titleDice=0.51)**
  - `spine_psychology_neuroscience_l4_anxiety_biopsychosocial_etiology`
  - `spine_psychology_neuroscience_l4_eating_disorder_risk_factors`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ psychology_neuroscience

- **Possible cross-anchor overlap in medicine_clinical (titleDice=0.54)**
  - `spine_psychology_neuroscience_l4_anxiety_first_line_pharmacotherapy`
  - `spine_psychology_neuroscience_l4_eating_disorder_pharmacotherapy_limits`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_clinical

- **Possible cross-anchor overlap in medicine_clinical (titleDice=0.50)**
  - `spine_psychology_neuroscience_l4_anxiety_first_line_pharmacotherapy`
  - `spine_psychology_neuroscience_l4_personality_disorder_pharmacotherapy_limits`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_clinical

- **Possible cross-anchor overlap in medicine_clinical (titleDice=0.47)**
  - `spine_psychology_neuroscience_l4_generalized_anxiety_disorder`
  - `spine_psychology_neuroscience_l4_borderline_dbt_management`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_clinical

- **Possible cross-anchor overlap in medicine_clinical (titleDice=0.58)**
  - `spine_psychology_neuroscience_l4_generalized_anxiety_disorder`
  - `spine_psychology_neuroscience_l4_personality_disorder_longitudinal_diagnosis`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_clinical

- **Possible cross-anchor overlap in psychology_neuroscience (titleDice=0.47)**
  - `spine_psychology_neuroscience_l4_generalized_anxiety_features`
  - `spine_psychology_neuroscience_l4_anorexia_nervosa_features`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ psychology_neuroscience

- **Possible cross-anchor overlap in psychology_neuroscience (titleDice=0.48)**
  - `spine_psychology_neuroscience_l4_generalized_anxiety_features`
  - `spine_psychology_neuroscience_l4_bulimia_nervosa_features`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ psychology_neuroscience

- **Possible cross-anchor overlap in psychology_neuroscience (titleDice=0.49)**
  - `spine_psychology_neuroscience_l4_generalized_anxiety_features`
  - `spine_psychology_neuroscience_l4_borderline_personality_features`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ psychology_neuroscience

- **Possible cross-anchor overlap in medicine_clinical (titleDice=0.52)**
  - `spine_psychology_neuroscience_l5_acute_panic_management`
  - `spine_psychology_neuroscience_l4_acute_psychosis_management`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_clinical

### spine_psychology_neuroscience_l3_eating_disorders

- **Possible cross-anchor overlap in psychology_neuroscience (titleDice=0.48)**
  - `spine_psychology_neuroscience_l4_binge_eating_disorder_features`
  - `spine_psychology_neuroscience_l4_borderline_personality_features`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ psychology_neuroscience

- **Possible cross-anchor overlap in medicine_clinical (titleDice=0.70)**
  - `spine_psychology_neuroscience_l4_eating_disorder_pharmacotherapy_limits`
  - `spine_psychology_neuroscience_l4_personality_disorder_pharmacotherapy_limits`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_clinical

- **Possible cross-anchor overlap in medicine_clinical (titleDice=0.45)**
  - `spine_psychology_neuroscience_l4_hospitalization_refeeding_criteria`
  - `spine_psychology_neuroscience_l4_substance_screening_brief_intervention`
  - _Action:_ Review for consolidation or shared-context addition
  - _Domains:_ medicine_clinical

---

## Shared concept flags (context addition needed) (84)

### spine_biology_l3_action_potential

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_action_potential_phases`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Also used in psychology_neuroscience (neural signaling) and medicine_preclinical (cardiac/neural electrophysiology).
  - _Domains:_ biology, medicine_preclinical, psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_action_potential_threshold`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Also used in psychology_neuroscience (neural signaling) and medicine_preclinical (cardiac/neural electrophysiology).
  - _Domains:_ biology, medicine_preclinical, psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_axonal_propagation`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Also used in psychology_neuroscience (neural signaling) and medicine_preclinical (cardiac/neural electrophysiology).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_refractory_periods`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Also used in psychology_neuroscience (neural signaling) and medicine_preclinical (cardiac/neural electrophysiology).
  - _Domains:_ biology, medicine_preclinical, psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_voltage_gated_ion_channels`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Also used in psychology_neuroscience (neural signaling) and medicine_preclinical (cardiac/neural electrophysiology).
  - _Domains:_ biology, medicine_preclinical, psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l5_saltatory_conduction`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Also used in psychology_neuroscience (neural signaling) and medicine_preclinical (cardiac/neural electrophysiology).
  - _Domains:_ medicine_preclinical, psychology_neuroscience

### spine_biology_l3_membrane_potential

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_equilibrium_vs_steady_state`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged resting_membrane_potential (psych), cell_membrane_resting_potential (medicine_preclinical neuronal), and general excitable-tissue potential. Cardiac membrane potential remains a separate med node (B2).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_goldman_hodgkin_katz_equation`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged resting_membrane_potential (psych), cell_membrane_resting_potential (medicine_preclinical neuronal), and general excitable-tissue potential. Cardiac membrane potential remains a separate med node (B2).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_ion_concentration_gradients`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged resting_membrane_potential (psych), cell_membrane_resting_potential (medicine_preclinical neuronal), and general excitable-tissue potential. Cardiac membrane potential remains a separate med node (B2).
  - _Domains:_ biology, medicine_preclinical, psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_nernst_equilibrium_potential`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged resting_membrane_potential (psych), cell_membrane_resting_potential (medicine_preclinical neuronal), and general excitable-tissue potential. Cardiac membrane potential remains a separate med node (B2).
  - _Domains:_ medicine_preclinical, psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_sodium_potassium_pump`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged resting_membrane_potential (psych), cell_membrane_resting_potential (medicine_preclinical neuronal), and general excitable-tissue potential. Cardiac membrane potential remains a separate med node (B2).
  - _Domains:_ biology, psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l5_baseline_potential_shifts`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged resting_membrane_potential (psych), cell_membrane_resting_potential (medicine_preclinical neuronal), and general excitable-tissue potential. Cardiac membrane potential remains a separate med node (B2).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l5_gkh_potassium_dominance`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged resting_membrane_potential (psych), cell_membrane_resting_potential (medicine_preclinical neuronal), and general excitable-tissue potential. Cardiac membrane potential remains a separate med node (B2).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l5_nernst_calculation`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged resting_membrane_potential (psych), cell_membrane_resting_potential (medicine_preclinical neuronal), and general excitable-tissue potential. Cardiac membrane potential remains a separate med node (B2).
  - _Domains:_ psychology_neuroscience

### spine_biology_l3_neurotransmitters_and_receptors

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_major_neurotransmitter_systems`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged neurotransmitters_and_receptors (psychology_neuroscience and medicine_preclinical).
  - _Domains:_ biology, psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_neurotransmitter_clearance_reuptake`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged neurotransmitters_and_receptors (psychology_neuroscience and medicine_preclinical).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_neurotransmitter_synthesis_release`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged neurotransmitters_and_receptors (psychology_neuroscience and medicine_preclinical).
  - _Domains:_ biology, medicine_preclinical, psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_receptor_types_ionotropic_metabotropic`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged neurotransmitters_and_receptors (psychology_neuroscience and medicine_preclinical).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l5_dopamine_pathways_overview`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged neurotransmitters_and_receptors (psychology_neuroscience and medicine_preclinical).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l5_ionotropic_receptor_kinetics`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged neurotransmitters_and_receptors (psychology_neuroscience and medicine_preclinical).
  - _Domains:_ psychology_neuroscience

### spine_biology_l3_synaptic_transmission

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_calcium_triggered_vesicle_release`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged synapse_structure (biology), synaptic_transmission (psych), synaptic_transmission_physiology (medicine_preclinical).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_chemical_synapse_structure`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged synapse_structure (biology), synaptic_transmission (psych), synaptic_transmission_physiology (medicine_preclinical).
  - _Domains:_ biology, psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_postsynaptic_potentials`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged synapse_structure (biology), synaptic_transmission (psych), synaptic_transmission_physiology (medicine_preclinical).
  - _Domains:_ biology, medicine_preclinical, psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_short_term_synaptic_plasticity`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged synapse_structure (biology), synaptic_transmission (psych), synaptic_transmission_physiology (medicine_preclinical).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_synaptic_cleft_clearance`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged synapse_structure (biology), synaptic_transmission (psych), synaptic_transmission_physiology (medicine_preclinical).
  - _Domains:_ medicine_preclinical, psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_biology_l4_synaptic_integration_shunting`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged synapse_structure (biology), synaptic_transmission (psych), synaptic_transmission_physiology (medicine_preclinical).
  - _Domains:_ psychology_neuroscience

### spine_mathematics_l3_descriptive_statistics

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_mathematics_l4_correlation_descriptive_association`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged descriptive_statistics (mathematics and psychology_neuroscience research methods).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_mathematics_l4_distribution_shape_normality`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged descriptive_statistics (mathematics and psychology_neuroscience research methods).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_mathematics_l4_measures_central_tendency`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged descriptive_statistics (mathematics and psychology_neuroscience research methods).
  - _Domains:_ mathematics, psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_mathematics_l4_variability_standard_deviation`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged descriptive_statistics (mathematics and psychology_neuroscience research methods).
  - _Domains:_ psychology_neuroscience

### spine_mathematics_l3_exponential_decay

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_mathematics_l4_elimination_rate_constant`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Mathematically equivalent to decay constant λ in physics and rate constant k in first-order chemical reactions.
  - _Domains:_ medicine_preclinical

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_mathematics_l4_exponential_decay_model`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Also used in chemistry (first-order kinetics), medicine_preclinical (drug elimination), physics (radioactive decay).
  - _Domains:_ mathematics

### spine_mathematics_l3_hypothesis_testing

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_mathematics_l4_null_alternative_hypotheses`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged hypothesis_testing (mathematics) and inferential_statistics_hypothesis_testing (psychology_neuroscience).
  - _Domains:_ mathematics, psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_mathematics_l4_p_values_significance`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged hypothesis_testing (mathematics) and inferential_statistics_hypothesis_testing (psychology_neuroscience).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_mathematics_l4_parametric_nonparametric_overview`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged hypothesis_testing (mathematics) and inferential_statistics_hypothesis_testing (psychology_neuroscience).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_mathematics_l4_type_i_ii_errors_power`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Merged hypothesis_testing (mathematics) and inferential_statistics_hypothesis_testing (psychology_neuroscience).
  - _Domains:_ psychology_neuroscience

### spine_psychology_neuroscience_l3_anxiety_disorders

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_anxiety_biopsychosocial_etiology`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_anxiety_treatment_overview`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_generalized_anxiety_features`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_panic_phobia_presentation`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

### spine_psychology_neuroscience_l3_classical_conditioning

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_acquisition_extinction_spontaneous_recovery`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Medicine preclinical behavioral science (patient adherence, aversive conditioning) is a domain context — not a separate L3.
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_classical_conditioning_applications`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Medicine preclinical behavioral science (patient adherence, aversive conditioning) is a domain context — not a separate L3.
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_generalization_discrimination`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Medicine preclinical behavioral science (patient adherence, aversive conditioning) is a domain context — not a separate L3.
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_pavlovian_conditioning_paradigm`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Medicine preclinical behavioral science (patient adherence, aversive conditioning) is a domain context — not a separate L3.
  - _Domains:_ psychology_neuroscience

### spine_psychology_neuroscience_l3_eating_disorders

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_anorexia_nervosa_features`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_binge_eating_disorder_features`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_bulimia_nervosa_features`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_eating_disorder_medical_complications`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_eating_disorder_pharmacotherapy_limits`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_eating_disorder_psychotherapy_medical`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_eating_disorder_risk_factors`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_hospitalization_refeeding_criteria`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l5_refeeding_syndrome_monitoring`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

### spine_psychology_neuroscience_l3_operant_conditioning

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_operant_applications_behavior_mod`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Medicine preclinical behavioral science (reinforcement in adherence) is a domain context — not a separate L3.
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_reinforcement_punishment`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Medicine preclinical behavioral science (reinforcement in adherence) is a domain context — not a separate L3.
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_schedules_of_reinforcement`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Medicine preclinical behavioral science (reinforcement in adherence) is a domain context — not a separate L3.
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_shaping_chaining`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Medicine preclinical behavioral science (reinforcement in adherence) is a domain context — not a separate L3.
  - _Domains:_ psychology_neuroscience

### spine_psychology_neuroscience_l3_personality_disorders_overview

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_antisocial_management_legal_interface`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_antisocial_narcissistic_overview`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_borderline_dbt_management`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_borderline_personality_features`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_dimensional_trait_models`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_personality_disorder_clusters`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_personality_disorder_longitudinal_diagnosis`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_personality_disorder_pharmacotherapy_limits`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l5_splitting_countertransference`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

### spine_psychology_neuroscience_l3_schizophrenia_spectrum

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_acute_psychosis_management`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_antipsychotic_generation_selection`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_long_acting_injectable_antipsychotics`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_negative_cognitive_symptoms`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_negative_symptom_psychosocial_care`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_neurodevelopmental_dopamine_models`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_positive_symptoms_psychosis`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_schizophrenia_treatment_overview`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l5_neuroleptic_malignant_syndrome`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

### spine_psychology_neuroscience_l3_substance_use_disorders

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_behavioral_addictions_overview`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_motivational_interviewing_substance_care`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_opioid_use_disorder_mat`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_reward_pathways_addiction`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_substance_screening_brief_intervention`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_sud_diagnostic_criteria`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_tolerance_withdrawal`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ psychology_neuroscience

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l4_withdrawal_management_alcohol_benzo`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

- **Concept flagged as shared across domains (no explicit spine id in note)**
  - `spine_psychology_neuroscience_l5_opioid_overdose_naloxone`
  - _Action:_ Review _shared_concept_note and add domain_contexts[] to this node or link via forward reference
  - _Note:_ Psychopathology classification owned by psychology_neuroscience; medicine_clinical adds management framing (merged duplicate clinical L3).
  - _Domains:_ medicine_clinical

---

## Migration pass (below auto-merge threshold) (128)

### spine_biology_l3_action_potential

- **possible duplicate (titleDice=0.46, defDice=0.46)**
  - `spine_biology_l4_action_potential_phases`
  - `spine_medicine_preclinical_l4_cardiac_ap_ventricular`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.50, defDice=0.55)**
  - `spine_biology_l4_signal_propagation`
  - `spine_psychology_neuroscience_l4_axonal_propagation`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.61, defDice=0.44)**
  - `spine_biology_l4_signal_propagation`
  - `spine_psychology_neuroscience_l5_saltatory_conduction`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.61, defDice=0.71)**
  - `spine_biology_l4_signal_propagation`
  - `spine_medicine_preclinical_l5_saltatory_conduction`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.47, defDice=0.51)**
  - `spine_psychology_neuroscience_l4_axonal_propagation`
  - `spine_medicine_preclinical_l5_saltatory_conduction`
  - _Action:_ Review from migration pass — merge or keep separate

### spine_biology_l3_adaptive_immunity_overview

- **possible duplicate (titleDice=0.56, defDice=0.59)**
  - `spine_biology_l4_clonal_selection`
  - `spine_medicine_preclinical_l4_clonal_selection_principle`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.49, defDice=0.42)**
  - `spine_biology_l4_primary_secondary_response`
  - `spine_medicine_preclinical_l5_secondary_response_igm_igg_switch`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.47, defDice=0.45)**
  - `spine_biology_l4_immunological_memory`
  - `spine_medicine_preclinical_l4_humoral_vs_cell_mediated_immunity`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.61, defDice=0.63)**
  - `spine_biology_l4_immunological_memory`
  - `spine_medicine_preclinical_l4_immunologic_memory_mechanisms`
  - _Action:_ Review from migration pass — merge or keep separate

### spine_biology_l3_autoimmunity

- **possible duplicate (titleDice=0.70, defDice=0.65)**
  - `spine_biology_l4_central_tolerance`
  - `spine_medicine_preclinical_l4_central_peripheral_tolerance`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.78, defDice=0.61)**
  - `spine_biology_l4_peripheral_tolerance`
  - `spine_medicine_preclinical_l4_central_peripheral_tolerance`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.61, defDice=0.55)**
  - `spine_biology_l4_molecular_mimicry`
  - `spine_medicine_preclinical_l4_epitope_spreading`
  - _Action:_ Review from migration pass — merge or keep separate

### spine_biology_l3_hypersensitivity_reactions

- **possible duplicate (titleDice=0.58, defDice=0.48)**
  - `spine_biology_l4_hypersensitivity_type_i`
  - `spine_medicine_preclinical_l4_type_ii_cytotoxic_antibody`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.61, defDice=0.44)**
  - `spine_biology_l4_hypersensitivity_type_i`
  - `spine_medicine_preclinical_l4_type_iii_immune_complex`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.63, defDice=0.42)**
  - `spine_biology_l4_hypersensitivity_type_i`
  - `spine_medicine_preclinical_l4_type_iv_delayed_tcell`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.47, defDice=0.54)**
  - `spine_biology_l4_hypersensitivity_type_ii`
  - `spine_medicine_preclinical_l4_type_i_ige_immediate`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.62, defDice=0.70)**
  - `spine_biology_l4_hypersensitivity_type_ii`
  - `spine_medicine_preclinical_l4_type_ii_cytotoxic_antibody`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.66, defDice=0.74)**
  - `spine_biology_l4_hypersensitivity_type_iii`
  - `spine_medicine_preclinical_l4_type_iii_immune_complex`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.53, defDice=0.42)**
  - `spine_biology_l4_hypersensitivity_type_iv`
  - `spine_medicine_preclinical_l4_type_ii_cytotoxic_antibody`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.55, defDice=0.45)**
  - `spine_biology_l4_hypersensitivity_type_iv`
  - `spine_medicine_preclinical_l4_type_iii_immune_complex`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.75, defDice=0.54)**
  - `spine_biology_l4_hypersensitivity_type_iv`
  - `spine_medicine_preclinical_l4_type_iv_delayed_tcell`
  - _Action:_ Review from migration pass — merge or keep separate

- **auto-merge skipped (same-domain collision, score=0.83)**
  - `spine_biology_l4_hypersensitivity_type_iv`
  - `spine_medicine_preclinical_l4_type_i_ige_immediate`
  - _Action:_ Review from migration pass — merge or keep separate

### spine_biology_l3_innate_immunity

- **possible duplicate (titleDice=0.75, defDice=0.69)**
  - `spine_biology_l4_complement_system`
  - `spine_medicine_preclinical_l4_complement_activation`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.58, defDice=0.56)**
  - `spine_biology_l4_inflammatory_response`
  - `spine_medicine_preclinical_l4_inflammatory_mediators_innate`
  - _Action:_ Review from migration pass — merge or keep separate

### spine_biology_l3_membrane_potential

- **possible duplicate (titleDice=0.54, defDice=0.29)**
  - `spine_biology_l4_selective_permeability`
  - `spine_psychology_neuroscience_l5_gkh_potassium_dominance`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.32, defDice=0.63)**
  - `spine_biology_l4_sodium_potassium_pump`
  - `spine_medicine_preclinical_l4_na_k_atpase_role`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.49, defDice=0.48)**
  - `spine_biology_l4_resting_membrane_potential`
  - `spine_medicine_preclinical_l4_na_k_atpase_role`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.46, defDice=0.47)**
  - `spine_biology_l4_resting_membrane_potential`
  - `spine_medicine_preclinical_l4_nernst_equilibrium_potential`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.46, defDice=0.30)**
  - `spine_biology_l4_resting_membrane_potential`
  - `spine_psychology_neuroscience_l4_nernst_equilibrium_potential`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.54, defDice=0.35)**
  - `spine_biology_l4_resting_membrane_potential`
  - `spine_psychology_neuroscience_l4_goldman_hodgkin_katz_equation`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.54, defDice=0.40)**
  - `spine_biology_l4_resting_membrane_potential`
  - `spine_psychology_neuroscience_l4_equilibrium_vs_steady_state`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.52, defDice=0.72)**
  - `spine_biology_l4_electrochemical_gradient`
  - `spine_medicine_preclinical_l4_electrochemical_driving_force`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.56, defDice=0.33)**
  - `spine_medicine_preclinical_l4_na_k_atpase_role`
  - `spine_psychology_neuroscience_l4_goldman_hodgkin_katz_equation`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.56, defDice=0.44)**
  - `spine_medicine_preclinical_l4_na_k_atpase_role`
  - `spine_psychology_neuroscience_l4_sodium_potassium_pump`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.65, defDice=0.28)**
  - `spine_medicine_preclinical_l4_nernst_equilibrium_potential`
  - `spine_psychology_neuroscience_l4_equilibrium_vs_steady_state`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.46, defDice=0.28)**
  - `spine_medicine_preclinical_l4_resting_membrane_potential`
  - `spine_psychology_neuroscience_l4_nernst_equilibrium_potential`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.54, defDice=0.35)**
  - `spine_medicine_preclinical_l4_resting_membrane_potential`
  - `spine_psychology_neuroscience_l4_goldman_hodgkin_katz_equation`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.54, defDice=0.39)**
  - `spine_medicine_preclinical_l4_resting_membrane_potential`
  - `spine_psychology_neuroscience_l4_equilibrium_vs_steady_state`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.55, defDice=0.46)**
  - `spine_medicine_preclinical_l5_goldman_hodgkin_katz`
  - `spine_psychology_neuroscience_l4_goldman_hodgkin_katz_equation`
  - _Action:_ Review from migration pass — merge or keep separate

### spine_biology_l3_neurotransmitters_and_receptors

- **possible duplicate (titleDice=0.70, defDice=0.62)**
  - `spine_biology_l4_neurotransmitter_synthesis_release`
  - `spine_medicine_preclinical_l4_neurotransmitter_synthesis_storage`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.50, defDice=0.36)**
  - `spine_biology_l4_neurotransmitter_synthesis_release`
  - `spine_medicine_preclinical_l4_excitatory_inhibitory_neurotransmitters`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.56, defDice=0.28)**
  - `spine_biology_l4_neurotransmitter_synthesis_release`
  - `spine_psychology_neuroscience_l4_major_neurotransmitter_systems`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.55, defDice=0.52)**
  - `spine_biology_l4_ionotropic_receptors`
  - `spine_medicine_preclinical_l4_ligand_gated_vs_gpcr_receptors`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.72, defDice=0.48)**
  - `spine_biology_l4_ionotropic_receptors`
  - `spine_psychology_neuroscience_l4_receptor_types_ionotropic_metabotropic`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.59, defDice=0.42)**
  - `spine_biology_l4_ionotropic_receptors`
  - `spine_psychology_neuroscience_l5_ionotropic_receptor_kinetics`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.63, defDice=0.53)**
  - `spine_biology_l4_metabotropic_receptors`
  - `spine_medicine_preclinical_l4_ligand_gated_vs_gpcr_receptors`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.77, defDice=0.56)**
  - `spine_biology_l4_metabotropic_receptors`
  - `spine_psychology_neuroscience_l4_receptor_types_ionotropic_metabotropic`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.53, defDice=0.28)**
  - `spine_biology_l4_metabotropic_receptors`
  - `spine_psychology_neuroscience_l5_ionotropic_receptor_kinetics`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.54, defDice=0.39)**
  - `spine_biology_l4_major_neurotransmitter_systems`
  - `spine_medicine_preclinical_l4_neurotransmitter_synthesis_storage`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.52, defDice=0.51)**
  - `spine_biology_l4_major_neurotransmitter_systems`
  - `spine_medicine_preclinical_l4_excitatory_inhibitory_neurotransmitters`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.54, defDice=0.38)**
  - `spine_biology_l4_major_neurotransmitter_systems`
  - `spine_psychology_neuroscience_l4_neurotransmitter_synthesis_release`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.54, defDice=0.30)**
  - `spine_medicine_preclinical_l4_neurotransmitter_synthesis_storage`
  - `spine_psychology_neuroscience_l4_major_neurotransmitter_systems`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.49, defDice=0.38)**
  - `spine_medicine_preclinical_l4_excitatory_inhibitory_neurotransmitters`
  - `spine_psychology_neuroscience_l4_neurotransmitter_synthesis_release`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.52, defDice=0.37)**
  - `spine_medicine_preclinical_l4_excitatory_inhibitory_neurotransmitters`
  - `spine_psychology_neuroscience_l4_major_neurotransmitter_systems`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.63, defDice=0.46)**
  - `spine_medicine_preclinical_l4_ligand_gated_vs_gpcr_receptors`
  - `spine_psychology_neuroscience_l4_receptor_types_ionotropic_metabotropic`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.55, defDice=0.37)**
  - `spine_medicine_preclinical_l4_ligand_gated_vs_gpcr_receptors`
  - `spine_psychology_neuroscience_l5_ionotropic_receptor_kinetics`
  - _Action:_ Review from migration pass — merge or keep separate

### spine_biology_l3_prokaryotic_cell_structure

- **possible duplicate (titleDice=0.42, defDice=0.65)**
  - `spine_biology_l4_bacterial_cell_envelope`
  - `spine_medicine_preclinical_l4_prokaryotic_cell_envelope`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.47, defDice=0.38)**
  - `spine_biology_l4_bacterial_cell_envelope`
  - `spine_medicine_preclinical_l4_bacterial_flagella_pili`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.47, defDice=0.36)**
  - `spine_biology_l4_prokaryotic_genome`
  - `spine_medicine_preclinical_l4_prokaryotic_cell_envelope`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.76, defDice=0.48)**
  - `spine_biology_l4_bacterial_appendages`
  - `spine_medicine_preclinical_l4_bacterial_flagella_pili`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.16, defDice=0.62)**
  - `spine_biology_l4_gram_stain_classification`
  - `spine_medicine_preclinical_l4_prokaryotic_cell_envelope`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.12, defDice=0.77)**
  - `spine_biology_l4_gram_stain_classification`
  - `spine_medicine_preclinical_l4_gram_stain_properties`
  - _Action:_ Review from migration pass — merge or keep separate

### spine_biology_l3_synaptic_transmission

- **possible duplicate (titleDice=0.36, defDice=0.66)**
  - `spine_biology_l4_chemical_synapse_structure`
  - `spine_medicine_preclinical_l4_presynaptic_vesicle_release`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.78, defDice=0.63)**
  - `spine_biology_l4_synaptic_vesicle_release`
  - `spine_medicine_preclinical_l4_presynaptic_vesicle_release`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.45, defDice=0.41)**
  - `spine_biology_l4_postsynaptic_potentials`
  - `spine_medicine_preclinical_l4_synaptic_plasticity_ltp`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.47, defDice=0.46)**
  - `spine_biology_l4_postsynaptic_potentials`
  - `spine_psychology_neuroscience_l4_short_term_synaptic_plasticity`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.60, defDice=0.58)**
  - `spine_biology_l4_excitatory_inhibitory_synapses`
  - `spine_medicine_preclinical_l4_postsynaptic_potentials`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.60, defDice=0.37)**
  - `spine_biology_l4_excitatory_inhibitory_synapses`
  - `spine_psychology_neuroscience_l4_postsynaptic_potentials`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.74, defDice=0.77)**
  - `spine_biology_l4_synaptic_plasticity_basics`
  - `spine_medicine_preclinical_l4_synaptic_plasticity_ltp`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.69, defDice=0.43)**
  - `spine_biology_l4_synaptic_plasticity_basics`
  - `spine_psychology_neuroscience_l4_short_term_synaptic_plasticity`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.48, defDice=0.33)**
  - `spine_medicine_preclinical_l4_postsynaptic_potentials`
  - `spine_psychology_neuroscience_l4_synaptic_integration_shunting`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.69, defDice=0.51)**
  - `spine_medicine_preclinical_l4_synaptic_plasticity_ltp`
  - `spine_psychology_neuroscience_l4_short_term_synaptic_plasticity`
  - _Action:_ Review from migration pass — merge or keep separate

### spine_biology_l3_vaccination_principles

- **possible duplicate (titleDice=0.79, defDice=0.57)**
  - `spine_biology_l4_active_immunization`
  - `spine_medicine_preclinical_l4_active_immunization_principle`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.51, defDice=0.73)**
  - `spine_biology_l4_herd_immunity`
  - `spine_medicine_preclinical_l4_herd_immunity_threshold`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.55, defDice=0.46)**
  - `spine_biology_l4_booster_immunization`
  - `spine_medicine_preclinical_l4_active_immunization_principle`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.54, defDice=0.58)**
  - `spine_biology_l4_booster_immunization`
  - `spine_medicine_preclinical_l5_booster_dose_rationale`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.64, defDice=0.44)**
  - `spine_biology_l4_passive_immunization`
  - `spine_medicine_preclinical_l4_active_immunization_principle`
  - _Action:_ Review from migration pass — merge or keep separate

### spine_chemistry_l3_enzyme_kinetics_michaelis_menten

- **possible duplicate (titleDice=0.33, defDice=0.64)**
  - `spine_chemistry_l4_vmax_km_interpretation`
  - `spine_medicine_preclinical_l4_km_and_substrate_affinity`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.82, defDice=0.54)**
  - `spine_chemistry_l4_competitive_inhibition`
  - `spine_medicine_preclinical_l4_noncompetitive_inhibition`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.66, defDice=0.47)**
  - `spine_chemistry_l4_competitive_inhibition`
  - `spine_medicine_preclinical_l5_competitive_inhibitor_lineweaver`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.80, defDice=0.50)**
  - `spine_chemistry_l4_competitive_inhibition`
  - `spine_medicine_preclinical_l5_mixed_vs_uncompetitive`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.62, defDice=0.46)**
  - `spine_chemistry_l4_noncompetitive_uncompetitive_inhibition`
  - `spine_medicine_preclinical_l4_competitive_inhibition`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.68, defDice=0.50)**
  - `spine_chemistry_l4_noncompetitive_uncompetitive_inhibition`
  - `spine_medicine_preclinical_l4_noncompetitive_inhibition`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.55, defDice=0.34)**
  - `spine_chemistry_l4_noncompetitive_uncompetitive_inhibition`
  - `spine_medicine_preclinical_l5_competitive_inhibitor_lineweaver`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.72, defDice=0.52)**
  - `spine_chemistry_l4_noncompetitive_uncompetitive_inhibition`
  - `spine_medicine_preclinical_l5_mixed_vs_uncompetitive`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.51, defDice=0.45)**
  - `spine_chemistry_l5_competitive_inhibitor_examples`
  - `spine_medicine_preclinical_l4_competitive_inhibition`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.49, defDice=0.44)**
  - `spine_chemistry_l5_competitive_inhibitor_examples`
  - `spine_medicine_preclinical_l4_noncompetitive_inhibition`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.46, defDice=0.39)**
  - `spine_chemistry_l5_competitive_inhibitor_examples`
  - `spine_medicine_preclinical_l5_competitive_inhibitor_lineweaver`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.56, defDice=0.49)**
  - `spine_chemistry_l5_competitive_inhibitor_examples`
  - `spine_medicine_preclinical_l5_mixed_vs_uncompetitive`
  - _Action:_ Review from migration pass — merge or keep separate

### spine_chemistry_l3_glycolysis_and_central_metabolism

- **possible duplicate (titleDice=0.52, defDice=0.47)**
  - `spine_chemistry_l4_glycolysis_energy_payoff`
  - `spine_medicine_preclinical_l4_glycolysis_pathway_overview`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.13, defDice=0.62)**
  - `spine_chemistry_l4_fermentation_pathways`
  - `spine_medicine_preclinical_l4_pyruvate_fate_aerobic_anaerobic`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.48, defDice=0.34)**
  - `spine_chemistry_l4_gluconeogenesis_overview`
  - `spine_medicine_preclinical_l4_glycolysis_pathway_overview`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.46, defDice=0.48)**
  - `spine_chemistry_l5_net_atp_yield_glycolysis`
  - `spine_medicine_preclinical_l4_glycolysis_pathway_overview`
  - _Action:_ Review from migration pass — merge or keep separate

### spine_mathematics_l3_descriptive_statistics

- **possible duplicate (titleDice=0.46, defDice=0.30)**
  - `spine_mathematics_l4_measures_spread`
  - `spine_mathematics_l4_measures_of_central_tendency`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.00, defDice=0.72)**
  - `spine_mathematics_l4_measures_spread`
  - `spine_mathematics_l4_variability_standard_deviation`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.69, defDice=0.19)**
  - `spine_mathematics_l4_distribution_shape`
  - `spine_mathematics_l4_distribution_shape_normality`
  - _Action:_ Review from migration pass — merge or keep separate

### spine_mathematics_l3_exponential_decay

- **possible duplicate (titleDice=0.77, defDice=0.62)**
  - `spine_chemistry_l4_first_order_reaction_model`
  - `spine_medicine_preclinical_l4_first_order_elimination_model`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.57, defDice=0.51)**
  - `spine_chemistry_l4_first_order_reaction_model`
  - `spine_medicine_preclinical_l4_zero_order_vs_first_order_elimination`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.47, defDice=0.49)**
  - `spine_chemistry_l4_rate_constant_first_order`
  - `spine_medicine_preclinical_l4_first_order_elimination_model`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.52, defDice=0.60)**
  - `spine_chemistry_l4_rate_constant_first_order`
  - `spine_medicine_preclinical_l4_elimination_rate_constant`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.45, defDice=0.45)**
  - `spine_chemistry_l4_half_life_first_order`
  - `spine_mathematics_l4_decay_constant_half_life`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.48, defDice=0.46)**
  - `spine_chemistry_l4_half_life_first_order`
  - `spine_medicine_preclinical_l4_first_order_elimination_model`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.45, defDice=0.56)**
  - `spine_chemistry_l4_half_life_first_order`
  - `spine_medicine_preclinical_l4_drug_half_life`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.47, defDice=0.45)**
  - `spine_chemistry_l4_integrated_rate_law_first_order`
  - `spine_medicine_preclinical_l4_first_order_elimination_model`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.45, defDice=0.41)**
  - `spine_chemistry_l4_radioactive_decay_kinetics`
  - `spine_physics_l4_mean_lifetime_radioactive`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.60, defDice=0.39)**
  - `spine_chemistry_l5_half_life_k_equation`
  - `spine_mathematics_l4_decay_constant_half_life`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.59, defDice=0.45)**
  - `spine_chemistry_l5_half_life_k_equation`
  - `spine_medicine_preclinical_l4_elimination_rate_constant`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.56, defDice=0.36)**
  - `spine_chemistry_l5_half_life_k_equation`
  - `spine_medicine_preclinical_l4_clearance_elimination_relationship`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.52, defDice=0.42)**
  - `spine_chemistry_l5_temperature_effect_rate_constant`
  - `spine_medicine_preclinical_l4_elimination_rate_constant`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.80, defDice=0.59)**
  - `spine_mathematics_l4_exponential_decay_model`
  - `spine_physics_l4_exponential_decay_law`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.72, defDice=0.58)**
  - `spine_mathematics_l4_decay_constant_half_life`
  - `spine_physics_l4_half_life_decay_constant`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.56, defDice=0.49)**
  - `spine_mathematics_l4_solving_decay_problems`
  - `spine_physics_l4_exponential_decay_law`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.53, defDice=0.39)**
  - `spine_mathematics_l4_decay_vs_growth_comparison`
  - `spine_physics_l4_exponential_decay_law`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.47, defDice=0.40)**
  - `spine_physics_l4_half_life_decay_constant`
  - `spine_medicine_preclinical_l4_elimination_rate_constant`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.52, defDice=0.35)**
  - `spine_physics_l4_half_life_decay_constant`
  - `spine_medicine_preclinical_l4_clearance_elimination_relationship`
  - _Action:_ Review from migration pass — merge or keep separate

### spine_mathematics_l3_hypothesis_testing

- **possible duplicate (titleDice=0.79, defDice=0.49)**
  - `spine_mathematics_l4_type_errors_significance`
  - `spine_mathematics_l4_type_i_ii_errors_power`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.41, defDice=0.68)**
  - `spine_mathematics_l4_p_values`
  - `spine_mathematics_l4_p_values_significance`
  - _Action:_ Review from migration pass — merge or keep separate

### spine_psychology_neuroscience_l3_anxiety_disorders

- **possible duplicate (titleDice=0.58, defDice=0.38)**
  - `spine_medicine_clinical_l4_generalized_anxiety_disorder`
  - `spine_psychology_neuroscience_l4_generalized_anxiety_features`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.55, defDice=0.33)**
  - `spine_medicine_clinical_l4_phobia_social_anxiety`
  - `spine_psychology_neuroscience_l4_panic_phobia_presentation`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.45, defDice=0.27)**
  - `spine_medicine_clinical_l5_ssri_anxiety_titration`
  - `spine_psychology_neuroscience_l4_panic_phobia_presentation`
  - _Action:_ Review from migration pass — merge or keep separate

### spine_psychology_neuroscience_l3_eating_disorders

- **possible duplicate (titleDice=0.48, defDice=0.20)**
  - `spine_medicine_clinical_l4_eating_disorder_medical_complications`
  - `spine_psychology_neuroscience_l4_binge_eating_disorder_features`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.52, defDice=0.25)**
  - `spine_medicine_clinical_l4_eating_disorder_psychotherapy_medical`
  - `spine_psychology_neuroscience_l4_binge_eating_disorder_features`
  - _Action:_ Review from migration pass — merge or keep separate

### spine_psychology_neuroscience_l3_personality_disorders_overview

- **possible duplicate (titleDice=0.53, defDice=0.30)**
  - `spine_medicine_clinical_l4_personality_disorder_longitudinal_diagnosis`
  - `spine_psychology_neuroscience_l4_personality_disorder_clusters`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.48, defDice=0.34)**
  - `spine_medicine_clinical_l4_personality_disorder_longitudinal_diagnosis`
  - `spine_psychology_neuroscience_l4_borderline_personality_features`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.48, defDice=0.36)**
  - `spine_medicine_clinical_l4_borderline_dbt_management`
  - `spine_psychology_neuroscience_l4_personality_disorder_clusters`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.57, defDice=0.32)**
  - `spine_medicine_clinical_l4_borderline_dbt_management`
  - `spine_psychology_neuroscience_l4_borderline_personality_features`
  - _Action:_ Review from migration pass — merge or keep separate

- **possible duplicate (titleDice=0.56, defDice=0.24)**
  - `spine_medicine_clinical_l4_personality_disorder_pharmacotherapy_limits`
  - `spine_psychology_neuroscience_l4_personality_disorder_clusters`
  - _Action:_ Review from migration pass — merge or keep separate

### spine_psychology_neuroscience_l3_schizophrenia_spectrum

- **possible duplicate (titleDice=0.53, defDice=0.46)**
  - `spine_medicine_clinical_l4_negative_symptom_psychosocial_care`
  - `spine_psychology_neuroscience_l4_negative_cognitive_symptoms`
  - _Action:_ Review from migration pass — merge or keep separate

---

