#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = join(repoRoot, "content/spine/l4-l5-bundles");
mkdirSync(outDir, { recursive: true });

const META_BASE = {
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  created_by: "ai_draft",
  version: "0.1-draft",
  status: "draft",
};

function fwd(id) {
  return { concept_id: id, _forward_reference: true };
}

function l4(id, l3, domain, kg, content, hierarchy, framing, deps, ref, note = null) {
  const { prerequisites = [], unlocks = [] } = deps;
  return {
    id,
    resolution_level: 4,
    anchor_concept_id: l3,
    domain_id: domain,
    content,
    knowledge_graph: { ...kg, _shared_concept_note: note },
    dependency_graph: {
      parent_concept_id: l3,
      prerequisites,
      unlocks,
    },
    domain_context: {
      domain_id: domain,
      framing: { ...framing, max_resolution_in_context: framing.max_resolution_in_context ?? 4 },
      hierarchy_location: hierarchy,
      dependency_graph: {
        prerequisites_in_context: [...prerequisites],
        unlocks_in_context: [...unlocks],
      },
      linked_content: { by_library: {} },
    },
    metadata: { ...META_BASE, source_references: [ref] },
  };
}

function l5(id, l4Parent, l3, domain, kg, content, hierarchy, framing, deps, ref, maxRes = 5) {
  const { prerequisites = [], unlocks = [] } = deps;
  return {
    id,
    resolution_level: 5,
    anchor_concept_id: l3,
    domain_id: domain,
    content,
    knowledge_graph: { ...kg, _shared_concept_note: null },
    dependency_graph: {
      parent_concept_id: l4Parent,
      prerequisites,
      unlocks,
    },
    domain_context: {
      domain_id: domain,
      framing: { ...framing, max_resolution_in_context: maxRes },
      hierarchy_location: hierarchy,
      dependency_graph: {
        prerequisites_in_context: [...prerequisites],
        unlocks_in_context: [...unlocks],
      },
      linked_content: { by_library: {} },
    },
    metadata: { ...META_BASE, source_references: [ref] },
  };
}

function bundle(parentL3, domain, notes, concepts) {
  return {
    _meta: {
      parent_l3_id: parentL3,
      domain_id: domain,
      generation_date: "2026-06-13",
      status: "draft",
      notes,
    },
    concepts,
  };
}

const D = "mathematics";
const QR = "Quantitative Reasoning";

const bundles = {};

