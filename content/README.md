# Socrates Content

Authoritative learning content lives here as TypeScript bundles, exported to JSON for the app.

## Libraries

| Library | ID | Path |
|---------|-----|------|
| Learning Science & Socrates | `lib_learning_science_v1` | `libraries/learning-science-v1/` |

## Workflow

1. Edit source files in `libraries/<name>/` (`concepts.ts`, `relationships.ts`, `cards.ts`, `questions.ts`)
2. Export JSON:

```bash
cd content && node scripts/export-library.mjs learning-science-v1
```

3. Validate invariants:

```bash
cd functions && npm test -- tests/content/learning-science-v1.library.test.ts
```

4. Point the app at the library (`app/.env.local`):

```
VITE_LIBRARY_ID=lib_learning_science_v1
```

See [LIBRARY_FORMAT.md](./LIBRARY_FORMAT.md) for the bundle schema.
