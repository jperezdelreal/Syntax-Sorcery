#!/bin/bash
# verify-github-token.sh — Verify GitHub token validity and scopes
# Part of Phase 10.3: GitHub Token Provisioning for Autonomous Operations
#
# Usage:
#   ./verify-github-token.sh              # Verify currently authenticated token
#   ./verify-github-token.sh <token>      # Verify specific token
#
# Checks:
#   1. Token authentication status
#   2. Token scopes (must include 'repo')
#   3. Rate limit status
#   4. User/organization access
#   5. Token expiration (if applicable)

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_header() {
    echo -e "${BLUE}[CHECK]${NC} $1"
}

# Check if gh is installed
if ! command -v gh &> /dev/null; then
    log_error "GitHub CLI (gh) is not installed"
    exit 1
fi

# If token provided as argument, use it temporarily
if [ $# -eq 1 ]; then
    TOKEN="$1"
    log_info "Verifying provided token..."
    export GH_TOKEN="$TOKEN"
else
    log_info "Verifying currently authenticated token..."
fi

echo ""
log_header "1. Authentication Status"
echo "───────────────────────────────────────────────"

if gh auth status 2>&1; then
    log_info "✅ GitHub CLI is authenticated"
else
    log_error "❌ GitHub CLI is not authenticated"
    log_error "Run: ./setup-github-token.sh <token>"
    exit 1
fi

echo ""
log_header "2. Token Scopes"
echo "───────────────────────────────────────────────"

# Get token info via GitHub API
TOKEN_INFO=$(gh api user -i 2>&1 || echo "FAILED")

if [[ "$TOKEN_INFO" == "FAILED" ]]; then
    log_error "❌ Failed to query GitHub API"
    exit 1
fi

# Extract scopes from X-OAuth-Scopes header
SCOPES=$(echo "$TOKEN_INFO" | grep -i "x-oauth-scopes:" | cut -d':' -f2 | tr -d '\r' | xargs)

if [ -z "$SCOPES" ]; then
    log_warn "⚠️  Could not determine token scopes (might be fine-grained token)"
    
    # For fine-grained tokens, check permissions directly
    PERMISSIONS=$(gh api user -q '.permissions' 2>/dev/null || echo "{}")
    
    if [[ "$PERMISSIONS" != "{}" ]]; then
        log_info "Fine-grained token detected. Checking repository permissions..."
        # Fine-grained tokens don't use traditional scopes
        log_info "Token appears valid for fine-grained access"
    fi
else
    log_info "Token scopes: $SCOPES"
    
    # Check for 'repo' scope (required for full repository access)
    if [[ "$SCOPES" == *"repo"* ]]; then
        log_info "✅ 'repo' scope present (full repository access)"
    else
        log_error "❌ 'repo' scope MISSING"
        log_error "Required for: commits, PRs, issues, code management"
        log_error "Create a new token with 'repo' scope"
        exit 1
    fi
    
    # Check for other useful scopes
    if [[ "$SCOPES" == *"workflow"* ]]; then
        log_info "✅ 'workflow' scope present (GitHub Actions access)"
    fi
    
    if [[ "$SCOPES" == *"admin:org"* ]]; then
        log_info "✅ 'admin:org' scope present (organization management)"
    fi
fi

echo ""
log_header "3. User Information"
echo "───────────────────────────────────────────────"

USER_INFO=$(gh api user)
USERNAME=$(echo "$USER_INFO" | jq -r '.login')
USER_TYPE=$(echo "$USER_INFO" | jq -r '.type')

log_info "Username: $USERNAME"
log_info "Account type: $USER_TYPE"

echo ""
log_header "4. Rate Limit Status"
echo "───────────────────────────────────────────────"

RATE_LIMIT=$(gh api rate_limit)
CORE_LIMIT=$(echo "$RATE_LIMIT" | jq -r '.rate.limit')
CORE_REMAINING=$(echo "$RATE_LIMIT" | jq -r '.rate.remaining')
CORE_RESET=$(echo "$RATE_LIMIT" | jq -r '.rate.reset')
RESET_TIME=$(date -d "@$CORE_RESET" 2>/dev/null || date -r "$CORE_RESET" 2>/dev/null || echo "Unknown")

log_info "API rate limit: $CORE_REMAINING / $CORE_LIMIT remaining"
log_info "Resets at: $RESET_TIME"

if [ "$CORE_REMAINING" -lt 100 ]; then
    log_warn "⚠️  Low rate limit remaining"
fi

echo ""
log_header "5. Repository Access Test"
echo "───────────────────────────────────────────────"

# Test access to jperezdelreal's repos
log_info "Testing repository access..."

REPOS=$(gh repo list jperezdelreal --limit 3 --json name 2>&1 || echo "FAILED")

if [[ "$REPOS" == "FAILED" ]]; then
    log_error "❌ Cannot access repositories"
    exit 1
else
    REPO_COUNT=$(echo "$REPOS" | jq '. | length')
    log_info "✅ Successfully accessed $REPO_COUNT repositories"
    
    # Show sample repos
    echo "$REPOS" | jq -r '.[].name' | while read -r repo; do
        log_info "  - $repo"
    done
fi

# Test write access by checking if we can create issues (dry-run via API)
log_info "Testing write access (API permissions check)..."

# Try to get repo details which requires authenticated read
REPO_DETAILS=$(gh api repos/jperezdelreal/Syntax-Sorcery 2>&1 || echo "FAILED")

if [[ "$REPO_DETAILS" == "FAILED" ]]; then
    log_warn "⚠️  Cannot access Syntax-Sorcery repository details"
else
    REPO_PERMISSIONS=$(echo "$REPO_DETAILS" | jq -r '.permissions // {}')
    PUSH_ACCESS=$(echo "$REPO_PERMISSIONS" | jq -r '.push // false')
    ADMIN_ACCESS=$(echo "$REPO_PERMISSIONS" | jq -r '.admin // false')
    
    if [[ "$PUSH_ACCESS" == "true" ]]; then
        log_info "✅ Push (write) access confirmed"
    else
        log_warn "⚠️  Push access may be limited"
    fi
    
    if [[ "$ADMIN_ACCESS" == "true" ]]; then
        log_info "✅ Admin access confirmed"
    fi
fi

echo ""
log_header "6. Token Expiration"
echo "───────────────────────────────────────────────"

# Extract token expiration from headers
EXPIRATION=$(echo "$TOKEN_INFO" | grep -i "github-authentication-token-expiration:" | cut -d':' -f2- | tr -d '\r' | xargs)

if [ -n "$EXPIRATION" ]; then
    log_warn "⚠️  Token expires: $EXPIRATION"
    log_warn "Set renewal reminder before expiration"
else
    log_info "Token expiration: Not set (permanent or classic token)"
fi

echo ""
echo "════════════════════════════════════════════════════════"
log_info "✅ Token verification complete"
echo "════════════════════════════════════════════════════════"
echo ""

# Summary
log_info "Summary:"
log_info "  - Authentication: ✅ Valid"
log_info "  - Scopes: ${SCOPES:-Fine-grained}"
log_info "  - User: $USERNAME ($USER_TYPE)"
log_info "  - Rate limit: $CORE_REMAINING / $CORE_LIMIT"
log_info "  - Repository access: ✅ Confirmed"

if [[ "$SCOPES" == *"repo"* ]] || [[ -z "$SCOPES" ]]; then
    echo ""
    log_info "✅ Token is ready for autonomous operations"
    exit 0
else
    echo ""
    log_error "❌ Token does not have required 'repo' scope"
    exit 1
fi
