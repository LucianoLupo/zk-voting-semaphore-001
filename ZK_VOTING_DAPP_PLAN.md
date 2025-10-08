# ZK Voting dApp - Complete Implementation Plan

## 🎯 Project Overview

**Goal**: Build a fully functional, production-ready decentralized voting application using Semaphore V4 for anonymous, verifiable voting.

**Core Value Propositions**:
- ✅ Complete anonymity (no one knows who voted for what)
- ✅ Verifiable eligibility (only registered voters can vote)
- ✅ Double-vote prevention (cryptographically enforced)
- ✅ Transparent results (anyone can verify)
- ✅ No trusted intermediary needed

---

## 📐 Technical Architecture

### Tech Stack

**Blockchain Layer**:
- **Smart Contracts**: Solidity 0.8.23
- **Framework**: Hardhat
- **Network**: Ethereum Sepolia (testnet) → Mainnet
- **ZK Protocol**: Semaphore V4

**Frontend Layer**:
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Wallet**: Wagmi v2 + RainbowKit
- **State**: React hooks + Context API

**Infrastructure**:
- **Deployment**: Vercel (frontend) + Hardhat (contracts)
- **RPC**: Alchemy or Infura
- **Storage**: Browser localStorage (identities)

### System Components

```
┌─────────────────────────────────────────────┐
│           Frontend (Next.js)                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Create  │  │   Vote   │  │ Results  │  │
│  │   Poll   │  │ (ZK Gen) │  │Dashboard │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────┘
                    ↕ Web3 Calls
┌─────────────────────────────────────────────┐
│      Smart Contracts (Ethereum)             │
│  ┌──────────────────┐  ┌─────────────────┐ │
│  │ SemaphoreVoting  │→ │ Semaphore Core  │ │
│  │  (Your Logic)    │  │  (Verification) │ │
│  └──────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
zk-voting-semaphore/
│
├── contracts/                    # Smart contracts
│   ├── SemaphoreVoting.sol      # Main voting contract
│   ├── interfaces/
│   │   └── ISemaphore.sol       # Semaphore interface
│   └── mocks/                   # Test contracts
│
├── scripts/                      # Deployment & utilities
│   ├── deploy.ts                # Deploy voting contract
│   ├── create-poll.ts           # Example: create poll
│   └── helpers.ts               # Shared utilities
│
├── test/                         # Contract tests
│   ├── SemaphoreVoting.test.ts
│   └── fixtures.ts
│
├── app/                          # Next.js frontend
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Home: poll list
│   │
│   ├── create/                  # Create poll page
│   │   └── page.tsx
│   │
│   ├── poll/[id]/               # Poll detail page
│   │   └── page.tsx
│   │
│   ├── components/              # React components
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── WalletConnect.tsx
│   │   ├── poll/
│   │   │   ├── PollCard.tsx
│   │   │   ├── PollList.tsx
│   │   │   ├── CreatePollForm.tsx
│   │   │   └── PollStatus.tsx
│   │   ├── voting/
│   │   │   ├── IdentityManager.tsx
│   │   │   ├── RegisterButton.tsx
│   │   │   ├── VoteForm.tsx
│   │   │   └── ProofGenerationStatus.tsx
│   │   └── results/
│   │       ├── Results.tsx
│   │       ├── VoteChart.tsx
│   │       └── PollStats.tsx
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── useIdentity.ts      # Identity management
│   │   ├── useVoting.ts        # Contract interactions
│   │   ├── useSemaphore.ts     # ZK proof generation
│   │   └── usePoll.ts          # Poll data fetching
│   │
│   ├── lib/                     # Core utilities
│   │   ├── semaphore.ts        # Semaphore helpers
│   │   ├── contracts.ts        # Contract ABIs & addresses
│   │   ├── storage.ts          # localStorage utilities
│   │   └── constants.ts        # App constants
│   │
│   └── types/                   # TypeScript types
│       ├── poll.ts
│       ├── identity.ts
│       └── contracts.ts
│
├── public/                       # Static assets
│   └── images/
│
├── docs/                         # Documentation
│   ├── USER_GUIDE.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
│
├── hardhat.config.ts            # Hardhat configuration
├── next.config.js               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies
├── .env.example                 # Environment template
├── README.md                    # Main documentation
├── SEMAPHORE_DOCUMENTATION.md   # Semaphore reference
└── ZK_VOTING_DAPP_PLAN.md       # This file!
```

---

## 🔧 Phase-by-Phase Implementation Plan

### Phase 1: Project Foundation ⚡

**1.1 Initialize Hardhat Project**

```bash
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init # Select "TypeScript project"
```

**1.2 Initialize Next.js Project**

```bash
npx create-next-app@latest app --typescript --tailwind --app
# Options:
# - TypeScript: Yes
# - ESLint: Yes
# - Tailwind CSS: Yes
# - src/ directory: No
# - App Router: Yes
# - Import alias: Yes (@/*)
```

**1.3 Install Smart Contract Dependencies**

```bash
npm install --save-dev \
  @semaphore-protocol/contracts@^4.0.0 \
  @openzeppelin/contracts@^5.0.0 \
  hardhat-deploy@^0.12.0 \
  @nomicfoundation/hardhat-verify

npm install ethers@^6.0.0
```

**1.4 Install Frontend Dependencies**

```bash
cd app
npm install \
  @semaphore-protocol/identity@^4.0.0 \
  @semaphore-protocol/group@^4.0.0 \
  @semaphore-protocol/proof@^4.0.0 \
  wagmi@^2.0.0 \
  viem@^2.0.0 \
  @rainbow-me/rainbowkit@^2.0.0 \
  @tanstack/react-query@^5.0.0 \
  react-hot-toast@^2.4.1 \
  recharts@^2.10.0
```

**1.5 Configure Environment**

