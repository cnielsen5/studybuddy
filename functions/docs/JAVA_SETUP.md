# Java Setup for Firestore Emulator

The Firestore emulator requires Java 21 or above to run. Here's how to install it on macOS.

## Quick Install (Recommended)

### Option 1: Using Homebrew (Easiest)

```bash
brew install openjdk@21
```

Then add to your PATH (add to `~/.zshrc` or `~/.bash_profile`):

```bash
export PATH="/opt/homebrew/opt/openjdk@21/bin:$PATH"
```

Reload your shell:
```bash
source ~/.zshrc  # or ~/.bash_profile
```

### Option 2: Using SDKMAN (Alternative)

```bash
# Install SDKMAN
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# Install Java 21
sdk install java 21.0.1-tem
```

### Option 3: Download from Oracle/Adoptium

1. Visit: https://adoptium.net/
2. Download OpenJDK 21 (LTS) for macOS
3. Install the `.pkg` file
4. Verify: `java -version`

## Verify Installation

After installing, verify Java is available:

```bash
java -version
```

You should see something like:
```
openjdk version "21.0.1" 2024-10-15
OpenJDK Runtime Environment (build 21.0.1+12)
OpenJDK 64-Bit Server VM (build 21.0.1+12, mixed mode, sharing)
```

**Important**: Firebase now requires Java 21 or above. Java 17 and below will not work.

## Alternative: Skip Emulator Tests

If you don't want to install Java right now, you can:

1. **Skip the rules tests** - They're optional integration tests
2. **Use the programmatic tests** - `tests/integration/securityRules.test.ts` doesn't require Java
3. **Test rules manually** - Deploy to a test project and verify manually

## After Installing Java

Once Java is installed, try running the tests again:

```bash
npm run test:rules
```

## Troubleshooting

**Issue**: "Java not found" even after installing
- **Solution**: Make sure Java is in your PATH. Check with `which java`
- **Solution**: Restart your terminal after installing

**Issue**: "Wrong Java version" or "firebase-tools no longer supports Java version before 21"
- **Solution**: Firebase now requires Java 21 or above. Install Java 21 using one of the methods above.
- **Check version**: `java -version` should show version 21 or higher

