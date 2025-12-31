#!/bin/bash
# Staging Environment Setup Script
# This script helps set up a staging Firebase project

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🔧 Setting Up Staging Environment${NC}"
echo ""

# Check if .firebaserc exists
if [ -f ".firebaserc" ]; then
  echo -e "${YELLOW}⚠️  .firebaserc already exists${NC}"
  read -p "Overwrite? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Skipping .firebaserc creation"
  else
    rm .firebaserc
  fi
fi

# Get project IDs
echo "Enter your Firebase project IDs:"
read -p "Staging project ID: " STAGING_PROJECT
read -p "Production project ID (optional): " PROD_PROJECT

if [ -z "$STAGING_PROJECT" ]; then
  echo -e "${RED}❌ Staging project ID is required${NC}"
  exit 1
fi

# Create .firebaserc
cat > .firebaserc << EOF
{
  "projects": {
    "default": "$STAGING_PROJECT",
    "staging": "$STAGING_PROJECT"$([ -n "$PROD_PROJECT" ] && echo ",\n    \"production\": \"$PROD_PROJECT\"" || echo "")
  }
}
EOF

echo -e "${GREEN}✅ Created .firebaserc${NC}"

# Verify Firebase login
echo ""
echo "Verifying Firebase login..."
if ! firebase projects:list &> /dev/null; then
  echo -e "${RED}❌ Not logged into Firebase${NC}"
  echo "Run: firebase login"
  exit 1
fi

# Check if staging project exists
echo ""
echo "Checking if staging project exists..."
if firebase projects:list | grep -q "$STAGING_PROJECT"; then
  echo -e "${GREEN}✅ Staging project found${NC}"
else
  echo -e "${YELLOW}⚠️  Staging project not found in your Firebase projects${NC}"
  echo "Create it at: https://console.firebase.google.com/"
  read -p "Continue anyway? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Set staging as default
echo ""
echo "Setting staging as default project..."
firebase use staging

# Verify
CURRENT=$(firebase use 2>&1 | grep -oP '(?<=Using )\S+' || echo "none")
if [ "$CURRENT" = "$STAGING_PROJECT" ]; then
  echo -e "${GREEN}✅ Staging project is now default${NC}"
else
  echo -e "${YELLOW}⚠️  Could not set staging as default. Current: $CURRENT${NC}"
fi

echo ""
echo -e "${GREEN}✅ Staging setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Enable Firestore in Firebase Console"
echo "  2. Enable Cloud Functions in Firebase Console"
echo "  3. Set up billing (Blaze plan required)"
echo "  4. Deploy: npm run deploy:staging"

