import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

async function main() {
  console.log("🚀 Deploying SemaphoreVoting contract...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

  // Get Semaphore address from environment or use default
  const SEMAPHORE_ADDRESS = process.env.SEMAPHORE_ADDRESS;

  if (!SEMAPHORE_ADDRESS) {
    console.error("❌ Error: SEMAPHORE_ADDRESS not set in .env");
    console.log("\nℹ️  Please deploy or get the Semaphore contract address first.");
    console.log("   For Sepolia testnet, you can use the official Semaphore deployment.");
    console.log("   Visit: https://docs.semaphore.pse.dev/deployed-contracts\n");
    process.exit(1);
  }

  console.log("🔗 Using Semaphore contract at:", SEMAPHORE_ADDRESS, "\n");

  // Deploy SemaphoreVoting
  console.log("⏳ Deploying SemaphoreVoting...");
  const SemaphoreVoting = await ethers.getContractFactory("SemaphoreVoting");
  const voting = await SemaphoreVoting.deploy(SEMAPHORE_ADDRESS);

  await voting.waitForDeployment();
  const votingAddress = await voting.getAddress();

  console.log("✅ SemaphoreVoting deployed to:", votingAddress, "\n");

  // Save deployment info
  const network = await ethers.provider.getNetwork();
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    semaphoreAddress: SEMAPHORE_ADDRESS,
    votingAddress: votingAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("📄 Deployment info saved to:", deploymentFile, "\n");

  console.log("=" . repeat(60));
  console.log("🎉 Deployment Complete!\n");
  console.log("Next steps:");
  console.log("1. Verify contract on Etherscan:");
  console.log(`   npx hardhat verify --network ${network.name} ${votingAddress} ${SEMAPHORE_ADDRESS}`);
  console.log("\n2. Update frontend environment variables:");
  console.log(`   NEXT_PUBLIC_VOTING_ADDRESS=${votingAddress}`);
  console.log(`   NEXT_PUBLIC_SEMAPHORE_ADDRESS=${SEMAPHORE_ADDRESS}`);
  console.log("=" . repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
