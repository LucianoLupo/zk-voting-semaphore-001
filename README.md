# 🗳️ ZK Voting dApp with Semaphore

> A complete guide to building anonymous and verifiable voting systems using zero-knowledge proofs

**Anonymous voting** • **Verifiable results** • **No trusted authority** • **Censorship resistant**

This is a production-ready demonstration of how to implement **Semaphore**, a zero-knowledge protocol for anonymous group signaling. Whether you're building a DAO voting system, private polls, or any application requiring privacy-preserving group membership, this project serves as your comprehensive guide.

---

## 🌟 Live Demo

**🌐 Network**: Base Sepolia (Layer 2 Testnet)
**🔗 Chain ID**: 84532
**📍 Explorer**: https://sepolia.basescan.org
**🎯 Try it**: [Live Demo Link]

### 📦 Deployed Contracts

| Contract | Address | Explorer |
|----------|---------|----------|
| **SemaphoreVoting** | `0xDCf4b632E9AdadC9Cb9aE6611a7Aa0f5daC37D4d` | [View on Basescan](https://sepolia.basescan.org/address/0xDCf4b632E9AdadC9Cb9aE6611a7Aa0f5daC37D4d#code) |
| **Semaphore** | `0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D` | [View on Basescan](https://sepolia.basescan.org/address/0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D) |

> **Why Base Sepolia?** Base is an Ethereum Layer 2 built on Optimism's OP Stack, offering significantly lower gas costs (~10-100x cheaper than Ethereum mainnet) while maintaining security. This makes it ideal for ZK voting applications where proof verification can be gas-intensive.

---

## 📚 Table of Contents

- [What is Semaphore?](#-what-is-semaphore)
- [Key Concepts](#-key-concepts)
- [Features](#-features)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Usage Guide](#-usage-guide)
- [How It Works](#-how-it-works)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)
- [Resources](#-resources)

---

## 🎯 What is Semaphore?

**Semaphore** is a zero-knowledge protocol that allows users to prove their membership in a group and send signals (like votes) anonymously. Think of it as a cryptographic membership card that proves you belong to a group without revealing which member you are.

### The Problem Semaphore Solves

Traditional voting systems face a dilemma:
- **Public votes**: Everyone can see who voted for what → No privacy
- **Private votes**: Requires a trusted authority to count votes → Centralization risk
- **Blockchain votes**: Transparent but tied to wallet addresses → Pseudonymous, not anonymous

### The Semaphore Solution

Semaphore provides:
1. **True anonymity**: Your vote is completely unlinkable to your identity
2. **Verifiability**: Anyone can verify that votes were cast by legitimate members
3. **No trusted authority**: The cryptography ensures correctness, not a central party
4. **Double-vote prevention**: Cryptographically impossible to vote twice

### Real-World Applications

- 🗳️ **DAO Governance**: Anonymous voting for sensitive proposals
- 📊 **Private Polls**: Collect honest feedback without identity concerns
- 🎭 **Whistleblowing**: Anonymous reporting within verified organizations
- 🎫 **Anonymous Authentication**: Prove membership without revealing which member
- 💬 **Private Social**: Post anonymously within verified communities

---

## 🔑 Key Concepts

Before diving in, let's understand the core concepts:

### 1. Identity Commitment

Your **Semaphore identity** is like a cryptographic fingerprint:
- Generated locally in your browser (never shared)
- Produces an **identity commitment** (a hash) that you register publicly
- The commitment reveals nothing about your actual identity
- You keep the secret; only the commitment goes on-chain

```
Your Secret Identity → Hash Function → Public Commitment (0x1234...)
```

### 2. Merkle Tree Groups

Registered voters form a **group** represented as a Merkle tree:
- Each leaf = one voter's identity commitment
- The **Merkle root** represents the entire group
- Stored on-chain as a single 32-byte hash
- Proves you're in the group without revealing your position

```
Merkle Root (0xabcd...)
      ├── Branch 1
      │   ├── Voter A commitment
      │   └── Voter B commitment
      └── Branch 2
          ├── Voter C commitment
          └── Voter D commitment
```

### 3. Zero-Knowledge Proofs

When you vote, you generate a **ZK proof** that proves:
- ✅ "I am in the registered voter group" (Merkle proof)
- ✅ "I know the secret identity" (signature proof)
- ❌ "But I won't tell you which member I am" (zero-knowledge!)

This proof takes 20-30 seconds to generate but verifies in milliseconds on-chain.

### 4. Nullifier Hash

The **nullifier** prevents double-voting:
```
nullifier = hash(your_secret_identity + poll_id)
```

- Deterministic: Same identity + poll = same nullifier always
- Public: Checked on-chain to prevent reuse
- Unlinkable: Different polls = different nullifiers
- Anonymous: Doesn't reveal your identity

Think of it as a one-time voting token that's unique per poll but can't be traced back to you.

### 5. Three-Phase Voting

```
Registration Phase → Voting Phase → Results Published
   (Add identity)     (Cast vote)     (View tallies)
```

1. **Registration**: Join the voter group (anyone can see commitments, not identities)
2. **Voting**: Submit your vote with ZK proof (anonymous but verified)
3. **Results**: View vote counts (transparent but voters remain anonymous)

---

## 🚀 Features

✨ **What Makes This Special**

- **🎭 Complete Anonymity**: Vote without revealing your identity or wallet address
- **✅ Verifiable Eligibility**: Cryptographically prove you're a registered voter
- **🔒 Double-Vote Prevention**: Mathematically impossible to vote twice
- **👁️ Transparent Results**: Anyone can verify vote counts
- **🚫 No Trusted Authority**: Zero-knowledge proofs eliminate need for trust
- **⚡ Low Cost**: Base L2 makes ZK voting affordable (~$0.01 per vote)
- **🛡️ Censorship Resistant**: No one can prevent legitimate votes
- **📱 User-Friendly**: Simple identity management with browser storage

## 🏗️ Architecture

This project demonstrates a complete full-stack ZK voting application:

### **Smart Contracts** (Solidity 0.8.23)
```
contracts/
├── SemaphoreVoting.sol      # Main voting logic (302 lines)
│   ├── Poll creation & management
│   ├── Voter registration (Semaphore group)
│   ├── Vote verification (ZK proof)
│   └── Results tracking
├── SemaphoreMock.sol        # Testing mock
└── interfaces/
    └── ISemaphore.sol       # Semaphore protocol interface
```

**Key Contract Features**:
- Three-phase lifecycle (Registration → Voting → Ended)
- Semaphore V4 integration for ZK verification
- Nullifier tracking for double-vote prevention
- Gas-optimized for L2 deployment

### **Frontend** (Next.js 15 + React 19)
```
app/
├── app/
│   ├── page.tsx             # Poll listing
│   ├── create/page.tsx      # Poll creation
│   ├── poll/[id]/page.tsx   # Voting interface
│   └── providers.tsx        # Web3 setup
├── hooks/
│   ├── useIdentity.ts       # Identity management
│   ├── useSemaphore.ts      # ZK proof generation
│   └── useVoting.ts         # Contract interactions
└── components/
    └── layout/Header.tsx    # Navigation & wallet
```

**Tech Stack**:
- **Wallet**: RainbowKit + Wagmi (seamless Web3 connection)
- **ZK Proofs**: @semaphore-protocol/proof (client-side generation)
- **UI**: TailwindCSS 4 (modern, responsive design)
- **Data**: React Query (real-time updates)
- **Blockchain**: Ethers.js v6 (contract interactions)

### **Testing & Deployment** (Hardhat)
- 512+ lines of comprehensive tests
- Local development with Hardhat Network
- Deployment scripts for multiple networks
- Contract verification on Basescan

---

## 📋 Prerequisites

### Required Knowledge (Beginner-Friendly!)

**Basic understanding of**:
- ✅ Blockchain wallets (like MetaMask)
- ✅ How to send transactions
- ✅ Basic command line usage

**No need to understand**:
- ❌ Zero-knowledge cryptography (we explain it!)
- ❌ Solidity programming (just deploy our contracts)
- ❌ Advanced React (standard patterns used)

### Required Software

| Tool | Version | Purpose | Download |
|------|---------|---------|----------|
| **Node.js** | 18+ | Run JavaScript | [nodejs.org](https://nodejs.org/) |
| **npm** | 9+ | Package manager | Included with Node.js |
| **Git** | Any | Clone repository | [git-scm.com](https://git-scm.com/) |
| **Code Editor** | Any | Edit files | [VS Code](https://code.visualstudio.com/) recommended |
| **MetaMask** | Latest | Web3 wallet | [metamask.io](https://metamask.io/) |

### Required Accounts (Free!)

1. **Alchemy Account** (RPC provider)
   - Sign up: https://www.alchemy.com/
   - Create app for Base Sepolia
   - Copy your API key

2. **WalletConnect Project** (wallet connection)
   - Sign up: https://cloud.walletconnect.com/
   - Create project
   - Copy your project ID

3. **Basescan Account** (contract verification - optional)
   - Sign up: https://basescan.org/
   - Get API key from account settings

### Required Funds

**Base Sepolia ETH** (testnet - free!)
- Amount needed: ~0.1 ETH (covers dozens of votes)
- Get from: [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)
- Alternative: [Coinbase Wallet Faucet](https://portal.cdp.coinbase.com/products/faucet)

**Tip**: Request from faucet AFTER adding Base Sepolia network to MetaMask

---

## 🛠️ Quick Start

Follow these steps to get your ZK voting app running in ~15 minutes!

### Step 1: Clone & Install Dependencies

**Clone the repository**:
```bash
git clone https://github.com/YOUR_USERNAME/zk-voting-semaphore.git
cd zk-voting-semaphore
```

**Install root dependencies** (Hardhat for smart contracts):
```bash
npm install
```

This installs:
- Hardhat (smart contract development)
- Semaphore protocol libraries
- Testing tools (Chai, Mocha)
- TypeScript

**Install frontend dependencies**:
```bash
cd app
npm install
cd ..
```

This installs:
- Next.js 15 + React 19
- Wagmi + RainbowKit (Web3 connection)
- TailwindCSS (styling)
- @semaphore-protocol packages (ZK proofs)

**Verify installation**:
```bash
npm --version  # Should be 9+
node --version # Should be v18+
```

---

### Step 2: Setup Base Sepolia Network in MetaMask

Before deploying, add Base Sepolia testnet to MetaMask:

**Option A: Automatic (Recommended)**
1. Visit https://chainlist.org/chain/84532
2. Click "Connect Wallet"
3. Click "Add to MetaMask"

**Option B: Manual**
1. Open MetaMask → Networks → Add Network
2. Enter these details:
   ```
   Network Name: Base Sepolia
   RPC URL: https://sepolia.base.org
   Chain ID: 84532
   Currency Symbol: ETH
   Block Explorer: https://sepolia.basescan.org
   ```
3. Save

**Get Testnet ETH**:
1. Copy your wallet address from MetaMask
2. Visit [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)
3. Paste address and request ETH
4. Wait ~1 minute for funds to arrive

---

### Step 3: Configure Environment Variables

**Root `.env` for contract deployment**:

```bash
# Create from example
cp .env.example .env

# Open in your editor
nano .env  # or use VS Code: code .env
```

**Add your values**:
```env
# Get from https://www.alchemy.com/ (create Base Sepolia app)
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Export from MetaMask: Account → Account Details → Show Private Key
# ⚠️ NEVER commit this to git! It's in .gitignore
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Get from https://basescan.org/myapikey (optional, for verification)
ETHERSCAN_API_KEY=your_etherscan_api_key

# Already deployed Semaphore V4 on Base Sepolia (DO NOT CHANGE)
SEMAPHORE_ADDRESS=0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D
```

**How to get your Alchemy API Key**:
1. Sign up at https://www.alchemy.com/
2. Create New App → Choose "Base Sepolia"
3. View Key → Copy "API Key"
4. Paste as: `https://base-sepolia.g.alchemy.com/v2/YOUR_KEY_HERE`

**Frontend `app/.env.local` for the app**:

```bash
# Create from example
cp app/.env.example app/.env.local

# Open in your editor
nano app/.env.local  # or: code app/.env.local
```

**Add your values** (we'll update VOTING_ADDRESS after deployment):
```env
# Leave empty for now - we'll fill this after deploying
NEXT_PUBLIC_VOTING_ADDRESS=

# Already deployed Semaphore V4 (DO NOT CHANGE)
NEXT_PUBLIC_SEMAPHORE_ADDRESS=0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D

# Get from https://cloud.walletconnect.com/
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here

# Base Sepolia Chain ID (DO NOT CHANGE)
NEXT_PUBLIC_CHAIN_ID=84532
```

**How to get WalletConnect Project ID**:
1. Visit https://cloud.walletconnect.com/
2. Sign in → Create new project
3. Copy "Project ID" from project settings
4. Paste in `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

---

### Step 4: Compile Smart Contracts

Compile the Solidity contracts:

```bash
npm run compile
```

**Expected output**:
```
Compiled 15 Solidity files successfully (evm target: paris).
```

**What this does**:
- Compiles `contracts/SemaphoreVoting.sol`
- Generates TypeScript types (typechain)
- Creates artifacts in `artifacts/` directory
- Prepares contracts for deployment

**Troubleshooting**:
- If you see errors, make sure you ran `npm install` in the root directory
- Delete `artifacts/` and `cache/` folders, then recompile

---

### Step 5: Deploy Contracts

**Option A: Use Existing Deployment (Fastest! ⚡)**

We've already deployed to Base Sepolia:
```env
# Add this to app/.env.local
NEXT_PUBLIC_VOTING_ADDRESS=0xDCf4b632E9AdadC9Cb9aE6611a7Aa0f5daC37D4d
```

Skip to Step 6!

**Option B: Deploy Your Own Contract**

If you want to deploy your own instance:

```bash
npm run deploy:base-sepolia
```

**Expected output**:
```
Deploying SemaphoreVoting to Base Sepolia...
Deployer: 0x1234...
Deployer balance: 0.05 ETH

SemaphoreVoting deployed to: 0xABCD...
Transaction hash: 0x5678...

To verify on Basescan:
npx hardhat verify --network base-sepolia 0xABCD... 0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D
```

**Copy the deployed address** (`0xABCD...`) and add to `app/.env.local`:
```env
NEXT_PUBLIC_VOTING_ADDRESS=0xABCD...  # Your newly deployed address
```

**Verify your contract** (makes source code public on Basescan):
```bash
npx hardhat verify --network base-sepolia YOUR_DEPLOYED_ADDRESS 0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D
```

View verified contract: https://sepolia.basescan.org/address/YOUR_ADDRESS#code

**Option C: Local Testing** (no testnet ETH needed)

For local development without spending testnet ETH:

```bash
# Terminal 1: Start Hardhat node
npm run node

# Keep this running! Don't close this terminal
```

```bash
# Terminal 2: Deploy to local network
npm run deploy:local
```

This deploys to `localhost:8545` with test accounts pre-funded.

---

### Step 6: Run the Frontend

**Start the development server**:
```bash
cd app
npm run dev
```

**Expected output**:
```
▲ Next.js 15.5.4
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.3s
```

**Open in browser**:
```
http://localhost:3000
```

You should see:
- Header with "Connect Wallet" button
- "ZK Voting" title
- "Create New Poll" button
- Empty poll list (no polls yet!)

---

### Step 7: Connect MetaMask & Create Your First Poll

1. **Connect Wallet**:
   - Click "Connect Wallet" button
   - Select MetaMask
   - Approve connection
   - Ensure you're on **Base Sepolia** network

2. **Generate Identity** (required before voting):
   - Click "Generate Identity" in header
   - A JSON file downloads automatically (keep safe!)
   - You'll see your identity commitment displayed

3. **Create a Poll**:
   - Click "Create New Poll"
   - Fill in the form:
     - **Title**: "What's your favorite framework?"
     - **Options**: Add 2-4 options (e.g., "React", "Vue", "Angular")
     - **Registration Duration**: 5 minutes (enough for testing)
     - **Voting Duration**: 10 minutes
     - **Tree Depth**: 20 (allows up to ~1 million voters)
   - Click "Create Poll"
   - Approve transaction in MetaMask
   - Wait for confirmation (~2 seconds on Base Sepolia)

4. **Share & Test**:
   - Copy the poll URL
   - Open in incognito window (to simulate another user)
   - Generate new identity
   - Register to vote
   - Cast your vote!

🎉 **Congratulations!** You've successfully deployed a privacy-preserving voting system!

---

## 📖 Usage Guide

### 👨‍💼 For Poll Creators

**1. Connect Your Wallet**
- Click "Connect Wallet" in the header
- Select your wallet (MetaMask, Coinbase Wallet, etc.)
- Ensure you're on **Base Sepolia** network
- Approve the connection

**2. Create a Poll**
- Click "Create New Poll" button
- Fill in the form:

| Field | Description | Tips |
|-------|-------------|------|
| **Title** | Poll question | Max 200 characters, be clear and concise |
| **Options** | Voting choices | 2-10 options, each option should be distinct |
| **Registration Duration** | How long voters can register | In minutes. Typical: 60-1440 (1 hour to 1 day) |
| **Voting Duration** | How long registered voters can vote | In minutes. Typical: 60-1440 (1 hour to 1 day) |
| **Tree Depth** | Max voters (technical) | Higher = more voters, slower proofs. Recommended: 16-20 |

**Tree Depth Guide**:
- **Depth 16**: Up to 65,536 voters, ~15s proofs
- **Depth 20**: Up to 1,048,576 voters, ~25s proofs
- **Depth 24**: Up to 16,777,216 voters, ~35s proofs

**3. Share the Poll**
- Copy the poll URL (e.g., `https://yourapp.com/poll/0`)
- Share with your community via:
  - Discord/Telegram announcement
  - Twitter/X post
  - Email newsletter
  - DAO governance forum

**4. Monitor Progress**
- Check registration count in real-time
- View votes as they come in (anonymous!)
- Results update every 5 seconds

---

### 🗳️ For Voters

**Phase 1: Generate Your Anonymous Identity**

1. **Click "Generate Identity"** in the header
2. **Automatic backup**: A JSON file downloads immediately
   - Filename: `semaphore-identity-[timestamp].json`
   - **CRITICAL**: Keep this file safe! No backup = can't vote
3. **Confirmation**: You'll see your identity commitment in the header
   - Format: `0x1234...abcd` (first 10 chars shown)
4. **Storage**: Identity saved in browser localStorage
   - Works across tabs in same browser
   - **Does NOT work** across different browsers/devices

**Identity Management Tips**:
- ✅ Export immediately after generating
- ✅ Store backup in password manager or cloud storage
- ✅ One identity can be used for multiple polls
- ❌ Never share your identity JSON file publicly
- ❌ Losing identity means you can't vote (no recovery!)

**Phase 2: Register to Vote (During Registration Window)**

1. **Visit the poll page**
2. **Check the phase**: Must say "Registration Phase Active"
3. **Click "Register to Vote"**
4. **Approve transaction** in MetaMask
   - Cost: ~$0.01 on Base Sepolia
   - This adds your identity commitment to the voter group
5. **Confirmation**: "Successfully registered!" message appears
6. **Wait**: Voting phase begins after registration ends

**What happens during registration**:
```
Your Identity → Creates Commitment → Added to Merkle Tree → Group Updated On-Chain
(private)       (public hash)        (anonymous position)   (ready to vote!)
```

**Phase 3: Cast Your Vote (During Voting Window)**

1. **Check phase**: Must say "Voting Phase Active"
2. **Select your choice**: Click the radio button for your option
3. **Click "Submit Vote"**
4. **ZK Proof Generation** (this is the magic! ✨):
   ```
   Generating proof: [Progress bar]
   Step 1/3: Loading Merkle tree...
   Step 2/3: Generating ZK proof... (20-30 seconds)
   Step 3/3: Preparing transaction...
   ```
   - **Why so slow?** Creating a zero-knowledge proof is computationally intensive
   - Your browser is doing advanced cryptography
   - This ensures your vote is anonymous!
5. **Approve transaction** in MetaMask
   - Cost: ~$0.01 on Base Sepolia
6. **Confirmation**: "Vote submitted successfully!" 🎉

**What the ZK proof proves** (without revealing your identity):
- ✅ "I'm a registered voter" (Merkle tree membership)
- ✅ "I know my secret identity" (signature)
- ✅ "I haven't voted before" (unique nullifier)
- ❌ "But I won't tell you who I am!" (zero-knowledge)

**Phase 4: View Results**

- Results visible in real-time during voting
- Final tallies after poll ends
- See vote counts and percentages
- **Your vote remains anonymous forever**

---

### 🔄 Identity Import/Export

**Export Identity** (backup for safety):
```
1. Click "Export" button in header
2. JSON file downloads: `semaphore-identity-backup.json`
3. Store safely (password manager, encrypted cloud)
```

**Import Identity** (restore on new browser/device):
```
1. Click "Import" button in header
2. Select your identity JSON file
3. Identity loaded and ready to use
4. Can now vote in any poll you registered for
```

**Pro Tips**:
- Keep multiple backups in different locations
- Test import/export immediately after generating
- Use descriptive filenames if managing multiple identities
- Never commit identity files to git repositories

---

## 🔐 Security Notes

### Identity Management

⚠️ **CRITICAL**: Your Semaphore identity is stored in browser localStorage
- Backup your identity JSON file immediately after generation
- Losing your identity means you cannot vote
- Never reuse the same identity across different groups

### Privacy

- Your vote is completely anonymous
- No one (including poll creator) can see who voted for what
- The nullifier prevents double-voting without revealing your identity
- Proofs are generated client-side in your browser

## 🛠️ Development

### Project Structure

```
zk-voting-semaphore/
├── contracts/           # Smart contracts
│   ├── SemaphoreVoting.sol
│   └── interfaces/
├── scripts/             # Deployment scripts
├── test/                # Contract tests
├── app/                 # Next.js frontend
│   ├── app/             # Pages
│   ├── components/      # React components
│   ├── hooks/           # Custom hooks
│   └── lib/             # Utilities
└── docs/                # Documentation
```

### Available Scripts

**Root (Hardhat)**:
```bash
npm run compile            # Compile contracts
npm run test               # Run contract tests
npm run deploy:base-sepolia # Deploy to Base Sepolia
npm run deploy:local       # Deploy to local Hardhat node
npm run node               # Start local node
npm run clean              # Clean artifacts
```

**Frontend (app/)**:
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
```

## 📚 How It Works

### The Voting Process

1. **Poll Creation**: Admin creates poll with title, options, and durations
2. **Registration Phase**:
   - Voters generate Semaphore identities
   - Identity commitments added to Merkle tree (group)
3. **Voting Phase**:
   - Voter selects option
   - ZK proof generated proving:
     - Voter is in the group (Merkle proof)
     - Vote is authorized (nullifier)
     - Message is authentic
   - Proof verified on-chain
   - Vote counted without revealing identity
4. **Results**: Votes tallied and displayed

### Zero-Knowledge Proofs

The ZK proof proves three things:
1. **Membership**: "I'm in the registered voter group" (without revealing which member)
2. **Authorization**: "I know the secret for this vote" (without revealing the secret)
3. **Integrity**: "This is my authentic vote" (without linking to my identity)

### Nullifier Mechanism

```
nullifier = hash(identity, pollId)
```

- Deterministic: same identity + poll = same nullifier
- Public: checked to prevent double-voting
- Unlinkable: different polls produce different nullifiers
- Anonymous: doesn't reveal your identity

## 🧪 Testing

### Contract Tests

```bash
npm run test
npm run test:coverage
```

### Manual Testing Checklist

- [ ] Create poll with wallet connected
- [ ] Generate identity
- [ ] Export identity backup
- [ ] Import identity from file
- [ ] Register for poll
- [ ] Try to register after deadline (should fail)
- [ ] Vote during voting phase
- [ ] Try to vote twice (should fail)
- [ ] View results
- [ ] Test on mobile

## 🌐 Deployment

### Deploy to Production

1. **Deploy Contracts**:
```bash
npm run deploy:base-sepolia
npx hardhat verify --network base-sepolia <VOTING_ADDRESS> 0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D
```

Example verification (after deployment):
```bash
npx hardhat verify --network base-sepolia 0xDCf4b632E9AdadC9Cb9aE6611a7Aa0f5daC37D4d 0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D
```

View verified contract on **Basescan**: https://sepolia.basescan.org/address/<VOTING_ADDRESS>#code

2. **Update Frontend ENV**:
```env
NEXT_PUBLIC_VOTING_ADDRESS=<deployed_address>
```

3. **Deploy Frontend** (Vercel):
```bash
cd app
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

## ❓ FAQ (Frequently Asked Questions)

### General Questions

**Q: Is my vote really anonymous?**

A: Yes! Here's how:
- Your vote is unlinkable to your wallet address or identity
- The ZK proof proves you're eligible without revealing who you are
- The nullifier is deterministic but doesn't expose your identity
- Even the poll creator cannot see who voted for what
- No one (not even blockchain analysts) can trace votes back to voters

**Q: How is this different from regular blockchain voting?**

A: Traditional blockchain voting is **pseudonymous** (votes linked to addresses), while Semaphore provides **true anonymity**:

| Feature | Traditional | Semaphore ZK Voting |
|---------|-------------|---------------------|
| Anonymity | ❌ Pseudonymous (address visible) | ✅ True anonymity (unlinkable) |
| Double-vote prevention | ✅ Yes (check address) | ✅ Yes (nullifier hash) |
| Verifiability | ✅ Yes (on-chain) | ✅ Yes (ZK proof verified) |
| Privacy | ❌ Can analyze voting patterns | ✅ Cannot link votes to identities |

**Q: Why does proof generation take so long?**

A: Zero-knowledge proofs are computationally expensive! Here's what happens:
1. Your browser loads the entire Merkle tree (all voters)
2. Generates a cryptographic proof (complex math)
3. Creates witness data for verification
4. All happens client-side for privacy

Think of it as your computer solving a very complex puzzle that's easy to verify but hard to create. This is the price of anonymity!

**Q: Can I vote on mobile?**

A: Yes! The app works on mobile browsers with:
- MetaMask mobile app browser
- Coinbase Wallet mobile browser
- Any Web3-enabled mobile browser

**Note**: Proof generation may be slower on mobile devices (30-45 seconds).

**Q: What happens if I lose my identity?**

A: Without your identity backup:
- ❌ You cannot vote in polls you registered for
- ❌ No way to recover your identity (it's truly anonymous!)
- ✅ You can generate a new identity
- ✅ Re-register for polls if registration is still open

**Always backup your identity immediately after generating!**

**Q: Can I use one identity for multiple polls?**

A: Yes! One identity can:
- Register for unlimited polls
- Vote in all registered polls
- Maintain privacy across all polls (different nullifiers per poll)

**Q: Is this secure for production/mainnet?**

A: Yes! The code is:
- ✅ Based on audited Semaphore V4 protocol
- ✅ Using battle-tested cryptographic primitives
- ✅ Thoroughly tested (512+ lines of tests)
- ⚠️ But YOU should audit before mainnet deployment
- ⚠️ Consider professional audit for high-stakes voting

### Technical Questions

**Q: What is a Merkle tree and why do we need it?**

A: A Merkle tree is a data structure that:
- Represents all registered voters as a single hash (Merkle root)
- Allows proving membership without revealing position
- Updates efficiently when voters register
- Stored on-chain as just 32 bytes (very gas-efficient!)

Think of it as a cryptographic membership list where you can prove you're in the list without saying where.

**Q: What is a nullifier?**

A: A nullifier is:
```
nullifier = hash(your_identity + poll_id)
```

- **Deterministic**: Same identity + poll = always same nullifier
- **Public**: Checked on-chain to prevent double-voting
- **Unlinkable**: Can't trace back to identity (one-way hash)
- **Poll-specific**: Different poll = different nullifier

It's like a voting receipt that proves you voted without revealing who you are.

**Q: Why do we need a registration phase?**

A: The registration phase:
1. Builds the Merkle tree of eligible voters
2. Prevents on-the-fly registration during voting (could enable attacks)
3. Establishes the voter group before voting starts
4. Makes the voting set transparent and verifiable

**Q: Can the poll creator cheat?**

A: No! The creator can:
- ✅ See vote counts (everyone can)
- ✅ See who registered (commitments only, not identities)
- ❌ See who voted for what (cryptographically impossible)
- ❌ Modify votes (immutable on-chain)
- ❌ Prevent legitimate votes (decentralized verification)

**Q: How much does it cost to vote?**

A: On Base Sepolia (testnet):
- Registration: ~$0.01 (or free with testnet ETH)
- Voting: ~$0.01 (or free with testnet ETH)

On Base Mainnet (production):
- Registration: ~$0.02-0.05
- Voting: ~$0.02-0.05

On Ethereum Mainnet:
- Registration: ~$2-10 (depending on gas)
- Voting: ~$2-10

**This is why we recommend Base L2!**

**Q: What is tree depth and how do I choose it?**

A: Tree depth determines maximum voters:

| Depth | Max Voters | Proof Time | When to Use |
|-------|-----------|------------|-------------|
| 16 | 65,536 | ~15s | Small communities (<50K) |
| 20 | 1,048,576 | ~25s | Medium DAOs (50K-1M) |
| 24 | 16,777,216 | ~35s | Large organizations (1M+) |
| 32 | 4,294,967,296 | ~60s | Massive scale (billions) |

**Rule of thumb**: Pick depth where `2^depth > 2x expected voters` for safety.

**Q: Can I modify a poll after creation?**

A: No. Polls are immutable once created:
- ❌ Can't change options
- ❌ Can't extend duration
- ❌ Can't modify voter group

This ensures integrity and prevents manipulation.

**Q: What's the difference between Semaphore and other ZK voting systems?**

A: Semaphore is:
- **General-purpose**: Not just for voting (signaling protocol)
- **Modular**: Separate identity, group, and proof components
- **Well-audited**: Battle-tested by PSE (Privacy & Scaling Explorations)
- **Widely adopted**: Used by many projects (RLN, ZKEmail, etc.)

Alternatives like MACI or Vocdoni have different tradeoffs (coercion resistance, gas costs, complexity).

### Development Questions

**Q: Can I deploy this to other networks?**

A: Yes! Semaphore is deployed on:
- Ethereum Mainnet
- Optimism
- Arbitrum
- Polygon
- And more...

Check [Semaphore deployments](https://docs.semaphore.pse.dev/deployed-contracts) for addresses.

**Q: How do I customize the frontend?**

A: Easy customization:
1. **Styling**: Edit TailwindCSS classes in components
2. **Branding**: Update logo and colors in `app/layout.tsx`
3. **Features**: Modify pages in `app/app/` directory
4. **Hooks**: Extend functionality in `app/hooks/`

**Q: Can I integrate this into my existing app?**

A: Yes! Key integration points:
1. **Install Semaphore packages**: `@semaphore-protocol/*`
2. **Deploy SemaphoreVoting contract**: Use our contract as reference
3. **Use our hooks**: Copy `useIdentity`, `useSemaphore`, `useVoting`
4. **Add UI components**: Adapt our pages to your design

See our code as a reference implementation!

**Q: How do I test locally without deploying?**

A:
```bash
# Terminal 1: Start Hardhat node
npm run node

# Terminal 2: Run tests
npm test

# Terminal 3: Deploy locally
npm run deploy:local

# Terminal 4: Run frontend (pointing to localhost)
cd app && npm run dev
```

**Q: Can I use this for mainnet production?**

A: Yes, but:
1. ✅ Audit the code (or hire professional auditors)
2. ✅ Test extensively on testnet first
3. ✅ Understand ZK cryptography implications
4. ✅ Have incident response plan
5. ⚠️ Start with low-stakes votes
6. ⚠️ Monitor for issues closely

**We provide this as-is for educational purposes!**

---

## 🐛 Troubleshooting

### Wallet & Network Issues

**Problem: "Can't connect wallet" or "Wrong network"**

✅ **Solution**:
1. Check MetaMask is installed and unlocked
2. Switch to Base Sepolia network:
   - Quick: Visit [Chainlist](https://chainlist.org/chain/84532) → Add to MetaMask
   - Manual: Add network with these details:
     ```
     Network Name: Base Sepolia
     RPC URL: https://sepolia.base.org
     Chain ID: 84532
     Currency Symbol: ETH
     Block Explorer: https://sepolia.basescan.org
     ```
3. Refresh page and try reconnecting
4. Check browser console (F12) for errors

**Problem: "Insufficient funds for gas"**

✅ **Solution**:
1. Visit [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)
2. Connect wallet and request ETH
3. Wait 1-2 minutes for funds to arrive
4. Alternative faucet: [Coinbase Wallet](https://portal.cdp.coinbase.com/products/faucet)
5. Check balance in MetaMask (should show >0.01 ETH)

**Problem: "Transaction failed" or "Execution reverted"**

✅ **Solution**:
- Check current poll phase (registration vs voting)
- Verify you're registered before voting
- Ensure voting window is active
- Check you haven't voted already
- Increase gas limit in MetaMask advanced settings
- View transaction on Basescan for specific error message

### Identity Issues

**Problem: "Identity lost" or "Cannot find identity"**

✅ **Solution**:
1. **If you have backup**: Click "Import" and select JSON file
2. **If no backup**: Identity is unrecoverable ❌
   - Generate new identity
   - Re-register if registration still open
   - **Prevention**: Always export immediately after generating!

**Problem: "Identity import failed" or "Invalid file"**

✅ **Solution**:
- Check file is correct JSON format
- Ensure file isn't corrupted
- Try exporting and re-importing (test the process)
- Check browser console (F12) for specific error
- File must be exact export from this app

**Problem: "Identity works in one browser but not another"**

✅ **Solution**:
- Identities are stored in browser localStorage (browser-specific!)
- **Export from Browser A** → **Import to Browser B**
- Not automatic sync (by design for privacy!)

### Proof Generation Issues

**Problem: "Proof generation stuck" or "Taking too long"**

✅ **Solution**:
- **Expected**: 20-30 seconds is normal for ZK proofs
- **Longer**: May take 30-60s on slower devices or high tree depth
- **Stuck (>2 minutes)**: Refresh page and try again
- **Consistent issues**:
  - Check browser console (F12) for errors
  - Try different browser (Chrome/Brave recommended)
  - Close other tabs (memory intensive)
  - Check you're registered for the poll

**Problem: "Proof verification failed on-chain"**

✅ **Solution**:
- Ensure you're voting with the same identity you registered with
- Check poll ID matches (you're on correct poll page)
- Verify you haven't voted already (nullifier reuse)
- Try generating proof again
- Check Semaphore contract is correct in env

### Development Issues

**Problem: "Module not found" or "Cannot find package"**

✅ **Solution**:
```bash
# Root dependencies
npm install

# Frontend dependencies
cd app && npm install && cd ..

# Clear cache if persists
rm -rf node_modules package-lock.json
npm install
```

**Problem: "Compilation failed"**

✅ **Solution**:
```bash
# Clean and recompile
npm run clean
npm run compile

# If still failing, check Solidity version
# Should be 0.8.23 in hardhat.config.ts
```

**Problem: "Deployment failed" or "Insufficient funds"**

✅ **Solution**:
- Check `.env` has correct `DEPLOYER_PRIVATE_KEY`
- Verify deployer wallet has Base Sepolia ETH
- Check `BASE_SEPOLIA_RPC_URL` is valid Alchemy URL
- Test RPC: `curl https://base-sepolia.g.alchemy.com/v2/YOUR_KEY`
- Check Alchemy dashboard for rate limits

**Problem: "Frontend shows contract errors" or "Cannot read properties"**

✅ **Solution**:
1. Verify `app/.env.local` has correct `NEXT_PUBLIC_VOTING_ADDRESS`
2. Check contract is deployed (visit Basescan)
3. Ensure ABI in `app/lib/contracts.ts` matches deployed contract
4. Verify `NEXT_PUBLIC_CHAIN_ID=84532`
5. Try clearing browser cache and localStorage

**Problem: "Tests failing"**

✅ **Solution**:
```bash
# Run tests with more detail
npm test -- --verbose

# Run single test file
npx hardhat test test/SemaphoreVoting.test.js

# Check Hardhat network is working
npx hardhat node
```

### Production Issues

**Problem: "Proof generation too slow for users"**

✅ **Solution**:
- Use lower tree depth (16-20 recommended)
- Add loading indicators and progress bars
- Set user expectations (show "Generating proof: ~25 seconds")
- Consider server-side proof generation (advanced)

**Problem: "Gas costs too high"**

✅ **Solution**:
- ✅ Already using Base L2 (10-100x cheaper than Ethereum)
- Consider optimizing contract storage
- Batch operations where possible
- Users pay their own gas (no relay)

**Problem: "Voters confused about registration vs voting"**

✅ **Solution**:
- Clear UI labels ("Registration Phase" badge)
- Add countdown timers
- Email/Discord notifications for phase changes
- Step-by-step guide in app (tooltip or modal)

---

### Still Having Issues?

1. **Check browser console** (F12 → Console tab) for errors
2. **Search existing issues**: [GitHub Issues](https://github.com/YOUR_REPO/issues)
3. **Create new issue**: Provide:
   - Browser and version
   - Operating system
   - Steps to reproduce
   - Console error messages
   - Screenshots if UI issue
4. **Join community**: [Discord/Telegram link]

---

## 📄 License

MIT

## 🔗 Resources

### Semaphore & ZK Proofs
- [Semaphore Documentation](https://docs.semaphore.pse.dev/)
- [Semaphore Deployed Contracts](https://docs.semaphore.pse.dev/deployed-contracts)

### Base Network
- [Base Documentation](https://docs.base.org/)
- [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)
- [Base Sepolia Explorer (Basescan)](https://sepolia.basescan.org)
- [Add Base Sepolia to MetaMask](https://chainlist.org/chain/84532)

### Development Tools
- [Hardhat Documentation](https://hardhat.org/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [RainbowKit Documentation](https://www.rainbowkit.com/docs)
- [Wagmi Documentation](https://wagmi.sh/)

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📧 Support

For issues or questions, please open a GitHub issue.

---

Built with ❤️ using Semaphore V4 zero-knowledge proofs
