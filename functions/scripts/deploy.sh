#!/bin/bash
# Production Deployment Script
# Usage: ./scripts/deploy.sh [--dry-run] [--skip-tests]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Parse arguments
DRY_RUN=false
SKIP_TESTS=false

for arg in "$@"; do
  case $arg in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    *)
      echo "Unknown option: $arg"
      echo "Usage: ./scripts/deploy.sh [--dry-run] [--skip-tests]"
      exit 1
      ;;
  esac
done

echo -e "${GREEN}🚀 Starting Production Deployment${NC}"
echo ""

# Step 1: Pre-deployment checks
echo -e "${YELLOW}Step 1: Pre-deployment checks${NC}"

# Check if firebase CLI is installed
if ! command -v firebase &> /dev/null; then
  echo -e "${RED}❌ Firebase CLI not found. Install with: npm install -g firebase-tools${NC}"
  exit 1
fi

# Check if logged in
if ! firebase projects:list &> /dev/null; then
  echo -e "${RED}❌ Not logged into Firebase. Run: firebase login${NC}"
  exit 1
fi

# Check current project (macOS-compatible)
# firebase use outputs the project ID directly when a project is selected
# First line is usually the project ID or "Using <alias> (<project-id>)"
FIREBASE_OUTPUT=$(firebase use 2>&1 | head -1 | xargs)
CURRENT_PROJECT="none"

# Check if output contains project ID pattern (alphanumeric with hyphens)
# Direct project ID output (e.g., "socrates-staging-eedc4")
if [[ "$FIREBASE_OUTPUT" =~ ^[a-zA-Z0-9-]+$ ]]; then
  CURRENT_PROJECT="$FIREBASE_OUTPUT"
# Extract from "Using alias (project-id)" format
elif [[ "$FIREBASE_OUTPUT" == *"Using"* ]] && [[ "$FIREBASE_OUTPUT" == *"("* ]]; then
  CURRENT_PROJECT=$(echo "$FIREBASE_OUTPUT" | sed -E 's/.*\(([^)]+)\).*/\1/')
fi

# Validate it looks like a project ID
if [[ ! "$CURRENT_PROJECT" =~ ^[a-zA-Z0-9-]+$ ]] || [ -z "$CURRENT_PROJECT" ]; then
  CURRENT_PROJECT="none"
fi

echo "Current Firebase project: $CURRENT_PROJECT"

if [ "$CURRENT_PROJECT" = "none" ] || [ -z "$CURRENT_PROJECT" ]; then
  echo -e "${RED}❌ No Firebase project selected.${NC}"
  echo "Available options:"
  echo "  - Run: firebase use staging"
  echo "  - Run: firebase use production"
  echo "  - Or: firebase use <project-id>"
  exit 1
fi

# Detect environment from project name
if [[ "$CURRENT_PROJECT" == *"staging"* ]] || [[ "$CURRENT_PROJECT" == *"stage"* ]] || [[ "$CURRENT_PROJECT" == *"test"* ]]; then
  ENV_TYPE="STAGING"
  ENV_COLOR="${YELLOW}"
else
  ENV_TYPE="PRODUCTION"
  ENV_COLOR="${RED}"
fi

echo -e "${ENV_COLOR}⚠️  Deploying to $ENV_TYPE environment: $CURRENT_PROJECT${NC}"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Deployment cancelled."
  exit 1
fi

# Step 2: Run tests
if [ "$SKIP_TESTS" = false ]; then
  echo ""
  echo -e "${YELLOW}Step 2: Running tests${NC}"
  
  if ! npm test; then
    echo -e "${RED}❌ Tests failed. Fix errors before deploying.${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}✅ All tests passed${NC}"
else
  echo -e "${YELLOW}⚠️  Skipping tests (--skip-tests flag)${NC}"
fi

# Step 3: Build
echo ""
echo -e "${YELLOW}Step 3: Building TypeScript${NC}"

rm -rf lib
if ! npm run build; then
  echo -e "${RED}❌ Build failed${NC}"
  exit 1
fi

if [ ! -d "lib" ] || [ -z "$(ls -A lib)" ]; then
  echo -e "${RED}❌ Build output is empty${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Build successful${NC}"

# Step 4: Deploy
if [ "$DRY_RUN" = true ]; then
  echo ""
  echo -e "${YELLOW}🔍 DRY RUN MODE - No actual deployment${NC}"
  echo "Would deploy:"
  echo "  - Firestore rules"
  echo "  - Firestore indexes"
  echo "  - Cloud Functions"
  exit 0
fi

echo ""
echo -e "${YELLOW}Step 4: Deploying to Firebase${NC}"

# Deploy security rules
echo "Deploying Firestore security rules..."
if firebase deploy --only firestore:rules; then
  echo -e "${GREEN}✅ Security rules deployed${NC}"
else
  echo -e "${RED}❌ Security rules deployment failed${NC}"
  exit 1
fi

# Deploy indexes
echo "Deploying Firestore indexes..."
if firebase deploy --only firestore:indexes; then
  echo -e "${GREEN}✅ Indexes deployed${NC}"
  echo -e "${YELLOW}⚠️  Note: Indexes may take time to build. Check Firebase Console for status.${NC}"
else
  echo -e "${RED}❌ Index deployment failed${NC}"
  exit 1
fi

# Deploy functions (optional - may fail if not properly configured)
echo "Deploying Cloud Functions..."
if firebase deploy --only functions; then
  echo -e "${GREEN}✅ Functions deployed${NC}"
else
  echo -e "${YELLOW}⚠️  Function deployment failed or skipped${NC}"
  echo -e "${YELLOW}   This is okay if functions are not yet configured.${NC}"
  echo -e "${YELLOW}   Rules and indexes are deployed successfully.${NC}"
  # Don't exit - rules and indexes are more critical
fi

# Step 5: Post-deployment verification
echo ""
echo -e "${YELLOW}Step 5: Post-deployment verification${NC}"

echo "Checking deployed functions..."
firebase functions:list

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Verify functions are running: firebase functions:log"
echo "  2. Test event ingestion with a test event"
echo "  3. Monitor for errors in Firebase Console"
echo "  4. Check Firestore indexes are building (may take time)"

