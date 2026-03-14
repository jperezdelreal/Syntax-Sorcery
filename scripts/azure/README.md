# Azure Satellite Launcher

Scripts to deploy and manage satellite Copilot CLI sessions on an Azure VM for the Syntax Sorcery constellation.

## Architecture

```
Hub (local machine)
  └── SSH → Azure VM (B2s v2, Ubuntu 24.04, West Europe)
              └── tmux sessions (5 satellites)
                    ├── sat-flora
                    ├── sat-ComeRosquillas
                    ├── sat-pixel-bounce
                    ├── sat-ffs-squad-monitor
                    └── sat-FirstFrameStudios
```

- **VM:** Standard_B2s_v2 (~€25-30/month)
- **OS:** Ubuntu 24.04 LTS
- **Terminal multiplexer:** tmux
- **Auto-start:** systemd unit (`satellites.service`)

## Files

| File | Purpose |
|------|---------|
| `main.bicep` | Bicep IaC template — VM, NSG, VNet, public IP, managed identity |
| `main.bicepparam` | Bicep parameters file — configurable VM size, location, SSH key |
| `deploy.sh` | Deployment wrapper — validate, what-if, deploy, teardown, smoke |
| `start-satellites.sh` | Launch tmux sessions for all 5 repos |
| `reset-satellite.sh` | Kill and restart a single satellite by repo name |
| `provision-vm.sh` | Legacy Azure CLI provisioning (superseded by Bicep) |
| `satellites.service` | systemd unit for auto-start on boot |

## Setup

### 1. Provision the VM (Bicep — recommended)

The Bicep template (`main.bicep`) is the declarative IaC approach. It deploys:

- **B2s_v2 VM** with Ubuntu 24.04 LTS
- **NSG** with SSH-only inbound rules (port 22)
- **Static public IP** (Standard SKU)
- **VNet/Subnet** (10.0.0.0/16)
- **User-assigned managed identity**
- **Cloud-init** that installs tmux, git, Node.js 20, gh CLI, and clones all 5 downstream repos

#### Prerequisites

- Azure CLI installed (`az --version`)
- Logged into Azure (`az login`)
- SSH key pair generated (`ssh-keygen -t rsa -b 4096`)

#### Validate the template

```bash
./scripts/azure/deploy.sh --validate
```

Checks the Bicep template for syntax errors and validates against the Azure API without making any changes.

#### Preview changes (what-if)

```bash
./scripts/azure/deploy.sh --what-if
```

Shows exactly what resources would be created, modified, or deleted — review before deploying.

#### Deploy

```bash
./scripts/azure/deploy.sh --deploy
```

Provisions all resources. Outputs the VM public IP, SSH command, and resource IDs.

#### Smoke tests

```bash
./scripts/azure/deploy.sh --smoke
```

Verifies SSH connectivity, cloud-init completion, installed dependencies, and cloned repos.

#### Teardown

```bash
./scripts/azure/deploy.sh --teardown
```

Deletes the entire resource group and all resources. Requires typing `DELETE` to confirm.

#### Custom SSH key path

```bash
SSH_KEY_PATH=~/.ssh/my_key.pub ./scripts/azure/deploy.sh --deploy
```

#### Rollback procedure

1. **Quick rollback:** `./scripts/azure/deploy.sh --teardown` then redeploy
2. **Partial rollback:** Use Azure Portal or `az resource delete` for individual resources
3. **Previous state:** Bicep deployments are idempotent — redeploy the previous template version

### 1b. Provision the VM (Legacy CLI)

> **Note:** `provision-vm.sh` is the legacy imperative approach. Use the Bicep template above for new deployments.

```bash
./scripts/azure/provision-vm.sh
```

This creates the resource group, VM, installs dependencies (tmux, git, Node.js), and clones all 5 repos.

### 2. Copy scripts to VM

```bash
scp -r scripts/azure/ ssadmin@<VM_IP>:~/scripts/azure/
chmod +x ~/scripts/azure/*.sh
```

### 3. Install systemd service

```bash
sudo cp ~/scripts/azure/satellites.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable satellites.service
sudo systemctl start satellites.service
```

### 4. Verify

```bash
# Check service status
sudo systemctl status satellites.service

# List tmux sessions
tmux list-sessions

# Attach to a satellite
tmux attach -t sat-flora
```

## Usage

### Start all satellites

```bash
./scripts/azure/start-satellites.sh
```

Idempotent — skips sessions that already exist.

### Dry run (validate without launching)

```bash
./scripts/azure/start-satellites.sh --dry-run
```

Validates that all repo directories exist and `copilot` CLI is available.

### Reset a single satellite

```bash
./scripts/azure/reset-satellite.sh flora
./scripts/azure/reset-satellite.sh ComeRosquillas
./scripts/azure/reset-satellite.sh pixel-bounce
./scripts/azure/reset-satellite.sh ffs-squad-monitor
./scripts/azure/reset-satellite.sh FirstFrameStudios
```

Kills the existing tmux session (if any) and starts a fresh one.

### Attach to a satellite

```bash
tmux attach -t sat-flora
# Detach with Ctrl+B, then D
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `copilot` not found | Install: `npm install -g @githubnext/github-copilot-cli` |
| Repo directory missing | Clone: `git clone https://github.com/jperezdelreal/<repo>.git ~/repos/<repo>` |
| tmux session won't start | Check disk space: `df -h`, memory: `free -h` |
| Service fails on boot | Check logs: `journalctl -u satellites.service -e` |
| VM unreachable | Verify NSG rules allow SSH (port 22): `az vm open-port ...` |
| Session stuck | Reset it: `./reset-satellite.sh <repo-name>` |
| All sessions dead | Restart service: `sudo systemctl restart satellites.service` |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SATELLITE_BASE_DIR` | `~/repos` | Base directory containing repo clones |
| `SSH_KEY_PATH` | `~/.ssh/id_rsa.pub` | SSH public key for VM provisioning |
