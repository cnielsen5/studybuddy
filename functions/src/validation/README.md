# Runtime Validation with Zod

This directory contains Zod schemas for runtime validation of domain objects, events, and views.

## Purpose

These schemas provide **runtime validation** that complements the Jest invariant tests:

- **Invariant tests**: Validate business logic, immutability, and structural integrity at test time
- **Zod schemas**: Validate data structure and types at runtime in production code

## Usage

### Basic Validation

```typescript
import { validateCard, validateUserEvent } from "./validation/schemas";

// Throws ZodError if invalid
const card = validateCard(data);

// Safe validation (returns result)
import { safeValidate, CardSchema } from "./validation/schemas";
const result = safeValidate(CardSchema, data);
if (result.success) {
  // Use result.data
} else {
  // Handle result.error
}
```

### In Ingestion Code

```typescript
import { validateUserEvent } from "./validation/schemas";

export async function ingestEvent(rawEvent: unknown) {
  try {
    const event = validateUserEvent(rawEvent);
    // Process validated event
    await processEvent(event);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
      logger.error("Invalid event", { errors: error.errors });
      throw new ValidationError("Event validation failed", error);
    }
    throw error;
  }
}
```

### In Projector Code

```typescript
import { validateCardScheduleView } from "./validation/schemas";

export function projectCardScheduleView(event: UserEvent): CardScheduleView {
  const view = computeView(event);
  
  // Validate before persisting
  return validateCardScheduleView(view);
}
```

## Schema Coverage

### ✅ Implemented
- `CardSchema` - Golden Master cards
- `QuestionSchema` - Golden Master questions
- `ConceptSchema` - Golden Master concepts
- `QuestionAttemptSchema` - Question attempt evidence
- `UserEventSchema` - Base event schema
- `CardScheduleViewSchema` - Projected schedule view
- `CardPerformanceViewSchema` - Projected performance view

### Event Payload Schemas
- `CardReviewedPayloadSchema`
- `QuestionAttemptedPayloadSchema`
- `SessionStartedPayloadSchema`
- `SessionEndedPayloadSchema`
- `ContentFlaggedPayloadSchema`
- `CardAnnotationUpdatedPayloadSchema`
- `MasteryCertificationCompletedPayloadSchema`

### 🚧 TODO
- Relationship schemas
- RelationshipCard schema
- MisconceptionEdgeView schema
- Additional event payload schemas
- Graph metrics schemas

## Testing

All schemas are tested against fixtures in `tests/validation/fixtures.validation.test.ts`. This ensures:

1. Fixtures match the schemas
2. Schemas are kept in sync with domain changes
3. Runtime validation will work correctly in production

## Best Practices

1. **Validate at boundaries**: Validate incoming data at API endpoints, ingestion points, and before persistence
2. **Use safe validation**: Use `safeValidate()` when you want to handle errors gracefully
3. **Keep schemas in sync**: Update schemas when domain objects change
4. **Test fixtures**: Run validation tests to ensure fixtures match schemas

## Roadmap

- [ ] Complete all event payload schemas
- [ ] Add relationship and graph metrics schemas
- [ ] Add view schemas for all projected views
- [ ] Generate TypeScript types from Zod schemas
- [ ] Add JSON Schema export for external validation
- [ ] Add validation middleware for Firebase Functions

