Socrates Structure and Organizer

1. Vision and Core Principles
    1.1 Product Vision
            Study application using AI-guided spaced repetition over concept maps composed of cards, questions, and relationships
            Learning and review decisions are driven by performance evidence, not fixed schedules
            Aggressive optimization with strong guardrails
            Primary goal: maximize learning efficiency (reduce unnecessary study while preserving retention)
    1.2 Offline-First Architecture
            Local application supports:
                Learning new cards
                Reviewing cards
                Answering questions
                AI probing, certification, and adjustments
                All performance data recorded locally
            Sync process:
                Uploads user progress and evidence to cloud
                Downloads content library updates

2. High-Level System Layers
    2.1 Content Graph (Shared)
            Concepts
            Cards
            Relationships
            Questions
    2.2 User State (Private)
            Card scheduling state
            Misconception edges
            Fatigue and capacity metrics
            Goals and plans
            Annotations / Preferences
                PersonalTag
                    Users can tag cards for their personal use to identify cards they want to view later (for cramming, rote memorization, lists, etc.)
                    JSON
                        UserCardAnnotation {
                        userId: string,
                        cardId: string,
                        tags: string[],
                        pinned?: boolean,
                        lastUpdated: ISODateString
                        }
    2.3 Evidence Layer (Derived / Append-only)
            Question attempts
                {
                            "errorType": "misconception | retrieval_failure | misreading | strategy_error | time_pressure",
                            "confidenceMismatch": true,
                            "derivedFrom": "question | followup",
                            "timestamp": "..."
                            }
                {
                "attemptId": "qa_991",
                "questionId": "question_082",

                "concepts": ["concept_A", "concept_B"],
                "testedRelationship": "mechanism",

                "result": "incorrect",
                "confidence": 0.82,
                "confidenceMismatch": true,

                "timestamp": "2025-01-14T18:22:00Z"
                }
            AI probe outcomes
            Session summaries
                Card performance
                    MyAverageTime
                    Use exponential moving averages 
                        function updateCardTime(card, timeTaken) {
                        // Cap at 60s to prevent AFK skewing
                        const cappedTime = Math.min(timeTaken, 60);
                        
                        // Weight recent attempts more heavily (e.g., 20% weight to new attempt)
                        card.my_avg_seconds = (card.my_avg_seconds * 0.8) + (cappedTime * 0.2);
                        
                        return card;
                        }
                Session summary
            Skill Models
    Architectural Rule
        If a field is:
            Measured → Evidence
            Chosen → User State
            Judging content quality → Content Meta-Layer
    Scheduling Architecture
        FSRS Scheduler
        ↓
        Schedule Normalization
        ↓
        Eligibility Filters
        ↓
        QUEUE BUILDER
        ↓
        Session Queue

3. Local Client Application
    3.1 Core Responsibilities
            Execute scheduler locally
            Track all performance and evidence
            Apply caps, throttles, and explainability rules
            Operate fully offline
    3.2 Technology
            TanStack (Start + Query)
            LocalForage
            Capacitor (mobile)
            Tauri (desktop)
    3.3 UI Surfaces
            Home (libraries, goals, sync)
            Study (cards, questions, relationship cards)
            Concept Map
            Settings
            Global AI assistant (opt-in actions only)
            Insights panel
            Session end summary
            Optional “Improve Test Strategy” prompt

4. Backend & Sync
    4.1 Infrastructure
            Firebase
            Cloud Functions
    4.2 Responsibilities    
            Store content libraries
            Store user progress
            Generate embeddings asynchronously
            Sync via CRDT rules (LWW, max-strength)
            
