# Installation Notes - Firestore Rules Testing

## Warnings Analysis

### ✅ Safe to Ignore (Peer Dependency Warnings)

The peer dependency warnings are **non-blocking** and won't prevent tests from running:

1. **`@google-cloud/firestore` version mismatch**
   - You have: `8.0.0`
   - Genkit wants: `^7.11.0`
   - **Impact**: None - these are separate concerns (server SDK vs client SDK)
   - **Action**: None needed

2. **`firebase` version mismatch**
   - Rules testing brings in: `firebase@10.14.1`
   - Genkit wants: `>=11.5.0`
   - **Impact**: None - rules testing doesn't use genkit
   - **Action**: None needed

### ⚠️ Node Version Warning (Minor)

**Warning**: `superstatic@9.2.0` requires Node 18/20/22, but you have Node 24.

- **Impact**: `firebase-tools` may show warnings, but should still work
- **Action**: 
  - If you encounter issues, consider using Node 22 via `nvm`
  - Otherwise, proceed - the emulator should still function

### 🔒 Security Vulnerabilities

**11 vulnerabilities** (10 moderate, 1 high) in dev dependencies.

- **Impact**: Low risk for dev dependencies (not in production)
- **Action**: 
  ```bash
  npm audit fix
  ```
  If that doesn't resolve all, review with:
  ```bash
  npm audit
  ```

## Verification

To verify everything works:

```bash
# Test that the packages are installed
npm list @firebase/rules-unit-testing firebase-tools

# Try running the tests (they'll start the emulator automatically)
npm run test:rules
```

## If You Encounter Issues

### Issue: Node version incompatibility

If `firebase-tools` fails due to Node 24:

```bash
# Use Node 22 (if you have nvm)
nvm install 22
nvm use 22
npm install
```

### Issue: Peer dependency conflicts

If tests fail due to missing `firebase` package:

```bash
npm install --save-dev firebase@^10.0.0
```

This ensures `@firebase/rules-unit-testing` has its required peer dependency.

## Summary

✅ **Packages installed successfully**
✅ **Warnings are non-blocking**
⚠️ **Node version warning is minor** (proceed unless issues occur)
🔒 **Run `npm audit fix`** to address vulnerabilities

The setup should work as-is. Try running the tests to verify!

