'use client';

import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider, createConfig, http } from 'wagmi';
import {
  mainnet,
  polygon,
  base,
  baseSepolia
} from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { connectors } = getDefaultWallets({
    appName: 'ContentKeyz',
    projectId: 'placeholder for project id',
    chains: [baseSepolia, base, mainnet, polygon],
});

// Alchemy RPC URLs - use environment variables
const getAlchemyUrl = (chainName) => {
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (!apiKey) {
    console.warn(`Alchemy API key not found for ${chainName}, using public RPC`);
    return undefined; // Will fall back to default public RPC
  }

  const urls = {
    mainnet: `https://eth-mainnet.g.alchemy.com/v2/${apiKey}`,
    polygon: `https://polygon-mainnet.g.alchemy.com/v2/${apiKey}`,
    base: `https://base-mainnet.g.alchemy.com/v2/${apiKey}`,
    baseSepolia: `https://base-sepolia.g.alchemy.com/v2/${apiKey}`,
  };

  return urls[chainName];
};

// Create transport for each chain, using Alchemy if available, otherwise public RPC
const createTransport = (chainId, chainName) => {
  const alchemyUrl = getAlchemyUrl(chainName);
  return alchemyUrl ? http(alchemyUrl) : http();
};

const wagmiConfig = createConfig({
    chains: [baseSepolia, base, mainnet, polygon],
    connectors,
    transports: {
        [mainnet.id]: createTransport(mainnet.id, 'mainnet'),
        [polygon.id]: createTransport(polygon.id, 'polygon'),
        [base.id]: createTransport(base.id, 'base'),
        [baseSepolia.id]: createTransport(baseSepolia.id, 'baseSepolia'),
    },
});

const queryClient = new QueryClient();

export function WalletProvider({ children }) {
    return (
        <WagmiProvider config={wagmiConfig}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    {children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}