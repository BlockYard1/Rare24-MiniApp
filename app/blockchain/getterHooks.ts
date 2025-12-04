import { RARE24_CONTRACT_ADDRESS, RARE24_CONTRACT_ABI } from "./core";
import { readContract } from "@wagmi/core";
import { config } from "@/utils/wagmi";
import { Config } from "wagmi";

/* RARE24 CONTRACT */

export async function getCreatorMomentsCount(creatorAddress: `0x${string}`) {
    // get creator's tokenId array
    const tokenIdArray = await readContract(config as Config, {
        abi: RARE24_CONTRACT_ABI,
        address: RARE24_CONTRACT_ADDRESS as `0x${string}`,
        functionName: 'getCreatorTokenIds',
        args: [creatorAddress]
    }) as bigint[];

    console.log('array:', tokenIdArray); // ✅ This will show [1n]
    console.log('length:', tokenIdArray.length); // ✅ This will show 1
    console.log('is array?', Array.isArray(tokenIdArray)); // ✅ Should be true

    // return number of moments shared
    return tokenIdArray.length
}
