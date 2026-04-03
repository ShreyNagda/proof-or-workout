require("dotenv").config({ path: "../.env.local" });

// Set ts-node to use hardhat-specific tsconfig
process.env.TS_NODE_PROJECT = "./tsconfig.hardhat.json";

require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");

const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || "";

// Validate private key format (expect 0x + 64 hex chars). If invalid, warn and skip accounts
function isValidPrivateKey(key) {
  return /^0x[0-9a-fA-F]{64}$/.test(key);
}

if (DEPLOYER_PRIVATE_KEY && !isValidPrivateKey(DEPLOYER_PRIVATE_KEY)) {
  // Helpful message for developers — don't expose secrets in logs in production
  // eslint-disable-next-line no-console
  console.warn(
    "Warning: DEPLOYER_PRIVATE_KEY in .env.local is not a valid 32-byte hex private key. Hardhat will skip adding accounts for sepolia.",
  );
}

/** @type import('hardhat/config').HardhatUserConfig */
const config = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./tests",
    cache: "./hardhat-cache",
    artifacts: "./hardhat-artifacts",
  },
};

module.exports = config;
