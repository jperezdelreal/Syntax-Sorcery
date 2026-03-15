#!/bin/bash
# setup-github-token.sh — Configure GitHub CLI authentication on Azure VM
# Part of Phase 10.3: GitHub Token Provisioning for Autonomous Operations
#
# Usage:
#   ./setup-github-token.sh <token>              # Pass token as argument
#   echo "<token>" | ./setup-github-token.sh     # Read from stdin
#   GH_TOKEN=<token> ./setup-github-token.sh     # Read from environment
#
# What this does:
#   1. Securely receives GitHub PAT
#   2. Configures gh auth with token
#   3. Verifies authentication and scopes
#   4. Sets up GH_TOKEN in environment for all tmux sessions
#   5. Persists token to /etc/environment for system-wide access

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get token from argument, stdin, or environment
TOKEN=""

if [ $# -eq 1 ]; then
    TOKEN="$1"
    log_info "Token received via argument"
elif [ ! -t 0 ]; then
    # stdin is not a terminal (piped input)
    TOKEN=$(cat)
    log_info "Token received via stdin"
elif [ -n "${GH_TOKEN:-}" ]; then
    TOKEN="$GH_TOKEN"
    log_info "Token received from GH_TOKEN environment variable"
else
    log_error "No token provided. Use one of:"
    log_error "  ./setup-github-token.sh <token>"
    log_error "  echo '<token>' | ./setup-github-token.sh"
    log_error "  GH_TOKEN='<token>' ./setup-github-token.sh"
    exit 1
fi

# Validate token format (ghp_* or github_pat_*)
if [[ ! "$TOKEN" =~ ^(ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})$ ]]; then
    log_error "Invalid token format. Expected 'ghp_*' (classic) or 'github_pat_*' (fine-grained)"
    exit 1
fi

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    log_error "GitHub CLI (gh) is not installed. Install it first:"
    log_error "  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg"
    log_error "  echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main' | sudo tee /etc/apt/sources.list.d/github-cli.list"
    log_error "  sudo apt update && sudo apt install gh"
    exit 1
fi

log_info "Configuring GitHub CLI authentication..."

# Authenticate with gh
echo "$TOKEN" | gh auth login --with-token

if [ $? -eq 0 ]; then
    log_info "✅ GitHub CLI authentication successful"
else
    log_error "Failed to authenticate with GitHub CLI"
    exit 1
fi

# Verify authentication
log_info "Verifying authentication status..."
if gh auth status; then
    log_info "✅ GitHub authentication verified"
else
    log_error "Authentication verification failed"
    exit 1
fi

# Set up environment variable for all sessions
log_info "Setting up GH_TOKEN environment variable..."

# Add to /etc/environment for system-wide access (requires sudo)
if [ "$EUID" -eq 0 ] || sudo -n true 2>/dev/null; then
    # Running as root or passwordless sudo available
    if grep -q "^GH_TOKEN=" /etc/environment 2>/dev/null; then
        # Update existing entry
        sudo sed -i "s|^GH_TOKEN=.*|GH_TOKEN=$TOKEN|" /etc/environment
        log_info "Updated GH_TOKEN in /etc/environment"
    else
        # Add new entry
        echo "GH_TOKEN=$TOKEN" | sudo tee -a /etc/environment > /dev/null
        log_info "Added GH_TOKEN to /etc/environment"
    fi
else
    log_warn "Cannot write to /etc/environment (requires sudo). Adding to ~/.bashrc instead"
fi

# Add to ~/.bashrc for current user
BASHRC="$HOME/.bashrc"
if ! grep -q "export GH_TOKEN=" "$BASHRC" 2>/dev/null; then
    echo "" >> "$BASHRC"
    echo "# GitHub Personal Access Token (added by setup-github-token.sh)" >> "$BASHRC"
    echo "export GH_TOKEN=$TOKEN" >> "$BASHRC"
    log_info "Added GH_TOKEN to ~/.bashrc"
else
    # Update existing entry
    sed -i "s|^export GH_TOKEN=.*|export GH_TOKEN=$TOKEN|" "$BASHRC"
    log_info "Updated GH_TOKEN in ~/.bashrc"
fi

# Set in current session
export GH_TOKEN="$TOKEN"

# If tmux is running, update all tmux sessions
if command -v tmux &> /dev/null && tmux list-sessions &> /dev/null; then
    log_info "Updating GH_TOKEN in all tmux sessions..."
    tmux setenv -g GH_TOKEN "$TOKEN"
    log_info "✅ GH_TOKEN set in all tmux sessions"
fi

log_info ""
log_info "════════════════════════════════════════════════════════"
log_info "✅ GitHub token setup complete!"
log_info "════════════════════════════════════════════════════════"
log_info ""
log_info "Token is now available via:"
log_info "  - gh CLI (authenticated)"
log_info "  - \$GH_TOKEN environment variable"
log_info "  - All tmux sessions (if running)"
log_info ""
log_info "Verify with: gh auth status"
log_info "Check scopes with: scripts/verify-github-token.sh"
log_info ""
log_info "⚠️  SECURITY NOTE:"
log_info "  - Token stored in ~/.config/gh/hosts.yml"
log_info "  - Token stored in /etc/environment (system-wide)"
log_info "  - Token stored in ~/.bashrc"
log_info "  - Ensure proper file permissions (chmod 600)"
log_info ""