5. Content Libraries
    5.1 Structure
            JSON bundles
            Public and private libraries
            Local CRUD options
    5.2 Concepts
            The most basic unit of the concept map, houses multiple cards 
            Source
                AI-generated
            Qualities
                Centroid Vector
                    Average of all semantic vectors of cards contained within this concept
                Structural Degrees
                    # of concepts structurally connected to a concept
                Semantic Degrees
                    # of concepts semantically close to a concept
                    - semantic_degree(concept_i) =
                    -     |{ concept_j : cosine_similarity(vec_i, vec_j) > threshold }|
                    - Set threshold to 0.7-0.85 depending on domain density
                        - Baseline of 0.75
                Combined Degrees (i.e. Connectivity)
                    combined_degree(A) = α * structural_degree(A) + (1 - α) * semantic_degree(A)
                    alpha should be 0.2 or 0.3 as a baseline to emphasize semantic relationships more than structural
                    - This identifies “hidden hubs” - concepts that truly are central, but may not be represented as central based on concept map
                Betweenness
                Structural Neighbors
                Semantic Neighbors
                Retention Score
                    Determined by the weighted average of predicted retention (retrievability) of all cards within concept
                Mastery Score
                    % of cards in mastery stage
                ConceptState =
                    | "unintroduced"
                    | "fragile"
                    | "forming"
                    | "stable"
                    | "robust"
                Core Cards
                    Central ideas that are critical for understanding the concept as a whole
                Extension Cards
                    Fringe material that relies on very specific information recall, not crucial to the core idea of the concept
                Certification Cards
                    Cards used to certify user knowledge during mastery certification
                Remedial Cards
            JSON (Master Template)
                {
                    "id": "concept_0001",
                    "type": "concept",
                    "_comment": "Static, read-only Golden Master record shared by all users. Contains only semantic, structural, and editorial intent.",

                    "metadata": {
                        "created_at": "2025-11-03T00:00:00Z",
                        "updated_at": "2025-11-17T12:00:00Z",
                        "created_by": "system_admin",
                        "last_updated_by": "system_admin",
                        "version": "1.1",
                        "status": "published",

                        "tags": [
                        "pathology",
                        "cardio",
                        "atherosclerosis",
                        "lipids"
                        ],

                        "search_keywords": [
                        "foam cells",
                        "intimal streak",
                        "ASVD",
                        "hardening of arteries",
                        "early atherosclerosis"
                        ],

                        "version_history": [
                        {
                            "version": "1.0",
                            "change_type": "semantic",
                            "changes": "Initial creation",
                            "date": "2025-11-03T00:00:00Z"
                        },
                        {
                            "version": "1.1",
                            "change_type": "structural",
                            "changes": "Added prerequisites and mastery configuration",
                            "date": "2025-11-17T12:00:00Z"
                        }
                        ]
                    },

                    "editorial": {
                        "_comment": "Advisory metadata. May change without altering semantic meaning.",
                        "difficulty": "basic",
                        "high_yield_score": 9
                    },

                    "hierarchy": {
                        "_comment": "Fixed location in the library taxonomy.",
                        "library_id": "step1_usmle",
                        "domain": "Pathology",
                        "category": "Cardiovascular",
                        "subcategory": "Atherosclerosis",
                        "topic": "Pathogenesis",
                        "subtopic": "Early Lesions"
                    },

                    "content": {
                        "title": "Fatty streak formation",
                        "definition": "Earliest lesion of atherosclerosis formed by lipid-laden macrophages (foam cells) in the intima.",
                        "summary": "Fatty streaks are the initial, reversible lesions in atherosclerosis. They consist of intimal collections of foam cells and are not clinically significant on their own but are the direct precursors to more advanced fibrous plaques."
                    },

                    "dependency_graph": {
                        "_comment": "Defines learning order and structural relationships only.",
                        "prerequisites": [
                        "concept_0000_arterial_anatomy"
                        ],
                        "unlocks": [
                        "concept_0002_fibrous_plaque"
                        ],
                        "child_concepts": [],
                        "semantic_relations": [
                        "concept_0099_inflammation"
                        ]
                    },

                    "mastery_config": {
                        "This is normative. This is not user state. This is not performance data."
                        "_comment": "Normative defaults for mastery evaluation. User mastery state is stored elsewhere.",
                        "threshold": 0.8,
                        "decay_rate": "standard",
                        "min_questions_correct": 1
                    },

                    "media": [
                        {
                        "id": "media_uuid_003",
                        "type": "image",
                        "url": "gs://bucket/images/fatty_streak_histology.png",
                        "caption": "Histological slide showing foam cells (lipid-laden macrophages)."
                        }
                    ],

                    "references": [
                        {
                        "source": "Pathoma",
                        "chapter": "9",
                        "page": "25",
                        "description": "Atherosclerosis pathogenesis."
                        },
                        {
                        "source": "First Aid 2024",
                        "page": "301"
                        }
                    ],

                    "linked_content": {
                        "_comment": "Direct references to content that tests or reinforces this concept.",
                        "card_ids": [
                        "card_uuid_001_fatty_streak_def",
                        "card_uuid_002_fatty_streak_cloze"
                        ],
                        "question_ids": [
                        "q_uuid_001_fatty_streak_mcq"
                        ]
                    }
                    }
            ConceptGraphMetrics
                This contains information derived from the concept map, thus may change over time and is separate from the key information contained within the concept json
                JSON:
                {
                    "concept_id": "concept_0001",
                    "type": "concept_graph_metrics",
                    "_comment": "Derived, regenerable graph analytics for a concept. Not user-specific. Not a Golden Master.",

                    "graph_context": {
                        "library_id": "step1_usmle",
                        "graph_version": "2025-11-17",
                        "computed_at": "2025-11-18T02:45:00Z",
                        "_comment": "graph_version changes whenever the concept graph structure or embeddings are recomputed"
                    },

                    "semantic_embedding": [
                        0.021,
                        -0.113,
                        0.487,
                        0.092,
                        -0.334,
                        0.118
                    ],

                    "_comment_embedding": "High-dimensional vector truncated here for readability",

                    "degrees": {
                        "structural_degree": 3,
                        "_comment_structural": "Count of explicit prerequisite, unlock, or hierarchical edges",

                        "semantic_degree": 7,
                        "_comment_semantic": "Count of concepts with cosine similarity above threshold",

                        "combined_degree": 5.2,
                        "_comment_combined": "Weighted combination of structural and semantic degree"
                    },

                    "centrality": {
                        "betweenness": 0.031,
                        "pagerank": 0.0047,
                        "_comment": "Optional global graph centrality measures"
                    },

                    "similarity_config": {
                        "semantic_similarity_threshold": 0.75,
                        "alpha": 0.3,
                        "_comment": "alpha weights semantic vs structural degree in combined calculation"
                    },

                    "status": {
                        "valid": true,
                        "deprecated": false
                    }
                    }

    5.3 Cards
            Atomic learning units
            Contained within a concept
            Types
                Cloze
                Basic
                Image Occlusion
            Qualities
                FSRS fields
                    Stability
                    Difficulty
                    Retrievability
                Estimated time to completion
                    Calculated by AI
                    Updated by user performance
                Cognitive load
                    Inverse of estimated time to completion
                Card Weight (based on pedagogical role)
                    Recognition: W=1.0
                    Prompted Recall: W=1.5
                    Free Recall: W=1.8
                    Application/Analysis: W=2.2
                    Integration: W=2.5
                Semantic Vectorization
                    AI-generated embedding
                Semantic neighbors
                    All cards with cosine similarity of semantic vector > threshold
                Stages
                    Level
                        New
                        Learning 
                        Review
                        Mastered
                    Stage Progression
                        New --> Learning
                            Seen once
                        Learning --> Review
                            3 consecutive successful reviews (I think I know it, Definitely know it) AND next stability > 7 days
                        Review --> Mastered
                            2 consecutive successful reviews AND next stability > 90 days
                Yield
                    Ranking of how high yield data is
                    Only included if external user data available
                Associated Questions
                    Those with cosine similarity of semantic vector > threshold
            JSON (Master Template)
                {
                    "id": "card_0001",
                    "type": "card",
                    "_comment": "Static, read-only Golden Master card. Shared across all users.",

                    "relations": {
                        "_comment": "Defines semantic ownership and assessment linkage.",
                        "concept_id": "concept_0001",
                        "related_question_ids": [
                        "q_uuid_001_fatty_streak_mcq"
                        ]
                    },

                    "config": {
                        "card_type": "basic",
                        "_comment_card_type": "basic | cloze | image_occlusion",

                        "pedagogical_role": "recall",
                        "_comment_role": "recognition | recall | synthesis | application/analysis | integration . Used for weight of card contribution to mastery."
                    },

                    "content": {
                        "front": "What is the earliest lesion in the pathogenesis of atherosclerosis?",
                        "back": "Fatty streak formation caused by lipid-laden macrophages (foam cells).",

                        "cloze_data": {
                        "template_text": "The earliest lesion of atherosclerosis is the [[cloze_1]], which is formed by [[cloze_1b]].",
                        "cloze_fields": [
                            {
                            "field_id": "cloze_1",
                            "answer": "Fatty streak",
                            "hint": "Name of the lesion"
                            },
                            {
                            "field_id": "cloze_1b",
                            "link_to": "cloze_1"
                            }
                        ]
                        }
                    },

                    "media": [
                        {
                        "id": "media_uuid_004",
                        "type": "image",
                        "url": "gs://bucket/images/fatty_streak_gross.png",
                        "caption": "Gross image of fatty streaks in an aorta."
                        }
                    ],

                    "editorial": {
                        "_comment": "Advisory metadata only. Does not affect truth.",
                        "difficulty": "easy",
                        "tags": [
                        "pathology",
                        "high-yield"
                        ]
                    },

                    "metadata": {
                        "created_at": "2025-11-03T00:00:00Z",
                        "updated_at": "2025-11-03T00:00:00Z",
                        "created_by": "system_admin",
                        "status": "published",
                        "version": "1.0"
                    }
                    }
            CardGraphMetrics
                {
                    "card_id": "card_0001",
                    "type": "card_graph_metrics",
                    "_comment": "Derived, regenerable metrics computed from embeddings and graph context.",

                    "graph_context": {
                        "library_id": "step1_usmle",
                        "graph_version": "2025-11-18",
                        "computed_at": "2025-11-18T03:10:00Z"
                    },

                    "semantic_embedding": [
                        -0.012,
                        0.331,
                        -0.221,
                        0.045,
                        0.608,
                        -0.091
                    ],

                    "_comment_embedding": "Vector truncated for readability",

                    "semantic_neighbors": [
                        {
                        "card_id": "card_0002",
                        "similarity": 0.82
                        },
                        {
                        "card_id": "card_0047",
                        "similarity": 0.78
                        }
                    ],

                    "cognitive_load": {
                        "pedagogical_weight": 1.5,
                        "_comment_weight": "Derived from pedagogical_role",
                        "estimated_seconds": 12
                    },

                    "status": {
                        "valid": true,
                        "deprecated": false
                    }
                    }
            CardScheduleState
                {
                    "user_id": "user_123",
                    "card_id": "card_0001",

                    "state": 2,
                    "_comment_state": "0=New, 1=Learning, 2=Review, 3=Relearning",

                    "due": "2025-12-20T14:00:00Z",
                    "stability": 45.5,
                    "difficulty": 7.2,

                    "elapsed_days": 12,
                    "scheduled_days": 45,

                    "reps": 5,
                    "lapses": 0,

                    "last_review": "2025-11-08T09:00:00Z"
                    }
            CardPerformanceMetrics
                {
                    "user_id": "user_123",
                    "card_id": "card_0001",

                    "avg_seconds": 12.5,
                    "my_avg_seconds": 14.0,

                    "updated_at": "2025-11-08T09:00:00Z"
                    }

    5.4 Relationships
            Cross-concept, cross-sub-topic, cross-topic dependencies
            Represented via relationship cards, tracked separately
            One-hop propagation only
            AI-generated
            JSON (Master Template)
                {
                    "id": "rel_card_0001",
                    "type": "relationship_card",
                    "_comment": "A card that explicitly tests the relationship between two concepts. Not owned by either concept.",

                    "relations": {
                        "_comment": "Relationship cards always span two concepts.",
                        "concept_a_id": "concept_0001_fatty_streak",
                        "concept_b_id": "concept_0002_fibrous_plaque",

                        "relationship_type": "progression",
                        "_comment_relationship_type": "progression | contrast | cause_effect | prerequisite | mechanism",

                        "directionality": "A_to_B",
                        "_comment_directionality": "A_to_B | B_to_A | bidirectional"
                    },

                    "config": {
                        "_comment": "Scheduler-facing configuration.",
                        "card_type": "relationship",

                        "pedagogical_role": "synthesis",
                        "_comment_role": "recognition | recall | synthesis",

                        "activation_policy": {
                        "_comment": "Controls when this card becomes eligible.",
                        "requires_mastery_of": [
                            "concept_0001_fatty_streak",
                            "concept_0002_fibrous_plaque"
                        ],
                        "min_mastery_threshold": 0.8
                        }
                    },

                    "content": {
                        "front": "How does a fatty streak progress into a fibrous plaque?",
                        "back": "Fatty streaks progress to fibrous plaques through smooth muscle cell migration, extracellular matrix deposition, and formation of a fibrous cap over a lipid-rich core.",

                        "comparison_table": [
                        {
                            "feature": "Cell type",
                            "concept_a": "Foam cells (macrophages)",
                            "concept_b": "Smooth muscle cells + macrophages"
                        },
                        {
                            "feature": "Clinical significance",
                            "concept_a": "Asymptomatic",
                            "concept_b": "Can obstruct blood flow"
                        }
                        ]
                    },

                    "metadata": {
                        "created_at": "2025-11-17T00:00:00Z",
                        "updated_at": "2025-11-17T00:00:00Z",
                        "created_by": "system_admin",
                        "status": "published",
                        "tags": [
                        "atherosclerosis",
                        "progression",
                        "high-yield"
                        ]
                    }
                    }
            RelationshipGraphMetrics
                {
                    "relationship_card_id": "rel_card_0001",
                    "type": "relationship_card_graph_metrics",
                    "_comment": "Derived metrics for relationship density and activation safety.",

                    "semantic_embedding": [
                        0.134,
                        -0.288,
                        0.501,
                        0.092
                    ],

                    "relationship_strength": 0.86,

                    "activation_density": {
                        "concept_a_neighbors": 3,
                        "concept_b_neighbors": 5
                    },

                    "status": {
                        "valid": true,
                        "deprecated": false
                    }
                    }
            
    5.5 Questions
            Sources:
                Public
                Validated
                    Certain libraries will be validated by us (MCAT, DAT, Step 1, etc.)
                    Entities may create their own content that can be subscribed to for a fee
                AI-generated
            Types:
                Generic
                    Any questions designed for content library
                Diagnostic 
                    Subsets of questions can be labeled as diagnostic
                    Represent the smallest subset of low-complexity questions that cover all concepts within a library
                    Used to accelerate cards during learning
                Establishment Questions
                    Higher-complexity questions to use later on in concept mastery to solidify learning concepts
                Targeted Questions
                    AI-generated to strengthen weak concepts surrounded by strong neighbors, drawing connections to neighboring conceps
                Misconception-Directed
                    Specific misconceptions will prompt specific AI templates for questions i.e. directionality, scope, etc.
            Qualities:
                Semantic Vectorization
            JSON (Master Template)
                {
                    "id": "q_0001",
                    "type": "question",
                    "_comment": "Static, read-only Golden Master question used for application-level assessment.",

                    "relations": {
                        "_comment": "Conceptual and instructional linkage.",
                        "concept_ids": [
                        "concept_0001",
                        "concept_0099_pharmacology"
                        ],
                        "related_card_ids": [
                        "card_0001"
                        ]
                    },

                    "source": {
                        "_comment": "Provenance and trust classification.",
                        "origin": "validated",
                        "_comment_origin": "public | validated | ai_generated",

                        "provider": "Step1_Internal",
                        "subscription_required": false
                    },

                    "classification": {
                        "_comment": "Defines instructional role and lifecycle usage.",
                        "question_type": "mcq",
                        "_comment_question_type": "mcq | select_all | matching",

                        "usage_role": "generic",
                        "_comment_usage_role": "generic | diagnostic | establishment | targeted | misconception_directed",

                        "cognitive_level": "diagnosis",
                        "_comment_cognitive_level": "pathophysiology | diagnosis | management | mechanism"
                    },

                    "content": {
                        "stem": "A 15-year-old boy’s autopsy reveals lipid-laden macrophages in his aortic intima. Which of the following best describes this lesion?",
                        "options": [
                        { "id": "opt_A", "text": "Fibrous cap formation" },
                        { "id": "opt_B", "text": "Fatty streak" },
                        { "id": "opt_C", "text": "Thrombosed plaque" },
                        { "id": "opt_D", "text": "Necrotic core with calcification" }
                        ],
                        "correct_option_id": "opt_B"
                    },

                    "explanations": {
                        "general": "Fatty streaks are the earliest visible lesions in atherosclerosis and are composed of lipid-laden macrophages (foam cells).",
                        "distractors": {
                        "opt_A": "Fibrous caps appear later during plaque maturation.",
                        "opt_C": "Thrombosis occurs in complicated, advanced plaques.",
                        "opt_D": "Necrotic cores are features of advanced atheromas."
                        }
                    },

                    "editorial": {
                        "_comment": "Advisory metadata only.",
                        "difficulty": "easy",
                        "tags": [
                        "pathology",
                        "cardio",
                        "atherosclerosis",
                        "clinical-vignette"
                        ]
                    },

                    "media": [
                        {
                        "id": "media_uuid_003",
                        "type": "image",
                        "url": "gs://bucket/images/fatty_streak_histology.png",
                        "caption": "Histological slide showing foam cells."
                        }
                    ],

                    "references": [
                        {
                        "source": "UWorld",
                        "question_id": "UW12345"
                        },
                        {
                        "source": "Pathoma",
                        "page": "25"
                        }
                    ],

                    "metadata": {
                        "created_at": "2025-11-03T00:00:00Z",
                        "updated_at": "2025-11-03T00:00:00Z",
                        "created_by": "system_admin",
                        "last_updated_by": "system_admin",
                        "version": "1.0",
                        "status": "published"
                    }
                    }
            QuestionGraphMetrics
                {
                    "question_id": "q_0001",
                    "type": "question_graph_metrics",
                    "_comment": "Derived, regenerable semantic and structural analytics.",

                    "graph_context": {
                        "library_id": "step1_usmle",
                        "graph_version": "2025-11-18",
                        "computed_at": "2025-11-18T03:30:00Z"
                    },

                    "semantic_embedding": [
                        0.091,
                        -0.204,
                        0.412,
                        0.038,
                        -0.115,
                        0.622
                    ],

                    "_comment_embedding": "Vector truncated for readability",

                    "concept_alignment": [
                        {
                        "concept_id": "concept_0001",
                        "weight": 0.78
                        },
                        {
                        "concept_id": "concept_0099_pharmacology",
                        "weight": 0.42
                        }
                    ],

                    "complexity": {
                        "estimated_seconds": 35,
                        "cognitive_load_score": 2.1
                    },

                    "status": {
                        "valid": true,
                        "deprecated": false
                    }
                    }
            QuestionAttempt
                {
                    "user_id": "user_123",
                    "question_id": "q_0001",
                    "attempt_id": "attempt_2025_11_08_001",

                    "result": {
                        "selected_option_id": "opt_A",
                        "correct": false
                    },

                    "error_analysis": {
                        "error_type": "misconception",
                        "_comment_error_type": "misconception | retrieval_failure | misreading | strategy_error | time_pressure",
                        "confidence_mismatch": true,
                        "derived_from": "question"
                    },

                    "timing": {
                        "time_taken_seconds": 42
                    },

                    "timestamp": "2025-11-08T09:14:00Z"
                    }

    5.6 Feedback & Moderation Signals
            Flagging
                Users can flag cards in public decks for administrator review if cards are poor quality 
                JSON
                    ContentFlag {
                    flagId: string,
                    cardId: string,
                    userId: string,
                    reason: "incorrect" | "confusing" | "outdated" | "poorly_worded",
                    timestamp: ISODateString
                    }

