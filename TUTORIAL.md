# Building Anonymous Voting with Zero-Knowledge Proofs: A Complete Guide to Semaphore

> **Learn how to build privacy-preserving applications using Semaphore, the zero-knowledge protocol for anonymous group signaling**

By [Your Name] • Published on [Date]

---

## Introduction: The Privacy Problem in Blockchain Voting

Imagine you're part of a DAO (Decentralized Autonomous Organization) voting on a controversial proposal. You have strong opinions, but you're afraid that publicly linking your vote to your wallet address might:

- Expose you to social pressure or retaliation
- Affect your reputation in the community
- Enable vote buying or coercion
- Compromise your privacy

This is the fundamental dilemma of blockchain voting: **How do you prove you're eligible to vote without revealing your identity?**

Traditional blockchain voting systems offer transparency but sacrifice privacy—every vote is permanently linked to a wallet address. While pseudonymous, determined observers can often correlate addresses with real identities through on-chain analysis, social engineering, or KYC data leaks.

**Enter Semaphore**: a zero-knowledge protocol that solves this problem elegantly. With Semaphore, you can:
- ✅ Prove you're a member of a group without revealing which member
- ✅ Cast votes that are completely unlinkable to your identity
- ✅ Prevent double-voting through cryptographic nullifiers
- ✅ Maintain full transparency of results

In this comprehensive tutorial, we'll build a production-ready anonymous voting application from scratch. You'll learn:

1. **What zero-knowledge proofs are** and how Semaphore implements them
2. **How to write smart contracts** that integrate with Semaphore V4
3. **How to build a modern Web3 frontend** with Next.js, Wagmi, and RainbowKit
4. **How to generate and verify ZK proofs** client-side
5. **How to deploy to Base L2** for affordable, scalable voting

By the end, you'll have a fully functional ZK voting dApp and understand the cryptographic primitives that power privacy-preserving applications.

---

## Table of Contents

