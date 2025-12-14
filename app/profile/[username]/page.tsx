"use client"

import Image from "next/image";
import { useState, useEffect } from "react";
import { LoaderCircle, Grid2x2X } from "lucide-react";
import { useFarcasterStore } from "@/app/store/useFarcasterStore";
import { CreatorNftData, NFTDetails, UserOfferlistings } from "@/app/types/index.t";
import { getCreatorMoments, getUserOffersListings } from "@/app/blockchain/getterHooks";
import { useConnection, Config } from 'wagmi'
import { getUsersTokenIds } from "@/app/backend/alchemy";
import { useRouter } from "next/navigation";
import { simulateContract, writeContract, waitForTransactionReceipt } from "@wagmi/core"
import { MARKETPLACE_CONTRACT_ABI, MARKETPLACE_CONTRACT_ADDRESS } from "@/app/blockchain/core";
import { config } from "@/utils/wagmi";

export default function Profile() {
  const user = useFarcasterStore((state) => state.user)
  const { address } = useConnection()
  const route = useRouter()

  const [activeTab, setActiveTab] = useState<"moments" | "holding" | "activity">("moments")
  const [moments, setMoments] = useState<CreatorNftData | null>(null)
  const [userNfts, setUserNfts] = useState<NFTDetails[]>([])
  const [displayItems, setDisplayItems] = useState<NFTDetails[]>([])
  const [activity, setActivity] = useState<UserOfferlistings[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [process, setProcess] = useState(false)

  // Fetch user's NFT moments
  useEffect(() => {
    const fetchData = async() => {
      setLoading(true)
      if(user){
        const data = await getCreatorMoments(user?.username, address as `0x${string}`)
        setMoments(data)
        const data_ = await getUsersTokenIds(address as `0x${string}`)
        setUserNfts(data_)
        const _data = await getUserOffersListings(user.username)
        setActivity(_data)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // Update displayItems
  useEffect(() => {
    if(activeTab === "moments")
      setDisplayItems(moments?.Nfts ?? [])
    else if(activeTab === "holding")
      setDisplayItems(userNfts)
    else {
      setDisplayItems([])
    }

  }, [activeTab, moments, userNfts])

  const handleCancel = async(type: string, id: number) => {
    try{
      setProcess(true)

      const { request } = await simulateContract(config as Config, {
        abi: MARKETPLACE_CONTRACT_ABI,
        address: MARKETPLACE_CONTRACT_ADDRESS,
        functionName: type == 'Offer' ? 'cancelBuyOffer' : 'cancelListing',
        args: [BigInt(id)]
      })
      const hash = await writeContract(config as Config, request)
      const receipt = await waitForTransactionReceipt(config as Config, { hash });

      if (!receipt) throw new Error("Couldn't Cancel!")
      
      setProcess(false)
      setSuccess(true)
    } catch(error) {
      console.error("Error: ", error)
      setProcess(false)
      setError("Couldn't Cancel!")
    } finally {
      setTimeout(() => {
        setError("")
        setSuccess(false)
      }, 5000)
    }
  }

  const handleRefund = async(id: number) => {
    try{
      setProcess(true)

      const { request } = await simulateContract(config as Config, {
        abi: MARKETPLACE_CONTRACT_ABI,
        address: MARKETPLACE_CONTRACT_ADDRESS,
        functionName: 'refundBuyOffer',
        args: [BigInt(id)]
      })
      const hash = await writeContract(config as Config, request)
      const receipt = await waitForTransactionReceipt(config as Config, { hash });

      if (!receipt) throw new Error("Couldn't Refund!")
      
      setProcess(false)
      setSuccess(true)
    } catch(error) {
      console.error("Error: ", error)
      setProcess(false)
      setError("Couldn't Refund!")
    } finally {
      setTimeout(() => {
        setError("")
        setSuccess(false)
      }, 5000)
    }
  }

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
            <button
              onClick={() => setActiveTab("holding")}
              className={`pb-3 text-lg font-medium transition-colors ${
                activeTab === "activity"
                  ? "text-teal-700 border-b-2 border-teal-600 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Activity
            </button>
          </div>

          {/* Grid of Items */}
          <div className="">
            {
              (displayItems.length ?? 0)> 0 ? (
                <div className="grid grid-cols-2 gap-1">
                  {
                    displayItems.map((item) => (
                      <div
                        key={item.tokenId}
                        onClick={() => route.push(`/nft/${item.tokenId}`)}
                        className="aspect-square rounded-md border-2 border-foreground/20 hover:border-foreground/40 transition-colors bg-card cursor-pointer relative overflow-hidden"
                      >
                        <img 
                          src={item.imageUrl} 
                          alt={item.imageUrl} 
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Fade away shadow at bottom */}
                        <div className="absolute bottom-0 left-0 right-0 h-30 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />
                        
                        {/* Number at bottom left */}
                        <div className="absolute bottom-1 left-1 text-white font-semibold text-xl z-10">
                          {item.totalMint_balance}
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <>
                  {
                    activity.length > 0 ? (
                      <div className="">
                        {
                          activity.map((item) => (
                            <div 
                              className="flex gap-4"
                              key={item.tokenId}
                            >
                              {/* Image on the left - perfect square */}
                              <div className="relative aspect-square w-32 shrink-0 overflow-hidden rounded-md">
                                <Image 
                                  src={item.image || "/placeholder.svg"} 
                                  alt={item.id.toString()} 
                                  fill 
                                  className="object-cover" 
                                  onClick={() => route.push(`/nft/${item.tokenId}`)}
                                />
                              </div>

                              {/* Data on the right */}
                              <div className="flex flex-1 flex-col justify-between">
                                <div className="space-y-2">
                                  <p className="font-medium text-foreground">{item.desc}</p>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                    <div className="text-muted-foreground">Token ID:</div>
                                    <div className="font-medium">#{item.tokenId}</div>

                                    <div className="text-muted-foreground">Price:</div>
                                    <div className="font-medium">{item.price}</div>

                                    <div className="text-muted-foreground">Amount:</div>
                                    <div className="font-medium">{item.amount}</div>

                                    <div className="text-muted-foreground">Sold/Rec:</div>
                                    <div className="font-medium">{item.sold_rec}</div>

                                    <div className="text-muted-foreground">Expires:</div>
                                    <div className="font-medium">{item.expiresAt}</div>

                                    <div className="text-muted-foreground">Status:</div>
                                    <div className="font-medium">{item.status === 1 ? "Active" : "Inactive"}</div>
                                  </div>
                                </div>

                                {/* Action buttons */}
                                <div className="mt-2 flex gap-2">
                                  {item.type == "Offer" && (
                                    <button 
                                      onClick={ async() => await handleRefund(item.id)}
                                    >
                                      Refund
                                    </button>
                                  )}
                                  <button
                                   onClick={ async() => await handleCancel(item.type, item.id)}
                                  >
                                    Cancel
                                  </button>
                                </div>
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
                              <span className="text-lg text-teal-600/80">
                                {activeTab == 'holding' && "You Own Zero Moments"}
                                {activeTab == 'moments' && "You've Shared Zero Moments"}
                                {activeTab == 'activity' && "You've Made No Offers or Listings"}
                              </span>
                            </>
                          )
                        }
                      </div>
                    )
                  }
                  
                </>
              )
            }
          </div>
        </div>
      </div>
    </main>
  );
}
