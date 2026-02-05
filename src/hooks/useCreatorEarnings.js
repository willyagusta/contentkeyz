import { useState, useEffect, useCallback } from 'react';
import { usePublicClient, useWalletClient, useAccount } from 'wagmi';
import { formatEther, parseEther } from 'ethers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const CONTRACT_ABI = [
  {
    inputs: [{ internalType: 'address', name: '_creator', type: 'address' }],
    name: 'getCreatorEarnings',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawEarnings',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export function useCreatorEarnings() {
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchEarnings = useCallback(async () => {
    if (!publicClient || !CONTRACT_ADDRESS || !address) {
      setLoading(false);
      return;
    }

    try {
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getCreatorEarnings',
        args: [address],
      });

      setEarnings(BigInt(result));
    } catch (error) {
      console.error('Error fetching creator earnings:', error);
      setEarnings(BigInt(0));
    } finally {
      setLoading(false);
    }
  }, [publicClient, address]);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const withdraw = useCallback(async () => {
    if (!walletClient || !CONTRACT_ADDRESS || !address) {
      throw new Error('Wallet not connected');
    }

    if (earnings === null || earnings === 0n) {
      throw new Error('No earnings to withdraw');
    }

    setWithdrawing(true);
    try {
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'withdrawEarnings',
      });

      // Wait for transaction to be mined
      await publicClient.waitForTransactionReceipt({ hash });
      
      // Refresh earnings after withdrawal
      await fetchEarnings();
      
      return hash;
    } catch (error) {
      console.error('Withdrawal failed:', error);
      throw error;
    } finally {
      setWithdrawing(false);
    }
  }, [walletClient, publicClient, address, earnings, fetchEarnings]);

  return {
    earnings: earnings ? parseFloat(formatEther(earnings)) : 0,
    earningsWei: earnings,
    loading,
    withdrawing,
    withdraw,
    refetch: fetchEarnings,
  };
}