**Root `.env`**:
```env
# Deployment
DEPLOYER_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_key

# RPC URLs
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
```

**app/.env.local**:
```env
NEXT_PUBLIC_VOTING_ADDRESS=0x...
NEXT_PUBLIC_SEMAPHORE_ADDRESS=0x...
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_wc_project_id
NEXT_PUBLIC_ALCHEMY_ID=your_alchemy_key
NEXT_PUBLIC_CHAIN_ID=11155111  # Sepolia
```

**1.6 Configure Hardhat**

**hardhat.config.ts**:
```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import "hardhat-deploy";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.23",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 11155111,
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL || "",
      accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
      chainId: 1,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;
```

---

### Phase 2: Smart Contract Development 📝

**2.1 Contract Architecture**

**contracts/SemaphoreVoting.sol**:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

contract SemaphoreVoting {
    ISemaphore public semaphore;

    struct Poll {
        string title;
        string[] options;
        uint256 startTime;
        uint256 registrationEndTime;
        uint256 votingEndTime;
        address admin;
        uint256 groupId;
        uint256 totalVotes;
        bool exists;
    }

    // State variables
    uint256 public pollCount;
    mapping(uint256 => Poll) public polls;
    mapping(uint256 => mapping(uint256 => uint256)) public votes; // pollId => optionIndex => count
    mapping(uint256 => mapping(uint256 => bool)) public usedNullifiers; // pollId => nullifier => used

    // Events
    event PollCreated(
        uint256 indexed pollId,
        string title,
        address indexed admin,
        uint256 registrationEndTime,
        uint256 votingEndTime,
        uint256 groupId
    );

    event VoterRegistered(
        uint256 indexed pollId,
        uint256 identityCommitment
    );

    event VoteCast(
        uint256 indexed pollId,
        uint256 voteOption,
        uint256 nullifier
    );

    // Modifiers
    modifier pollExists(uint256 pollId) {
        require(polls[pollId].exists, "Poll does not exist");
        _;
    }

    modifier onlyAdmin(uint256 pollId) {
        require(msg.sender == polls[pollId].admin, "Only admin");
        _;
    }

    modifier duringRegistration(uint256 pollId) {
        require(
            block.timestamp >= polls[pollId].startTime &&
            block.timestamp < polls[pollId].registrationEndTime,
            "Not in registration phase"
        );
        _;
    }

    modifier duringVoting(uint256 pollId) {
        require(
            block.timestamp >= polls[pollId].registrationEndTime &&
            block.timestamp < polls[pollId].votingEndTime,
            "Not in voting phase"
        );
        _;
    }

    constructor(address semaphoreAddress) {
        semaphore = ISemaphore(semaphoreAddress);
    }

    /**
     * @dev Create a new poll
     */
    function createPoll(
        string memory title,
        string[] memory options,
        uint256 registrationDuration,
        uint256 votingDuration,
        uint256 merkleTreeDepth
    ) external returns (uint256) {
        require(options.length >= 2, "At least 2 options required");
        require(options.length <= 10, "Max 10 options");
        require(merkleTreeDepth >= 1 && merkleTreeDepth <= 32, "Invalid tree depth");

        uint256 pollId = pollCount++;
        uint256 startTime = block.timestamp;
        uint256 registrationEndTime = startTime + registrationDuration;
        uint256 votingEndTime = registrationEndTime + votingDuration;

        // Create Semaphore group
        uint256 groupId = pollId; // Use pollId as groupId for simplicity
        semaphore.createGroup(groupId, merkleTreeDepth);

        Poll storage poll = polls[pollId];
        poll.title = title;
        poll.options = options;
        poll.startTime = startTime;
        poll.registrationEndTime = registrationEndTime;
        poll.votingEndTime = votingEndTime;
        poll.admin = msg.sender;
        poll.groupId = groupId;
        poll.exists = true;

        emit PollCreated(
            pollId,
            title,
            msg.sender,
            registrationEndTime,
            votingEndTime,
            groupId
        );

        return pollId;
    }

    /**
     * @dev Register a voter by adding their identity commitment to the group
     */
    function registerVoter(
        uint256 pollId,
        uint256 identityCommitment
    ) external pollExists(pollId) duringRegistration(pollId) {
        uint256 groupId = polls[pollId].groupId;
        semaphore.addMember(groupId, identityCommitment);

        emit VoterRegistered(pollId, identityCommitment);
    }

    /**
     * @dev Cast a vote using ZK proof
     */
    function vote(
        uint256 pollId,
        uint256 voteOption,
        uint256 merkleTreeDepth,
        uint256 merkleTreeRoot,
        uint256 nullifier,
        uint256[8] calldata points
    ) external pollExists(pollId) duringVoting(pollId) {
        Poll storage poll = polls[pollId];

        // Validate vote option
        require(voteOption < poll.options.length, "Invalid vote option");

        // Check nullifier hasn't been used
        require(!usedNullifiers[pollId][nullifier], "Vote already cast");

        // Verify ZK proof
        semaphore.validateProof(
            poll.groupId,
            merkleTreeDepth,
            merkleTreeRoot,
            nullifier,
            pollId, // externalNullifier (scope)
            voteOption, // signal (the vote)
            points
        );

        // Record vote
        votes[pollId][voteOption]++;
        usedNullifiers[pollId][nullifier] = true;
        poll.totalVotes++;

        emit VoteCast(pollId, voteOption, nullifier);
    }

    /**
     * @dev Get poll results
     */
    function getResults(uint256 pollId)
        external
        view
        pollExists(pollId)
        returns (uint256[] memory)
    {
        Poll storage poll = polls[pollId];
        uint256[] memory results = new uint256[](poll.options.length);

        for (uint256 i = 0; i < poll.options.length; i++) {
            results[i] = votes[pollId][i];
        }

        return results;
    }

    /**
     * @dev Get poll information
     */
    function getPollInfo(uint256 pollId)
        external
        view
        pollExists(pollId)
        returns (
            string memory title,
            string[] memory options,
            uint256 startTime,
            uint256 registrationEndTime,
            uint256 votingEndTime,
            address admin,
            uint256 totalVotes
        )
    {
        Poll storage poll = polls[pollId];
        return (
            poll.title,
            poll.options,
            poll.startTime,
            poll.registrationEndTime,
            poll.votingEndTime,
            poll.admin,
            poll.totalVotes
        );
    }

    /**
     * @dev Get current poll phase
     */
    function getPollPhase(uint256 pollId)
        external
        view
        pollExists(pollId)
        returns (string memory)
    {
        Poll storage poll = polls[pollId];

        if (block.timestamp < poll.registrationEndTime) {
            return "Registration";
        } else if (block.timestamp < poll.votingEndTime) {
            return "Voting";
        } else {
            return "Ended";
        }
    }
}
```

**contracts/interfaces/ISemaphore.sol**:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface ISemaphore {
    function createGroup(uint256 groupId, uint256 merkleTreeDepth) external;

    function addMember(uint256 groupId, uint256 identityCommitment) external;

    function validateProof(
        uint256 groupId,
        uint256 merkleTreeDepth,
        uint256 merkleTreeRoot,
        uint256 nullifier,
        uint256 externalNullifier,
        uint256 signal,
        uint256[8] calldata points
    ) external view;
}
```

