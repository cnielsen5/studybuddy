Socrates Structure and Organizer


My Vision:
    - Study app using smart and AI-guided spaced repetition to learn concept maps which contain cards. Learning and review is informed by user performance on questions 

    - Local user application that allows downloads of content libraries that include concepts, cards, questions, and relations to the user’s local application. The local application has offline capacity to learn new cards, to review cards and to answer questions as well as all AI and adjustment functions. Performance while offline is recorded and at the next sync, is sent back to the server in order to store and update the user’s personal performance profile and progress on the content library. Local performance while able to access the internet also allows for AI probing and efficient learning with diagnostic questions to intelligently determine mastery of cards. Syncing allows communication between the server and the local client, primarily to update content libraries on the local client and to store user progress that is then stored in the cloud. 


Local client
    - UI
        - stored: 
        - Tanstack Start (frontend), Tanstack query (data management) for reference data (static, library data)
        - localForage to store user progress data (persistence)
    - Adjuster can make adjustments to learning and review timeline based on changes to user time allowance, fatigue and high load sessions on a daily basis and within study sessions
    - Tracks User Progress (fatigue, performance, capacity)
        - Uses card pedagogical role to determine mastery of concepts in concept map
        - Impact Metric: how much today’s study will boost your predicted retention for your goal content
    - Holds local version of content libraries
    - Allows for CRUD of content libraries 
    - Validated libraries can be flagged for improvement
    - Syncs to server to store a server version of user progress on the content library and performance metrics and to download updates to content libraries 
        - CRDT (Conflict-free Replicated Data Types): Use a last-write-wins strategy when merging review logs
    - AI feature available on every screen to ask questions, clarify and to suggest specific learning material 
    - AI probing to follow up questions to see why you got question wrong, keep track of user’s test taking skills and suggest strategies, to accelerate and lapse cards related to content
        - Questions are explicitly linked to Concepts. A failed Question triggers a 'Lapse' or 'Stability penalty' on all associated Cards for that Concept, forcing them back into the Review Queue immediately.
        - Confidence calibration: questions include confidence rating, over and under confidence are tracked and AI can develop specific drills for overconfident misconceptions and “false fluency” patterns
        - AI probing for relationship cards to identify proper context, generate mini-bridging questions and solidify relationship 
            - “Move on” feature 
    - Questions
        - AI-generated
            - Diagnostic to gauge current understand and accelerate cards
            - Establishment questions to solidify learned concepts
            - Targeted questions to strengthen weak concepts surrounded by strong neighbors, drawing connections to those other concepts
    - Adaptive Restructuring
        - Track semantic degree over time to detect drift of content libraries
        - System can react to:
            - suggest new relationship edges
            - increase scheduling priority
            - update cluster membership
            - generate new integrative questions
- Scheduler:
    - index.ts file that connects to the Google Firebase and acts as the online server
        - full code found in: 
            - /Users/colbynielsen/Documents/StudyBuddy/Scheduler/functions/src
            // TODO: the scheduler will need to be revamped with all the included features
    - an open-source spaced repetition model (same as anki) 
    - Schedule creation
        - Determined on goal creation
        - Based on expected time to accomplish goal divided by available time to do so (how much time per day can the user expend?) 
        - Divided into discrete chunks (days)
        - Balance cognitive load among days
    - similarity interleaving
        - concepts are learned by hierarchical node, with automatic boosts to mastery of similar concepts
    - priority score based on stability, centrality, high-yield, dependencyweight
    - When learning cards, learn high-yield first, then low-yield
    - Concept map
        - Dependency prioritization
            - if B depends on A, and stability of A is < threshold, the scheduling weight of A should be boosted and B should be reduced 
                - this could be incorporated at time 0 when a learner decides all the content to be learned during a “chapter(?)” or each time they change what content to be learned in what time frame
            - Cluster-level interleaving
                - If a concept has many neighbors (high centrality), your system should interleave reviews from that cluster to reinforce networked knowledge
                - concept_priority = degree(concept) × (1 - stability(concept))
                - thus, High-degree nodes (critical concepts) appear earlier/more often
            - Concept drift handling
                - if avg_stability(neighboring_concepts) < low_threshold: reduce stability(concept) by small factor
                - when a concepts neighbors are forgotten, a concepts stability suffers (due to being at risk)
        - Structured unlocking:
            - Unlocking: 
                - if stability(root_concept) ≥ 0.7: unlock children_concepts
                - Relationship cards unlocked based on associated concepts meeting mastery threshold
        - Mastery Decay
            - Propagation of forgetting
                - for neighbor in neighbors(concept): stability(neighbor) -= 0.10 × edge_weight(concept → neighbor)
                - “knowledge erosion”: forgetting core concepts weakens dependent concepts
            - Dampened decay for networked concepts
                - decay_rate(concept) = base_rate × (1 / (1 + num_reinforcing_edges))
                - many reinforcing links results in a concept decaying at slower rate
        - Structural Degrees
            - # of concepts structurally connected to a concept
            - Contrasted to semantic degree: how many concepts are semantically close to a concept
                - semantic_degree(concept_i) =
                -     |{ concept_j : cosine_similarity(vec_i, vec_j) > threshold }|
                - Set threshold to 0.7-0.85 depending on domain density
    - Combined Degrees
        - Combine structural and semantic degrees of concepts to generate priorities for learning
            - combined_degree(A) = α * structural_degree(A)
            -                      + (1 - α) * semantic_degree(A)
            - This identifies “hidden hubs” - concepts that truly are central, but may not be represented as central based on concept map
    - Priority
        - High-degree nodes (central concepts)
        - High-betweenness nodes (bridge concepts)
        - High semantic degree nodes (semantically dense nodes)
        - Initial schedule should be based on the expected time to reach X expected recall divided by time to get there (days)
    - Cram Recalculator 
    - Fuzz
        - Prevents related cards reviewed back to back; whenever a new due date is assigned to a card the fuzz factor is applied so not all cards reviewed at a time are reviewed again at same time
        - Applied last after other modifiers for next due date
        - Prompt a change to expected study time in period leading up to test to allow user to “cram” and see extra content right before exam - automatically cram based on flagged cards and seeing cards earlier to improve expected retention

