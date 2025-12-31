# Production Deployment Guide

## Overview

This guide covers deploying the StudyBuddy event-sourced architecture to production Firebase. It includes pre-deployment checks, deployment steps, monitoring, and troubleshooting.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Environment Configuration](#environment-configuration)
3. [Firebase Project Setup](#firebase-project-setup)
4. [Deployment Steps](#deployment-steps)
5. [Security Rules Deployment](#security-rules-deployment)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring & Observability](#monitoring--observability)
8. [Performance Optimization](#performance-optimization)
9. [Scaling Considerations](#scaling-considerations)
10. [Rollback Procedures](#rollback-procedures)
11. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

### Code Quality
- [ ] All tests pass: `npm test`
- [ ] No linter errors: `npm run build`
- [ ] TypeScript compiles without errors
- [ ] No console.log statements in production code
- [ ] All TODO/FIXME comments addressed or documented

### Security
- [ ] Security rules tested: `npm run test:rules`
- [ ] No hardcoded secrets or API keys
- [ ] Environment variables properly configured
- [ ] Firestore indexes created (see `firestore.indexes.json`)
- [ ] Authentication required for all user operations

### Data Integrity
- [ ] Event validation schemas are production-ready
- [ ] Idempotency checks are working
- [ ] View projection logic is tested
- [ ] Cross-domain integrity invariants pass

### Performance
- [ ] Firestore indexes optimized for query patterns
- [ ] Batch operations used where appropriate
- [ ] Connection pooling configured
- [ ] Cold start mitigation strategies in place

---

## Environment Configuration

### Required Environment Variables

Create a `.env.production` file (do NOT commit to git):

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=your-production-project-id
FIREBASE_REGION=us-central1

# Node Environment
NODE_ENV=production

# Optional: Custom configuration
FSRS_OPTIMIZATION_ENABLED=false
MAX_BATCH_SIZE=500
SYNC_INTERVAL_MS=300000  # 5 minutes
```

### Firebase Configuration

Ensure `firebase.json` is configured correctly:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "lib",
    "runtime": "nodejs20"
  }
}
```

### TypeScript Build Configuration

Verify `tsconfig.json` production settings:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "outDir": "./lib",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "tests", "lib"]
}
```

---

## Firebase Project Setup

### 1. Initialize Firebase Project

```bash
# Login to Firebase
firebase login

# Initialize project (if not already done)
firebase init

# Select:
# - Firestore: Configure security rules and indexes
# - Functions: Configure a Cloud Functions directory
```

### 2. Set Active Project

```bash
# List projects
firebase projects:list

# Use production project
firebase use production-project-id

# Verify
firebase projects:list
```

### 3. Enable Required APIs

Enable these APIs in Google Cloud Console:

- Cloud Firestore API
- Cloud Functions API
- Cloud Logging API
- Cloud Monitoring API

```bash
# Or via gcloud CLI
gcloud services enable firestore.googleapis.com
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable logging.googleapis.com
gcloud services enable monitoring.googleapis.com
```

---

## Deployment Steps

### Step 1: Build TypeScript

```bash
# Clean previous build
rm -rf lib

# Build TypeScript
npm run build

# Verify build output
ls -la lib/
```

### Step 2: Run Pre-Deployment Tests

```bash
# Run all tests
npm test

# Test security rules (requires emulator)
npm run test:rules

# Verify fixtures compile
npm test -- tests/fixtures/fixtures.smoke.test.ts
```

### Step 3: Deploy Firestore Security Rules

```bash
# Deploy rules
firebase deploy --only firestore:rules

# Verify rules are active
firebase firestore:rules:get
```

### Step 4: Deploy Firestore Indexes

```bash
# Deploy indexes
firebase deploy --only firestore:indexes

# Wait for indexes to build (can take time)
# Check status in Firebase Console
```

**Important:** Indexes must be built before deploying functions that use them, or queries will fail.

### Step 5: Deploy Cloud Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:onEventCreated
```

### Step 6: Verify Deployment

```bash
# List deployed functions
firebase functions:list

# Check function logs
firebase functions:log --only onEventCreated
```

---

## Security Rules Deployment

### Pre-Deployment Testing

```bash
# Test rules with emulator
npm run test:rules

# Manual testing (requires emulator running)
npm run test:rules:manual
```

### Deploy Rules

```bash
# Deploy rules
firebase deploy --only firestore:rules

# Verify deployment
firebase firestore:rules:get
```

### Rules Validation

The deployed rules should enforce:

1. **Event Immutability**
   - ✅ Create only (no updates/deletes)
   - ✅ Idempotency (duplicate creates denied)
   - ✅ Path validation (event_id, user_id, library_id match)

2. **Access Control**
   - ✅ Users can only read/write their own events
   - ✅ Authenticated users only
   - ✅ No cross-user access

### Post-Deployment Rules Testing

Test rules in production (use test user accounts):

```typescript
// Test event creation
const testEvent = {
  event_id: "evt_test_001",
  user_id: "user_test",
  library_id: "lib_test",
  // ... rest of event
};

// Should succeed
await firestore.collection("users/user_test/libraries/lib_test/events").doc("evt_test_001").set(testEvent);

// Should fail (duplicate)
await firestore.collection("users/user_test/libraries/lib_test/events").doc("evt_test_001").set(testEvent);

// Should fail (update)
await firestore.collection("users/user_test/libraries/lib_test/events").doc("evt_test_001").update({type: "modified"});
```

---

## Post-Deployment Verification

### 1. Function Health Check

```bash
# Check function status
firebase functions:list

# View recent logs
firebase functions:log --limit 50

# Check for errors
firebase functions:log --only onEventCreated | grep -i error
```

### 2. Test Event Ingestion

Create a test event and verify:

```typescript
// Create test event
const testEvent = createCardReviewedEvent({
  userId: "user_test",
  libraryId: "lib_test",
  cardId: "card_test_001",
  grade: "good",
  secondsSpent: 10,
  deviceId: "test_device"
});

// Upload event
const result = await uploadEvent(firestore, testEvent);
console.log("Upload result:", result);

// Verify event exists
const eventDoc = await firestore
  .doc(`users/user_test/libraries/lib_test/events/${testEvent.event_id}`)
  .get();
console.log("Event exists:", eventDoc.exists);

// Verify view was created/updated
const viewDoc = await firestore
  .doc(`users/user_test/libraries/lib_test/views/card_schedule/card_test_001`)
  .get();
console.log("View exists:", viewDoc.exists);
console.log("View data:", viewDoc.data());
```

### 3. Verify Projector Trigger

Check that the `onEventCreated` trigger fired:

```bash
# Check function logs for trigger execution
firebase functions:log --only onEventCreated --limit 20
```

Look for:
- ✅ Successful event processing
- ✅ View updates
- ✅ No errors

### 4. Test Idempotency

```typescript
// Upload same event twice
const event1 = await uploadEvent(firestore, testEvent);
const event2 = await uploadEvent(firestore, testEvent);

// Both should succeed, second should be idempotent
expect(event1.success).toBe(true);
expect(event2.success).toBe(true);
expect(event2.idempotent).toBe(true);
```

---

## Monitoring & Observability

### Cloud Functions Logging

```bash
# View real-time logs
firebase functions:log --only onEventCreated --follow

# Filter by severity
firebase functions:log --only onEventCreated --severity ERROR

# Search logs
firebase functions:log --only onEventCreated | grep "card_reviewed"
```

### Firestore Monitoring

Monitor in Firebase Console:
- **Usage**: Read/write operations per day
- **Performance**: Query latency
- **Errors**: Failed operations
- **Indexes**: Build status and usage

### Key Metrics to Monitor

1. **Event Ingestion**
   - Events created per hour/day
   - Failed event creations
   - Average event size

2. **Projector Performance**
   - Trigger execution time
   - Failed projections
   - View update latency

3. **Function Health**
   - Cold start frequency
   - Memory usage
   - Execution time
   - Error rate

4. **Firestore Performance**
   - Read/write operations
   - Query latency
   - Index usage

### Setting Up Alerts

Create alerts in Google Cloud Console for:

1. **Function Errors**
   - Alert when error rate > 1%
   - Alert on specific error types

2. **High Latency**
   - Alert when function execution > 5s
   - Alert when Firestore queries > 1s

3. **Resource Limits**
   - Alert when approaching quota limits
   - Alert on function timeout errors

### Custom Logging

Add structured logging to functions:

```typescript
import * as functions from "firebase-functions";

export const onEventCreated = functions.firestore
  .document("users/{userId}/libraries/{libraryId}/events/{eventId}")
  .onCreate(async (snap, context) => {
    const event = snap.data() as UserEvent;
    const { userId, libraryId, eventId } = context.params;

    functions.logger.info("Event received", {
      eventId,
      eventType: event.type,
      userId,
      libraryId,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await projectEvent(firestore, event);
      
      functions.logger.info("Event projected", {
        eventId,
        success: result.success,
        viewUpdated: result.viewUpdated,
      });

      return result;
    } catch (error) {
      functions.logger.error("Projection failed", {
        eventId,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  });
```

---

## Performance Optimization

### 1. Firestore Indexes

Ensure all query patterns have indexes:

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "events",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "received_at", "order": "ASCENDING" },
        { "fieldPath": "event_id", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "card_schedule",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "due_at", "order": "ASCENDING" },
        { "fieldPath": "state", "order": "ASCENDING" }
      ]
    }
  ]
}
```

### 2. Function Configuration

Optimize function settings in `src/index.ts`:

```typescript
export const onEventCreated = functions
  .runWith({
    timeoutSeconds: 60,  // Increase for complex projections
    memory: "512MB",     // Increase if needed
    maxInstances: 100,   // Scale limit
  })
  .firestore
  .document("users/{userId}/libraries/{libraryId}/events/{eventId}")
  .onCreate(async (snap, context) => {
    // ...
  });
