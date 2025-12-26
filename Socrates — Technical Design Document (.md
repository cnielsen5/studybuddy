# Socrates — Technical Design Document (TDD)

---

## 1. Overview

### 1.1 Purpose

This document defines the technical architecture, data models, and control logic for **Socrates**, an offline-first, AI-assisted spaced repetition system designed to maximize learning efficiency through concept-based scheduling, diagnostic probing, and mastery certification.

### 1.2 Design Goals

* Minimize redundant study while preserving long-term retention
* Treat *conceptual relationships* as first-class learning targets
* Maintain scheduler stability despite aggressive optimization
* Ensure explainability, debuggability, and user trust

### 1.3 Non-Goals

* Real-time collaborative learning
* Adaptive content authoring (future work)
* Full AI autonomy without user consent

---

## 2. System Architecture

### 2.1 High-Level Components

* **Local Client (Offline-First)**
* **Sync & Backend Services (Firebase)**
* **Content Libraries (Shared)**
* **User State (Private)**

### 2.2 Layered Model

#### Content Layer (Shared)

* Concepts
* Cards
* Relationships
* Questions

#### User State Layer (Private)

* Card scheduling state (FSRS)
* Misconception edges
* Fatigue and capacity metrics
* Goal and plan state

#### Evidence Layer (Append-Only)

* Question attempts
* AI probe logs
* Session summaries

---

## 3. Client Application

### 3.1 Platform & Stack

* TanStack Start (UI framework)
* TanStack Query (static/reference data)
* LocalForage (persistent storage)
* CapacitorJS (mobile)
* Tauri (desktop)

### 3.2 Core Responsibilities

* Execute scheduler locally
* Record all learning evidence
* Apply caps, throttles, and explainability rules
* Operate fully offline

### 3.3 UI Surfaces

* Home (libraries, goals, sync)
* Study (cards, questions, probes)
* Settings
* Global AI assistant (read-only unless invoked)

---

## 4. Backend & Sync

### 4.1 Infrastructure

* Google Firebase
* Cloud Functions

### 4.2 Responsibilities

* Store public and private content libraries
* Persist user progress
* Generate embeddings asynchronously
* Resolve conflicts via CRDT rules (LWW for logs, max for strengths)

---

## 5. Content Libraries

### 5.1 Structure

Libraries are immutable JSON bundles composed of:

* Concepts
* Cards
* Relationships
* Questions

### 5.2 Concepts

* Semantic vector
* Structural relationships
* Core, extension, and certification card sets

### 5.3 Cards

* Atomic learning units
* FSRS scheduled
* Attributes: difficulty, cognitive load, pedagogical role

### 5.4 Relationships

* Cross-concept dependencies
* Represented as relationship cards
* One-hop propagation only

### 5.5 Questions

* May reference multiple concepts
* Tagged by relationship type and diagnostic intent

---

## 6. Scheduler

### 6.1 Core Algorithm

* FSRS v5
* Card-only scheduling

### 6.2 Knowledge vs Schedule Separation

```ts
KnowledgeEstimate {
  confidence: number;
  misconceptionRisk: number;
  evidenceCount: number;
}

ScheduleState {
  stability: number;
  retrievability: number;
  due: Date;
}
```

### 6.3 Scheduling Order

1. Incomplete learning cards
2. Learning cards
3. Review cards
4. Mastered cards

---

## 7. Goals & Planning

### 7.1 Goals

* Target content
* Target date
* Target retention

### 7.2 Planning

* Schedule generated at goal creation
* Divided into daily chunks
* Adjusted daily by availability and fatigue

### 7.3 Learning Aggression

* Scalar ∈ [0,1]
* Scales certification thresholds and acceleration

---

## 8. Fatigue & Capacity Metrics

### 8.1 Attention Fatigue Index (AFI)

* Session-scoped
* Derived from response time drift, error drift, confidence mismatch
* Used for in-session throttling

### 8.2 Sustained Load Index (SLI)

* Weekly aggregation
* Used for long-term planning

### 8.3 Capacity Index

* Measures tolerance for high-load sessions

---

## 9. Misconceptions

### 9.1 Definition

A misconception is a **user-specific, directional, time-varying edge between two concepts** representing a systematic mental model error.

### 9.2 Data Model

```json
{
  "misconceptionId": "mis_edge_001",
  "userId": "user_123",
  "conceptA": "concept_A",
  "conceptB": "concept_B",
  "direction": {
    "from": "concept_B",
    "to": "concept_A",
    "errorType": "reversal"
  },
  "misconceptionType": "directionality",
  "strength": 0.63,
  "status": "active",
  "firstObserved": "...",
  "lastObserved": "..."
}
```

### 9.3 Update Rules

* Updated only from evidence
* Daily strength increase capped
* Weekly decay applied

---

## 10. AI Probing

### 10.1 Scope

* Relationship cards
* Multi-concept questions

### 10.2 State Machine

* IDLE
* DIAGNOSTIC
* REMEDIAL (optional)
* RESOLUTION

### 10.3 Outcomes

* Misconception updates
* Evidence logging
* Optional scheduler suggestions (user-approved)

### 10.4 Caps

* Max 5 probes/day
* Max 2 deep probes/session
* Max 1 probe/concept/day

---

## 11. Mastery Certification

### 11.1 Purpose

Detect pre-existing mastery *before* learning a new concept.

### 11.2 Trigger

* Before unlocking a new concept chunk

### 11.3 Flow

1. Short diagnostic probe (2–4 items)
2. Evaluate correctness, reasoning, confidence
3. Outcome: full, partial, or no certification

### 11.4 Effects

* Suppress redundant cards
* Accelerate initial scheduling
* Faster decay and revocation on error

---

## 12. Propagation, Modifiers & Caps

### 12.1 Stability Clamps

* ±25% per review

### 12.2 Daily Caps

* Max propagation penalty per card/day
* Max neighbor boost per card/day

### 12.3 Density Caps

* Max penalized cards per concept/day
* Max boosted cards per concept/day

### 12.4 Central Safety Configuration

* All caps defined in a single config

---

## 13. Explainability & Debugging

### 13.1 Primary Reason Contract

Every scheduled card has one dominant reason:

* due_review
* recent_failure
* relationship_dependency
* misconception_remediation
* mastery_certification
* goal_priority

### 13.2 Logs

* Cap-hit logs
* Probe logs
* Scheduler diagnostics

---

## 14. Offline Support

* Pre-bundled diagnostic questions
* Certification cards
* Probing templates

---

## 15. Future Work

* AI-assisted library creation
* External deck imports
