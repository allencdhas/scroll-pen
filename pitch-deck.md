# Punishment Wallet — Pitch Deck Content

## Slide 1 — Title

# Punishment Wallet

### If I waste time, my wallet punishes me automatically.

A terminal-based discipline agent that turns digital distraction into real on-chain consequences.

**Built with:** Node.js, browser activity monitoring, KeeperHub, Sepolia testnet

---

## Slide 2 — The Story Begins

Every builder knows the feeling.

You sit down to work. You open your laptop. You promise yourself:

> "Just one quick video. Just five minutes."

But five minutes becomes twenty. Twenty becomes an hour. The project waits. The deadline moves closer. And nothing actually stops you.

Most productivity apps can remind you. Some can block you. But reminders are easy to ignore, and blocks are easy to bypass.

So we asked a different question:

> What if wasting time had a real financial consequence?

---

## Slide 3 — The Problem

Digital distraction has no real cost in the moment.

The cost comes later:

- missed deadlines
- broken focus
- lost momentum
- unfinished work
- guilt after the damage is already done

Traditional tools only create soft friction:

- notifications
- screen-time reports
- app blockers
- habit trackers

But none of them create accountability that feels immediate, automatic, and unavoidable.

---

## Slide 4 — The Vision

## A future where agents help us keep promises to ourselves.

Punishment Wallet is not just a productivity tool.

It is a self-discipline contract.

The user defines a rule:

> "If I spend more than 30 seconds on YouTube, transfer 0.001 ETH from my wallet."

Then an agent watches, measures, decides, and executes.

No negotiation.
No excuses.
No "I'll stop after one more video."

The system turns intention into automation.

---

## Slide 5 — The Product

## Punishment Wallet is a terminal-based accountability agent.

The user starts the CLI and sets:

- a time limit
- a penalty amount
- a list of distracting domains

Then the tool runs in the background.

When the user visits a blocked site, the timer starts.
When the user leaves, the timer pauses.
When the limit is crossed, the agent triggers KeeperHub.

KeeperHub then executes the on-chain punishment transaction.

---

## Slide 6 — Simple User Flow

1. User opens the terminal
2. User runs:

```bash
node src/cli.js --limit 30s --penalty 0.001
```

3. User opens YouTube
4. Timer starts automatically
5. At 80%, the CLI shows a warning
6. At 100%, the violation is triggered
7. KeeperHub sends the on-chain transaction
8. User sees the transaction on Sepolia

The moment of distraction becomes visible, measurable, and costly.

---

## Slide 7 — Demo Moment

## The live demo is intentionally simple.

We set the limit to 30 seconds.

Then we open a blocked site like YouTube.

The terminal shows:

```text
→ entered youtube.com
████████████░░░░░░░░  00:18 / 00:30  60%
```

At 80%:

```text
WARNING — 80% of limit consumed
```

At 100%:

```text
VIOLATION TRIGGERED
Penalty: 0.001 ETH
Contacting KeeperHub...
Punishment dispatched.
```

Then we open Sepolia Etherscan and show the transaction.

---

## Slide 8 — Why This Is Different

Most productivity tools stop at awareness.

Punishment Wallet goes one step further:

> awareness → automation → consequence

It does not just tell the user they wasted time.
It enforces the rule they created.

This creates a new category of productivity tooling:

## Self-imposed autonomous accountability.

The user is still in control because they define the rule.
But once the rule is live, the agent enforces it without emotional bargaining.

---

## Slide 9 — System Architecture

The system is built as a simple trigger-action pipeline:

```text
Browser Activity Monitor
        ↓
Domain Filter
        ↓
Time Tracker
        ↓
Violation Detector
        ↓
KeeperHub Webhook
        ↓
On-chain Transaction
```

Each component has one job.

The browser monitor detects active tabs.
The domain filter checks if the site is distracting.
The tracker accumulates time.
The detector decides when a rule is broken.
KeeperHub executes the financial consequence.

---

## Slide 10 — Technical Implementation

## Built for a hackathon MVP.

The project is intentionally small, demoable, and easy to reason about.

Core modules:

- `cli.js` — terminal interface, live timer, and event wiring
- `monitor.js` — AppleScript-based browser URL detection
- `filter.js` — blocked-domain matching
- `tracker.js` — cumulative time tracking
- `detector.js` — warning and violation logic
- `keeper.js` — KeeperHub webhook integration