Server
    - on Google Firebase
    - Stores content libraries and user progress
    - “Server Brain” code

Content libraries
    - Stored as json files
    - Public libraries stored in google firebase
    - Local client stores downloaded libraries 
    - Private libraries stored in google firebase
    - Consist of concepts, cards tied to the concepts, and questions that broach multiple concepts; relationships that cross between concepts
        - All cards and questions have semantic vectorization, concepts have centroid vector which is the average of all cards within it
        - Cognitive load should be numerical, assigned by AI
        - Estimated time of completion for each card, assigned by AI
        - This is calculated at time of creation
            - 20 (perhaps this number should vary based on size of library) closest related cards are identified with similarity scores
            - concepts and cards within specified proximity to questions vectors are tied to the questions for rapid identification later on when questions are answered
            - Cloud Functions listen for Concept/Card creation to generate embeddings (via OpenAI/Cohere) and update centroid vectors asynchronously (this occurs on syncing and interacting with server) - thus new cards/concepts/questions not fully functional until sync
        - Cards include pedagogical role (integration style questions confer more mastery) and difficulty (corresponding with cognitive load) 
        - AI to create relationship cards that cross concepts 
            - Unlocked once those concepts reach a threshold of mastery
            - Separate relationship mastery curve that works the same as card mastery (visualized in concept map)
            - Structural spacing: appear in microbatches among review cards
            - Also trigger boosts to associated cards for mastery
            - Relationships to cross concepts, sub-topics, topics, etc.
            - Assign relationships under their smallest hierarchical structural node (i.e. category, topic, sub-topic, concept, etc.)
        - Precompute:
            - degree
            - betweenness
            - neighbor clusters
    - AI library creation feature to be incorporated at future time
    - Libraries can also be adapted from pre-made anki decks and other sources (to develop at future time)





Scheduler
- index.ts file that connects to the Google Firebase and acts as the online server
    - full code found in: 
        - /Users/colbynielsen/Documents/StudyBuddy/Scheduler/functions/src

UI
- Tanstack Start (frontend), Tanstack query (data management) for reference data (static, library data)
- localForage to store user progress data (persistence)


/Users/colbynielsen/Documents/StudyBuddy
- TypeScriptDefinitions
    - Contains the definitions to allow cross-talk between firebase and my frontend

￼
/my-study-app
├── /functions (The Server Brain)
│   ├── index.ts           <-- Entry point for Firebase
│   ├── src/
│   │   ├── vectorTriggers.ts   <-- AI Vector creation code
│   │   └── syncLogic.ts        <-- Conflict resolution logic
│
├── /app (The Client Brain - Tanstack Start)
│   ├── /src
│   │   ├── /features
│   │   │   ├── /scheduler
│   │   │   │   ├── algorithm.ts  <-- The FSRS/Scheduling math (Moved from Server)
				Needs to read from LocalForage rather than firebase
│   │   │   │   └── adjuster.ts   <-- The "Day Adjuster" logic
│   │   │   ├── /sync
│   │   │   │   └── syncClient.ts <-- Pushes data to Firebase
│   │   │   └── /library
│   │   │       └── localDb.ts    <-- wrapper for localForage
│   │   ├── /routes               <-- Your UI Pages (Home, Study, Stats)
│   │   └── /components           <-- Buttons, Cards, Graphs

Converting to applications on user devices:
1. Tanstack Start builds a website that users can interact with
2. CapacitorJS turns Tanstack code into Android and iOS applications
3. Tauri converts Tanstack Start into a Windows or Mac application that is downloadable and faster than the website version