**2.2 Write Comprehensive Tests**

**test/SemaphoreVoting.test.ts**:

```typescript
import { expect } from "chai";
import { ethers } from "hardhat";
import { SemaphoreVoting } from "../typechain-types";
import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";
import { generateProof } from "@semaphore-protocol/proof";

describe("SemaphoreVoting", function () {
  let voting: SemaphoreVoting;
  let semaphoreAddress: string;

  beforeEach(async function () {
    // Deploy mock Semaphore (or use real one)
    // Deploy SemaphoreVoting
    const VotingFactory = await ethers.getContractFactory("SemaphoreVoting");
    voting = await VotingFactory.deploy(semaphoreAddress);
  });

  describe("Poll Creation", function () {
    it("Should create poll with correct parameters", async function () {
      const tx = await voting.createPoll(
        "Test Poll",
        ["Option A", "Option B"],
        3600, // 1 hour registration
        7200, // 2 hours voting
        20    // tree depth
      );

      await expect(tx).to.emit(voting, "PollCreated");

      const pollInfo = await voting.getPollInfo(0);
      expect(pollInfo.title).to.equal("Test Poll");
      expect(pollInfo.options).to.deep.equal(["Option A", "Option B"]);
    });

    it("Should reject poll with less than 2 options", async function () {
      await expect(
        voting.createPoll("Bad Poll", ["Only One"], 3600, 7200, 20)
      ).to.be.revertedWith("At least 2 options required");
    });
  });

  describe("Voter Registration", function () {
    it("Should allow voter registration during registration phase", async function () {
      // Create poll
      await voting.createPoll("Test", ["A", "B"], 3600, 7200, 20);

      // Create identity
      const identity = new Identity();

      // Register
      const tx = await voting.registerVoter(0, identity.commitment);
      await expect(tx).to.emit(voting, "VoterRegistered");
    });

    it("Should reject registration after deadline", async function () {
      await voting.createPoll("Test", ["A", "B"], 1, 7200, 20); // 1 second registration

      // Wait for registration to end
      await ethers.provider.send("evm_increaseTime", [2]);
      await ethers.provider.send("evm_mine", []);

      const identity = new Identity();
      await expect(
        voting.registerVoter(0, identity.commitment)
      ).to.be.revertedWith("Not in registration phase");
    });
  });

  describe("Voting", function () {
    it("Should accept valid vote with ZK proof", async function () {
      // Setup: create poll and register voter
      await voting.createPoll("Test", ["A", "B"], 3600, 7200, 20);
      const identity = new Identity();
      await voting.registerVoter(0, identity.commitment);

      // Move to voting phase
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine", []);

      // Generate proof
      const group = new Group(0, 20, [identity.commitment]);
      const proof = await generateProof(identity, group, 0, 0); // vote for option 0, poll 0

      // Submit vote
      const tx = await voting.vote(
        0,
        0,
        proof.merkleTreeDepth,
        proof.merkleTreeRoot,
        proof.nullifier,
        proof.points
      );

      await expect(tx).to.emit(voting, "VoteCast");

      // Check results
      const results = await voting.getResults(0);
      expect(results[0]).to.equal(1);
      expect(results[1]).to.equal(0);
    });

    it("Should prevent double voting", async function () {
      // Setup and first vote (same as above)
      // ...

      // Try to vote again with same identity
      await expect(
        voting.vote(0, 1, proof.merkleTreeDepth, proof.merkleTreeRoot, proof.nullifier, proof.points)
      ).to.be.revertedWith("Vote already cast");
    });

    it("Should reject vote during registration phase", async function () {
      await voting.createPoll("Test", ["A", "B"], 3600, 7200, 20);
      const identity = new Identity();
      await voting.registerVoter(0, identity.commitment);

      // Try to vote during registration (don't advance time)
      const group = new Group(0, 20, [identity.commitment]);
      const proof = await generateProof(identity, group, 0, 0);

      await expect(
        voting.vote(0, 0, proof.merkleTreeDepth, proof.merkleTreeRoot, proof.nullifier, proof.points)
      ).to.be.revertedWith("Not in voting phase");
    });
  });

  describe("Results", function () {
    it("Should correctly tally votes", async function () {
      // Create poll
      await voting.createPoll("Test", ["A", "B", "C"], 3600, 7200, 20);

      // Register 3 voters
      const voters = [new Identity(), new Identity(), new Identity()];
      for (const voter of voters) {
        await voting.registerVoter(0, voter.commitment);
      }

      // Move to voting phase
      await ethers.provider.send("evm_increaseTime", [3601]);
      await ethers.provider.send("evm_mine", []);

      // Cast votes: A, A, B
      const group = new Group(0, 20, voters.map(v => v.commitment));

      // Vote 1: Option A
      let proof = await generateProof(voters[0], group, 0, 0);
      await voting.vote(0, 0, proof.merkleTreeDepth, proof.merkleTreeRoot, proof.nullifier, proof.points);

      // Vote 2: Option A
      proof = await generateProof(voters[1], group, 0, 0);
      await voting.vote(0, 0, proof.merkleTreeDepth, proof.merkleTreeRoot, proof.nullifier, proof.points);

      // Vote 3: Option B
      proof = await generateProof(voters[2], group, 1, 0);
      await voting.vote(0, 1, proof.merkleTreeDepth, proof.merkleTreeRoot, proof.nullifier, proof.points);

      // Check results
      const results = await voting.getResults(0);
      expect(results[0]).to.equal(2); // A: 2 votes
      expect(results[1]).to.equal(1); // B: 1 vote
      expect(results[2]).to.equal(0); // C: 0 votes
    });
  });
});
```

