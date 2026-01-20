# Node.js Version Setup

This project uses **Node.js 20.x** to match the Firebase Functions runtime.

## Quick Setup

### 1. Install Node 20 using nvm

```bash
# Install Node 20 (LTS)
nvm install 20

# Use Node 20 for this project
nvm use 20

# Set as default (optional)
nvm alias default 20
```

### 2. Verify Installation

```bash
node -v   # Should show v20.x.x
npm -v    # Should show 10.x.x (comes with Node 20)
```

### 3. Auto-switch with .nvmrc

This project includes a `.nvmrc` file. When you `cd` into the project directory, run:

```bash
nvm use
```

Or add this to your `~/.zshrc` (or `~/.bash_profile`) to auto-switch:

```bash
# Auto-switch Node version when entering directory with .nvmrc
autoload -U add-zsh-hook
load-nvmrc() {
  local node_version="$(nvm version)"
  local nvmrc_path="$(nvm_find_nvmrc)"

  if [ -n "$nvmrc_path" ]; then
    local nvmrc_node_version=$(nvm version "$(cat "${nvmrc_path}")")

    if [ "$nvmrc_node_version" = "N/A" ]; then
      nvm install
    elif [ "$nvmrc_node_version" != "$node_version" ]; then
      nvm use
    fi
  elif [ "$node_version" != "$(nvm version default)" ]; then
    echo "Reverting to nvm default version"
    nvm use default
  fi
}
add-zsh-hook chpwd load-nvmrc
load-nvmrc
```

## Why Node 20?

- **Firebase Functions runtime**: Uses Node.js 20
- **Consistency**: Local and deployed environments match
- **npm compatibility**: Node 20 comes with npm 10.x, which is compatible

## Troubleshooting

**Issue**: `nvm: command not found`
- **Solution**: Make sure nvm is loaded in your shell. Add to `~/.zshrc`:
  ```bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  ```

**Issue**: Wrong npm version
- **Solution**: npm comes bundled with Node. Reinstall Node 20:
  ```bash
  nvm uninstall 20
  nvm install 20
  ```

**Issue**: `package-lock.json` out of sync
- **Solution**: After switching to Node 20, regenerate the lock file:
  ```bash
  nvm use 20
  rm package-lock.json
  npm install
  ```

## Verify Before Deployment

Before deploying, always verify:

```bash
node -v    # Should be v20.x.x
npm -v     # Should be 10.x.x
npm run build  # Should succeed
```

