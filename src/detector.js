/**
 * detector.js
 *
 * Watches the tracker's accumulated time against the configured limit.
 * Fires:
 *   - onWarning  once when 80% of the limit is consumed
 *   - onViolation once when 100% of the limit is consumed
 *
 * Both callbacks fire at most once per session.
 */

const WARNING_THRESHOLD = 0.8; // 80 %

/**
 * @typedef {Object} DetectorCallbacks
 * @property {(sessionMs: number, limitMs: number) => void} onWarning    Called at 80% usage.
 * @property {(sessionMs: number, limitMs: number) => void} onViolation  Called at 100% usage.
 */

/**
 * Create a detector that checks the tracker against a time limit.
 *
 * @param {number}            limitMs    Session time limit in milliseconds.
 * @param {DetectorCallbacks} callbacks
 */
export function createDetector(limitMs, { onWarning, onViolation }) {
  let warningSent = false;
  let violationSent = false;

  /**
   * Call on every UI refresh tick (e.g. every second) with current session ms.
   *
   * @param {number} sessionMs  Current accumulated time in ms.
   */
  function check(sessionMs) {
    if (!warningSent && sessionMs >= limitMs * WARNING_THRESHOLD) {
      warningSent = true;
      onWarning(sessionMs, limitMs);
    }

    if (!violationSent && sessionMs >= limitMs) {
      violationSent = true;
      onViolation(sessionMs, limitMs);
    }
  }

  /** Whether a violation has already been triggered this session. */
  function hasViolated() {
    return violationSent;
  }

  return { check, hasViolated };
}