6. Scheduler
    6.1 Core Algorithm
            FSRS v5
                Stability
                Retrievability
                Due date calculation
            Card-only scheduling
                Model
                    1. FSRS (pure, atomic, per-card)
                    → produces ScheduleState deltas

                    2. Schedule Normalization Layer (Adjuster)
                    → applies caps, guards, and global constraints
                    → decides what is *allowed to be persisted*

                    3. Session Queue Shaping (ephemeral)
                    → buries, reorders, suppresses
                    → does NOT change due dates
                On Review
                    FSRS (6)
                    → Schedule Normalization (7)
                    → Persist ScheduleState
                On Session-Start
                    Load due cards
                    → Session Queue Shaping (8)
                    → Study queue

    6.2 Knowledge vs Schedule Separation
            Knowledge estimates (confidence, misconception risk)
                KnowledgeEstimate {
                confidence: number;      // inferred mastery (0–1)
                misconceptionRisk: number;
                evidenceCount: number;
                }
            Schedule state (stability, retrievability, due)
                ScheduleState {
                stability: number;
                retrievability: number;
                due: Date;
                }
            Rules
                FSRS only updates ScheduleState
                AI probing modifies KnowledgeEstimate
                A reconciliation step maps Knowledge → Schedule (with clamps)
    6.3 Learning Order
            Incomplete learning cards
            Learning cards
            Review cards
            Mastered cards

