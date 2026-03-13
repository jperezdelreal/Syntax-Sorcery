/**
 * parse-ralph-logs.js — Ralph-Watch Log Parser & Dashboard Server
 *
 * Parses ralph-watch.ps1 log files from .squad/ralph-watch/ and serves
 * the monitoring dashboard at http://localhost:3838.
 *
 * Usage:
 *   node scripts/parse-ralph-logs.js          # Start dashboard server
 *   node scripts/parse-ralph-logs.js --json   # Output parsed JSON to stdout
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const LOG_DIR = path.join(process.cwd(), '.squad', 'ralph-watch');
const HEARTBEAT_FILE = path.join(LOG_DIR, 'heartbeat.txt');
const STATE_FILE = path.join(LOG_DIR, 'state.json');
const SITE_DIR = path.join(process.cwd(), 'site');
const PORT = 3838;
const TAIL_LINES = 100;

const LOG_LINE_RE = /^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] \[(\w+)\] (.+)$/;

/**
 * Find the most recent log file(s) in the log directory.
 */
function findLogFiles() {
  if (!fs.existsSync(LOG_DIR)) return [];
  return fs.readdirSync(LOG_DIR)
    .filter(f => f.endsWith('.log'))
    .sort()
    .reverse();
}

/**
 * Read the last N lines from a file.
 */
function tailFile(filePath, lines) {
  if (!fs.existsSync(filePath)) return [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const allLines = content.split(/\r?\n/).filter(l => l.trim());
  return allLines.slice(-lines);
}

/**
 * Parse a single log line into a structured entry.
 */
function parseLogLine(line) {
  const match = line.match(LOG_LINE_RE);
  if (!match) return null;
  return { timestamp: match[1], level: match[2], message: match[3] };
}

/**
 * Read and parse the heartbeat file.
 */
function readHeartbeat() {
  try {
    if (!fs.existsSync(HEARTBEAT_FILE)) return null;
    return JSON.parse(fs.readFileSync(HEARTBEAT_FILE, 'utf-8'));
  } catch { return null; }
}

/**
 * Read and parse the state file.
 */
function readState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return null;
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch { return null; }
}

/**
 * Parse the last 100 lines from the most recent log files
 * and extract dashboard metrics.
 */
function parseLogs() {
  const logFiles = findLogFiles();
  const logDir = LOG_DIR;

  // Collect last 100 lines across log files (most recent first)
  let lines = [];
  for (const file of logFiles) {
    if (lines.length >= TAIL_LINES) break;
    const remaining = TAIL_LINES - lines.length;
    const filePath = path.join(logDir, file);
    const fileLines = tailFile(filePath, remaining);
    lines = fileLines.concat(lines);
  }

  // Keep only the last 100
  lines = lines.slice(-TAIL_LINES);

  const entries = lines.map(parseLogLine).filter(Boolean);

  // Extract metrics
  const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null;
  const lastRunTimestamp = lastEntry ? lastEntry.timestamp : 'No data';

  // Repos monitored: scan all entries in the most recent log file for config info
  let reposMonitored = [];
  if (logFiles.length > 0) {
    const fullPath = path.join(logDir, logFiles[0]);
    const allFileLines = fs.readFileSync(fullPath, 'utf-8')
      .split(/\r?\n/).filter(l => l.trim());
    for (const line of allFileLines) {
      const parsed = parseLogLine(line);
      if (!parsed) continue;
      const repoMatch = parsed.message.match(/^Monitoring (\d+) repositories: (.+)$/);
      if (repoMatch) {
        reposMonitored = repoMatch[2].split(', ').map(r => r.trim());
      }
    }
  }

  // Also check the last 100 entries as fallback
  if (reposMonitored.length === 0) {
    for (let i = entries.length - 1; i >= 0; i--) {
      const msg = entries[i].message;
      const repoMatch = msg.match(/^Monitoring (\d+) repositories: (.+)$/);
      if (repoMatch) {
        reposMonitored = repoMatch[2].split(', ').map(r => r.trim());
        break;
      }
    }
  }

  // Refueling events: lines with "Refueling" or "refueling" or "refuel"
  const refuelingEvents = entries.filter(e =>
    /refuel/i.test(e.message) || /Starting refueling/i.test(e.message)
  );

  // Error count
  const errors = entries.filter(e => e.level === 'ERROR');
  const warnings = entries.filter(e => e.level === 'WARN');
  const successes = entries.filter(e => e.level === 'SUCCESS');

  // Round info
  const rounds = entries.filter(e => /^=== Round \d+ started ===$/.test(e.message));
  const lastRound = rounds.length > 0 ? rounds[rounds.length - 1] : null;
  const lastRoundNumber = lastRound
    ? lastRound.message.match(/Round (\d+)/)?.[1] || '?'
    : '0';

  // Heartbeat & state
  const heartbeat = readHeartbeat();
  const state = readState();

  return {
    generatedAt: new Date().toISOString(),
    lastRunTimestamp,
    reposMonitored,
    repoCount: reposMonitored.length,
    lastRoundNumber,
    totalRounds: rounds.length,
    refuelingEvents: refuelingEvents.slice(-10).map(e => ({
      timestamp: e.timestamp,
      message: e.message
    })),
    errorCount: errors.length,
    warningCount: warnings.length,
    successCount: successes.length,
    recentErrors: errors.slice(-5).map(e => ({
      timestamp: e.timestamp,
      message: e.message
    })),
    heartbeat: heartbeat ? {
      timestamp: heartbeat.timestamp,
      status: heartbeat.status,
      version: heartbeat.version
    } : null,
    consecutiveFailures: state?.consecutive_failures ?? 0,
    lastSuccess: state?.last_success ?? null,
    logFilesFound: logFiles.length,
    entriesParsed: entries.length,
    recentEntries: entries.slice(-20).map(e => ({
      timestamp: e.timestamp,
      level: e.level,
      message: e.message
    }))
  };
}

/**
 * Serve the dashboard on a local HTTP server.
 */
function startServer() {
  const server = http.createServer((req, res) => {
    if (req.url === '/api/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(parseLogs(), null, 2));
      return;
    }

    if (req.url === '/styles/dashboard.css') {
      const cssPath = path.join(SITE_DIR, 'styles', 'dashboard.css');
      if (fs.existsSync(cssPath)) {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(fs.readFileSync(cssPath, 'utf-8'));
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
      return;
    }

    if (req.url === '/' || req.url === '/index.html') {
      const htmlPath = path.join(SITE_DIR, 'ralph-watch-status.html');
      if (fs.existsSync(htmlPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(fs.readFileSync(htmlPath, 'utf-8'));
      } else {
        res.writeHead(404);
        res.end('Dashboard HTML not found');
      }
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  });

  server.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`\n  ⚡ Ralph-Watch Dashboard running at ${url}\n`);

    // Open browser
    const { exec } = require('child_process');
    const cmd = process.platform === 'win32' ? `start ${url}`
      : process.platform === 'darwin' ? `open ${url}`
      : `xdg-open ${url}`;
    exec(cmd);
  });
}

// CLI entry point
if (require.main === module) {
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(parseLogs(), null, 2));
  } else {
    startServer();
  }
}

module.exports = { parseLogs, parseLogLine, findLogFiles, tailFile };