**2.3 Deployment Script**

**scripts/deploy.ts**:

```typescript
import { ethers } from "hardhat";
import fs from "fs";

async function main() {
  console.log("Deploying SemaphoreVoting...");

  // Get Semaphore address (deploy or use existing)
  const SEMAPHORE_ADDRESS = process.env.SEMAPHORE_ADDRESS || "0x...";

  // Deploy SemaphoreVoting
  const VotingFactory = await ethers.getContractFactory("SemaphoreVoting");
  const voting = await VotingFactory.deploy(SEMAPHORE_ADDRESS);

  await voting.waitForDeployment();
  const votingAddress = await voting.getAddress();

  console.log("SemaphoreVoting deployed to:", votingAddress);

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    semaphoreAddress: SEMAPHORE_ADDRESS,
    votingAddress: votingAddress,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(
    "./deployments.json",
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to deployments.json");
  console.log("\nNext steps:");
  console.log("1. Verify contract: npx hardhat verify --network sepolia", votingAddress, SEMAPHORE_ADDRESS);
  console.log("2. Update app/.env.local with NEXT_PUBLIC_VOTING_ADDRESS=" + votingAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

### Phase 3: Frontend Core 🎨

**3.1 Wallet Integration**

**app/layout.tsx**:

```tsx
'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Toaster } from 'react-hot-toast';

const config = getDefaultConfig({
  appName: 'ZK Voting dApp',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>
              {children}
              <Toaster position="bottom-right" />
            </RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
```

**3.2 Contract Integration**

**app/lib/contracts.ts**:

```typescript
export const VOTING_ADDRESS = process.env.NEXT_PUBLIC_VOTING_ADDRESS as `0x${string}`;
export const SEMAPHORE_ADDRESS = process.env.NEXT_PUBLIC_SEMAPHORE_ADDRESS as `0x${string}`;

export const VOTING_ABI = [
  // Event signatures
  "event PollCreated(uint256 indexed pollId, string title, address indexed admin, uint256 registrationEndTime, uint256 votingEndTime, uint256 groupId)",
  "event VoterRegistered(uint256 indexed pollId, uint256 identityCommitment)",
  "event VoteCast(uint256 indexed pollId, uint256 voteOption, uint256 nullifier)",

  // Functions
  "function createPoll(string title, string[] options, uint256 registrationDuration, uint256 votingDuration, uint256 merkleTreeDepth) returns (uint256)",
  "function registerVoter(uint256 pollId, uint256 identityCommitment)",
  "function vote(uint256 pollId, uint256 voteOption, uint256 merkleTreeDepth, uint256 merkleTreeRoot, uint256 nullifier, uint256[8] points)",
  "function getResults(uint256 pollId) view returns (uint256[])",
  "function getPollInfo(uint256 pollId) view returns (string title, string[] options, uint256 startTime, uint256 registrationEndTime, uint256 votingEndTime, address admin, uint256 totalVotes)",
  "function getPollPhase(uint256 pollId) view returns (string)",
  "function pollCount() view returns (uint256)",
] as const;
```

**app/hooks/useVoting.ts**:

```typescript
import { useWriteContract, useReadContract } from 'wagmi';
import { VOTING_ADDRESS, VOTING_ABI } from '@/lib/contracts';

export function useVoting() {
  const { writeContractAsync } = useWriteContract();

  const createPoll = async (
    title: string,
    options: string[],
    registrationDuration: number,
    votingDuration: number,
    treeDepth: number
  ) => {
    const hash = await writeContractAsync({
      address: VOTING_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'createPoll',
      args: [title, options, registrationDuration, votingDuration, treeDepth],
    });
    return hash;
  };

  const registerVoter = async (pollId: number, commitment: bigint) => {
    const hash = await writeContractAsync({
      address: VOTING_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'registerVoter',
      args: [pollId, commitment],
    });
    return hash;
  };

  const submitVote = async (
    pollId: number,
    voteOption: number,
    merkleTreeDepth: number,
    merkleTreeRoot: bigint,
    nullifier: bigint,
    points: bigint[]
  ) => {
    const hash = await writeContractAsync({
      address: VOTING_ADDRESS,
      abi: VOTING_ABI,
      functionName: 'vote',
      args: [pollId, voteOption, merkleTreeDepth, merkleTreeRoot, nullifier, points],
    });
    return hash;
  };

  return { createPoll, registerVoter, submitVote };
}

export function usePollInfo(pollId: number) {
  const { data, isLoading, error } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'getPollInfo',
    args: [pollId],
  });

  return { pollInfo: data, isLoading, error };
}

