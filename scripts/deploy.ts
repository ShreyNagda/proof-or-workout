import hre from "hardhat";

const { ethers } = hre;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // Check deployer balance before attempting deploy
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer balance:", ethers.formatEther(balance), "ETH");

  if (balance === BigInt(0)) {
    throw new Error(
      "Deployer wallet has 0 ETH. Get Sepolia ETH from:\n" +
        "https://cloud.google.com/application/web3/faucet/ethereum/sepolia",
    );
  }

  console.log("Deploying ProofOfWorkout...");
  const POW = await ethers.getContractFactory("ProofOfWorkout");
  const contract = await POW.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("✅ ProofOfWorkout deployed to:", address);
  console.log(
    "🔍 View on Etherscan:",
    `https://sepolia.etherscan.io/address/${address}`,
  );
  console.log("\n📋 Add this to your .env.local:");
  console.log(`NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err.message);
  process.exit(1);
});
