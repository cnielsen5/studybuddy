# Test Scripts

Scripts for testing and verifying deployments.

## test-event-projection.ts

Tests that the event projector function works correctly by:
1. Creating a test `card_reviewed` event
2. Uploading it to Firestore
3. Waiting for the projector to process it
4. Verifying the views were created/updated

### Prerequisites

1. **Install Google Cloud SDK (if not already installed):**
   ```bash
   # macOS
   brew install google-cloud-sdk
   ```

2. **Authenticate with Google Cloud:**
   ```bash
   gcloud auth application-default login
   gcloud config set project socrates-staging-eedc4
   ```

   This will open a browser for authentication. After authenticating, the credentials will be stored locally.

3. **Verify authentication:**
   ```bash
   gcloud auth application-default print-access-token
   ```
   Should print an access token (not an error).

### Usage

**Option 1: Compile and run (recommended)**
```bash
npm run build
npm run test:projection
```

**Option 2: Using ts-node (if installed)**
```bash
npx ts-node scripts/test-event-projection.ts
```

### What it does

1. Creates a test event using `createCardReviewedEvent()`
2. Uploads it to: `users/test_user_123/libraries/test_lib_abc/events/{eventId}`
3. Waits 10 seconds for the function to process
4. Checks if views were created:
   - `users/test_user_123/libraries/test_lib_abc/views/card_schedule/card_test_001`
   - `users/test_user_123/libraries/test_lib_abc/views/card_perf/card_test_001`
5. Prints the results

### Expected Output

```
🧪 Testing Event Projection

Step 1: Creating test event...
   Event ID: evt_1234567890_abc123
   Event Type: card_reviewed

Step 2: Uploading event to Firestore...
   ✅ Event uploaded: users/test_user_123/libraries/test_lib_abc/events/evt_...

Step 3: Waiting for projector to process event...
   (Waiting 10 seconds for function to trigger and process)

Step 4: Verifying views were updated...
   ✅ CardScheduleView created/updated
      - State: 1
      - Due at: 2026-01-04T...
      - Last applied: evt_...
   ✅ CardPerformanceView created/updated
      - Total reviews: 1
      - Last applied: evt_...

✅ SUCCESS: Event was projected successfully!
```

### Troubleshooting

**"Permission denied" or "Could not load default credentials"**
- Run: `gcloud auth application-default login`
- Or set: `export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json`

**Views not created**
- Check function logs: `npx firebase functions:log --project socrates-staging-eedc4`
- The function may need more time (increase wait time in script)
- Verify the function is deployed and active

**"Cannot find module" errors**
- Make sure you've run `npm run build` first
- Or install ts-node: `npm install --save-dev ts-node`

