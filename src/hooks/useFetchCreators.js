import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
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
    inputs: [{ internalType: 'address', name: '_creator', type: 'address' }],
    name: 'getCreatorStats',
    outputs: [
      { internalType: 'uint256', name: 'totalEarnings', type: 'uint256' },
      { internalType: 'uint256', name: 'totalSales', type: 'uint256' },
      { internalType: 'uint256', name: 'activeContent', type: 'uint256' },
      { internalType: 'uint256', name: 'lifetimeEarnings', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

export function useFetchCreators() {
  const publicClient = usePublicClient();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllCreators = async () => {
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
          setCreators([]);
          setLoading(false);
          return;
        }

        // Fetch all content items to extract unique creators
        const contentPromises = [];
        for (let i = 1; i <= Number(totalContent); i++) {
          contentPromises.push(
            publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'getContent',
              args: [BigInt(i)],
            }).catch(() => null)
          );
        }

        const contentResults = await Promise.all(contentPromises);
        
        // Extract unique creators and aggregate their content stats
        const creatorMap = {};
        
        contentResults.forEach((result) => {
          if (!result) return;
          
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

          // Only count active content
          if (!isActive) return;

          const creatorAddress = creator.toLowerCase();
          
          if (!creatorMap[creatorAddress]) {
            creatorMap[creatorAddress] = {
              address: creator,
              contentCount: 0,
              totalSales: 0,
              totalEarnings: 0,
              latestContentDate: 0,
            };
          }

          creatorMap[creatorAddress].contentCount++;
          creatorMap[creatorAddress].totalSales += Number(totalSales);
          creatorMap[creatorAddress].totalEarnings += parseFloat(formatEther(totalEarnings));
          
          const contentDate = Number(createdAt);
          if (contentDate > creatorMap[creatorAddress].latestContentDate) {
            creatorMap[creatorAddress].latestContentDate = contentDate;
          }
        });

        // Fetch detailed stats for each creator
        const creatorAddresses = Object.keys(creatorMap);
        const creatorStatsPromises = creatorAddresses.map(async (address) => {
          try {
            const stats = await publicClient.readContract({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'getCreatorStats',
              args: [creatorMap[address].address],
            });

            return {
              ...creatorMap[address],
              lifetimeEarnings: parseFloat(formatEther(stats[3] || 0)),
              totalSales: Number(stats[1] || 0),
              activeContent: Number(stats[2] || 0),
            };
          } catch (error) {
            // If stats don't exist, use aggregated data
            return {
              ...creatorMap[address],
              lifetimeEarnings: creatorMap[address].totalEarnings,
              activeContent: creatorMap[address].contentCount,
            };
          }
        });

        const creatorsWithStats = await Promise.all(creatorStatsPromises);
        
        // Sort by latest content date (most recent first)
        creatorsWithStats.sort((a, b) => b.latestContentDate - a.latestContentDate);

        setCreators(creatorsWithStats);
      } catch (error) {
        console.error('Error fetching creators:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllCreators();
  }, [publicClient]);

  return {
    creators,
    loading,
  };
}

