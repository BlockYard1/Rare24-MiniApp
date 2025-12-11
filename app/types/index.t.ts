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

export interface MomentDetails {
    creator: string;
    imageUrl: string;
    desc: string;
    created: string;
    expires: number;
    totalMints: number;
    maxSupply: number;
    price: string;
}

export interface OfferListing {
    id: number;
    account: string;
    amount: number;
    price: string;
    expires: string;
}

export interface MomentsSaleData {
    lastSale: string;
    collectionFloor: number;
    highestOffer: number;
    buyNow: OfferListing;
    orders: OfferListing[];
    listings: OfferListing[];
}

export interface ActivityVolumeData {
    activity: {
        type: string;
        seller: string;
        buyer: string;
        price: string;
        timeStamp: number;
    }[];
    volume: number;
}