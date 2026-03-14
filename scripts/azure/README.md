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
| `deploy.sh` | Bicep deployment wrapper (validate/what-if/deploy/teardown/smoke) |
| `main.bicep` | Azure Bicep IaC template for the VM |
| `main.bicepparam` | Bicep parameters file |
| `verify-deployment.sh` | Post-deployment verification — structured pass/fail report |
| `start-constellation.sh` | Launch constellation tmux sessions (`ss-*`) for all 5 repos |
| `stop-constellation.sh` | Gracefully stop constellation sessions, save logs |
| `start-satellites.sh` | Launch satellite tmux sessions (`sat-*`) for all 5 repos |
| `reset-satellite.sh` | Kill and restart a single satellite by repo name |
| `session-watchdog.sh` | Monitor sessions: health checks, auto-restart stale sessions |
| `session-watchdog.timer` | systemd timer — runs watchdog every 30 minutes |
| `session-watchdog.service` | systemd service unit for the watchdog |
| `provision-vm.sh` | Azure CLI commands to provision the VM |
| `satellites.service` | systemd unit for auto-start on boot |

## Setup

### 1. Provision the VM

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
| Watchdog not running | Check timer: `systemctl status session-watchdog.timer` |
| Session keeps dying | Check `tail /var/log/ss-watchdog.jsonl \| jq .` for CRITICAL entries |

## Session Watchdog

The watchdog monitors all satellite tmux sessions every 30 minutes. It checks:

- **Session alive** — restarts dead sessions automatically
- **Session duration** — recycles sessions running longer than `MAX_SESSION_HOURS` (default: 6)
- **Disk space** — warns when usage exceeds 90%
- **Memory usage** — warns when usage exceeds 90%
- **Restart failures** — after 3 consecutive failures, writes a CRITICAL log entry

### Install watchdog timer

```bash
sudo cp ~/scripts/azure/session-watchdog.service /etc/systemd/system/
sudo cp ~/scripts/azure/session-watchdog.timer /etc/systemd/system/
sudo mkdir -p /var/lib/ss-watchdog
sudo chown ssadmin:ssadmin /var/lib/ss-watchdog
sudo touch /var/log/ss-watchdog.jsonl
sudo chown ssadmin:ssadmin /var/log/ss-watchdog.jsonl
sudo systemctl daemon-reload
sudo systemctl enable session-watchdog.timer
sudo systemctl start session-watchdog.timer
```

### Verify watchdog

```bash
# Check timer status
sudo systemctl status session-watchdog.timer

# Run manually
./scripts/azure/session-watchdog.sh

# Dry run (no restarts, no log writes)
./scripts/azure/session-watchdog.sh --dry-run

# View structured logs
tail -f /var/log/ss-watchdog.jsonl | jq .
```

### Log format

Each check writes one JSON line to `/var/log/ss-watchdog.jsonl`:

```json
{"timestamp":"2026-03-22T10:00:00Z","level":"INFO","host":"ss-satellite-vm","session":"sat-flora","message":"session healthy","uptime_hours":2,"uptime_seconds":7200}
```

Log levels: `INFO`, `WARNING`, `ERROR`, `CRITICAL`

A `CRITICAL` entry means a session failed to restart 3 consecutive times and needs manual intervention.

## Deployment Verification

After deploying the VM, run the verification script to confirm readiness:

```bash
# Auto-detect VM IP from Azure
./scripts/azure/verify-deployment.sh

# Or specify IP manually
./scripts/azure/verify-deployment.sh --ip 20.73.x.x

# Preview checks without running
./scripts/azure/verify-deployment.sh --dry-run
```

The script SSHs into the VM and checks 10+ items: SSH, cloud-init, Node.js, gh CLI auth, repos cloned, tmux, disk, memory, network, and watchdog. Output is a structured pass/fail report with exit code 0 (all pass) or 1 (any fail).

## Constellation Management

The constellation scripts manage `ss-*` tmux sessions — the Test 3 naming convention for downstream repo sessions.

### Start the constellation

```bash
./scripts/azure/start-constellation.sh

# Dry run (validate only)
./scripts/azure/start-constellation.sh --dry-run
```

Each session: `cd <repo>` → `git pull` → `copilot` → `Ralph, go`. Idempotent — skips existing sessions.

### Stop the constellation

```bash
./scripts/azure/stop-constellation.sh

# Preview what would be stopped
./scripts/azure/stop-constellation.sh --dry-run

# Custom log directory
./scripts/azure/stop-constellation.sh --log-dir /tmp/constellation-logs
```

Saves the last 5000 lines of each session buffer to `~/logs/constellation/` before killing. Log files are timestamped: `ss-flora-20260322-100000.log`.

### Attach to a constellation session

```bash
tmux attach -t ss-flora
# Detach with Ctrl+B, then D
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SATELLITE_BASE_DIR` | `~/repos` | Base directory containing repo clones |
| `SSH_KEY_PATH` | `~/.ssh/id_rsa.pub` | SSH public key for VM provisioning |
| `MAX_SESSION_HOURS` | `6` | Max session uptime before auto-recycle |
| `WATCHDOG_LOG` | `/var/log/ss-watchdog.jsonl` | Structured log file path |
| `WATCHDOG_STATE_DIR` | `/var/lib/ss-watchdog` | Directory for restart failure state tracking |
| `CONSTELLATION_LOG_DIR` | `~/logs/constellation` | Directory for constellation session logs |
| `RESOURCE_GROUP` | `syntax-sorcery-satellites` | Azure resource group (verify-deployment) |
| `VM_NAME` | `ss-satellite-vm` | Azure VM name (verify-deployment) |
| `VM_USER` | `ssadmin` | SSH user for VM (verify-deployment) |
