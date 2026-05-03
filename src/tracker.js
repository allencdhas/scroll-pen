/**
 * tracker.js
 *
 * Accumulates the total time a user spends on blocked sites within a session.
 * Time is counted in milliseconds and paused whenever the user leaves a
 * blocked domain (URL no longer matches) or the monitor returns null.
 */

export function createTracker() {
  let sessionMs = 0;       // Total accumulated on-site time
  let segmentStart = null; // Timestamp (ms) when the current on-site segment began
  let currentDomain = null; // The blocked domain currently being tracked

  /**
   * Call on every poll tick with the matched domain (or null).
   * Accumulates time while on-site; pauses when off-site.
   *
   * @param {string | null} matchedDomain  The blocked domain currently active, or null.
   */
  function tick(matchedDomain) {
    const now = Date.now();

    if (matchedDomain) {
      if (segmentStart === null) {
        // User just arrived on a blocked site — start a new segment.
        segmentStart = now;
        currentDomain = matchedDomain;
      }
      // Still on a blocked site — nothing to do; we accumulate on read.
    } else {
      if (segmentStart !== null) {
        // User just left a blocked site — close the open segment.
        sessionMs += now - segmentStart;
        segmentStart = null;
        currentDomain = null;
      }
    }
  }

  /**
   * Total accumulated milliseconds on blocked sites, including any currently
   * open segment.
   *
   * @returns {number}
   */
  function getSessionMs() {
    if (segmentStart !== null) {
      return sessionMs + (Date.now() - segmentStart);
    }
    return sessionMs;
  }

  /**
   * Whether the user is currently on a blocked site.
   * @returns {boolean}
   */
  function isOnSite() {
    return segmentStart !== null;
  }

  /**
   * The blocked domain currently being tracked (or null if off-site).
   * @returns {string | null}
   */
  function getCurrentDomain() {
    return currentDomain;
  }

  /** Reset all state (useful for testing). */
  function reset() {
    sessionMs = 0;
    segmentStart = null;
    currentDomain = null;
  }

  return { tick, getSessionMs, isOnSite, getCurrentDomain, reset };
}
