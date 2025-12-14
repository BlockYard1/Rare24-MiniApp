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
    fid: user.fid as number,
    username: user.username as string,
    displayName: user.display_name as string,
    pfpUrl: user.pfp_url as string,
    followerCount: user.follower_count as number,
    followingCount: user.following_count as number,
    bio: user.profile.bio.text as string
  };
}

export async function getAllFollowings(fid: number) {
  const allFollowing: any[] = [];
  let cursor: string | null = null;

  do {
    const url = cursor 
      ? `https://api.neynar.com/v2/farcaster/following/?limit=100&fid=${fid}&cursor=${cursor}`
      : `https://api.neynar.com/v2/farcaster/following/?limit=100&fid=${fid}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NEYNAR_API_KEY!
      }
    });

    const data: any = await response.json();
    allFollowing.push(...data.users);
    cursor = data.next.cursor;

  } while (cursor);

  return allFollowing.map(account => account.user.username as string)
}