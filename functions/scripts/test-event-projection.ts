/**
 * Test Script: Event Projection
 * 
 * This script:
 * 1. Creates a test event in Firestore
 * 2. Waits for the projector function to process it
 * 3. Verifies the views were updated correctly
 * 
 * Usage:
 *   npx ts-node scripts/test-event-projection.ts
 * 
 * Or compile first:
 *   npm run build
 *   node lib/scripts/test-event-projection.js
 */

import * as admin from "firebase-admin";
import { createCardReviewedEvent } from "../src/client/eventHelpers";
import {
  getCardScheduleViewPath,
  getCardPerformanceViewPath,
} from "../src/viewPaths";

// Initialize Firebase Admin
if (admin.apps.length === 0) {
  try {
    // Try to initialize with default credentials
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || "socrates-staging-eedc4",
    });
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin");
    console.error("\nTo fix this, run one of the following:");
    console.error("\nOption 1: Use gcloud (recommended for local testing)");
    console.error("  gcloud auth application-default login");
    console.error("  gcloud config set project socrates-staging-eedc4");
    console.error("\nOption 2: Use service account key");
    console.error("  export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json");
    console.error("\nOption 3: Use Firebase CLI authentication");
    console.error("  npx firebase login:ci");
    console.error("  Then set FIREBASE_TOKEN environment variable");
    throw error;
  }
}

// Get Firestore instance from Admin SDK (same as trigger uses)
const firestore = admin.firestore();

// Test configuration
const TEST_USER_ID = "user_test_123";
const TEST_LIBRARY_ID = "lib_test_abc";
const TEST_CARD_ID = "card_test_001";

async function testEventProjection() {
  console.log("🧪 Testing Event Projection\n");

  try {
    // 1. Create a test event
    console.log("Step 1: Creating test event...");
    const event = createCardReviewedEvent({
      userId: TEST_USER_ID,
      libraryId: TEST_LIBRARY_ID,
      cardId: TEST_CARD_ID,
      grade: "good",
      secondsSpent: 15,
      deviceId: "test-device",
    });

    console.log(`   Event ID: ${event.event_id}`);
    console.log(`   Event Type: ${event.type}`);

    // 2. Upload event to Firestore
    console.log("\nStep 2: Uploading event to Firestore...");
    const eventPath = `users/${TEST_USER_ID}/libraries/${TEST_LIBRARY_ID}/events/${event.event_id}`;
    const eventDocRef = firestore.doc(eventPath);

    // Check if event already exists (idempotency)
    const existing = await eventDocRef.get();
    if (existing.exists) {
      console.log("   ⚠️  Event already exists (idempotent)");
    } else {
      await eventDocRef.set(event);
      console.log(`   ✅ Event uploaded: ${eventPath}`);
    }

    // 3. Wait for function to process (give it time)
    console.log("\nStep 3: Waiting for projector to process event...");
    console.log("   (Waiting 15 seconds for function to trigger and process)");
    console.log("   (Cloud Functions can take 5-10 seconds to trigger)");
    await new Promise((resolve) => setTimeout(resolve, 15000));

    // 4. Check if views were created/updated
    console.log("\nStep 4: Verifying views were updated...");

    const scheduleViewPath = getCardScheduleViewPath(TEST_USER_ID, TEST_LIBRARY_ID, TEST_CARD_ID);
    const perfViewPath = getCardPerformanceViewPath(TEST_USER_ID, TEST_LIBRARY_ID, TEST_CARD_ID);

    console.log(`   Checking: ${scheduleViewPath}`);
    console.log(`   Checking: ${perfViewPath}`);

    const scheduleViewRef = firestore.doc(scheduleViewPath);
    const perfViewRef = firestore.doc(perfViewPath);

    // Also check the event was actually created
    console.log("\nStep 4b: Verifying event was created...");
    const eventDoc = await eventDocRef.get();
    if (eventDoc.exists) {
      console.log(`   ✅ Event document exists`);
      const eventData = eventDoc.data();
      console.log(`   - Event type: ${eventData?.type}`);
      console.log(`   - Event ID: ${eventData?.event_id}`);
    } else {
      console.log(`   ❌ Event document does NOT exist - projection won't happen`);
    }

    console.log("\nStep 4c: Checking views...");
    const [scheduleView, perfView] = await Promise.all([
      scheduleViewRef.get(),
      perfViewRef.get(),
    ]);

    // Also try to query the views collection directly to see what's there
    console.log("\nStep 4d: Listing all documents in views collection...");
    try {
      const viewsCollectionRef = firestore
        .collection("users")
        .doc(TEST_USER_ID)
        .collection("libraries")
        .doc(TEST_LIBRARY_ID)
        .collection("views");
      const viewsSnapshot = await viewsCollectionRef.limit(10).get();
      console.log(`   Found ${viewsSnapshot.size} document(s) in views collection`);
      viewsSnapshot.docs.forEach((doc) => {
        console.log(`   - ${doc.id} (type: ${doc.data()?.type || "unknown"})`);
      });
    } catch (err: any) {
      console.log(`   ⚠️  Could not list views collection: ${err.message}`);
    }

    if (scheduleView.exists) {
      const data = scheduleView.data();
      console.log("   ✅ CardScheduleView created/updated");
      console.log(`      - State: ${data?.state}`);
      console.log(`      - Due at: ${data?.due_at}`);
      console.log(`      - Last applied: ${data?.last_applied?.event_id}`);
      console.log(`      - Last applied at: ${data?.last_applied?.applied_at}`);
    } else {
      console.log("   ❌ CardScheduleView not found");
    }

    if (perfView.exists) {
      const data = perfView.data();
      console.log("   ✅ CardPerformanceView created/updated");
      console.log(`      - Total reviews: ${data?.total_reviews}`);
      console.log(`      - Last applied: ${data?.last_applied?.event_id}`);
      console.log(`      - Last applied at: ${data?.last_applied?.applied_at}`);
    } else {
      console.log("   ❌ CardPerformanceView not found");
    }

    // 5. Check function logs
    console.log("\nStep 5: Checking function execution...");
    console.log("   Run this to see function logs:");
    console.log(`   npx firebase functions:log --project socrates-staging-eedc4 --only onEventCreated`);

    // Summary
    console.log("\n" + "=".repeat(60));
    if (scheduleView.exists && perfView.exists) {
      console.log("✅ SUCCESS: Event was projected successfully!");
      console.log("\nViews created:");
      console.log(`  - ${scheduleViewPath}`);
      console.log(`  - ${perfViewPath}`);
    } else {
      console.log("⚠️  PARTIAL: Some views may not have been created yet.");
      console.log("   The function may still be processing. Check logs:");
      console.log("   npx firebase functions:log --project socrates-staging-eedc4");
    }
    console.log("=".repeat(60));

  } catch (error: any) {
    console.error("\n❌ Error during test");
    
    if (error?.code === 7 || error?.message?.includes("credentials") || error?.message?.includes("Could not load")) {
      console.error("\n🔐 Authentication Required");
      console.error("\nRun this command to authenticate:");
      console.error("  gcloud auth application-default login");
      console.error("  gcloud config set project socrates-staging-eedc4");
      console.error("\nThen run the test again:");
      console.error("  npm run test:projection");
    } else {
      console.error("   Error:", error?.message || error);
      if (error?.stack) {
        console.error("   Stack:", error.stack);
      }
    }
    process.exit(1);
  }
}

// Run the test
testEventProjection()
  .then(() => {
    console.log("\n✅ Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });

