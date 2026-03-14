#!/usr/bin/env bash
# deploy.sh — Bicep deployment wrapper for Syntax Sorcery Test 3 VM
# Supports: --validate (template check), --what-if (preview), --deploy (provision)
# Requires: Azure CLI with Bicep extension (built-in since az 2.20+)
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE="$SCRIPT_DIR/main.bicep"
PARAMS_FILE="$SCRIPT_DIR/main.bicepparam"
RESOURCE_GROUP="syntax-sorcery-satellites"
LOCATION="westeurope"
DEPLOYMENT_NAME="ss-satellite-$(date -u '+%Y%m%d-%H%M%S')"
SSH_KEY_PATH="${SSH_KEY_PATH:-$HOME/.ssh/id_rsa.pub}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${BLUE}[$(date -u '+%Y-%m-%dT%H:%M:%SZ')]${NC} $*"; }
ok()   { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*"; }

usage() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Deploy Syntax Sorcery Test 3 VM infrastructure using Azure Bicep.

Options:
  --validate    Validate the Bicep template (no changes)
  --what-if     Preview changes without deploying
  --deploy      Deploy the infrastructure
  --teardown    Delete all resources (resource group)
  --help        Show this help message

Environment Variables:
  SSH_KEY_PATH  Path to SSH public key (default: ~/.ssh/id_rsa.pub)

Examples:
  $(basename "$0") --validate           # Check template syntax
  $(basename "$0") --what-if            # Preview what would be created
  $(basename "$0") --deploy             # Provision the VM
  $(basename "$0") --teardown           # Delete everything

Cost: ~€25-30/month for B2s_v2 in West Europe (within €500/mo budget).
EOF
  exit 0
}

# Preflight checks
preflight() {
  local errors=0

  # Azure CLI
  if ! command -v az &>/dev/null; then
    err "Azure CLI (az) not found. Install: https://aka.ms/InstallAzureCLI"
    errors=$((errors + 1))
  fi

  # Logged in
  if ! az account show &>/dev/null 2>&1; then
    err "Not logged into Azure. Run: az login"
    errors=$((errors + 1))
  fi

  # Bicep template exists
  if [[ ! -f "$TEMPLATE" ]]; then
    err "Bicep template not found: $TEMPLATE"
    errors=$((errors + 1))
  fi

  # SSH key exists
  if [[ ! -f "$SSH_KEY_PATH" ]]; then
    err "SSH public key not found at $SSH_KEY_PATH"
    err "Generate one with: ssh-keygen -t rsa -b 4096"
    errors=$((errors + 1))
  fi

  if [[ $errors -gt 0 ]]; then
    err "$errors preflight check(s) failed"
    exit 1
  fi

  ok "Preflight checks passed"
}

# Ensure resource group exists
ensure_resource_group() {
  if az group show --name "$RESOURCE_GROUP" &>/dev/null 2>&1; then
    log "Resource group '$RESOURCE_GROUP' already exists"
  else
    log "Creating resource group '$RESOURCE_GROUP' in $LOCATION"
    az group create \
      --name "$RESOURCE_GROUP" \
      --location "$LOCATION" \
      --tags project=syntax-sorcery environment=prod managed-by=bicep \
      --output none
    ok "Resource group created"
  fi
}

# Read SSH key
get_ssh_key() {
  cat "$SSH_KEY_PATH"
}

# Validate template
do_validate() {
  log "Validating Bicep template..."
  preflight

  az deployment group validate \
    --resource-group "$RESOURCE_GROUP" \
    --template-file "$TEMPLATE" \
    --parameters "$PARAMS_FILE" \
    --parameters sshPublicKey="$(get_ssh_key)" \
    --output table

  ok "Template validation passed"
}

# What-if preview
do_whatif() {
  log "Running what-if preview..."
  preflight
  ensure_resource_group

  az deployment group what-if \
    --resource-group "$RESOURCE_GROUP" \
    --template-file "$TEMPLATE" \
    --parameters "$PARAMS_FILE" \
    --parameters sshPublicKey="$(get_ssh_key)" \
    --result-format FullResourcePayloads

  ok "What-if preview complete — review changes above before deploying"
}

