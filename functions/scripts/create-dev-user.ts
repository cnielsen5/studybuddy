/**
 * Create the dev Firebase Auth user for the Socrates web app.
 *
 * Prerequisites:
 *   1. Firebase Console → Authentication → Get started
 *   2. Sign-in method → Email/Password → Enable
 *   3. gcloud auth application-default login
 *   4. gcloud auth application-default set-quota-project socrates-staging-eedc4
 *
 * Usage (from functions/):
 *   nvm use 20
 *   npm run build
 *   node lib/scripts/create-dev-user.js
 */

import * as admin from "firebase-admin";

const PROJECT_ID = "socrates-staging-eedc4";
const UID = process.env.DEV_USER_ID ?? "user_dev_001";
const EMAIL = process.env.DEV_USER_EMAIL ?? "dev@socrates.local";
const PASSWORD = process.env.DEV_USER_PASSWORD ?? "password";

async function main() {
  if (!admin.apps.length) {
    admin.initializeApp({ projectId: PROJECT_ID });
  }

  try {
    const existing = await admin.auth().getUser(UID);
    console.log(`✅ User already exists: ${existing.uid} (${existing.email})`);
    return;
  } catch (err: unknown) {
    const code = (err as { code?: string }).code;
    if (code !== "auth/user-not-found") throw err;
  }

  const user = await admin.auth().createUser({
    uid: UID,
    email: EMAIL,
    password: PASSWORD,
    emailVerified: true,
  });

  console.log(`✅ Created user: ${user.uid} (${user.email})`);
  console.log("\nAdd to app/.env.local:");
  console.log(`VITE_DEV_EMAIL=${EMAIL}`);
  console.log(`VITE_DEV_PASSWORD=${PASSWORD}`);
  console.log(`VITE_USER_ID=${UID}`);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  const code = (err as { code?: string }).code;

  console.error("\n❌ Failed to create dev user\n");

  if (code === "auth/configuration-not-found") {
    console.error("Firebase Authentication is not enabled yet.");
    console.error("Fix:");
    console.error("  1. Open https://console.firebase.google.com/project/socrates-staging-eedc4/authentication");
    console.error("  2. Click Get started");
    console.error("  3. Sign-in method → Email/Password → Enable → Save");
    console.error("  4. Re-run: node lib/scripts/create-dev-user.js");
  } else {
    console.error(message);
  }

  process.exit(1);
});
