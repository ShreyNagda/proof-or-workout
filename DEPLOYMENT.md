# Deploying to Vercel

## ⚠️ Security First

**CRITICAL**: Never commit or expose these environment variables publicly:

- `DEPLOYER_PRIVATE_KEY` - Your wallet's private key (for deployments only)
- `RELAYER_PRIVATE_KEY` - Backend relayer key (not used in frontend)

These should NEVER be added to Vercel's environment variables for a public frontend deployment.

## ✅ Safe Environment Variables for Vercel

Add these in your Vercel project settings (Settings → Environment Variables):

```
NEXT_PUBLIC_CONTRACT_ADDRESS=0x5f6859AE104f5E9be247a3Ce43E8A5D76E649C09
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
NEXT_PUBLIC_ALCHEMY_API_KEY=YOUR_ALCHEMY_KEY
```

**Note**: Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. This is intentional and safe.

## 📋 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign in

3. **Import your repository**

   - Click "Add New Project"
   - Select your GitHub repo
   - Vercel will auto-detect Next.js

4. **Configure Environment Variables**

   - Before deploying, add the environment variables listed above
   - Go to: Settings → Environment Variables
   - Add each variable for Production, Preview, and Development

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**

   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy**

   ```bash
   vercel
   ```

4. **Add Environment Variables**

   ```bash
   vercel env add NEXT_PUBLIC_CONTRACT_ADDRESS
   vercel env add NEXT_PUBLIC_SEPOLIA_RPC_URL
   vercel env add NEXT_PUBLIC_ALCHEMY_API_KEY
   ```

5. **Redeploy with env vars**
   ```bash
   vercel --prod
   ```

## 🎯 What Gets Deployed

### ✅ Included in deployment:

- Next.js frontend (`/app` directory)
- Contract utilities (`/utils`)
- Public assets
- Compiled Next.js application

### ❌ Not needed for deployment:

- `/contracts` - Source Solidity files (contract already deployed to Sepolia)
- `/hardhat-cache` - Build cache
- `/hardhat-artifacts` - Compiled contract ABIs (already in your code)
- `hardhat.config.cjs` - Only needed for local development
- `.env.local` - Secrets stay local

## 🔧 Build Configuration

Your `next.config.ts` should already be configured correctly. Vercel will:

1. Run `npm install`
2. Run `npm run build`
3. Deploy the optimized production build

## 🧪 Testing After Deployment

1. Visit your Vercel URL (e.g., `your-project.vercel.app`)
2. Connect your MetaMask wallet
3. Switch to Sepolia testnet
4. Join the challenge
5. Upload screenshots and submit proofs

## 🌐 Custom Domain (Optional)

In Vercel dashboard:

1. Go to Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## 🔄 Auto-Deployments

Once connected to GitHub:

- Every push to `main` → Auto-deploys to production
- Pull requests → Auto-creates preview deployments
- Branches → Preview URLs for testing

## 📊 Monitoring

Vercel provides:

- Real-time deployment logs
- Analytics dashboard
- Performance metrics
- Error tracking

## 🚨 Important Notes

1. **No Backend API**: This is a fully client-side app that connects directly to the Sepolia blockchain
2. **Users need MetaMask**: Visitors must have a Web3 wallet installed
3. **Sepolia testnet**: Users need Sepolia ETH for gas fees
4. **Same contract**: Everyone uses the same deployed contract at `0x5f6859AE104f5E9be247a3Ce43E8A5D76E649C09`

## 🎁 Share with Users

After deployment, users can:

1. Visit your Vercel URL
2. Install MetaMask if they don't have it
3. Switch to Sepolia testnet
4. Get test ETH from [Sepolia faucet](https://sepoliafaucet.com/)
5. Connect wallet and start submitting proofs!
