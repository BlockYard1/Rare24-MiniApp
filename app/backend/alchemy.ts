"use server"

import { RARE24_CONTRACT_ADDRESS } from "../blockchain/core";
import { NFTDetails, AlchemyNFTResponse } from "../types/index.t";

const network = 'base-sepolia';

export async function getUsersTokenIds(userAddress: `0x${string}`): Promise<NFTDetails[]> {
    // API endpoint
    const url = `https://${network}.g.alchemy.com/nft/v3/${process.env.ALCHEMY_API_KEY}/getNFTsForOwner?owner=${userAddress}&contractAddresses[]=${RARE24_CONTRACT_ADDRESS}&withMetadata=true&pageSize=100`
    const options: RequestInit = { method: 'GET' }

    try {
        const response = await fetch(url, {
            ...options,
            next: { revalidate: 600 } // Cache for 10 min
        });
        const data: AlchemyNFTResponse = await response.json();

        if (!data) throw new Error("Failed To Fetch NFTs")

        const formattedData: NFTDetails[] = data.ownedNfts.map((nft) => ({
            tokenId: Number(nft.tokenId),
            totalMint_balance: nft.balance,
            imageUrl: nft.image.originalUrl
        }))

        return formattedData
    } catch (error) {
        console.error(error);
        return []
    }
}