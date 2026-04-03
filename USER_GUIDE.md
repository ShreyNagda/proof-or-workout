# 🏃‍♂️ Proof of Workout - User Guide

Welcome to Proof of Workout! This dApp lets you earn crypto rewards by verifying your daily workout steps on the blockchain.

## 🎯 What You Need

1. **MetaMask Wallet** - [Install here](https://metamask.io/)
2. **Sepolia Testnet ETH** - Free test tokens for gas fees
3. **Workout Screenshots** - From Google Fit or Apple Health

## 📱 Getting Sepolia ETH (Free!)

Visit any of these faucets to get free test ETH:

- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
- [QuickNode Faucet](https://faucet.quicknode.com/ethereum/sepolia)

You only need a tiny amount (~0.01 ETH) for gas fees.

## 🚀 How to Use

### Step 1: Connect Your Wallet

1. Click **"Connect Wallet"**
2. Approve the MetaMask connection
3. The app will automatically switch you to Sepolia testnet

### Step 2: Join the Challenge

1. Click **"Join Challenge"**
2. Confirm the transaction in MetaMask
3. Wait for confirmation (~15 seconds)

### Step 3: Submit Your Workout

1. Take a screenshot of your step count from:

   - Google Fit (Android)
   - Apple Health (iPhone)
   - Any fitness tracker showing step count

2. Click **"Choose File"** and upload your screenshot

3. Wait for OCR to detect your steps (5-10 seconds)

4. When you see the green success banner, click **"Submit Proof"**

5. Confirm the transaction in MetaMask

### Step 4: Check Your Rewards

- Your rewards will automatically update after submission
- Click **"Refresh Rewards"** anytime to see latest balance
- Rewards are calculated as: **1 Gwei per step**

## 💰 Reward Calculation

| Steps  | Rewards (POW) |
| ------ | ------------- |
| 5,000  | 0.000005 POW  |
| 10,000 | 0.00001 POW   |
| 15,000 | 0.000015 POW  |

_Note: These are test tokens on Sepolia, not real money_

## 📸 Screenshot Tips

For best OCR results:

- ✅ Clear, high-resolution images
- ✅ Good lighting/contrast
- ✅ Step count clearly visible (3-6 digit number)
- ✅ Crop to focus on the step count area
- ❌ Avoid blurry or dark screenshots
- ❌ Don't include multiple step counts in one image

## ⚡ Features

- **No Cooldown**: Submit multiple proofs in succession
- **Client-Side OCR**: Your images never leave your browser
- **Real-time Processing**: See results immediately
- **Blockchain Verified**: All submissions recorded on Ethereum

## 🔒 Privacy & Security

- ✅ Images processed locally in your browser
- ✅ No data stored on servers
- ✅ Only step counts are recorded on-chain
- ✅ Your wallet address is the only identifier

## ❓ Troubleshooting

### "No valid step count found"

- Make sure your screenshot shows a clear 3-6 digit number
- Try cropping the image to focus on the step count
- Ensure good lighting and contrast

### "Transaction failed"

- Check you have enough Sepolia ETH for gas
- Make sure you're connected to Sepolia testnet
- Try refreshing the page and reconnecting wallet

### "Not enrolled"

- Click "Join Challenge" first before submitting proofs
- Wait for the join transaction to confirm

## 🌐 Technical Details

- **Contract**: `0x5f6859AE104f5E9be247a3Ce43E8A5D76E649C09`
- **Network**: Ethereum Sepolia Testnet
- **Chain ID**: 11155111
- **OCR Engine**: Tesseract.js (client-side)
- **Web3 Library**: Web3.js v4

## 🎮 Try It Out!

This is a demo application running on testnet. Feel free to:

- Submit multiple proofs
- Experiment with different screenshots
- Check your accumulated rewards
- View transactions on [Sepolia Etherscan](https://sepolia.etherscan.io/)

---

Built with ❤️ using Next.js, React, and Ethereum