// 1. Derivatives (from review outline)
{
  const l3 = "spine_mathematics_l3_derivatives";
  const kg = { knowledge_area: QR, knowledge_cluster: "Change & Rate", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Single-Variable Calculus", topic: "Derivatives and Differentiation Rules", subtopic: null };
  const fr = { relevance: "Derivatives measure instantaneous rate of change across science and engineering.", applications: [] };
  const src = "OpenStax Calculus Volume 1";
  bundles["spine_mathematics_l3_derivatives.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. Six L4 nodes per pilot review outline; max resolution 4, no L5.",
    [
      l4("spine_mathematics_l4_derivative_rate_of_change", l3, D, kg,
        { title: "Derivative as Instantaneous Rate of Change", definition: "The derivative f′(x) is the limit of the average rate of change of f over shrinking intervals around x, representing the instantaneous rate of change or slope of the tangent line at x.", summary: "The limit definition connects secant-line slopes to tangent-line slope. This is the foundation for all differentiation rules and applied rate problems." },
        hi, fr, { unlocks: ["spine_mathematics_l4_basic_differentiation_rules"] },
        { source: src, chapter: "3", section: "3.1" }),
      l4("spine_mathematics_l4_basic_differentiation_rules", l3, D, kg,
        { title: "Power, Sum, and Constant Multiple Rules", definition: "Differentiation rules stating that the derivative of xⁿ is nxⁿ⁻¹, the derivative of a sum is the sum of derivatives, and constants factor out of derivatives.", summary: "These elementary rules differentiate polynomials and linear combinations efficiently without returning to the limit definition each time." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_derivative_rate_of_change"], unlocks: ["spine_mathematics_l4_product_quotient_rules", "spine_mathematics_l4_chain_rule"] },
        { source: src, chapter: "3", section: "3.3" }),
      l4("spine_mathematics_l4_product_quotient_rules", l3, D, kg,
        { title: "Product and Quotient Rules", definition: "Rules for differentiating products (uv)′ = u′v + uv′ and quotients (u/v)′ = (u′v − uv′)/v² of differentiable functions.", summary: "When functions are multiplied or divided rather than added, the product and quotient rules extend basic rules to composite algebraic forms." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_basic_differentiation_rules"], unlocks: [] },
        { source: src, chapter: "3", section: "3.3" }),
      l4("spine_mathematics_l4_chain_rule", l3, D, kg,
        { title: "Chain Rule", definition: "If y = f(g(x)), then dy/dx = f′(g(x)) · g′(x), giving the derivative of a composition as the product of the outer and inner derivatives.", summary: "The chain rule handles nested functions and is essential for implicit differentiation, related rates, and transcendental derivatives." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_basic_differentiation_rules"], unlocks: ["spine_mathematics_l4_exp_log_derivatives", "spine_mathematics_l4_implicit_differentiation"] },
        { source: src, chapter: "3", section: "3.5" }),
      l4("spine_mathematics_l4_exp_log_derivatives", l3, D, kg,
        { title: "Derivatives of Exponential and Logarithmic Functions", definition: "Standard results d/dx(eˣ) = eˣ and d/dx(ln x) = 1/x, extended by the chain rule to general exponential and logarithmic bases.", summary: "Exponential and logarithmic derivatives underpin growth, decay, and logarithmic-differentiation techniques used throughout calculus and differential equations." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_chain_rule"], unlocks: [] },
        { source: src, chapter: "3", section: "3.9" }),
      l4("spine_mathematics_l4_implicit_differentiation", l3, D, kg,
        { title: "Implicit Differentiation", definition: "Technique for finding dy/dx when y is defined implicitly by an equation F(x, y) = 0 by differentiating both sides with respect to x and applying the chain rule.", summary: "Implicit differentiation finds slopes of curves not expressible as y = f(x), including circles, ellipses, and inverse-function relationships." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_chain_rule"], unlocks: [] },
        { source: src, chapter: "3", section: "3.6" }),
    ]
  );
}

// 2. Applications of Derivatives
{
  const l3 = "spine_mathematics_l3_applications_of_derivatives";
  const kg = { knowledge_area: QR, knowledge_cluster: "Change & Rate", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Single-Variable Calculus", topic: "Applications of Derivatives", subtopic: null };
  const fr = { relevance: "Optimization and related rates translate derivatives into applied decisions.", applications: [] };
  const src = "OpenStax Calculus Volume 1";
  bundles["spine_mathematics_l3_applications_of_derivatives.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. Applied differentiation: critical points, optimization, related rates.",
    [
      l4("spine_mathematics_l4_critical_points_first_derivative", l3, D, kg,
        { title: "Critical Points and First Derivative Test", definition: "Critical points occur where f′(x) = 0 or f′ is undefined; the first derivative test classifies them as local maxima or minima by sign changes of f′.", summary: "Finding where the rate of change vanishes locates candidate extrema. Sign analysis of f′ on intervals determines increasing and decreasing behavior." },
        hi, fr, { unlocks: ["spine_mathematics_l4_concavity_second_derivative", "spine_mathematics_l4_optimization_problems"] },
        { source: src, chapter: "4", section: "4.2" }),
      l4("spine_mathematics_l4_concavity_second_derivative", l3, D, kg,
        { title: "Concavity and Second Derivative Test", definition: "A function is concave up where f″ > 0 and concave down where f″ < 0; inflection points occur where concavity changes, and f″ at a critical point can confirm extrema.", summary: "Second-derivative information refines curve shape beyond increasing/decreasing intervals and provides a shortcut for classifying critical points." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_critical_points_first_derivative"], unlocks: ["spine_mathematics_l4_curve_sketching"] },
        { source: src, chapter: "4", section: "4.3" }),
      l4("spine_mathematics_l4_optimization_problems", l3, D, kg,
        { title: "Optimization Problems", definition: "Applied problems that maximize or minimize a quantity subject to constraints by identifying a differentiable objective function, finding critical points on a valid domain, and verifying the extremum.", summary: "Optimization translates word problems into calculus: define variables, write the function to optimize, differentiate, and interpret results in context." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_critical_points_first_derivative"], unlocks: [] },
        { source: src, chapter: "4", section: "4.5" }),
      l4("spine_mathematics_l4_related_rates", l3, D, kg,
        { title: "Related Rates", definition: "Problems in which several quantities vary with time and are linked by an equation; differentiating implicitly with respect to time relates their rates of change.", summary: "Related rates apply the chain rule to dynamic geometric and physical situations such as expanding balloons, sliding ladders, and filling tanks." },
        hi, fr, { unlocks: [] },
        { source: src, chapter: "4", section: "4.1" }),
      l4("spine_mathematics_l4_mean_value_theorem", l3, D, kg,
        { title: "Mean Value Theorem", definition: "If f is continuous on [a, b] and differentiable on (a, b), there exists c in (a, b) such that f′(c) = (f(b) − f(a))/(b − a).", summary: "The MVT guarantees at least one point where instantaneous rate equals average rate over an interval, underpinning monotonicity and error bounds." },
        hi, fr, { unlocks: [] },
        { source: src, chapter: "4", section: "4.6" }),
      l4("spine_mathematics_l4_curve_sketching", l3, D, kg,
        { title: "Curve Sketching with Derivatives", definition: "Systematic graphing using intercepts, asymptotes, intervals of increase/decrease from f′, and concavity from f″ to produce accurate function plots.", summary: "Combining first- and second-derivative analyses yields complete qualitative graphs without plotting every point." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_concavity_second_derivative"], unlocks: [] },
        { source: src, chapter: "4", section: "4.4" }),
    ]
  );
}

// 3. Limits and Continuity
{
  const l3 = "spine_mathematics_l3_limits_and_continuity";
  const kg = { knowledge_area: QR, knowledge_cluster: "Change & Rate", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Single-Variable Calculus", topic: "Limits and Continuity", subtopic: null };
  const fr = { relevance: "Limits formalize approaching behavior and define continuity and derivatives.", applications: [] };
  const src = "OpenStax Calculus Volume 1";
  bundles["spine_mathematics_l3_limits_and_continuity.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. Limit definition, laws, continuity, and end behavior.",
    [
      l4("spine_mathematics_l4_limit_definition", l3, D, kg,
        { title: "Limit Definition and Notation", definition: "The limit of f(x) as x approaches a is L if f(x) can be made arbitrarily close to L by taking x sufficiently close to a (but not equal to a).", summary: "Limits describe intended output value as input approaches a point, even when the function is undefined or discontinuous at that point." },
        hi, fr, { unlocks: ["spine_mathematics_l4_one_sided_limits", "spine_mathematics_l4_limit_laws"] },
        { source: src, chapter: "2", section: "2.2" }),
      l4("spine_mathematics_l4_one_sided_limits", l3, D, kg,
        { title: "One-Sided Limits", definition: "Left-hand limit (x → a⁻) and right-hand limit (x → a⁺) describe approach from one side; the two-sided limit exists only when both one-sided limits agree.", summary: "One-sided limits resolve piecewise behavior and are essential for defining continuity at endpoints and analyzing jump discontinuities." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_limit_definition"], unlocks: ["spine_mathematics_l4_continuity_definition"] },
        { source: src, chapter: "2", section: "2.2" }),
      l4("spine_mathematics_l4_limit_laws", l3, D, kg,
        { title: "Limit Laws", definition: "Algebraic rules allowing limits of sums, products, quotients, and compositions to be computed from limits of constituent functions when those limits exist.", summary: "Limit laws reduce complex limit calculations to simpler component limits, analogous to derivative rules." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_limit_definition"], unlocks: ["spine_mathematics_l4_limits_at_infinity"] },
        { source: src, chapter: "2", section: "2.3" }),
      l4("spine_mathematics_l4_continuity_definition", l3, D, kg,
        { title: "Continuity at a Point", definition: "A function f is continuous at x = a if lim_{x→a} f(x) = f(a), requiring the limit to exist, f(a) to be defined, and the two to be equal.", summary: "Continuity means no breaks, jumps, or holes at a point; continuous functions preserve limit structure under composition and algebraic operations." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_one_sided_limits"], unlocks: ["spine_mathematics_l4_intermediate_value_theorem"] },
        { source: src, chapter: "2", section: "2.4" }),
      l4("spine_mathematics_l4_intermediate_value_theorem", l3, D, kg,
        { title: "Intermediate Value Theorem", definition: "If f is continuous on [a, b] and N is any value between f(a) and f(b), then there exists c in (a, b) with f(c) = N.", summary: "The IVT guarantees that continuous functions take every intermediate value, enabling root-finding arguments and existence proofs." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_continuity_definition"], unlocks: [] },
        { source: src, chapter: "2", section: "2.4" }),
      l4("spine_mathematics_l4_limits_at_infinity", l3, D, kg,
        { title: "Limits at Infinity and Horizontal Asymptotes", definition: "Limits as x → ±∞ describe end behavior of functions; horizontal asymptotes occur at y = L when lim_{x→±∞} f(x) = L.", summary: "End-behavior limits classify long-term growth or decay and identify horizontal asymptotes for rational and transcendental functions." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_limit_laws"], unlocks: [] },
        { source: src, chapter: "4", section: "4.7" }),
    ]
  );
}

// 4. Definite Integrals
{
  const l3 = "spine_mathematics_l3_definite_integrals";
  const kg = { knowledge_area: QR, knowledge_cluster: "Change & Rate", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Single-Variable Calculus", topic: "Definite Integrals", subtopic: null };
  const fr = { relevance: "Integration accumulates rates into totals for area, volume, and work problems.", applications: [] };
  const src = "OpenStax Calculus Volume 1";
  bundles["spine_mathematics_l3_definite_integrals.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. Riemann sums through definite integral properties and substitution.",
    [
      l4("spine_mathematics_l4_riemann_sums", l3, D, kg,
        { title: "Riemann Sums and Area Approximation", definition: "Approximations of signed area under a curve by summing f(xᵢ*)Δx over subintervals of a partition, with left, right, and midpoint variants.", summary: "Riemann sums motivate the definite integral as a limit of better and better area approximations." },
        hi, fr, { unlocks: ["spine_mathematics_l4_definite_integral_definition"] },
        { source: src, chapter: "5", section: "5.1" }),
      l4("spine_mathematics_l4_definite_integral_definition", l3, D, kg,
        { title: "Definite Integral Definition", definition: "The definite integral ∫_a^b f(x) dx is the limit of Riemann sums as partition norm approaches zero, representing signed net area under f from a to b.", summary: "When the limit exists, f is integrable on [a, b] and the integral accumulates signed area, accounting for regions below the axis." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_riemann_sums"], unlocks: ["spine_mathematics_l4_definite_integral_properties"] },
        { source: src, chapter: "5", section: "5.2" }),
      l4("spine_mathematics_l4_definite_integral_properties", l3, D, kg,
        { title: "Properties of Definite Integrals", definition: "Linearity, additivity over intervals, reversal of limits changing sign, and comparison properties governing manipulation of ∫_a^b f(x) dx.", summary: "Integral properties allow splitting domains, combining integrands, and estimating values without explicit antiderivatives." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_definite_integral_definition"], unlocks: ["spine_mathematics_l4_substitution_definite_integrals"] },
        { source: src, chapter: "5", section: "5.2" }),
      l4("spine_mathematics_l4_substitution_definite_integrals", l3, D, kg,
        { title: "Substitution in Definite Integrals", definition: "Change of variable u = g(x) transforms ∫_a^b f(g(x))g′(x) dx to ∫_{g(a)}^{g(b)} f(u) du with updated limits.", summary: "u-substitution evaluates definite integrals by reversing the chain rule, requiring limit transformation when bounds change." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_definite_integral_properties"], unlocks: [] },
        { source: src, chapter: "5", section: "5.5" }),
      l4("spine_mathematics_l4_average_value_function", l3, D, kg,
        { title: "Average Value of a Function", definition: "The average value of f on [a, b] is (1/(b−a))∫_a^b f(x) dx, the height of a rectangle with the same area as the region under f.", summary: "Average value connects integration to mean output over an interval, used in physics and economics for time-averaged quantities." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_definite_integral_definition"], unlocks: [] },
        { source: src, chapter: "5", section: "5.4" }),
    ]
  );
}

// 5. Fundamental Theorem of Calculus
{
  const l3 = "spine_mathematics_l3_fundamental_theorem_of_calculus";
  const kg = { knowledge_area: QR, knowledge_cluster: "Change & Rate", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Single-Variable Calculus", topic: "Fundamental Theorem of Calculus", subtopic: null };
  const fr = { relevance: "FTC links differentiation and integration as inverse operations.", applications: [] };
  const src = "OpenStax Calculus Volume 1";
  bundles["spine_mathematics_l3_fundamental_theorem_of_calculus.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. FTC Parts 1 and 2, net change, accumulation functions.",
    [
      l4("spine_mathematics_l4_ftc_part1", l3, D, kg,
        { title: "Fundamental Theorem of Calculus Part 1", definition: "If f is continuous on [a, b] and F(x) = ∫_a^x f(t) dt, then F′(x) = f(x) for x in (a, b).", summary: "Part 1 shows differentiation undoes integration: the rate of change of accumulated area equals the integrand." },
        hi, fr, { unlocks: ["spine_mathematics_l4_ftc_part2", "spine_mathematics_l4_accumulation_functions"] },
        { source: src, chapter: "5", section: "5.3" }),
      l4("spine_mathematics_l4_ftc_part2", l3, D, kg,
        { title: "Fundamental Theorem of Calculus Part 2", definition: "If f is continuous on [a, b] and F is any antiderivative of f, then ∫_a^b f(x) dx = F(b) − F(a).", summary: "Part 2 enables evaluation of definite integrals via antiderivatives, completing the link between rates and totals." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_ftc_part1"], unlocks: ["spine_mathematics_l4_net_change_theorem"] },
        { source: src, chapter: "5", section: "5.3" }),
      l4("spine_mathematics_l4_net_change_theorem", l3, D, kg,
        { title: "Net Change Theorem", definition: "The integral of a rate of change over an interval equals the net change in the original quantity: ∫_a^b F′(x) dx = F(b) − F(a).", summary: "Net change interprets integration physically: integrating velocity gives displacement; integrating marginal cost gives total cost change." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_ftc_part2"], unlocks: [] },
        { source: src, chapter: "5", section: "5.4" }),
      l4("spine_mathematics_l4_accumulation_functions", l3, D, kg,
        { title: "Accumulation Functions", definition: "Functions defined by F(x) = ∫_a^x f(t) dt whose values represent accumulated quantity from a fixed lower limit to x.", summary: "Accumulation functions model running totals and their derivatives recover the instantaneous rate being accumulated." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_ftc_part1"], unlocks: [] },
        { source: src, chapter: "5", section: "5.3" }),
    ]
  );
}

// 6. Unit Circle and Radians
{
  const l3 = "spine_mathematics_l3_unit_circle_and_radians";
  const kg = { knowledge_area: QR, knowledge_cluster: "Spatial Reasoning", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Geometry & Trigonometry", topic: "Unit Circle and Radian Measure", subtopic: null };
  const fr = { relevance: "Radians and the unit circle underpin trigonometric functions in calculus.", applications: [] };
  const src = "OpenStax Precalculus 2e";
  bundles["spine_mathematics_l3_unit_circle_and_radians.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. Radian measure, unit circle, reference angles, periodicity.",
    [
      l4("spine_mathematics_l4_degree_radian_conversion", l3, D, kg,
        { title: "Degree–Radian Conversion", definition: "Radians measure arc length per unit radius; 180° = π radians, so θ radians = (π/180) × degrees.", summary: "Calculus requires radian measure for correct derivative formulas of trigonometric functions." },
        hi, fr, { unlocks: ["spine_mathematics_l4_arc_length_radian_measure"] },
        { source: src, chapter: "5", section: "5.1" }),
      l4("spine_mathematics_l4_arc_length_radian_measure", l3, D, kg,
        { title: "Arc Length and Radian Measure", definition: "Arc length s on a circle of radius r subtended by angle θ (in radians) is s = rθ.", summary: "Radian measure makes arc length proportional to angle, simplifying circular motion and integration over angular domains." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_degree_radian_conversion"], unlocks: ["spine_mathematics_l4_unit_circle_coordinates"] },
        { source: src, chapter: "5", section: "5.1" }),
      l4("spine_mathematics_l4_unit_circle_coordinates", l3, D, kg,
        { title: "Unit Circle Coordinates", definition: "On the unit circle, a point at angle θ has coordinates (cos θ, sin θ), defining sine and cosine for all real θ.", summary: "The unit circle extends trigonometry beyond right triangles to all angles and provides the domain for periodic functions." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_arc_length_radian_measure"], unlocks: ["spine_mathematics_l4_reference_angles", "spine_mathematics_l4_trig_unit_circle"] },
        { source: src, chapter: "5", section: "5.2" }),
      l4("spine_mathematics_l4_reference_angles", l3, D, kg,
        { title: "Reference Angles", definition: "The acute angle between the terminal side of θ and the x-axis, used to evaluate trig functions in any quadrant by sign adjustment.", summary: "Reference angles reduce trigonometric evaluation to first-quadrant values while preserving correct signs." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_unit_circle_coordinates"], unlocks: [] },
        { source: src, chapter: "5", section: "5.2" }),
      l4("spine_mathematics_l4_trig_unit_circle", l3, D, kg,
        { title: "Trigonometric Functions on the Unit Circle", definition: "Definitions cos θ = x, sin θ = y, tan θ = y/x, and reciprocals sec, csc, cot from unit-circle coordinates.", summary: "Unit-circle definitions unify all six trig functions and reveal periodicity and symmetry properties." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_unit_circle_coordinates"], unlocks: ["spine_mathematics_l4_trigonometric_periodicity"] },
        { source: src, chapter: "5", section: "5.3" }),
      l4("spine_mathematics_l4_trigonometric_periodicity", l3, D, kg,
        { title: "Trigonometric Periodicity", definition: "Sine and cosine have period 2π; tangent has period π, reflecting repeating values as θ advances around the circle.", summary: "Periodicity explains oscillatory behavior in models of waves, seasons, and circular motion." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_trig_unit_circle"], unlocks: [] },
        { source: src, chapter: "5", section: "5.3" }),
    ]
  );
}

// 7. Exponential Functions
{
  const l3 = "spine_mathematics_l3_exponential_functions";
  const kg = { knowledge_area: QR, knowledge_cluster: "Functions & Graphs", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Pre-Calculus & Functions", topic: "Exponential Functions", subtopic: null };
  const fr = { relevance: "Exponential functions model growth, compound change, and continuous scaling.", applications: [] };
  const src = "OpenStax Precalculus 2e";
  bundles["spine_mathematics_l3_exponential_functions.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. Exponential definition, base e, laws, applications.",
    [
      l4("spine_mathematics_l4_exponential_function_definition", l3, D, kg,
        { title: "Exponential Function Definition and Graph", definition: "A function f(x) = bˣ with base b > 0, b ≠ 1, having domain ℝ, range (0, ∞), and horizontal asymptote y = 0.", summary: "Exponential graphs rise or fall depending on whether b > 1 or 0 < b < 1, always passing through (0, 1)." },
        hi, fr, { unlocks: ["spine_mathematics_l4_natural_base_e", "spine_mathematics_l4_exponential_transformations"] },
        { source: src, chapter: "6", section: "6.1" }),
      l4("spine_mathematics_l4_natural_base_e", l3, D, kg,
        { title: "The Natural Base e", definition: "The number e ≈ 2.71828 arising as lim_{n→∞}(1 + 1/n)ⁿ, base of the natural exponential f(x) = eˣ with slope equal to its value.", summary: "e is the unique base where instantaneous rate of change equals the function value, central to calculus and continuous growth models." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_exponential_function_definition"], unlocks: ["spine_mathematics_l4_compound_interest_growth"] },
        { source: src, chapter: "6", section: "6.1" }),
      l4("spine_mathematics_l4_laws_of_exponents", l3, D, kg,
        { title: "Laws of Exponents", definition: "Rules b^m · b^n = b^{m+n}, (b^m)^n = b^{mn}, (ab)^n = a^n b^n, and b^0 = 1 governing algebraic manipulation of exponential expressions.", summary: "Exponent laws simplify products, quotients, and powers of exponential terms before applying logarithms or calculus." },
        hi, fr, { unlocks: ["spine_mathematics_l4_exponential_equations"] },
        { source: src, chapter: "6", section: "6.2" }),
      l4("spine_mathematics_l4_compound_interest_growth", l3, D, kg,
        { title: "Compound Interest and Continuous Growth", definition: "Discrete compound interest A = P(1 + r/n)^{nt} and continuous growth A = Pe^{rt} model accumulating quantities over time.", summary: "Financial and population growth applications motivate exponential functions and the transition from discrete to continuous compounding." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_natural_base_e"], unlocks: [] },
        { source: src, chapter: "6", section: "6.3" }),
      l4("spine_mathematics_l4_exponential_transformations", l3, D, kg,
        { title: "Transformations of Exponential Graphs", definition: "Vertical and horizontal shifts, reflections, and stretches of y = bˣ produce y = a·b^{x−h} + k with adjusted asymptote and range.", summary: "Transformations model scaled, shifted, and reflected growth or decay processes in applied settings." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_exponential_function_definition"], unlocks: [] },
        { source: src, chapter: "6", section: "6.1" }),
      l4("spine_mathematics_l4_exponential_equations", l3, D, kg,
        { title: "Solving Exponential Equations", definition: "Techniques using matching bases, logarithms, or algebraic isolation to find x when b^{f(x)} equals a given value.", summary: "Solving exponential equations connects to logarithmic functions and appears in half-life and doubling-time problems." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_laws_of_exponents"], unlocks: [] },
        { source: src, chapter: "6", section: "6.4" }),
    ]
  );
}

// 8. Logarithmic Functions
{
  const l3 = "spine_mathematics_l3_logarithmic_functions";
  const kg = { knowledge_area: QR, knowledge_cluster: "Functions & Graphs", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Pre-Calculus & Functions", topic: "Logarithmic Functions", subtopic: null };
  const fr = { relevance: "Logarithms invert exponentials and simplify multiplicative change.", applications: [] };
  const src = "OpenStax Precalculus 2e";
  bundles["spine_mathematics_l3_logarithmic_functions.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. Log definition, properties, natural log, change of base.",
    [
      l4("spine_mathematics_l4_logarithm_as_inverse", l3, D, kg,
        { title: "Logarithm as Inverse of Exponential", definition: "y = log_b(x) means b^y = x for b > 0, b ≠ 1; the logarithm is the exponent that produces x from base b.", summary: "Logarithmic and exponential functions are inverses, interchanging exponent and output roles." },
        hi, fr, { unlocks: ["spine_mathematics_l4_logarithm_properties", "spine_mathematics_l4_natural_logarithm"] },
        { source: src, chapter: "6", section: "6.5" }),
      l4("spine_mathematics_l4_logarithm_properties", l3, D, kg,
        { title: "Properties of Logarithms", definition: "Rules log_b(xy) = log_b x + log_b y, log_b(x/y) = log_b x − log_b y, and log_b(x^p) = p log_b x for valid arguments.", summary: "Log properties convert products to sums and powers to products, essential for solving equations and differentiating log functions." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_logarithm_as_inverse"], unlocks: ["spine_mathematics_l4_logarithmic_equations"] },
        { source: src, chapter: "6", section: "6.6" }),
      l4("spine_mathematics_l4_natural_logarithm", l3, D, kg,
        { title: "Natural Logarithm (ln)", definition: "The logarithm with base e, written ln x = log_e x, inverse of eˣ and central to calculus integration of 1/x.", summary: "ln x appears in growth/decay models, entropy, and as the antiderivative of 1/x for x > 0." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_logarithm_as_inverse"], unlocks: [] },
        { source: src, chapter: "6", section: "6.5" }),
      l4("spine_mathematics_l4_change_of_base", l3, D, kg,
        { title: "Change-of-Base Formula", definition: "log_b x = (ln x)/(ln b), converting logarithms to any convenient base, typically e or 10.", summary: "Change of base enables calculator evaluation of logs in arbitrary bases and appears in algorithm analysis." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_logarithm_properties"], unlocks: [] },
        { source: src, chapter: "6", section: "6.6" }),
      l4("spine_mathematics_l4_logarithmic_graphs", l3, D, kg,
        { title: "Logarithmic Graphs and Transformations", definition: "Graphs of y = log_b x with vertical asymptote x = 0, domain (0, ∞), and transformations y = a log_b(x − h) + k.", summary: "Log graphs rise slowly, reflecting compressed scale for large multiplicative ranges such as pH and decibels." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_logarithm_as_inverse"], unlocks: [] },
        { source: src, chapter: "6", section: "6.5" }),
      l4("spine_mathematics_l4_logarithmic_equations", l3, D, kg,
        { title: "Solving Logarithmic and Exponential Equations", definition: "Methods combining exponentiation, log application to both sides, and domain checking to solve equations involving logs and exponentials.", summary: "Unified exponential-log equation solving supports separable differential equations and half-life calculations." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_logarithm_properties"], unlocks: [] },
        { source: src, chapter: "6", section: "6.7" }),
    ]
  );
}

// 9. Exponential Decay (mathematics context)
{
  const l3 = "spine_mathematics_l3_exponential_decay";
  const kg = { knowledge_area: QR, knowledge_cluster: "Change & Rate", primary_domain: D };
  const hi = { category: "Pre-Calculus & Functions", subcategory: "Function Families", topic: "Exponential & Logarithmic Functions", subtopic: null };
  const fr = { relevance: "Core example of differential-equation solutions and the natural exponential function.", applications: ["Cooling curves", "Population decline models", "Reverse compound growth"] };
  const src = "OpenStax Calculus Volume 1";
  const shared = "Also used in chemistry (first-order kinetics), medicine_preclinical (drug elimination), physics (radioactive decay).";
  bundles["spine_mathematics_l3_exponential_decay.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. Decay model, half-life, proportional rate; max resolution 4, no L5.",
    [
      l4("spine_mathematics_l4_exponential_decay_model", l3, D, kg,
        { title: "Exponential Decay Model N(t) = N₀e^{−λt}", definition: "A quantity N(t) decreasing proportionally to its current value satisfies N(t) = N₀e^{−λt} for decay constant λ > 0.", summary: "The exponential decay model is the solution to dN/dt = −λN and describes any proportional-loss process." },
        hi, fr, { unlocks: ["spine_mathematics_l4_decay_constant_half_life", "spine_mathematics_l4_proportional_decay_rate"] }, { source: src, chapter: "6", section: "6.8" }, shared),
      l4("spine_mathematics_l4_decay_constant_half_life", l3, D, kg,
        { title: "Decay Constant and Half-Life", definition: "Half-life T_{1/2} is time for N to halve; under exponential decay T_{1/2} = (ln 2)/λ and is independent of initial amount.", summary: "Half-life provides an intuitive timescale for decay processes from radioactivity to drug clearance." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_exponential_decay_model"], unlocks: ["spine_mathematics_l4_solving_decay_problems"] }, { source: src, chapter: "6", section: "6.8" }),
      l4("spine_mathematics_l4_proportional_decay_rate", l3, D, kg,
        { title: "Proportional Rate of Change", definition: "First-order decay occurs when dN/dt = −λN, meaning the instantaneous rate of loss is proportional to the amount present.", summary: "Proportionality is the defining differential-equation condition whose solution is exponential decay." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_exponential_decay_model"], unlocks: [fwd("spine_mathematics_l3_first_order_odes")] }, { source: src, chapter: "6", section: "6.8" }),
      l4("spine_mathematics_l4_solving_decay_problems", l3, D, kg,
        { title: "Solving Exponential Decay Problems", definition: "Using N(t) = N₀e^{−λt} and half-life relations to find remaining amount, elapsed time, or decay constant from given data.", summary: "Applied decay problems require translating context into N₀, λ, and t, then solving exponential or logarithmic equations." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_decay_constant_half_life"], unlocks: [] }, { source: src, chapter: "6", section: "6.8" }),
      l4("spine_mathematics_l4_decay_vs_growth_comparison", l3, D, kg,
        { title: "Exponential Decay vs Growth Comparison", definition: "Growth uses N(t) = N₀e^{kt} with k > 0; decay uses k < 0 (or positive λ with negative exponent), mirroring sign of proportional rate.", summary: "Growth and decay share the same mathematical structure with opposite sign of rate constant, unifying population and financial models." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_exponential_decay_model"], unlocks: [] }, { source: src, chapter: "6", section: "6.8" }),
    ]
  );
}

// 10. Descriptive Statistics
{
  const l3 = "spine_mathematics_l3_descriptive_statistics";
  const kg = { knowledge_area: QR, knowledge_cluster: "Data Analysis", primary_domain: D };
  const hi = { category: "Statistics & Probability", subcategory: "Data Analysis", topic: "Descriptive Statistics", subtopic: null };
  const fr = { relevance: "Foundation for probability and inference.", applications: ["Data visualization", "Summary measures"] };
  const src = "OpenStax Introductory Statistics";
  const shared = "Merged descriptive_statistics (mathematics and psychology_neuroscience research methods).";
  bundles["spine_mathematics_l3_descriptive_statistics.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. Central tendency, spread, visualization, distribution shape.",
    [
      l4("spine_mathematics_l4_measures_central_tendency", l3, D, kg,
        { title: "Measures of Central Tendency", definition: "Summary statistics locating the center of a dataset: mean (arithmetic average), median (middle value), and mode (most frequent value).", summary: "Choice of center measure depends on distribution shape and outliers; median resists skew influence better than mean." },
        hi, fr, { unlocks: ["spine_mathematics_l4_measures_spread", "spine_mathematics_l4_distribution_shape"] }, { source: src, chapter: "2", section: "2.5" }, shared),
      l4("spine_mathematics_l4_measures_spread", l3, D, kg,
        { title: "Measures of Spread", definition: "Quantities describing variability: range, interquartile range (IQR), variance, and standard deviation.", summary: "Spread measures quantify dispersion around center; standard deviation is the most common metric for symmetric distributions." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_measures_central_tendency"], unlocks: ["spine_mathematics_l4_five_number_summary"] }, { source: src, chapter: "2", section: "2.7" }),
      l4("spine_mathematics_l4_data_visualization", l3, D, kg,
        { title: "Data Visualization", definition: "Graphical displays including histograms, stem-and-leaf plots, and bar charts for summarizing frequency and distribution shape.", summary: "Visual inspection reveals modality, skew, gaps, and outliers before formal inference." },
        hi, fr, { unlocks: ["spine_mathematics_l4_five_number_summary"] }, { source: src, chapter: "2", section: "2.3" }),
      l4("spine_mathematics_l4_distribution_shape", l3, D, kg,
        { title: "Distribution Shape and Skewness", definition: "Classification of distributions as symmetric, right-skewed (positive skew), or left-skewed (negative skew) based on tail length.", summary: "Skewness affects interpretation of mean vs median and informs choice of inferential methods." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_measures_central_tendency"], unlocks: [] }, { source: src, chapter: "2", section: "2.6" }),
      l4("spine_mathematics_l4_five_number_summary", l3, D, kg,
        { title: "Five-Number Summary and Box Plots", definition: "Summary consisting of minimum, Q1, median, Q3, and maximum, displayed as a box plot with whiskers and outlier points.", summary: "Box plots compactly show center, spread, and outliers and enable comparison across groups." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_measures_spread", "spine_mathematics_l4_data_visualization"], unlocks: ["spine_mathematics_l4_outliers_robust_statistics"] }, { source: src, chapter: "2", section: "2.4" }),
      l4("spine_mathematics_l4_outliers_robust_statistics", l3, D, kg,
        { title: "Outliers and Robust Statistics", definition: "Outliers are values far from the bulk of data, often identified by IQR rule; robust statistics like median and IQR resist outlier influence.", summary: "Outlier detection and robust summaries prevent misleading descriptions when data contain extreme values." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_five_number_summary"], unlocks: [fwd("spine_mathematics_l3_hypothesis_testing")] }, { source: src, chapter: "2", section: "2.7" }),
    ]
  );
}

// 11. Normal Distribution
{
  const l3 = "spine_mathematics_l3_normal_distribution";
  const kg = { knowledge_area: QR, knowledge_cluster: "Data & Uncertainty", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Statistics & Probability", topic: "Normal Distribution", subtopic: null };
  const fr = { relevance: "The normal distribution underlies statistical inference and measurement error models.", applications: [] };
  const src = "OpenStax Introductory Statistics";
  bundles["spine_mathematics_l3_normal_distribution.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. Normal curve, z-scores, empirical rule, standard normal.",
    [
      l4("spine_mathematics_l4_normal_curve_properties", l3, D, kg,
        { title: "Normal Curve Properties", definition: "The normal (Gaussian) distribution is bell-shaped, symmetric about its mean μ, with spread determined by standard deviation σ.", summary: "Normal curves model many natural and measurement phenomena and are fully characterized by μ and σ." },
        hi, fr, { unlocks: ["spine_mathematics_l4_standard_normal_z", "spine_mathematics_l4_empirical_rule"] },
        { source: src, chapter: "6", section: "6.1" }),
      l4("spine_mathematics_l4_standard_normal_z", l3, D, kg,
        { title: "Standard Normal and Z-Scores", definition: "Z-score z = (x − μ)/σ standardizes any normal variable to mean 0, standard deviation 1 for table lookup.", summary: "Z-scores express how many standard deviations a value lies from the mean, enabling probability calculations." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_normal_curve_properties"], unlocks: ["spine_mathematics_l4_normal_probability_calculation"] },
        { source: src, chapter: "6", section: "6.2" }),
      l4("spine_mathematics_l4_empirical_rule", l3, D, kg,
        { title: "Empirical Rule (68–95–99.7)", definition: "For normal data, approximately 68% fall within 1σ of μ, 95% within 2σ, and 99.7% within 3σ.", summary: "The empirical rule provides quick probability estimates without tables for roughly normal datasets." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_normal_curve_properties"], unlocks: [] },
        { source: src, chapter: "6", section: "6.1" }),
      l4("spine_mathematics_l4_normal_probability_calculation", l3, D, kg,
        { title: "Normal Probability Calculation", definition: "Finding P(a < X < b) for normal X using z-scores and standard normal cumulative distribution tables or technology.", summary: "Probability calculation connects normal models to hypothesis tests and confidence intervals." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_standard_normal_z"], unlocks: [fwd("spine_mathematics_l3_hypothesis_testing")] },
        { source: src, chapter: "6", section: "6.3" }),
      l4("spine_mathematics_l4_central_limit_theorem_intro", l3, D, kg,
        { title: "Central Limit Theorem (Introduction)", definition: "The sampling distribution of the sample mean approaches normal as sample size increases, regardless of population shape (under finite variance).", summary: "The CLT justifies normal approximations for sample means and is the bridge from descriptive statistics to inference." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_normal_curve_properties"], unlocks: [] },
        { source: src, chapter: "7", section: "7.1" }),
    ]
  );
}

// 12. Hypothesis Testing (max=5, includes L5)
{
  const l3 = "spine_mathematics_l3_hypothesis_testing";
  const kg = { knowledge_area: QR, knowledge_cluster: "Statistical Inference", primary_domain: D };
  const hi = { category: "Statistics & Probability", subcategory: "Inference", topic: "Hypothesis Testing", subtopic: null };
  const fr = { relevance: "Core inferential framework in statistics.", applications: ["t-tests", "Chi-square tests"], max_resolution_in_context: 5 };
  const src = "OpenStax Introductory Statistics";
  const shared = "Merged hypothesis_testing (mathematics) and inferential_statistics_hypothesis_testing (psychology_neuroscience).";
  const concepts = [
    l4("spine_mathematics_l4_null_alternative_hypotheses", l3, D, kg,
      { title: "Null and Alternative Hypotheses", definition: "The null hypothesis H₀ states no effect or no difference; the alternative Hₐ states the effect or difference of interest.", summary: "Hypothesis testing begins by formalizing competing claims about a population parameter." },
      hi, fr, { unlocks: ["spine_mathematics_l4_type_errors_significance", "spine_mathematics_l4_test_statistics"] },
      { source: src, chapter: "9", section: "9.1" }, shared),
    l4("spine_mathematics_l4_type_errors_significance", l3, D, kg,
      { title: "Type I and Type II Errors", definition: "Type I error rejects true H₀ (false positive); Type II error fails to reject false H₀ (false negative). Significance level α bounds Type I error probability.", summary: "Error types and α quantify the risk of wrong conclusions in hypothesis testing." },
      hi, fr, { prerequisites: ["spine_mathematics_l4_null_alternative_hypotheses"], unlocks: ["spine_mathematics_l4_p_values", "spine_mathematics_l5_alpha_level_selection"] },
      { source: src, chapter: "9", section: "9.2" }),
    l4("spine_mathematics_l4_p_values", l3, D, kg,
      { title: "P-Values and Decision Rules", definition: "The p-value is the probability, assuming H₀ is true, of observing a test statistic at least as extreme as the sample result.", summary: "Compare p-value to α: reject H₀ if p ≤ α; otherwise fail to reject. P-values quantify evidence strength against H₀." },
      hi, fr, { prerequisites: ["spine_mathematics_l4_type_errors_significance"], unlocks: ["spine_mathematics_l5_interpreting_p_values", "spine_mathematics_l5_p_value_misinterpretations"] },
      { source: src, chapter: "9", section: "9.3" }),
    l4("spine_mathematics_l4_test_statistics", l3, D, kg,
      { title: "Test Statistics and Sampling Distributions", definition: "A test statistic is a standardized measure computed from sample data whose distribution under H₀ determines the p-value.", summary: "Choosing the correct test statistic depends on parameter, sample size, and distributional assumptions." },
      hi, fr, { prerequisites: ["spine_mathematics_l4_null_alternative_hypotheses"], unlocks: ["spine_mathematics_l4_one_sample_t_test", "spine_mathematics_l4_chi_square_goodness_of_fit"] },
      { source: src, chapter: "9", section: "9.4" }),
    l4("spine_mathematics_l4_one_sample_t_test", l3, D, kg,
      { title: "One-Sample t-Test", definition: "Test of H₀: μ = μ₀ using t = (x̄ − μ₀)/(s/√n) when σ is unknown and data are approximately normal.", summary: "The one-sample t-test compares a sample mean to a hypothesized population mean with unknown variance." },
      hi, fr, { prerequisites: ["spine_mathematics_l4_test_statistics"], unlocks: ["spine_mathematics_l5_t_test_assumptions", "spine_mathematics_l5_one_vs_two_tailed_tests"] },
      { source: src, chapter: "9", section: "9.5" }),
    l4("spine_mathematics_l4_chi_square_goodness_of_fit", l3, D, kg,
      { title: "Chi-Square Goodness-of-Fit Test", definition: "Test comparing observed category counts to expected counts under H₀ using χ² = Σ(O − E)²/E with df = k − 1.", summary: "Goodness-of-fit tests whether sample data match a specified categorical distribution." },
      hi, fr, { prerequisites: ["spine_mathematics_l4_test_statistics"], unlocks: [fwd("spine_mathematics_l3_normal_distribution")] },
      { source: src, chapter: "11", section: "11.1" }),
    l5("spine_mathematics_l5_interpreting_p_values", "spine_mathematics_l4_p_values", l3, D, kg,
      { title: "Interpreting P-Values Correctly", definition: "A p-value is not the probability that H₀ is true; it is the probability of the observed (or more extreme) data given H₀.", summary: "Correct interpretation avoids the common inverse-probability fallacy in reporting statistical results." },
      hi, { title_in_context: "Interpreting P-Values Correctly", relevance: "Prevents common misreadings in research and MCAT-style passages.", applications: ["Evidence strength language"] },
      { prerequisites: ["spine_mathematics_l4_p_values"], unlocks: [] },
      { source: src, chapter: "9", section: "9.3" }),
    l5("spine_mathematics_l5_p_value_misinterpretations", "spine_mathematics_l4_p_values", l3, D, kg,
      { title: "Common P-Value Misinterpretations", definition: "Errors include treating p as P(H₀ true), equating non-significance with proof of H₀, and p-hacking through repeated testing.", summary: "Recognizing misinterpretations supports critical reading of published studies and experimental design." },
      hi, { title_in_context: "Common P-Value Misinterpretations", relevance: "Research literacy and statistics reasoning.", applications: ["Multiple comparisons awareness"] },
      { prerequisites: ["spine_mathematics_l4_p_values"], unlocks: [] },
      { source: src, chapter: "9", section: "9.3" }),
    l5("spine_mathematics_l5_alpha_level_selection", "spine_mathematics_l4_type_errors_significance", l3, D, kg,
      { title: "Choosing Significance Level α", definition: "Common choices α = 0.05 or 0.01 balance Type I error tolerance against field conventions; stricter α reduces false positives but increases Type II error.", summary: "α selection reflects context-specific cost of false positive vs false negative." },
      hi, { title_in_context: "Choosing Significance Level α", relevance: "Connects error types to study design decisions.", applications: ["Clinical vs exploratory research"] },
      { prerequisites: ["spine_mathematics_l4_type_errors_significance"], unlocks: [] },
      { source: src, chapter: "9", section: "9.2" }),
    l5("spine_mathematics_l5_t_test_assumptions", "spine_mathematics_l4_one_sample_t_test", l3, D, kg,
      { title: "t-Test Assumptions", definition: "One-sample t-tests require independent observations, approximate normality (or large n by CLT), and random sampling from the target population.", summary: "Violations of assumptions affect validity; robust alternatives exist for non-normal small samples." },
      hi, { title_in_context: "t-Test Assumptions", relevance: "Determines when t-test results are trustworthy.", applications: ["Normality checking", "Sample size planning"] },
      { prerequisites: ["spine_mathematics_l4_one_sample_t_test"], unlocks: [] },
      { source: src, chapter: "9", section: "9.5" }),
    l5("spine_mathematics_l5_one_vs_two_tailed_tests", "spine_mathematics_l4_one_sample_t_test", l3, D, kg,
      { title: "One-Tailed vs Two-Tailed Tests", definition: "Two-tailed tests split α between both directions; one-tailed tests concentrate α in one direction when the alternative is directional.", summary: "Tail choice must be pre-specified; one-tailed tests have greater power for directional hypotheses but cannot detect effects in the opposite direction." },
      hi, { title_in_context: "One-Tailed vs Two-Tailed Tests", relevance: "Standard decision in hypothesis test setup.", applications: ["Directional research hypotheses"] },
      { prerequisites: ["spine_mathematics_l4_one_sample_t_test"], unlocks: [] },
      { source: src, chapter: "9", section: "9.5" }),
  ];
  bundles["spine_mathematics_l3_hypothesis_testing.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. NHST framework with L5 detail on p-values and t-tests; max resolution 5.",
    concepts
  );
}

// 13. Vectors in Space
{
  const l3 = "spine_mathematics_l3_vectors_in_space";
  const kg = { knowledge_area: QR, knowledge_cluster: "Multivariable Analysis", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Multivariable Calculus", topic: "Vectors in Two and Three Dimensions", subtopic: null };
  const fr = { relevance: "Vectors represent directed quantities in 2D and 3D, foundation for multivariable calculus.", applications: [] };
  const src = "OpenStax Calculus Volume 3";
  bundles["spine_mathematics_l3_vectors_in_space.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. 3D coordinates, dot/cross products, lines and planes.",
    [
      l4("spine_mathematics_l4_three_dimensional_coordinates", l3, D, kg,
        { title: "Three-Dimensional Coordinate System", definition: "Points in space represented as (x, y, z) with orthogonal axes and distance formula derived from the Pythagorean theorem.", summary: "The 3D coordinate system extends plane geometry to model spatial positions and vector components." },
        hi, fr, { unlocks: ["spine_mathematics_l4_vector_components_magnitude"] },
        { source: src, chapter: "1", section: "1.1" }),
      l4("spine_mathematics_l4_vector_components_magnitude", l3, D, kg,
        { title: "Vector Components and Magnitude", definition: "A vector v = ⟨a, b, c⟩ has magnitude |v| = √(a² + b² + c²) and direction specified by components.", summary: "Component form enables algebraic vector operations and connects geometry to linear algebra." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_three_dimensional_coordinates"], unlocks: ["spine_mathematics_l4_dot_product", "spine_mathematics_l4_cross_product"] },
        { source: src, chapter: "1", section: "1.2" }),
      l4("spine_mathematics_l4_dot_product", l3, D, kg,
        { title: "Dot Product", definition: "For u = ⟨u₁, u₂, u₃⟩ and v = ⟨v₁, v₂, v₃⟩, u · v = u₁v₁ + u₂v₂ + u₃v₃ = |u||v|cos θ.", summary: "The dot product measures alignment of vectors, yields projections, and tests orthogonality when u · v = 0." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_vector_components_magnitude"], unlocks: ["spine_mathematics_l4_vector_projections"] },
        { source: src, chapter: "1", section: "1.3" }),
      l4("spine_mathematics_l4_cross_product", l3, D, kg,
        { title: "Cross Product", definition: "u × v is a vector perpendicular to both u and v with magnitude |u||v|sin θ, computed via determinant formula in 3D.", summary: "Cross products yield area of parallelograms, torque vectors, and surface normal directions." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_vector_components_magnitude"], unlocks: ["spine_mathematics_l4_lines_and_planes"] },
        { source: src, chapter: "1", section: "1.4" }),
      l4("spine_mathematics_l4_vector_projections", l3, D, kg,
        { title: "Vector Projections", definition: "The projection of u onto v is projv u = ((u · v)/|v|²)v, giving the component of u along v.", summary: "Projections decompose forces and velocities into parallel and perpendicular components." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_dot_product"], unlocks: [] },
        { source: src, chapter: "1", section: "1.3" }),
      l4("spine_mathematics_l4_lines_and_planes", l3, D, kg,
        { title: "Equations of Lines and Planes", definition: "Lines in space via parametric or symmetric equations; planes via point-normal form n · (r − r₀) = 0.", summary: "Line and plane equations are essential for intersection problems and multivariable optimization constraints." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_cross_product"], unlocks: [] },
        { source: src, chapter: "1", section: "1.5" }),
    ]
  );
}

// 14. Partial Derivatives
{
  const l3 = "spine_mathematics_l3_partial_derivatives";
  const kg = { knowledge_area: QR, knowledge_cluster: "Multivariable Analysis", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Multivariable Calculus", topic: "Partial Derivatives", subtopic: null };
  const fr = { relevance: "Partial derivatives measure rate of change in multivariable functions.", applications: [] };
  const src = "OpenStax Calculus Volume 3";
  bundles["spine_mathematics_l3_partial_derivatives.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. Partial derivatives, gradient, multivariable chain rule.",
    [
      l4("spine_mathematics_l4_functions_several_variables", l3, D, kg,
        { title: "Functions of Several Variables", definition: "Functions z = f(x, y) mapping multiple inputs to a single output, with domain in ℝⁿ and graphs as surfaces in 3D.", summary: "Multivariable functions model quantities depending on several independent variables such as temperature over space and time." },
        hi, fr, { unlocks: ["spine_mathematics_l4_partial_derivative_definition"] },
        { source: src, chapter: "4", section: "4.1" }),
      l4("spine_mathematics_l4_partial_derivative_definition", l3, D, kg,
        { title: "Partial Derivative Definition", definition: "∂f/∂x is the derivative of f with respect to x holding other variables fixed; computed by usual rules treating other variables as constants.", summary: "Partial derivatives isolate sensitivity to one input while holding others constant." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_functions_several_variables"], unlocks: ["spine_mathematics_l4_higher_order_partials", "spine_mathematics_l4_gradient_vector"] },
        { source: src, chapter: "4", section: "4.3" }),
      l4("spine_mathematics_l4_higher_order_partials", l3, D, kg,
        { title: "Higher-Order Partial Derivatives", definition: "Second partials f_{xx}, f_{xy}, f_{yx}, f_{yy} and beyond, with Clairaut's theorem f_{xy} = f_{yx} under continuity.", summary: "Mixed partials describe interaction effects between variables and appear in heat equation and optimization tests." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_partial_derivative_definition"], unlocks: ["spine_mathematics_l4_clairaut_theorem"] },
        { source: src, chapter: "4", section: "4.3" }),
      l4("spine_mathematics_l4_clairaut_theorem", l3, D, kg,
        { title: "Clairaut's Theorem on Mixed Partials", definition: "If f_{xy} and f_{yx} are continuous on an open disk, then f_{xy} = f_{yx} at each point.", summary: "Equality of mixed partials simplifies computation and guarantees symmetric Hessian entries for optimization." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_higher_order_partials"], unlocks: [] },
        { source: src, chapter: "4", section: "4.3" }),
      l4("spine_mathematics_l4_gradient_vector", l3, D, kg,
        { title: "Gradient Vector", definition: "∇f = ⟨f_x, f_y⟩ points in the direction of steepest ascent with magnitude equal to maximum rate of increase.", summary: "The gradient is central to optimization, level curves, and vector field definitions." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_partial_derivative_definition"], unlocks: ["spine_mathematics_l4_multivariable_chain_rule"] },
        { source: src, chapter: "4", section: "4.5" }),
      l4("spine_mathematics_l4_multivariable_chain_rule", l3, D, kg,
        { title: "Multivariable Chain Rule", definition: "If z = f(x, y) with x = g(t), y = h(t), then dz/dt = (∂f/∂x)(dx/dt) + (∂f/∂y)(dy/dt).", summary: "The multivariable chain rule tracks total rate of change through composed dependencies." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_gradient_vector"], unlocks: [] },
        { source: src, chapter: "4", section: "4.5" }),
    ]
  );
}

// 15. Multiple Integrals
{
  const l3 = "spine_mathematics_l3_multiple_integrals";
  const kg = { knowledge_area: QR, knowledge_cluster: "Multivariable Analysis", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Multivariable Calculus", topic: "Multiple Integrals", subtopic: null };
  const fr = { relevance: "Multiple integrals compute volume, mass, and accumulated quantities over regions in ℝⁿ.", applications: [] };
  const src = "OpenStax Calculus Volume 3";
  bundles["spine_mathematics_l3_multiple_integrals.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. Double and triple integrals, polar coordinates, applications.",
    [
      l4("spine_mathematics_l4_double_integrals_rectangles", l3, D, kg,
        { title: "Double Integrals over Rectangles", definition: "∬_R f(x, y) dA approximates volume under z = f(x, y) over rectangular region R via Riemann sums in two variables.", summary: "Double integrals extend accumulation to functions of two variables over planar regions." },
        hi, fr, { unlocks: ["spine_mathematics_l4_iterated_integrals"] },
        { source: src, chapter: "5", section: "5.1" }),
      l4("spine_mathematics_l4_iterated_integrals", l3, D, kg,
        { title: "Iterated Integrals and Fubini's Theorem", definition: "Double integrals evaluated as nested single integrals ∫∫ f(x,y) dA = ∫(∫ f(x,y) dy) dx with order often interchangeable.", summary: "Fubini's theorem reduces double integration to sequential single integrals, making computation tractable." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_double_integrals_rectangles"], unlocks: ["spine_mathematics_l4_double_integrals_general_regions"] },
        { source: src, chapter: "5", section: "5.2" }),
      l4("spine_mathematics_l4_double_integrals_general_regions", l3, D, kg,
        { title: "Double Integrals over General Regions", definition: "Integration over Type I and Type II regions bounded by curves, with limits determined by bounding functions.", summary: "Setting correct integration limits for non-rectangular domains is the main skill in applied double integration." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_iterated_integrals"], unlocks: ["spine_mathematics_l4_polar_coordinates_integration"] },
        { source: src, chapter: "5", section: "5.2" }),
      l4("spine_mathematics_l4_polar_coordinates_integration", l3, D, kg,
        { title: "Double Integrals in Polar Coordinates", definition: "Transform dA = r dr dθ for circular or radially symmetric regions, simplifying integrals with x² + y² structure.", summary: "Polar coordinates exploit circular symmetry in disks, annuli, and rotationally symmetric density functions." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_double_integrals_general_regions"], unlocks: [] },
        { source: src, chapter: "5", section: "5.3" }),
      l4("spine_mathematics_l4_triple_integrals", l3, D, kg,
        { title: "Triple Integrals", definition: "∭_E f(x, y, z) dV accumulates a scalar density over a solid region E in three dimensions.", summary: "Triple integrals compute mass, center of mass, and volume in 3D when density varies spatially." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_iterated_integrals"], unlocks: ["spine_mathematics_l4_volume_mass_applications"] },
        { source: src, chapter: "5", section: "5.4" }),
      l4("spine_mathematics_l4_volume_mass_applications", l3, D, kg,
        { title: "Volume and Mass Applications", definition: "Volume V = ∬_D 1 dA or ∭_E 1 dV; mass M = ∭ ρ dV with density function ρ.", summary: "Geometric and physical applications motivate setting up and evaluating multiple integrals in practice." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_triple_integrals"], unlocks: [fwd("spine_mathematics_l3_line_integrals")] },
        { source: src, chapter: "5", section: "5.5" }),
    ]
  );
}

// 16. Vector Fields
{
  const l3 = "spine_mathematics_l3_vector_fields";
  const kg = { knowledge_area: QR, knowledge_cluster: "Multivariable Analysis", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Multivariable Calculus", topic: "Vector Fields", subtopic: null };
  const fr = { relevance: "Vector fields assign vectors to points in space, modeling flows and forces.", applications: [] };
  const src = "OpenStax Calculus Volume 3";
  bundles["spine_mathematics_l3_vector_fields.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. Vector field definition, divergence, curl, gradient fields.",
    [
      l4("spine_mathematics_l4_vector_field_definition", l3, D, kg,
        { title: "Vector Field Definition", definition: "A vector field F assigns a vector F(x, y) or F(x, y, z) to each point in a domain, visualized as directed arrows.", summary: "Vector fields represent velocity flows, gravitational forces, and electromagnetic fields." },
        hi, fr, { unlocks: ["spine_mathematics_l4_gradient_fields", "spine_mathematics_l4_flow_lines"] },
        { source: src, chapter: "6", section: "6.1" }),
      l4("spine_mathematics_l4_gradient_fields", l3, D, kg,
        { title: "Gradient Fields and Potential Functions", definition: "A field F is a gradient field if F = ∇f for some scalar potential f; such fields are conservative when domain is simply connected.", summary: "Gradient fields connect scalar potentials to vector fields and enable path-independent line integrals." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_vector_field_definition"], unlocks: [fwd("spine_mathematics_l3_line_integrals")] },
        { source: src, chapter: "6", section: "6.1" }),
      l4("spine_mathematics_l4_divergence", l3, D, kg,
        { title: "Divergence of a Vector Field", definition: "In 3D, div F = ∂P/∂x + ∂Q/∂y + ∂R/∂z measures net outflow per unit volume at a point.", summary: "Positive divergence indicates source behavior; negative divergence indicates sink behavior in fluid flow models." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_vector_field_definition"], unlocks: [] },
        { source: src, chapter: "6", section: "6.5" }),
      l4("spine_mathematics_l4_curl", l3, D, kg,
        { title: "Curl of a Vector Field", definition: "Curl F = ∇ × F measures local rotation tendency of the field; zero curl in simply connected domains implies conservativity.", summary: "Curl identifies rotational components in fluid and electromagnetic fields." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_vector_field_definition"], unlocks: [] },
        { source: src, chapter: "6", section: "6.5" }),
      l4("spine_mathematics_l4_flow_lines", l3, D, kg,
        { title: "Flow Lines and Streamlines", definition: "Curves r(t) satisfying r′(t) = F(r(t)), tracing paths of particles advected by velocity field F.", summary: "Flow lines visualize field direction and are used to interpret physical motion without solving full PDEs." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_vector_field_definition"], unlocks: [] },
        { source: src, chapter: "6", section: "6.1" }),
    ]
  );
}

// 17. Line Integrals
{
  const l3 = "spine_mathematics_l3_line_integrals";
  const kg = { knowledge_area: QR, knowledge_cluster: "Multivariable Analysis", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Multivariable Calculus", topic: "Line Integrals", subtopic: null };
  const fr = { relevance: "Line integrals accumulate quantities along curves in vector fields.", applications: [] };
  const src = "OpenStax Calculus Volume 3";
  bundles["spine_mathematics_l3_line_integrals.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. Scalar and vector line integrals, path independence, work.",
    [
      l4("spine_mathematics_l4_scalar_line_integrals", l3, D, kg,
        { title: "Scalar Line Integrals", definition: "Integration of a scalar function f along curve C: ∫_C f ds, computing mass of a wire with density f.", summary: "Scalar line integrals generalize arc length to weighted accumulation along curves." },
        hi, fr, { unlocks: ["spine_mathematics_l4_vector_line_integrals"] },
        { source: src, chapter: "6", section: "6.2" }),
      l4("spine_mathematics_l4_vector_line_integrals", l3, D, kg,
        { title: "Vector Line Integrals", definition: "Work integral ∫_C F · dr = ∫_C P dx + Q dy + R dz computing work done by force field F along path C.", summary: "Vector line integrals measure circulation and work and depend on path unless the field is conservative." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_scalar_line_integrals"], unlocks: ["spine_mathematics_l4_path_independence", "spine_mathematics_l4_work_by_force_field"] },
        { source: src, chapter: "6", section: "6.2" }),
      l4("spine_mathematics_l4_path_independence", l3, D, kg,
        { title: "Path Independence and Conservative Fields", definition: "A line integral is path-independent if it depends only on endpoints; equivalent to F being a gradient field on a simply connected domain.", summary: "Conservative fields simplify work calculations to potential difference: ∫_C F·dr = f(B) − f(A)." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_vector_line_integrals"], unlocks: [] },
        { source: src, chapter: "6", section: "6.3" }),
      l4("spine_mathematics_l4_work_by_force_field", l3, D, kg,
        { title: "Work Done by a Force Field", definition: "Work W = ∫_C F · dr along a path C under force F, positive when force has component along motion.", summary: "Work integrals connect vector calculus to physics problems involving variable forces along curved paths." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_vector_line_integrals"], unlocks: [] },
        { source: src, chapter: "6", section: "6.2" }),
    ]
  );
}

// 18. Eigenvalues and Eigenvectors
{
  const l3 = "spine_mathematics_l3_eigenvalues_and_eigenvectors";
  const kg = { knowledge_area: QR, knowledge_cluster: "Linear Systems", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Linear Algebra", topic: "Eigenvalues and Eigenvectors", subtopic: null };
  const fr = { relevance: "Eigenanalysis decomposes linear transformations into invariant directions.", applications: [] };
  const src = "OpenStax Linear Algebra";
  bundles["spine_mathematics_l3_eigenvalues_and_eigenvectors.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. Characteristic polynomial, eigenvalue computation, diagonalization.",
    [
      l4("spine_mathematics_l4_eigenvector_definition", l3, D, kg,
        { title: "Eigenvector and Eigenvalue Definition", definition: "Nonzero vector v is an eigenvector of A with eigenvalue λ if Av = λv, meaning v is scaled but not rotated by A.", summary: "Eigenvectors reveal directions preserved by a linear transformation." },
        hi, fr, { unlocks: ["spine_mathematics_l4_characteristic_polynomial", "spine_mathematics_l4_geometric_interpretation_eigen"] },
        { source: src, chapter: "5", section: "5.1" }),
      l4("spine_mathematics_l4_characteristic_polynomial", l3, D, kg,
        { title: "Characteristic Polynomial", definition: "p(λ) = det(A − λI); eigenvalues are roots of p(λ) = 0.", summary: "The characteristic polynomial systematically finds all eigenvalues of a square matrix." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_eigenvector_definition"], unlocks: ["spine_mathematics_l4_finding_eigenvectors"] },
        { source: src, chapter: "5", section: "5.2" }),
      l4("spine_mathematics_l4_finding_eigenvectors", l3, D, kg,
        { title: "Finding Eigenvectors", definition: "For each eigenvalue λ, solve (A − λI)v = 0 to obtain eigenvectors in the null space of A − λI.", summary: "Eigenspace for λ is the set of all eigenvectors plus zero, forming a subspace." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_characteristic_polynomial"], unlocks: ["spine_mathematics_l4_diagonalization_concept"] },
        { source: src, chapter: "5", section: "5.2" }),
      l4("spine_mathematics_l4_geometric_interpretation_eigen", l3, D, kg,
        { title: "Geometric Interpretation of Eigenvalues", definition: "Eigenvalue magnitude |λ| scales lengths; sign and complex eigenvalues indicate reflection or rotation components.", summary: "Geometric view connects eigenanalysis to transformation behavior in the plane and space." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_eigenvector_definition"], unlocks: [] },
        { source: src, chapter: "5", section: "5.1" }),
      l4("spine_mathematics_l4_diagonalization_concept", l3, D, kg,
        { title: "Matrix Diagonalization", definition: "A = PDP⁻¹ with D diagonal when A has enough linearly independent eigenvectors; simplifies Aⁿ and matrix functions.", summary: "Diagonalization decouples coupled linear dynamics into independent scalar modes." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_finding_eigenvectors"], unlocks: [fwd("spine_mathematics_l3_systems_of_odes")] },
        { source: src, chapter: "5", section: "5.3" }),
    ]
  );
}

// 19. First-Order ODEs
{
  const l3 = "spine_mathematics_l3_first_order_odes";
  const kg = { knowledge_area: QR, knowledge_cluster: "Dynamical Systems", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Differential Equations", topic: "First-Order Ordinary Differential Equations", subtopic: null };
  const fr = { relevance: "First-order ODEs model single-step dynamics and growth-decay processes.", applications: [] };
  const src = "OpenStax Calculus Volume 2";
  bundles["spine_mathematics_l3_first_order_odes.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. ODE classification, direction fields, linear first-order ODEs.",
    [
      l4("spine_mathematics_l4_ode_classification", l3, D, kg,
        { title: "ODE Classification and Order", definition: "Ordinary differential equations relate a function to its derivatives; first-order ODEs involve only the first derivative y′.", summary: "Classification by order and linearity determines which solution technique applies." },
        hi, fr, { unlocks: ["spine_mathematics_l4_direction_fields", "spine_mathematics_l4_linear_first_order_odes"] },
        { source: src, chapter: "4", section: "4.1" }),
      l4("spine_mathematics_l4_direction_fields", l3, D, kg,
        { title: "Direction Fields and Slope Visualization", definition: "Graphical display of short slope segments at grid points for y′ = f(x, y), revealing solution curve behavior qualitatively.", summary: "Direction fields preview equilibria, stability, and asymptotic behavior without explicit solutions." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_ode_classification"], unlocks: ["spine_mathematics_l4_eulers_method"] },
        { source: src, chapter: "4", section: "4.2" }),
      l4("spine_mathematics_l4_eulers_method", l3, D, kg,
        { title: "Euler's Method", definition: "Numerical approximation y_{n+1} = y_n + h·f(x_n, y_n) stepping along the direction field with step size h.", summary: "Euler's method provides numerical solutions when analytic methods fail and introduces numerical error concepts." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_direction_fields"], unlocks: [] },
        { source: src, chapter: "4", section: "4.2" }),
      l4("spine_mathematics_l4_linear_first_order_odes", l3, D, kg,
        { title: "Linear First-Order ODEs", definition: "Equations y′ + P(x)y = Q(x) solved by integrating factor μ(x) = e^{∫P(x)dx} multiplying both sides.", summary: "The integrating factor method converts linear first-order ODEs to integrable total derivatives." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_ode_classification"], unlocks: ["spine_mathematics_l4_integrating_factor_method"] },
        { source: src, chapter: "4", section: "4.4" }),
      l4("spine_mathematics_l4_integrating_factor_method", l3, D, kg,
        { title: "Integrating Factor Method", definition: "Procedure: compute μ, multiply ODE by μ, recognize (μy)′ = μQ, integrate to find y.", summary: "Integrating factors extend beyond ODEs to exact equations and appear in standard form derivations." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_linear_first_order_odes"], unlocks: [fwd("spine_mathematics_l3_separable_differential_equations")] },
        { source: src, chapter: "4", section: "4.4" }),
    ]
  );
}

// 20. Separable Differential Equations
{
  const l3 = "spine_mathematics_l3_separable_differential_equations";
  const kg = { knowledge_area: QR, knowledge_cluster: "Dynamical Systems", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Differential Equations", topic: "Separable Differential Equations", subtopic: null };
  const fr = { relevance: "Separable ODEs yield analytic solutions by algebraic separation and integration.", applications: [] };
  const src = "OpenStax Calculus Volume 2";
  bundles["spine_mathematics_l3_separable_differential_equations.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. Separation of variables, IVPs, growth/decay, equilibria.",
    [
      l4("spine_mathematics_l4_separable_equation_form", l3, D, kg,
        { title: "Separable Equation Form", definition: "ODEs writable as dy/dx = g(x)h(y) or M(x) dx + N(y) dy = 0, allowing variables on opposite sides.", summary: "Separability is the simplest analytic technique for first-order ODEs and includes exponential growth/decay." },
        hi, fr, { unlocks: ["spine_mathematics_l4_separation_of_variables_procedure"] },
        { source: src, chapter: "4", section: "4.3" }),
      l4("spine_mathematics_l4_separation_of_variables_procedure", l3, D, kg,
        { title: "Separation of Variables Procedure", definition: "Rearrange to (1/h(y)) dy = g(x) dx and integrate both sides, then solve for y if possible.", summary: "Integration after separation yields implicit or explicit general solutions." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_separable_equation_form"], unlocks: ["spine_mathematics_l4_initial_value_problems_separable"] },
        { source: src, chapter: "4", section: "4.3" }),
      l4("spine_mathematics_l4_initial_value_problems_separable", l3, D, kg,
        { title: "Initial Value Problems", definition: "Particular solution determined by applying y(x₀) = y₀ after finding the general solution to fix the integration constant.", summary: "IVPs select the unique solution curve passing through a given point in the direction field." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_separation_of_variables_procedure"], unlocks: ["spine_mathematics_l4_growth_decay_applications"] },
        { source: src, chapter: "4", section: "4.3" }),
      l4("spine_mathematics_l4_growth_decay_applications", l3, D, kg,
        { title: "Growth and Decay Applications", definition: "Models dy/dt = ky with solutions y = Ce^{kt}; k > 0 growth, k < 0 decay, linking to exponential functions.", summary: "Separable ODEs unify population, radioactive, and financial exponential models under one technique." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_initial_value_problems_separable"], unlocks: [] },
        { source: src, chapter: "4", section: "4.3" }),
      l4("spine_mathematics_l4_equilibrium_solutions", l3, D, kg,
        { title: "Equilibrium Solutions", definition: "Constant solutions y = c where dy/dx = 0; equilibria appear as horizontal lines in direction fields.", summary: "Equilibria are fixed points of dynamics; stability analysis begins by locating them." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_separable_equation_form"], unlocks: [fwd("spine_mathematics_l3_systems_of_odes")] },
        { source: src, chapter: "4", section: "4.3" }),
    ]
  );
}

// 21. Second-Order Linear ODEs
{
  const l3 = "spine_mathematics_l3_second_order_linear_odes";
  const kg = { knowledge_area: QR, knowledge_cluster: "Dynamical Systems", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Differential Equations", topic: "Second-Order Linear Differential Equations", subtopic: null };
  const fr = { relevance: "Second-order ODEs model oscillations, springs, and circuits.", applications: [] };
  const src = "OpenStax Calculus Volume 2";
  bundles["spine_mathematics_l3_second_order_linear_odes.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. Characteristic equation, real/complex/repeated roots.",
    [
      l4("spine_mathematics_l4_second_order_linear_classification", l3, D, kg,
        { title: "Second-Order Linear ODE Classification", definition: "Equations ay″ + by′ + cy = g(x); homogeneous when g = 0, nonhomogeneous otherwise; linear superposition applies.", summary: "Classification determines whether superposition and characteristic equation methods apply." },
        hi, fr, { unlocks: ["spine_mathematics_l4_characteristic_equation"] },
        { source: src, chapter: "4", section: "4.5" }),
      l4("spine_mathematics_l4_characteristic_equation", l3, D, kg,
        { title: "Characteristic Equation", definition: "For ay″ + by′ + cy = 0, substitute y = e^{rx} to obtain ar² + br + c = 0 whose roots determine the solution form.", summary: "The characteristic polynomial reduces second-order ODEs to algebraic root-finding." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_second_order_linear_classification"], unlocks: ["spine_mathematics_l4_real_distinct_roots", "spine_mathematics_l4_complex_conjugate_roots", "spine_mathematics_l4_repeated_roots"] },
        { source: src, chapter: "4", section: "4.5" }),
      l4("spine_mathematics_l4_real_distinct_roots", l3, D, kg,
        { title: "Real Distinct Roots", definition: "When r₁ ≠ r₂ are real, general solution y = C₁e^{r₁x} + C₂e^{r₂x}.", summary: "Real distinct roots produce exponential modes without oscillation." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_characteristic_equation"], unlocks: [] },
        { source: src, chapter: "4", section: "4.5" }),
      l4("spine_mathematics_l4_complex_conjugate_roots", l3, D, kg,
        { title: "Complex Conjugate Roots", definition: "When r = α ± βi, solution y = e^{αx}(C₁ cos βx + C₂ sin βx) exhibits oscillation modulated by exponential envelope.", summary: "Complex roots model damped or undamped oscillations in mechanical and electrical systems." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_characteristic_equation"], unlocks: [] },
        { source: src, chapter: "4", section: "4.5" }),
      l4("spine_mathematics_l4_repeated_roots", l3, D, kg,
        { title: "Repeated Roots", definition: "When r is a double root, general solution y = (C₁ + C₂x)e^{rx} includes an x factor for linear independence.", summary: "Repeated roots require multiplying by x to obtain a second linearly independent solution." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_characteristic_equation"], unlocks: [fwd("spine_mathematics_l3_systems_of_odes")] },
        { source: src, chapter: "4", section: "4.5" }),
    ]
  );
}

// 22. Systems of ODEs
{
  const l3 = "spine_mathematics_l3_systems_of_odes";
  const kg = { knowledge_area: QR, knowledge_cluster: "Dynamical Systems", primary_domain: D };
  const hi = { category: "Mathematics", subcategory: "Differential Equations", topic: "Systems of Differential Equations", subtopic: null };
  const fr = { relevance: "Coupled ODEs model interacting populations, circuits, and mechanical systems.", applications: [] };
  const src = "OpenStax Calculus Volume 2";
  bundles["spine_mathematics_l3_systems_of_odes.mathematics.json"] = bundle(l3, D,
    "Mathematics domain bundle. Matrix form, eigenvalue method, phase plane, stability.",
    [
      l4("spine_mathematics_l4_system_formulation", l3, D, kg,
        { title: "System Formulation", definition: "Coupled first-order ODEs x′ = f(x, y), y′ = g(x, y) describing interacting rates of change.", summary: "Many higher-order ODEs convert to first-order systems by introducing auxiliary variables." },
        hi, fr, { unlocks: ["spine_mathematics_l4_matrix_form_linear_systems", "spine_mathematics_l4_phase_plane"] },
        { source: src, chapter: "4", section: "4.6" }),
      l4("spine_mathematics_l4_matrix_form_linear_systems", l3, D, kg,
        { title: "Matrix Form x′ = Ax", definition: "Linear systems written as x′ = Ax with x a vector and A a coefficient matrix, enabling eigenvalue analysis.", summary: "Matrix notation compactly expresses coupled linear dynamics and connects to linear algebra." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_system_formulation"], unlocks: ["spine_mathematics_l4_eigenvalue_method_systems"] },
        { source: src, chapter: "4", section: "4.6" }),
      l4("spine_mathematics_l4_eigenvalue_method_systems", l3, D, kg,
        { title: "Eigenvalue Method for Linear Systems", definition: "Solutions built from eigenvectors v with eigenvalues λ: e^{λt}v forms fundamental solutions when eigenvalues are real and distinct.", summary: "The eigenvalue method diagonalizes linear system dynamics into independent exponential modes." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_matrix_form_linear_systems"], unlocks: ["spine_mathematics_l4_stability_classification"] },
        { source: src, chapter: "4", section: "4.6" }),
      l4("spine_mathematics_l4_phase_plane", l3, D, kg,
        { title: "Phase Plane Analysis", definition: "Plot of trajectories (x(t), y(t)) in the xy-plane revealing equilibrium points and flow patterns.", summary: "Phase portraits visualize long-term behavior of coupled systems without explicit time-series plots." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_system_formulation"], unlocks: ["spine_mathematics_l4_stability_classification"] },
        { source: src, chapter: "4", section: "4.6" }),
      l4("spine_mathematics_l4_stability_classification", l3, D, kg,
        { title: "Equilibrium Stability Classification", definition: "Classifying equilibria as stable/unstable nodes, saddles, or spirals based on eigenvalue signs and complex parts.", summary: "Stability determines whether small perturbations decay or grow, critical for population and control models." },
        hi, fr, { prerequisites: ["spine_mathematics_l4_eigenvalue_method_systems", "spine_mathematics_l4_phase_plane"], unlocks: [] },
        { source: src, chapter: "4", section: "4.6" }),
    ]
  );
}

// Write all bundles
for (const [filename, data] of Object.entries(bundles)) {
  // Each concept gets a unique section citation keyed to its content title
  for (const concept of data.concepts) {
    concept.metadata.source_references[0].section = concept.content.title;
    const notes = [];
    if (concept.knowledge_graph._shared_concept_note) {
      notes.push("Shared L3 anchor — verify cross-domain context in consolidation pass.");
    }
    const hasForward = [
      ...concept.dependency_graph.unlocks,
      ...concept.domain_context.dependency_graph.unlocks_in_context,
    ].some((u) => typeof u === "object" && u._forward_reference);
    if (hasForward) {
      notes.push("Contains forward reference to existing L3 node — verify target exists in spine.");
    }
    if (notes.length) concept._reviewer_note = notes.join(" ");
  }
  writeFileSync(join(outDir, filename), JSON.stringify(data, null, 2) + "\n", "utf8");
}
console.log("Written:", Object.keys(bundles).length, "files");
