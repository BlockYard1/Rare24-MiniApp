"use server"

import { RARE24_CONTRACT_ADDRESS, RARE24_CONTRACT_ABI, MARKETPLACE_CONTRACT_ADDRESS, MARKETPLACE_CONTRACT_ABI } from "./core";
import { readContract } from "@wagmi/core";
import { config } from "@/utils/wagmi";
import { Config } from "wagmi";
import { formatEther } from "viem";
import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC)
});

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
    // Fetch earnings and token IDs in parallel
    const [accumEarnings, tokenIdArray] = await Promise.all([
        readContract(config as Config, {
            abi: RARE24_CONTRACT_ABI,
            address: RARE24_CONTRACT_ADDRESS as `0x${string}`,
            functionName: 'getCreatorAccruedFunds',
            args: [creator_address]
        }) as Promise<bigint>,
        readContract(config as Config, {
            abi: RARE24_CONTRACT_ABI,
            address: RARE24_CONTRACT_ADDRESS as `0x${string}`,
            functionName: 'getCreatorTokenIds',
            args: [creator_username]
        }) as Promise<bigint[]>
    ]);

    const earning = formatEther(accumEarnings);

    // Early return if no tokens
    if (tokenIdArray.length === 0) {
        return {
            Nfts: [],
            mints: 0,
            earning: earning
        };
    }

    // Fetch all NFT details in parallel
    const nftPromises = tokenIdArray.map(tokenId =>
        readContract(config as Config, {
            abi: RARE24_CONTRACT_ABI,
            address: RARE24_CONTRACT_ADDRESS as `0x${string}`,
            functionName: 'getPhotoDetails',
            args: [BigInt(tokenId)]
        }).then((nft: any) => ({
            tokenId: Number(tokenId),
            metadataURI: nft.metadataURI as string,
            price: formatEther(nft.price),
            createdAt: formatDate(Number(nft.createdAt)),
            totalMinted: String(nft.totalMinted),
            maxSupply: String(nft.maxSupply),
        }))
    );

    const nftDetails = await Promise.all(nftPromises);

    // Calculate total mints
    const totalMints = nftDetails.reduce((sum, nft) => sum + Number(nft.totalMinted), 0);

    // Fetch all images in parallel
    const formattedPhotos = await Promise.all(
        nftDetails.map(async (nft) => ({
            tokenId: nft.tokenId,
            totalMint_balance: nft.totalMinted,
            imageUrl: await fetchImageFromMetadata(nft.metadataURI)
        }))
    );

    return {
        Nfts: formattedPhotos.reverse(),
        mints: totalMints,
        earning: earning
    };
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

// Function to fetch image URL and Description from metadata URI
export async function fetchMetadata(metadataURI: string): Promise<{image: string; desc: string}> {
  try {
    const response = await fetch(metadataURI, {
        next: { revalidate: 600 } // Cache for 10 min
    });
    const metadata = await response.json();

    const data = {
        image: metadata.image,
        desc: metadata.description
    }
    
    return data || {image: "", desc: ""};
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return {image: "", desc: ""}; // return empty string or a fallback image URL
  }
}

export async function getMomentById(tokenId: number) {
    const moment = await readContract(config as Config, {
        abi: RARE24_CONTRACT_ABI,
        address: RARE24_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'getPhotoDetails',
        args: [tokenId]
    }) as any;

    const data = await fetchMetadata(moment.metadataURI);

    return {
        creator: moment.creator as string,
        imageUrl: data.image,
        desc: data.desc,
        created: formatDate(Number(moment.createdAt as string)),
        expires: moment.expiresAt as number,
        totalMints: moment.totalMinted as number,
        maxSupply: moment.maxSupply as number,
        price: formatEther(moment.price)
    };
}

