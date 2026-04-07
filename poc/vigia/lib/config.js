/**
 * ============================================================
 *  lib/config.js — VIGÍA CLI configuration loader
 * ============================================================
 *
 *  Loads config from JSON file (--config) and merges with CLI
 *  flags. CLI flags always win over config file values.
 *
 *  — zero SDK dependencies (uses only node: builtins)
 * ============================================================
 */

import { readFile } from "node:fs/promises";

const SEVERITY_LEVELS = ["info", "minor", "major", "critical"];

const DEFAULTS = {
  urls: [],
  visible: false,
  maxTurns: 15,
  viewportPresets: {
    desktop: { width: 1280, height: 720 },
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
  },
  severityThreshold: "info",
  outputFormat: "md",
  quiet: false,
};

/**
 * Loads a config file from disk.
 * @param {string} configPath
 * @returns {Promise<object>}
 */
export async function loadConfigFile(configPath) {
  const raw = await readFile(configPath, "utf-8");
  return JSON.parse(raw);
}

/**
 * Parses CLI arguments into a structured config object.
 * @param {string[]} argv — process.argv.slice(2)
 * @returns {{ config: object, isCompare: boolean, compareFiles: string[], showHelp: boolean }}
 */
export function parseArgs(argv) {
  const result = {
    urls: [],
    visible: false,
    configPath: null,
    severityThreshold: null,
    outputFormat: null,
    quiet: false,
    showHelp: false,
    isCompare: false,
    compareFiles: [],
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    switch (arg) {
      case "--help":
      case "-h":
        result.showHelp = true;
        break;

      case "--url":
        if (argv[i + 1] && !argv[i + 1].startsWith("--")) {
          result.urls.push(argv[++i]);
        }
        break;

      case "--visible":
        result.visible = true;
        break;

      case "--config":
        if (argv[i + 1] && !argv[i + 1].startsWith("--")) {
          result.configPath = argv[++i];
        }
        break;

      case "--severity-threshold":
        if (argv[i + 1] && !argv[i + 1].startsWith("--")) {
          result.severityThreshold = argv[++i];
        }
        break;

      case "--output-format":
        if (argv[i + 1] && !argv[i + 1].startsWith("--")) {
          result.outputFormat = argv[++i];
        }
        break;

      case "--quiet":
      case "-q":
        result.quiet = true;
        break;

      case "--compare":
        result.isCompare = true;
        while (i + 1 < argv.length && !argv[i + 1].startsWith("--")) {
          result.compareFiles.push(argv[++i]);
        }
        break;

      default:
        // ignore unknown flags silently for forward compat
        break;
    }
  }

  return result;
}

/**
 * Merges defaults ← config file ← CLI flags (CLI wins).
 * @param {object} cliArgs — from parseArgs()
 * @param {object|null} fileConfig — from loadConfigFile()
 * @returns {object} final config
 */
export function mergeConfig(cliArgs, fileConfig = null) {
  const file = fileConfig || {};

  const config = {
    urls: cliArgs.urls.length > 0
      ? [...new Set(cliArgs.urls)]
      : file.urls?.length > 0
        ? [...new Set(file.urls)]
        : DEFAULTS.urls,
    visible: cliArgs.visible || file.visible || DEFAULTS.visible,
    maxTurns: file.maxTurns ?? DEFAULTS.maxTurns,
    viewportPresets: { ...DEFAULTS.viewportPresets, ...file.viewportPresets },
    severityThreshold: cliArgs.severityThreshold ?? file.severityThreshold ?? DEFAULTS.severityThreshold,
    outputFormat: cliArgs.outputFormat ?? file.outputFormat ?? DEFAULTS.outputFormat,
    quiet: cliArgs.quiet || file.quiet || DEFAULTS.quiet,
  };

  // Validate severity threshold
  if (!SEVERITY_LEVELS.includes(config.severityThreshold)) {
    throw new Error(
      `Invalid severity threshold: "${config.severityThreshold}". Must be one of: ${SEVERITY_LEVELS.join(", ")}`
    );
  }

  // Validate output format
  const validFormats = ["md", "json", "html"];
  if (!validFormats.includes(config.outputFormat)) {
    throw new Error(
      `Invalid output format: "${config.outputFormat}". Must be one of: ${validFormats.join(", ")}`
    );
  }

  return config;
}

/**
 * Filters issues by severity threshold.
 * Only returns issues at the threshold level or above.
 * @param {Array} issues
 * @param {string} threshold
 * @returns {Array}
 */
export function filterBySeverity(issues, threshold) {
  if (!threshold || threshold === "info") return issues;
  const thresholdIdx = SEVERITY_LEVELS.indexOf(threshold);
  if (thresholdIdx === -1) return issues;
  return issues.filter((issue) => {
    const issueIdx = SEVERITY_LEVELS.indexOf(issue.severity);
    return issueIdx >= thresholdIdx;
  });
}

/**
 * Determines exit code based on issue severities.
 * Returns 1 if any critical issues exist, 0 otherwise.
 * @param {Array} issues
 * @returns {number}
 */
export function getExitCode(issues) {
  return issues.some((i) => i.severity === "critical") ? 1 : 0;
}

/**
 * Prints CLI help to stdout.
 */
export function printHelp() {
  const help = `
╔══════════════════════════════════════════════════════╗
║  🔍 VIGÍA — Tester Autónomo de Apps Web              ║
║  v0.7.0 — CLI profesional                           ║
╚══════════════════════════════════════════════════════╝

USAGE:
  node vigia.js [options]

OPTIONS:
  --url <url>                 URL to test (repeatable for multi-URL)
  --visible                   Run browser in headed mode (default: headless)
  --config <path>             Load config from JSON file
  --severity-threshold <lvl>  Only report issues at this level or above
                              Levels: info < minor < major < critical
  --output-format <fmt>       Report format: md (default), json, html
  --quiet, -q                 Suppress terminal output, only write report
  --compare <f1> <f2>         Compare two JSON report files and exit
  --help, -h                  Show this help message

CONFIG FILE (vigia.config.json):
  {
    "urls": ["https://example.com"],
    "visible": false,
    "maxTurns": 15,
    "severityThreshold": "minor",
    "outputFormat": "md",
    "quiet": false,
    "viewportPresets": {
      "desktop": { "width": 1280, "height": 720 },
      "mobile": { "width": 375, "height": 667 }
    }
  }

  CLI flags override config file values.

EXIT CODES:
  0  No critical issues found
  1  Critical issues detected (or error)

EXAMPLES:
  node vigia.js --url https://example.com
  node vigia.js --url https://site1.com --url https://site2.com --visible
  node vigia.js --config vigia.config.json
  node vigia.js --url https://example.com --severity-threshold major --quiet
  node vigia.js --url https://example.com --output-format json
  node vigia.js --compare report1.json report2.json
`;
  console.log(help);
}

export { SEVERITY_LEVELS };
