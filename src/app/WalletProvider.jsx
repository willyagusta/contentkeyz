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

const wagmiConfig = createConfig({
    chains: [baseSepolia, base, mainnet, polygon],
    connectors,
    transports: {
        [mainnet.id]: http(),
        [polygon.id]: http(),
        [base.id]: http(),
        [baseSepolia.id]: http(),
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