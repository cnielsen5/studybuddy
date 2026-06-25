import type { ConceptSourceReference } from "../../types/domainContext.js";
import type { SpineConcept } from "../spineSchema.js";
import { l2Id, l3Id } from "../spineDomains.js";

const TS = "2025-01-01T00:00:00Z";

function emptyLinks() {
  return { by_library: {} };
}

interface PhysicsL3Spec {
  shortName: string;
  l2: string;
  cluster: string;
  title: string;
  definition: string;
  summary: string;
  prerequisites?: string[];
  unlocks?: string[];
  source: ConceptSourceReference;
}

function makePhysicsConcept(spec: PhysicsL3Spec): SpineConcept {
  const id = l3Id("physics", spec.shortName);
  const parent = l2Id("physics", spec.l2);
  const prerequisites = spec.prerequisites ?? [parent];
  const unlocks = spec.unlocks ?? [];

  return {
    id,
    resolution_level: 3,
    content: {
      title: spec.title,
      definition: spec.definition,
      summary: spec.summary,
    },
    knowledge_graph: {
      knowledge_area: "Physical Sciences",
      knowledge_cluster: spec.cluster,
      primary_domain: "physics",
    },
    dependency_graph: {
      parent_concept_id: parent,
      prerequisites,
      unlocks,
    },
    domain_contexts: [
      {
        domain_id: "physics",
        framing: {
          title_in_context: spec.title,
          relevance: `Foundational ${spec.l2.toLowerCase()} concept for modeling physical systems quantitatively.`,
          applications: [],
          max_resolution_in_context: 3,
        },
        hierarchy_location: {
          category: "Physics",
          subcategory: spec.l2,
          topic: spec.title,
          subtopic: null,
        },
        dependency_graph: {
          prerequisites_in_context: prerequisites,
          unlocks_in_context: unlocks,
        },
        linked_content: emptyLinks(),
      },
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [spec.source],
    },
  };
}

const CM = "Classical Mechanics";
const WAVES = "Waves & Oscillations";
const THERMO = "Thermodynamics & Statistical Mechanics";
const EM = "Electricity & Magnetism";
const OPTICS = "Optics";
const MODERN = "Modern Physics & Quantum Mechanics";
const FLUIDS = "Fluid Mechanics";
const NUCLEAR = "Nuclear Physics";

const UP1 = "OpenStax University Physics Volume 1";
const UP2 = "OpenStax University Physics Volume 2";
const UP3 = "OpenStax University Physics Volume 3";

