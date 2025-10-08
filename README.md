# ZK Voting dApp

Anonymous and verifiable voting powered by Semaphore zero-knowledge proofs.

**🌐 Network**: Base Sepolia (Layer 2 Testnet)
**🔗 Chain ID**: 84532
**📍 Explorer**: https://sepolia.basescan.org

## 📦 Deployed Contracts

| Contract | Address | Explorer |
|----------|---------|----------|
| **SemaphoreVoting** | `0xDCf4b632E9AdadC9Cb9aE6611a7Aa0f5daC37D4d` | [View on Basescan](https://sepolia.basescan.org/address/0xDCf4b632E9AdadC9Cb9aE6611a7Aa0f5daC37D4d#code) |
| **Semaphore** | `0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D` | [View on Basescan](https://sepolia.basescan.org/address/0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D) |

> **Why Base Sepolia?** Base is an Ethereum Layer 2 (L2) built on Optimism's OP Stack, offering significantly lower gas costs (~10-100x cheaper than Ethereum mainnet) while maintaining security through Ethereum. This makes it ideal for ZK voting applications where proof verification can be gas-intensive. Base Sepolia is the testnet for Base.

## 🚀 Features

- **Complete Anonymity**: Vote without revealing your identity
- **Verifiable Eligibility**: Only registered voters can vote
- **Double-Vote Prevention**: Cryptographically enforced one-vote-per-person
- **Transparent Results**: Publicly verifiable outcomes
- **No Trusted Authority**: Secured by zero-knowledge cryptography

## 🏗️ Architecture

**Smart Contracts** (Solidity + Hardhat):
- `SemaphoreVoting.sol` - Main voting contract with Semaphore integration
- Deployed on **Base Sepolia testnet** (Layer 2)

**Frontend** (Next.js + TypeScript):
- Modern React with App Router
- RainbowKit for wallet connection
- Semaphore protocol for ZK proofs
- TailwindCSS for styling

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- MetaMask or another Web3 wallet
- Base Sepolia testnet ETH (for deployment) - Get from [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia)

## 🛠️ Quick Start

### 1. Clone & Install

```bash
git clone <your-repo>
cd zk-voting-semaphore

# Install root dependencies (Hardhat)
npm install

# Install frontend dependencies
cd app
npm install
cd ..
```

### 2. Configure Environment

**Root `.env`** (for contract deployment):
```bash
cp .env.example .env
```

Edit `.env`:
```env
BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
DEPLOYER_PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
SEMAPHORE_ADDRESS=0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D  # Base Sepolia Semaphore
```

**Frontend `app/.env.local`**:
```bash
cp app/.env.example app/.env.local
```

Edit `app/.env.local`:
```env
NEXT_PUBLIC_VOTING_ADDRESS=<deployed_voting_contract_address>
NEXT_PUBLIC_SEMAPHORE_ADDRESS=0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D  # Base Sepolia
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your_walletconnect_id>
NEXT_PUBLIC_CHAIN_ID=84532  # Base Sepolia Chain ID
```

### 3. Compile Smart Contracts

```bash
npm run compile
```

### 4. Deploy Contracts

**Option A: Deploy to Base Sepolia Testnet**

The Semaphore contract is already deployed on Base Sepolia:
- **Semaphore Address**: `0x8A1fd199516489B0Fb7153EB5f075cDAC83c693D`
- Check [Semaphore deployments](https://docs.semaphore.pse.dev/deployed-contracts) for other networks

Deploy your voting contract:
```bash
npm run deploy:base-sepolia
```

**Option B: Local Hardhat Network** (for testing)

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy
npm run deploy:local
```

### 5. Run Frontend

```bash
cd app
npm run dev
```

Visit: http://localhost:3000

## 📖 How to Use

### For Poll Creators

1. **Connect Wallet**: Click "Connect Wallet" in the header
2. **Create Poll**:
   - Click "Create New Poll"
   - Enter poll title and options (2-10)
   - Set registration duration (hours for voter registration)
   - Set voting duration (hours for actual voting)
   - Choose max voters (tree depth)
   - Click "Create Poll"

3. **Share Poll**: Share the poll URL with voters

### For Voters

1. **Generate Identity**:
   - Click "Generate Identity" in the header
   - **IMPORTANT**: Backup the JSON file that downloads automatically
   - Your identity is stored in browser localStorage

2. **Register to Vote**:
   - Visit the poll page during **Registration Phase**
   - Click "Register to Vote"
   - Confirm wallet transaction

3. **Cast Vote**:
   - Wait for **Voting Phase** to begin
   - Select your choice
   - Click "Submit Vote"
   - Wait 20-30 seconds for ZK proof generation
   - Confirm transaction

4. **View Results**:
   - Results are visible in real-time
   - Final results shown after poll ends

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

## 🐛 Troubleshooting

### Common Issues

**"Proof generation taking too long"**
- ZK proofs take 20-30 seconds to generate
- Use a lower tree depth for faster generation (fewer max voters)

**"Transaction failed"**
- Check you're on the correct network (**Base Sepolia** - Chain ID: 84532)
- Ensure you have enough ETH for gas (get from [Base Sepolia Faucet](https://www.alchemy.com/faucets/base-sepolia))
- Verify registration/voting phase is active

**"Identity lost"**
- Import from backup JSON file
- If no backup, identity is unrecoverable
- Generate new identity and re-register (if registration open)

**"Can't connect wallet"**
- Ensure MetaMask is installed
- Add and switch to **Base Sepolia** network in MetaMask:
  - Network Name: `Base Sepolia`
  - RPC URL: `https://sepolia.base.org`
  - Chain ID: `84532`
  - Currency Symbol: `ETH`
  - Block Explorer: `https://sepolia.basescan.org`
- Check WalletConnect project ID is configured

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
