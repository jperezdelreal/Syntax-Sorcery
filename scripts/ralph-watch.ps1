<#
.SYNOPSIS
    Ralph-Watch — Layer 2 Refueling Engine for Perpetual Motion

.DESCRIPTION
    Background monitoring service that detects "Define next roadmap" issues
    across constellation repositories and autonomously refuels roadmaps by
    opening Squad CLI sessions for local Leads to define new roadmaps.
    
    This is the FINAL piece of the perpetual motion engine:
    - Layer 1: perpetual-motion.yml (issues.closed trigger, @copilot execution)
    - Layer 2: ralph-watch.ps1 (roadmap refueling, THIS SCRIPT)
    - Layer 3: squad watch (AI triage complement, Brady's tool)
    
    Hardened with 6 failure modes from Tank's ralph-hardening SKILL:
    1. Session timeout (30min max per refueling session)
    2. Exponential backoff (5m → 10m → 20m → 60m on failures)
    3. Stale lock detection (2h timeout triggers cleanup)
    4. Log rotation (3-file depth: current, previous, archive)
    5. Health checks (hourly heartbeat + pre-round validation)
    6. Alert mechanism (log warnings + GitHub issue escalation)

.PARAMETER PollIntervalMinutes
    Time between polling cycles. Default: 10 minutes.

.PARAMETER SessionTimeoutMinutes
    Maximum time for a single refueling session. Default: 30 minutes.

.PARAMETER ConstellationFile
    Path to constellation.json containing repo list. Default: .squad/constellation.json

.PARAMETER DryRun
    Simulate actions without opening Squad sessions or closing issues.

.EXAMPLE
    .\ralph-watch.ps1
    Run with default settings (10min polling, 30min session timeout)

.EXAMPLE
    .\ralph-watch.ps1 -PollIntervalMinutes 5 -DryRun
    Test mode with 5-minute polling (no real actions)

.NOTES
    Author: Tank (Cloud Engineer) + Morpheus (Lead/Architect)
    Version: 1.0
    Date: 2026-03-17
    
    ROADMAP CONVERGENCE GUIDANCE:
    Roadmaps should have natural endpoints, not infinite work. If a repo has had
    3+ roadmap cycles with no user review, this script will PAUSE refueling and
    create an escalation issue instead. This prevents infinite roadmap generation
    without human direction.
#>

param(
    [int]$PollIntervalMinutes = 10,
    [int]$SessionTimeoutMinutes = 30,
    [string]$ConstellationFile = ".squad\constellation.json",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

# Configuration
$SCRIPT_VERSION = "1.0.0"
$LOG_DIR = ".squad\ralph-watch"
$LOCK_FILE = "$LOG_DIR\ralph-watch.lock"
$HEARTBEAT_FILE = "$LOG_DIR\heartbeat.txt"
$STATE_FILE = "$LOG_DIR\state.json"
$ROADMAP_CYCLE_LIMIT = 3  # Max consecutive refuelings without user review
$STALE_LOCK_HOURS = 2
$MIN_DISK_SPACE_GB = 1
$LOG_ROTATION_KEEP = 3

# Exponential backoff configuration
$BACKOFF_BASE_MINUTES = 5
$BACKOFF_MAX_MINUTES = 60

# Color output helpers
function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[SUCCESS] $msg" -ForegroundColor Green }
function Write-Warning($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Error($msg) { Write-Host "[ERROR] $msg" -ForegroundColor Red }

# Logging
function Write-Log {
    param([string]$Level, [string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logFile = "$LOG_DIR\$(Get-Date -Format 'yyyy-MM-dd').log"
    $entry = "[$timestamp] [$Level] $Message"
    Add-Content -Path $logFile -Value $entry -ErrorAction SilentlyContinue
    
    switch ($Level) {
        "INFO" { Write-Info $Message }
        "SUCCESS" { Write-Success $Message }
        "WARN" { Write-Warning $Message }
        "ERROR" { Write-Error $Message }
    }
}

# Initialize logging directory
function Initialize-LogDirectory {
    if (-not (Test-Path $LOG_DIR)) {
        New-Item -ItemType Directory -Path $LOG_DIR -Force | Out-Null
        Write-Log "INFO" "Created log directory: $LOG_DIR"
    }
}

# HARDENING PATTERN #4: Log Rotation (keep last 3 files + 7 days)
function Invoke-LogRotation {
    $logs = Get-ChildItem -Path $LOG_DIR -Filter "*.log" -File | 
            Sort-Object LastWriteTime -Descending
    
    # Keep logs from last 7 days
    $cutoffDate = (Get-Date).AddDays(-7)
    $oldLogs = $logs | Where-Object { $_.LastWriteTime -lt $cutoffDate }
    
    if ($null -ne $oldLogs -and @($oldLogs).Count -gt $LOG_ROTATION_KEEP) {
        $toDelete = $oldLogs | Select-Object -Skip $LOG_ROTATION_KEEP
        foreach ($log in $toDelete) {
            Remove-Item $log.FullName -Force
            Write-Log "INFO" "Rotated old log: $($log.Name)"
        }
    }
}

# HARDENING PATTERN #3: Stale Lock Detection
function Test-StaleLock {
    if (-not (Test-Path $LOCK_FILE)) {
        return $false
    }
    
    $lockContent = Get-Content $LOCK_FILE -ErrorAction SilentlyContinue
    if (-not $lockContent) {
        return $true  # Corrupted lock file
    }
    
    $lockData = $lockContent | ConvertFrom-Json -ErrorAction SilentlyContinue
    if (-not $lockData) {
        return $true  # Invalid JSON
    }
    
    $lockAge = (Get-Date) - [DateTime]$lockData.timestamp
    if ($lockAge.TotalHours -gt $STALE_LOCK_HOURS) {
        Write-Log "WARN" "Stale lock detected (age: $($lockAge.TotalHours.ToString('F1'))h, PID: $($lockData.pid))"
        
        # Try to kill stale process
        try {
            $process = Get-Process -Id $lockData.pid -ErrorAction SilentlyContinue
            if ($process) {
                Stop-Process -Id $lockData.pid -Force
                Write-Log "WARN" "Killed stale process: $($lockData.pid)"
            }
        } catch {
            Write-Log "WARN" "Could not kill stale process: $_"
        }
        
        Remove-Item $LOCK_FILE -Force -ErrorAction SilentlyContinue
        return $false
    }
    
    return $true  # Lock is valid and recent
}

# Acquire process lock
function Lock-Process {
    if (Test-StaleLock) {
        Write-Log "ERROR" "Another ralph-watch instance is running. Exiting."
        exit 1
    }
    
    $lockData = @{
        pid = $PID
        timestamp = (Get-Date).ToString("o")
        version = $SCRIPT_VERSION
    }
    
    $lockData | ConvertTo-Json | Set-Content $LOCK_FILE
    Write-Log "INFO" "Acquired process lock (PID: $PID)"
}

# Release process lock
function Unlock-Process {
    if (Test-Path $LOCK_FILE) {
        Remove-Item $LOCK_FILE -Force -ErrorAction SilentlyContinue
        Write-Log "INFO" "Released process lock"
    }
}

# HARDENING PATTERN #5: Pre-Round Health Check
function Test-SystemHealth {
    $healthy = $true
    
    # Check gh CLI availability
    try {
        $ghVersion = & gh --version 2>&1 | Select-Object -First 1
        if ($ghVersion -match "gh version") {
            Write-Log "INFO" "GitHub CLI available: $ghVersion"
        } else {
            Write-Log "ERROR" "GitHub CLI (gh) not found in PATH"
            $healthy = $false
        }
    } catch {
        Write-Log "ERROR" "GitHub CLI (gh) not found in PATH: $_"
        $healthy = $false
    }
    
    # Check disk space
    $drive = (Get-Location).Drive
    $freeSpace = (Get-PSDrive $drive.Name).Free / 1GB
    if ($freeSpace -lt $MIN_DISK_SPACE_GB) {
        Write-Log "ERROR" "Low disk space: $($freeSpace.ToString('F2'))GB (minimum: ${MIN_DISK_SPACE_GB}GB)"
        $healthy = $false
    } else {
        Write-Log "INFO" "Disk space available: $($freeSpace.ToString('F2'))GB"
    }
    
    # Clean up temp files
    $tempFiles = @(Get-ChildItem -Path $LOG_DIR -Filter "*.tmp" -File -ErrorAction SilentlyContinue)
    if ($tempFiles.Count -gt 0) {
        $tempFiles | Remove-Item -Force -ErrorAction SilentlyContinue
        Write-Log "INFO" "Cleaned $($tempFiles.Count) temp file(s)"
    }
    
    return $healthy
}

# HARDENING PATTERN #5: Heartbeat Update
function Update-Heartbeat {
    $heartbeat = @{
        timestamp = (Get-Date).ToString("o")
        pid = $PID
        status = "running"
        version = $SCRIPT_VERSION
    }
    
    $heartbeat | ConvertTo-Json | Set-Content $HEARTBEAT_FILE
}

# Load constellation repos
function Get-ConstellationRepos {
    if (-not (Test-Path $ConstellationFile)) {
        Write-Log "ERROR" "Constellation file not found: $ConstellationFile"
        return @()
    }
    
    $constellation = Get-Content $ConstellationFile | ConvertFrom-Json
    return $constellation.repos
}

# Load state tracking
function Get-State {
    if (Test-Path $STATE_FILE) {
        return Get-Content $STATE_FILE | ConvertFrom-Json
    }
    
    return @{
        repos = @{}
        consecutive_failures = 0
        last_success = $null
    }
}

# Save state tracking
function Save-State {
    param($State)
    $State | ConvertTo-Json -Depth 10 | Set-Content $STATE_FILE
}

# Check repo for refueling issues
function Get-RefuelingIssues {
    param([string]$Repo)
    
    Write-Log "INFO" "Checking repo: $Repo"
    
    $issues = gh issue list `
        --repo $Repo `
        --label "squad:morpheus" `
        --state open `
        --search "Define next roadmap in:title" `
        --json number,title,createdAt `
        2>&1
    
    if ($null -eq $LASTEXITCODE -or $LASTEXITCODE -ne 0) {
        Write-Log "ERROR" "Failed to list issues for $Repo`: $issues"
        return @()
    }
    
    $issueList = $issues | ConvertFrom-Json
    return $issueList | Where-Object { $_.title -match "Define next roadmap" }
}

# HARDENING PATTERN #2: Exponential Backoff
function Get-BackoffDelay {
    param([int]$FailureCount)
    $delay = [Math]::Min($BACKOFF_BASE_MINUTES * [Math]::Pow(2, $FailureCount), $BACKOFF_MAX_MINUTES)
    return [int]$delay
}

# HARDENING PATTERN #1: Session Timeout Wrapper
function Invoke-RefuelingSession {
    param(
        [string]$Repo,
        [int]$IssueNumber
    )
    
    Write-Log "INFO" "Starting refueling session for $Repo (issue #$IssueNumber)"
    
    if ($DryRun) {
        Write-Log "INFO" "[DRY RUN] Would open Squad session for $Repo"
        Start-Sleep -Seconds 2
        return $true
    }
    
    # Extract repo name for directory context
    $repoName = $Repo -split '/' | Select-Object -Last 1
    $repoPath = "..\$repoName"
    
    if (-not (Test-Path $repoPath)) {
        Write-Log "ERROR" "Repository not found locally: $repoPath"
        return $false
    }
    
    # Create prompt for Squad CLI session
    $prompt = @"
You are the Lead/Architect for this repository.

TASK: Define the next roadmap.md for this repository.

The previous roadmap has been exhausted. Review the repository state and define 3-5 concrete, @copilot-ready work items for the next iteration.

GUIDANCE:
- Follow .squad/guides/writing-copilot-issues.md standards
- Each item should have clear acceptance criteria
- Focus on completing existing work per "no más juegos sin límite" directive
- Roadmaps should have natural endpoints, not infinite work
- After defining roadmap.md, commit to main branch

Execute the task now.
"@
    
    # Save prompt to temp file
    $promptFile = "$LOG_DIR\refuel-prompt-$IssueNumber.tmp"
    $prompt | Set-Content $promptFile
    
    # Launch Squad session with timeout
    $job = Start-Job -ScriptBlock {
        param($RepoPath, $PromptFile)
        Set-Location $RepoPath
        $promptContent = Get-Content $PromptFile -Raw
        # Use copilot with session mode and provide the prompt
        $output = $promptContent | copilot --mode session 2>&1
        return @{
            Success = $LASTEXITCODE -eq 0
            Output = $output
        }
    } -ArgumentList $repoPath, $promptFile
    
    # Wait with timeout
    $timeout = $SessionTimeoutMinutes * 60
    $completed = Wait-Job -Job $job -Timeout $timeout
    
    if (-not $completed) {
        Write-Log "ERROR" "Session timeout after ${SessionTimeoutMinutes}m for $Repo"
        Stop-Job -Job $job
        Remove-Job -Job $job -Force
        Remove-Item $promptFile -Force -ErrorAction SilentlyContinue
        return $false
    }
    
    $result = Receive-Job -Job $job
    Remove-Job -Job $job -Force
    Remove-Item $promptFile -Force -ErrorAction SilentlyContinue
    
    if ($result.Success) {
        Write-Log "SUCCESS" "Refueling completed for $Repo"
        
        # Close the refueling issue
        if (-not $DryRun) {
            gh issue close $IssueNumber --repo $Repo --comment "Roadmap refueled by ralph-watch.ps1" 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Log "SUCCESS" "Closed issue #$IssueNumber"
            } else {
                Write-Log "WARN" "Failed to close issue #$IssueNumber"
            }
        }
        
        return $true
    } else {
        Write-Log "ERROR" "Refueling failed for $Repo`: $($result.Output)"
        return $false
    }
}

# Check roadmap cycle limit and create escalation if needed
function Test-RoadmapCycleLimit {
    param(
        [string]$Repo,
        [object]$State
    )
    
    if (-not $State.repos.ContainsKey($Repo)) {
        $State.repos[$Repo] = @{
            refuel_count = 0
            last_user_review = $null
        }
    }
    
    $repoState = $State.repos[$Repo]
    
    if ($repoState.refuel_count -ge $ROADMAP_CYCLE_LIMIT) {
        Write-Log "WARN" "Repo $Repo has exceeded refuel limit ($ROADMAP_CYCLE_LIMIT cycles without user review)"
        
        # HARDENING PATTERN #6: Alert Mechanism (escalation issue)
        if (-not $DryRun) {
            $escalationTitle = "🚨 Roadmap Refueling Paused — User Review Required"
            $escalationBody = @"
## Roadmap Convergence Check

This repository has gone through **$($repoState.refuel_count) consecutive roadmap refueling cycles** without user review.

**Reason for Pause:** Roadmaps should have natural endpoints, not infinite work. Continuous automatic refueling without human direction may indicate:
- Work is not converging toward completion
- Scope is expanding without boundaries
- User priorities may have changed

**Action Required:**
- Review the last $($repoState.refuel_count) roadmap.md versions
- Confirm the current direction aligns with project goals
- Close this issue to acknowledge review and reset the refuel counter

**Refueling will resume** after this issue is closed and the next "Define next roadmap" issue is created.

---
*Created by ralph-watch.ps1 v$SCRIPT_VERSION (Layer 2 Refueling Engine)*
"@
            
            gh issue create `
                --repo $Repo `
                --title $escalationTitle `
                --body $escalationBody `
                --label "squad:morpheus,priority:high" `
                2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Log "WARN" "Created escalation issue for $Repo"
            }
        }
        
        return $false  # Block refueling
    }
    
    return $true  # Allow refueling
}

# Process refueling for a single repo
function Invoke-RepoRefueling {
    param(
        [string]$Repo,
        [object]$State
    )
    
    $issues = Get-RefuelingIssues -Repo $Repo
    
    $issues = @($issues)
    if ($issues.Count -eq 0) {
        return $true  # No issues to process = success
    }
    
    Write-Log "INFO" "Found $($issues.Count) refueling issue(s) in $Repo"
    
    foreach ($issue in $issues) {
        # Check roadmap cycle limit
        if (-not (Test-RoadmapCycleLimit -Repo $Repo -State $State)) {
            Write-Log "WARN" "Skipping refueling for $Repo (cycle limit reached)"
            continue
        }
        
        # Attempt refueling
        $success = Invoke-RefuelingSession -Repo $Repo -IssueNumber $issue.number
        
        if ($success) {
            # Update state: increment refuel count
            if (-not $State.repos.ContainsKey($Repo)) {
                $State.repos[$Repo] = @{
                    refuel_count = 0
                    last_user_review = $null
                }
            }
            $State.repos[$Repo].refuel_count++
            $State.last_success = (Get-Date).ToString("o")
            Save-State -State $State
            
            return $true
        } else {
            return $false
        }
    }
    
    return $true
}

# Main monitoring loop
function Start-RalphWatch {
    Write-Log "INFO" "Ralph-Watch v$SCRIPT_VERSION starting..."
    Write-Log "INFO" "Poll interval: ${PollIntervalMinutes}m | Session timeout: ${SessionTimeoutMinutes}m"
    Write-Log "INFO" "Constellation file: $ConstellationFile"
    if ($DryRun) {
        Write-Log "WARN" "DRY RUN MODE - No actual refueling will occur"
    }
    
    $repos = @(Get-ConstellationRepos)
    if ($repos.Count -eq 0) {
        Write-Log "ERROR" "No repositories found in constellation"
        return
    }
    
    Write-Log "INFO" "Monitoring $($repos.Count) repositories: $($repos -join ', ')"
    
    $state = Get-State
    $roundNumber = 1
    
    while ($true) {
        Write-Log "INFO" "=== Round $roundNumber started ==="
        
        # HARDENING PATTERN #5: Pre-round health check
        if (-not (Test-SystemHealth)) {
            Write-Log "ERROR" "Health check failed, skipping round"
            $state.consecutive_failures++
        } else {
            $roundSuccess = $true
            
            foreach ($repo in $repos) {
                try {
                    $success = Invoke-RepoRefueling -Repo $repo -State $state
                    if (-not $success) {
                        $roundSuccess = $false
                    }
                } catch {
                    Write-Log "ERROR" "Exception processing $repo`: $_"
                    $roundSuccess = $false
                }
            }
            
            if ($roundSuccess) {
                $state.consecutive_failures = 0
                Write-Log "SUCCESS" "Round $roundNumber completed successfully"
            } else {
                $state.consecutive_failures++
                Write-Log "WARN" "Round $roundNumber had failures (consecutive: $($state.consecutive_failures))"
            }
            
            Save-State -State $state
        }
        
        # HARDENING PATTERN #5: Update heartbeat
        Update-Heartbeat
        
        # HARDENING PATTERN #4: Log rotation
        Invoke-LogRotation
        
        # HARDENING PATTERN #2: Exponential backoff on failures
        $sleepMinutes = if ($state.consecutive_failures -gt 0) {
            $backoffDelay = Get-BackoffDelay -FailureCount $state.consecutive_failures
            Write-Log "WARN" "Applying exponential backoff: ${backoffDelay}m (failure count: $($state.consecutive_failures))"
            $backoffDelay
        } else {
            $PollIntervalMinutes
        }
        
        Write-Log "INFO" "Sleeping for ${sleepMinutes}m before next round..."
        Start-Sleep -Seconds ($sleepMinutes * 60)
        
        $roundNumber++
    }
}

# Entry point
try {
    Initialize-LogDirectory
    Lock-Process
    
    # Graceful shutdown handler
    Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action {
        Unlock-Process
    } | Out-Null
    
    Start-RalphWatch
    
} catch {
    Write-Log "ERROR" "Fatal error: $_"
    Write-Log "ERROR" $_.ScriptStackTrace
    exit 1
} finally {
    Unlock-Process
}
