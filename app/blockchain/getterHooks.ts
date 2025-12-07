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

    // return number of moments shared
    return tokenIdArray.length
}