7. Schedule Normalization
    Purpose
        Reconcile FSRS output with system constraints before persistence.
    Rule
        Schedule Normalization may modify ScheduleState but must not inspect AFI or session context.
        Do nothing outcome
            Intervention Decision Tree
                For all interventions (probing, relationship card injections, accelerate, lapses) there must be a "do nothing" outcome
                Outcome: NO_ACTION
                    Reason:
                    - Insufficient evidence
                    - High AFI
                    - Single noisy failure
                    - Low expected yield
                Log outcome of every intervention
    Components
        Post-review normalization
        Stability clamps
        Daily caps
        Propagation penalties/boosts
            Penalties
                Neighbor stability penalty
                    for neighbor in neighbors(card): stability(neighbor) -= 0.10 × edge_weight(card → neighbor)
                Drift
                    if avg_stability(neighboring_cards) < low_threshold: reduce stability(card) by small factor
                    when neighbors are forgotten, stability suffers
                Knowledge erosion
                    forgetting core concepts weakens dependent concepts (all cards within the concept)
                If knowledge erosion penalty applied, no additional penalties applied unless they are greater for a single card
            Boosts
                Successful review of a card applies a slight boost to stability of all of its semantic neighbors proportional to the similarity score 
                    Cap the boost: 5-10%
            Rules
                One-hop only
                One-way boost 
                    only cards not yet due, not those that are already due
                Inverse penalty
                    If a card is lapsed or failed, the same proportional mechanism is applied to penalize the neighbors
        
        Misconception modifiers
        Fuzz application
            Prevents related cards reviewed back to back; whenever a new due date is assigned to a card the fuzz factor is applied so not all cards reviewed at a time are reviewed again at same time
        Mastery suppression
        Regression dampening
            decay_rate(concept) = base_rate × (1 / (1 + num_reinforcing_edges))
            many reinforcing links results in a concept decaying at slower rate
    Clamps
        General Pattern
            1. Accumulate effects during a session/day
            2. Apply deltas through a capped accumulator
            3. Clamp before writing back to state
                Cards with greatest delta receive changes if caps are reached
            4. Reset accumulators at defined boundaries
        Maximum Daily Stability Penalty 
            Implementation
                Accumulator
                    cardPropagationPenaltyAccumulator[cardId] += proposedPenalty;
                Cap Application
                    const MAX_DAILY_PROPAGATION_PENALTY = 0.15;
                    appliedPenalty = Math.min(
                    cardPropagationPenaltyAccumulator[cardId],
                    MAX_DAILY_PROPAGATION_PENALTY
                    );
                    card.stability *= (1 - appliedPenalty);
                Reset 
                    cardPropagationPenaltyAccumulator[cardId] = {};
        Maximum Neighbor Boost
            Implementation
                Accumulator
                    cardBoostAccumulator[cardId] += proposedBoost;
                Cap Application
                    const MAX_DAILY_NEIGHBOR_BOOST = 0.10;
                    appliedBoost = Math.min(
                    cardBoostAccumulator[cardId], 
                    MAX_DAILY_NEIGHBOR_BOOST
                    );
                    card.stability *= (1 + appliedBoost);
        Per-Concept Card Penalty Density Cap
            MAX_PENALIZED_CARDS_PER_CONCEPT_PER_DAY = 5;
            if (penalizedCardsInConceptToday >= MAX) {
            skipPropagationForRemainingCards();
            }
            Unless a concept wide penalty from knowledge erosion
        Per-Concept Card Boost Density Cap
            MAX_BOOSTED_CARDS_PER_CONCEPT_PER_DAY = 5;
        Maximum Cross-Concept Propagation Depth
            MAX_PROPAGATION_HOPS = 1;
            No propagation to neighbors-of-neighbors
        Maximum Stability Delta Per Review
            MAX_STABILITY_DELTA_PER_REVIEW = ±25%
            Implementation
                oldStability = card.stability;
                // 1. FSRS update
                fsrsStability = computeFSRSUpdate(card, response);

                // 2. Apply modifiers
                modifiedStability =
                fsrsStability
                * (1 + neighborBoost)
                * (1 - propagationPenalty)
                * misconceptionModifier
                * afiModifier;

                // 3. Apply hard clamp
                const lowerBound = oldStability * 0.75;
                const upperBound = oldStability * 1.25;

                finalStability = clamp(modifiedStability, lowerBound, upperBound);

                // 4. Persist
                card.stability = finalStability;

                if (oldStability < 2) {
                lowerBound = max(0.5, oldStability * 0.5);
                upperBound = oldStability * 1.5;
                }
        Maximum Relationship Cards Injected per Session
            const MAX_RELATIONSHIP_CARDS_PER_SESSION = 3;
            if (relationshipCardsInjected >= MAX_RELATIONSHIP_CARDS_PER_SESSION) {
            suppressFurtherRelationshipInjection();
            }
            Additional Rules
                Spaced at least N cards apart (e.g., every 8–12 cards)
                Suppressed entirely if AFI > 0.5
        AFI Penalty Suppression Cap
            effectivePenalty *= (1 - AFI);
            effectivePenalty >= MIN_PENALTY_FLOOR;
        Do Not Apply Boosts:
            Cards already due
            Cards in lapse/relearning
            Cards with active misconception edges
        Centralized Cap Configuration
            Summarized Cap List
                Max stability delta per review (±25%)
                Max propagation penalty per card per day (10–15%)
                Max neighbor boost per card per day (10%)
                Max relationship cards per session (2–3)
                Max penalized cards per concept per day
                Max boosted cards per concept per day
                Max misconception strength increase per day
                AFI-based penalty suppression
            Create one config file with all caps:
                export const SAFETY_LIMITS = {
                MAX_DAILY_PROPAGATION_PENALTY: 0.10,
                MAX_DAILY_NEIGHBOR_BOOST: 0.10,
                MAX_RELATIONSHIP_CARDS_PER_SESSION: 3,
                MAX_STABILITY_DELTA_PER_REVIEW: 0.25,
                MAX_AI_PROBES_PER_SESSION: 2 //deep probes
                };
        
        Cap Logs
            Create a log to track how often caps are hit