# Deploy
do_deploy() {
  log "Deploying Syntax Sorcery Test 3 VM..."
  log "Deployment name: $DEPLOYMENT_NAME"
  log "Estimated cost: ~€25-30/month"
  preflight
  ensure_resource_group

  local output
  output=$(az deployment group create \
    --resource-group "$RESOURCE_GROUP" \
    --template-file "$TEMPLATE" \
    --parameters "$PARAMS_FILE" \
    --parameters sshPublicKey="$(get_ssh_key)" \
    --name "$DEPLOYMENT_NAME" \
    --output json)

  # Extract outputs
  local vm_ip ssh_cmd vm_id identity_id nsg_id pip_id
  vm_ip=$(echo "$output" | jq -r '.properties.outputs.vmPublicIp.value // "pending"')
  ssh_cmd=$(echo "$output" | jq -r '.properties.outputs.sshCommand.value // "pending"')
  vm_id=$(echo "$output" | jq -r '.properties.outputs.vmResourceId.value // "pending"')
  identity_id=$(echo "$output" | jq -r '.properties.outputs.managedIdentityId.value // "pending"')
  nsg_id=$(echo "$output" | jq -r '.properties.outputs.nsgResourceId.value // "pending"')
  pip_id=$(echo "$output" | jq -r '.properties.outputs.publicIpResourceId.value // "pending"')

  echo ""
  ok "Deployment complete!"
  echo ""
  echo "╔══════════════════════════════════════════════════════════╗"
  echo "║  Syntax Sorcery Test 3 — Deployment Summary             ║"
  echo "╠══════════════════════════════════════════════════════════╣"
  echo "║  VM Public IP:    $vm_ip"
  echo "║  SSH Command:     $ssh_cmd"
  echo "║  VM Resource ID:  $vm_id"
  echo "║  Identity ID:     $identity_id"
  echo "║  NSG Resource ID: $nsg_id"
  echo "║  Public IP ID:    $pip_id"
  echo "╚══════════════════════════════════════════════════════════╝"
  echo ""
  log "Next steps:"
  echo "  1. SSH into the VM:  $ssh_cmd"
  echo "  2. Verify cloud-init: cloud-init status --wait"
  echo "  3. Copy satellite scripts: scp -r scripts/azure/ ssadmin@$vm_ip:~/scripts/azure/"
  echo "  4. Start satellites: ./scripts/azure/start-satellites.sh"
}

# Teardown
do_teardown() {
  log "Tearing down all resources in '$RESOURCE_GROUP'..."
  warn "This will DELETE the VM and ALL associated resources!"
  echo ""

  read -rp "Type 'DELETE' to confirm: " confirm
  if [[ "$confirm" != "DELETE" ]]; then
    err "Teardown cancelled"
    exit 1
  fi

  az group delete \
    --name "$RESOURCE_GROUP" \
    --yes \
    --no-wait \
    --output none

  ok "Teardown initiated (async). Resources will be deleted shortly."
  log "Verify: az group show --name $RESOURCE_GROUP"
}

# Smoke tests — run after deployment to verify VM health
do_smoke() {
  log "Running smoke tests..."

  local vm_ip
  vm_ip=$(az vm show \
    --resource-group "$RESOURCE_GROUP" \
    --name "ss-satellite-vm" \
    --show-details \
    --query publicIps \
    --output tsv 2>/dev/null || echo "")

  if [[ -z "$vm_ip" ]]; then
    err "VM not found or no public IP assigned"
    exit 1
  fi

  ok "VM public IP: $vm_ip"

  # Test SSH connectivity (timeout 10s)
  if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "ssadmin@$vm_ip" "echo 'SSH OK'" 2>/dev/null; then
    ok "SSH connectivity: PASS"
  else
    warn "SSH connectivity: FAIL (VM may still be booting)"
  fi

  # Test cloud-init completion
  if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "ssadmin@$vm_ip" "cloud-init status" 2>/dev/null | grep -q "done"; then
    ok "Cloud-init: COMPLETE"
  else
    warn "Cloud-init: STILL RUNNING (check with: cloud-init status --wait)"
  fi

  # Test dependencies
  for cmd in tmux git node gh; do
    if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "ssadmin@$vm_ip" "command -v $cmd" &>/dev/null; then
      ok "$cmd: INSTALLED"
    else
      warn "$cmd: NOT FOUND (cloud-init may still be running)"
    fi
  done

  # Test repos cloned
  local repo_count
  repo_count=$(ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "ssadmin@$vm_ip" "ls -d ~/repos/*/ 2>/dev/null | wc -l" 2>/dev/null || echo "0")
  if [[ "$repo_count" -ge 5 ]]; then
    ok "Repos cloned: $repo_count/5"
  else
    warn "Repos cloned: $repo_count/5 (cloud-init may still be running)"
  fi
}

# Main
if [[ $# -eq 0 ]]; then
  usage
fi

case "${1:-}" in
  --validate) do_validate ;;
  --what-if)  do_whatif ;;
  --deploy)   do_deploy ;;
  --teardown) do_teardown ;;
  --smoke)    do_smoke ;;
  --help|-h)  usage ;;
  *)
    err "Unknown option: $1"
    usage
    ;;
esac
