import React, { useEffect, useState } from 'react';
import { useAccount, useEnsName } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Auth() {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const [lensHandle, setLensHandle] = useState(null);

  
  useEffect(() => {
    const fetchLensHandle = async () => {
      if (!address) return;
      try {
        const res = await fetch(`https://api.lens.dev`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
              query {
                defaultProfile(request: { ethereumAddress: "${address}" }) {
                  handle
                }
              }
            `
          }),
        });
        const json = await res.json();
        setLensHandle(json.data?.defaultProfile?.handle || null);
      } catch (error) {
        console.error('Error fetching Lens handle:', error);
      }
    };

    fetchLensHandle();
  }, [address]);

  return (
    <div className="p-4">
      <ConnectButton />
      {isConnected && (
        <div className="mt-4 text-white">
          <p><strong>Wallet:</strong> {address}</p>
          {ensName && <p><strong>ENS:</strong> {ensName}</p>}
          {lensHandle && <p><strong>Lens:</strong> @{lensHandle}</p>}
        </div>
      )}
    </div>
  );
}