```

### 3. Batch Operations

Use batch writes for multiple updates:

```typescript
// Instead of individual writes
for (const update of updates) {
  await firestore.doc(update.path).set(update.data);
}

// Use batch writes
const batch = firestore.batch();
for (const update of updates) {
  batch.set(firestore.doc(update.path), update.data);
}
await batch.commit();
```

### 4. Connection Pooling

Reuse Firestore instances:

```typescript
// Initialize once
const firestore = admin.firestore();
firestore.settings({
  maxIdleChannels: 10,
  // ... other settings
});

// Reuse across function invocations
```

---

## Scaling Considerations

### Function Scaling

Cloud Functions auto-scale, but consider:

1. **Concurrency Limits**
   - Default: 80 concurrent executions per function
   - Increase if needed: `maxInstances: 1000`

2. **Cold Starts**
   - Minimize dependencies
   - Use lazy initialization
   - Consider Cloud Run for better cold start performance

3. **Memory Allocation**
   - Start with 256MB
   - Increase if seeing OOM errors
   - Monitor memory usage

### Firestore Scaling

1. **Read/Write Limits**
   - Document writes: 1 per second per document
   - Collection writes: 500 per second per collection
   - Plan for sharding if needed

2. **Query Performance**
   - Use composite indexes
   - Limit query results
   - Cache frequently accessed views

3. **Cost Optimization**
   - Use batch operations
   - Minimize document reads
   - Use server timestamps instead of client timestamps

### Event Processing Throughput

For high-volume event processing:

1. **Batch Processing**
   - Process events in batches
   - Use Cloud Tasks for queuing

2. **Parallel Processing**
   - Process independent events in parallel
   - Use Promise.all() for concurrent operations

3. **Backpressure Handling**
   - Queue events if processing is slow
   - Implement retry logic with exponential backoff

---

## Rollback Procedures

### Rollback Functions

```bash
# List function versions
firebase functions:list

