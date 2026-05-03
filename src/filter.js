/**
 * filter.js
 *
 * Matches a URL against a list of blocked domains using hostname substring
 * matching (e.g. "youtube.com" matches "www.youtube.com" and "m.youtube.com").
 */

export const DEFAULT_BLOCKED_DOMAINS = [
  'youtube.com',
  'instagram.com',
  'netflix.com',
  'twitter.com',
  'x.com',
  'reddit.com',
  'tiktok.com',
  'twitch.tv',
  'facebook.com',
];

/**
 * Parse a domain list from an environment variable or CLI flag value.
 * Accepts a comma-separated string; trims whitespace and lowercases each entry.
 *
 * @param {string} raw  e.g. "youtube.com, netflix.com"
 * @returns {string[]}
 */
export function parseDomains(raw) {
  return raw
    .split(',')
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Check whether a URL matches any blocked domain.
 *
 * @param {string | null} url            The URL to check (may be null).
 * @param {string[]}      blockedDomains List of domain strings to block.
 * @returns {string | null}              The matched blocked domain, or null.
 */
export function matchDomain(url, blockedDomains) {
  if (!url) return null;

  let hostname;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }

  for (const domain of blockedDomains) {
    // Substring match: "youtube.com" matches "www.youtube.com"
    if (hostname === domain || hostname.endsWith(`.${domain}`)) {
      return domain;
    }
  }
  return null;
}
