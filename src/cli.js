#!/usr/bin/env node
/**
 * cli.js — Punishment Wallet entry point
 *
 * Usage:
 *   node src/cli.js --limit 10    --penalty 0.001   (10 minutes)
 *   node src/cli.js --limit 10m   --penalty 0.001   (10 minutes)
 *   node src/cli.js --limit 90s   --penalty 0.001   (90 seconds)
 *   node src/cli.js --limit 5     --penalty 0.005 --domains "youtube.com,reddit.com"
 */

import 'dotenv/config';
import { program } from 'commander';
import { startMonitor, POLL_INTERVAL_MS } from './monitor.js';
import { matchDomain, DEFAULT_BLOCKED_DOMAINS, parseDomains } from './filter.js';
import { createTracker } from './tracker.js';
import { createDetector } from './detector.js';
import { triggerPunishment } from './keeper.js';

// ─── ANSI helpers ─────────────────────────────────────────────────────────────

const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const GREEN  = '\x1b[32m';
const CYAN   = '\x1b[36m';
const WHITE  = '\x1b[37m';

const c = {
  bold:    (s) => `${BOLD}${s}${RESET}`,
  dim:     (s) => `${DIM}${s}${RESET}`,
  red:     (s) => `${RED}${s}${RESET}`,
  yellow:  (s) => `${YELLOW}${s}${RESET}`,
  green:   (s) => `${GREEN}${s}${RESET}`,
  cyan:    (s) => `${CYAN}${s}${RESET}`,
  white:   (s) => `${WHITE}${s}${RESET}`,
};

// ─── Formatting helpers ────────────────────────────────────────────────────────

