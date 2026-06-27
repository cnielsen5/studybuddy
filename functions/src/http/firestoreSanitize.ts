/** Firestore rejects undefined field values — strip them before writes. */
export function sanitizeForFirestore<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
