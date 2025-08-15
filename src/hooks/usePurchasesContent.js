import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'ethers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const ABI = [
  'function purchaseAccess(uint256) payable returns (uint256)',
];

export function usePurchaseContent() {
  const { address, isConnected } = useAccount();
  const [purchasing, setPurchasing] = useState(false);
  
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const purchaseContent = async (contentId, price) => {
    if (!isConnected) {
      throw new Error('Wallet not connected');
    }

    setPurchasing(true);
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: ABI,
        functionName: 'purchaseAccess',
        args: [contentId],
        value: parseEther(price.toString()),
      });
    } catch (error) {
      setPurchasing(false);
      throw error;
    }
  };

  return {
    purchaseContent,
    purchasing: purchasing || isConfirming,
    isSuccess,
  };
}