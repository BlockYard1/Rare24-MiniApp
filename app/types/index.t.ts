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