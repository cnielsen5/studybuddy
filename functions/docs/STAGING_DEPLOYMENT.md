# Staging Deployment Guide

## Overview

This guide covers deploying to a staging environment for testing before production. Staging should mirror production as closely as possible but with test data and lower resource limits.

## Prerequisites

1. **Staging Firebase Project Created**
   - Create a new Firebase project for staging (e.g., `studybuddy-staging`)
   - Enable Firestore, Functions, Authentication
   - Set up billing (staging can use Blaze plan with minimal costs)

2. **Firebase CLI Configured**
   ```bash
   firebase login
   firebase projects:list
   ```

## Step 1: Configure Firebase Projects

### Create `.firebaserc` File

Create `.firebaserc` in the project root:

```json
{
  "projects": {
    "default": "studybuddy-staging",
    "staging": "studybuddy-staging",
    "production": "studybuddy-production"
  }
}
```

**Replace project IDs with your actual Firebase project IDs.**

### Verify Project Configuration

```bash
# List available projects
firebase projects:list

# Set staging as default
firebase use staging

# Verify
firebase use
```

## Step 2: Configure Staging Environment

### Create Staging-Specific Configuration

Create `firebase.staging.json` (optional, for staging-specific overrides):

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "lib",
    "runtime": "nodejs20",
    "predeploy": ["npm run build"]
  },
  "emulators": {
    "firestore": {
      "port": 8080
    }
  }
}
```

### Environment Variables (Optional)

For staging-specific behavior, you can use environment variables in functions:

```typescript
// In your function code
const isStaging = process.env.FUNCTIONS_EMULATOR || 
                  process.env.GCLOUD_PROJECT?.includes('staging');

if (isStaging) {
  // Staging-specific behavior
  logger.info("Running in staging mode");
}
```

## Step 3: Deploy to Staging

### Option 1: Automated Script

```bash
# Deploy to staging
npm run deploy:staging

# Or use the deploy script with staging project
firebase use staging
npm run deploy:production
```

### Option 2: Manual Deployment

```bash
# 1. Switch to staging project
firebase use staging

# 2. Verify you're on the right project
firebase use

# 3. Build
npm run build

# 4. Deploy security rules
firebase deploy --only firestore:rules

# 5. Deploy indexes
firebase deploy --only firestore:indexes

# 6. Deploy functions
firebase deploy --only functions
```

## Step 4: Verify Staging Deployment

### Check Functions

```bash
# List deployed functions
firebase functions:list

# View logs
firebase functions:log --only onEventCreated --limit 20
```

### Test Event Ingestion

Create a test event in staging:

```typescript
import { StudyBuddyClient, MemoryEventQueue, MemoryCursorStore } from './src/client';
import { Firestore } from '@google-cloud/firestore';

// Initialize Firestore (use admin SDK or client SDK)
const firestore = new Firestore({
  projectId: 'studybuddy-staging',
});

const client = new StudyBuddyClient(
  firestore,
  'user_test_staging',
  'lib_test_staging',
  'device_test_001',
  new MemoryEventQueue(),
  new MemoryCursorStore()
);

// Test card review
const result = await client.reviewCard('card_test_001', 'good', 18);
console.log('Review result:', result);

// Verify view was created
const schedule = await client.getCardSchedule('card_test_001');
console.log('Schedule view:', schedule);
```

### Verify Security Rules

Test that security rules are working:

```typescript
// Should succeed (authenticated user)
await firestore
  .collection('users/user_test/libraries/lib_test/events')
  .doc('evt_test_001')
  .set(testEvent);

// Should fail (unauthenticated)
// (Test with unauthenticated client)
```

## Step 5: Staging-Specific Considerations

### Test Data

Staging should use test data, not production data:

- Use test user accounts
- Use test libraries
- Clear staging data periodically
- Use test cards/concepts

### Resource Limits

Staging can have lower limits:

```typescript
// In function configuration
export const onEventCreated = functions
  .runWith({
    timeoutSeconds: 60,
    memory: '256MB',  // Lower than production
    maxInstances: 10,  // Lower than production
  })
  .firestore
  .document('users/{userId}/libraries/{libraryId}/events/{eventId}')
  .onCreate(async (snap, context) => {
    // ...
  });