8. Session Queue Shaping 
    Purpose
        Construct the actual study queue for a session without mutating schedule state.
    Rule
        Session Queue Shaping must never write ScheduleState.
    Components
        Bury logic
        Unlocking
            Children Concepts
                If parent concepts enter stability > 0.6, introduced into learning queue
            Relationship Cards
                If relationship concepts reach threshold, small batches of relationship cards inserted into learning queue
        Similarity spacing
            If cards have a neighbor within specified distance in review queue, they are separated (keeping same prior average review date)
        Relationship card injection
            Trigger
                Associated concept mastery > threshold
        Micro-batching
        Cognitive load throttling
            maxAllowedLoad = baseLoad * (1 - AFI)
                        High-load cards get buried automatically.
                    if (AFI > 0.5) suppressRelationshipCards()
                        Relationship cards are expensive
        AFI-based suppression
            Trigger
                AFI > 0.5
            Outcome
                Decrease maxLoadBudget for day
                Decrease session time
                Decrease low cognitive load of remaining session 
            Prompt
                "Switch to easier cards?"
                "End session early?"
                "Focus on review only?"
        Time-budget enforcement
        Cram Recalculator
            Pull cards earlier into the session queue
            Ignore due dates for inclusion only
            Re-rank by
                Exam relevance
                Concept yield
                Predicted retrievability at exam date
            Prefer
                Fragile-but-relevant cards
                Relationship cards tied to exam concepts
                Enforce time budget strictly
            Inclusion rule
                if predicted_retrievability(card, exam_date) < threshold:
                 include_in_queue(card)
            Forbidden (Persistent)
                Changing due
                Changing stability
                Marking cards as reviewed
                Boosting mastery
                Triggering propagation
                Affecting misconception strength
        Learning Prioritization
            The Master Sort: Sorting Score
                1. Filter parents_learned = true //i.e. in review stage (the entire order of learning cards should be determined in one go. There should be an estimate of when cards learned will enter the review stage and their children cards can then be learned - the Adjuster should check for this each day and can slot in the cards associated with children concepts)
                2. Sort by (Yield * 0.7) + (Connectivity * 0.3) // this prioritizes high yield content over connectivity
                3. Divide by time cost
            The Strategy
                General
                    1. High Yield + Low Time: "Quick Wins" (Do these first).
                    2. High Connectivity + High Yield: "Core Pillars" (Do these next; they unlock the graph).
                    3. High Connectivity + Low Yield: "Necessary Evils" (Prerequisites needed to understand the high-yield stuff).
                    4. Low Connectivity + Low Yield: "Trivia" (Push to the very end).
                    By concept chunk, then within concepts
            Determining High Yield
                1. External validation
                    External Questions
                        Concepts that are tested most frequently are labeled high yield
                    External Cards
                        Cards that are tagged as high yield are labeled high yield
                2. Internal Validation (I don't want to use this, I'd rather it just be random)
                    PageRank to count and weight semantically similar concepts. Central concepts are higher yield because of their relation to other concepts
        Review Prioritization
            Order for cards all due on same day:
                1. Incompletely learned cards
                2. Learning cards
                    Most overdue first
                3. Review cards
                4. Mastered cards
        Primary Reason
            PrimaryReason may only be assigned by the Session Queue Builder
            Queue Item Schema
                export interface SessionQueueItem {
                item_id: string;
                item_type: "card" | "relationship_card" | "question";

                primary_reason: PrimaryReason;

                supporting_context?: {
                    source_id?: string;
                    trigger_id?: string;
                };
                }

