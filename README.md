# ⚡ Proof of Workout (POW)

Decentralized fitness verification dApp — submit workout screenshots, get steps verified on-chain via OCR.

**Stack**: Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Web3.js v4 · Tesseract.js · Ethereum Sepolia

---

## Project Structure

```
pow-app/
├── app/
│   ├── globals.css        # Tailwind v4 entry + design tokens
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main UI — OCR + Web3 logic
├── utils/
│   └── contract.ts        # Web3 instances, ABI, helpers
├── contracts/
│   └── ProofOfWorkout.sol # Solidity contract (deploy separately)
├── .env.example           # Environment variable template
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── package.json
```

---

## Quick Start

### 1. Install dependencies
```bash
npm install
# Node.js v20+ required
```

### 2. Configure environment
```bash
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SEPOLIA_RPC_URL, NEXT_PUBLIC_CONTRACT_ADDRESS, RELAYER_PRIVATE_KEY
```

### 3. Deploy the contract (Remix / Hardhat)
- Open `contracts/ProofOfWorkout.sol` in [Remix IDE](https://remix.ethereum.org)
- Compile with Solidity `^0.8.24`
- Deploy to **Sepolia** testnet
- Copy the deployed address → `NEXT_PUBLIC_CONTRACT_ADDRESS`

### 4. Run the dev server
```bash
npm run dev
# Open http://localhost:3000
```

---

## Workflow

| Step | Action | Details |
|------|--------|---------|
| 1 | **Connect** | MetaMask prompts; app switches to Sepolia automatically |
| 2 | **Join** | Calls `joinChallenge()` — one-time wallet TX |
| 3 | **Upload** | Screenshot from Google Fit / Apple Health (max 3/day) |
| 4 | **OCR** | Tesseract.js extracts text client-side, regex finds 3–6 digit step count |
| 5 | **Submit** | `submitProof(steps)` sent on-chain; rewards accrue per step |
| 6 | **Refresh** | `getRewards()` read-only call returns accrued POW tokens |

---

## Contract Functions

| Function | Caller | Description |
|----------|--------|-------------|
| `joinChallenge()` | User wallet | Enrol in the challenge |
| `submitProof(uint256 steps)` | Relayer / user | Record verified step count |
| `getRewards() → uint256` | Read-only call | Fetch accrued rewards in wei |
| `hasJoined(address) → bool` | Read-only call | Check enrolment status |

---

## Relayer Pattern

`RELAYER_PRIVATE_KEY` is a **server-side** env variable. The `getRelayerWeb3()` function in `utils/contract.ts` initialises a Web3 instance with that key added to `eth.accounts.wallet`. In a production setup you would expose a Next.js **API Route** (`/api/submit-proof`) that:

1. Receives `{ userAddress, steps }` from the client
2. Verifies OCR result server-side
3. Signs and sends `submitProof(steps)` via the relayer account

This demo allows the user's wallet to call `submitProof` directly — swap to the API route pattern when you need gas abstraction.

---

## Environment Variables

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | Client | Alchemy/Infura Sepolia endpoint |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Client | Deployed contract address |
| `RELAYER_PRIVATE_KEY` | **Server only** | Relayer burner wallet private key |
| `SEPOLIA_RPC_URL` | Server | Server-side RPC (can match public) |

> ⚠️ Never prefix `RELAYER_PRIVATE_KEY` with `NEXT_PUBLIC_` — it would be exposed in the browser bundle.
