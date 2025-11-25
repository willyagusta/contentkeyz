import { useState, useEffect } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { formatEther } from 'ethers';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const CONTRACT_ABI = [
  {
    inputs: [],
    name: 'getTotalContent',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_contentId', type: 'uint256' }],
    name: 'getContent',
    outputs: [
      { internalType: 'uint256', name: 'id', type: 'uint256' },
      { internalType: 'string', name: 'title', type: 'string' },
      { internalType: 'string', name: 'description', type: 'string' },
      { internalType: 'uint8', name: 'contentType', type: 'uint8' },
      { internalType: 'string', name: 'ipfsHash', type: 'string' },
      { internalType: 'string', name: 'embedUrl', type: 'string' },
      { internalType: 'uint256', name: 'price', type: 'uint256' },
      { internalType: 'address', name: 'creator', type: 'address' },
      { internalType: 'bool', name: 'isActive', type: 'bool' },
      { internalType: 'uint256', name: 'createdAt', type: 'uint256' },
      { internalType: 'string', name: 'previewHash', type: 'string' },
      { internalType: 'uint256', name: 'totalEarnings', type: 'uint256' },
      { internalType: 'uint256', name: 'totalSales', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: '_user', type: 'address' },
      { internalType: 'uint256', name: '_contentId', type: 'uint256' },
    ],
    name: 'checkAccess',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export function useFetchContent() {
  const publicClient = usePublicClient();
  const { address } = useAccount();
  const [contents, setContents] = useState([]);
  const [userAccess, setUserAccess] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllContent = async () => {
      if (!publicClient || !CONTRACT_ADDRESS) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // Get total content count
        const totalContent = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: 'getTotalContent',
        });

        if (totalContent === 0n) {
          setContents([]);
          setLoading(false);
          return;
        }

        // Fetch all content items
        const contentPromises = [];
        for (let i = 1; i <= Number(totalContent); i++) {
          contentPromises.push(
            publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'getContent',
              args: [BigInt(i)],
            }).catch(() => null) // Skip failed reads
          );
        }

        const contentResults = await Promise.all(contentPromises);
        
        // Format content items
        const formattedContents = contentResults
          .map((result, index) => {
            if (!result) return null;
            
            const [
              id,
              title,
              description,
              contentType,
              ipfsHash,
              embedUrl,
              price,
              creator,
              isActive,
              createdAt,
              previewHash,
              totalEarnings,
              totalSales,
            ] = result;

            // Only return active content
            if (!isActive) return null;

            return {
              id: Number(id),
              title,
              description,
              contentType: Number(contentType),
              ipfsHash,
              embedUrl,
              price: parseFloat(formatEther(price)),
              creator,
              isActive,
              createdAt: new Date(Number(createdAt) * 1000).toISOString(),
              previewHash,
              totalEarnings: parseFloat(formatEther(totalEarnings)),
              totalSales: Number(totalSales),
            };
          })
          .filter(Boolean);

        setContents(formattedContents);

        // Check user access for all content
        if (address) {
          const accessPromises = formattedContents.map((content) =>
            publicClient
              .readContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'checkAccess',
                args: [address, BigInt(content.id)],
              })
              .then((hasAccess) => ({ id: content.id, hasAccess }))
              .catch(() => ({ id: content.id, hasAccess: false }))
          );

          const accessResults = await Promise.all(accessPromises);
          const accessMap = {};
          accessResults.forEach(({ id, hasAccess }) => {
            accessMap[id] = hasAccess;
          });

          setUserAccess(accessMap);
        }
      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllContent();
  }, [publicClient, address]);

  return {
    contents,
    userAccess,
    loading,
  };
}
