# Skill: Ralph-Watch Hardening

**Confidence:** medium
**Category:** infrastructure
**Source:** P1-08 audit of FFS ralph-watch v4

## TLDR

Pattern for hardening any long-running autonomous agent loop for 24h+ unattended operation. Six failure modes, six mitigations.

## Problem

An agent loop (ralph-watch) runs copilot sessions every N minutes. Without hardening, it fails silently within hours due to: hung sessions, lock file corruption, log loss, rapid-retry storms, and undetected crashes.

## Pattern: Hardened Agent Loop

### 1. Session Timeout
Wrap blocking agent calls with a process-level timeout. Kill after N minutes. Use exit code 124 for timeout (Unix convention).

### 2. Exponential Backoff
On consecutive failures, double the sleep interval (cap at 60m). Reset on success. Formula: `min(base * 2^failures, max)`.

### 3. Stale Lock Detection
Check lock file age, not just PID existence. If lock is >2h old, kill the stale process and take over. Handles: crashes, OS restarts, zombie processes.

### 4. Log Rotation Depth
Keep 3 rotated log files, not 1. Prevents losing diagnostic data when investigating failures that span multiple rotations.

### 5. Pre-Round Health Check
Before each round, validate: CLI tools in PATH, disk space >1GB, temp file cleanup. Skip round (don't crash) on health failure.

### 6. External Staleness Detection
A separate process (GitHub Actions) checks heartbeat timestamp hourly. Alerts if >30m stale (running) or >60m stale (idle). Auto-creates P0 issue on critical. Prevents "silent death" scenarios.

## Anti-Patterns
- **Infinite retries at full speed** — burns resources on persistent failures
- **Local-only alerting** — nobody sees the alert if the machine is unreachable
- **Single log rotation** — loses diagnostic data during multi-hour failure windows
- **PID-only lock check** — PIDs can be recycled by the OS

## Applicability
Any long-running autonomous loop: ralph-watch, CI runners, monitoring daemons, scheduled agent sessions. Applies to any downstream company managed by SS.
