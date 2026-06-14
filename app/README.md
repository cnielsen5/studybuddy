# Socrates App

Vite + React UI for the Socrates study loop.

## Quick start

```bash
cd app
npm install
cp .env.example .env.local
# Fill in Firebase config from Firebase Console → socrates-staging-eedc4
npm run dev
```

Open http://localhost:5173

## Firebase setup (staging)

1. **Web app config** — Firebase Console → Project settings → Your apps → copy into `.env.local`

2. **Dev auth user** — from `functions/`:

```bash
npm run create-dev-user
```

Requires Email/Password auth enabled in Firebase Console.

3. Set in `.env.local`:
   - `VITE_USER_ID=user_dev_001` (must match auth UID)
   - `VITE_DEV_EMAIL=dev@socrates.local`
   - `VITE_DEV_PASSWORD=...`
   - `VITE_LIBRARY_ID=lib_learning_science_v1`

## Routes

| Path | Purpose |
|------|---------|
| `/` | Home — sign in, session info, navigation |
| `/study` | Study — review library cards, upload events |
| `/library` | Browse full content library by concept |
| `/concept-map` | Visual concept map with relationships |

## Content library

The app loads `public/libraries/learning-science-v1/library.json` (exported from `content/`).

Re-export after editing source:

```bash
cd content && node scripts/export-library.mjs learning-science-v1
```

## Architecture

```
src/
├── lib/
│   ├── firebase.ts         # Firebase init
│   ├── auth.tsx            # Auth context
│   ├── socratesClient.ts   # Browser Firestore client (events + views)
│   ├── libraryLoader.ts    # Fetch library.json
│   ├── libraryContext.tsx  # Library provider + study cards
│   └── libraryTypes.ts     # Bundle types + helpers
├── components/CardReview.tsx
└── pages/                  # Home, Study, Library, ConceptMap
```

## Study flow

1. Sign in on Home
2. Open Study → see card front (21 cards from Learning Science library)
3. Show answer → grade (Again / Hard / Good / Easy)
4. App uploads `card_reviewed` event to staging
5. After ~3s, reads updated schedule view from projector

## Scripts

```bash
npm run dev      # Dev server
npm run build    # Production build
npm run preview  # Preview production build
```
