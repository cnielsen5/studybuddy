import { FirebaseError } from "firebase/app";

/** Extract a human-readable message from a Cloud Function callable error. */
export function formatCallableError(err: unknown): string {
  if (err instanceof FirebaseError) {
    const msg = err.message?.trim();
    if (msg && msg !== "internal" && !msg.startsWith("functions/")) {
      return msg;
    }
    const custom = (err as FirebaseError & { customData?: { message?: string } })
      .customData?.message;
    if (custom?.trim()) return custom.trim();
  }
  if (err instanceof Error && err.message.trim()) {
    return err.message;
  }
  return "Library generation failed. Please try again.";
}
