"use server"

import { RARE24_CONTRACT_ADDRESS, RARE24_CONTRACT_ABI } from "./core";
import { readContract } from "@wagmi/core";
import { config } from "@/utils/wagmi";
import { Config } from "wagmi";
import { formatEther } from "viem";

/* RARE24 CONTRACT */

export async function getCreatorMomentsCount(creator_username: string) {
    // get creator's tokenId array
    const tokenIdArray = await readContract(config as Config, {
        abi: RARE24_CONTRACT_ABI,
        address: RARE24_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'getCreatorTokenIds',
        args: [creator_username]
    }) as bigint[];

    // return number of moments shared
    return tokenIdArray.length
}

export async function checkIfCanPost(creator_username: string) {
    // get creator's last post timestamp
    const nextPost = await readContract(config as Config, {
        abi: RARE24_CONTRACT_ABI,
        address: RARE24_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'getCreatorNextPost',
        args: [creator_username]
    }) as bigint;

    // compare to current timestamp
    const currentTimestamp = BigInt(Math.floor(Date.now() / 1000));
    const diff = nextPost - currentTimestamp;
    let toNext = ''
    if(diff > 0) {
        toNext = formatDuration(Number(diff))
    }
    const canPost = currentTimestamp > nextPost;

    return {canPost, toNext};
}

// Timestamp to "10 min or 8hr 23min"
function formatDuration(seconds: number) {
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours} hr ${minutes} min`
}

export async function getCreatorMoments(creator_username: string, creator_address: `0x${string}`) {
    // get total earnings
    const accumEarnings = await readContract(config as Config, {
        abi: RARE24_CONTRACT_ABI,
        address: RARE24_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'getCreatorAccruedFunds',
        args: [creator_address]
    }) as bigint;

    const earning = formatEther(accumEarnings)

    // get token Ids
    const tokenIdArray = await readContract(config as Config, {
        abi: RARE24_CONTRACT_ABI,
        address: RARE24_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'getCreatorTokenIds',
        args: [creator_username]
    }) as bigint[];

    const nftDetails = []

    if(tokenIdArray.length > 0) {
        for(let i = 0; i < tokenIdArray.length; i++) {
            const nft = await readContract(config as Config, {
                abi: RARE24_CONTRACT_ABI,
                address: RARE24_CONTRACT_ADDRESS as `0x${string}`,
                functionName: 'getPhotoDetails',
                args: [BigInt(tokenIdArray[i])]
            }) as any;

            if(nft) {
                nftDetails.push({
                    metadataURI: nft.metadataURI as string,
                    price: formatEther(nft.price),
                    createdAt: formatDate(Number(nft.createdAt)),
                    totalMinted: String(nft.totalMinted),
                    maxSupply: String(nft.maxSupply),
                })
            }
        }
    }

    const totalMints = nftDetails.reduce((sum, nft) => sum + Number(nft.totalMinted), 0)

    const formattedPhotos = await Promise.all(
        nftDetails.map(async (nft) => ({
            imageUrl: await fetchImageFromMetadata(nft.metadataURI), // fetch actual image
            price: nft.price,
            createdAt: nft.createdAt,
            totalMinted: nft.totalMinted,
            maxSupply: nft.maxSupply
        }))
    );

    return {
        Nfts: formattedPhotos,
        mints: totalMints,
        earning: earning
    }
}

// Timestamp to "10 June, 2023"
function formatDate(timestamp: number) {
  const date = new Date(timestamp * 1000); // multiply by 1000 if timestamp is in seconds
  
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'long' });
  const year = date.getFullYear();
  
  return `${day} ${month}, ${year}`;
}

// Function to fetch image URL from metadata URI
export async function fetchImageFromMetadata(metadataURI: string): Promise<string> {
  try {
    const response = await fetch(metadataURI, {
        next: { revalidate: 600 } // Cache for 10 min
    });
    const metadata = await response.json();
    return metadata.image || '';
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return ''; // return empty string or a fallback image URL
  }
}
