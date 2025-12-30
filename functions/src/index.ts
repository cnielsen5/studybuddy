/**
 * Firebase Cloud Functions Entry Point
 * 
 * Exports all Cloud Functions including:
 * - Event projector triggers
 * - HTTP callable functions
 * - Other triggers
 */

import * as admin from "firebase-admin";
import * as logger from "firebase-functions/logger";

// Initialize Admin SDK FIRST before any other operations
try {
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }
} catch (error) {
  // Admin might already be initialized - that's okay
  logger.warn("Admin SDK initialization note:", error);
}

// Export event projector trigger
export { onEventCreated } from "./triggers/eventProjectorTrigger";

// Export legacy triggers if they exist
// export * from "./pre.12.26.25 files/triggers";

// Export HTTP callable functions (if any)
// export * from "./application/...";

