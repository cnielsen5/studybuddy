import type { ConceptSourceReference } from "../../types/domainContext.js";
import type { SpineConcept } from "../spineSchema.js";
import { l2Id, l3Id } from "../spineDomains.js";

const TS = "2025-01-01T00:00:00Z";

function emptyLinks() {
  return { by_library: {} };
}

interface ChemistryL3Spec {
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

function makeChemistryConcept(spec: ChemistryL3Spec): SpineConcept {
  const id = l3Id("chemistry", spec.shortName);
  const parent = l2Id("chemistry", spec.l2);
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
      primary_domain: "chemistry",
    },
    dependency_graph: {
      parent_concept_id: parent,
      prerequisites,
      unlocks,
    },
    domain_contexts: [
      {
        domain_id: "chemistry",
        framing: {
          title_in_context: spec.title,
          relevance: `Core ${spec.l2.toLowerCase()} concept for predicting and explaining chemical behavior.`,
          applications: [],
          max_resolution_in_context: 3,
        },
        hierarchy_location: {
          category: "Chemistry",
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

const GEN = "General & Inorganic Chemistry";
const ORG = "Organic Chemistry";
const PHYS = "Physical Chemistry";
const BIOCHEM = "Biochemistry";
const ELECTRO = "Electrochemistry";
const NUCLEAR = "Nuclear & Radiochemistry";
const ANALYTICAL = "Analytical Chemistry";
const SPEC = "Spectroscopy & Structure Determination";

const CHEM = "OpenStax Chemistry 2e";

export const CHEMISTRY_L3: SpineConcept[] = [
  // General & Inorganic Chemistry (8)
  makeChemistryConcept({
    shortName: "atomic_structure_electron_configuration",
    l2: GEN,
    cluster: "Atomic Structure",
    title: "Atomic Structure and Electron Configuration",
    definition:
      "Atoms consist of a nucleus surrounded by electrons occupying quantized orbitals described by quantum numbers and the aufbau, Pauli, and Hund rules.",
    summary:
      "Electron configuration explains periodic trends and bonding capacity. Orbital filling diagrams predict valence behavior for main-group and transition elements.",
    prerequisites: [l2Id("chemistry", GEN)],
    unlocks: [l3Id("chemistry", "periodic_trends")],
    source: { source: CHEM, chapter: "6", section: "6.3–6.4" },
  }),
  makeChemistryConcept({
    shortName: "periodic_trends",
    l2: GEN,
    cluster: "Periodic Table",
    title: "Periodic Trends",
    definition:
      "Systematic variation of atomic radius, ionization energy, electron affinity, and electronegativity across periods and groups of the periodic table.",
    summary:
      "Periodic trends arise from effective nuclear charge and shielding. They rationalize reactivity patterns, acid strength, and bond polarity across elements.",
    prerequisites: [l3Id("chemistry", "atomic_structure_electron_configuration")],
    unlocks: [l3Id("chemistry", "ionic_and_covalent_bonding")],
    source: { source: CHEM, chapter: "6", section: "6.5–6.6" },
  }),
  makeChemistryConcept({
    shortName: "ionic_and_covalent_bonding",
    l2: GEN,
    cluster: "Chemical Bonding",
    title: "Ionic and Covalent Bonding",
    definition:
      "Atoms combine by transferring electrons to form ions or by sharing electron pairs; bond type correlates with electronegativity difference and lattice or molecular structure.",
    summary:
      "Bonding models connect microscopic electron behavior to macroscopic properties. Ionic lattices and covalent molecules differ in conductivity, melting point, and solubility.",
    prerequisites: [l3Id("chemistry", "periodic_trends")],
    unlocks: [l3Id("chemistry", "molecular_geometry_vsepr")],
    source: { source: CHEM, chapter: "7", section: "7.1–7.3" },
  }),
  makeChemistryConcept({
    shortName: "molecular_geometry_vsepr",
    l2: GEN,
    cluster: "Molecular Structure",
    title: "Molecular Geometry and VSEPR",
    definition:
      "Three-dimensional molecular shapes predicted by minimizing electron-pair repulsions around a central atom, including bond angles and molecular polarity.",
    summary:
      "VSEPR translates Lewis structures into spatial geometry. Shape determines dipole moments, intermolecular forces, and biochemical recognition.",
    prerequisites: [l3Id("chemistry", "ionic_and_covalent_bonding")],
    unlocks: [l3Id("chemistry", "stoichiometry_and_mole_concept")],
    source: { source: CHEM, chapter: "7", section: "7.4–7.6" },
  }),
  makeChemistryConcept({
    shortName: "stoichiometry_and_mole_concept",
    l2: GEN,
    cluster: "Stoichiometry",
    title: "Stoichiometry and the Mole Concept",
    definition:
      "Quantitative relationships in balanced chemical equations using the mole as Avogadro's number of entities, linking mass, amount, and particle count.",
    summary:
      "Stoichiometry is the accounting language of chemistry. Mole ratios from balanced equations predict product yields and limiting reagents.",
    prerequisites: [l3Id("chemistry", "molecular_geometry_vsepr")],
    unlocks: [l3Id("chemistry", "chemical_equations_and_balancing")],
    source: { source: CHEM, chapter: "4", section: "4.1–4.4" },
  }),
  makeChemistryConcept({
    shortName: "chemical_equations_and_balancing",
    l2: GEN,
    cluster: "Stoichiometry",
    title: "Chemical Equations and Balancing",
    definition:
      "Symbolic representation of reactions conserving atoms and charge, with coefficients adjusted to satisfy conservation of each element.",
    summary:
      "Balanced equations encode reaction stoichiometry and stoichiometric constraints. They are prerequisites for yield, titration, and thermochemical calculations.",
    prerequisites: [l3Id("chemistry", "stoichiometry_and_mole_concept")],
    unlocks: [l3Id("chemistry", "solutions_and_molarity")],
    source: { source: CHEM, chapter: "4", section: "4.5–4.6" },
  }),
  makeChemistryConcept({
    shortName: "solutions_and_molarity",
    l2: GEN,
    cluster: "Solutions",
    title: "Solutions and Molarity",
    definition:
      "Homogeneous mixtures with solute dissolved in solvent; molarity expresses amount of solute per liter of solution and guides dilution calculations.",
    summary:
      "Solution concentration units link laboratory preparation to reaction stoichiometry. Molarity is central to titrations, kinetics, and equilibrium problems.",
    prerequisites: [l3Id("chemistry", "chemical_equations_and_balancing")],
    unlocks: [l3Id("chemistry", "oxidation_states_and_redox_basics")],
    source: { source: CHEM, chapter: "11", section: "11.1–11.3" },
  }),
  makeChemistryConcept({
    shortName: "oxidation_states_and_redox_basics",
    l2: GEN,
    cluster: "Redox",
    title: "Oxidation States and Redox Basics",
    definition:
      "Oxidation state tracks electron ownership in compounds; redox reactions involve transfer of electrons between species with changes in oxidation number.",
    summary:
      "Redox bookkeeping identifies oxidizing and reducing agents. It underpins electrochemistry, metabolism, and corrosion.",
    prerequisites: [l3Id("chemistry", "solutions_and_molarity")],
    unlocks: [l3Id("chemistry", "oxidation_reduction_half_reactions")],
    source: { source: CHEM, chapter: "17", section: "17.1" },
  }),

  // Organic Chemistry (8)
  makeChemistryConcept({
    shortName: "organic_nomenclature",
    l2: ORG,
    cluster: "Nomenclature",
    title: "Organic Nomenclature",
    definition:
      "Systematic naming of carbon compounds using IUPAC rules for parent chains, substituents, functional group priority, and locants.",
    summary:
      "Nomenclature provides unambiguous communication of molecular structure. Prefixes and suffixes encode connectivity and functional groups.",
    prerequisites: [l2Id("chemistry", ORG)],
    unlocks: [l3Id("chemistry", "functional_groups_overview")],
    source: { source: CHEM, chapter: "20", section: "20.1" },
  }),
  makeChemistryConcept({
    shortName: "functional_groups_overview",
    l2: ORG,
    cluster: "Functional Groups",
    title: "Functional Groups Overview",
    definition:
      "Characteristic atom or bond groupings—such as alcohols, amines, carbonyls, and halides—that confer predictable reactivity patterns to organic molecules.",
    summary:
      "Functional groups are the vocabulary of organic reactivity. Recognizing them enables prediction of acid–base behavior, polarity, and reaction pathways.",
    prerequisites: [l3Id("chemistry", "organic_nomenclature")],
    unlocks: [l3Id("chemistry", "stereochemistry_and_chirality")],
    source: { source: CHEM, chapter: "20", section: "20.2" },
  }),
  makeChemistryConcept({
    shortName: "stereochemistry_and_chirality",
    l2: ORG,
    cluster: "Stereochemistry",
    title: "Stereochemistry and Chirality",
    definition:
      "Three-dimensional arrangement of atoms in molecules lacking improper symmetry; enantiomers are non-superimposable mirror images with identical connectivity.",
    summary:
      "Chirality affects physical properties and biological activity. R/S and E/Z notation distinguish stereoisomers with distinct pharmacological effects.",
    prerequisites: [l3Id("chemistry", "functional_groups_overview")],
    unlocks: [l3Id("chemistry", "nucleophilic_substitution_reactions")],
    source: { source: CHEM, chapter: "20", section: "20.3" },
  }),
  makeChemistryConcept({
    shortName: "nucleophilic_substitution_reactions",
    l2: ORG,
    cluster: "Reaction Mechanisms",
    title: "Nucleophilic Substitution Reactions",
    definition:
      "Reactions in which a nucleophile replaces a leaving group at saturated carbon, proceeding by SN1 or SN2 mechanisms depending on substrate and conditions.",
    summary:
      "Substitution mechanisms differ in rate law, stereochemistry, and carbocation intermediates. They are foundational for synthesizing functionalized carbon frameworks.",
    prerequisites: [l3Id("chemistry", "stereochemistry_and_chirality")],
    unlocks: [l3Id("chemistry", "elimination_reactions")],
    source: { source: CHEM, chapter: "20", section: "20.4" },
  }),
  makeChemistryConcept({
    shortName: "elimination_reactions",
    l2: ORG,
    cluster: "Reaction Mechanisms",
    title: "Elimination Reactions",
    definition:
      "Formation of double bonds by removal of adjacent atoms or groups, typically competing with substitution and favoring more substituted alkenes.",
    summary:
      "Elimination introduces pi bonds for further functionalization. Zaitsev's rule and E1/E2 pathways explain regioselectivity and stereochemical outcomes.",
    prerequisites: [l3Id("chemistry", "nucleophilic_substitution_reactions")],
    unlocks: [l3Id("chemistry", "electrophilic_addition_to_alkenes")],
    source: { source: CHEM, chapter: "20", section: "20.5" },
  }),
  makeChemistryConcept({
    shortName: "electrophilic_addition_to_alkenes",
    l2: ORG,
    cluster: "Alkenes",
    title: "Electrophilic Addition to Alkenes",
    definition:
      "Addition of electrophiles across carbon–carbon double bonds via carbocation or cyclic intermediates, following Markovnikov regioselectivity unless peroxides alter halogen hydration.",
    summary:
      "Alkene addition builds saturated and functionalized products from unsaturated precursors. Mechanistic arrows track electron flow in multistep additions.",
    prerequisites: [l3Id("chemistry", "elimination_reactions")],
    unlocks: [l3Id("chemistry", "aromatic_substitution")],
    source: { source: CHEM, chapter: "20", section: "20.6" },
  }),
  makeChemistryConcept({
    shortName: "aromatic_substitution",
    l2: ORG,
    cluster: "Aromatic Chemistry",
    title: "Aromatic Substitution",
    definition:
      "Electrophilic aromatic substitution replaces hydrogen on aromatic rings, with directing effects of substituents governing ortho, meta, and para products.",
    summary:
      "Aromatic stability from delocalized pi systems shapes substitution patterns. Friedel–Crafts and nitration reactions extend ring functionalization.",
    prerequisites: [l3Id("chemistry", "electrophilic_addition_to_alkenes")],
    unlocks: [l3Id("chemistry", "carbonyl_reactions")],
    source: { source: CHEM, chapter: "20", section: "20.7" },
  }),
  makeChemistryConcept({
    shortName: "carbonyl_reactions",
    l2: ORG,
    cluster: "Carbonyl Chemistry",
    title: "Carbonyl Reactions",
    definition:
      "Addition and substitution reactions at the carbonyl carbon of aldehydes and ketones, including nucleophilic addition, acetal formation, and related enolate chemistry.",
    summary:
      "Carbonyls are versatile synthetic handles. Their electrophilic carbon and acidic alpha protons enable a wide network of condensation and reduction reactions.",
    prerequisites: [l3Id("chemistry", "aromatic_substitution")],
    unlocks: [],
    source: { source: CHEM, chapter: "20", section: "20.8" },
  }),

  // Physical Chemistry (8)
  makeChemistryConcept({
    shortName: "gas_laws_and_kinetic_molecular_theory",
    l2: PHYS,
    cluster: "Gases",
    title: "Gas Laws and Kinetic Molecular Theory",
    definition:
      "Macroscopic gas behavior described by Boyle's, Charles's, and ideal gas laws, explained microscopically by molecular collisions and Maxwell–Boltzmann speed distributions.",
    summary:
      "Gas laws relate pressure, volume, temperature, and amount. Kinetic theory connects temperature to average molecular kinetic energy.",
    prerequisites: [l2Id("chemistry", PHYS)],
    unlocks: [l3Id("chemistry", "thermochemistry_and_enthalpy")],
    source: { source: CHEM, chapter: "9", section: "9.1–9.5" },
  }),
  makeChemistryConcept({
    shortName: "thermochemistry_and_enthalpy",
    l2: PHYS,
    cluster: "Thermochemistry",
    title: "Thermochemistry and Enthalpy",
    definition:
      "Heat changes at constant pressure quantified by enthalpy; Hess's law sums reaction enthalpies from formation data or stepwise pathways.",
    summary:
      "Thermochemistry predicts whether reactions release or absorb heat. Enthalpy diagrams visualize energy changes along reaction coordinates.",
    prerequisites: [l3Id("chemistry", "gas_laws_and_kinetic_molecular_theory")],
    unlocks: [l3Id("chemistry", "entropy_and_gibbs_free_energy")],
    source: { source: CHEM, chapter: "5", section: "5.1–5.4" },
  }),
  makeChemistryConcept({
    shortName: "entropy_and_gibbs_free_energy",
    l2: PHYS,
    cluster: "Thermodynamics",
    title: "Entropy and Gibbs Free Energy",
    definition:
      "Entropy measures energy dispersal; Gibbs free energy combines enthalpy and entropy to predict spontaneity at constant temperature and pressure.",
    summary:
      "Spontaneity requires negative Gibbs energy change. Temperature determines whether enthalpy- or entropy-driven processes dominate.",
    prerequisites: [l3Id("chemistry", "thermochemistry_and_enthalpy")],
    unlocks: [l3Id("chemistry", "chemical_equilibrium_constant")],
    source: { source: CHEM, chapter: "16", section: "16.1–16.4" },
  }),
  makeChemistryConcept({
    shortName: "chemical_equilibrium_constant",
    l2: PHYS,
    cluster: "Equilibrium",
    title: "Chemical Equilibrium Constant",
    definition:
      "Ratio of product to reactant activities raised to stoichiometric powers at equilibrium, constant at fixed temperature for a given reaction.",
    summary:
      "Equilibrium constants quantify the extent of reversible reactions. Reaction quotient comparisons predict direction of net change toward equilibrium.",
    prerequisites: [l3Id("chemistry", "entropy_and_gibbs_free_energy")],
    unlocks: [l3Id("chemistry", "le_chatelier_principle")],
    source: { source: CHEM, chapter: "13", section: "13.1–13.3" },
  }),
  makeChemistryConcept({
    shortName: "le_chatelier_principle",
    l2: PHYS,
    cluster: "Equilibrium",
    title: "Le Châtelier's Principle",
    definition:
      "A system at equilibrium shifts to partially counteract imposed changes in concentration, pressure, or temperature.",
    summary:
      "Le Châtelier's principle guides industrial yield optimization. Shifts in equilibrium position do not change the equilibrium constant itself.",
    prerequisites: [l3Id("chemistry", "chemical_equilibrium_constant")],
    unlocks: [l3Id("chemistry", "reaction_rates")],
    source: { source: CHEM, chapter: "13", section: "13.4" },
  }),
  makeChemistryConcept({
    shortName: "reaction_rates",
    l2: PHYS,
    cluster: "Chemical Kinetics",
    title: "Reaction Rates and Rate Laws",
    definition:
      "Rate of reaction expressed as concentration change per time; rate laws relate rate to reactant concentrations raised to experimentally determined orders.",
    summary:
      "Rate laws summarize how concentration affects speed of reaction. Determining orders and rate constants is prerequisite to integrated kinetics and mechanism.",
    prerequisites: [l3Id("chemistry", "le_chatelier_principle")],
    unlocks: [l3Id("chemistry", "integrated_rate_laws")],
    source: { source: CHEM, chapter: "12", section: "12.1–12.3" },
  }),
  makeChemistryConcept({
    shortName: "integrated_rate_laws",
    l2: PHYS,
    cluster: "Chemical Kinetics",
    title: "Integrated Rate Laws",
    definition:
      "Time-dependent concentration relationships for reactions of defined order; first-order processes follow exponential decay with characteristic half-life.",
    summary:
      "Integrated laws connect concentration to elapsed time for each reaction order. First-order behavior is shared with radioactive decay and drug elimination.",
    prerequisites: [
      l3Id("chemistry", "reaction_rates"),
      "spine_mathematics_l3_exponential_decay",
    ],
    unlocks: [l3Id("chemistry", "activation_energy_and_arrhenius_equation")],
    source: { source: CHEM, chapter: "12", section: "12.4" },
  }),
  makeChemistryConcept({
    shortName: "activation_energy_and_arrhenius_equation",
    l2: PHYS,
    cluster: "Chemical Kinetics",
    title: "Activation Energy and the Arrhenius Equation",
    definition:
      "Temperature dependence of rate constants described by an exponential factor involving activation energy and pre-exponential factor.",
    summary:
      "Activation energy is the barrier height on the reaction coordinate. Arrhenius plots extract activation energy from temperature-rate measurements.",
    prerequisites: [l3Id("chemistry", "integrated_rate_laws")],
    unlocks: [],
    source: { source: CHEM, chapter: "12", section: "12.5" },
  }),

  // Biochemistry (7)
  makeChemistryConcept({
    shortName: "amino_acids_and_protein_structure",
    l2: BIOCHEM,
    cluster: "Proteins",
    title: "Amino Acids and Protein Structure",
    definition:
      "Proteins are polymers of amino acids linked by peptide bonds, folding into hierarchical structures stabilized by hydrogen bonds, hydrophobic packing, and disulfide bridges.",
    summary:
      "Primary sequence determines higher-order folding and function. Secondary and tertiary structure motifs explain enzyme active sites and structural roles.",
    prerequisites: [l2Id("chemistry", BIOCHEM), l3Id("chemistry", "functional_groups_overview")],
    unlocks: ["spine_chemistry_l3_enzyme_kinetics_michaelis_menten"],
    source: { source: CHEM, chapter: "20", section: "20.2" },
  }),
  makeChemistryConcept({
    shortName: "enzyme_kinetics_michaelis_menten",
    l2: BIOCHEM,
    cluster: "Enzymes",
    title: "Enzyme Kinetics and Michaelis–Menten",
    definition:
      "Enzyme-catalyzed rates saturate with substrate concentration; Michaelis–Menten parameters Km and Vmax characterize affinity and catalytic turnover.",
    summary:
      "Enzyme kinetics quantifies catalytic efficiency and inhibition. Lineweaver–Burk analysis distinguishes competitive from noncompetitive inhibitors.",
    prerequisites: [l3Id("chemistry", "amino_acids_and_protein_structure"), l3Id("chemistry", "reaction_rates")],
    unlocks: [l3Id("chemistry", "carbohydrate_structure_and_metabolism")],
    source: { source: CHEM, chapter: "12", section: "12.2" },
  }),
  makeChemistryConcept({
    shortName: "carbohydrate_structure_and_metabolism",
    l2: BIOCHEM,
    cluster: "Carbohydrates",
    title: "Carbohydrate Structure and Metabolism",
    definition:
      "Sugars exist as linear and cyclic polyhydroxy aldehydes or ketones; central metabolic pathways oxidize glucose to extract energy as ATP.",
    summary:
      "Carbohydrate stereochemistry and anomeric forms affect reactivity and recognition. Glycolysis is the entry point for cellular energy harvest.",
    prerequisites: ["spine_chemistry_l3_enzyme_kinetics_michaelis_menten"],
    unlocks: [
      l3Id("chemistry", "lipid_structure_and_function"),
      "spine_chemistry_l3_glycolysis_and_central_metabolism",
    ],
    source: { source: CHEM, chapter: "20", section: "20.2" },
  }),
  makeChemistryConcept({
    shortName: "lipid_structure_and_function",
    l2: BIOCHEM,
    cluster: "Lipids",
    title: "Lipid Structure and Function",
    definition:
      "Hydrophobic biomolecules including fatty acids, phospholipids, and steroids that form membranes, store energy, and serve as signaling molecules.",
    summary:
      "Amphipathic lipids self-assemble into bilayers. Saturation and chain length tune membrane fluidity and metabolic fuel value.",
    prerequisites: [l3Id("chemistry", "carbohydrate_structure_and_metabolism")],
    unlocks: [l3Id("chemistry", "nucleic_acid_structure")],
    source: { source: CHEM, chapter: "20", section: "20.2" },
  }),
  makeChemistryConcept({
    shortName: "nucleic_acid_structure",
    l2: BIOCHEM,
    cluster: "Nucleic Acids",
    title: "Nucleic Acid Structure",
    definition:
      "Polymers of nucleotides with sugar-phosphate backbones and complementary base pairing between adenine–thymine (or uracil) and guanine–cytosine.",
    summary:
      "DNA stores genetic information in double helices; RNA mediates expression. Base pairing rules enable replication, transcription, and hybridization assays.",
    prerequisites: [l3Id("chemistry", "lipid_structure_and_function")],
    unlocks: [l3Id("chemistry", "dna_replication_chemistry")],
    source: { source: CHEM, chapter: "2", section: "2.6" },
  }),
  makeChemistryConcept({
    shortName: "dna_replication_chemistry",
    l2: BIOCHEM,
    cluster: "Nucleic Acids",
    title: "DNA Replication Chemistry",
    definition:
      "Template-directed synthesis of phosphodiester bonds by DNA polymerases, including primer extension, 5′→3′ directionality, and proofreading exonuclease activity.",
    summary:
      "Replication is a series of enzyme-catalyzed phosphoryl transfers and phosphodiester-forming steps. Chemistry focuses on bond-making, energy coupling, and fidelity mechanisms.",
    prerequisites: [l3Id("chemistry", "nucleic_acid_structure")],
    unlocks: [l3Id("chemistry", "transcription_chemistry")],
    source: { source: CHEM, chapter: "2", section: "2.6" },
  }),
  makeChemistryConcept({
    shortName: "transcription_chemistry",
    l2: BIOCHEM,
    cluster: "Gene Expression",
    title: "Transcription Chemistry",
    definition:
      "RNA polymerase-catalyzed assembly of ribonucleotides on a DNA template via phosphodiester bond formation, promoter recognition, and transcript termination.",
    summary:
      "Transcription couples NTP hydrolysis to RNA chain elongation. Chemistry emphasizes reaction mechanism; biological information flow remains in biology central dogma.",
    prerequisites: [l3Id("chemistry", "dna_replication_chemistry")],
    unlocks: [l3Id("chemistry", "protein_synthesis_overview")],
    source: { source: CHEM, chapter: "2", section: "2.6" },
  }),
  makeChemistryConcept({
    shortName: "glycolysis_and_central_metabolism",
    l2: BIOCHEM,
    cluster: "Metabolism",
    title: "Glycolysis and Central Metabolism",
    definition:
      "Sequential enzyme-catalyzed oxidation of glucose to pyruvate with net ATP and NADH production, feeding the citric acid cycle and oxidative phosphorylation.",
    summary:
      "Central metabolism links carbohydrate catabolism to electron transport. Regulation at key enzymes coordinates energy supply with cellular demand.",
    prerequisites: [l3Id("chemistry", "nucleic_acid_structure")],
    unlocks: [l3Id("chemistry", "protein_synthesis_overview")],
    source: { source: CHEM, chapter: "5", section: "5.4" },
  }),
  makeChemistryConcept({
    shortName: "protein_synthesis_overview",
    l2: BIOCHEM,
    cluster: "Gene Expression",
    title: "Protein Synthesis Overview",
    definition:
      "Translation of mRNA codons into polypeptide chains on ribosomes using tRNA adapters and genetic code redundancy.",
    summary:
      "Protein synthesis connects nucleic acid information to catalytic and structural function. Codon–anticodon pairing and start/stop signals define reading frames.",
    prerequisites: [l3Id("chemistry", "transcription_chemistry")],
    unlocks: [],
    source: { source: CHEM, chapter: "2", section: "2.6" },
  }),

  // Electrochemistry (7)
  makeChemistryConcept({
    shortName: "oxidation_reduction_half_reactions",
    l2: ELECTRO,
    cluster: "Redox",
    title: "Oxidation–Reduction Half-Reactions",
    definition:
      "Redox processes split into half-reactions showing electron loss (oxidation) and gain (reduction), balanced for mass and charge in aqueous media.",
    summary:
      "Half-reaction method balances complex redox equations. It prepares for cell diagrams and quantitative electrochemical calculations.",
    prerequisites: [l2Id("chemistry", ELECTRO), l3Id("chemistry", "oxidation_states_and_redox_basics")],
    unlocks: [l3Id("chemistry", "galvanic_cells_and_standard_potential")],
    source: { source: CHEM, chapter: "17", section: "17.2" },
  }),
  makeChemistryConcept({
    shortName: "galvanic_cells_and_standard_potential",
    l2: ELECTRO,
    cluster: "Electrochemical Cells",
    title: "Galvanic Cells and Standard Potential",
    definition:
      "Spontaneous redox reactions in separated half-cells produce measurable voltage; standard electrode potentials rank oxidizing and reducing strength.",
    summary:
      "Galvanic cells convert chemical energy to electrical work. Standard potentials predict spontaneity and equilibrium constants for redox couples.",
    prerequisites: [l3Id("chemistry", "oxidation_reduction_half_reactions")],
    unlocks: [l3Id("chemistry", "nernst_equation")],
    source: { source: CHEM, chapter: "17", section: "17.3–17.4" },
  }),
  makeChemistryConcept({
    shortName: "nernst_equation",
    l2: ELECTRO,
    cluster: "Electrochemical Cells",
    title: "Nernst Equation",
    definition:
      "Cell potential at nonstandard conditions depends on reaction quotient and number of electrons transferred, reducing to standard potential when activities equal standard states.",
    summary:
      "The Nernst equation links concentration changes to cell voltage. It explains concentration cells and membrane potentials in biological systems.",
    prerequisites: [l3Id("chemistry", "galvanic_cells_and_standard_potential")],
    unlocks: [l3Id("chemistry", "electrolysis_and_faradays_law")],
    source: { source: CHEM, chapter: "17", section: "17.5" },
  }),
  makeChemistryConcept({
    shortName: "electrolysis_and_faradays_law",
    l2: ELECTRO,
    cluster: "Electrolysis",
    title: "Electrolysis and Faraday's Law",
    definition:
      "Nonspontaneous redox driven by external voltage; moles of substance produced at electrodes proportional to charge passed and stoichiometric electrons.",
    summary:
      "Electrolysis enables metal refining and gas generation. Faraday's law quantifies charge–amount relationships in coulometric analysis.",
    prerequisites: [l3Id("chemistry", "nernst_equation")],
    unlocks: [l3Id("chemistry", "corrosion_electrochemistry")],
    source: { source: CHEM, chapter: "17", section: "17.6" },
  }),
  makeChemistryConcept({
    shortName: "corrosion_electrochemistry",
    l2: ELECTRO,
    cluster: "Applied Electrochemistry",
    title: "Corrosion Electrochemistry",
    definition:
      "Oxidative degradation of metals by environmental redox couples forming rust and pitting, accelerated by differential aeration and galvanic coupling.",
    summary:
      "Corrosion is unintended galvanic activity on metal surfaces. Cathodic protection and coatings mitigate economic and safety losses.",
    prerequisites: [l3Id("chemistry", "electrolysis_and_faradays_law")],
    unlocks: [l3Id("chemistry", "batteries_and_fuel_cells")],
    source: { source: CHEM, chapter: "17", section: "17.7" },
  }),
  makeChemistryConcept({
    shortName: "batteries_and_fuel_cells",
    l2: ELECTRO,
    cluster: "Energy Storage",
    title: "Batteries and Fuel Cells",
    definition:
      "Engineered electrochemical devices converting stored or supplied chemical energy to electrical energy through controlled redox reactions.",
    summary:
      "Battery chemistry trades energy density, cycle life, and safety. Fuel cells provide continuous power from external fuel streams.",
    prerequisites: [l3Id("chemistry", "corrosion_electrochemistry")],
    unlocks: [l3Id("chemistry", "ionic_conductance_and_electrolytes")],
    source: { source: CHEM, chapter: "17", section: "17.8" },
  }),
  makeChemistryConcept({
    shortName: "ionic_conductance_and_electrolytes",
    l2: ELECTRO,
    cluster: "Solution Conductivity",
    title: "Ionic Conductance and Electrolytes",
    definition:
      "Electrical conductivity of solutions proportional to ion concentration and mobility; strong electrolytes dissociate fully while weak electrolytes establish equilibrium.",
    summary:
      "Conductance measures ionic strength in analytical and physiological fluids. Kohlrausch's law relates conductivity to individual ion contributions.",
    prerequisites: [l3Id("chemistry", "batteries_and_fuel_cells")],
    unlocks: [],
    source: { source: CHEM, chapter: "11", section: "11.6" },
  }),

  // Nuclear & Radiochemistry (7)
  makeChemistryConcept({
    shortName: "nuclear_stability_and_binding",
    l2: NUCLEAR,
    cluster: "Nuclear Structure",
    title: "Nuclear Stability and Binding",
    definition:
      "Stability of nuclides governed by neutron-to-proton ratio, magic numbers, and binding energy per nucleon relative to iron peak.",
    summary:
      "Nuclear stability charts predict likely decay modes. Binding energy explains mass defects measured in mass spectrometry.",
    prerequisites: [l2Id("chemistry", NUCLEAR)],
    unlocks: ["spine_mathematics_l3_exponential_decay"],
    source: { source: CHEM, chapter: "21", section: "21.1" },
  }),
  makeChemistryConcept({
    shortName: "nuclear_transmutation_reactions",
    l2: NUCLEAR,
    cluster: "Nuclear Reactions",
    title: "Nuclear Transmutation Reactions",
    definition:
      "Bombardment of nuclei with particles or absorption of neutrons producing new elements or isotopes, balanced for mass and atomic numbers.",
    summary:
      "Artificial transmutation extends the periodic table and produces medical isotopes. Nuclear equations track particles and conservation laws.",
    prerequisites: [
      l3Id("chemistry", "nuclear_stability_and_binding"),
      "spine_mathematics_l3_exponential_decay",
    ],
    unlocks: [l3Id("chemistry", "nuclear_fission_and_fusion_energy")],
    source: { source: CHEM, chapter: "21", section: "21.3" },
  }),
  makeChemistryConcept({
    shortName: "nuclear_fission_and_fusion_energy",
    l2: NUCLEAR,
    cluster: "Nuclear Reactions",
    title: "Nuclear Fission and Fusion Energy",
    definition:
      "Energy release when heavy nuclei split or light nuclei fuse to more tightly bound products, with chain reactions possible under critical conditions.",
    summary:
      "Fission powers commercial reactors; fusion remains an active research frontier. Mass–energy equivalence quantifies energy yields.",
    prerequisites: [l3Id("chemistry", "nuclear_transmutation_reactions")],
    unlocks: [l3Id("chemistry", "radiometric_dating")],
    source: { source: CHEM, chapter: "21", section: "21.4" },
  }),
  makeChemistryConcept({
    shortName: "radiometric_dating",
    l2: NUCLEAR,
    cluster: "Applications",
    title: "Radiometric Dating",
    definition:
      "Age determination from measured parent-to-daughter isotope ratios and known decay constants, assuming closed-system behavior.",
    summary:
      "Radiometric dating anchors geological and archaeological timelines. Isotope choice depends on sample age and half-life scale.",
    prerequisites: [l3Id("chemistry", "nuclear_fission_and_fusion_energy")],
    unlocks: [l3Id("chemistry", "radiation_types_and_shielding")],
    source: { source: CHEM, chapter: "21", section: "21.5" },
  }),
  makeChemistryConcept({
    shortName: "radiation_types_and_shielding",
    l2: NUCLEAR,
    cluster: "Radiation Safety",
    title: "Radiation Types and Shielding",
    definition:
      "Ionizing radiation classified as alpha, beta, gamma, or neutron with distinct penetration ranges and shielding requirements.",
    summary:
      "Radiation type determines hazard distance and protection strategy. Shielding design balances material thickness and density.",
    prerequisites: [l3Id("chemistry", "radiometric_dating")],
    unlocks: [l3Id("chemistry", "radiotracer_applications")],
    source: { source: CHEM, chapter: "21", section: "21.6" },
  }),
  makeChemistryConcept({
    shortName: "radiotracer_applications",
    l2: NUCLEAR,
    cluster: "Applications",
    title: "Radiotracer Applications",
    definition:
      "Use of radioactive isotopes as detectable labels to trace chemical pathways, diagnose disease, and measure flow in industrial processes.",
    summary:
      "Tracers exploit identical chemistry with measurable decay. PET and SPECT imaging rely on short-lived positron emitters.",
    prerequisites: [l3Id("chemistry", "radiation_types_and_shielding")],
    unlocks: [],
    source: { source: CHEM, chapter: "21", section: "21.7" },
  }),

  // Analytical Chemistry (8)
  makeChemistryConcept({
    shortName: "measurement_precision_and_accuracy",
    l2: ANALYTICAL,
    cluster: "Measurement",
    title: "Measurement Precision and Accuracy",
    definition:
      "Accuracy is closeness to true value; precision is reproducibility of repeated measurements, with uncertainty propagated through calculations.",
    summary:
      "Analytical conclusions depend on measurement quality. Significant figures and error analysis distinguish systematic from random error.",
    prerequisites: [l2Id("chemistry", ANALYTICAL)],
    unlocks: [l3Id("chemistry", "gravimetric_analysis")],
    source: { source: CHEM, chapter: "1", section: "1.5" },
  }),
  makeChemistryConcept({
    shortName: "gravimetric_analysis",
    l2: ANALYTICAL,
    cluster: "Quantitative Methods",
    title: "Gravimetric Analysis",
    definition:
      "Quantitative determination of analyte mass by precipitation, filtration, drying, and weighing of a pure product of known stoichiometry.",
    summary:
      "Gravimetry offers high accuracy when precipitation is complete and selective. It remains a reference method for standardization.",
    prerequisites: [l3Id("chemistry", "measurement_precision_and_accuracy")],
    unlocks: [l3Id("chemistry", "acid_base_titration")],
    source: { source: CHEM, chapter: "3", section: "3.4" },
  }),
  makeChemistryConcept({
    shortName: "acid_base_titration",
    l2: ANALYTICAL,
    cluster: "Titrimetry",
    title: "Acid–Base Titration",
    definition:
      "Volumetric analysis determining analyte concentration by neutralization with standard acid or base to an equivalence point indicated by pH or indicator.",
    summary:
      "Titration curves reveal weak and strong acid–base behavior. Equivalence point detection enables concentration and purity assays.",
    prerequisites: [l3Id("chemistry", "gravimetric_analysis")],
    unlocks: [l3Id("chemistry", "beer_lambert_law_spectrophotometry")],
    source: { source: CHEM, chapter: "14", section: "14.5" },
  }),
  makeChemistryConcept({
    shortName: "beer_lambert_law_spectrophotometry",
    l2: ANALYTICAL,
    cluster: "Spectrophotometry",
    title: "Beer–Lambert Law and Spectrophotometry",
    definition:
      "Absorbance proportional to concentration and path length for dilute solutions, enabling quantitative analysis from measured transmittance.",
    summary:
      "Spectrophotometry is rapid and nondestructive for colored species. Calibration curves relate absorbance to concentration in clinical and environmental labs.",
    prerequisites: [l3Id("chemistry", "acid_base_titration")],
    unlocks: [l3Id("chemistry", "chromatography_separation")],
    source: { source: CHEM, chapter: "3", section: "3.5" },
  }),
  makeChemistryConcept({
    shortName: "chromatography_separation",
    l2: ANALYTICAL,
    cluster: "Separation",
    title: "Chromatography Separation",
    definition:
      "Partition of mixture components between mobile and stationary phases producing differential migration and resolution of analytes.",
    summary:
      "Chromatography separates complex mixtures for identification and quantification. Retention time and plate theory optimize resolution.",
    prerequisites: [l3Id("chemistry", "beer_lambert_law_spectrophotometry")],
    unlocks: [l3Id("chemistry", "qualitative_cation_anion_tests")],
    source: { source: CHEM, chapter: "3", section: "3.6" },
  }),
  makeChemistryConcept({
    shortName: "qualitative_cation_anion_tests",
    l2: ANALYTICAL,
    cluster: "Qualitative Analysis",
    title: "Qualitative Cation and Anion Tests",
    definition:
      "Systematic precipitation, flame tests, and color reactions identifying ionic species in unknown mixtures by characteristic products.",
    summary:
      "Qualitative schemes build logic trees from solubility rules and selective precipitants. They train pattern recognition before instrumental methods.",
    prerequisites: [l3Id("chemistry", "chromatography_separation")],
    unlocks: [l3Id("chemistry", "electrochemical_analytical_methods")],
    source: { source: CHEM, chapter: "3", section: "3.7" },
  }),
  makeChemistryConcept({
    shortName: "electrochemical_analytical_methods",
    l2: ANALYTICAL,
    cluster: "Electroanalysis",
    title: "Electrochemical Analytical Methods",
    definition:
      "Quantitative analysis using potentiometry, voltammetry, and coulometry to relate electrical signals to analyte concentration.",
    summary:
      "Electroanalytical methods offer sensitivity for trace ions. Ion-selective electrodes and stripping voltammetry extend detection limits.",
    prerequisites: [l3Id("chemistry", "qualitative_cation_anion_tests"), l3Id("chemistry", "nernst_equation")],
    unlocks: [l3Id("chemistry", "calibration_and_standard_curves")],
    source: { source: CHEM, chapter: "17", section: "17.5" },
  }),
  makeChemistryConcept({
    shortName: "calibration_and_standard_curves",
    l2: ANALYTICAL,
    cluster: "Quantitative Methods",
    title: "Calibration and Standard Curves",
    definition:
      "Regression of instrument response against known standard concentrations to interpolate unknown analyte amounts with quantified uncertainty.",
    summary:
      "Calibration transfers instrument signal to concentration units. Method validation requires linear range, limit of detection, and matrix effects.",
    prerequisites: [l3Id("chemistry", "electrochemical_analytical_methods")],
    unlocks: [],
    source: { source: CHEM, chapter: "1", section: "1.5" },
  }),

  // Spectroscopy & Structure Determination (7)
  makeChemistryConcept({
    shortName: "electromagnetic_spectrum_molecular",
    l2: SPEC,
    cluster: "Spectroscopy Foundations",
    title: "Electromagnetic Spectrum and Molecular Interactions",
    definition:
      "Molecules absorb or emit photons at energies matching electronic, vibrational, or rotational transitions across the electromagnetic spectrum.",
    summary:
      "Spectral regions probe different molecular energy levels. Matching photon energy to transition type selects appropriate spectroscopic technique.",
    prerequisites: [l2Id("chemistry", SPEC)],
    unlocks: [l3Id("chemistry", "uv_visible_spectroscopy")],
    source: { source: CHEM, chapter: "6", section: "6.1" },
  }),
  makeChemistryConcept({
    shortName: "uv_visible_spectroscopy",
    l2: SPEC,
    cluster: "Electronic Spectroscopy",
    title: "UV–Visible Spectroscopy",
    definition:
      "Electronic transitions from absorption of ultraviolet and visible light, with wavelength maxima characteristic of conjugated and chromophoric groups.",
    summary:
      "UV–Vis identifies chromophores and monitors reaction progress. Extinction coefficients quantify absorption strength for Beer–Lambert analysis.",
    prerequisites: [l3Id("chemistry", "electromagnetic_spectrum_molecular")],
    unlocks: [l3Id("chemistry", "infrared_spectroscopy")],
    source: { source: CHEM, chapter: "6", section: "6.2" },
  }),
  makeChemistryConcept({
    shortName: "infrared_spectroscopy",
    l2: SPEC,
    cluster: "Vibrational Spectroscopy",
    title: "Infrared Spectroscopy",
    definition:
      "Absorption of infrared radiation exciting molecular vibrations, with characteristic bands for functional groups and bond types.",
    summary:
      "IR fingerprints functional groups in organic and inorganic samples. Peak positions and intensities support structure elucidation.",
    prerequisites: [l3Id("chemistry", "uv_visible_spectroscopy")],
    unlocks: [l3Id("chemistry", "nuclear_magnetic_resonance")],
    source: { source: CHEM, chapter: "8", section: "8.4" },
  }),
  makeChemistryConcept({
    shortName: "nuclear_magnetic_resonance",
    l2: SPEC,
    cluster: "Magnetic Resonance",
    title: "Nuclear Magnetic Resonance",
    definition:
      "Resonance absorption by nuclei with spin in magnetic fields, with chemical shift, coupling, and integration revealing molecular connectivity.",
    summary:
      "NMR is the premier tool for organic structure determination in solution. Multiplicity patterns reveal neighboring proton environments.",
    prerequisites: [l3Id("chemistry", "infrared_spectroscopy")],
    unlocks: [l3Id("chemistry", "mass_spectrometry")],
    source: { source: CHEM, chapter: "8", section: "8.5" },
  }),
  makeChemistryConcept({
    shortName: "mass_spectrometry",
    l2: SPEC,
    cluster: "Mass Spectrometry",
    title: "Mass Spectrometry",
    definition:
      "Ionization and mass-to-charge separation of molecules producing molecular ion peaks and fragmentation patterns for molecular weight and formula.",
    summary:
      "Mass spectrometry provides exact masses and isotopic patterns. Fragmentation rules complement NMR and IR for structure proof.",
    prerequisites: [l3Id("chemistry", "nuclear_magnetic_resonance")],
    unlocks: [l3Id("chemistry", "xray_diffraction_crystallography")],
    source: { source: CHEM, chapter: "2", section: "2.7" },
  }),
  makeChemistryConcept({
    shortName: "xray_diffraction_crystallography",
    l2: SPEC,
    cluster: "Diffraction Methods",
    title: "X-Ray Diffraction Crystallography",
    definition:
      "Bragg diffraction of X-rays by crystal lattices yielding electron density maps and three-dimensional atomic coordinates.",
    summary:
      "X-ray crystallography resolves structures at atomic resolution. Unit cells and space groups index diffraction patterns.",
    prerequisites: [l3Id("chemistry", "mass_spectrometry")],
    unlocks: [l3Id("chemistry", "rotational_vibrational_spectra")],
    source: { source: CHEM, chapter: "10", section: "10.6" },
  }),
  makeChemistryConcept({
    shortName: "rotational_vibrational_spectra",
    l2: SPEC,
    cluster: "Molecular Spectroscopy",
    title: "Rotational and Vibrational Spectra",
    definition:
      "Quantized rotational and vibrational energy levels producing discrete spectral lines whose spacing reveals bond lengths and force constants.",
    summary:
      "High-resolution gas-phase spectra probe molecular geometry and bonding. Rovibrational coupling appears in atmospheric and astrochemical analysis.",
    prerequisites: [l3Id("chemistry", "xray_diffraction_crystallography")],
    unlocks: [],
    source: { source: CHEM, chapter: "9", section: "9.6" },
  }),
];
