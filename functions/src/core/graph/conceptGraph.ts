/**
 * Concept Graph Utilities
 * 
 * Manages concept relationships, prerequisites, and graph traversal.
 * Pure functions for working with concept dependency graphs.
 * 
 * Rules:
 * - No I/O
 * - No side effects
 * - Functions in → functions out
 */

import { Concept } from "../../domain/concept";

/**
 * Concept graph node
 */
export interface ConceptNode {
  /** Concept ID */
  concept_id: string;
  /** Prerequisite concept IDs */
  prerequisites: string[];
  /** Concepts that this unlocks */
  unlocks: string[];
  /** Related concepts */
  related: string[];
  /** Child concepts */
  children: string[];
}

/**
 * Concept graph (adjacency list representation)
 */
export interface ConceptGraph {
  /** Map of concept ID to node */
  nodes: Map<string, ConceptNode>;
}

/**
 * Builds a concept graph from concepts
 * 
 * @param concepts - Array of concepts
 * @returns Concept graph
 */
export function buildConceptGraph(concepts: Concept[]): ConceptGraph {
  const nodes = new Map<string, ConceptNode>();

  // Initialize nodes
  for (const concept of concepts) {
    nodes.set(concept.id, {
      concept_id: concept.id,
      prerequisites: [...concept.dependency_graph.prerequisites],
      unlocks: [...concept.dependency_graph.unlocks],
      related: [...concept.dependency_graph.related_concepts],
      children: [...concept.dependency_graph.child_concepts],
    });
  }

  // Build reverse edges (unlocks)
  for (const concept of concepts) {
    const node = nodes.get(concept.id)!;
    for (const prerequisiteId of node.prerequisites) {
      const prereqNode = nodes.get(prerequisiteId);
      if (prereqNode && !prereqNode.unlocks.includes(concept.id)) {
        prereqNode.unlocks.push(concept.id);
      }
    }
  }

  return { nodes };
}

/**
 * Gets all prerequisites for a concept (transitive closure)
 * 
 * @param graph - Concept graph
 * @param conceptId - Concept ID
 * @returns Array of prerequisite concept IDs (including transitive)
 */
export function getAllPrerequisites(
  graph: ConceptGraph,
  conceptId: string
): string[] {
  const visited = new Set<string>();
  const prerequisites: string[] = [];

  function dfs(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = graph.nodes.get(nodeId);
    if (!node) return;

    for (const prereqId of node.prerequisites) {
      if (!visited.has(prereqId)) {
        prerequisites.push(prereqId);
        dfs(prereqId);
      }
    }
  }

  dfs(conceptId);
  return prerequisites;
}

/**
 * Gets all concepts unlocked by a concept (transitive closure)
 * 
 * @param graph - Concept graph
 * @param conceptId - Concept ID
 * @returns Array of unlocked concept IDs (including transitive)
 */
export function getAllUnlocks(
  graph: ConceptGraph,
  conceptId: string
): string[] {
  const visited = new Set<string>();
  const unlocks: string[] = [];

  function dfs(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = graph.nodes.get(nodeId);
    if (!node) return;

    for (const unlockId of node.unlocks) {
      if (!visited.has(unlockId)) {
        unlocks.push(unlockId);
        dfs(unlockId);
      }
    }
  }

  dfs(conceptId);
  return unlocks;
}

/**
 * Checks if a concept has all prerequisites mastered
 * 
 * @param graph - Concept graph
 * @param conceptId - Concept ID
 * @param masteredConcepts - Set of mastered concept IDs
 * @returns true if all prerequisites are mastered
 */
export function hasPrerequisitesMastered(
  graph: ConceptGraph,
  conceptId: string,
  masteredConcepts: Set<string>
): boolean {
  const node = graph.nodes.get(conceptId);
  if (!node) return false;

  for (const prereqId of node.prerequisites) {
    if (!masteredConcepts.has(prereqId)) {
      return false;
    }
  }

  return true;
}

/**
 * Finds concepts that are ready to be learned (prerequisites mastered)
 * 
 * @param graph - Concept graph
 * @param masteredConcepts - Set of mastered concept IDs
 * @param learnedConcepts - Set of already learned concept IDs
 * @returns Array of concept IDs ready to learn
 */
export function findReadyConcepts(
  graph: ConceptGraph,
  masteredConcepts: Set<string>,
  learnedConcepts: Set<string> = new Set()
): string[] {
  const ready: string[] = [];

  for (const conceptId of graph.nodes.keys()) {
    // Skip if already learned
    if (learnedConcepts.has(conceptId)) continue;

    // Check if all prerequisites are mastered
    if (hasPrerequisitesMastered(graph, conceptId, masteredConcepts)) {
      ready.push(conceptId);
    }
  }

  return ready;
}

/**
 * Finds the learning path (topological sort) for concepts
 * 
 * @param graph - Concept graph
 * @param targetConcepts - Concept IDs to learn
 * @returns Array of concept IDs in learning order
 */
export function findLearningPath(
  graph: ConceptGraph,
  targetConcepts: string[]
): string[] {
  const visited = new Set<string>();
  const path: string[] = [];

  function dfs(nodeId: string) {
    if (visited.has(nodeId)) return;
    visited.add(nodeId);

    const node = graph.nodes.get(nodeId);
    if (!node) return;

    // Visit prerequisites first
    for (const prereqId of node.prerequisites) {
      if (graph.nodes.has(prereqId)) {
        dfs(prereqId);
      }
    }

    // Add to path
    if (targetConcepts.includes(nodeId)) {
      path.push(nodeId);
    }
  }

  // Start DFS from each target
  for (const targetId of targetConcepts) {
    if (graph.nodes.has(targetId)) {
      dfs(targetId);
    }
  }

  return path;
}

/**
 * Checks for cycles in the concept graph
 * 
 * @param graph - Concept graph
 * @returns true if cycle detected
 */
export function hasCycle(graph: ConceptGraph): boolean {
  const visited = new Set<string>();
  const recStack = new Set<string>();

  function hasCycleDFS(nodeId: string): boolean {
    if (recStack.has(nodeId)) return true; // Cycle detected
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    recStack.add(nodeId);

    const node = graph.nodes.get(nodeId);
    if (node) {
      for (const prereqId of node.prerequisites) {
        if (hasCycleDFS(prereqId)) return true;
      }
    }

    recStack.delete(nodeId);
    return false;
  }

  for (const conceptId of graph.nodes.keys()) {
    if (!visited.has(conceptId)) {
      if (hasCycleDFS(conceptId)) return true;
    }
  }

  return false;
}

