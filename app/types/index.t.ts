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
    imageUrl: string;
    price: string;
    createdAt: string;
    totalMinted: string;
    maxSupply: string;
}

export interface CreatorNftData {
    Nfts: NFTDetails[];
    mints: number;
    earning: string;
}