function formatMs(ms) {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const s = (totalSec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function progressBar(ratio, width = 30) {
  const filled = Math.min(Math.round(ratio * width), width);
  const empty  = width - filled;
  const color  = ratio >= 1 ? RED : ratio >= 0.8 ? YELLOW : GREEN;
  return `${color}${'█'.repeat(filled)}${DIM}${'░'.repeat(empty)}${RESET}`;
}

function timestamp() {
  return new Date().toLocaleTimeString();
}

/**
 * Parse a duration string into milliseconds.
 * Accepts:
 *   "90s"  → 90 seconds
 *   "10m"  → 10 minutes
 *   "1.5m" → 90 seconds
 *   "10"   → 10 minutes (plain number defaults to minutes)
 *
 * @param {string} raw
 * @returns {{ ms: number, display: string } | null}  null on invalid input
 */
function parseDuration(raw) {
  const str = String(raw).trim().toLowerCase();

  const secondsMatch = str.match(/^(\d+(?:\.\d+)?)s$/);
  if (secondsMatch) {
    const sec = parseFloat(secondsMatch[1]);
    if (sec > 0) return { ms: sec * 1000, display: `${sec}s` };
  }

  const minutesMatch = str.match(/^(\d+(?:\.\d+)?)m?$/);
  if (minutesMatch) {
    const min = parseFloat(minutesMatch[1]);
    if (min > 0) return { ms: min * 60 * 1000, display: `${min}m` };
  }

  return null;
}

// ─── CLI definition ────────────────────────────────────────────────────────────

program
  .name('punishment-wallet')
  .description('Punishes wasted time with an on-chain ETH penalty via KeeperHub.')
  .requiredOption('-l, --limit <duration>',  'Time limit before punishment fires — e.g. 10, 10m, 90s')
  .requiredOption('-p, --penalty <eth>',     'Penalty amount in ETH (e.g. 0.001)', parseFloat)
  .option('-d, --domains <list>',            'Comma-separated list of blocked domains (overrides defaults)')
  .parse();

const opts = program.opts();

// ─── Validate inputs ───────────────────────────────────────────────────────────

const duration = parseDuration(opts.limit);
if (!duration) {
  console.error(c.red('Error: --limit must be a positive duration, e.g. 10, 10m, or 90s.'));
  process.exit(1);
}
if (isNaN(opts.penalty) || opts.penalty <= 0) {
  console.error(c.red('Error: --penalty must be a positive number (ETH).'));
  process.exit(1);
}

const limitMs    = duration.ms;
const penaltyEth = opts.penalty;
const blockedDomains = opts.domains
  ? parseDomains(opts.domains)
  : DEFAULT_BLOCKED_DOMAINS;

// ─── Boot banner ───────────────────────────────────────────────────────────────

console.clear();
console.log(`${BOLD}${CYAN}
  ██████╗ ██╗   ██╗███╗   ██╗██╗███████╗██╗  ██╗
  ██╔══██╗██║   ██║████╗  ██║██║██╔════╝██║  ██║
  ██████╔╝██║   ██║██╔██╗ ██║██║███████╗███████║
  ██╔═══╝ ██║   ██║██║╚██╗██║██║╚════██║██╔══██║
  ██║     ╚██████╔╝██║ ╚████║██║███████║██║  ██║
  ╚═╝      ╚═════╝ ╚═╝  ╚═══╝╚═╝╚══════╝╚═╝  ╚═╝
  ${RESET}${BOLD}WALLET${RESET}`);

console.log('');
  console.log(`  ${c.bold('Limit')}    ${c.cyan(duration.display)}  →  ${c.dim(formatMs(limitMs))}`);
console.log(`  ${c.bold('Penalty')}  ${c.red(penaltyEth + ' ETH')}  on Sepolia testnet`);
console.log(`  ${c.bold('Watching')} ${blockedDomains.map((d) => c.yellow(d)).join(', ')}`);
console.log('');
console.log(c.dim('  Polling every 5 s via AppleScript · Ctrl+C to stop'));
console.log(c.dim('─'.repeat(60)));
console.log('');

// ─── Core modules ─────────────────────────────────────────────────────────────

const tracker  = createTracker();
let lastDomain = null; // track domain changes for log messages

// ─── Violation handler ────────────────────────────────────────────────────────

async function handleViolation(sessionMs) {
  const domain = tracker.getCurrentDomain() ?? lastDomain ?? 'unknown';

  renderStatus(sessionMs); // final render before the violation block
  console.log('');
  console.log(c.red(c.bold('  ⚠  VIOLATION TRIGGERED')));
  console.log(`  ${c.dim('You spent')} ${c.bold(formatMs(sessionMs))} ${c.dim('on')} ${c.yellow(domain)}`);
  console.log(`  ${c.dim('Penalty:')} ${c.red(c.bold(penaltyEth + ' ETH'))} ${c.dim('→ Sepolia testnet')}`);
  console.log('');
  process.stdout.write(`  ${c.dim('Contacting KeeperHub...')} `);

  try {
    const result = await triggerPunishment({
      domain,
      penaltyEth,
      sessionMs,
      limitMs,
      timestamp: new Date().toISOString(),
    });

    if (result.ok) {
      console.log(c.green('✓ webhook accepted'));
      console.log(`  ${c.dim('KeeperHub response:')} ${c.dim(result.body.slice(0, 120))}`);
      console.log('');
      console.log(c.green(c.bold('  Punishment dispatched. Check Sepolia Etherscan for the tx.')));
    } else {
      console.log(c.red(`✗ HTTP ${result.status}`));
      console.log(`  ${c.dim('Response:')} ${result.body.slice(0, 200)}`);
    }
  } catch (err) {
    console.log(c.red('✗ failed'));
    console.log(`  ${c.dim('Error:')} ${err.message}`);
    if (err.message.includes('KEEPERHUB_WEBHOOK_URL')) {
      console.log('');
      console.log(`  ${c.yellow('Hint:')} copy ${c.cyan('.env.example')} to ${c.cyan('.env')} and set KEEPERHUB_WEBHOOK_URL.`);
    }
  }

  console.log('');
  console.log(c.dim('  Session ended. Restart to begin a new session.'));
}

// ─── Detector ─────────────────────────────────────────────────────────────────

const detector = createDetector(limitMs, {
  onWarning(sessionMs, limitMs) {
    process.stdout.write('\r' + ' '.repeat(80) + '\r'); // clear current line
    console.log(
      `  ${c.yellow('⚡ WARNING')}  ${c.dim(timestamp())}  ` +
      `${c.yellow(formatMs(sessionMs))} / ${c.dim(formatMs(limitMs))} ` +
      `${c.dim('— 80% of limit consumed!')}`
    );
  },
  onViolation(sessionMs) {
    // Stop the monitor; handle asynchronously so we don't block the interval.
    stopMonitor();
    clearInterval(refreshId);
    handleViolation(sessionMs).finally(() => process.exit(0));
  },
});

// ─── Monitor callback (fires every POLL_INTERVAL_MS) ─────────────────────────

function onPoll(url) {
  const matched = matchDomain(url, blockedDomains);
  tracker.tick(matched);

  // Log domain entry / exit events
  if (matched && matched !== lastDomain) {
    process.stdout.write('\r' + ' '.repeat(80) + '\r');
    console.log(
      `  ${c.cyan('→ entered')}  ${c.dim(timestamp())}  ${c.yellow(matched)}`
    );
    lastDomain = matched;
  } else if (!matched && lastDomain !== null) {
    process.stdout.write('\r' + ' '.repeat(80) + '\r');
    console.log(
      `  ${c.dim('← left')}     ${c.dim(timestamp())}  ${c.dim(lastDomain)}`
    );
    lastDomain = null;
  }
}

// ─── Live status line (refreshes every second) ────────────────────────────────

function renderStatus(sessionMs) {
  const ratio   = Math.min(sessionMs / limitMs, 1);
  const bar     = progressBar(ratio);
  const elapsed = formatMs(sessionMs);
  const limit   = formatMs(limitMs);
  const pct     = Math.floor(ratio * 100).toString().padStart(3);
  const domain  = tracker.isOnSite()
    ? c.yellow(tracker.getCurrentDomain() ?? '')
    : c.dim('waiting...');

  const line =
    `  ${bar}  ${c.bold(elapsed)} / ${c.dim(limit)}  ${pct}%  ${domain}`;

  process.stdout.write('\r' + line);
}

const refreshId = setInterval(() => {
  const sessionMs = tracker.getSessionMs();
  detector.check(sessionMs);

  if (!detector.hasViolated()) {
    renderStatus(sessionMs);
  }
}, 1_000);

// ─── Start monitor ────────────────────────────────────────────────────────────

const stopMonitor = startMonitor(onPoll);

// ─── Graceful shutdown ────────────────────────────────────────────────────────

function shutdown() {
  stopMonitor();
  clearInterval(refreshId);
  process.stdout.write('\r' + ' '.repeat(80) + '\r');
  console.log('');
  console.log(c.dim('  Session stopped.') + '  Total on-site time: ' + c.bold(formatMs(tracker.getSessionMs())));
  console.log('');
  process.exit(0);
}

process.on('SIGINT',  shutdown);
process.on('SIGTERM', shutdown);