export function usePollResults(pollId: number) {
  const { data, isLoading, error } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'getResults',
    args: [pollId],
  });

  return { results: data, isLoading, error };
}
```

**3.3 Identity Management**

**app/hooks/useIdentity.ts**:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Identity } from '@semaphore-protocol/identity';

const STORAGE_KEY = 'semaphore-identity';

interface StoredIdentity {
  identityString: string;
  createdAt: number;
  registeredPolls: number[];
}

export function useIdentity() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [registeredPolls, setRegisteredPolls] = useState<number[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data: StoredIdentity = JSON.parse(stored);
        const loadedIdentity = new Identity(data.identityString);
        setIdentity(loadedIdentity);
        setRegisteredPolls(data.registeredPolls || []);
      } catch (error) {
        console.error('Failed to load identity:', error);
      }
    }
  }, []);

  const generateIdentity = () => {
    const newIdentity = new Identity();
    const data: StoredIdentity = {
      identityString: newIdentity.toString(),
      createdAt: Date.now(),
      registeredPolls: [],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setIdentity(newIdentity);
    setRegisteredPolls([]);
  };

  const exportIdentity = () => {
    if (!identity) return;

    const stored = localStorage.getItem(STORAGE_KEY);
    const data = stored ? JSON.parse(stored) : {};
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `semaphore-identity-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importIdentity = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data: StoredIdentity = JSON.parse(e.target?.result as string);
        const importedIdentity = new Identity(data.identityString);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setIdentity(importedIdentity);
        setRegisteredPolls(data.registeredPolls || []);
      } catch (error) {
        console.error('Failed to import identity:', error);
      }
    };
    reader.readAsText(file);
  };

  const clearIdentity = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIdentity(null);
    setRegisteredPolls([]);
  };

  const addRegisteredPoll = (pollId: number) => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: StoredIdentity = JSON.parse(stored);
      data.registeredPolls = [...(data.registeredPolls || []), pollId];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setRegisteredPolls(data.registeredPolls);
    }
  };

  const isRegisteredForPoll = (pollId: number) => {
    return registeredPolls.includes(pollId);
  };

  return {
    identity,
    registeredPolls,
    generateIdentity,
    exportIdentity,
    importIdentity,
    clearIdentity,
    addRegisteredPoll,
    isRegisteredForPoll,
  };
}
```

---

### Phase 4: Voting Flow Implementation 🗳️

**4.1 Create Poll UI**

**app/create/page.tsx**:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVoting } from '@/hooks/useVoting';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';

export default function CreatePollPage() {
  const router = useRouter();
  const { address } = useAccount();
  const { createPoll } = useVoting();

  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [registrationHours, setRegistrationHours] = useState(24);
  const [votingHours, setVotingHours] = useState(48);
  const [treeDepth, setTreeDepth] = useState(20);
  const [loading, setLoading] = useState(false);

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a poll title');
      return;
    }

    if (options.some(opt => !opt.trim())) {
      toast.error('All options must be filled');
      return;
    }

    setLoading(true);

    try {
      const registrationDuration = registrationHours * 3600;
      const votingDuration = votingHours * 3600;

      const hash = await createPoll(
        title,
        options,
        registrationDuration,
        votingDuration,
        treeDepth
      );

      toast.success('Poll created successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error('Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create New Poll</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Poll Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="What should we have for lunch?"
          />
        </div>

        {/* Options */}
        <div>
          <label className="block text-sm font-medium mb-2">Options</label>
          {options.map((option, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="flex-1 p-3 border rounded-lg"
                placeholder={`Option ${index + 1}`}
              />
              {options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          {options.length < 10 && (
            <button
              type="button"
              onClick={addOption}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Add Option
            </button>
          )}
        </div>

        {/* Durations */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Registration Duration (hours)
            </label>
            <input
              type="number"
              value={registrationHours}
              onChange={(e) => setRegistrationHours(Number(e.target.value))}
              min={1}
              className="w-full p-3 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Voting Duration (hours)
            </label>
            <input
              type="number"
              value={votingHours}
              onChange={(e) => setVotingHours(Number(e.target.value))}
              min={1}
              className="w-full p-3 border rounded-lg"
            />
          </div>
        </div>

        {/* Tree Depth */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Max Voters (Tree Depth)
          </label>
          <select
            value={treeDepth}
            onChange={(e) => setTreeDepth(Number(e.target.value))}
            className="w-full p-3 border rounded-lg"
          >
            <option value={16}>65,536 voters (depth 16)</option>
            <option value={20}>1,048,576 voters (depth 20)</option>
            <option value={24}>16,777,216 voters (depth 24)</option>
            <option value={32}>4,294,967,295 voters (depth 32)</option>
          </select>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating Poll...' : 'Create Poll'}
        </button>
      </form>
    </div>
  );
}
```

**4.2 ZK Proof Generation**

**app/hooks/useSemaphore.ts**:

```typescript
import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';
import { generateProof } from '@semaphore-protocol/proof';
import { useState } from 'react';

export function useSemaphore() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState('');

  const generateVoteProof = async (
    pollId: number,
    voteOption: number,
    identity: Identity,
    groupMembers: bigint[],
    treeDepth: number
  ) => {
    setIsGenerating(true);
    setProgress('Creating group...');

    try {
      // Create group
      const group = new Group(pollId, treeDepth, groupMembers);

      // Verify membership
      setProgress('Verifying membership...');
      if (!groupMembers.includes(identity.commitment)) {
        throw new Error('Identity not registered for this poll');
      }

      // Generate proof (this is the slow part!)
      setProgress('Generating zero-knowledge proof... (this may take 20-30 seconds)');
      const proof = await generateProof(
        identity,
        group,
        BigInt(voteOption),
        BigInt(pollId)
      );

      setProgress('Proof generated successfully!');

      return {
        merkleTreeDepth: proof.merkleTreeDepth,
        merkleTreeRoot: proof.merkleTreeRoot,
        nullifier: proof.nullifier,
        message: proof.message,
        points: proof.points,
      };
    } catch (error) {
      setProgress('Error generating proof');
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateVoteProof, isGenerating, progress };
}
```

