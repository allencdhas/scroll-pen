# Punishment Wallet

> "If I waste time, my wallet punishes me automatically."

A terminal-based discipline system that monitors your browser activity and triggers a real on-chain ETH penalty via **KeeperHub** when you spend too long on distracting sites.

---

## How it works

```
Browser URL (AppleScript)
       ↓
  Domain Filter  ──── not blocked? → ignore
       ↓ blocked
  Time Tracker   ──── accumulates session time
       ↓
 Violation Detector ── 80% → warning / 100% → fire
       ↓
  KeeperHub Webhook  ── triggers Sepolia ETH transfer
       ↓
  On-chain Transaction ✓
```

---

## Requirements

- **macOS** (AppleScript-based URL detection)
- **Node.js 20+**
- **Chrome, Brave, or Safari** as your browser
- A **KeeperHub** account with a pre-configured ETH transfer workflow
- A **Sepolia testnet wallet** funded with a small amount of ETH

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` and set your KeeperHub webhook URL:

```
KEEPERHUB_WEBHOOK_URL=https://app.keeperhub.io/webhook/YOUR_WORKFLOW_ID
```

If your KeeperHub Webhook Trigger has authentication enabled, also set:

```
KEEPERHUB_AUTH_TOKEN=YOUR_KEEPERHUB_AUTH_TOKEN
```

If you paste only the token, the app sends `Authorization: Bearer <token>`.
If you paste `Bearer <token>` or `Basic <token>`, the app sends it exactly as provided.

### 3. Set up KeeperHub

1. Sign in at [KeeperHub](https://keeperhub.io)
2. Create a new **Workflow**
3. Add a **Webhook Trigger** — copy the generated URL to your `.env`
4. If webhook authentication is enabled, copy the auth token/key to `KEEPERHUB_AUTH_TOKEN`
5. Add an **ETH Transfer action** targeting your Sepolia wallet
6. Set the transfer amount to match what you'll pass as `--penalty`

### 4. Grant Accessibility permissions (first run)

macOS requires explicit permission for AppleScript to read browser tab URLs.

- Go to **System Settings → Privacy & Security → Automation**
- Allow **Terminal** (or your terminal app) to control **Google Chrome / Safari**

---

## Usage

```bash
node src/cli.js --limit <duration> --penalty <eth> [--domains <list>]
```

| Flag | Required | Description |
|------|----------|-------------|
| `--limit` / `-l` | Yes | Time limit before punishment fires, e.g. `10`, `10m`, `30s` |
| `--penalty` / `-p` | Yes | Penalty amount in ETH (sent to your Sepolia wallet) |
| `--domains` / `-d` | No | Comma-separated blocked domains (overrides the default list) |

### Examples

```bash
# 10-minute limit, 0.001 ETH penalty, default blocked sites
node src/cli.js --limit 10 --penalty 0.001

# 30-second demo
node src/cli.js --limit 30s --penalty 0.001

# 1-minute demo with custom domain list
node src/cli.js --limit 1m --penalty 0.001 --domains "youtube.com,reddit.com"

# npm shortcut (1-min demo)
npm run dev
```

---

## Default blocked domains

`youtube.com`, `instagram.com`, `netflix.com`, `twitter.com`, `x.com`,
`reddit.com`, `tiktok.com`, `twitch.tv`, `facebook.com`

Override with `--domains` or set `BLOCKED_DOMAINS` in `.env`.

---

## What the terminal looks like

```
  PUNISHMENT WALLET

  Limit    1 min  →  01:00
  Penalty  0.001 ETH  on Sepolia testnet
  Watching youtube.com, instagram.com ...

  Polling every 5 s via AppleScript · Ctrl+C to stop
  ────────────────────────────────────────────────────

  → entered  11:42:03  youtube.com
  ██████████████░░░░░░░░░░░░░░░░  00:28 / 01:00   46%  youtube.com

  ⚡ WARNING  11:42:51  00:48 / 01:00 — 80% of limit consumed!

  ████████████████████████████████  01:00 / 01:00  100%  youtube.com

  ⚠  VIOLATION TRIGGERED
  You spent 01:00 on youtube.com
  Penalty: 0.001 ETH → Sepolia testnet

  Contacting KeeperHub... ✓ webhook accepted
  KeeperHub response: {"status":"queued","txHash":"0xabc..."}

  Punishment dispatched. Check Sepolia Etherscan for the tx.
```

---

## Project structure

```
src/
├── cli.js        Entry point — argument parsing, live timer, event wiring
├── monitor.js    AppleScript polling — active browser tab URL (every 5 s)
├── filter.js     Domain matching — checks URL against blocked list
├── tracker.js    Time accumulation — pause/resume on domain enter/exit
├── detector.js   Threshold checks — fires warning at 80%, violation at 100%
└── keeper.js     KeeperHub integration — POST webhook on violation
```

---

## Security

- **No private keys in code** — KeeperHub owns the wallet and executes the transfer
- All secrets live in `.env` which is git-ignored
- Uses testnet (Sepolia) — no real funds at risk during development

---

## Hackathon demo script

1. `node src/cli.js --limit 1 --penalty 0.001`
2. Open **youtube.com** in Chrome
3. Watch the timer climb in the terminal
4. At ~48 s: warning fires
5. At 60 s: violation triggers → KeeperHub webhook fires
6. Open [Sepolia Etherscan](https://sepolia.etherscan.io) and show the confirmed tx

---

## Future enhancements

- Daily / weekly aggregate limits (not just per-session)
- Streak rewards for discipline
- Multiple punishment types (ERC-20 burn, NFT lock)
- Browser extension for more reliable URL detection
- Windows / Linux support via `active-win`
