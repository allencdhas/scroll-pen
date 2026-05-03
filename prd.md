# 🐸 Punishment Wallet — Technical PRD (Terminal-Based)---## 1. 🎯 ObjectiveBuild a terminal-based automation tool that:- Monitors user browsing activity (entertainment sites)  - Tracks time spent on those sites  - If usage exceeds a defined limit, triggers an on-chain penalty transaction via KeeperHub  ---## 2. 🧠 Core Concept“If I waste time, my wallet punishes me automatically.”---## 3. 👤 User Flow1. User starts CLI tool  2. Sets:   - Time limit (for example, 10 minutes)     - Penalty amount (for example, 0.001 ETH)  3. Tool runs in background  4. User visits an entertainment site (YouTube, Instagram, etc.)  5. Timer starts  6. If usage exceeds limit:   - Agent flags violation     - KeeperHub workflow executes punishment  ---## 4. ⚙️ System Architecture
[Browser Activity Monitor]
↓
[Time Tracker Engine]
↓
[Violation Detector (Agent)]
↓
[KeeperHub API Trigger]
↓
[On-chain Transaction]
---## 5. 🧩 Components### 5.1 Terminal Interface (CLI)**Inputs**- Allowed time (minutes)  - Penalty amount  - List of blocked domains  **Outputs**- Live timer  - Warning messages  - Violation logs  **Suggested Tech**- Node.js  - commander or inquirer  ---### 5.2 Activity Monitor#### Option A (Recommended)- Detect active browser tab URL  - macOS: AppleScript  - Windows: active-win + title parsing  #### Option B (Fallback)- Detect browser process (Chrome, Brave, etc.)  - Assume usage equals entertainment  ---### 5.3 Domain Filter```jsconst blockedSites = [  "youtube.com",  "instagram.com",  "netflix.com"];


Match active URL against blocked list


If matched, start tracking time



5.4 Time Tracker


Start timer when user enters blocked site


Pause when user exits


Maintain cumulative session duration


if (onBlockedSite) {  timeSpent += interval;}

5.5 Violation Detector (Agent Layer)
if (timeSpent > limit) {  triggerPunishment();}
Optional enhancement:


Warning at 80 percent usage



5.6 KeeperHub Integration


Pre-create a workflow:


Action: transfer funds




Trigger via webhook:


await fetch("KEEPERHUB_WEBHOOK_URL", {  method: "POST"});

5.7 Wallet Setup


Use a testnet wallet


Keep minimal funds for demo



6. 🔐 Security Considerations


Do not store private keys in code


Use environment variables


Prefer KeeperHub-managed execution



7. 📦 Tech Stack


Node.js


CLI: commander or inquirer


Activity detection:


active-win


AppleScript




HTTP: axios or fetch


KeeperHub workflows



8. 🧪 Demo Strategy
Setup


Time limit: 1 minute


Flow


Open a blocked site


Timer starts


Warning near limit


On exceeding limit:


CLI shows violation


KeeperHub triggers transaction





9. 📈 Future Enhancements


Daily usage limits instead of session-based


Streak rewards for discipline


Multiple punishment types


Browser extension integration



10. ⚠️ Constraints and Tradeoffs


Browser detection may not be fully accurate


OS permissions may limit tracking


MVP can simulate behavior if needed


Focus on:


Automation


Clear trigger-action flow



11. 🏁 Success Criteria


Detect at least one blocked site reliably


Track time spent accurately


Trigger KeeperHub workflow on violation


Demonstrate on-chain transaction



🔥 Demo Positioning
“This is a terminal-based discipline system that enforces real financial consequences using autonomous agents and on-chain automation.”