**4.3 Voting Interface**

**app/poll/[id]/page.tsx**:

```tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { usePollInfo, useVoting, usePollResults } from '@/hooks/useVoting';
import { useIdentity } from '@/hooks/useIdentity';
import { useSemaphore } from '@/hooks/useSemaphore';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';

export default function PollPage() {
  const params = useParams();
  const pollId = Number(params.id);
  const { address } = useAccount();

  const { pollInfo, isLoading: loadingPoll } = usePollInfo(pollId);
  const { results, isLoading: loadingResults } = usePollResults(pollId);
  const { identity, isRegisteredForPoll, addRegisteredPoll } = useIdentity();
  const { registerVoter, submitVote } = useVoting();
  const { generateVoteProof, isGenerating, progress } = useSemaphore();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [registering, setRegistering] = useState(false);
  const [voting, setVoting] = useState(false);

  const handleRegister = async () => {
    if (!identity) {
      toast.error('Please generate an identity first');
      return;
    }

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    setRegistering(true);

    try {
      const hash = await registerVoter(pollId, identity.commitment);
      toast.success('Registered successfully!');
      addRegisteredPoll(pollId);
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  const handleVote = async () => {
    if (selectedOption === null) {
      toast.error('Please select an option');
      return;
    }

    if (!identity) {
      toast.error('Please generate an identity first');
      return;
    }

    if (!address) {
      toast.error('Please connect your wallet');
      return;
    }

    setVoting(true);

    try {
      // Fetch group members (simplified - would use contract call)
      const groupMembers = [identity.commitment]; // TODO: fetch from contract

      // Generate proof
      const proof = await generateVoteProof(
        pollId,
        selectedOption,
        identity,
        groupMembers,
        20 // TODO: get from poll info
      );

      // Submit vote
      const hash = await submitVote(
        pollId,
        selectedOption,
        proof.merkleTreeDepth,
        proof.merkleTreeRoot,
        proof.nullifier,
        proof.points
      );

      toast.success('Vote submitted successfully!');
    } catch (error) {
      console.error('Voting failed:', error);
      toast.error('Voting failed');
    } finally {
      setVoting(false);
    }
  };

  if (loadingPoll) {
    return <div className="p-6">Loading poll...</div>;
  }

  if (!pollInfo) {
    return <div className="p-6">Poll not found</div>;
  }

  const [title, options, startTime, regEndTime, voteEndTime, admin, totalVotes] = pollInfo;
  const now = Date.now() / 1000;
  const phase = now < regEndTime ? 'Registration' : now < voteEndTime ? 'Voting' : 'Ended';

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>

      {/* Phase indicator */}
      <div className="mb-6 p-4 bg-blue-100 rounded-lg">
        <p className="font-semibold">Phase: {phase}</p>
      </div>

      {/* Registration phase */}
      {phase === 'Registration' && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Registration</h2>
          {isRegisteredForPoll(pollId) ? (
            <p className="text-green-600">✓ You are registered</p>
          ) : (
            <button
              onClick={handleRegister}
              disabled={registering || !identity}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg"
            >
              {registering ? 'Registering...' : 'Register to Vote'}
            </button>
          )}
        </div>
      )}

      {/* Voting phase */}
      {phase === 'Voting' && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Cast Your Vote</h2>

          {isGenerating && (
            <div className="mb-4 p-4 bg-yellow-100 rounded-lg">
              <p className="font-semibold">{progress}</p>
            </div>
          )}

          <div className="space-y-3 mb-4">
            {options.map((option: string, index: number) => (
              <label
                key={index}
                className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name="vote"
                  value={index}
                  checked={selectedOption === index}
                  onChange={() => setSelectedOption(index)}
                  className="mr-3"
                  disabled={voting || isGenerating}
                />
                <span className="text-lg">{option}</span>
              </label>
            ))}
          </div>

          <button
            onClick={handleVote}
            disabled={selectedOption === null || voting || isGenerating || !identity}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold"
          >
            {voting ? 'Submitting Vote...' : 'Submit Vote'}
          </button>
        </div>
      )}

      {/* Results */}
      {(phase === 'Ended' || results) && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Results</h2>
          {loadingResults ? (
            <p>Loading results...</p>
          ) : (
            <div className="space-y-3">
              {results && options.map((option: string, index: number) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{option}</span>
                    <span className="font-bold">{Number(results[index])} votes</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-blue-600 h-4 rounded-full"
                      style={{
                        width: `${totalVotes > 0 ? (Number(results[index]) / Number(totalVotes)) * 100 : 0}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### Phase 5: UI/UX Polish 🎨

**5.1 Header Component**

**app/components/layout/Header.tsx**:

```tsx
'use client';

import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useIdentity } from '@/hooks/useIdentity';

export default function Header() {
  const { identity, generateIdentity, exportIdentity } = useIdentity();

  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-bold">
            ZK Voting
          </Link>
          <nav className="flex gap-6">
            <Link href="/" className="hover:text-blue-600">
              Polls
            </Link>
            <Link href="/create" className="hover:text-blue-600">
              Create Poll
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Identity Status */}
          {identity ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Identity: {identity.commitment.toString().slice(0, 8)}...
              </span>
              <button
                onClick={exportIdentity}
                className="text-sm text-blue-600 hover:underline"
              >
                Export
              </button>
            </div>
          ) : (
            <button
              onClick={generateIdentity}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm"
            >
              Generate Identity
            </button>
          )}

          {/* Wallet Connect */}
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
```