9. Goals & Planning
    7.1 Goals & Sub-goals
            Target content
            Target date
            Target retention
    7.2 Planning Logic
            Schedule generated at goal creation
            Priorities determined in goal setting
            Divided into daily chunks
            Adjusted by availability and fatigue
    7.3 Learning Aggression
            Scalar ∈ [0,1]
            Scales:
                Certification strictness
                Acceleration
                Suppression willingness

10. Fatigue, Load & Capacity
    8.1 Attention Fatigue Index (AFI)
            Session-scoped --> feeds Session Queue Shaping
            Inputs
                Response time drift
                    Δt = (actual_time - expected_time) / expected_time
                            Consistent positive deviation = attention slipping
                Error drift
                    error_drift = recent_error_rate - baseline_error_rate
                Confidence mismatch (questions only)
                    confidence_error = high_confidence_wrong OR low_confidence_right spike
                Controls in-session throttling
            Calculation
                time_score_i = clamp(Δt_i / timeTolerance, 0, 1)
                                timeTolerance ≈ 0.3
                            error_score_i = clamp(error_drift_i / errorTolerance, 0, 1)
                                errorTolerance ≈ 0.2
                            confidence_score_i = confidenceMismatch ? 1 : 0
                            rawAFI_i =
                                0.5 * time_score_i +
                                0.3 * error_score_i +
                                0.2 * confidence_score_i
                            AFI_t = 0.8 * AFI_{t-1} + 0.2 * rawAFI_i
            Thresholds
                | AFI Range | Meaning          | System Behavior                 |
                | --------- | ---------------- | ------------------------------- |
                | 0.00–0.30 | Attentive        | Normal scheduling               |
                | 0.30–0.50 | Mild fatigue     | Prefer lower-load cards         |
                | 0.50–0.70 | Moderate fatigue | Offer intervention              |
                | 0.70–1.00 | High fatigue     | Recommend stopping or switching |
            Storage
                Only session summaries are stored
                            {
                            "sessionId": "sess_101",
                            "afiTimeline": [
                                { "t": 0, "afi": 0.12 },
                                { "t": 8, "afi": 0.38 },
                                { "t": 15, "afi": 0.61 }
                            ],
                            "interventionTriggered": true
                            }
    8.2 Sustained Load Index (SLI)
            Weekly aggregation
            Detects chronic overload
            Feeds Planning only
            Inputs
                load_gap = planned_load - completed_load
                Retention delta after rest
                Session abort frequency
                Capacity Index trend
            Calculation
                rawSLI =
                0.4 * avgLoadGap +
                0.3 * sessionAbortRate +
                0.2 * retentionAfterRestDrop +
                0.1 * capacityDecline
                SLI = 0.9 * SLI_prev + 0.1 * rawSLI
                Bounded to [0,1]
            Implementation
                Suggest planning adjustments
                    Reduce future daily load targets
                    Extend goal timelines
                    Increase review-only days
                    Suggest lighter weeks
                Goal Negotiation
                    If user sets aggressive goals while SLI is high:
                        “Based on recent weeks, this plan may be difficult to sustain. Would you like a more conservative option?”
                Analytics & Insight
                    "Study intensity has been high for several weeks."
                    "Recovery days are helping/not helping"
            Storage
                {
                "weekOf": "2025-01-13",
                "SLI": 0.62,
                "contributors": {
                    "loadGap": 0.7,
                    "sessionAborts": 0.5,
                    "retentionDrop": 0.4
                }
                }

    8.3 Capacity Index
            Measures tolerance for high cognitive load