Tech stack:

- Node.js 20+
- Commander for CLI arguments
- AppleScript for macOS browser detection
- KeeperHub for on-chain execution
- Sepolia testnet for demo transactions

---

## Slide 11 — KeeperHub's Role

KeeperHub is the execution layer.

The local agent does not hold private keys.
It does not sign transactions.
It does not manage gas.

It only sends a webhook when the user breaks the rule.

KeeperHub receives the trigger and executes the pre-configured workflow:

```text
Webhook Trigger
      ↓
Transfer Funds on Sepolia
```

This keeps the local tool lightweight while still enabling real on-chain action.

---

## Slide 12 — Security Design

The MVP avoids the biggest security mistake:

## No private keys in code.

Security decisions:

- wallet execution is managed by KeeperHub
- secrets live in `.env`
- `.env` is git-ignored
- Sepolia testnet is used for demos
- only minimal testnet funds are needed

The local CLI is just the accountability agent.
KeeperHub is the trusted execution layer.

---

## Slide 13 — MVP Scope

The MVP focuses on proving one strong idea:

> A local agent can detect distraction and trigger an on-chain punishment automatically.

Included in MVP:

- terminal CLI
- seconds or minutes time limits
- blocked-domain tracking
- warning at 80%
- violation at 100%
- KeeperHub webhook call
- Sepolia transaction demo

Not included in MVP:

- browser extension
- mobile app
- Windows/Linux support
- daily usage dashboard
- streak rewards
- multiple penalty types

---

## Slide 14 — Who Is This For?

Punishment Wallet is for people who want stronger accountability:

- hackers during a build sprint
- students during exam season
- freelancers protecting deep work
- founders trying to avoid distraction loops
- anyone who says "I need real consequences"

This is not designed for passive tracking.

It is designed for people who voluntarily choose a rule and want an agent to enforce it.

---

## Slide 15 — Bigger Possibility

Punishment Wallet starts with distraction.

But the deeper idea is bigger:

## Personal rules can become autonomous workflows.

Examples:

- If I miss a workout, donate to a rival cause
- If I skip a study session, lock funds
- If I hit my focus goal, release a reward
- If I break a habit streak, trigger a public accountability message

This is programmable self-discipline.

Agents become not just assistants, but commitment enforcers.

---

## Slide 16 — Business / Product Direction

Possible future versions:

1. Browser extension for accurate cross-browser tracking
2. Dashboard for daily and weekly limits
3. Reward mode for positive reinforcement
4. Group accountability pools
5. DAO or team productivity challenges
6. Multiple punishment types:
   - ETH transfer
   - token burn
   - donation
   - NFT lock
   - public shame webhook

The MVP proves the mechanism.
The product can grow into a full accountability platform.

---

## Slide 17 — Why Now?

Three things are becoming normal at the same time:

1. AI agents can monitor and act on user-defined goals
2. Web3 wallets can execute programmable financial actions
3. Automation platforms like KeeperHub make on-chain execution accessible

Punishment Wallet sits at the intersection:

## AI-style agency + personal productivity + on-chain automation

The result is a new kind of commitment system.

---

## Slide 18 — The Punchline

We do not need another app that says:

> "You spent 3 hours on YouTube today."

We need systems that ask:

> "What did you promise yourself, and should I enforce it now?"

Punishment Wallet turns that promise into code.

It watches.
It measures.
It decides.
It triggers.

And when you break your own rule, your wallet remembers.

---

## Slide 19 — Closing

# Punishment Wallet

### Turn intention into automation.
### Turn distraction into accountability.
### Turn self-discipline into an on-chain workflow.

**Demo:** terminal agent watches YouTube usage and triggers a Sepolia ETH penalty through KeeperHub.

**Vision:** autonomous agents that help humans keep promises to themselves.

---

## Slide 20 — Optional Q&A Slide

## Questions

Possible judge questions:

- Why use blockchain here?
- Why KeeperHub instead of signing locally?
- How accurate is browser tracking?
- How do you prevent abuse?
- What happens if the user closes the app?
- Could this become a browser extension?
- Could it reward good behavior instead of only punishing bad behavior?

Short answer:

> This MVP proves the core loop: detect behavior, evaluate a rule, trigger autonomous on-chain execution. The mechanism can evolve into safer, richer, and more positive accountability systems.