**5.2 Poll List Component**

**app/page.tsx**:

```tsx
'use client';

import { useReadContract } from 'wagmi';
import { VOTING_ADDRESS, VOTING_ABI } from '@/lib/contracts';
import Link from 'next/link';

export default function HomePage() {
  const { data: pollCount } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'pollCount',
  });

  const totalPolls = pollCount ? Number(pollCount) : 0;
  const pollIds = Array.from({ length: totalPolls }, (_, i) => i);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Active Polls</h1>
        <Link
          href="/create"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold"
        >
          Create New Poll
        </Link>
      </div>

      {totalPolls === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-xl">No polls yet. Create the first one!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pollIds.map((id) => (
            <PollCard key={id} pollId={id} />
          ))}
        </div>
      )}
    </div>
  );
}

function PollCard({ pollId }: { pollId: number }) {
  const { data: pollInfo } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'getPollInfo',
    args: [pollId],
  });

  const { data: phase } = useReadContract({
    address: VOTING_ADDRESS,
    abi: VOTING_ABI,
    functionName: 'getPollPhase',
    args: [pollId],
  });

  if (!pollInfo) return null;

  const [title, options, , , , , totalVotes] = pollInfo;

  const phaseColors = {
    Registration: 'bg-blue-100 text-blue-800',
    Voting: 'bg-green-100 text-green-800',
    Ended: 'bg-gray-100 text-gray-800',
  };

  return (
    <Link
      href={`/poll/${pollId}`}
      className="block p-6 border-2 rounded-xl hover:shadow-lg transition-shadow"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-bold">{title}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${phaseColors[phase as keyof typeof phaseColors] || ''}`}>
          {phase}
        </span>
      </div>

      <p className="text-gray-600 mb-3">{options.length} options</p>

      {phase === 'Ended' && (
        <p className="text-sm text-gray-500">{Number(totalVotes)} total votes</p>
      )}
    </Link>
  );
}
```

---

### Phase 6: Testing & Quality Assurance 🧪

**6.1 Run Smart Contract Tests**

```bash
npx hardhat test
npx hardhat coverage
```

**Target**: >90% coverage

**6.2 Frontend Testing Setup**

**Install dependencies**:
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom
```

**jest.config.js**:
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(customJestConfig);
```

**6.3 Manual Testing Checklist**

- [ ] Create poll with 2 options
- [ ] Create poll with 10 options
- [ ] Generate identity
- [ ] Export identity
- [ ] Import identity
- [ ] Register for poll
- [ ] Try to register after deadline (should fail)
- [ ] Vote for option
- [ ] Try to vote twice (should fail)
- [ ] View results
- [ ] Test wallet connection/disconnection
- [ ] Test on mobile

---

### Phase 7: Deployment 🚀

**7.1 Deploy to Sepolia Testnet**

```bash
# 1. Fund wallet with Sepolia ETH (from faucet)

# 2. Deploy contracts
npx hardhat run scripts/deploy.ts --network sepolia

# 3. Verify on Etherscan
npx hardhat verify --network sepolia <VOTING_ADDRESS> <SEMAPHORE_ADDRESS>

# 4. Update frontend .env.local with contract addresses
```

**7.2 Deploy Frontend to Vercel**

```bash
# 1. Push to GitHub

# 2. Import project in Vercel

# 3. Set environment variables:
#    - NEXT_PUBLIC_VOTING_ADDRESS
#    - NEXT_PUBLIC_SEMAPHORE_ADDRESS
#    - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
#    - NEXT_PUBLIC_ALCHEMY_ID
#    - NEXT_PUBLIC_CHAIN_ID=11155111

