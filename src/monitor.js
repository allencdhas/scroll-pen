/**
 * monitor.js
 *
 * Polls the active browser tab URL every POLL_INTERVAL_MS using AppleScript.
 * Supports Chrome, Brave, and Safari on macOS.
 *
 * Returns null when no supported browser is in the foreground or the
 * frontmost window has no URL (e.g. a Settings page).
 */

import { execSync } from 'child_process';

export const POLL_INTERVAL_MS = 5_000;

// AppleScript per browser — each script returns the URL of the active tab
// or an empty string if the browser is not running / no window is open.
const SCRIPTS = {
  'Google Chrome': `
    tell application "Google Chrome"
      if not running then return ""
      if (count of windows) = 0 then return ""
      return URL of active tab of front window
    end tell`,

  'Brave Browser': `
    tell application "Brave Browser"
      if not running then return ""
      if (count of windows) = 0 then return ""
      return URL of active tab of front window
    end tell`,

  Safari: `
    tell application "Safari"
      if not running then return ""
      if (count of windows) = 0 then return ""
      return URL of front document
    end tell`,
};

/**
 * Run a single AppleScript and return trimmed stdout.
 * Returns empty string on any error (permission denied, app not running, etc.)
 */
function runScript(script) {
  try {
    return execSync(`osascript -e '${script.replace(/'/g, "\\'")}'`, {
      timeout: 3_000,
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

/**
 * Get the URL of the currently active browser tab.
 * Tries Chrome → Brave → Safari in order and returns the first non-empty result.
 *
 * @returns {string | null} Full URL string, or null if no URL could be read.
 */
export function getActiveTabUrl() {
  for (const [browser, script] of Object.entries(SCRIPTS)) {
    const url = runScript(script);
    if (url && url.startsWith('http')) {
      return url;
    }
  }
  return null;
}

/**
 * Start continuous polling of the active tab URL.
 *
 * @param {(url: string | null) => void} onPoll  Called every POLL_INTERVAL_MS with the current URL (or null).
 * @returns {() => void}  Stop function — call to cancel the interval.
 */
export function startMonitor(onPoll) {
  // Fire immediately so the first reading isn't delayed by POLL_INTERVAL_MS.
  onPoll(getActiveTabUrl());

  const id = setInterval(() => onPoll(getActiveTabUrl()), POLL_INTERVAL_MS);
  return () => clearInterval(id);
}
