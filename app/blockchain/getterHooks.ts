import { RARE24_CONTRACT_ADDRESS, RARE24_CONTRACT_ABI } from "./core";
import { readContract } from "@wagmi/core";
import { config } from "@/utils/wagmi";
import { Config } from "wagmi";

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

function formatDuration(seconds: number) {
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours} hr ${minutes} min`
}
