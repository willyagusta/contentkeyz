This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# WalletConnect/Reown Project ID (required for wallet connections)
# Get it from https://cloud.reown.com/
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_wallet_connect_project_id_here

# Alchemy API Key (required for blockchain RPC)
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here

# Contract Address
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here

# IPFS Configuration
# Option 1: Pinata JWT Token (Recommended - Most Secure)
# Get from: https://app.pinata.cloud/developers/api-keys
NEXT_PUBLIC_PINATA_JWT=your_pinata_jwt_token_here

# Option 2: Pinata API Key + Secret (Alternative)
# Get from: https://app.pinata.cloud/developers/api-keys
# NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
# NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key

# Option 3: Custom IPFS Node (Alternative)
# NEXT_PUBLIC_IPFS_NODE_URL=https://your-ipfs-node.com:5001

# IPFS Gateway (optional - defaults to public gateway)
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/

**Important:** You MUST configure at least one IPFS upload method (Pinata JWT, Pinata API keys, or custom IPFS node) for file uploads to work. Without it, you'll see "No IPFS upload method configured" errors.

# Hardhat/Deployment (for local development)
PRIVATE_KEY=your_private_key_here
ALCHEMY_API_KEY=your_alchemy_api_key_here
```

### Get Your WalletConnect/Reown Project ID

1. Sign up at [Reown Cloud](https://cloud.reown.com/) (formerly WalletConnect Cloud)
2. Create a new project
3. Copy your Project ID from the dashboard
4. Add it to your `.env.local` file as `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`

**Note:** This is required for wallet connections to work properly. Without it, you'll see 403 errors in the console.

### Get Your Alchemy API Key

1. Sign up at [Alchemy](https://www.alchemy.com/)
2. Create a new app for your desired network:
   - **Base Sepolia** (recommended for testing) - `base-sepolia`
   - **Base Mainnet** - `base-mainnet`
   - **Ethereum Mainnet** - `eth-mainnet`
   - **Polygon** - `polygon-mainnet`
3. Copy your API key from the dashboard
4. Add it to your `.env.local` file as `NEXT_PUBLIC_ALCHEMY_API_KEY`

**Note:** Base Sepolia is configured as the default test network. Make sure to create an Alchemy app for Base Sepolia if you're testing.

### Get Your Pinata IPFS Credentials

For file uploads to work, you need to configure Pinata (or another IPFS service):

1. Sign up at [Pinata](https://app.pinata.cloud/)
2. Go to [API Keys](https://app.pinata.cloud/developers/api-keys)
3. **Recommended:** Create a JWT token:
   - Click "New Key"
   - Select "Admin" permissions
   - Copy the JWT token
   - Add to `.env.local` as `NEXT_PUBLIC_PINATA_JWT`
4. **Alternative:** Use API Key + Secret:
   - Create a new API key
   - Copy both the API Key and Secret Key
   - Add to `.env.local` as `NEXT_PUBLIC_PINATA_API_KEY` and `NEXT_PUBLIC_PINATA_SECRET_KEY`

**Note:** All client-side environment variables MUST be prefixed with `NEXT_PUBLIC_` for Next.js to expose them to the browser.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
