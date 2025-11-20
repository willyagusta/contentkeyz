import { useState, useEffect } from 'react';
import { useReadContract, useReadContracts } from 'wagmi';
import { formatEther } from 'ethers';
import { useAccount } from 'wagmi';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

const CONTRACT_ABI = [
  'function getTotalContent() view returns (uint256)',
  'function getContent(uint256) view returns (uint256 id, string title, string description, uint8 contentType, string ipfsHash, string embedUrl, uint256 price, address creator, bool isActive, uint256 createdAt, string previewHash, uint256 totalEarnings, uint256 totalSales)',
  'function checkAccess(address, uint256) view returns (bool)',
  'function getUserContent(address) view returns (uint256[])',
];

export function useContent() {
  const { address } = useAccount();
  const [contents, setContents] = useState([]);
  const [userAccess, setUserAccess] = useState({});
  const [loading, setLoading] = useState(true);

  // Get total content count
  const { data: totalContent } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getTotalContent',
  });

  // Get user's content IDs if address exists
  const { data: userContentIds } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'getUserContent',
    args: [address],
    enabled: !!address,
  });

  // Fetch all content items
  useEffect(() => {
    const fetchContent = async () => {
      if (!totalContent || totalContent === 0n) {
        setContents([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      try {
        // Create contracts array for batch reading
        const contracts = [];
        const accessChecks = [];
        
        for (let i = 1; i <= Number(totalContent); i++) {
          contracts.push({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: 'getContent',
            args: [BigInt(i)],
          });
          
          if (address) {
            accessChecks.push({
              address: CONTRACT_ADDRESS,
              abi: CONTRACT_ABI,
              functionName: 'checkAccess',
              args: [address, BigInt(i)],
            });
          }
        }

        // For now, we'll fetch sequentially to avoid rate limits
        // You could optimize this with multicall if available
        const contentPromises = contracts.map(async (contract) => {
          try {
            // We'll need to use a different approach since useReadContracts 
            // doesn't work well dynamically. Let's fetch sequentially.
            return null; // Placeholder
          } catch (error) {
            console.error('Error fetching content:', error);
            return null;
          }
        });

        // For now, let's use a simpler sequential approach
        const fetchedContents = [];
        const accessMap = {};

        // Fetch each content item
        for (let i = 1; i <= Number(totalContent); i++) {
          try {
            // This would need to be done with actual contract calls
            // We'll create a helper function or use wagmi's useReadContract in a different way
            fetchedContents.push(null);
          } catch (error) {
            console.error(`Error fetching content ${i}:`, error);
          }
        }

        // Set contents
        setContents(fetchedContents.filter(Boolean));
        
        // Set user access
        if (address) {
          for (let i = 1; i <= Number(totalContent); i++) {
            try {
              // Fetch access for each content
              accessMap[i] = false;
            } catch (error) {
              console.error(`Error checking access for content ${i}:`, error);
            }
          }
          setUserAccess(accessMap);
        }

      } catch (error) {
        console.error('Error fetching content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [totalContent, address]);

  return {
    contents,
    userAccess,
    loading,
    totalContent: totalContent ? Number(totalContent) : 0,
    userContentIds: userContentIds ? userContentIds.map(id => Number(id)) : [],
  };
}
