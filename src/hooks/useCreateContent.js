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
  const [error, setError] = useState(null);
  
  const { writeContract, data: hash, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isReceiptError } = useWaitForTransactionReceipt({ hash });

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
      const err = new Error('Wallet not connected');
      setError(err.message);
      throw err;
    }

    if (!CONTRACT_ADDRESS) {
      const err = new Error('Contract address not configured. Please set NEXT_PUBLIC_CONTRACT_ADDRESS');
      setError(err.message);
      throw err;
    }

    setError(null);
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
      const errorMessage = error?.shortMessage || error?.message || 'Transaction failed';
      setError(errorMessage);
      throw error;
    }
  };

  // Reset error when transaction succeeds
  if (isSuccess) {
    setError(null);
    setCreating(false);
  }

  // Handle receipt errors
  if (isReceiptError) {
    setError('Transaction failed on blockchain');
    setCreating(false);
  }

  return {
    createContent,
    creating: creating || isConfirming,
    isSuccess,
    txHash: hash,
    error: error || writeError?.message || null,
  };
}
