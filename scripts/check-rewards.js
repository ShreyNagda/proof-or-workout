const Web3 = require("web3");

// Configuration
const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x38F9180DF41Ad30bF4C741ac6324B7a2CA3A2888";
const RPC_URL =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ||
  "https://eth-sepolia.g.alchemy.com/v2/0WtLvVZJs_uNyVxoBpVfg";

const ABI = [
  {
    name: "getRewards",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "hasJoined",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "getTotalSteps",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
];

async function checkContract(userAddress) {
  const web3 = new Web3(RPC_URL);
  const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

  console.log("📍 Contract Address:", CONTRACT_ADDRESS);
  console.log("👤 User Address:", userAddress);
  console.log("");

  try {
    // Check if user has joined
    const joined = await contract.methods.hasJoined(userAddress).call();
    console.log("✅ Has Joined:", joined);

    if (joined) {
      // Get total steps
      const steps = await contract.methods
        .getTotalSteps()
        .call({ from: userAddress });
      console.log("👟 Total Steps:", steps.toString());

      // Get rewards
      const rewards = await contract.methods
        .getRewards()
        .call({ from: userAddress });
      const rewardsInEth = web3.utils.fromWei(rewards.toString(), "ether");
      console.log("💰 Rewards (wei):", rewards.toString());
      console.log("💰 Rewards (POW):", rewardsInEth);
    } else {
      console.log("⚠️  User has not joined the challenge yet");
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Get user address from command line argument
const userAddress = process.argv[2];

if (!userAddress) {
  console.error("Usage: node scripts/check-rewards.js <USER_ADDRESS>");
  process.exit(1);
}

checkContract(userAddress);