```

### Monitoring

Set up staging-specific monitoring:

- Lower alert thresholds
- Separate dashboards
- Test alerting systems

## Step 6: Pre-Production Checklist

Before promoting staging to production:

- [ ] All staging tests pass
- [ ] Performance is acceptable
- [ ] No errors in logs for 24+ hours
- [ ] Security rules tested
- [ ] Indexes built and verified
- [ ] Test data cleaned up
- [ ] Documentation updated
- [ ] Team notified

## Switching Between Environments

### Switch to Staging

```bash
firebase use staging
firebase use  # Verify
```

### Switch to Production

```bash
firebase use production
firebase use  # Verify
```

### Deploy to Specific Project

```bash
# Deploy to staging
firebase use staging && firebase deploy

# Deploy to production
firebase use production && firebase deploy
```

## Staging vs Production Differences

| Aspect | Staging | Production |
|--------|---------|------------|
| Project ID | `studybuddy-staging` | `studybuddy-production` |
| Data | Test data | Real user data |
| Resource Limits | Lower | Higher |
| Monitoring | Test alerts | Production alerts |
| Backup | Optional | Required |
| Cost | Minimal | Full |

## Troubleshooting

### Wrong Project Deployed

If you accidentally deploy to the wrong project:

```bash
# Check current project
firebase use

# Switch to correct project
firebase use staging  # or production

# Redeploy
firebase deploy
```

### Staging Data Cleanup

To reset staging data:

```bash
# Use Firebase Console or gcloud CLI
# Delete test collections manually
# Or use a cleanup script
```

### Index Build Time

Staging indexes build faster (less data), but still need to wait:

```bash
# Check index status
firebase firestore:indexes

# Or in Firebase Console: Firestore → Indexes
```

## Best Practices

1. **Always test in staging first**
   - Never deploy directly to production
   - Use staging for all new features

2. **Keep staging in sync**
   - Deploy same code to staging and production
   - Use same security rules
   - Use same indexes

3. **Regular cleanup**
   - Clear old test data
   - Reset test accounts
   - Clean up orphaned views

4. **Monitor staging**
   - Set up basic monitoring
   - Test alerting
   - Verify performance

5. **Document differences**
   - Keep track of staging-specific configs
   - Document any manual steps
   - Update this guide as needed

## Quick Reference

```bash
# Switch to staging
firebase use staging

# Deploy to staging
npm run deploy:staging

# View staging logs
firebase functions:log --project studybuddy-staging

# Switch to production
firebase use production

# Deploy to production
npm run deploy:production
```

## Troubleshooting

### Functions Deployment: Eventarc Permission Error

**Error:**
```
Permission denied while using the Eventarc Service Agent
```

**Cause:**
This is a common issue when first deploying Firebase Functions v2. The Eventarc Service Agent needs time to receive proper permissions after being enabled.

**Solution:**

1. **Wait 5-10 minutes** and retry:
   ```bash
   firebase deploy --only functions
   ```

2. **If still failing**, manually grant permissions:
   - Go to [Google Cloud Console IAM](https://console.cloud.google.com/iam-admin/iam)
   - Find the service account: `service-{PROJECT_NUMBER}@gcp-sa-eventarc.iam.gserviceaccount.com`
   - Ensure it has the "Eventarc Service Agent" role
   - Wait a few minutes and retry

3. **Alternative**: Deploy functions separately after rules/indexes:
   ```bash
   # Deploy rules and indexes first (usually succeeds)
   npm run deploy:staging
   
   # Wait a few minutes, then deploy functions
   firebase deploy --only functions
   ```

**Note:** Rules and indexes are deployed successfully even if functions fail. The functions can be deployed later once permissions propagate.

### Outdated firebase-functions Warning

**Warning:**
```
package.json indicates an outdated version of firebase-functions
```

**Solution:**
Update firebase-functions (optional, not critical):
```bash
npm install --save firebase-functions@latest
```

### Indexes Taking Time to Build

Indexes may take 5-30 minutes to build, especially on first deployment. Check status:
```bash
firebase firestore:indexes
```

Or in Firebase Console: Firestore → Indexes

## Next Steps

After staging is deployed and tested:

1. Run integration tests against staging
2. Perform user acceptance testing
3. Load testing (if applicable)
4. Security audit
5. Deploy to production (see `PRODUCTION_DEPLOYMENT.md`)

---

**See Also:**
- `PRODUCTION_DEPLOYMENT.md` - Full production deployment guide
- `DEPLOYMENT_QUICKSTART.md` - Quick reference