# 4. Deploy!
```

**7.3 Test on Production**

- [ ] Create test poll
- [ ] Register voters
- [ ] Cast votes
- [ ] Verify results
- [ ] Check transactions on Etherscan

---

## 🔒 Security Considerations

### Smart Contract Security

1. **Access Control**
   - Time-based modifiers prevent actions outside allowed phases
   - Only poll admin can manage (if needed)

2. **Proof Verification**
   - All proofs verified through Semaphore's audited contract
   - Nullifier uniqueness enforced
   - Merkle root validation

3. **Input Validation**
   - Poll parameters validated (2-10 options, valid durations)
   - Vote options bounds-checked
   - Timestamp logic verified

4. **Gas Optimization**
   - Events for off-chain indexing
   - Efficient storage patterns
   - Minimal on-chain computation

### Frontend Security

1. **Identity Protection**
   - Clear backup warnings
   - Never transmitted over network
   - LocalStorage encryption (optional enhancement)
   - Identity reuse warnings

2. **Transaction Safety**
   - Transaction preview before signing
   - Gas estimation
   - Error handling
   - User confirmations

3. **Input Sanitization**
   - All user inputs validated
   - React's built-in XSS protection
   - Form validation

### Operational Security

1. **Key Management**
   - Hardware wallet for mainnet
   - Private keys in .env (gitignored)
   - Multi-sig for contract ownership (production)

2. **Monitoring**
   - Event monitoring for unusual patterns
   - Failed proof alerts
   - Gas price monitoring

---

## 🎯 Feature Prioritization

### MVP (Phase 1) ✅

**Must-have for initial launch**:
- ✅ Create polls (title, options, timing)
- ✅ Generate Semaphore identity
- ✅ Register to vote
- ✅ Submit anonymous vote with ZK proof
- ✅ View results
- ✅ Double-vote prevention
- ✅ Time-based phases
- ✅ Basic responsive UI
- ✅ Sepolia deployment

**Timeline**: ~4 weeks

### Enhanced Features (Phase 2) 🚀

**Nice-to-have additions**:
- Poll search and filtering
- Poll categories/tags
- Token-gated voting (ERC20/ERC721)
- Export results (CSV/JSON)
- QR code sharing
- Email notifications
- Dark mode
- Admin analytics dashboard
- Vote delegation

**Timeline**: +2-3 weeks

### Advanced Features (Phase 3) 🌟

**Future expansion**:
- Encrypted results (reveal after deadline)
- Weighted voting
- Quadratic voting
- Multi-chain support (Polygon, Arbitrum, Base)
- Gasless voting (meta-transactions)
- DAO integration
- Snapshot integration
- Mobile app
- IPFS metadata storage
- Custom proof systems

**Timeline**: +4-6 weeks

---

## 📊 Implementation Timeline

### Week 1: Foundation
- **Day 1-2**: Project setup, dependencies, configuration
- **Day 3-4**: Smart contract development
- **Day 5-7**: Contract testing, deployment to Sepolia

### Week 2: Frontend Core
- **Day 1-2**: Wallet integration, contract hooks
- **Day 3-4**: Identity management system
- **Day 5-7**: Poll creation UI

### Week 3: Voting Flow
- **Day 1-3**: Voter registration implementation
- **Day 4-5**: ZK proof generation
- **Day 6-7**: Vote submission and testing

### Week 4: Polish & Deploy
- **Day 1-2**: Results display, UI improvements
- **Day 3-4**: End-to-end testing, bug fixes
- **Day 5**: Documentation
- **Day 6-7**: Production deployment, demo creation

**Total MVP**: ~4 weeks

---

## 🚧 Potential Challenges & Solutions

### Challenge 1: Slow Proof Generation

**Problem**: ZK proof generation takes 10-30 seconds

**Solutions**:
- ✅ Clear loading indicators with progress messages
- ✅ Web Workers to prevent UI freeze
- ✅ Optimize tree depth (smaller = faster)
- ⚡ Pre-generate on option selection (speculative)
- ⚡ Use faster proving systems (future)

### Challenge 2: Large Group Sizes

**Problem**: Fetching 10,000+ commitments is slow/expensive

**Solutions**:
- ✅ Index events with The Graph
- ✅ Cache group data in frontend
- ✅ Incremental Merkle updates
- ⚡ Deploy on L2 for scalability

### Challenge 3: Identity Loss

**Problem**: Users lose identity → can't prove membership

**Solutions**:
- ✅ Prominent backup warnings on generation
- ✅ Automatic export download
- ✅ Import/export functionality
- ⚡ Recovery mechanism (controversial - may break anonymity)
- ✅ Education: one identity per poll (less critical if lost)

### Challenge 4: High Gas Costs

**Problem**: Proof verification costs 300k-500k gas

**Solutions**:
- ✅ Deploy on L2 (Arbitrum, Optimism) - 10-100x cheaper
- ⚡ Batch verification (off-chain aggregation)
- ⚡ Meta-transactions (gas sponsorship)
- ✅ Optimize contract code

### Challenge 5: UX Complexity

**Problem**: ZK concepts are complex for average users

**Solutions**:
- ✅ Simple, guided flows
- ✅ Tooltips and inline help
- ✅ Video tutorials
- ✅ Progressive disclosure
- ✅ User testing with non-technical users

---

## 📚 Documentation Requirements

### README.md
- Project overview
- What is ZK voting
- Quick start guide
- Technology stack
- Demo link
- Contributing guidelines

### SETUP.md
- Development environment setup
- Install dependencies
- Run locally
- Run tests
- Deploy contracts
- Deploy frontend

### USER_GUIDE.md
- How to generate identity
- How to backup/restore identity
- How to create a poll
- How to vote
- How to view results
- FAQ
- Troubleshooting

### ARCHITECTURE.md
- System design overview
- Smart contract architecture
- Frontend architecture
- Data flow diagrams
- Semaphore integration
- Security model

### API_REFERENCE.md
- Smart contract functions
- Events
- Frontend hooks
- TypeScript types
- Constants

---

## ✅ Definition of Done

The project is **complete** when:

### Smart Contracts ✅
- [ ] Deployed to Sepolia testnet
- [ ] Verified on Etherscan
- [ ] All tests passing (>90% coverage)
- [ ] No critical security issues
- [ ] Gas optimized

### Frontend ✅
- [ ] Deployed to Vercel
- [ ] All MVP features working
- [ ] Responsive on mobile/tablet/desktop
- [ ] Error handling implemented
- [ ] Loading states for all async operations
- [ ] Wallet connection working
- [ ] Identity management working
- [ ] ZK proof generation working
- [ ] Vote submission working
- [ ] Results display working

### Testing ✅
- [ ] Contract tests passing
- [ ] Frontend builds without errors
- [ ] End-to-end flow tested on Sepolia
- [ ] Tested with multiple users
- [ ] Edge cases handled
- [ ] Mobile tested

### Documentation ✅
- [ ] README with setup instructions
- [ ] User guide with screenshots
- [ ] Architecture documentation
- [ ] API reference
- [ ] Inline code comments

### Demo ✅
- [ ] Live demo available
- [ ] Sample polls created
- [ ] Demo video recorded
- [ ] GitHub repo public

---

## 🎓 Learning Resources

- **Semaphore Docs**: https://docs.semaphore.pse.dev/
- **Hardhat Docs**: https://hardhat.org/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Wagmi Docs**: https://wagmi.sh/
- **RainbowKit Docs**: https://www.rainbowkit.com/docs

---

## 🤝 Support & Community

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Semaphore Discord**: https://semaphore.pse.dev/discord
- **Twitter**: Share your progress!

---

**Ready to build? Let's make privacy-preserving voting a reality! 🚀**