export const PHYSICS_L3: SpineConcept[] = [
  // Classical Mechanics (8)
  makePhysicsConcept({
    shortName: "kinematics_one_dimension",
    l2: CM,
    cluster: "Motion",
    title: "One-Dimensional Kinematics",
    definition:
      "Description of motion along a straight line using displacement, velocity, and acceleration as functions of time, without reference to the forces that cause the motion.",
    summary:
      "One-dimensional kinematics provides the vocabulary and equations for how position changes over time. Constant-acceleration relations link initial and final states and underpin nearly all introductory mechanics.",
    prerequisites: [l2Id("physics", CM)],
    unlocks: [l3Id("physics", "projectile_motion")],
    source: { source: UP1, chapter: "3", section: "3.1–3.5" },
  }),
  makePhysicsConcept({
    shortName: "projectile_motion",
    l2: CM,
    cluster: "Motion",
    title: "Projectile Motion",
    definition:
      "Two-dimensional motion of an object under uniform gravitational acceleration, decomposed into independent horizontal and vertical components.",
    summary:
      "Projectile motion applies vector decomposition to predict trajectories, range, and time of flight. It bridges one-dimensional kinematics and Newton's laws in two dimensions.",
    prerequisites: [l3Id("physics", "kinematics_one_dimension"), "spine_mathematics_l3_vectors_in_space"],
    unlocks: [l3Id("physics", "newtons_laws_of_motion")],
    source: { source: UP1, chapter: "4", section: "4.3" },
  }),
  makePhysicsConcept({
    shortName: "newtons_laws_of_motion",
    l2: CM,
    cluster: "Forces",
    title: "Newton's Laws of Motion",
    definition:
      "Three principles relating forces to changes in motion: inertia, proportionality of net force to acceleration, and equal-and-opposite interaction pairs.",
    summary:
      "Newton's laws translate force diagrams into predictive equations of motion. They are the central organizing framework for classical mechanics from everyday objects to celestial orbits.",
    prerequisites: [l3Id("physics", "projectile_motion")],
    unlocks: [
      l3Id("physics", "work_and_kinetic_energy"),
      l3Id("physics", "linear_momentum_and_collisions"),
    ],
    source: { source: UP1, chapter: "5", section: "5.1–5.7" },
  }),
  makePhysicsConcept({
    shortName: "work_and_kinetic_energy",
    l2: CM,
    cluster: "Energy",
    title: "Work and Kinetic Energy",
    definition:
      "Work is the line integral of force along displacement; the work–energy theorem states that net work equals the change in kinetic energy of a particle or rigid system.",
    summary:
      "The work–energy theorem offers an alternative to force-based analysis for problems involving speeds and distances. It connects force, displacement, and energy transfer in a single scalar relation.",
    prerequisites: [l3Id("physics", "newtons_laws_of_motion")],
    unlocks: [l3Id("physics", "conservation_of_mechanical_energy")],
    source: { source: UP1, chapter: "7", section: "7.1–7.3" },
  }),
  makePhysicsConcept({
    shortName: "conservation_of_mechanical_energy",
    l2: CM,
    cluster: "Energy",
    title: "Conservation of Mechanical Energy",
    definition:
      "When only conservative forces perform work, the sum of kinetic and potential energy remains constant for an isolated system.",
    summary:
      "Energy conservation reduces complex force problems to bookkeeping among energy forms. It is especially powerful for motion in gravitational and elastic potentials.",
    prerequisites: [l3Id("physics", "work_and_kinetic_energy")],
    unlocks: [l3Id("physics", "rotational_dynamics")],
    source: { source: UP1, chapter: "8", section: "8.1–8.3" },
  }),
  makePhysicsConcept({
    shortName: "linear_momentum_and_collisions",
    l2: CM,
    cluster: "Momentum",
    title: "Linear Momentum and Collisions",
    definition:
      "Linear momentum is mass times velocity; its rate of change equals net external force. In isolated systems, total momentum is conserved through elastic and inelastic collisions.",
    summary:
      "Momentum conservation explains collision outcomes when forces are impulsive or unknown. Impulse–momentum relations complement energy methods for impact problems.",
    prerequisites: [l3Id("physics", "newtons_laws_of_motion")],
    unlocks: [l3Id("physics", "rotational_dynamics")],
    source: { source: UP1, chapter: "9", section: "9.1–9.5" },
  }),
  makePhysicsConcept({
    shortName: "rotational_dynamics",
    l2: CM,
    cluster: "Rotation",
    title: "Rotational Dynamics",
    definition:
      "Extension of Newton's laws to rigid bodies rotating about a fixed axis, using torque, moment of inertia, and angular acceleration.",
    summary:
      "Rotational dynamics parallels translational mechanics with angular analogs of force, mass, and acceleration. It explains rolling, pulleys, and gyroscopic behavior in macroscopic systems.",
    prerequisites: [
      l3Id("physics", "conservation_of_mechanical_energy"),
      l3Id("physics", "linear_momentum_and_collisions"),
    ],
    unlocks: [l3Id("physics", "universal_gravitation")],
    source: { source: UP1, chapter: "10", section: "10.1–10.5" },
  }),
  makePhysicsConcept({
    shortName: "universal_gravitation",
    l2: CM,
    cluster: "Gravitation",
    title: "Universal Gravitation",
    definition:
      "Every mass attracts every other mass with a force proportional to the product of masses and inversely proportional to the square of their separation.",
    summary:
      "Newton's law of gravitation unifies terrestrial falling with planetary orbits. Combined with energy and momentum methods, it predicts satellite motion and orbital stability.",
    prerequisites: [l3Id("physics", "rotational_dynamics")],
    unlocks: [l3Id("physics", "nuclear_structure_and_binding_energy")],
    source: { source: UP1, chapter: "13", section: "13.1–13.4" },
  }),

  // Waves & Oscillations (6)
  makePhysicsConcept({
    shortName: "simple_harmonic_motion",
    l2: WAVES,
    cluster: "Oscillations",
    title: "Simple Harmonic Motion",
    definition:
      "Periodic motion in which restoring force is proportional to displacement from equilibrium, producing sinusoidal position, velocity, and acceleration.",
    summary:
      "Simple harmonic motion models springs, small pendulums, and molecular vibrations. Its solutions introduce angular frequency, phase, and the role of initial conditions.",
    prerequisites: [l2Id("physics", WAVES), l3Id("physics", "conservation_of_mechanical_energy")],
    unlocks: [l3Id("physics", "damped_and_driven_oscillations")],
    source: { source: UP1, chapter: "16", section: "16.1–16.2" },
  }),
  makePhysicsConcept({
    shortName: "damped_and_driven_oscillations",
    l2: WAVES,
    cluster: "Oscillations",
    title: "Damped and Driven Oscillations",
    definition:
      "Oscillatory systems subject to dissipative forces or periodic driving, exhibiting decaying amplitude, resonance, and phase lag between drive and response.",
    summary:
      "Real oscillators lose energy to friction or gain energy from drivers. Resonance explains dramatic amplitude growth at matching drive frequencies in mechanical and electrical analogs.",
    prerequisites: [
      l3Id("physics", "simple_harmonic_motion"),
      "spine_mathematics_l3_exponential_decay",
    ],
    unlocks: [l3Id("physics", "mechanical_waves")],
    source: { source: UP1, chapter: "16", section: "16.3–16.4" },
  }),
  makePhysicsConcept({
    shortName: "mechanical_waves",
    l2: WAVES,
    cluster: "Waves",
    title: "Mechanical Waves",
    definition:
      "Disturbances that propagate through a medium via coupled oscillations of neighboring elements, characterized by wavelength, frequency, speed, and amplitude.",
    summary:
      "Mechanical waves transport energy without net transport of matter. The wave equation links speed to medium properties and underlies sound, seismic waves, and string vibrations.",
    prerequisites: [l3Id("physics", "damped_and_driven_oscillations")],
    unlocks: [l3Id("physics", "wave_superposition_and_interference")],
    source: { source: UP1, chapter: "17", section: "17.1–17.2" },
  }),
  makePhysicsConcept({
    shortName: "wave_superposition_and_interference",
    l2: WAVES,
    cluster: "Waves",
    title: "Wave Superposition and Interference",
    definition:
      "When waves overlap, displacements add algebraically, producing constructive and destructive interference patterns depending on phase difference.",
    summary:
      "Superposition is the linearity principle for waves. Interference patterns reveal path-length differences and are central to acoustics, optics, and quantum probability amplitudes.",
    prerequisites: [l3Id("physics", "mechanical_waves")],
    unlocks: [l3Id("physics", "standing_waves_and_resonance")],
    source: { source: UP1, chapter: "17", section: "17.3" },
  }),
  makePhysicsConcept({
    shortName: "standing_waves_and_resonance",
    l2: WAVES,
    cluster: "Waves",
    title: "Standing Waves and Resonance",
    definition:
      "Confined waves that form stationary nodes and antinodes at discrete resonant frequencies determined by boundary conditions.",
    summary:
      "Standing waves explain musical instrument harmonics and cavity modes. Quantized resonant frequencies foreshadow bound states in quantum mechanics.",
    prerequisites: [l3Id("physics", "wave_superposition_and_interference")],
    unlocks: [l3Id("physics", "sound_waves_and_doppler_effect")],
    source: { source: UP1, chapter: "17", section: "17.4" },
  }),
  makePhysicsConcept({
    shortName: "sound_waves_and_doppler_effect",
    l2: WAVES,
    cluster: "Acoustics",
    title: "Sound Waves and the Doppler Effect",
    definition:
      "Longitudinal pressure waves in elastic media, including frequency shifts observed when source and observer move relative to one another.",
    summary:
      "Sound applies wave mechanics to compressible fluids. The Doppler effect provides a measurable link between relative motion and observed frequency in acoustics and electromagnetics.",
    prerequisites: [l3Id("physics", "standing_waves_and_resonance")],
    unlocks: [l3Id("physics", "wave_interference_optics")],
    source: { source: UP1, chapter: "17", section: "17.5–17.6" },
  }),

  // Thermodynamics & Statistical Mechanics (5)
  makePhysicsConcept({
    shortName: "temperature_and_heat",
    l2: THERMO,
    cluster: "Thermal Concepts",
    title: "Temperature and Heat",
    definition:
      "Temperature quantifies thermal equilibrium and average microscopic kinetic energy; heat is energy transferred between systems because of a temperature difference.",
    summary:
      "Distinguishing temperature from heat is essential for thermodynamic reasoning. Calorimetry links measurable temperature changes to energy exchange.",
    prerequisites: [l2Id("physics", THERMO)],
    unlocks: [l3Id("physics", "ideal_gas_law")],
    source: { source: UP1, chapter: "15", section: "15.1–15.2" },
  }),
  makePhysicsConcept({
    shortName: "ideal_gas_law",
    l2: THERMO,
    cluster: "Gases",
    title: "Ideal Gas Law",
    definition:
      "Equation of state PV = nRT relating pressure, volume, amount, and temperature for gases whose molecular interactions are negligible.",
    summary:
      "The ideal gas law connects macroscopic variables to microscopic behavior through the gas constant. It is the starting point for kinetic theory and engine cycles.",
    prerequisites: [l3Id("physics", "temperature_and_heat")],
    unlocks: [l3Id("physics", "first_law_of_thermodynamics")],
    source: { source: UP1, chapter: "15", section: "15.3" },
  }),
  makePhysicsConcept({
    shortName: "first_law_of_thermodynamics",
    l2: THERMO,
    cluster: "Laws of Thermodynamics",
    title: "First Law of Thermodynamics",
    definition:
      "Energy conservation for thermodynamic systems: change in internal energy equals heat added minus work done by the system.",
    summary:
      "The first law generalizes mechanical energy conservation to include thermal energy. It governs processes in engines, refrigerators, and chemical reactions at constant volume or pressure.",
    prerequisites: [l3Id("physics", "ideal_gas_law")],
    unlocks: [l3Id("physics", "heat_engines_and_carnot_cycle")],
    source: { source: UP1, chapter: "15", section: "15.4" },
  }),
  makePhysicsConcept({
    shortName: "heat_engines_and_carnot_cycle",
    l2: THERMO,
    cluster: "Heat Engines",
    title: "Heat Engines and the Carnot Cycle",
    definition:
      "Devices that convert thermal energy to work through cyclic processes; the Carnot cycle sets the maximum efficiency limit between two reservoirs.",
    summary:
      "Heat engines illustrate the practical consequences of thermodynamic laws. Carnot efficiency depends only on reservoir temperatures and motivates the definition of entropy.",
    prerequisites: [l3Id("physics", "first_law_of_thermodynamics")],
    unlocks: [l3Id("physics", "entropy_and_second_law")],
    source: { source: UP1, chapter: "15", section: "15.5" },
  }),
  makePhysicsConcept({
    shortName: "entropy_and_second_law",
    l2: THERMO,
    cluster: "Laws of Thermodynamics",
    title: "Entropy and the Second Law",
    definition:
      "Entropy measures dispersal of energy; in isolated systems it never decreases, and spontaneous processes increase total entropy.",
    summary:
      "The second law explains irreversibility and the direction of spontaneous change. Entropy connects macroscopic heat flow to microscopic disorder and statistical mechanics.",
    prerequisites: [l3Id("physics", "heat_engines_and_carnot_cycle")],
    unlocks: [],
    source: { source: UP1, chapter: "15", section: "15.6" },
  }),

  // Electricity & Magnetism (7)
  makePhysicsConcept({
    shortName: "electric_charge_and_coulombs_law",
    l2: EM,
    cluster: "Electrostatics",
    title: "Electric Charge and Coulomb's Law",
    definition:
      "Electric charge is a conserved property of matter; stationary point charges exert forces proportional to charge product and inversely proportional to distance squared.",
    summary:
      "Coulomb's law is the electrostatic analog of gravitation with signed charges. It underpins electric fields, potential, and all circuit behavior.",
    prerequisites: [l2Id("physics", EM)],
    unlocks: [l3Id("physics", "electric_fields_and_potential")],
    source: { source: UP2, chapter: "5", section: "5.1–5.3" },
  }),
  makePhysicsConcept({
    shortName: "electric_fields_and_potential",
    l2: EM,
    cluster: "Electrostatics",
    title: "Electric Fields and Potential",
    definition:
      "Electric field is force per unit charge; electric potential is potential energy per unit charge, with field related to the gradient of potential.",
    summary:
      "Fields and potentials provide spatial maps of electrostatic influence. Potential differences drive current in conductors and store energy in capacitors.",
    prerequisites: [l3Id("physics", "electric_charge_and_coulombs_law"), "spine_mathematics_l3_vectors_in_space"],
    unlocks: [l3Id("physics", "capacitance_and_dielectrics")],
    source: { source: UP2, chapter: "7", section: "7.1–7.4" },
  }),
  makePhysicsConcept({
    shortName: "capacitance_and_dielectrics",
    l2: EM,
    cluster: "Electrostatics",
    title: "Capacitance and Dielectrics",
    definition:
      "Capacitance quantifies charge stored per volt across conductors; dielectric materials alter capacitance by polarizing in external fields.",
    summary:
      "Capacitors store energy in electric fields and shape transient behavior in circuits. Dielectrics increase capacitance and withstand breakdown limits in devices.",
    prerequisites: [l3Id("physics", "electric_fields_and_potential")],
    unlocks: [l3Id("physics", "direct_current_circuits")],
    source: { source: UP2, chapter: "8", section: "8.1–8.3" },
  }),
  makePhysicsConcept({
    shortName: "direct_current_circuits",
    l2: EM,
    cluster: "Circuits",
    title: "Direct-Current Circuits",
    definition:
      "Steady current flow through resistors and sources governed by Ohm's law and conservation rules for charge and energy at junctions and loops.",
    summary:
      "DC circuit analysis combines resistors in series and parallel with Kirchhoff's rules. It is the practical foundation for electronics and bioelectric measurements.",
    prerequisites: [l3Id("physics", "capacitance_and_dielectrics")],
    unlocks: [l3Id("physics", "magnetic_fields_and_forces")],
    source: { source: UP2, chapter: "10", section: "10.1–10.4" },
  }),
  makePhysicsConcept({
    shortName: "magnetic_fields_and_forces",
    l2: EM,
    cluster: "Magnetism",
    title: "Magnetic Fields and Forces",
    definition:
      "Moving charges and currents experience forces perpendicular to both velocity and magnetic field; fields are produced by currents and permanent magnets.",
    summary:
      "Magnetic forces do no work on charges but deflect trajectories and torques on current loops. They explain motors, mass spectrometers, and the basis of induction.",
    prerequisites: [l3Id("physics", "direct_current_circuits")],
    unlocks: [l3Id("physics", "electromagnetic_induction")],
    source: { source: UP2, chapter: "11", section: "11.1–11.4" },
  }),
  makePhysicsConcept({
    shortName: "electromagnetic_induction",
    l2: EM,
    cluster: "Induction",
    title: "Electromagnetic Induction",
    definition:
      "Changing magnetic flux through a loop induces an electromotive force, described by Faraday's law and Lenz's law for polarity.",
    summary:
      "Induction converts between mechanical and electrical energy in generators and transformers. It completes the dynamic link between electric and magnetic phenomena.",
    prerequisites: [l3Id("physics", "magnetic_fields_and_forces")],
    unlocks: [l3Id("physics", "maxwells_equations_and_em_waves")],
    source: { source: UP2, chapter: "13", section: "13.1–13.4" },
  }),
  makePhysicsConcept({
    shortName: "maxwells_equations_and_em_waves",
    l2: EM,
    cluster: "Electromagnetic Waves",
    title: "Maxwell's Equations and Electromagnetic Waves",
    definition:
      "Unified laws of electricity and magnetism predicting self-propagating transverse waves with speed determined by permeability and permittivity of the medium.",
    summary:
      "Maxwell's synthesis shows light is an electromagnetic wave. The equations underpin optics, wireless communication, and relativistic invariance of field laws.",
    prerequisites: [l3Id("physics", "electromagnetic_induction")],
    unlocks: [l3Id("physics", "electromagnetic_spectrum_and_light")],
    source: { source: UP2, chapter: "16", section: "16.1–16.3" },
  }),

  // Optics (5)
  makePhysicsConcept({
    shortName: "electromagnetic_spectrum_and_light",
    l2: OPTICS,
    cluster: "Nature of Light",
    title: "Electromagnetic Spectrum and Light",
    definition:
      "Light comprises transverse electromagnetic waves spanning wavelengths from radio to gamma rays, each interacting with matter through absorption, emission, and scattering.",
    summary:
      "The spectrum organizes radiation by frequency and energy. Understanding wave–particle duality begins with classifying how different wavelengths probe structure and dynamics.",
    prerequisites: [l2Id("physics", OPTICS), l3Id("physics", "maxwells_equations_and_em_waves")],
    unlocks: [l3Id("physics", "geometric_optics")],
    source: { source: UP3, chapter: "1", section: "1.1–1.3" },
  }),
  makePhysicsConcept({
    shortName: "geometric_optics",
    l2: OPTICS,
    cluster: "Ray Optics",
    title: "Geometric Optics",
    definition:
      "Ray approximation for light propagation through reflection and refraction at interfaces, including mirrors, lenses, and image formation.",
    summary:
      "Geometric optics uses straight-line rays where wavelengths are small compared to features. Lens and mirror equations predict real and virtual images in instruments.",
    prerequisites: [l3Id("physics", "electromagnetic_spectrum_and_light")],
    unlocks: [l3Id("physics", "wave_interference_optics")],
    source: { source: UP3, chapter: "2", section: "2.1–2.5" },
  }),
  makePhysicsConcept({
    shortName: "wave_interference_optics",
    l2: OPTICS,
    cluster: "Wave Optics",
    title: "Wave Interference in Optics",
    definition:
      "Superposition of coherent light waves producing intensity patterns from path-length differences, as in double-slit and thin-film interference.",
    summary:
      "Optical interference demonstrates the wave nature of light with measurable fringe patterns. It enables precision metrology and spectroscopic resolution.",
    prerequisites: [l3Id("physics", "geometric_optics"), l3Id("physics", "wave_superposition_and_interference")],
    unlocks: [l3Id("physics", "diffraction")],
    source: { source: UP3, chapter: "3", section: "3.1–3.3" },
  }),
  makePhysicsConcept({
    shortName: "diffraction",
    l2: OPTICS,
    cluster: "Wave Optics",
    title: "Diffraction",
    definition:
      "Bending and spreading of waves around obstacles and through apertures, with intensity patterns governed by wavelength and opening size.",
    summary:
      "Diffraction sets the ultimate resolution limit of optical systems. Single-slit and grating patterns quantify how wave nature dominates when aperture sizes approach wavelength.",
    prerequisites: [l3Id("physics", "wave_interference_optics")],
    unlocks: [l3Id("physics", "polarization")],
    source: { source: UP3, chapter: "4", section: "4.1–4.3" },
  }),
  makePhysicsConcept({
    shortName: "polarization",
    l2: OPTICS,
    cluster: "Wave Optics",
    title: "Polarization",
    definition:
      "Orientation of the transverse electric field oscillation in electromagnetic waves, altered by polarizers, reflection, and birefringent materials.",
    summary:
      "Polarization reveals the vector character of light. It is exploited in LCD displays, stress analysis, and filtering scattered glare.",
    prerequisites: [l3Id("physics", "diffraction")],
    unlocks: [],
    source: { source: UP3, chapter: "1", section: "1.4" },
  }),

  // Modern Physics & Quantum Mechanics (6)
  makePhysicsConcept({
    shortName: "special_relativity",
    l2: MODERN,
    cluster: "Relativity",
    title: "Special Relativity",
    definition:
      "Framework in which the laws of physics are invariant in all inertial frames, implying time dilation, length contraction, and equivalence of mass and energy.",
    summary:
      "Special relativity revises kinematics at speeds approaching light. E = mc² and Lorentz transformations unify space and time in high-energy physics.",
    prerequisites: [l2Id("physics", MODERN)],
    unlocks: [l3Id("physics", "photoelectric_and_compton_effects")],
    source: { source: UP3, chapter: "5", section: "5.1–5.4" },
  }),
  makePhysicsConcept({
    shortName: "photoelectric_and_compton_effects",
    l2: MODERN,
    cluster: "Quantum Origins",
    title: "Photoelectric and Compton Effects",
    definition:
      "Experimental evidence that light transfers energy in discrete quanta and that photons carry momentum, establishing particle aspects of electromagnetic radiation.",
    summary:
      "These effects motivated quantum theory by showing energy and momentum quantization of light. Work-function and wavelength-shift measurements link photon energy to frequency.",
    prerequisites: [l3Id("physics", "special_relativity")],
    unlocks: [l3Id("physics", "matter_waves_de_broglie")],
    source: { source: UP3, chapter: "6", section: "6.1–6.3" },
  }),
  makePhysicsConcept({
    shortName: "matter_waves_de_broglie",
    l2: MODERN,
    cluster: "Quantum Origins",
    title: "Matter Waves and de Broglie Wavelength",
    definition:
      "Every particle has an associated wavelength inversely proportional to momentum, unifying wave and particle descriptions of matter.",
    summary:
      "de Broglie waves explain electron diffraction and discrete atomic orbits. They extend wave mechanics from light to all massive particles.",
    prerequisites: [l3Id("physics", "photoelectric_and_compton_effects")],
    unlocks: [l3Id("physics", "heisenberg_uncertainty_principle")],
    source: { source: UP3, chapter: "6", section: "6.4" },
  }),
  makePhysicsConcept({
    shortName: "heisenberg_uncertainty_principle",
    l2: MODERN,
    cluster: "Quantum Foundations",
    title: "Heisenberg Uncertainty Principle",
    definition:
      "Conjugate pairs such as position and momentum cannot both be known with arbitrary precision; their uncertainties satisfy a lower bound proportional to Planck's constant.",
    summary:
      "Uncertainty is a fundamental limit on simultaneous measurement, not merely instrumental error. It constrains atomic size, zero-point energy, and microscopy resolution.",
    prerequisites: [l3Id("physics", "matter_waves_de_broglie")],
    unlocks: [l3Id("physics", "schrodinger_equation_bound_states")],
    source: { source: UP3, chapter: "7", section: "7.1" },
  }),
  makePhysicsConcept({
    shortName: "schrodinger_equation_bound_states",
    l2: MODERN,
    cluster: "Quantum Mechanics",
    title: "Schrödinger Equation and Bound States",
    definition:
      "Wave function evolution governed by a linear differential equation whose normalizable solutions in potentials yield quantized energy levels.",
    summary:
      "The Schrödinger equation replaces classical trajectories with probability amplitudes. Particle-in-a-box and hydrogen-like models predict discrete spectra.",
    prerequisites: [
      l3Id("physics", "heisenberg_uncertainty_principle"),
      "spine_mathematics_l3_first_order_odes",
    ],
    unlocks: [l3Id("physics", "atomic_structure_and_spectra")],
    source: { source: UP3, chapter: "7", section: "7.2–7.4" },
  }),
  makePhysicsConcept({
    shortName: "atomic_structure_and_spectra",
    l2: MODERN,
    cluster: "Atomic Physics",
    title: "Atomic Structure and Spectra",
    definition:
      "Electrons in atoms occupy quantized states labeled by quantum numbers, producing characteristic emission and absorption line spectra.",
    summary:
      "Atomic structure explains the periodic table's chemical periodicity at a physical level. Selection rules and fine structure connect theory to precision spectroscopy.",
    prerequisites: [l3Id("physics", "schrodinger_equation_bound_states")],
    unlocks: [],
    source: { source: UP3, chapter: "8", section: "8.1–8.3" },
  }),

  // Fluid Mechanics (3)
  makePhysicsConcept({
    shortName: "hydrostatic_pressure_and_buoyancy",
    l2: FLUIDS,
    cluster: "Fluid Statics",
    title: "Hydrostatic Pressure and Buoyancy",
    definition:
      "Pressure in a fluid increases with depth; buoyant force on a submerged body equals the weight of displaced fluid.",
    summary:
      "Fluid statics explains pressure variation in atmospheres and oceans. Archimedes' principle accounts for floating, sinking, and apparent weight loss in fluids.",
    prerequisites: [l2Id("physics", FLUIDS), l3Id("physics", "newtons_laws_of_motion")],
    unlocks: [l3Id("physics", "fluid_flow_and_bernoulli_equation")],
    source: { source: UP1, chapter: "14", section: "14.1–14.3" },
  }),
  makePhysicsConcept({
    shortName: "fluid_flow_and_bernoulli_equation",
    l2: FLUIDS,
    cluster: "Fluid Dynamics",
    title: "Fluid Flow and Bernoulli's Equation",
    definition:
      "Conservation of energy along streamlines relates pressure, speed, and height for ideal, incompressible, steady flow.",
    summary:
      "Bernoulli's equation connects flow speed to pressure in pipes, wings, and venturis. It is the starting model for lift, blood flow, and plumbing design.",
    prerequisites: [l3Id("physics", "hydrostatic_pressure_and_buoyancy")],
    unlocks: [l3Id("physics", "viscosity_and_laminar_flow")],
    source: { source: UP1, chapter: "14", section: "14.4–14.5" },
  }),
  makePhysicsConcept({
    shortName: "viscosity_and_laminar_flow",
    l2: FLUIDS,
    cluster: "Fluid Dynamics",
    title: "Viscosity and Laminar Flow",
    definition:
      "Viscous fluids resist shear flow; laminar pipe flow has parabolic velocity profiles with flow rate proportional to pressure gradient and fourth power of radius.",
    summary:
      "Viscosity captures internal friction absent in ideal fluids. Poiseuille's law quantifies resistance in biological vessels and microfluidic devices.",
    prerequisites: [l3Id("physics", "fluid_flow_and_bernoulli_equation")],
    unlocks: [],
    source: { source: UP1, chapter: "14", section: "14.6" },
  }),

  // Nuclear Physics (5)
  makePhysicsConcept({
    shortName: "nuclear_structure_and_binding_energy",
    l2: NUCLEAR,
    cluster: "Nuclear Structure",
    title: "Nuclear Structure and Binding Energy",
    definition:
      "Atomic nuclei consist of protons and neutrons bound by the strong force; mass defect relative to constituent nucleons equals nuclear binding energy.",
    summary:
      "Binding energy per nucleon peaks near iron, explaining energy release in fusion and fission. Nuclear models account for stability and magic numbers.",
    prerequisites: [l2Id("physics", NUCLEAR), l3Id("physics", "universal_gravitation")],
    unlocks: ["spine_mathematics_l3_exponential_decay"],
    source: { source: UP3, chapter: "10", section: "10.1–10.2" },
  }),
  makePhysicsConcept({
    shortName: "nuclear_decay_modes",
    l2: NUCLEAR,
    cluster: "Radioactivity",
    title: "Nuclear Decay Modes",
    definition:
      "Unstable nuclei emit alpha particles, beta particles, or gamma rays, changing atomic number and mass number according to conservation laws.",
    summary:
      "Each decay mode has distinct penetrating power and biological hazard. Decay schemes and balancing rules predict daughter nuclei and radiation spectra.",
    prerequisites: [
      l3Id("physics", "nuclear_structure_and_binding_energy"),
      "spine_mathematics_l3_exponential_decay",
    ],
    unlocks: [l3Id("physics", "nuclear_fission_and_fusion")],
    source: { source: UP3, chapter: "10", section: "10.4" },
  }),
  makePhysicsConcept({
    shortName: "nuclear_fission_and_fusion",
    l2: NUCLEAR,
    cluster: "Nuclear Reactions",
    title: "Nuclear Fission and Fusion",
    definition:
      "Fission splits heavy nuclei into lighter fragments; fusion combines light nuclei into heavier ones, both releasing energy when products have higher binding energy per nucleon.",
    summary:
      "Controlled fission powers reactors; uncontrolled fission yields weapons. Fusion drives stars and promises clean energy if confinement challenges are met.",
    prerequisites: [l3Id("physics", "nuclear_decay_modes")],
    unlocks: [l3Id("physics", "radiation_detection_and_dosimetry")],
    source: { source: UP3, chapter: "10", section: "10.5" },
  }),
  makePhysicsConcept({
    shortName: "radiation_detection_and_dosimetry",
    l2: NUCLEAR,
    cluster: "Applications",
    title: "Radiation Detection and Dosimetry",
    definition:
      "Measurement of ionizing radiation intensity and absorbed dose using detectors such as Geiger counters, scintillators, and dosimeters calibrated in sieverts or grays.",
    summary:
      "Detection methods map particle type and energy to observable signals. Dosimetry quantifies biological risk and guides shielding in medicine and industry.",
    prerequisites: [l3Id("physics", "nuclear_fission_and_fusion")],
    unlocks: [],
    source: { source: UP3, chapter: "10", section: "10.6" },
  }),
];
