# 🚀 Vercel Deployment Checklist

## Before You Deploy

- [ ] Contract deployed to Sepolia: `0x5f6859AE104f5E9be247a3Ce43E8A5D76E649C09` ✅
- [ ] Contract address in `.env.local` ✅
- [ ] `.gitignore` configured to exclude secrets ✅
- [ ] Hardhat artifacts excluded from git ✅
- [ ] README updated with deployment info ✅

## GitHub Setup

- [ ] Initialize git repository

  ```bash
  git init
  ```

- [ ] Add all files

  ```bash
  git add .
  ```

- [ ] Commit changes

  ```bash
  git commit -m "feat: proof of workout dapp with OCR verification"
  ```

- [ ] Create GitHub repository at https://github.com/new

- [ ] Add remote and push
  ```bash
  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
  git branch -M main
  git push -u origin main
  ```

## Vercel Deployment

- [ ] Go to [vercel.com/new](https://vercel.com/new)
- [ ] Import your GitHub repository
- [ ] Configure environment variables:
  - `NEXT_PUBLIC_CONTRACT_ADDRESS` = `0x5f6859AE104f5E9be247a3Ce43E8A5D76E649C09`
  - `NEXT_PUBLIC_SEPOLIA_RPC_URL` = Your Alchemy URL
  - `NEXT_PUBLIC_ALCHEMY_API_KEY` = Your Alchemy API key
- [ ] Deploy!

## After Deployment

- [ ] Test the live site
- [ ] Connect MetaMask on deployed site
- [ ] Join challenge on live site
- [ ] Submit a test proof
- [ ] Verify rewards are working
- [ ] Share the URL with others!

## Optional Enhancements

- [ ] Add custom domain
- [ ] Enable Vercel Analytics
- [ ] Set up GitHub Actions for CI/CD
- [ ] Add more comprehensive error handling
- [ ] Implement backend API route for gasless transactions

## Share Your App

Once deployed, share:

- Live URL: `https://your-project.vercel.app`
- Contract on Etherscan: `https://sepolia.etherscan.io/address/0x5f6859AE104f5E9be247a3Ce43E8A5D76E649C09`
- User Guide: Include link to `USER_GUIDE.md`

---

🎉 Your dApp is ready to share with the world!
