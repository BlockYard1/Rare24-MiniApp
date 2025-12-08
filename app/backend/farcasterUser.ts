"use server"

export async function getFarcasterUser(fid: number) {
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEYNAR_API_KEY!
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    }
  );
  
  const data = await response.json();
  const user = data.users[0];
  
  return {
    fid: user.fid,
    username: user.username,
    displayName: user.display_name,
    pfpUrl: user.pfp_url,
    followerCount: user.follower_count,
    followingCount: user.following_count,
    bio: user.profile.bio.text
  };
}