11. Misconceptions
    Definition
        User-specific
        Directional
        Concept–concept edges
        Time-varying strength
        JSON
            {
                            "misconceptionId": "mis_edge_001",

                            "userId": "user_123",

                            "conceptA": "concept_working_memory",
                            "conceptB": "concept_attention",

                            "direction": {
                            "from": "concept_attention",
                            "to": "concept_working_memory",
                            "errorType": "reversal"
                            }

                            "misconceptionType": "directionality",
                            "_comment_type": "directionality | scope | causality | category | mechanism",

                            "strength": 0.63,
                            "_comment_strength": "0–1, persistence and confidence of misconception",

                            "evidence": {
                                "questionFailures": 4,
                                "relationshipCardFailures": 2,
                                "highConfidenceErrors": 3,
                                "aiProbeConfirmations": 1
                            },

                            "evidenceRefs": {
                            "questionAttempts": ["qa_991", "qa_882"],
                            "cardIds": ["card_441", "card_782"],
                            "aiProbes": ["probe_102"]
                            },

                            "lastObserved": "2025-01-14T18:22:00Z",
                            "firstObserved": "2024-12-02T10:04:00Z",

                            "status": "active",
                            "_comment_status": "active | weakening | resolved"
                            }
        Cap
            MAX_MISCONCEPTION_STRENGTH_INCREASE_PER_DAY = 0.2;
        Resolution Conditions
            A misconception edge transitions to resolved when:
                3 consecutive correct relationship answers
                At least one correct explanation in AI probe
                No high-confidence errors for X days
            Decay Rule
                strength *= 0.85 per week without evidence
            Monotonic Constraints
                Strength cannot increase and decrease in the same session
                Resolution requires positive evidence, not just absence of negative
        Conflict Resolution
            For when signals disagree
            Priority Order of Evidence
                1. High-confidence incorrect
                2. Repeated relationship failure
                3. AI probe explanation quality
                4. Timed correct answers
                5. Raw correctness
    Evidence Sources
        Question failures
        Relationship card failures
        High-confidence errors
        AI probe confirmations
    Rules
        Daily strength increase cap
        Weekly decay
        Monotonic per-session updates
        No direct card-state mutation
    JSON (Master Template)
        {
            "misconception_id": "misconception_fatty_streak_timing",
            "type": "misconception_template",

            "trigger_conditions": {
                "concept_id": "concept_0001",
                "common_wrong_choice": "opt_A"
            },

            "question_generation_guidelines": {
                "focus": "temporal progression of atherosclerosis",
                "contrast_with": [
                "fibrous plaque",
                "complicated lesion"
                ]
            }
            }


12. AI Probing System (Remediation)
    10.1 Scope
            Relationship cards
            Multi-concept questions
    10.2 Probing State Machine
            Idle
            Diagnostic
            Remedial (optional)
            Resolution
    10.3 Triggers
            Questions
                Trigger when all are true:
                    Question incorrect
                    Question tests ≥2 concepts OR explicit relationship
                    AFI < 0.7
                    Probe budget available
                Optional strengthening triggers:
                    High confidence incorrect
                    Repeated failure pattern
                    Existing weak misconception edge
            Relationship cards 
                Trigger when any are true:
                    Relationship card failed
                    Relationship card passed but response time > threshold
                    Relationship card passed with low confidence
                    Related misconception exists
            Localized concept failure clusters
                if (
                failedCardsInConcept >= 2 &&
                failuresAreSemanticallyRelated &&
                AFI < 0.6
                )
            Remedial Probing
                Only triggered if:
                    Diagnostic probing confirms misconception
                    AFI is low–medium
                    User does not choose “move on”
    10.4 Flow of Probing
            Diagnostic
                Identify why the failure occurred
                Examples:
                    Direction confusion
                    Scope overextension
                    Mechanism misunderstanding
                    Test-taking error
                Characteristics
                    Short
                    Binary or forced-choice
                    No teaching yet
                Outcome
                    Updates misconception strength
                    Explains nothing unless needed
            Remedial
                Purpose: Repair the relationship explicitly
                Examples
                    Mini-bridging questions
                    Contrastive explanation
                    Counterexample prompts
                Depth
                    Full socratic: low AFI
                    Short, clarifying prompts: medium AFI
                    Minimal feedback, defer probing: high AFI
                Outcome
                    Does not further adjust stability
                    Exists to prepare future reviews (though this is not measured)
    10.5 Outcomes
            Move on
                Ends probing
                Records evidence
                No penalties
                No boosts
            Evidence updates
            Misconception updates
            Accept remedial probing
            Optional scheduler suggestions (user-approved)
                Accelerate
                    Increases stability of card and sets next due date randomly between 1 and 8
                    Apply only when:
                        Correct reasoning in probing
                        Multiple related cards already stable
                        No active misconception
                        User explicitly accepts
                    newStability = min(fsrsProjectedStability,oldStability * 1.25);
                Lapse
                    Forces cards into review queue immediately and decreases stability
                        Prevent false lapses
                        effectivePenalty = basePenalty * (1 - AFI)
                        Apply only when:
                            Diagnostic probing confirms knowledge or relationship gap
                            Not test-taking error
                            AFI-adjusted penalty > 0.6
                            User explicitly accepts
            Explicit “no action” path
                No evidence or explanation if not needed
    10.6 Caps
            Per day
                1 probe per 20% of daily card burden
                5 probes per day
            Per session
                2 deep probes (relationship)
            Per concept
                Max 1 probe session per concept per day
    
    10.7 Test-Taking Strategy Drills
        Characteristics
            Not content-graph cards
            Not FSRS scheduled
            Short, focused, opt-in
            Zero propagation or penalties
        Examples
            “Slow-read under time” drills
            “Elimination practice” with distractor explanation
            “Pacing checkpoints” (answer by step X)
            “Confidence calibration” exercises
        Outcomes
            Skill scores
            Confidence calibration metrics

13. Mastery Certification
    11.1 Purpose
            Detect pre-existing mastery
            Prevent redundant learning
    11.2 Trigger
            Before unlocking a new concept chunk
    11.3 Flow
            Short diagnostic probe (2–4 items)
                Types:
                    Application in novel context
                    Contrast with sibling concept
                    Directionality / dependency check
                    One transfer question
                These can be:
                    AI-generated
                    Pre-authored certification questions
            Evaluate correctness, reasoning, confidence
            Outcome:
                Full certification
                Partial certification
                No certification
    11.4 Effects
            Suppress redundant cards
            Accelerate initial scheduling
            Faster decay
            Immediate revocation on error
    11.5 Certification Criteria
            Certification passes if all are true:
                ≥80% correct
                Correct reasoning, not lucky guessing
                No confidence mismatch
                No misconception pattern detected
                Response times reasonable
            A. Full Certification
                Concept marked as pre-mastered
                Most core cards suppressed
                Only minimal review cards scheduled
            B. Partial Certification (Most Common)
                Skip introductory cards
                Learn relationship / nuance cards only
                Concept learning chunk reduced
            C. No Certification
                Learn concept normally
    11.6 Other 
        Caps
            Max 1 certification gate per concept
        Safety
            Suspended cards resurface if errors occur
        User Prompt
            "Let's check what you already know (2-3 minutes) to skip cards you don't need"
            Opt-out option

14. Propagation, Modifiers & Caps
    12.1 Propagation
            Neighbor boosts and penalties
    12.2 Stability Guards
            ±25% per review
            Daily per-card caps
    12.3 Density Caps
            Max penalized cards per concept/day
            Max boosted cards per concept/day
    12.4 Central Safety Configuration
            Single config for all limits

