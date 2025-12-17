import HomeClient from "./client";
import { getSharedMoments } from "./blockchain/getterHooks";

export default async function HomePage() {
  try {
    const moments = await getSharedMoments()
  
    return <HomeClient sharedMoments={moments} />
  } catch (error) {
    console.error('Error fetching Listings:', error)
    return(
      <HomeClient sharedMoments={[]} />
    )
  }
}

export async function generateMetadata() {
 
  return {
    title: "Rare24",
    description: `View Shared Monents!`
  }
}