import type { SpineConcept } from "../spineSchema.js";
import { l2Id, l3Id } from "../spineDomains.js";

const TS = "2025-01-01T00:00:00Z";
function emptyLinks() {
  return { by_library: {} };
}

function mathContext(
  subcategory: string,
  topic: string,
  relevance: string,
  maxResolution: 3 | 4 = 3
) {
  return {
    domain_id: "mathematics" as const,
    framing: {
      title_in_context: topic,
      relevance,
      applications: [] as string[],
      max_resolution_in_context: maxResolution,
    },
    hierarchy_location: {
      category: "Mathematics",
      subcategory,
      topic,
      subtopic: null,
    },
    dependency_graph: {
      prerequisites_in_context: [] as string[],
      unlocks_in_context: [] as string[],
    },
    linked_content: emptyLinks(),
  };
}

export const MATHEMATICS_L3: SpineConcept[] = [
  // ── Arithmetic & Pre-Algebra (5) ──────────────────────────────────────────
  {
    id: l3Id("mathematics", "integer_operations"),
    resolution_level: 3,
    content: {
      title: "Integer Operations and Order of Operations",
      definition:
        "The rules for adding, subtracting, multiplying, and dividing integers, combined with the conventional order in which operations are performed (parentheses, exponents, multiplication/division, addition/subtraction).",
      summary:
        "Integer operations extend whole-number arithmetic to negative values while preserving sign rules for products and quotients. The order-of-operations convention removes ambiguity in multi-step expressions and is prerequisite to all symbolic algebra.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Number Sense",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Arithmetic & Pre-Algebra"),
      prerequisites: [],
      unlocks: [
        l3Id("mathematics", "fractions_and_decimals"),
        l3Id("mathematics", "absolute_value"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Arithmetic & Pre-Algebra",
        "Integer Operations and Order of Operations",
        "Foundational computational fluency for every later branch of mathematics."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Prealgebra 2e",
          chapter: "3",
          section: "3.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "fractions_and_decimals"),
    resolution_level: 3,
    content: {
      title: "Fractions and Decimals",
      definition:
        "Rational numbers expressed as ratios of integers (fractions) or base-ten positional notation (decimals), including equivalence, comparison, and arithmetic.",
      summary:
        "Fractions model part-whole relationships and division; decimals offer an alternative representation tied to place value. Converting between forms and performing operations on rational numbers supports proportional reasoning and algebraic manipulation.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Number Sense",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Arithmetic & Pre-Algebra"),
      prerequisites: [l3Id("mathematics", "integer_operations")],
      unlocks: [
        l3Id("mathematics", "ratios_and_proportions"),
        l3Id("mathematics", "percentages"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Arithmetic & Pre-Algebra",
        "Fractions and Decimals",
        "Rational number fluency underpins algebra, statistics, and applied modeling."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Prealgebra 2e",
          chapter: "4",
          section: "4.2",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "ratios_and_proportions"),
    resolution_level: 3,
    content: {
      title: "Ratios and Proportions",
      definition:
        "A ratio compares two quantities; a proportion states that two ratios are equal, enabling scaling and solving for unknown values via cross-multiplication.",
      summary:
        "Ratios express relative size without fixed units, while proportions formalize equality of rates. These tools appear in unit conversion, similar figures, and linear modeling throughout mathematics and the sciences.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Proportional Reasoning",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Arithmetic & Pre-Algebra"),
      prerequisites: [l3Id("mathematics", "fractions_and_decimals")],
      unlocks: [l3Id("mathematics", "linear_equations_one_variable")],
    },
    domain_contexts: [
      mathContext(
        "Arithmetic & Pre-Algebra",
        "Ratios and Proportions",
        "Core proportional reasoning used in algebra, geometry similarity, and data interpretation."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Prealgebra 2e",
          chapter: "6",
          section: "6.2",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "percentages"),
    resolution_level: 3,
    content: {
      title: "Percentages",
      definition:
        "A percentage expresses a number as a fraction of 100, used to describe parts, rates of change, and comparisons in everyday and scientific contexts.",
      summary:
        "Percents connect fractional and decimal representations to intuitive hundredths-scale comparisons. Computing percent of a quantity, percent change, and reverse-percent problems is essential for finance, statistics, and scientific literacy.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Proportional Reasoning",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Arithmetic & Pre-Algebra"),
      prerequisites: [l3Id("mathematics", "fractions_and_decimals")],
      unlocks: [l3Id("mathematics", "descriptive_statistics")],
    },
    domain_contexts: [
      mathContext(
        "Arithmetic & Pre-Algebra",
        "Percentages",
        "Percent reasoning supports data literacy and introductory probability."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Prealgebra 2e",
          chapter: "6",
          section: "6.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "absolute_value"),
    resolution_level: 3,
    content: {
      title: "Absolute Value",
      definition:
        "The absolute value of a real number is its distance from zero on the number line, denoted |x| and always nonnegative.",
      summary:
        "Absolute value formalizes distance without direction and appears in solving equations and inequalities involving magnitude. It bridges arithmetic intuition with algebraic notation used in calculus limits and piecewise functions.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Number Sense",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Arithmetic & Pre-Algebra"),
      prerequisites: [l3Id("mathematics", "integer_operations")],
      unlocks: [l3Id("mathematics", "linear_equations_one_variable")],
    },
    domain_contexts: [
      mathContext(
        "Arithmetic & Pre-Algebra",
        "Absolute Value",
        "Distance on the number line supports equation solving and later analysis of continuity."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Elementary Algebra 2e",
          chapter: "1",
          section: "1.3",
        },
      ],
    },
  },

  // ── Algebra (5) ───────────────────────────────────────────────────────────
  {
    id: l3Id("mathematics", "linear_equations_one_variable"),
    resolution_level: 3,
    content: {
      title: "Linear Equations in One Variable",
      definition:
        "An equation of the form ax + b = c whose solution is the value of x that makes both sides equal, found by inverse operations and balance principles.",
      summary:
        "Linear equations in one variable introduce symbolic reasoning and the notion of a solution set. Mastery here supports systems of equations, function modeling, and the algebraic manipulations used throughout calculus and linear algebra.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Algebraic Structure",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Algebra"),
      prerequisites: [
        l3Id("mathematics", "ratios_and_proportions"),
        l3Id("mathematics", "absolute_value"),
      ],
      unlocks: [
        l3Id("mathematics", "systems_of_linear_equations"),
        l3Id("mathematics", "function_notation"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Algebra",
        "Linear Equations in One Variable",
        "Entry point to formal algebra and equation-solving strategies."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Elementary Algebra 2e",
          chapter: "2",
          section: "2.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "polynomial_expressions"),
    resolution_level: 3,
    content: {
      title: "Polynomial Expressions",
      definition:
        "A polynomial is a finite sum of terms of the form ax^n where n is a nonnegative integer; operations include addition, subtraction, multiplication, and division by monomials.",
      summary:
        "Polynomials generalize linear expressions to higher-degree terms and form the building blocks of factoring and function families. Fluency with polynomial algebra is required before studying quadratics, rational functions, and Taylor approximations.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Algebraic Structure",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Algebra"),
      prerequisites: [l3Id("mathematics", "linear_equations_one_variable")],
      unlocks: [
        l3Id("mathematics", "factoring_polynomials"),
        l3Id("mathematics", "polynomial_functions"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Algebra",
        "Polynomial Expressions",
        "Polynomial manipulation underpins factoring, function analysis, and calculus."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Elementary Algebra 2e",
          chapter: "5",
          section: "5.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "factoring_polynomials"),
    resolution_level: 3,
    content: {
      title: "Factoring Polynomials",
      definition:
        "Rewriting a polynomial as a product of simpler polynomials or monomials using techniques such as greatest common factor, grouping, and special-product patterns.",
      summary:
        "Factoring reverses multiplication and reveals zeros and structure hidden in expanded form. It is the primary method for solving many quadratic and higher-degree equations and for simplifying rational expressions.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Algebraic Structure",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Algebra"),
      prerequisites: [l3Id("mathematics", "polynomial_expressions")],
      unlocks: [l3Id("mathematics", "quadratic_equations")],
    },
    domain_contexts: [
      mathContext(
        "Algebra",
        "Factoring Polynomials",
        "Factoring connects polynomial algebra to equation solving and graphing."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Elementary Algebra 2e",
          chapter: "6",
          section: "6.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "quadratic_equations"),
    resolution_level: 3,
    content: {
      title: "Quadratic Equations",
      definition:
        "Equations of the form ax² + bx + c = 0 (a ≠ 0), solved by factoring, completing the square, or the quadratic formula, with up to two real solutions.",
      summary:
        "Quadratic equations model parabolic motion, area optimization, and numerous applied problems. Understanding their solution methods and the discriminant prepares students for conic sections, complex numbers, and calculus applications.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Algebraic Structure",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Algebra"),
      prerequisites: [l3Id("mathematics", "factoring_polynomials")],
      unlocks: [
        l3Id("mathematics", "polynomial_functions"),
        l3Id("mathematics", "trigonometric_ratios"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Algebra",
        "Quadratic Equations",
        "Quadratics link algebraic solving to parabolic graphs and applied optimization."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Elementary Algebra 2e",
          chapter: "9",
          section: "9.2",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "systems_of_linear_equations"),
    resolution_level: 3,
    content: {
      title: "Systems of Linear Equations",
      definition:
        "A collection of two or more linear equations in the same variables, solved simultaneously by substitution, elimination, or matrix methods to find values satisfying all equations.",
      summary:
        "Systems model constraints that must hold together, such as intersecting lines or balancing chemical equations. Solution techniques foreshadow linear algebra and appear throughout multivariable calculus and applied modeling.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Algebraic Structure",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Algebra"),
      prerequisites: [l3Id("mathematics", "linear_equations_one_variable")],
      unlocks: [
        l3Id("mathematics", "matrix_operations"),
        l3Id("mathematics", "matrix_methods_for_systems"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Algebra",
        "Systems of Linear Equations",
        "Simultaneous linear constraints are foundational for linear algebra and modeling."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Elementary Algebra 2e",
          chapter: "4",
          section: "4.1",
        },
      ],
    },
  },

  // ── Geometry & Trigonometry (5) ─────────────────────────────────────────
  {
    id: l3Id("mathematics", "triangle_properties"),
    resolution_level: 3,
    content: {
      title: "Triangle Properties and Angle Relationships",
      definition:
        "The sum of interior angles in a triangle is 180°, with classifications by side length (equilateral, isosceles, scalene) and angle measure (acute, right, obtuse).",
      summary:
        "Triangle properties connect angle arithmetic to geometric proof and coordinate methods. They support similarity, trigonometry, and vector decomposition in later courses.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Spatial Reasoning",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Geometry & Trigonometry"),
      prerequisites: [l3Id("mathematics", "integer_operations")],
      unlocks: [
        l3Id("mathematics", "pythagorean_theorem"),
        l3Id("mathematics", "trigonometric_ratios"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Geometry & Trigonometry",
        "Triangle Properties and Angle Relationships",
        "Triangle facts anchor Euclidean geometry and trigonometric definitions."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Prealgebra 2e",
          chapter: "9",
          section: "9.3",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "pythagorean_theorem"),
    resolution_level: 3,
    content: {
      title: "Pythagorean Theorem",
      definition:
        "In a right triangle with legs a and b and hypotenuse c, a² + b² = c², relating side lengths through the square of the longest side.",
      summary:
        "The Pythagorean theorem is the central relationship of right-triangle geometry and underpins distance formulas in coordinate and vector settings. It appears in trigonometric identities, physics vector components, and error metrics.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Spatial Reasoning",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Geometry & Trigonometry"),
      prerequisites: [l3Id("mathematics", "triangle_properties")],
      unlocks: [
        l3Id("mathematics", "trigonometric_ratios"),
        l3Id("mathematics", "vectors_in_space"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Geometry & Trigonometry",
        "Pythagorean Theorem",
        "Right-triangle side relation extends to distance in coordinate and vector geometry."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Prealgebra 2e",
          chapter: "9",
          section: "9.3",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "circle_geometry"),
    resolution_level: 3,
    content: {
      title: "Circle Geometry",
      definition:
        "A circle is the set of points equidistant from a center; key measures include radius, diameter, circumference C = 2πr, and area A = πr².",
      summary:
        "Circle geometry introduces π and curved measure, linking algebra to periodic phenomena. Arc length and sector area formulas connect directly to radian measure and trigonometric functions on the unit circle.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Spatial Reasoning",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Geometry & Trigonometry"),
      prerequisites: [l3Id("mathematics", "triangle_properties")],
      unlocks: [l3Id("mathematics", "unit_circle_and_radians")],
    },
    domain_contexts: [
      mathContext(
        "Geometry & Trigonometry",
        "Circle Geometry",
        "Circles bridge plane geometry to radian measure and periodic functions."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Prealgebra 2e",
          chapter: "9",
          section: "9.5",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "trigonometric_ratios"),
    resolution_level: 3,
    content: {
      title: "Trigonometric Ratios",
      definition:
        "In a right triangle, sine, cosine, and tangent are ratios of side lengths relative to an acute angle: sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, tan θ = opposite/adjacent.",
      summary:
        "Trigonometric ratios quantify angle-size relationships in triangles and extend to all real angles via the unit circle. They are essential for modeling waves, rotations, and periodic behavior in physics and engineering.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Spatial Reasoning",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Geometry & Trigonometry"),
      prerequisites: [
        l3Id("mathematics", "pythagorean_theorem"),
        l3Id("mathematics", "quadratic_equations"),
      ],
      unlocks: [l3Id("mathematics", "unit_circle_and_radians")],
    },
    domain_contexts: [
      mathContext(
        "Geometry & Trigonometry",
        "Trigonometric Ratios",
        "Right-triangle ratios generalize to circular functions used throughout calculus."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Algebra and Trigonometry 2e",
          chapter: "7",
          section: "7.2",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "unit_circle_and_radians"),
    resolution_level: 3,
    content: {
      title: "Unit Circle and Radian Measure",
      definition:
        "Radians measure arc length per unit radius; on the unit circle (radius 1), coordinates (cos θ, sin θ) define trigonometric values for all real θ.",
      summary:
        "Radian measure aligns angle size with arc length and is the standard unit in calculus. The unit circle extends trigonometry beyond right triangles and supports analysis of periodic functions and complex exponentials.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Spatial Reasoning",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Geometry & Trigonometry"),
      prerequisites: [
        l3Id("mathematics", "trigonometric_ratios"),
        l3Id("mathematics", "circle_geometry"),
      ],
      unlocks: [
        l3Id("mathematics", "limits_and_continuity"),
        l3Id("mathematics", "exponential_functions"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Geometry & Trigonometry",
        "Unit Circle and Radian Measure",
        "Radians and the unit circle are prerequisite to calculus and complex analysis.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Algebra and Trigonometry 2e",
          chapter: "7",
          section: "7.4",
        },
      ],
    },
  },

  // ── Pre-Calculus & Functions (5) ─────────────────────────────────────────
  {
    id: l3Id("mathematics", "function_notation"),
    resolution_level: 3,
    content: {
      title: "Function Notation, Domain, and Range",
      definition:
        "A function assigns each input in its domain exactly one output in its range; notation f(x) denotes the output for input x.",
      summary:
        "Function notation formalizes input-output relationships central to all advanced mathematics. Identifying domain and range constraints prevents invalid operations and supports composition, inversion, and modeling.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Functions & Graphs",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Pre-Calculus & Functions"),
      prerequisites: [l3Id("mathematics", "linear_equations_one_variable")],
      unlocks: [
        l3Id("mathematics", "polynomial_functions"),
        l3Id("mathematics", "limits_and_continuity"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Pre-Calculus & Functions",
        "Function Notation, Domain, and Range",
        "Functions unify algebraic, geometric, and applied representations of change."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Precalculus 2e",
          chapter: "1",
          section: "1.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "polynomial_functions"),
    resolution_level: 3,
    content: {
      title: "Polynomial Functions",
      definition:
        "A polynomial function has the form f(x) = a_n x^n + … + a_1 x + a_0; its graph is smooth with end behavior determined by leading term and degree.",
      summary:
        "Polynomial functions combine algebraic structure with graphical analysis through zeros, turning points, and end behavior. They serve as local approximations in calculus and as building blocks for rational and transcendental models.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Functions & Graphs",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Pre-Calculus & Functions"),
      prerequisites: [
        l3Id("mathematics", "polynomial_expressions"),
        l3Id("mathematics", "function_notation"),
        l3Id("mathematics", "quadratic_equations"),
      ],
      unlocks: [l3Id("mathematics", "rational_functions")],
    },
    domain_contexts: [
      mathContext(
        "Pre-Calculus & Functions",
        "Polynomial Functions",
        "Polynomial graphs connect algebraic roots to qualitative function behavior."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Precalculus 2e",
          chapter: "3",
          section: "3.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "rational_functions"),
    resolution_level: 3,
    content: {
      title: "Rational Functions",
      definition:
        "A rational function is a ratio of polynomial functions, f(x) = p(x)/q(x), with domain excluding zeros of the denominator and possible vertical asymptotes.",
      summary:
        "Rational functions model inverse variation, rates with limiting behavior, and asymptotic growth. Analyzing holes, asymptotes, and domains prepares students for integration techniques and differential-equation models.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Functions & Graphs",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Pre-Calculus & Functions"),
      prerequisites: [l3Id("mathematics", "polynomial_functions")],
      unlocks: [l3Id("mathematics", "limits_and_continuity")],
    },
    domain_contexts: [
      mathContext(
        "Pre-Calculus & Functions",
        "Rational Functions",
        "Rational functions introduce asymptotic behavior central to limits and rates."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Precalculus 2e",
          chapter: "3",
          section: "3.5",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "exponential_functions"),
    resolution_level: 3,
    content: {
      title: "Exponential Functions",
      definition:
        "An exponential function has the form f(x) = a·b^x (b > 0, b ≠ 1), with constant proportional growth or decay per unit change in x.",
      summary:
        "Exponential functions model compound growth, radioactive processes, and scaling phenomena across sciences. Their inverse relationship with logarithms and connection to the natural base e underpin calculus and differential equations.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Functions & Graphs",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Pre-Calculus & Functions"),
      prerequisites: [
        l3Id("mathematics", "function_notation"),
        l3Id("mathematics", "unit_circle_and_radians"),
      ],
      unlocks: [
        l3Id("mathematics", "logarithmic_functions"),
        l3Id("mathematics", "first_order_odes"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Pre-Calculus & Functions",
        "Exponential Functions",
        "Exponential growth and decay models appear from finance to pharmacokinetics.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Precalculus 2e",
          chapter: "4",
          section: "4.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "logarithmic_functions"),
    resolution_level: 3,
    content: {
      title: "Logarithmic Functions",
      definition:
        "The logarithm is the inverse of exponentiation: y = log_b(x) means b^y = x; the natural logarithm ln x uses base e.",
      summary:
        "Logarithms compress wide-ranging scales and solve exponential equations by converting products to sums. They appear in decibel and pH scales, algorithm analysis, and integration of rational functions.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Functions & Graphs",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Pre-Calculus & Functions"),
      prerequisites: [l3Id("mathematics", "exponential_functions")],
      unlocks: [
        l3Id("mathematics", "derivatives"),
        l3Id("mathematics", "separable_differential_equations"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Pre-Calculus & Functions",
        "Logarithmic Functions",
        "Logarithms invert exponentials and support semi-log modeling and integration.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Precalculus 2e",
          chapter: "4",
          section: "4.3",
        },
      ],
    },
  },

  // ── Single-Variable Calculus (5) ──────────────────────────────────────────
  {
    id: l3Id("mathematics", "limits_and_continuity"),
    resolution_level: 3,
    content: {
      title: "Limits and Continuity",
      definition:
        "The limit of f(x) as x approaches a is L if f(x) can be made arbitrarily close to L by taking x sufficiently close to a; f is continuous at a if lim_{x→a} f(x) = f(a).",
      summary:
        "Limits formalize instantaneous change and underpin the definition of the derivative. Continuity identifies where functions behave predictably and where the Intermediate Value Theorem applies.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Change & Rate",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Single-Variable Calculus"),
      prerequisites: [
        l3Id("mathematics", "function_notation"),
        l3Id("mathematics", "rational_functions"),
        l3Id("mathematics", "unit_circle_and_radians"),
      ],
      unlocks: [l3Id("mathematics", "derivatives")],
    },
    domain_contexts: [
      mathContext(
        "Single-Variable Calculus",
        "Limits and Continuity",
        "Limits are the logical foundation of derivatives and integrals.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Calculus Volume 1",
          chapter: "2",
          section: "2.2",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "derivatives"),
    resolution_level: 3,
    content: {
      title: "Derivatives and Differentiation Rules",
      definition:
        "The derivative f′(x) is the instantaneous rate of change of f at x, defined as the limit of difference quotients; rules cover power, product, quotient, and chain compositions.",
      summary:
        "Differentiation quantifies sensitivity of outputs to inputs and solves tangent-line and velocity problems. Mastery of differentiation rules is prerequisite to optimization, related rates, and differential equations.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Change & Rate",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Single-Variable Calculus"),
      prerequisites: [
        l3Id("mathematics", "limits_and_continuity"),
        l3Id("mathematics", "logarithmic_functions"),
      ],
      unlocks: [
        l3Id("mathematics", "applications_of_derivatives"),
        l3Id("mathematics", "partial_derivatives"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Single-Variable Calculus",
        "Derivatives and Differentiation Rules",
        "Derivatives measure instantaneous rate of change across science and engineering.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Calculus Volume 1",
          chapter: "3",
          section: "3.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "applications_of_derivatives"),
    resolution_level: 3,
    content: {
      title: "Applications of Derivatives",
      definition:
        "Derivatives identify critical points, intervals of increase/decrease, concavity, and extrema; they solve optimization and related-rates problems.",
      summary:
        "Applied differentiation connects abstract rates to max-min problems, curve sketching, and Newton-style approximation. These techniques appear in economics, biology, and physics whenever quantities are optimized under constraints.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Change & Rate",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Single-Variable Calculus"),
      prerequisites: [l3Id("mathematics", "derivatives")],
      unlocks: [l3Id("mathematics", "definite_integrals")],
    },
    domain_contexts: [
      mathContext(
        "Single-Variable Calculus",
        "Applications of Derivatives",
        "Optimization and related rates translate derivatives into applied decisions.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Calculus Volume 1",
          chapter: "4",
          section: "4.3",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "definite_integrals"),
    resolution_level: 3,
    content: {
      title: "Definite Integrals",
      definition:
        "The definite integral ∫_a^b f(x) dx represents the signed area under f from a to b, defined as the limit of Riemann sums.",
      summary:
        "Definite integrals accumulate quantities such as distance from velocity or total change from a rate. They connect geometric area to physical totals and set the stage for the Fundamental Theorem of Calculus.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Change & Rate",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Single-Variable Calculus"),
      prerequisites: [
        l3Id("mathematics", "derivatives"),
        l3Id("mathematics", "applications_of_derivatives"),
      ],
      unlocks: [l3Id("mathematics", "fundamental_theorem_of_calculus")],
    },
    domain_contexts: [
      mathContext(
        "Single-Variable Calculus",
        "Definite Integrals",
        "Integration accumulates rates into totals for area, volume, and work problems.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Calculus Volume 1",
          chapter: "5",
          section: "5.2",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "fundamental_theorem_of_calculus"),
    resolution_level: 3,
    content: {
      title: "Fundamental Theorem of Calculus",
      definition:
        "The FTC links differentiation and integration: if F′ = f, then ∫_a^b f(x) dx = F(b) − F(a); conversely, d/dx ∫_a^x f(t) dt = f(x).",
      summary:
        "The Fundamental Theorem of Calculus unifies the two main operations of single-variable calculus into a single inverse pair. It enables efficient evaluation of integrals via antiderivatives and underpins probability density functions.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Change & Rate",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Single-Variable Calculus"),
      prerequisites: [l3Id("mathematics", "definite_integrals")],
      unlocks: [
        l3Id("mathematics", "multiple_integrals"),
        l3Id("mathematics", "first_order_odes"),
        l3Id("mathematics", "normal_distribution"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Single-Variable Calculus",
        "Fundamental Theorem of Calculus",
        "The FTC bridges differentiation and integration for computation and modeling.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Calculus Volume 1",
          chapter: "5",
          section: "5.3",
        },
      ],
    },
  },

  // ── Multivariable Calculus (5) ───────────────────────────────────────────
  {
    id: l3Id("mathematics", "vectors_in_space"),
    resolution_level: 3,
    content: {
      title: "Vectors in Two and Three Dimensions",
      definition:
        "A vector has magnitude and direction, represented by components or as a directed segment; operations include addition, scalar multiplication, dot product, and cross product in ℝ³.",
      summary:
        "Vectors encode displacement, force, and velocity in multiple dimensions. Vector algebra supports lines and planes in space, multivariable differentiation, and physical field descriptions.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Multivariable Analysis",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Multivariable Calculus"),
      prerequisites: [l3Id("mathematics", "pythagorean_theorem")],
      unlocks: [
        l3Id("mathematics", "partial_derivatives"),
        l3Id("mathematics", "vector_fields"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Multivariable Calculus",
        "Vectors in Two and Three Dimensions",
        "Vector methods extend calculus and geometry to higher dimensions.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Calculus Volume 3",
          chapter: "2",
          section: "2.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "partial_derivatives"),
    resolution_level: 3,
    content: {
      title: "Partial Derivatives",
      definition:
        "For f(x, y), the partial derivative ∂f/∂x holds y fixed and differentiates with respect to x, measuring rate of change in one coordinate direction.",
      summary:
        "Partial derivatives analyze multivariable functions where several inputs change independently. They define gradients, tangent planes, and optimization on surfaces central to physics and machine learning.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Multivariable Analysis",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Multivariable Calculus"),
      prerequisites: [
        l3Id("mathematics", "derivatives"),
        l3Id("mathematics", "vectors_in_space"),
      ],
      unlocks: [
        l3Id("mathematics", "multiple_integrals"),
        l3Id("mathematics", "vector_fields"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Multivariable Calculus",
        "Partial Derivatives",
        "Partial rates of change support gradients and multivariable optimization.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Calculus Volume 3",
          chapter: "4",
          section: "4.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "multiple_integrals"),
    resolution_level: 3,
    content: {
      title: "Multiple Integrals",
      definition:
        "Double and triple integrals extend integration to functions of two or three variables, computing volume, mass, and averaged quantities over regions in ℝ² and ℝ³.",
      summary:
        "Multiple integrals accumulate scalar fields over areas and volumes using iterated integration and coordinate changes. They generalize the FTC to higher dimensions and appear in probability, physics, and engineering.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Multivariable Analysis",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Multivariable Calculus"),
      prerequisites: [
        l3Id("mathematics", "fundamental_theorem_of_calculus"),
        l3Id("mathematics", "partial_derivatives"),
      ],
      unlocks: [l3Id("mathematics", "line_integrals")],
    },
    domain_contexts: [
      mathContext(
        "Multivariable Calculus",
        "Multiple Integrals",
        "Volume and mass calculations in two and three dimensions use multiple integrals.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Calculus Volume 3",
          chapter: "5",
          section: "5.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "vector_fields"),
    resolution_level: 3,
    content: {
      title: "Vector Fields",
      definition:
        "A vector field assigns a vector to each point in a domain, modeling flows, forces, and gradients of scalar potentials.",
      summary:
        "Vector fields describe how quantities vary through space, from fluid flow to electromagnetic force. They connect partial derivatives to line and surface integrals via Green's, Stokes', and divergence theorems.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Multivariable Analysis",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Multivariable Calculus"),
      prerequisites: [
        l3Id("mathematics", "vectors_in_space"),
        l3Id("mathematics", "partial_derivatives"),
      ],
      unlocks: [l3Id("mathematics", "line_integrals")],
    },
    domain_contexts: [
      mathContext(
        "Multivariable Calculus",
        "Vector Fields",
        "Spatial vector assignments model flow, force, and conservative fields.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Calculus Volume 3",
          chapter: "6",
          section: "6.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "line_integrals"),
    resolution_level: 3,
    content: {
      title: "Line Integrals",
      definition:
        "A line integral integrates a scalar or vector field along a curve, computing work done by a force field or circulation around a path.",
      summary:
        "Line integrals measure accumulation along paths rather than over regions, linking vector fields to physical work and circulation. They are essential for conservative fields, potential functions, and Maxwell's equations.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Multivariable Analysis",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Multivariable Calculus"),
      prerequisites: [
        l3Id("mathematics", "vector_fields"),
        l3Id("mathematics", "multiple_integrals"),
      ],
      unlocks: [],
    },
    domain_contexts: [
      mathContext(
        "Multivariable Calculus",
        "Line Integrals",
        "Integration along curves quantifies work and circulation in applied fields.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Calculus Volume 3",
          chapter: "6",
          section: "6.2",
        },
      ],
    },
  },

  // ── Linear Algebra (5) ───────────────────────────────────────────────────
  {
    id: l3Id("mathematics", "matrix_operations"),
    resolution_level: 3,
    content: {
      title: "Matrices and Matrix Operations",
      definition:
        "A matrix is a rectangular array of numbers; operations include addition, scalar multiplication, matrix multiplication, and transpose, with dimension compatibility rules.",
      summary:
        "Matrices compactly represent linear transformations and systems of equations. Matrix multiplication composes transformations and is the computational backbone of graphics, statistics, and machine learning.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Linear Systems",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Linear Algebra"),
      prerequisites: [l3Id("mathematics", "systems_of_linear_equations")],
      unlocks: [
        l3Id("mathematics", "determinants"),
        l3Id("mathematics", "matrix_methods_for_systems"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Linear Algebra",
        "Matrices and Matrix Operations",
        "Matrices encode linear maps and simultaneous equations efficiently."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Linear Algebra",
          chapter: "2",
          section: "2.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "determinants"),
    resolution_level: 3,
    content: {
      title: "Determinants",
      definition:
        "The determinant of a square matrix is a scalar measuring oriented volume scaling of the linear transformation it represents; det(A) = 0 iff A is singular.",
      summary:
        "Determinants test invertibility and arise in Cramer's rule and change-of-variables in integration. Understanding determinant properties supports eigenvalue theory and multivariable calculus Jacobians.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Linear Systems",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Linear Algebra"),
      prerequisites: [l3Id("mathematics", "matrix_operations")],
      unlocks: [l3Id("mathematics", "eigenvalues_and_eigenvectors")],
    },
    domain_contexts: [
      mathContext(
        "Linear Algebra",
        "Determinants",
        "Determinants characterize invertibility and volume scaling of linear maps."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Linear Algebra",
          chapter: "3",
          section: "3.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "matrix_methods_for_systems"),
    resolution_level: 3,
    content: {
      title: "Matrix Methods for Linear Systems",
      definition:
        "Linear systems Ax = b are solved by row reduction (Gaussian elimination), inverse matrices when A is invertible, and identification of consistent vs. inconsistent systems.",
      summary:
        "Matrix methods systematize solving many equations at once and classify solution types geometrically as intersections of hyperplanes. Row reduction is a universal algorithm reused in computer algebra and data analysis.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Linear Systems",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Linear Algebra"),
      prerequisites: [
        l3Id("mathematics", "matrix_operations"),
        l3Id("mathematics", "systems_of_linear_equations"),
      ],
      unlocks: [l3Id("mathematics", "vector_spaces")],
    },
    domain_contexts: [
      mathContext(
        "Linear Algebra",
        "Matrix Methods for Linear Systems",
        "Gaussian elimination is the standard algorithmic approach to linear systems."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Linear Algebra",
          chapter: "1",
          section: "1.2",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "vector_spaces"),
    resolution_level: 3,
    content: {
      title: "Vector Spaces and Subspaces",
      definition:
        "A vector space is a set closed under addition and scalar multiplication satisfying axioms; a subspace is a subset that is itself a vector space, often described as span, null space, or column space.",
      summary:
        "Vector spaces abstract the structure shared by geometric vectors, function spaces, and solution sets of homogeneous systems. Subspace concepts organize linear independence, basis, and dimension.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Linear Systems",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Linear Algebra"),
      prerequisites: [l3Id("mathematics", "matrix_methods_for_systems")],
      unlocks: [l3Id("mathematics", "eigenvalues_and_eigenvectors")],
    },
    domain_contexts: [
      mathContext(
        "Linear Algebra",
        "Vector Spaces and Subspaces",
        "Abstract vector spaces unify geometry, systems, and function spaces."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Linear Algebra",
          chapter: "4",
          section: "4.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "eigenvalues_and_eigenvectors"),
    resolution_level: 3,
    content: {
      title: "Eigenvalues and Eigenvectors",
      definition:
        "For square matrix A, a nonzero vector v is an eigenvector with eigenvalue λ if Av = λv, representing directions invariant under the transformation.",
      summary:
        "Eigenanalysis reveals intrinsic axes and scaling of linear transformations. Eigenvalues appear in stability of differential equations, principal component analysis, and quantum-mechanical observables.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Linear Systems",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Linear Algebra"),
      prerequisites: [
        l3Id("mathematics", "determinants"),
        l3Id("mathematics", "vector_spaces"),
      ],
      unlocks: [l3Id("mathematics", "systems_of_odes")],
    },
    domain_contexts: [
      mathContext(
        "Linear Algebra",
        "Eigenvalues and Eigenvectors",
        "Eigenanalysis decomposes linear transformations into invariant directions.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Linear Algebra",
          chapter: "5",
          section: "5.1",
        },
      ],
    },
  },

  // ── Differential Equations (5) ─────────────────────────────────────────────
  {
    id: l3Id("mathematics", "first_order_odes"),
    resolution_level: 3,
    content: {
      title: "First-Order Ordinary Differential Equations",
      definition:
        "A first-order ODE relates an unknown function to its first derivative, F(x, y, y′) = 0; includes separable equations and linear forms y′ + p(x)y = q(x) solved by integrating factors.",
      summary:
        "First-order ODEs model growth, cooling, and mixing when rates depend on current state. Linear first-order equations (integrating-factor method) are developed at L4 under this anchor.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Dynamical Systems",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Differential Equations"),
      prerequisites: [
        l3Id("mathematics", "fundamental_theorem_of_calculus"),
        l3Id("mathematics", "exponential_functions"),
      ],
      unlocks: [
        l3Id("mathematics", "separable_differential_equations"),
        l3Id("mathematics", "second_order_linear_odes"),
        l3Id("mathematics", "systems_of_odes"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Differential Equations",
        "First-Order Ordinary Differential Equations",
        "First-order ODEs describe single-step memory dynamical systems.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Calculus Volume 2",
          chapter: "4",
          section: "4.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "separable_differential_equations"),
    resolution_level: 3,
    content: {
      title: "Separable Differential Equations",
      definition:
        "A first-order ODE is separable if it can be written g(y) dy = h(x) dx, solved by integrating both sides after separating variables.",
      summary:
        "Separation of variables is often the first exact technique students apply to ODEs and yields closed-form solutions for many growth and decay models. The method foreshadows integrating factors and transform techniques.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Dynamical Systems",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Differential Equations"),
      prerequisites: [
        l3Id("mathematics", "first_order_odes"),
        l3Id("mathematics", "logarithmic_functions"),
      ],
      unlocks: [l3Id("mathematics", "systems_of_odes")],
    },
    domain_contexts: [
      mathContext(
        "Differential Equations",
        "Separable Differential Equations",
        "Variable separation solves many introductory growth and decay models.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Calculus Volume 2",
          chapter: "4",
          section: "4.3",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "second_order_linear_odes"),
    resolution_level: 3,
    content: {
      title: "Second-Order Linear Differential Equations",
      definition:
        "Equations of the form ay″ + by′ + cy = g(x) with constant coefficients are solved via characteristic equations and particular solutions for driving terms.",
      summary:
        "Second-order linear ODEs model oscillators, circuits, and mechanical vibrations. The superposition principle and characteristic-polynomial method extend naturally to higher-order and system formulations.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Dynamical Systems",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Differential Equations"),
      prerequisites: [l3Id("mathematics", "first_order_odes")],
      unlocks: [l3Id("mathematics", "systems_of_odes")],
    },
    domain_contexts: [
      mathContext(
        "Differential Equations",
        "Second-Order Linear Differential Equations",
        "Second-order ODEs model oscillation and resonance in physical systems.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Calculus Volume 3",
          chapter: "7",
          section: "7.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "systems_of_odes"),
    resolution_level: 3,
    content: {
      title: "Systems of Differential Equations",
      definition:
        "A system of ODEs couples several unknown functions, often written as x′ = Ax + f(t) for a matrix A, with solutions describing interacting dynamical variables.",
      summary:
        "Coupled ODEs model populations, circuits, and mechanical linkages where variables co-evolve. Matrix exponential and eigenvector methods classify stability and decouple interacting modes.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Dynamical Systems",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Differential Equations"),
      prerequisites: [
        l3Id("mathematics", "first_order_odes"),
        l3Id("mathematics", "second_order_linear_odes"),
        l3Id("mathematics", "eigenvalues_and_eigenvectors"),
      ],
      unlocks: [],
    },
    domain_contexts: [
      mathContext(
        "Differential Equations",
        "Systems of Differential Equations",
        "Coupled ODEs describe interacting dynamical systems in science and engineering.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Linear Algebra",
          chapter: "5",
          section: "5.1",
        },
      ],
    },
  },

  // ── Statistics & Probability (5) ─────────────────────────────────────────
  {
    id: l3Id("mathematics", "descriptive_statistics"),
    resolution_level: 3,
    content: {
      title: "Descriptive Statistics",
      definition:
        "Descriptive statistics summarize datasets using measures of center (mean, median, mode), spread (range, variance, standard deviation), and shape (distribution plots).",
      summary:
        "Descriptive methods translate raw data into interpretable summaries before inferential steps. Understanding center and spread is prerequisite to probability models and hypothesis testing.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Data & Uncertainty",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Statistics & Probability"),
      prerequisites: [l3Id("mathematics", "percentages")],
      unlocks: [
        l3Id("mathematics", "probability_fundamentals"),
        l3Id("mathematics", "normal_distribution"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Statistics & Probability",
        "Descriptive Statistics",
        "Summaries of center and spread are the first step in data analysis."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Statistics",
          chapter: "2",
          section: "2.3",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "probability_fundamentals"),
    resolution_level: 3,
    content: {
      title: "Probability Fundamentals",
      definition:
        "Probability assigns values in [0, 1] to outcomes in a sample space, satisfying additivity for disjoint events; conditional probability updates beliefs given new information.",
      summary:
        "Probability formalizes uncertainty with axioms that govern compound and conditional events. It bridges descriptive data analysis to random variables and inferential statistics.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Data & Uncertainty",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Statistics & Probability"),
      prerequisites: [l3Id("mathematics", "descriptive_statistics")],
      unlocks: [l3Id("mathematics", "random_variables")],
    },
    domain_contexts: [
      mathContext(
        "Statistics & Probability",
        "Probability Fundamentals",
        "Probability axioms underpin random variables and statistical inference."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Statistics",
          chapter: "3",
          section: "3.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "random_variables"),
    resolution_level: 3,
    content: {
      title: "Random Variables",
      definition:
        "A random variable maps outcomes to numbers; discrete variables have probability mass functions, continuous variables have probability density functions with total probability 1.",
      summary:
        "Random variables translate probabilistic events into numeric quantities amenable to expectation and variance. They are the language of statistical models from genetics to quality control.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Data & Uncertainty",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Statistics & Probability"),
      prerequisites: [l3Id("mathematics", "probability_fundamentals")],
      unlocks: [l3Id("mathematics", "normal_distribution")],
    },
    domain_contexts: [
      mathContext(
        "Statistics & Probability",
        "Random Variables",
        "Random variables connect probability models to expected values and spread."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Statistics",
          chapter: "4",
          section: "4.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "normal_distribution"),
    resolution_level: 3,
    content: {
      title: "Normal Distribution",
      definition:
        "The normal (Gaussian) distribution is a bell-shaped continuous density characterized by mean μ and standard deviation σ, with the empirical 68–95–99.7 rule for intervals.",
      summary:
        "The normal distribution models measurement error and aggregates many natural phenomena via the Central Limit Theorem. Z-scores standardize comparisons and underpin confidence intervals and hypothesis tests.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Data & Uncertainty",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Statistics & Probability"),
      prerequisites: [
        l3Id("mathematics", "random_variables"),
        l3Id("mathematics", "descriptive_statistics"),
        l3Id("mathematics", "fundamental_theorem_of_calculus"),
      ],
      unlocks: [l3Id("mathematics", "hypothesis_testing")],
    },
    domain_contexts: [
      mathContext(
        "Statistics & Probability",
        "Normal Distribution",
        "The Gaussian model is central to inference and the Central Limit Theorem.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Statistics",
          chapter: "6",
          section: "6.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "hypothesis_testing"),
    resolution_level: 3,
    content: {
      title: "Hypothesis Testing",
      definition:
        "Hypothesis testing evaluates a null hypothesis against sample evidence using a test statistic, p-value, and significance level α to control Type I error.",
      summary:
        "Hypothesis tests formalize decisions under uncertainty, distinguishing signal from chance variation. They are standard in clinical trials, quality assurance, and scientific publication.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Data & Uncertainty",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Statistics & Probability"),
      prerequisites: [l3Id("mathematics", "normal_distribution")],
      unlocks: [],
    },
    domain_contexts: [
      mathContext(
        "Statistics & Probability",
        "Hypothesis Testing",
        "Formal tests convert sample evidence into statistical decisions.",
        4
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Statistics",
          chapter: "9",
          section: "9.1",
        },
      ],
    },
  },

  // ── Discrete Mathematics & Logic (5) ───────────────────────────────────────
  {
    id: l3Id("mathematics", "propositional_logic"),
    resolution_level: 3,
    content: {
      title: "Propositional Logic",
      definition:
        "Propositional logic studies compound statements built from atomic propositions with connectives (¬, ∧, ∨, →, ↔) and evaluates truth via truth tables.",
      summary:
        "Propositional logic provides the syntax and semantics of mathematical proof and digital circuits. Valid inference rules and logical equivalence underpin rigorous argument throughout mathematics and computer science.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Discrete Structures",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Discrete Mathematics & Logic"),
      prerequisites: [],
      unlocks: [
        l3Id("mathematics", "set_theory"),
        l3Id("mathematics", "mathematical_induction"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Discrete Mathematics & Logic",
        "Propositional Logic",
        "Truth-functional logic supports proof, algorithms, and circuit design."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Contemporary Mathematics",
          chapter: "2",
          section: "2.2",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "set_theory"),
    resolution_level: 3,
    content: {
      title: "Set Theory",
      definition:
        "A set is a collection of distinct objects; operations include union, intersection, complement, and Cartesian product, with Venn diagrams illustrating relationships.",
      summary:
        "Set theory is the language of modern mathematics for defining functions, relations, and probability sample spaces. Mastery of set operations supports counting principles and formal proof.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Discrete Structures",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Discrete Mathematics & Logic"),
      prerequisites: [l3Id("mathematics", "propositional_logic")],
      unlocks: [
        l3Id("mathematics", "combinatorics"),
        l3Id("mathematics", "probability_fundamentals"),
      ],
    },
    domain_contexts: [
      mathContext(
        "Discrete Mathematics & Logic",
        "Set Theory",
        "Sets formalize collections underlying functions, relations, and probability."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Contemporary Mathematics",
          chapter: "1",
          section: "1.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "combinatorics"),
    resolution_level: 3,
    content: {
      title: "Combinatorics and Counting Principles",
      definition:
        "Combinatorics counts arrangements and selections using the addition rule, multiplication rule, permutations (order matters), and combinations (order does not matter).",
      summary:
        "Counting principles answer how many ways an event can occur, feeding probability numerators and algorithm analysis. Binomial coefficients link combinatorics to algebra and the binomial theorem.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Discrete Structures",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Discrete Mathematics & Logic"),
      prerequisites: [l3Id("mathematics", "set_theory")],
      unlocks: [l3Id("mathematics", "probability_fundamentals")],
    },
    domain_contexts: [
      mathContext(
        "Discrete Mathematics & Logic",
        "Combinatorics and Counting Principles",
        "Permutations and combinations count outcomes for probability and CS."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Contemporary Mathematics",
          chapter: "7",
          section: "7.2",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "graph_theory_basics"),
    resolution_level: 3,
    content: {
      title: "Graph Theory Basics",
      definition:
        "A graph consists of vertices and edges; basic concepts include degree, paths, cycles, trees, and Euler/Hamilton traversability.",
      summary:
        "Graphs model networks, dependencies, and state transitions in discrete systems. Fundamental graph properties support algorithms for routing, scheduling, and spine dependency analysis itself.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Discrete Structures",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Discrete Mathematics & Logic"),
      prerequisites: [l3Id("mathematics", "set_theory")],
      unlocks: [],
    },
    domain_contexts: [
      mathContext(
        "Discrete Mathematics & Logic",
        "Graph Theory Basics",
        "Vertices and edges model networks and prerequisite structures."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Contemporary Mathematics",
          chapter: "12",
          section: "12.1",
        },
      ],
    },
  },
  {
    id: l3Id("mathematics", "mathematical_induction"),
    resolution_level: 3,
    content: {
      title: "Mathematical Induction",
      definition:
        "Mathematical induction proves statements for all natural numbers n by establishing a base case and showing that if P(k) holds, then P(k + 1) holds.",
      summary:
        "Induction is the standard proof technique for recursive definitions and summation formulas. It connects logical reasoning to sequences, algorithms, and structural properties in discrete mathematics.",
    },
    knowledge_graph: {
      knowledge_area: "Quantitative Reasoning",
      knowledge_cluster: "Discrete Structures",
      primary_domain: "mathematics",
    },
    dependency_graph: {
      parent_concept_id: l2Id("mathematics", "Discrete Mathematics & Logic"),
      prerequisites: [
        l3Id("mathematics", "propositional_logic"),
        l3Id("mathematics", "polynomial_expressions"),
      ],
      unlocks: [],
    },
    domain_contexts: [
      mathContext(
        "Discrete Mathematics & Logic",
        "Mathematical Induction",
        "Induction proves statements defined recursively over the natural numbers."
      ),
    ],
    metadata: {
      created_at: TS,
      updated_at: TS,
      created_by: "ai_draft",
      version: "0.1-draft",
      status: "draft",
      source_references: [
        {
          source: "OpenStax Contemporary Mathematics",
          chapter: "2",
          section: "2.7",
        },
      ],
    },
  },
];
