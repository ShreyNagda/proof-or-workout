import Web3 from "web3";
import type { Contract } from "web3-eth-contract";

// ---------------------------------------------------------------------------
// ABI — matches the ProofOfWorkout Solidity contract
// ---------------------------------------------------------------------------
export const POW_ABI = [
  {
    name: "joinChallenge",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "submitProof",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "steps", type: "uint256" }],
    outputs: [],
  },
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
  // Events
  {
    name: "ChallengeJoined",
    type: "event",
    inputs: [{ name: "user", type: "address", indexed: true }],
  },
  {
    name: "ProofSubmitted",
    type: "event",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "steps", type: "uint256", indexed: false },
    ],
  },
] as const;

// ---------------------------------------------------------------------------
// Environment variables (Next.js public prefix for client-side)
// ---------------------------------------------------------------------------
const SEPOLIA_RPC_URL =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ?? "https://rpc.sepolia.org"; // fallback public RPC

const _rawAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ?? "";

// Validate at module load time — fail loudly rather than send to 0x000
if (
  typeof window !== "undefined" && // client-side only check
  (!_rawAddress || _rawAddress === "0x0000000000000000000000000000000000000000")
) {
  console.error(
    "[POW] NEXT_PUBLIC_CONTRACT_ADDRESS is not set.\n" +
      "1. Deploy ProofOfWorkout.sol to Sepolia.\n" +
      "2. Copy the address into .env.local as NEXT_PUBLIC_CONTRACT_ADDRESS=0x...\n" +
      "3. Restart the dev server.",
  );
}

export const CONTRACT_ADDRESS: string = _rawAddress;

// ---------------------------------------------------------------------------
// Provider Web3 — MetaMask / browser wallet
// Creates a new instance each time to avoid stale provider references.
// ---------------------------------------------------------------------------
export function getProviderWeb3(): Web3 {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask (window.ethereum) not found.");
  }
  return new Web3(window.ethereum as any) as Web3;
}

// ---------------------------------------------------------------------------
// Relayer Web3 — private-key signer over Sepolia RPC
// Used server-side or in a trusted environment to submit proofs.
// WARNING: Never expose RELAYER_PRIVATE_KEY in the browser bundle.
// ---------------------------------------------------------------------------
export function getRelayerWeb3(): Web3 {
  const rpcUrl = process.env.SEPOLIA_RPC_URL ?? SEPOLIA_RPC_URL;
  const privateKey = process.env.RELAYER_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error(
      "RELAYER_PRIVATE_KEY env variable is not set. " +
        "This must only run on the server / trusted environment.",
    );
  }

  const web3 = new Web3(rpcUrl);
  const account = web3.eth.accounts.privateKeyToAccount(privateKey);
  web3.eth.accounts.wallet.add(account);
  web3.eth.defaultAccount = account.address;
  return web3;
}

// ---------------------------------------------------------------------------
// Read-only Web3 — Sepolia RPC, no signer required
// Safe to use on the client for `.call()` queries.
// ---------------------------------------------------------------------------
export function getReadWeb3(): Web3 {
  return new Web3(SEPOLIA_RPC_URL);
}

// ---------------------------------------------------------------------------
// Contract factory helpers
// ---------------------------------------------------------------------------
type POWContract = Contract<typeof POW_ABI>;

/** Contract instance connected to MetaMask signer */
export function getProviderContract(): POWContract {
  const web3 = getProviderWeb3();
  return new web3.eth.Contract(POW_ABI, CONTRACT_ADDRESS);
}

/** Contract instance connected to the relayer private key */
export function getRelayerContract(): POWContract {
  const web3 = getRelayerWeb3();
  return new web3.eth.Contract(POW_ABI, CONTRACT_ADDRESS);
}

/** Read-only contract instance (safe for client) */
export function getReadContract(): POWContract {
  const web3 = getReadWeb3();
  return new web3.eth.Contract(POW_ABI, CONTRACT_ADDRESS);
}

// ---------------------------------------------------------------------------
// Utility: mask an Ethereum address  0x1234...abcd
// ---------------------------------------------------------------------------
export function maskAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// ---------------------------------------------------------------------------
// Utility: extract step count from raw OCR text
// Looks for standalone 3–6 digit numbers (likely step counts).
// Returns the largest match, or null if none found.
// ---------------------------------------------------------------------------
export function extractStepsFromOCR(text: string): number | null {
  // Match standalone numbers between 100 and 999999 (3–6 digits)
  const matches = text.match(/\b([1-9]\d{2,5})\b/g);
  if (!matches || matches.length === 0) return null;

  const numbers = matches.map(Number);
  // Return the largest candidate — most likely to be a step count
  return Math.max(...numbers);
}

// ---------------------------------------------------------------------------
// Type augmentation for window.ethereum
// ---------------------------------------------------------------------------
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ethereum?: any;
  }
}
