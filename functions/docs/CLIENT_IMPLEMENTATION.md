# Client Implementation Guide

## Overview

This guide explains how to implement the client-side SDK in your actual application. The code in `src/client/` uses server-side Firestore types for documentation, but you'll need to adapt it for the Firebase Client SDK.

## Setup

### 1. Install Firebase Client SDK

```bash
npm install firebase
```

### 2. Initialize Firebase

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... other config
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
```

## Adapting the Client Code

### Replace Firestore Types

In `src/client/viewClient.ts` and `src/client/eventUpload.ts`, replace:

```typescript
// Server SDK (current)
import { Firestore } from "@google-cloud/firestore";

// Client SDK (use this instead)
import { Firestore } from "firebase/firestore";
```

### Update Firestore API Calls

The Firebase Client SDK has slightly different APIs:

#### Reading Documents

```typescript
// Server SDK (current)
const doc = await firestore.doc(path).get();
if (doc.exists) {
  return doc.data();
}

// Client SDK (use this)
import { doc, getDoc } from 'firebase/firestore';
const docRef = doc(firestore, path);
const docSnap = await getDoc(docRef);
if (docSnap.exists()) {
  return docSnap.data();
}
```

#### Writing Documents

```typescript
// Server SDK (current)
await firestore.doc(path).set(data);

// Client SDK (use this)
import { doc, setDoc } from 'firebase/firestore';
const docRef = doc(firestore, path);
await setDoc(docRef, data);
```

#### Querying Collections

```typescript
// Server SDK (current)
const snapshot = await firestore
  .collection(path)
  .where("due_at", "<=", now)
  .orderBy("due_at", "asc")
  .limit(limit)
  .get();

// Client SDK (use this)
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
const q = query(
  collection(firestore, path),
  where("due_at", "<=", now),
  orderBy("due_at", "asc"),
  limit(limit)
);
const snapshot = await getDocs(q);
```

#### Batch Operations

```typescript
// Server SDK (current)
const batch = firestore.batch();
batch.set(ref, data);
await batch.commit();

// Client SDK (use this)
import { writeBatch } from 'firebase/firestore';
const batch = writeBatch(firestore);
batch.set(ref, data);
await batch.commit();
```

#### getAll (Batch Read)

```typescript
// Server SDK (current)
const docs = await firestore.getAll(...refs);

// Client SDK (use this)
import { getDocs } from 'firebase/firestore';
// Note: Client SDK doesn't have getAll, use Promise.all instead
const docs = await Promise.all(refs.map(ref => getDoc(ref)));
```

## Complete Adapted Example

Here's how `getDueCards` would look with the client SDK:

```typescript
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';

export async function getDueCards(
  firestore: Firestore,
  userId: string,
  libraryId: string,
  limitCount: number = 50
): Promise<CardScheduleView[]> {
  const now = new Date().toISOString();
  const viewsPath = `users/${userId}/libraries/${libraryId}/views/card_schedule`;

  const q = query(
    collection(firestore, viewsPath),
    where("due_at", "<=", now),
    orderBy("due_at", "asc"),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as CardScheduleView);
}
```

## Real-Time Listeners

The client SDK supports real-time listeners:

```typescript
import { doc, onSnapshot } from 'firebase/firestore';

// Listen to card schedule updates
const schedulePath = `users/user_123/libraries/lib_abc/views/card_schedule/card_0001`;
const unsubscribe = onSnapshot(doc(firestore, schedulePath), (snapshot) => {
  if (snapshot.exists()) {
    const schedule = snapshot.data() as CardScheduleView;
    console.log('Schedule updated:', schedule);
    // Update UI
  }
});

// Later, unsubscribe
unsubscribe();
```

## Security Rules

Make sure your Firestore security rules allow:

1. **Event Creation**: Users can only create events in their own path
2. **View Reading**: Users can only read their own views
3. **Event Immutability**: Events cannot be updated or deleted

Example rules:

```javascript
match /users/{userId}/libraries/{libraryId}/events/{eventId} {
  allow create: if request.auth != null && request.auth.uid == userId;
  allow read: if request.auth != null && request.auth.uid == userId;
  allow update, delete: if false; // Events are immutable
}

match /users/{userId}/libraries/{libraryId}/views/{document=**} {
  allow read: if request.auth != null && request.auth.uid == userId;
  allow write: if false; // Views are write-only by projector
}
```

## Testing

For testing, you can use the Firebase Emulator Suite:

```bash
npm install -g firebase-tools
firebase init emulators
firebase emulators:start
```

Then configure your app to use the emulator:

```typescript
import { connectFirestoreEmulator } from 'firebase/firestore';

if (process.env.NODE_ENV === 'development') {
  connectFirestoreEmulator(firestore, 'localhost', 8080);
}
```

## Next Steps

1. **Create a React/Vue/etc. wrapper**: Wrap the client SDK in your framework
2. **Add offline support**: Use Firestore offline persistence
3. **Add optimistic updates**: Update UI immediately, sync later
4. **Add error handling**: Retry failed uploads
5. **Add analytics**: Track event upload success/failure rates

