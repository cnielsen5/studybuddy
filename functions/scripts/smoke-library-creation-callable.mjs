#!/usr/bin/env node
/**
 * Smoke test generateLibraryPreview on staging (REST only — no firebase client SDK).
 *
 * Prerequisites:
 *   gcloud auth application-default login
 *   gcloud auth application-default set-quota-project socrates-staging-eedc4
 *   FIREBASE_WEB_API_KEY in env
 */
import { createRequire } from "node:module";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const admin = require("firebase-admin");

const functionsDir = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadApiKeyFromAppEnv() {
  const envPath = join(functionsDir, "../app/.env.local");
  if (!existsSync(envPath)) return undefined;
  const match = readFileSync(envPath, "utf8").match(/^VITE_FIREBASE_API_KEY=(.+)$/m);
  return match?.[1]?.trim();
}

const PROJECT_ID = "socrates-staging-eedc4";
const REGION = "us-central1";
const UID = process.env.DEV_USER_ID ?? "user_dev_001";
const API_KEY =
  process.env.FIREBASE_WEB_API_KEY ??
  process.env.VITE_FIREBASE_API_KEY ??
  loadApiKeyFromAppEnv();

if (!API_KEY) {
  console.error("Set FIREBASE_WEB_API_KEY or VITE_FIREBASE_API_KEY");
  process.exit(1);
}

const jobId = `lc_${Date.now().toString(36)}smoke`;
const intent = {
  domain: "Orthopaedic Surgery",
  purposeStatement: "Board prep smoke test",
  audience: {
    level: "professional",
    priorKnowledge: [],
    targetDepth: "mastery",
    resolutionRange: { min: 1, max: 5 },
  },
  purpose: "exam_prep",
  scopeBoundaries: [],
  externalAugmentationAllowed: true,
  similarityThreshold: 0.9,
  libraryTitle: "Staging Smoke Test",
  curriculumLensId: "lens_abos_orthopaedic_2025",
};

const sourceText = `# Osteoarthritis
## Definition
Osteoarthritis is degeneration of articular cartilage with subchondral bone changes.

## Treatment
- Nonoperative management includes physical therapy and NSAIDs.
- Total knee arthroplasty replaces the joint when conservative care fails.

# Hip Fractures
## Classification
Femoral neck fractures are classified by Garden type.
## Management
Surgical fixation or arthroplasty depends on displacement and patient factors.`;

async function signInWithCustomToken(customToken) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    }
  );
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error?.message ?? `Auth failed (${res.status})`);
  }
  return body.idToken;
}

async function callGenerateLibraryPreview(idToken) {
  const url = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/generateLibraryPreview`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      data: {
        jobId,
        intent,
        sourceText,
        sourceConfiguration: { uploads: [], webUrls: [], selectedCatalogIds: [] },
      },
    }),
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body.error?.message ?? JSON.stringify(body));
  }
  if (body.error) {
    throw new Error(body.error.message ?? JSON.stringify(body.error));
  }
  return body.result;
}

async function main() {
  if (!admin.apps.length) {
    admin.initializeApp({ projectId: PROJECT_ID });
  }

  const customToken = await admin.auth().createCustomToken(UID);
  const idToken = await signInWithCustomToken(customToken);

  console.log(`Calling generateLibraryPreview as ${UID}, job ${jobId}…`);
  const started = Date.now();
  const data = await callGenerateLibraryPreview(idToken);

  console.log(`✅ Done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  console.log(`   concepts: ${data.review?.summary?.conceptCount ?? "?"}`);
  console.log(`   flags: ${data.review?.flags?.length ?? "?"}`);
  console.log(`   pipelineJobId: ${data.pipelineJobId}`);

  const jobSnap = await admin
    .firestore()
    .doc(`users/${UID}/libraryCreationJobs/${jobId}`)
    .get();
  const job = jobSnap.data();
  console.log(`   Firestore status: ${job?.status}`);
  console.log(`   progress steps: ${job?.progress?.length ?? 0}`);

  if (job?.status !== "complete") {
    throw new Error(`Expected job status complete, got ${job?.status}`);
  }
}

main().catch((err) => {
  console.error("❌ Smoke test failed:", err.message ?? err);
  process.exit(1);
});