# Rollback to previous version
firebase functions:rollback onEventCreated --version <previous-version>

# Or redeploy previous code
git checkout <previous-commit>
npm run build
firebase deploy --only functions:onEventCreated
```

### Rollback Security Rules

```bash
# View rules history
firebase firestore:rules:get

# Rollback to previous version
# (Manual: copy previous rules from git history)
git checkout <previous-commit> firestore.rules
firebase deploy --only firestore:rules
```

### Data Recovery

If views are corrupted:

1. **Rebuild from Events**
   ```typescript
   // Replay all events to rebuild views
   const events = await firestore
     .collection("users/{userId}/libraries/{libraryId}/events")
     .orderBy("received_at", "asc")
     .get();

   for (const eventDoc of events.docs) {
     const event = eventDoc.data() as UserEvent;
     await projectEvent(firestore, event);
   }
   ```

2. **Selective Rebuild**
   ```typescript
   // Rebuild specific card's view
   const cardEvents = await firestore
     .collection("users/{userId}/libraries/{libraryId}/events")
     .where("entity.kind", "==", "card")
     .where("entity.id", "==", cardId)
     .orderBy("received_at", "asc")
     .get();

   // Replay events
   ```

---

## Troubleshooting

### Common Issues

#### 1. Function Timeout

**Symptoms:** Functions timing out after 60s

**Solutions:**
- Increase timeout: `timeoutSeconds: 120`
- Optimize projection logic
- Use batch operations
- Consider splitting into multiple functions

#### 2. Firestore Index Missing

**Symptoms:** Query errors: "The query requires an index"

**Solutions:**
```bash
# Create missing index
firebase deploy --only firestore:indexes

