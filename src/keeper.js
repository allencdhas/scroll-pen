/**
 * keeper.js
 *
 * Triggers a KeeperHub workflow via webhook when a violation is detected.
 * KeeperHub handles the actual on-chain ETH transfer on Sepolia testnet,
 * so no private key ever touches this process.
 *
 * Environment variables required:
 *   KEEPERHUB_WEBHOOK_URL  — the webhook URL for the pre-configured workflow
 *
 * Environment variables optional:
 *   KEEPERHUB_AUTH_TOKEN   — token for webhooks that require Authorization
 */

/**
 * @typedef {Object} PunishmentPayload
 * @property {string} domain       The blocked domain that triggered the violation.
 * @property {number} penaltyEth   Penalty amount in ETH.
 * @property {number} sessionMs    Total on-site time in milliseconds.
 * @property {number} limitMs      The configured time limit in milliseconds.
 * @property {string} timestamp    ISO 8601 timestamp of the violation.
 */

/**
 * Send a punishment trigger to the KeeperHub webhook.
 *
 * @param {PunishmentPayload} payload
 * @returns {Promise<{ ok: boolean; status: number; body: string }>}
 */
export async function triggerPunishment(payload) {
  const webhookUrl = process.env.KEEPERHUB_WEBHOOK_URL;
  const authToken = process.env.KEEPERHUB_AUTH_TOKEN;

  if (!webhookUrl) {
    throw new Error(
      'KEEPERHUB_WEBHOOK_URL is not set. Copy .env.example to .env and fill in your webhook URL.'
    );
  }

  const body = JSON.stringify({
    event: 'punishment_triggered',
    ...payload,
  });

  const headers = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers.Authorization = authToken.startsWith('Bearer ') || authToken.startsWith('Basic ')
      ? authToken
      : `Bearer ${authToken}`;
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers,
    body,
    signal: AbortSignal.timeout(10_000),
  });

  const responseBody = await response.text().catch(() => '');

  return {
    ok: response.ok,
    status: response.status,
    body: responseBody,
  };
}
