# Deployment Quick Start

## Prerequisites

1. **Firebase CLI installed**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Node.js 24** (as specified in `package.json`)

3. **Java** (for Firestore emulator testing)
   - See `docs/JAVA_SETUP.md` for installation

## Quick Deployment

### Option 1: Automated Script (Recommended)

```bash
# Full deployment with tests
npm run deploy:production

# Dry run (no actual deployment)
npm run deploy:production -- --dry-run

# Skip tests (faster, but not recommended)
npm run deploy:production -- --skip-tests
```

### Option 2: Manual Steps

```bash
# 1. Build
npm run build

# 2. Deploy everything
npm run deploy:all

# Or deploy individually:
npm run deploy:rules      # Security rules
npm run deploy:indexes    # Firestore indexes
npm run deploy:functions  # Cloud Functions
```

## Verify Deployment

```bash
# Check functions
firebase functions:list

# View logs
npm run logs

# Follow logs in real-time
npm run logs:follow
```

## Common Issues

### "Index not found" errors
- Indexes take time to build after deployment
- Check status in Firebase Console → Firestore → Indexes
- Wait for indexes to finish building before using queries

### Function timeout
- Increase timeout in `src/triggers/eventProjectorTrigger.ts`
- Or optimize projection logic

### Permission denied
- Verify security rules are deployed: `npm run deploy:rules`
- Check user is authenticated
- Test rules with emulator first

## Full Documentation

See `docs/PRODUCTION_DEPLOYMENT.md` for comprehensive guide.