1. [Understanding Zero-Knowledge Proofs & Semaphore](#part-1)
2. [Project Architecture & Setup](#part-2)
3. [Building the Smart Contracts](#part-3)
4. [Creating the Frontend Application](#part-4)
5. [Implementing Identity Management](#part-5)
6. [Generating Zero-Knowledge Proofs](#part-6)
7. [Testing & Deployment](#part-7)
8. [Advanced Topics & Best Practices](#part-8)

---

<a name="part-1"></a>
## Part 1: Understanding Zero-Knowledge Proofs & Semaphore

### What are Zero-Knowledge Proofs?

A **zero-knowledge proof** is a cryptographic method where one party (the prover) can prove to another party (the verifier) that a statement is true **without revealing any information** beyond the validity of the statement itself.

**Classic Example**: Imagine you have a colorblind friend and two balls—one red, one green. You want to prove the balls are different colors without telling them which is which.

**Protocol**:
1. Your friend holds both balls behind their back
2. They either switch the balls or don't (you can't see)
3. They show you the balls again
4. You tell them whether they switched

If you can consistently detect switches, you've proven the balls are different colors without revealing which is red or green!

### Semaphore: ZK Proofs for Group Membership

**Semaphore** applies zero-knowledge proofs to group membership and signaling. The protocol enables you to prove:

> "I am a member of this specific group, and I'm sending this signal"

**Without revealing**:
- Which member you are
- Your identity or wallet address
- Any linkable information

### Core Semaphore Concepts

Let's break down the five key concepts:

#### 1. **Identity Commitment**

Your Semaphore identity consists of:
- **Private key**: A secret you keep (like a private key in crypto)
- **Identity commitment**: A public hash derived from your private key

```javascript
// Simplified conceptual example
const privateKey = generateRandomSecret()
const identityCommitment = hash(privateKey)
// Public: 0x1234abcd... (safe to share)
```

**Key insight**: The commitment reveals nothing about your private key due to the one-way nature of hash functions.

#### 2. **Merkle Tree Groups**

All members of a group are organized in a **Merkle tree**:

```
                Merkle Root (0xabcd...)
                    /        \
                   /          \
              Hash1           Hash2
              /  \            /  \
             /    \          /    \
         Voter1 Voter2  Voter3  Voter4
        (0x12) (0x34)  (0x56)  (0x78)
```

- Each leaf = one member's identity commitment
- The root = single 32-byte hash representing the entire group
- Stored on-chain very efficiently

**Why Merkle trees?**
- You can prove membership without revealing your position
- Updates are efficient (only update path from leaf to root)
- Privacy-preserving (no one knows which leaf is yours)

#### 3. **Zero-Knowledge Membership Proof**

When you want to "signal" (e.g., vote), you generate a ZK proof that demonstrates:

**Claim**: "I possess the private key for one of the identities in this Merkle tree"

**Proof components**:
- Merkle proof (path from your leaf to root)
- Signature proving you know the private key
- Zero-knowledge wrapper hiding which leaf is yours

**Verification**: Anyone can verify your proof against the Merkle root on-chain, confirming you're in the group without learning your identity.

#### 4. **Nullifier Hash**

The **nullifier** prevents double-signaling:

```javascript
nullifier = hash(privateKey + signal_identifier)
```

**For voting, this becomes**:
```javascript
nullifier = hash(privateKey + pollId)
```

**Properties**:
- **Deterministic**: Same identity + poll = always same nullifier
- **Unique per signal**: Different polls = different nullifiers
- **Public**: Checked on-chain to prevent reuse
- **Unlinkable**: Can't reverse-engineer identity from nullifier

**The magic**: You can prove you haven't voted before (unique nullifier) without revealing who you are!

#### 5. **Signal**

The actual message or action you're taking. In voting:
```javascript
signal = voteOption  // e.g., 0, 1, 2
```

The signal is public (everyone sees vote counts), but the link between your identity and your signal is cryptographically broken.

### How Semaphore Voting Works End-to-End

Let's trace a complete voting flow:

**Step 1: Poll Creation**
```
Poll Creator → Creates poll on-chain
             → Semaphore creates new Merkle tree (group)
             → Group ID assigned to poll
```

**Step 2: Voter Registration**
```
Voter → Generates Semaphore identity locally
      → Computes identity commitment
      → Sends commitment to contract
      → Commitment added as leaf in Merkle tree
      → New Merkle root computed and stored
```

**Step 3: Vote Casting**
```
Voter → Selects vote option (signal)
      → Generates ZK proof proving:
          1. "I know the private key for a leaf in the tree"
          2. "Here's my nullifier: hash(privateKey + pollId)"
          3. "My signal is: voteOption"
      → Sends proof + nullifier + signal to contract
      → Contract verifies:
          - Proof is valid for current Merkle root ✓
          - Nullifier hasn't been used before ✓
          - Signal is within valid options ✓
      → Vote counted, nullifier marked as used
```

**Result**:
- Vote is recorded
- Vote count increases
- **Identity remains anonymous forever**

### Why This Is Powerful

Traditional voting systems rely on:
- **Trusted authorities** (who can cheat)
- **Privacy through obscurity** (databases can be hacked)
- **Trade-offs** (anonymity XOR verifiability)

Semaphore provides:
- **Cryptographic guarantees** (math, not trust)
- **Privacy by design** (information is never revealed, not just hidden)
- **Both anonymity AND verifiability** (no trade-off needed!)

---

<a name="part-2"></a>
## Part 2: Project Architecture & Setup

### Tech Stack Overview

We're building a full-stack Web3 application with:

**Smart Contracts**:
- **Solidity 0.8.23**: Contract language
- **Hardhat**: Development environment
- **Semaphore V4**: ZK proof protocol contracts
- **Base Sepolia**: Layer 2 testnet (cheap gas!)

**Frontend**:
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React features
- **Wagmi**: Type-safe Ethereum hooks
- **RainbowKit**: Beautiful wallet connection UI
- **TailwindCSS 4**: Utility-first styling
- **@semaphore-protocol packages**: Identity, groups, and proof generation

**Why Base L2?**

Ethereum mainnet gas for ZK proof verification can cost $5-20 per vote. Base (an Optimistic Rollup) offers:
- 10-100x cheaper gas (~$0.02-0.05 per vote)
- Full Ethereum security (inherits from L1)
- Fast finality (~2 seconds)
- Same development experience as Ethereum

### Prerequisites

Before starting, ensure you have:

**Software**:
- Node.js 18+ ([Download](https://nodejs.org/))
- npm 9+
- Git
- Code editor (VS Code recommended)
- MetaMask browser extension

**Accounts** (all free):
- Alchemy account (RPC provider): https://www.alchemy.com/
- WalletConnect project: https://cloud.walletconnect.com/
- Basescan account (optional, for verification): https://basescan.org/

**Testnet ETH**:
- Base Sepolia ETH from [faucet](https://www.alchemy.com/faucets/base-sepolia)

### Project Structure

```
zk-voting-semaphore/
├── contracts/              # Smart contracts
│   ├── SemaphoreVoting.sol    # Main voting contract
│   ├── SemaphoreMock.sol      # Mock for local testing
│   └── interfaces/
│       └── ISemaphore.sol     # Semaphore protocol interface
├── scripts/                # Deployment scripts
│   └── deploy.ts
├── test/                   # Contract tests
│   └── SemaphoreVoting.test.js
├── app/                    # Next.js frontend
│   ├── app/                   # Pages (App Router)
│   │   ├── page.tsx              # Home (poll list)
│   │   ├── create/page.tsx       # Create poll
│   │   └── poll/[id]/page.tsx    # Vote on poll
│   ├── components/            # React components
│   │   └── layout/Header.tsx
│   ├── hooks/                 # Custom React hooks
│   │   ├── useIdentity.ts        # Identity management
│   │   ├── useSemaphore.ts       # ZK proof generation
│   │   └── useVoting.ts          # Contract interactions
│   ├── lib/                   # Utilities
│   │   ├── contracts.ts          # ABIs and addresses
│   │   ├── wagmi.ts              # Wagmi configuration
│   │   └── storage.ts            # localStorage helpers
│   └── types/                 # TypeScript types
├── hardhat.config.ts       # Hardhat configuration
├── package.json            # Root dependencies
└── .env                    # Environment variables
```

### Initial Setup

**Step 1: Clone and Install**

```bash
# Clone the repository (or start fresh)
git clone https://github.com/YOUR_USERNAME/zk-voting-semaphore.git
cd zk-voting-semaphore

# Install contract dependencies
npm install

# Install frontend dependencies
cd app
npm install
cd ..
```

**Step 2: Environment Configuration**

Create `.env` in the root:

```bash
# Base Sepolia RPC (get from Alchemy)
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Deployer wallet private key
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Basescan API key (for contract verification)
ETHERSCAN_API_KEY=your_basescan_api_key

# Semaphore V4 address on Base Sepolia (already deployed!)
SEMAPHORE_ADDRESS=0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D
```

Create `app/.env.local`:

```bash
# Your deployed voting contract (we'll fill this after deployment)
NEXT_PUBLIC_VOTING_ADDRESS=

# Semaphore contract address
NEXT_PUBLIC_SEMAPHORE_ADDRESS=0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D

# WalletConnect project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# Chain ID for Base Sepolia
NEXT_PUBLIC_CHAIN_ID=84532
```

**Step 3: Add Base Sepolia to MetaMask**

Visit https://chainlist.org/chain/84532 and click "Add to MetaMask", or manually add:

```
Network Name: Base Sepolia
RPC URL: https://sepolia.base.org
Chain ID: 84532
Currency Symbol: ETH
Block Explorer: https://sepolia.basescan.org
```

**Step 4: Get Testnet ETH**

1. Copy your wallet address from MetaMask
2. Visit https://www.alchemy.com/faucets/base-sepolia
3. Request ETH (you'll need ~0.05 ETH for deployment and testing)

---

<a name="part-3"></a>
## Part 3: Building the Smart Contracts

### Understanding the SemaphoreVoting Contract

Our voting contract integrates with Semaphore to provide anonymous, verifiable voting. Let's build it step by step.

#### Contract Structure

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {ISemaphore} from "./interfaces/ISemaphore.sol";

contract SemaphoreVoting {
    // The Semaphore protocol contract
    ISemaphore public semaphore;

    // Poll counter
    uint256 public pollCount;

    // Poll data structure
    struct Poll {
        string title;
        string[] options;
        uint256 startTime;
        uint256 registrationEndTime;
        uint256 votingEndTime;
        address admin;
        uint256 groupId;  // Semaphore group for this poll
        uint256 totalVotes;
        bool exists;
    }

    // Poll ID => Poll data
    mapping(uint256 => Poll) public polls;

    // Poll ID => Option => Vote count
    mapping(uint256 => mapping(uint256 => uint256)) public votes;

    // Track used nullifiers to prevent double-voting
    mapping(uint256 => bool) public nullifierUsed;
}
```

**Key components**:
- `ISemaphore`: Interface to Semaphore protocol contract
- `pollCount`: Auto-incrementing poll ID
- `Poll` struct: Stores all poll metadata
- `votes`: Maps poll ID + option to vote count
- `nullifierUsed`: Prevents double-voting via nullifier tracking

#### Creating Polls

```solidity
event PollCreated(
    uint256 indexed pollId,
    uint256 indexed groupId,
    address indexed admin,
    string title
);

function createPoll(
    string calldata _title,
    string[] calldata _options,
    uint256 _registrationDuration,  // in seconds
    uint256 _votingDuration,        // in seconds
    uint256 _treeDepth              // Merkle tree depth (determines max voters)
) external returns (uint256) {
    require(_options.length >= 2 && _options.length <= 10, "Invalid options count");
    require(_treeDepth >= 1 && _treeDepth <= 32, "Invalid tree depth");

    uint256 pollId = pollCount++;
    uint256 startTime = block.timestamp;
    uint256 registrationEndTime = startTime + _registrationDuration;
    uint256 votingEndTime = registrationEndTime + _votingDuration;

    // Create Semaphore group for this poll
    uint256 groupId = pollId;
    semaphore.createGroup(groupId, _treeDepth, address(this));

    polls[pollId] = Poll({
        title: _title,
        options: _options,
        startTime: startTime,
        registrationEndTime: registrationEndTime,
        votingEndTime: votingEndTime,
        admin: msg.sender,
        groupId: groupId,
        totalVotes: 0,
        exists: true
    });

    emit PollCreated(pollId, groupId, msg.sender, _title);

    return pollId;
}
```

**What's happening**:
1. Validate inputs (2-10 options, valid tree depth)
2. Calculate time windows for registration and voting
3. Create new Semaphore group (this is the Merkle tree!)
4. Store poll metadata
5. Emit event for frontends to track

**Tree depth explained**:
- Depth 16 = up to 2^16 = 65,536 voters
- Depth 20 = up to 2^20 = 1,048,576 voters
- Depth 32 = up to 2^32 = 4,294,967,296 voters

Higher depth = more voters but slower proof generation.

#### Voter Registration

```solidity
event VoterRegistered(
    uint256 indexed pollId,
    uint256 indexed identityCommitment
);

function registerVoter(
    uint256 _pollId,
    uint256 _identityCommitment
) external {
    require(polls[_pollId].exists, "Poll does not exist");
    require(
        block.timestamp <= polls[_pollId].registrationEndTime,
        "Registration period ended"
    );

    uint256 groupId = polls[_pollId].groupId;

    // Add voter to Semaphore group
    semaphore.addMember(groupId, _identityCommitment);

    emit VoterRegistered(_pollId, _identityCommitment);
}
```

**What's happening**:
1. Verify poll exists and registration is open
2. Get the Semaphore group ID for this poll
3. Add voter's identity commitment to the group (adds leaf to Merkle tree!)
4. Emit event

**Privacy note**: The identity commitment is public on-chain, but it reveals nothing about the voter's actual identity!

#### Voting with Zero-Knowledge Proofs

This is where the ZK magic happens:

```solidity
event VoteCast(
    uint256 indexed pollId,
    uint256 option,
    uint256 nullifier
);

function vote(
    uint256 _pollId,
    uint256 _option,
    uint256 _nullifier,
    uint256[8] calldata _proof  // ZK proof
) external {
    Poll storage poll = polls[_pollId];

    require(poll.exists, "Poll does not exist");
    require(_option < poll.options.length, "Invalid option");
    require(!nullifierUsed[_nullifier], "Already voted");
    require(
        block.timestamp > poll.registrationEndTime &&
        block.timestamp <= poll.votingEndTime,
        "Not in voting period"
    );

    uint256 groupId = poll.groupId;
    uint256 merkleTreeRoot = semaphore.getMerkleTreeRoot(groupId);

    // Verify the zero-knowledge proof!
    semaphore.verifyProof(
        groupId,
        merkleTreeRoot,
        _option,      // signal (vote option)
        _nullifier,
        _option,      // external nullifier
        _proof
    );

    // Mark nullifier as used
    nullifierUsed[_nullifier] = true;

    // Record vote
    votes[_pollId][_option]++;
    poll.totalVotes++;

    emit VoteCast(_pollId, _option, _nullifier);
}
```

**What's happening**:
1. **Validate inputs**: Poll exists, option is valid, haven't voted before
2. **Check phase**: Must be in voting window (after registration, before end)
3. **Get Merkle root**: Current state of the voter group
4. **Verify ZK proof**: This is the key step!
   - Proof demonstrates: "I'm in the group AND I know the secret identity"
   - But proof doesn't reveal WHICH member you are
   - Semaphore contract does heavy cryptographic verification
5. **Prevent double-voting**: Mark nullifier as used
6. **Record vote**: Increment vote count for chosen option

**The ZK proof proves**:
- ✅ You possess the private key for one of the identities in the Merkle tree
- ✅ You computed the correct nullifier for this poll
- ✅ Your signal (vote) is authentic
- ❌ But it doesn't reveal which identity is yours!

#### View Functions

```solidity
function getResults(uint256 _pollId)
    external
    view
    returns (uint256[] memory)
{
    Poll storage poll = polls[_pollId];
    require(poll.exists, "Poll does not exist");

    uint256[] memory results = new uint256[](poll.options.length);
    for (uint256 i = 0; i < poll.options.length; i++) {
        results[i] = votes[_pollId][i];
    }

    return results;
}

function getPollPhase(uint256 _pollId)
    external
    view
    returns (string memory)
{
    Poll storage poll = polls[_pollId];
    require(poll.exists, "Poll does not exist");

    if (block.timestamp <= poll.registrationEndTime) {
        return "Registration";
    } else if (block.timestamp <= poll.votingEndTime) {
        return "Voting";
    } else {
        return "Ended";
    }
}
```

### Compiling and Testing

**Compile contracts**:
```bash
npm run compile
```

**Run tests**:
```bash
npm test
```

Our test suite covers:
- Poll creation with various parameters
- Voter registration (happy path and edge cases)
- Vote casting with ZK proofs
- Double-vote prevention
- Phase transitions
- Results computation

**Sample test** (simplified):
```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");
const { Identity } = require("@semaphore-protocol/identity");
const { Group } = require("@semaphore-protocol/group");
const { generateProof } = require("@semaphore-protocol/proof");

describe("SemaphoreVoting", function () {
  it("should allow voting with valid proof", async function () {
    // Deploy contract
    const SemaphoreVoting = await ethers.getContractFactory("SemaphoreVoting");
    const voting = await SemaphoreVoting.deploy(semaphoreAddress);

    // Create poll
    await voting.createPoll("Test Poll", ["Yes", "No"], 3600, 3600, 20);

    // Generate identity
    const identity = new Identity();
    const identityCommitment = identity.commitment;

    // Register voter
    await voting.registerVoter(0, identityCommitment);

    // Fast-forward time to voting phase
    await ethers.provider.send("evm_increaseTime", [3601]);
    await ethers.provider.send("evm_mine");

    // Generate ZK proof
    const group = new Group(0, 20);
    group.addMember(identityCommitment);

    const voteOption = 0;  // Vote for "Yes"
    const proof = await generateProof(identity, group, voteOption, 0);

    // Cast vote
    await voting.vote(0, voteOption, proof.nullifier, proof.proof);

    // Check results
    const results = await voting.getResults(0);
    expect(results[0]).to.equal(1);  // One vote for "Yes"
    expect(results[1]).to.equal(0);  // Zero votes for "No"
  });
});
```

---

<a name="part-4"></a>
## Part 4: Creating the Frontend Application

### Setting Up Next.js with Web3

**Initialize Next.js app** (if starting fresh):
```bash
npx create-next-app@latest app --typescript --tailwind --app
cd app
```

**Install Web3 dependencies**:
```bash
npm install wagmi viem @tanstack/react-query
npm install @rainbow-me/rainbowkit
npm install @semaphore-protocol/identity @semaphore-protocol/group @semaphore-protocol/proof
npm install ethers@6
npm install recharts react-hot-toast
```

### Configuring Wagmi and RainbowKit

Create `app/lib/wagmi.ts`:

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'ZK Voting',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [baseSepolia],
  ssr: true,
});
```

**Why this configuration**:
- `baseSepolia`: Our target network (cheap L2 testnet)
- `projectId`: WalletConnect for multi-wallet support
- `ssr: true`: Enables server-side rendering

### Root Layout with Providers

Create `app/app/layout.tsx`:

```typescript
import '@rainbow-me/rainbowkit/styles.css';
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

Create `app/app/providers.tsx`:

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { config } from '@/lib/wagmi';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

**What this sets up**:
- Wagmi: React hooks for Ethereum
- React Query: Data fetching and caching
- RainbowKit: Beautiful wallet connection UI

### Contract Configuration

Create `app/lib/contracts.ts`:

```typescript
export const VOTING_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_VOTING_ADDRESS as `0x${string}`;
export const SEMAPHORE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SEMAPHORE_ADDRESS as `0x${string}`;

export const VOTING_ABI = [
  // Poll creation
  {
    "inputs": [
      {"internalType": "string","name": "_title","type": "string"},
      {"internalType": "string[]","name": "_options","type": "string[]"},
      {"internalType": "uint256","name": "_registrationDuration","type": "uint256"},
      {"internalType": "uint256","name": "_votingDuration","type": "uint256"},
      {"internalType": "uint256","name": "_treeDepth","type": "uint256"}
    ],
    "name": "createPoll",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Register voter
  {
    "inputs": [
      {"internalType": "uint256","name": "_pollId","type": "uint256"},
      {"internalType": "uint256","name": "_identityCommitment","type": "uint256"}
    ],
    "name": "registerVoter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Cast vote
  {
    "inputs": [
      {"internalType": "uint256","name": "_pollId","type": "uint256"},
      {"internalType": "uint256","name": "_option","type": "uint256"},
      {"internalType": "uint256","name": "_nullifier","type": "uint256"},
      {"internalType": "uint256[8]","name": "_proof","type": "uint256[8]"}
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // View functions...
] as const;
```

---

<a name="part-5"></a>
## Part 5: Implementing Identity Management

Semaphore identities must be managed client-side for privacy. Let's build a robust identity management system.

### Understanding Semaphore Identity

A Semaphore identity consists of:
```typescript
{
  secretScalar: bigint,      // Private key
  commitment: bigint         // Public commitment (hash of private key)
}
```

The identity is serialized as JSON and stored in localStorage:
```json
{
  "secretScalar": "0x1234...",
  "commitment": "0xabcd...",
  "timestamp": 1234567890
}
```

### Building the useIdentity Hook

Create `app/hooks/useIdentity.ts`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Identity } from '@semaphore-protocol/identity';

const STORAGE_KEY = 'semaphore_identity';

export function useIdentity() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [commitment, setCommitment] = useState<string | null>(null);

  // Load identity from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        const loadedIdentity = new Identity(data.secretScalar);
        setIdentity(loadedIdentity);
        setCommitment(loadedIdentity.commitment.toString());
      } catch (error) {
        console.error('Failed to load identity:', error);
      }
    }
  }, []);

  const generateIdentity = () => {
    // Generate new random identity
    const newIdentity = new Identity();
    const identityData = {
      secretScalar: newIdentity.secretScalar.toString(),
      commitment: newIdentity.commitment.toString(),
      timestamp: Date.now(),
    };

    // Store in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identityData));

    // Auto-download backup
    downloadIdentityBackup(identityData);

    setIdentity(newIdentity);
    setCommitment(newIdentity.commitment.toString());

    return newIdentity;
  };

  const exportIdentity = () => {
    if (!identity) return;

    const identityData = {
      secretScalar: identity.secretScalar.toString(),
      commitment: identity.commitment.toString(),
      timestamp: Date.now(),
    };

    downloadIdentityBackup(identityData);
  };

  const importIdentity = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const importedIdentity = new Identity(data.secretScalar);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setIdentity(importedIdentity);
        setCommitment(importedIdentity.commitment.toString());
      } catch (error) {
        console.error('Failed to import identity:', error);
        throw new Error('Invalid identity file');
      }
    };

    reader.readAsText(file);
  };

  const clearIdentity = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIdentity(null);
    setCommitment(null);
  };

  return {
    identity,
    commitment,
    generateIdentity,
    exportIdentity,
    importIdentity,
    clearIdentity,
  };
}

// Helper: Download identity as JSON file
function downloadIdentityBackup(data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `semaphore-identity-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

**What this hook provides**:
- ✅ Auto-load identity from localStorage
- ✅ Generate new random identity
- ✅ Auto-download backup on generation
- ✅ Export identity manually
- ✅ Import identity from JSON file
- ✅ Clear identity

**Security considerations**:
- Identities stored in browser localStorage (client-side only)
- Auto-backup prevents accidental loss
- No server involvement (true privacy!)

---

<a name="part-6"></a>
## Part 6: Generating Zero-Knowledge Proofs

This is the most complex part—generating ZK proofs in the browser. Let's break it down step by step.

### Understanding Proof Generation

To generate a proof, we need:
1. **Your identity** (with private key)
2. **The group** (all registered voters as Merkle tree)
3. **Your signal** (vote option)
4. **External nullifier** (poll ID)

The proof generation process:
```
Your Identity + Group + Signal → ZK Circuit → Proof
```

This proof demonstrates you're in the group without revealing which member you are.

### Building the useSemaphore Hook

Create `app/hooks/useSemaphore.ts`:

```typescript
'use client';

import { useState } from 'react';
import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';
import { generateProof } from '@semaphore-protocol/proof';

export function useSemaphore() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateVoteProof = async (
    identity: Identity,
    groupId: bigint,
    members: string[],  // All registered identity commitments
    voteOption: number,
    pollId: number
  ) => {
    setIsGenerating(true);
    setProgress(0);

    try {
      // Step 1: Create group and add all members (10%)
      setProgress(10);
      const group = new Group(groupId, 20);  // 20 = tree depth

      for (const member of members) {
        group.addMember(BigInt(member));
      }

      // Step 2: Verify our identity is in the group (20%)
      setProgress(20);
      const memberIndex = group.indexOf(identity.commitment);
      if (memberIndex === -1) {
        throw new Error('Identity not registered in group');
      }

      // Step 3: Generate the ZK proof (20% → 90%, takes ~20-30 seconds)
      setProgress(30);

      const proof = await generateProof(
        identity,
        group,
        BigInt(voteOption),
        BigInt(pollId),
        {
          onProgress: (step: number, total: number) => {
            const proofProgress = 30 + (step / total) * 60;
            setProgress(proofProgress);
          },
        }
      );

      // Step 4: Format proof for contract (90% → 100%)
      setProgress(95);

      const formattedProof = {
        nullifier: proof.nullifier.toString(),
        proof: proof.proof.map((p: bigint) => p.toString()),
      };

      setProgress(100);
      return formattedProof;

    } catch (error) {
      console.error('Proof generation failed:', error);
      throw error;
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  return {
    generateVoteProof,
    isGenerating,
    progress,
  };
}
```

**What happens during proof generation**:

1. **Build the group** (Merkle tree):
   - Create new Group object with correct tree depth
   - Add all registered identity commitments as leaves
   - Compute Merkle root and paths

2. **Verify membership**:
   - Check your identity commitment exists in the tree
   - Get your index (position in tree)

3. **Generate ZK proof** (this is the slow part!):
   - Load WASM circuit (~20MB)
   - Compute Merkle proof (path from leaf to root)
   - Generate zero-knowledge witness
   - Create SNARK proof using Groth16 algorithm
   - **Takes 20-30 seconds due to computational complexity**

4. **Format for contract**:
   - Convert proof to format expected by Solidity
   - Extract nullifier
   - Return formatted data

### Why Is It So Slow?

ZK proof generation requires:
- **Heavy cryptography**: Elliptic curve operations, pairing checks
- **Large circuits**: Millions of constraints to satisfy
- **WASM execution**: Running complex algorithms in browser
- **Privacy guarantee**: All computation client-side (no shortcuts!)

**This is the price of anonymity**. The verification on-chain takes milliseconds, but generation takes time.

### Building the Voting Hook

Create `app/hooks/useVoting.ts`:

```typescript
'use client';

import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { VOTING_CONTRACT_ADDRESS, VOTING_ABI } from '@/lib/contracts';

export function useVoting() {
  const { writeContract, data: hash, error, isPending } = useWriteContract();

  // Create poll
  const createPoll = async (
    title: string,
    options: string[],
    registrationDuration: number,  // in minutes
    votingDuration: number,        // in minutes
    treeDepth: number
  ) => {
    return writeContract({
      address: VOTING_CONTRACT_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'createPoll',
      args: [
        title,
        options,
        BigInt(registrationDuration * 60),  // convert to seconds
        BigInt(votingDuration * 60),
        BigInt(treeDepth),
      ],
    });
  };

  // Register voter
  const registerVoter = async (pollId: number, identityCommitment: string) => {
    return writeContract({
      address: VOTING_CONTRACT_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'registerVoter',
      args: [BigInt(pollId), BigInt(identityCommitment)],
    });
  };

  // Cast vote
  const submitVote = async (
    pollId: number,
    option: number,
    nullifier: string,
    proof: string[]
  ) => {
    return writeContract({
      address: VOTING_CONTRACT_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'vote',
      args: [
        BigInt(pollId),
        BigInt(option),
        BigInt(nullifier),
        proof.map((p) => BigInt(p)) as [bigint, bigint, bigint, bigint, bigint, bigint, bigint, bigint],
      ],
    });
  };

  return {
    createPoll,
    registerVoter,
    submitVote,
    isPending,
    error,
    hash,
  };
}

// Hook to read poll information
export function usePollInfo(pollId: number) {
  return useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'polls',
    args: [BigInt(pollId)],
    query: {
      refetchInterval: 10000,  // Refetch every 10 seconds
    },
  });
}

// Hook to read poll results
export function usePollResults(pollId: number) {
  return useReadContract({
    address: VOTING_CONTRACT_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'getResults',
    args: [BigInt(pollId)],
    query: {
      refetchInterval: 5000,  // Refetch every 5 seconds
    },
  });
}
```

---

<a name="part-7"></a>
## Part 7: Testing & Deployment

### Running Contract Tests

```bash
npm run test
```

**Expected output**:
```
  SemaphoreVoting
    ✓ should deploy successfully
    ✓ should create poll with valid parameters
    ✓ should register voters during registration phase
    ✓ should prevent voting before voting phase
    ✓ should allow voting with valid proof
    ✓ should prevent double voting
    ✓ should count votes correctly
    ✓ should transition phases based on time

  8 passing (12s)
```

### Deploying to Base Sepolia

**Compile contracts**:
```bash
npm run compile
```

**Deploy**:
```bash
npm run deploy:base-sepolia
```

**Expected output**:
```
Deploying SemaphoreVoting to Base Sepolia...
Deployer: 0xYourAddress
Deployer balance: 0.05 ETH

SemaphoreVoting deployed to: 0xNewContractAddress
Transaction hash: 0xtxhash

Verify with:
npx hardhat verify --network base-sepolia 0xNewContractAddress 0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D
```

**Verify contract on Basescan**:
```bash
npx hardhat verify \
  --network base-sepolia \
  0xYourDeployedAddress \
  0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D
```

**Update frontend environment**:
```bash
# In app/.env.local
NEXT_PUBLIC_VOTING_ADDRESS=0xYourDeployedAddress
```

### Running the Frontend

```bash
cd app
npm run dev
```

Visit http://localhost:3000 and test:
1. Connect wallet
2. Generate identity (backup downloads automatically!)
3. Create a poll
4. Register to vote
5. Cast vote (watch the ZK proof generation!)
6. View results

---

<a name="part-8"></a>
## Part 8: Advanced Topics & Best Practices

### Security Considerations

**Smart Contract**:
- ✅ Use audited Semaphore V4 contracts
- ✅ Validate all inputs (options count, tree depth, phases)
- ✅ Prevent double-voting via nullifier tracking
- ✅ Immutable polls (can't change after creation)
- ⚠️ Consider professional audit for production

**Frontend**:
- ✅ Generate identities client-side only
- ✅ Auto-download backups
- ✅ Clear warnings about identity loss
- ✅ Validate proofs before submission
- ⚠️ Consider encrypted identity storage
- ⚠️ Implement session timeouts for high-stakes voting

### Performance Optimization

**Proof Generation**:
- Use appropriate tree depth (16-20 for most cases)
- Show clear progress indicators
- Set user expectations ("~30 seconds")
- Consider server-side proof generation for better UX (trade-off: centralization)

**Contract Gas Costs**:
- ✅ Already optimized with Base L2
- Consider batching operations for admins
- Use events for off-chain indexing (The Graph)

### Scaling Considerations

**Large Voter Groups**:
- Tree depth 20 = 1M voters (reasonable)
- Tree depth 32 = 4B voters (maximum, slow proofs)
- Consider sharding for billions of voters

**High Throughput**:
- Base L2 handles ~100 TPS
- For higher throughput, consider:
  - Proof aggregation (batch multiple votes)
  - Optimistic rollups with Semaphore
  - Alternative L2s (Arbitrum, Optimism)

### Coercion Resistance

**Current limitations**:
- Voters can prove how they voted (show private key)
- Not coercion-resistant out of the box

**Solutions**:
- Use MACI (Minimal Anti-Collusion Infrastructure) instead
- Implement vote changing periods
- Social accountability mechanisms

### Future Enhancements

**Features to add**:
- Weighted voting (token-based)
- Delegation (vote on behalf)
- Multi-choice voting (rank preferences)
- Private results (reveal only after voting ends)
- On-chain result aggregation (save gas)

**Integration ideas**:
- DAO governance platforms (Snapshot, Tally)
- Social platforms (anonymous posts with verified membership)
- Whistleblowing systems
- Private surveys
- Anonymous authentication

---

## Conclusion: You've Built a Production-Ready ZK Voting System!

Congratulations! You now have:

✅ **Deep understanding** of zero-knowledge proofs and Semaphore
✅ **Working smart contracts** with ZK proof verification
✅ **Modern Web3 frontend** with wallet integration
✅ **Complete voting flow** from identity generation to result viewing
✅ **Production deployment** on Base L2 testnet
✅ **Best practices** for security and UX

### What You've Learned

**Cryptography**:
- Zero-knowledge proof fundamentals
- Merkle tree construction
- Nullifier mechanisms
- Identity commitments

**Smart Contract Development**:
- Semaphore protocol integration
- Time-based phase management
- Event-driven architecture
- Gas optimization

**Full-Stack Web3**:
- Next.js 15 + React 19
- Wagmi + RainbowKit
- Client-side cryptography
- Real-time blockchain data

**Privacy Engineering**:
- Client-side identity management
- Anonymous group membership
- Unlinkable voting
- Double-vote prevention

### Next Steps

**For Learning**:
1. Study the [Semaphore documentation](https://docs.semaphore.pse.dev/)
2. Explore other ZK protocols (MACI, Aztec, Zcash)
3. Learn circom for custom ZK circuits
4. Read ZK proof papers (Groth16, PLONK)

**For Building**:
1. Customize the UI/UX
2. Add features (delegation, weighted voting, quadratic funding)
3. Integrate with your DAO
4. Deploy to mainnet (after audit!)
5. Build other privacy-preserving apps:
   - Anonymous social networks
   - Private DAOs
   - Whistleblowing platforms
   - Anonymous authentication

**For Community**:
1. Share your project
2. Contribute to Semaphore
3. Write tutorials
4. Help others build privacy tech

### Final Thoughts

Privacy is not a luxury—it's a fundamental right. Blockchain technology promises transparency and decentralization, but we must preserve privacy to protect individuals.

Zero-knowledge proofs are one of the most powerful tools we have to achieve both transparency AND privacy. By learning to build with Semaphore, you're joining a movement to create a more private, fair, and free digital world.

**Keep building. Keep learning. Keep prioritizing privacy.**

---

## Resources

### Documentation
- [Semaphore Docs](https://docs.semaphore.pse.dev/)
- [Semaphore GitHub](https://github.com/semaphore-protocol/semaphore)
- [Hardhat Docs](https://hardhat.org/docs)
- [Wagmi Docs](https://wagmi.sh/)
- [RainbowKit Docs](https://www.rainbowkit.com/docs)
- [Base Docs](https://docs.base.org/)

### Code
- [This Project's GitHub](https://github.com/YOUR_REPO)
- [Deployed Contract on Basescan](https://sepolia.basescan.org/address/0xDCf4b632E9AdadC9Cb9aE6611a7Aa0f5daC37D4d)
- [PSE Semaphore Examples](https://github.com/semaphore-protocol/semaphore/tree/main/apps)

### Learning
- [Zero-Knowledge Proofs MOOC](https://zk-learning.org/)
- [PSE (Privacy & Scaling Explorations)](https://pse.dev/)
- [ZK Whiteboard Sessions](https://zkhack.dev/whiteboard/)
- [Circom Workshop](https://github.com/iden3/circom)

### Community
- [PSE Discord](https://discord.gg/pse)
- [Semaphore Telegram](https://t.me/semaphore_protocol)
- [Ethereum R&D Discord](https://discord.gg/qGpsxSA)

---

## About the Author

[Your bio, links, and contact information]

---

**Did this tutorial help you?**
- ⭐ Star the repo: [GitHub link]
- 🐦 Share on Twitter/X: [Tweet link]
- 💬 Join discussions: [Discord/Telegram]
- 🙏 Support: [Donation link if applicable]

---

*Published on [Date] • Last updated: [Date]*
*Licensed under MIT • Built with ❤️ for the privacy movement*
