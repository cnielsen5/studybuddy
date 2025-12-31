# Staging Deployment - Quick Start

## First Time Setup

### 1. Create Staging Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it: `studybuddy-staging` (or your preferred name)
4. Enable Firestore (start in test mode, we'll deploy rules)
5. Enable Cloud Functions
6. Set up billing (Blaze plan required)

### 2. Configure Local Environment

```bash
# Run setup script
./scripts/setup-staging.sh

# Or manually create .firebaserc:
# Copy .firebaserc.example to .firebaserc
# Edit with your project IDs
```

### 3. Set Staging as Active

```bash
firebase use staging
firebase use  # Verify
```

## Deploy to Staging

### Quick Deploy

```bash
# Automated (recommended)
npm run deploy:staging

# Or manual
firebase use staging
npm run build
npm run deploy:all
```

### Verify Deployment

```bash
# Check functions
firebase functions:list

# View logs
firebase functions:log --limit 20

# Test with a test event (see STAGING_DEPLOYMENT.md)
```

## Switching Environments

```bash
# Switch to staging
firebase use staging

# Switch to production
firebase use production

# Check current
firebase use
```

## Common Commands

```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# View staging logs
firebase functions:log --project <staging-project-id>

# View production logs
firebase functions:log --project <production-project-id>
```

## Troubleshooting

**"No project selected"**
```bash
firebase use staging
```

**"Project not found"**
- Verify project exists in Firebase Console
- Check .firebaserc has correct project IDs
- Run: `firebase projects:list`

**"Permission denied"**
- Make sure you're logged in: `firebase login`
- Verify you have access to the project

**"Eventarc Service Agent permission denied" (Functions v2)**
- This is normal on first deployment
- Wait 5-10 minutes and retry: `firebase deploy --only functions`
- Rules and indexes deploy successfully even if functions fail
- See `STAGING_DEPLOYMENT.md` for detailed troubleshooting

## Next Steps

After staging is deployed:
1. Test event ingestion
2. Verify views are created
3. Test security rules
4. Monitor for errors
5. When ready, deploy to production

See `STAGING_DEPLOYMENT.md` for full guide.

