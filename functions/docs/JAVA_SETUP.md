# Java Setup for Firestore Emulator

The Firestore emulator requires Java to run. Here's how to install it on macOS.

## Quick Install (Recommended)

### Option 1: Using Homebrew (Easiest)

```bash
brew install openjdk@17
```

Then add to your PATH (add to `~/.zshrc` or `~/.bash_profile`):

```bash
export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"
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

# Install Java
sdk install java 17.0.9-tem
```

### Option 3: Download from Oracle/Adoptium

1. Visit: https://adoptium.net/
2. Download OpenJDK 17 for macOS
3. Install the `.pkg` file
4. Verify: `java -version`

## Verify Installation

After installing, verify Java is available:

```bash
java -version
```

You should see something like:
```
openjdk version "17.0.9" 2023-10-17
OpenJDK Runtime Environment (build 17.0.9+9)
OpenJDK 64-Bit Server VM (build 17.0.9+9, mixed mode, sharing)
```

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

**Issue**: "Wrong Java version"
- **Solution**: Firestore emulator needs Java 8 or higher. Java 17 is recommended.

