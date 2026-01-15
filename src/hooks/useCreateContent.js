import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'ethers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const ABI = [
  {
    inputs: [
      { internalType: 'string', name: '_title', type: 'string' },
      { internalType: 'string', name: '_description', type: 'string' },
      { internalType: 'uint8', name: '_contentType', type: 'uint8' },
      { internalType: 'string', name: '_ipfsHash', type: 'string' },
      { internalType: 'string', name: '_embedUrl', type: 'string' },
      { internalType: 'uint256', name: '_price', type: 'uint256' },
      { internalType: 'string', name: '_previewHash', type: 'string' },
    ],
    name: 'createContent',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];

export function useCreateContent() {
  const { address, isConnected } = useAccount();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);
  
  const { writeContract, data: hash, error: writeError, isPending: isWriting } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, isError: isReceiptError } = useWaitForTransactionReceipt({ 
    hash,
    query: {
      enabled: !!hash, // Only wait if hash exists
    }
  });

  // Reset error and creating state when transaction succeeds
  useEffect(() => {
    if (isSuccess) {
      console.log('[useCreateContent] Transaction confirmed successfully');
      setError(null);
      setCreating(false);
    }
  }, [isSuccess]);

  // Handle receipt errors
  useEffect(() => {
    if (isReceiptError) {
      console.error('[useCreateContent] Transaction receipt error');
      setError('Transaction failed on blockchain');
      setCreating(false);
    }
  }, [isReceiptError]);

  // Handle write errors
  useEffect(() => {
    if (writeError) {
      console.error('[useCreateContent] Write error:', writeError);
      setError(writeError.message || 'Transaction submission failed');
      setCreating(false);
    }
  }, [writeError]);

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
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/fa0aa172-589b-43eb-9357-f1ac6eb7f6b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useCreateContent.js:76',message:'ABI format check before writeContract',data:{abiType:typeof ABI,abiIsArray:Array.isArray(ABI),abiLength:ABI?.length,firstItemType:typeof ABI?.[0],firstItemValue:ABI?.[0],hasNameProperty:ABI?.[0] && 'name' in ABI[0],contractAddress:CONTRACT_ADDRESS},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.log('[useCreateContent] Submitting transaction...', { ABI, ABI_type: typeof ABI, ABI_isArray: Array.isArray(ABI) });
      const result = await writeContract({
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
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/fa0aa172-589b-43eb-9357-f1ac6eb7f6b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useCreateContent.js:91',message:'writeContract succeeded',data:{result:result},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.log('[useCreateContent] Transaction submitted, hash:', result);
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/fa0aa172-589b-43eb-9357-f1ac6eb7f6b5',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useCreateContent.js:93',message:'writeContract error caught',data:{errorName:error?.name,errorMessage:error?.message,errorShortMessage:error?.shortMessage,errorStack:error?.stack,errorString:String(error),abiType:typeof ABI,abiIsArray:Array.isArray(ABI),firstItemType:typeof ABI?.[0]},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      console.error('[useCreateContent] Transaction submission error:', error);
      setCreating(false);
      const errorMessage = error?.shortMessage || error?.message || 'Transaction failed';
      setError(errorMessage);
      throw error;
    }
  };

  return {
    createContent,
    creating: creating || isWriting || isConfirming,
    isSuccess,
    txHash: hash,
    error: error || writeError?.message || null,
  };
}