# Or use the link from error message to create in console
```

#### 3. Security Rules Denying Access

**Symptoms:** Permission denied errors

**Solutions:**
- Verify user is authenticated
- Check rules match path structure
- Test rules with emulator first
- Review rules logs in Firebase Console

#### 4. High Function Costs

**Symptoms:** Unexpected billing

**Solutions:**
- Monitor function invocations
- Optimize cold starts
- Reduce unnecessary function calls
- Use Firestore onSnapshot sparingly

#### 5. View Inconsistencies

**Symptoms:** Views don't match events

**Solutions:**
- Check projector logs for errors
- Verify idempotency is working
- Rebuild views from events
- Check for out-of-order event processing

### Debugging Tools

1. **Firebase Console**
   - Functions: Logs, metrics, errors
   - Firestore: Data, usage, indexes
   - Authentication: Users, providers

2. **Cloud Logging**
   ```bash
   # Query logs
   gcloud logging read "resource.type=cloud_function" --limit 50
   ```

3. **Local Testing**
   ```bash
   # Test with emulator
   firebase emulators:start
   npm test
   ```

---

## Best Practices

### 1. Gradual Rollout

Deploy to production gradually:

1. Deploy to staging first
2. Test thoroughly
3. Deploy to 10% of users (if possible)
4. Monitor for 24 hours
5. Full rollout

### 2. Version Control

- Tag releases: `git tag v1.0.0`
- Document changes in CHANGELOG.md
- Keep deployment scripts in version control

### 3. Monitoring

- Set up alerts before deployment
- Monitor key metrics daily
- Review logs weekly
- Set up dashboards for key metrics

### 4. Documentation

- Document all environment variables
- Keep deployment procedures up to date
- Document rollback procedures
- Maintain runbooks for common issues

### 5. Security

- Rotate secrets regularly
- Review security rules quarterly
- Audit access logs
- Keep dependencies updated

---

## Quick Reference

### Deployment Commands

```bash
# Full deployment
npm run build && firebase deploy

# Deploy specific components
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes

# View logs
firebase functions:log
firebase firestore:rules:get
```

### Verification Commands

```bash
# Test locally
npm test
npm run test:rules

# Check build
npm run build
ls -la lib/

# Verify deployment
firebase functions:list
firebase firestore:rules:get
```

### Emergency Procedures

```bash
# Disable function (stop processing)
# (Manual: Set function to 0 instances in console)

# Rollback function
firebase functions:rollback <function-name>

# Rollback rules
git checkout <previous-commit> firestore.rules
firebase deploy --only firestore:rules
```

---

## Next Steps After Deployment

1. **Monitor for 24-48 hours**
   - Watch error rates
   - Monitor performance
   - Check user feedback

2. **Optimize based on metrics**
   - Adjust function memory/timeout
   - Add missing indexes
   - Optimize queries

3. **Set up automated monitoring**
   - Cloud Monitoring alerts
   - Error tracking (Sentry, etc.)
   - Performance dashboards

4. **Plan for scale**
   - Review usage patterns
   - Plan for growth
   - Optimize hot paths

---

## Support & Resources

- **Firebase Documentation**: https://firebase.google.com/docs
- **Cloud Functions Best Practices**: https://firebase.google.com/docs/functions/best-practices
- **Firestore Best Practices**: https://firebase.google.com/docs/firestore/best-practices
- **Project Documentation**: See `docs/` directory

---

## Checklist Summary

Before deploying to production:

- [ ] All tests pass
- [ ] Security rules tested
- [ ] Environment variables configured
- [ ] Firestore indexes created
- [ ] Functions built and tested
- [ ] Monitoring set up
- [ ] Alerts configured
- [ ] Rollback plan documented
- [ ] Team trained on procedures
- [ ] Backup plan in place

After deployment:

- [ ] Functions deployed successfully
- [ ] Security rules active
- [ ] Indexes built
- [ ] Test event processed
- [ ] Views created correctly
- [ ] Monitoring active
- [ ] No errors in logs
- [ ] Performance acceptable

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0

