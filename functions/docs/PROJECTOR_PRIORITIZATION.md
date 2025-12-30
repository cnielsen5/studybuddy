# Projector Prioritization Analysis

## Current Status

✅ **Implemented (8 event types):**
- `card_reviewed` → CardScheduleView + CardPerformanceView
- `question_attempted` → QuestionPerformanceView
- `relationship_reviewed` → RelationshipScheduleView + RelationshipPerformanceView
- `misconception_probe_result` → MisconceptionEdgeView
- `session_started` → SessionView
- `session_ended` → SessionView + SessionSummary
- `acceleration_applied` → CardScheduleView
- `lapse_applied` → CardScheduleView

## Remaining Events Analysis

### High Priority (Should Implement Now)

#### 1. **`mastery_certification_completed`** ⭐
**Why:** Critical business logic - affects card scheduling and suppression
- **View Needed:** `ConceptMasteryView` or `ConceptCertificationView`
- **Updates:**
  - Certification status (full/partial/none)
  - Certification date
  - May trigger card suppression or acceleration
- **Complexity:** Medium (needs to interact with card scheduling)
- **Business Value:** High - directly affects user experience

#### 2. **`card_annotation_updated`** ⭐
**Why:** User preferences needed for UI
- **View Needed:** `CardAnnotationView`
- **Updates:**
  - User tags
  - Pinned status
  - Personal organization data
- **Complexity:** Low (simple CRUD-like view)
- **Business Value:** Medium - improves UX for personal organization

### Medium Priority (Can Defer)

#### 3. **`mastery_certification_started`**
**Why:** Tracking only, completion is what matters
- **View Needed:** Could update `ConceptCertificationView` with status
- **Updates:** Just marks certification as "in_progress"
- **Complexity:** Low
- **Business Value:** Low - mainly for analytics/tracking
- **Recommendation:** Defer - can be added when needed

#### 4. **`content_flagged`**
**Why:** Moderation workflow, not user-facing view
- **View Needed:** Admin/moderation view (separate from user views)
- **Updates:** Flag status, moderation queue
- **Complexity:** Medium (separate admin system)
- **Business Value:** Medium - needed for moderation but not core UX
- **Recommendation:** Defer - handle in separate moderation system

### Low Priority (Probably Don't Need Projectors)

#### 5. **`intervention_accepted` / `intervention_rejected`**
**Why:** Analytics events, effects already captured by acceleration/lapse events
- **View Needed:** None (or analytics-only view)
- **Complexity:** Low
- **Business Value:** Low - analytics only
- **Recommendation:** Skip - effects already in acceleration/lapse events

#### 6. **`library_id_map_applied`**
**Why:** System event, no user-facing view needed
- **View Needed:** None
- **Complexity:** N/A
- **Business Value:** None (system internal)
- **Recommendation:** Skip - no view needed

## Recommendation

### Implement Now (2 projectors):

1. **`mastery_certification_completed`** → `ConceptCertificationView`
   - High business value
   - Affects core scheduling logic
   - Medium complexity

2. **`card_annotation_updated`** → `CardAnnotationView`
   - Needed for UI
   - Low complexity
   - Quick win

### Defer (2-3 projectors):

- `mastery_certification_started` - Low value, can add later
- `content_flagged` - Separate moderation system
- `intervention_accepted/rejected` - Analytics only

## Implementation Estimate

**Now (2 projectors):**
- `mastery_certification_completed`: ~2-3 hours (needs to interact with card scheduling)
- `card_annotation_updated`: ~1 hour (simple view update)
- **Total:** ~3-4 hours

**Later (if needed):**
- `mastery_certification_started`: ~1 hour
- `content_flagged`: ~2-3 hours (separate admin system)
- **Total:** ~3-4 hours (when needed)

## Decision

**Recommendation:** Implement the 2 high-priority projectors now, defer the rest.

**Rationale:**
1. `mastery_certification_completed` is critical for core functionality
2. `card_annotation_updated` is quick and needed for UI
3. Other events can be added incrementally as needed
4. Current MVP is already comprehensive (8 event types)

