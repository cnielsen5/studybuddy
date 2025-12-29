# Event Coverage Analysis

Based on the "Socrates Structure and Organizer.md" document, this analysis identifies all events we currently have and potential gaps.

## Current Events (✅ Implemented)

1. **`card_reviewed`** ✅
   - Document reference: Section 6.1 (On Review), Section 8 (Session Queue Shaping)
   - Purpose: Record when a user reviews a card
   - Status: Has fixture and invariants

2. **`question_attempted`** ✅
   - Document reference: Section 5.5 (QuestionAttempt), Section 2.3 (Evidence Layer)
   - Purpose: Record when a user attempts a question
   - Status: Has fixture and invariants

3. **`relationship_reviewed`** ✅
   - Document reference: Section 5.4 (Relationships), Section 8 (Relationship card injection)
   - Purpose: Record when a user reviews a relationship card
   - Status: Has fixture and invariants

4. **`misconception_probe_result`** ✅
   - Document reference: Section 12 (AI Probing System), Section 10.5 (Outcomes)
   - Purpose: Record results from AI diagnostic/remedial probing
   - Status: Has fixture and invariants

5. **`library_id_map_applied`** ✅
   - Document reference: Section 4.2 (Sync), Section 5 (Content Libraries)
   - Purpose: Record when library ID mappings are applied during sync
   - Status: Has fixture and invariants

## Potential Missing Events

### High Priority (Core Functionality)

1. **`session_started`** ⚠️ MISSING
   - Document reference: Section 6.1 ("On Session-Start"), Section 8 (Session Queue Shaping)
   - Purpose: Record when a study session begins
   - Rationale: Needed to track session lifecycle, initialize AFI, and build session queue
   - Payload should include:
     - `session_id`: string
     - `planned_load`: number (optional)
     - `queue_size`: number
     - `cram_mode`: boolean (optional)

2. **`session_ended`** ⚠️ MISSING
   - Document reference: Section 2.3 (Session summaries), Section 16 (Session-level outcomes)
   - Purpose: Record when a study session ends
   - Rationale: Needed to finalize session summaries, calculate metrics, and persist session state
   - Payload should include:
     - `session_id`: string
     - `actual_load`: number
     - `retention_delta`: number (optional)
     - `fatigue_hit`: boolean
     - `user_accepted_intervention`: boolean (optional)

### Medium Priority (User Actions)

3. **`content_flagged`** ⚠️ MISSING
   - Document reference: Section 5.6 (Feedback & Moderation Signals)
   - Purpose: Record when a user flags content for review
   - Rationale: Needed for moderation workflow
   - Payload should include:
     - `card_id`: string (or question_id, etc.)
     - `reason`: "incorrect" | "confusing" | "outdated" | "poorly_worded"
     - `comment`: string (optional)

4. **`card_annotation_updated`** ⚠️ MISSING
   - Document reference: Section 2.2 (UserCardAnnotation)
   - Purpose: Record when user tags/pins cards
   - Rationale: Needed to track user preferences and personal organization
   - Payload should include:
     - `card_id`: string
     - `tags`: string[]
     - `pinned`: boolean (optional)
     - `action`: "added" | "removed" | "updated"

### Medium Priority (System Actions)

5. **`mastery_certification_started`** ⚠️ MISSING
   - Document reference: Section 13 (Mastery Certification)
   - Purpose: Record when certification process begins
   - Rationale: Needed to track certification attempts and outcomes
   - Payload should include:
     - `concept_id`: string
     - `certification_type`: "full" | "partial" | "none" (determined after)

6. **`mastery_certification_completed`** ⚠️ MISSING
   - Document reference: Section 13 (Mastery Certification)
   - Purpose: Record certification outcome
   - Rationale: Needed to apply certification effects (suppress cards, accelerate scheduling)
   - Payload should include:
     - `concept_id`: string
     - `certification_result`: "full" | "partial" | "none"
     - `questions_answered`: number
     - `correct_count`: number
     - `reasoning_quality`: "good" | "weak" (optional)

### Lower Priority (Interventions - May be Derived)

7. **`intervention_accepted`** ⚠️ MISSING (May be optional)
   - Document reference: Section 10.5 (Outcomes), Section 13.2 (User Control)
   - Purpose: Record when user accepts an intervention (accelerate, lapse, etc.)
   - Rationale: Useful for analytics and understanding user behavior
   - Note: Could be derived from other events, but explicit tracking is valuable

8. **`intervention_rejected`** ⚠️ MISSING (May be optional)
   - Document reference: Section 10.5 (Outcomes), Section 13.2 (User Control)
   - Purpose: Record when user rejects an intervention
   - Rationale: Useful for analytics

9. **`acceleration_applied`** ⚠️ MISSING (May be optional)
   - Document reference: Section 10.5 (Accelerate)
   - Purpose: Record when acceleration is applied to a card
   - Rationale: Important for audit trail of stability changes
   - Note: Could be derived from card_reviewed + intervention_accepted

10. **`lapse_applied`** ⚠️ MISSING (May be optional)
    - Document reference: Section 10.5 (Lapse)
    - Purpose: Record when a lapse is applied to a card
    - Rationale: Important for audit trail of stability changes
    - Note: Could be derived from card_reviewed + intervention_accepted

### Lower Priority (Goals - May be User State, Not Events)

11. **`goal_created`** ⚠️ MISSING (May not need event)
    - Document reference: Section 9 (Goals & Planning)
    - Purpose: Record goal creation
    - Rationale: Goals might be user state rather than events
    - Note: Depends on whether goals need event sourcing

12. **`goal_updated`** ⚠️ MISSING (May not need event)
    - Document reference: Section 9 (Goals & Planning)
    - Purpose: Record goal modifications
    - Rationale: Goals might be user state rather than events

## Recommendations

### Must Have (Core Functionality)
1. ✅ **`session_started`** - Essential for session lifecycle
2. ✅ **`session_ended`** - Essential for session summaries and metrics

### Should Have (User Actions)
3. ✅ **`content_flagged`** - Needed for moderation workflow
4. ✅ **`card_annotation_updated`** - Needed for user preferences

### Should Have (System Actions)
5. ✅ **`mastery_certification_started`** - Needed for certification tracking
6. ✅ **`mastery_certification_completed`** - Needed for certification effects

### Nice to Have (Analytics/Interventions)
7. ⚠️ **`intervention_accepted`** - Useful for analytics
8. ⚠️ **`intervention_rejected`** - Useful for analytics
9. ⚠️ **`acceleration_applied`** - Could be derived, but explicit is better
10. ⚠️ **`lapse_applied`** - Could be derived, but explicit is better

### Defer (May Not Need Events)
11. ❓ **`goal_created/updated`** - Depends on whether goals are event-sourced
12. ❓ Other system telemetry - Internal diagnostics may not need events

## Summary

**Current Coverage: 5/12+ events**

**Critical Gaps:**
- Session lifecycle events (started, ended)
- Content moderation (flagged)
- User preferences (annotations)
- Certification tracking (started, completed)

**Next Steps:**
1. Create fixtures and invariants for session_started and session_ended
2. Create fixtures and invariants for content_flagged
3. Create fixtures and invariants for card_annotation_updated
4. Create fixtures and invariants for mastery_certification events
5. Consider intervention events based on analytics needs

