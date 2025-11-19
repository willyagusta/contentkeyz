import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'ethers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const ABI = [
  'function createContent(string,string,uint8,string,string,uint256,string) returns (uint256)',
];

export function useCreateContent() {
  const { address, isConnected } = useAccount();
  const [creating, setCreating] = useState(false);
  
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const createContent = async ({
    title,
    description,
    contentType,
    ipfsHash,
    embedUrl,
    price,
    previewHash
  }) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    setCreating(true);
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'createContent',
        args: [
          title,
          description,
          contentType,
          ipfsHash || '',
          embedUrl || '',
          parseEther(price.toString() || '0'),
          previewHash || ''
        ],
      });
    } catch (error) {
      setCreating(false);
      throw error;
    }
  };

  return {
    createContent,
    creating: creating || isConfirming,
    isSuccess,
    txHash: hash,
  };
}
