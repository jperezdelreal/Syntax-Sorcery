#!/usr/bin/env bash
# provision-vm.sh — Azure CLI commands to provision a B2s v2 VM for satellite operations
# Budget: €25-30/mo | Region: West Europe | OS: Ubuntu 24.04 LTS
# Idempotent: checks for existing resources before creating
set -euo pipefail

RESOURCE_GROUP="syntax-sorcery-satellites"
VM_NAME="ss-satellite-vm"
LOCATION="westeurope"
VM_SIZE="Standard_B2s_v2"
IMAGE="Canonical:ubuntu-24_04-lts:server:latest"
ADMIN_USER="ssadmin"
SSH_KEY_PATH="${SSH_KEY_PATH:-$HOME/.ssh/id_rsa.pub}"

log() { echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] $*"; }

# Verify Azure CLI is available
if ! command -v az &>/dev/null; then
  log "ERROR: Azure CLI (az) not found. Install: https://aka.ms/InstallAzureCLI"
  exit 1
fi

# Verify logged in
if ! az account show &>/dev/null; then
  log "ERROR: Not logged into Azure. Run: az login"
  exit 1
fi

# Verify SSH key exists
if [[ ! -f "$SSH_KEY_PATH" ]]; then
  log "ERROR: SSH public key not found at $SSH_KEY_PATH"
  log "Generate one with: ssh-keygen -t rsa -b 4096"
  exit 1
fi

# Create resource group (idempotent)
if az group show --name "$RESOURCE_GROUP" &>/dev/null; then
  log "SKIP: resource group '$RESOURCE_GROUP' already exists"
else
  log "CREATE: resource group '$RESOURCE_GROUP' in $LOCATION"
  az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none
fi

# Create VM (idempotent)
if az vm show --resource-group "$RESOURCE_GROUP" --name "$VM_NAME" &>/dev/null; then
  log "SKIP: VM '$VM_NAME' already exists"
else
  log "CREATE: VM '$VM_NAME' (size: $VM_SIZE, image: Ubuntu 24.04)"
  az vm create \
    --resource-group "$RESOURCE_GROUP" \
    --name "$VM_NAME" \
    --location "$LOCATION" \
    --size "$VM_SIZE" \
    --image "$IMAGE" \
    --admin-username "$ADMIN_USER" \
    --ssh-key-value "@$SSH_KEY_PATH" \
    --public-ip-sku Standard \
    --nsg-rule SSH \
    --output table
fi

# Open port 22 (idempotent — default NSG rule already allows SSH)
log "VERIFY: SSH access enabled"
az vm open-port \
  --resource-group "$RESOURCE_GROUP" \
  --name "$VM_NAME" \
  --port 22 \
  --priority 1000 \
  --output none 2>/dev/null || true

# Install dependencies on VM
log "CONFIGURE: installing dependencies on VM"
az vm run-command invoke \
  --resource-group "$RESOURCE_GROUP" \
  --name "$VM_NAME" \
  --command-id RunShellScript \
  --scripts '
    set -e
    apt-get update -qq
    apt-get install -y -qq tmux git nodejs npm
    npm install -g @githubnext/github-copilot-cli || true
    # Clone repos
    REPOS="flora ComeRosquillas pixel-bounce ffs-squad-monitor FirstFrameStudios"
    mkdir -p /home/ssadmin/repos
    cd /home/ssadmin/repos
    for repo in $REPOS; do
      if [ ! -d "$repo" ]; then
        git clone "https://github.com/jperezdelreal/$repo.git" || true
      fi
    done
    chown -R ssadmin:ssadmin /home/ssadmin/repos
  ' \
  --output table

# Get public IP
PUBLIC_IP=$(az vm show \
  --resource-group "$RESOURCE_GROUP" \
  --name "$VM_NAME" \
  --show-details \
  --query publicIps \
  --output tsv)

log "DONE: VM provisioned"
log "  SSH: ssh $ADMIN_USER@$PUBLIC_IP"
log "  Next: copy scripts/azure/ to VM, install satellites.service"
log "  Cost estimate: ~€25-30/month for B2s v2 in West Europe"
