import { HttpsError, type CallableRequest } from "firebase-functions/v2/https";

const AUTH_ERROR = "The request must be authenticated.";

export function requireAuth(request: CallableRequest): string {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", AUTH_ERROR);
  }
  return request.auth.uid;
}