15. Explainability & Trust
    13.1 Primary Reason Contract
            Each scheduled card has exactly one dominant reason
                Data Model
                    export enum PrimaryReason {
                    DUE = "due",
                    NEW_CARD = "new_card",
                    CRAM_MODE = "cram_mode",
                    MISCONCEPTION_REMEDIATION = "misconception_remediation",
                    PREREQUISITE_UNLOCK = "prerequisite_unlock",
                    RELATIONSHIP_SYNTHESIS = "relationship_synthesis",
                    DIAGNOSTIC_PROBE = "diagnostic_probe",
                    TARGETED_REINFORCEMENT = "targeted_reinforcement"
                    }
                ExplainabilityPayload
                    Exactly one reason for each card
                    {
                    "primary_reason": "due",
                    "_comment_primary_reason": "Exactly one enum value. Required.",

                    "supporting_context": {
                        "_comment": "Optional, read-only metadata for UI display. Never used for logic.",
                        "source_id": "card_0001",
                        "trigger_id": "misconception_fatty_streak_timing",
                        "notes": "Surface-level explanation only"
                    }
                    }

    13.2 User Control
            Opt-in probing
            Accept / reject interventions
            “Move on” always available

16. Analytics & Health Metrics
        Content Metrics
            Adaptive Restructuring
                Track semantic degree over time to detect drift of content libraries
                System can react to:
                    - suggest new relationship edges
                    - increase scheduling priority
                    - update cluster membership
                    - generate new integrative questions            
            Concept health metrics
                Track:
                    Avg misconception density
                    Avg regression rate
                    Variance of card stability within concept
                If thresholds exceeded:
                    Suppress certification
                    Reduce relationship card injection
                    Prefer question-based learning
            Misconception density
            Regression signals
                The user once understood, but their model has degraded or simplified.
                Implementation:
                    RegressionSignal {
                    cardId | conceptId,
                    severity: 0–1,
                    lastObserved
                    }
                Triggers:
                    Previously stable card fails on a question with low confidence
                    Multiple partial explanations
                    Slow response on formerly fast items
                Effect:
                    Prefer review (not remediation)
                    No misconception strengthening
                    No propagation penalty
        Session Metrics
            Impact Metric
                How much will today's study boost your predicted retention for your goal content? 
                Forecast: Impact metric of upcoming study days
        User Metrics
            Exam readiness
            If you take the test today, your expected score is: ___
        
            
        Skill Models
            Raw evidence
                From question attempts
                    errorType = misreading | strategy_error | time_pressure
                    response time vs expected
                    confidence mismatch patterns
                    repeated wrong answer choices
                    question format (passage, multi-step, graph, etc.)
            User skill model
                Properties
                    Bounded [0,1]
                    Smoothed (EMA)
                    Updated daily or per session
                    No per-question data stored here
                JSON
                    TestTakingSkillProfile {
                    userId: string,

                    skills: {
                        readingAccuracy: number,        // misreading frequency
                        pacingControl: number,          // time pressure errors
                        eliminationStrategy: number,    // near-miss patterns
                        multiStepPlanning: number,      // late-stage errors
                        confidenceCalibration: number   // over/under confidence
                    },

                    weakPatterns: {
                        misreadsUnderTime: boolean,
                        overconfidentWrong: boolean,
                        slowCorrectFastWrong: boolean
                    },

                    lastUpdated: ISODateString
                    }
            Strategy Insights & Drills
                Generated as needed
                Trigger
                    User opts in
                Alert
                    Skill score < threshold
                    Pattern persists across sessions
                Insight Examples
                    “You miss 28% more questions when response time < 60% of expected.”
                    “High confidence incorrect answers cluster in multi-step questions.”
                    “You often change from correct to incorrect answers.”
        Outcomes
            Session-level
                {
                        "sessionId": "...",
                        "plannedLoad": 42,
                        "actualLoad": 39,
                        "retentionDelta": +0.08,
                        "fatigueHit": true,
                        "userAcceptedIntervention": false
                        }
            Goal-level
                Track across large time periods based on goal allocation

17. Offline Support
        Learning & Review Queue
        Pre-bundled diagnostic questions
        Certification cards
        Probing templates

18. System Infrastructure (Internal Only)
        Observability & Internal Diagnostics (Internal Only)
            Scheduler Telemetry
                - FSRS input/output snapshots
                - Stability delta distributions
            Normalization & Clamp Monitoring
                - Clamp hit frequency
                - Accumulator saturation
                - Monotonicity violations (guarded)
            Queue Shaping Diagnostics
                - Bury rates
                - AFI suppression events
                - Cram inclusion counts
            Probe & Intervention Auditing
                - Trigger vs NO_ACTION ratios
                - User accept/reject rates
            Safety & Regression Detection
                - Schedule drift detection
                - Unexpected stability inflation

19. Future Work (Explicitly Deferred)
        AI-assisted library creation
        External deck imports
        Auto-refactoring of concept graphs
                  
20. Files
       /Users/colbynielsen/Documents/StudyBuddy
        - TypeScriptDefinitions
            - Contains the definitions to allow cross-talk between firebase and my frontend

21. Tests
        Invariants
            Primary Reason
                Test 1: Exactly one reason
                    it("rejects queue items with multiple reasons", () => {
                    const item: any = {
                        item_id: "card_0001",
                        item_type: "card",
                        primary_reason: ["due", "cram_mode"] // illegal
                    };

                    expect(() => validateQueueItem(item)).toThrow(
                        "primary_reason must be a single enum value"
                    );
                    });
                Test 2: Missing reason is illegal
                    it("rejects queue items without a primary reason", () => {
                    const item: any = {
                        item_id: "card_0001",
                        item_type: "card"
                    };

                    expect(() => validateQueueItem(item)).toThrow(
                        "primary_reason is required"
                    );
                    });
                Test 3: Downstream mutation is forbidden
                    it("prevents primary_reason mutation after queue creation", () => {
                    const queueItem = buildQueueItem({
                        item_id: "card_0001",
                        reason: PrimaryReason.DUE
                    });

                    expect(() => {
                        queueItem.primary_reason = PrimaryReason.CRAM_MODE;
                    }).toThrow();
                    });
                Test 4: One reason per item per session
                    it("ensures an item appears only once per session with one reason", () => {
                    const queue = buildSessionQueue(mockState);

                    const reasons = queue
                        .filter(i => i.item_id === "card_0001")
                        .map(i => i.primary_reason);

                    expect(reasons.length).toBeLessThanOrEqual(1);
                    });

22. Development Checklist
        Layers
            1. Domain Models (schemas, types)
            2. Core Engines (scheduler, queue builder)
            3. Policy Layers (adjusters, AFI, cramming)
            4. Application Logic (sessions, flows)
            5. UI / Presentation
        Files
            If something has a different owner, lifecycle, or invariants, it gets its own file (or folder).