export async function getMomentSaleData(tokenId: number) {
    const currentTimestamp = Math.floor(Date.now() / 1000);

    // Fetch all base data in parallel
    const [lastSale, tokenListings, tokenOffers] = await Promise.all([
        readContract(config as Config, {
            abi: MARKETPLACE_CONTRACT_ABI,
            address: MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
            functionName: 'getLastSale',
            args: [tokenId]
        }) as Promise<bigint>,
        readContract(config as Config, {
            abi: MARKETPLACE_CONTRACT_ABI,
            address: MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
            functionName: 'getTokenListings',
            args: [tokenId]
        }) as Promise<bigint[]>,
        readContract(config as Config, {
            abi: MARKETPLACE_CONTRACT_ABI,
            address: MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
            functionName: 'getTokenOffers',
            args: [tokenId]
        }) as Promise<bigint[]>
    ]);

    // Process listings in parallel
    const listings = tokenListings.reverse();
    const listingPromises = listings.slice(0, 11).map(index =>
        readContract(config as Config, {
            abi: MARKETPLACE_CONTRACT_ABI,
            address: MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
            functionName: 'getSaleListing',
            args: [index]
        })
    );

    const listingResults = await Promise.all(listingPromises);
    
    const topListings = listingResults
        .filter((listing: any) => 
            Number(listing.status) === 0 && 
            currentTimestamp <= Number(listing.expiresAt)
        )
        .map((listing: any) => ({
            id: listing.listingId as number,
            account: listing.sellerName as string,
            amount: listing.amount as number,
            price: formatEther(listing.pricePerToken),
            expires: getTimeRemaining(Number(listing.expiresAt))
        }));

    // Process offers in parallel
    const offers = tokenOffers.reverse();
    const offerPromises = offers.slice(0, 11).map(index =>
        readContract(config as Config, {
            abi: MARKETPLACE_CONTRACT_ABI,
            address: MARKETPLACE_CONTRACT_ADDRESS as `0x${string}`,
            functionName: 'getBuyOffer',
            args: [index]
        })
    );

    const offerResults = await Promise.all(offerPromises);
    
    const topOffers = offerResults
        .filter((offer: any) => 
            Number(offer.status) === 0 && 
            currentTimestamp <= Number(offer.expiresAt)
        )
        .map((offer: any) => ({
            id: offer.offerId as number,
            account: offer.buyerName as string,
            amount: offer.amount as number,
            price: formatEther(offer.offerPerToken),
            expires: getTimeRemaining(Number(offer.expiresAt))
        }));

    // Calculate derived values
    const least5 = [...topListings].sort((a, b) => Number(a.price) - Number(b.price)).slice(0, 5);
    const floor = topListings.length > 0 
        ? Math.min(...topListings.map(listing => Number(listing.price)))
        : 0;
    const buyNow = least5.length > 0 ? least5[0] : {
        id: 0,
        account: "_",
        amount: 0,
        price: "0",
        expires: "0"
    };

    const top5 = [...topOffers].sort((a, b) => Number(b.price) - Number(a.price)).slice(0, 5);
    const highestOffer = topOffers.length > 0 
        ? Math.max(...topOffers.map(listing => Number(listing.price)))
        : 0;

    return {
        lastSale: formatEther(lastSale),
        collectionFloor: floor,
        highestOffer: highestOffer,
        buyNow: buyNow,
        orders: top5,
        listings: least5
    };
}

export async function getUserBalance(tokenId: number, address: `0x${string}`) {
    const balance = await readContract(config as Config, {
        abi: RARE24_CONTRACT_ABI,
        address: RARE24_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'balanceOf',
        args: [address, tokenId]
    }) as number;

    return balance;
}

export async function getCombined(tokenId: number) {
    // Execute all main functions in parallel
    const [data1, data2] = await Promise.all([
        getMomentById(tokenId),
        getMomentSaleData(tokenId)
    ]);

    return {
        moment: data1,
        sale: data2
    };
}

function getTimeRemaining(futureTimestamp: number) {
  // Get current time in seconds
  const now = Math.floor(Date.now() / 1000);
  
  // Calculate difference in seconds
  const diff = futureTimestamp - now;
  
  // If time has passed, return 0
  if (diff <= 0) {
    return "0s";
  }
  
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  const seconds = diff % 60;
  
  // Return the largest non-zero unit
  if (days > 0) {
    return `${days}d`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
}