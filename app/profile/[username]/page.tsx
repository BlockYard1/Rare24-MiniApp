"use client"

import { useState, useEffect } from "react";
import { LoaderCircle, Grid2x2X } from "lucide-react";
import { useFarcasterStore } from "@/app/store/useFarcasterStore";
import { CreatorNftData, NFTDetails } from "@/app/types/index.t";
import { getCreatorMoments } from "@/app/blockchain/getterHooks";
import { useConnection } from 'wagmi'
import { getUsersTokenIds } from "@/app/backend/alchemy";

export default function Profile() {
  const user = useFarcasterStore((state) => state.user)
  const { address } = useConnection()

  const [activeTab, setActiveTab] = useState<"moments" | "holding">("moments")
  const [moments, setMoments] = useState<CreatorNftData | null>(null)
  const [userNfts, setUserNfts] = useState<NFTDetails[]>([])
  const [displayItems, setDisplayItems] = useState<NFTDetails[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch user's NFT moments
  useEffect(() => {
    const fetchData = async() => {
      setLoading(true)
      if(user){
        const data = await getCreatorMoments(user?.username, address as `0x${string}`)
        setMoments(data)
        const data_ = await getUsersTokenIds(address as `0x${string}`)
        setUserNfts(data_)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // Update displayItems
  useEffect(() => {
    if(activeTab === "moments")
      setDisplayItems(moments?.Nfts ?? [])
    else 
      setDisplayItems(userNfts)
  }, [activeTab, moments, userNfts])


  return (
    <main className="mt-20 mb-16">
      <div className="w-full max-w-md">
        {/* User Profile Card */}
        <div className="bg-card p-4">
          {/* Header Section */}
          <div className="flex items-center justify-between gap-4 p-4">
            <div className="w-24 h-24 rounded-full border-2 border-teal-50 flex-shrink-0">
              <img 
                src={user?.pfpUrl} 
                alt={user?.displayName} 
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div className="">
                <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{moments?.Nfts.length ?? 0}</p>
                <p className="text-lg text-gray-700 dark:text-gray-400">Moments</p>
              </div>
              <div className="">
                <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">{moments?.mints ?? 0}</p>
                <p className="text-lg text-gray-700 dark:text-gray-400">Mints</p>
              </div>
              <div className="">
                <p className="text-xl font-semibold text-gray-800 dark:text-gray-200">◊ {moments?.earning ?? 0}</p>
                <p className="text-lg text-gray-700 dark:text-gray-400">Earning</p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="">
            <h2 className="font-semibold text-lg text-foreground">{user?.username}</h2>
            <p className="text-md text-muted-foreground">{user?.bio}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-dashed border-border border-gray-600 mt-3" />

        {/* Moments and Holding Card */}
        <div className="bg-card p-4">
          {/* Tabs */}
          <div className="flex items-center justify-center gap-8 mb-6 border-b border-teal-500/20">
            <button
              onClick={() => setActiveTab("moments")}
              className={`pb-3 text-lg font-medium transition-colors ${
                activeTab === "moments"
                  ? "text-teal-700 border-b-2 border-teal-600 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Moments
            </button>
            <button
              onClick={() => setActiveTab("holding")}
              className={`pb-3 text-lg font-medium transition-colors ${
                activeTab === "holding"
                  ? "text-teal-700 border-b-2 border-teal-600 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Holding
            </button>
          </div>

          {/* Grid of Items */}
          <div className="">
            {
              (displayItems.length ?? 0)> 0 ? (
                <div className="grid grid-cols-3 gap-1">
                  {
                    displayItems.map((item) => (
                      <div
                        key={item.tokenId}
                        className="aspect-square rounded-md border-2 border-foreground/20 hover:border-foreground/40 transition-colors bg-card cursor-pointer relative overflow-hidden"
                      >
                        <img 
                          src={item.imageUrl} 
                          alt={item.imageUrl} 
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Fade away shadow at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                        
                        {/* Number at bottom left */}
                        <div className="absolute bottom-2 left-2 text-white font-semibold text-lg z-10">
                          {item.totalMint_balance}
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center mt-20">
                  {
                    loading ? (
                      <span className="animate-spin">
                        <LoaderCircle size={60} className="text-teal-500/80"/>
                      </span>
                    ) : (
                      <>
                        <Grid2x2X size={60} className="text-teal-500/80 mb-3"/>
                        <span className="text-lg text-teal-600/80">{activeTab == 'holding' ? "You Own Zero Moments" : "You've Shared Zero Moments"}</span>
                      </>
                    )
                  }
                </div>
              )
            }
          </div>
        </div>
      </div>
    </main>
  );
}
