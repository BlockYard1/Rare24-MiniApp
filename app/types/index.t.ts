export interface UserData {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl: string;
    followerCount: number;
    followingCount: number;
    bio: string;
}

export interface CanPost {
    canPost: boolean;
    toNext: string;
}

export interface NFTDetails {
    tokenId: number;
    totalMint_balance: string;
    imageUrl: string;
}

export interface CreatorNftData {
    Nfts: NFTDetails[];
    mints: number;
    earning: string;
}

interface NFTMetadata {
    originalUrl: string;
}

interface OwnedNFT {
    tokenId: string;
    balance: string;
    image: NFTMetadata;
}

export interface AlchemyNFTResponse {
    ownedNfts: OwnedNFT[];
}