"use client"

import { Heart, CircleCheck, LoaderCircle, Grid2x2X } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { config } from "@/utils/wagmi"
import { simulateContract, writeContract, waitForTransactionReceipt } from "@wagmi/core"
import { parseEther } from "viem"
import { Config } from "wagmi"
import { MARKETPLACE_CONTRACT_ABI, MARKETPLACE_CONTRACT_ADDRESS } from "../blockchain/core"
import { useFarcasterStore } from "../store/useFarcasterStore"
import { TokenListings } from "../types/index.t"
import { getTokensListed } from "../blockchain/getterHooks"

export default function Marketplace() {
  const route = useRouter()
  const user = useFarcasterStore((state) => state.user)

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [listedTokens, setListedTokens] = useState<TokenListings[] | null>(null)

  useEffect(() => {
    const fetchData = async() => {
      setIsDataLoading(true)

      const data = await getTokensListed()
      if(data)
        setListedTokens(data)

      setIsDataLoading(false)
    }
    fetchData()
  }, [])

  const handleBuyNow = async (listingId:number, price: string) => {    
    try{
      setLoading(true)

      const { request } = await simulateContract(config as Config, {
        abi: MARKETPLACE_CONTRACT_ABI,
        address: MARKETPLACE_CONTRACT_ADDRESS,
        functionName: 'buyListing',
        args: [BigInt(listingId), user?.username],
        value: parseEther(price)
      })
      const hash = await writeContract(config as Config, request)
      const receipt = await waitForTransactionReceipt(config as Config, { hash });

      if (!receipt) throw new Error("Couldn't Buy NFT!")
      // await new Promise(resolve => setTimeout(resolve, 5000));
      
      setLoading(false)
      setSuccess(true)
    } catch(error) {
      console.error("handleAcceptOffer: ", error)
      setLoading(false)
      setError("Couldn't Buy NFT!")
    } finally {
      setTimeout(() => {
        setError("")
        setSuccess(false)
        setSelectedId(null)
      }, 5000)
    }
  }

  if(isDataLoading) return (
    <div className="my-16 flex flex-col items-center justify-center gap-5 p-10 max-h-[25%]">
      <span className="animate-spin">
        <LoaderCircle size={50} className="text-teal-500/80"/>
      </span>
      <span className="text-teal-500/80 text-lg">Fetching Listings ...</span>
    </div>
  )

  return (
    <div className={`my-16`}>
      {
        (listedTokens?.length ?? 0) > 0 
        ? (
          <>
            {
              listedTokens?.map((listing) => {
                return(
                  <div className="border-b border-gray-500/30" key={listing.listingId}>
                    {/* Image */}
                    <div 
                      className="border-b max-h-[50%]"
                      onClick={() => {
                        route.push(`nft/${listing.tokenId}`)
                      }}
                    >
                      <img 
                        src={listing?.imageUrl} 
                        alt={listing?.creator}
                      />
                    </div>
                    {/* Moment Details */}
                    <div className="flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-300">
                        <div className="font-semibold">
                            <span className="text-lg">@{listing?.creator}</span> by 
                            <span className="text-lg"> {listing?.seller}</span>
                        </div>
                        <div 
                          className="flex items-center justify-even gap-2"
                          onClick={async() => {
                            setSelectedId(listing.listingId)
                            await handleBuyNow(listing.listingId, listing.price)
                          }}
                        >
                            <Heart size={25} className="text-red-500"/>
                            <span className="text-lg font-semibold">{listing?.sold}/{listing?.amount}</span>
                        </div>
                    </div>
                    {
                      selectedId === listing.listingId && (
                        <div className="p-5">
                          {
                            loading && (
                              <div className="text-center text-blue-200 rounded-lg bg-blue-500 flex flex-col py-2 font-semibold text-lg">
                                <span className="flex items-center justify-center">
                                  <LoaderCircle size={30} className="animate-spin text-white" />
                                </span>
                              </div>
                            )
                          }
                          {
                            error && (
                              <div className="text-center text-red-200 rounded-lg bg-red-500 flex flex-col py-2 font-semibold text-lg">
                                <span className="">{`${error} Try Again!`}</span>
                              </div>
                            )
                          }
                          {
                            success && (
                              <div className="text-center text-green-200 rounded-lg bg-green-600 flex items-center justify-center space-x-2 py-2 text-lg font-semibold ">
                                <CircleCheck size={30} className="font-semibold" />
                                <span className="">NFT Bought</span>
                              </div>
                            )
                          }
                        </div>
                      )
                    }
                    <div className="px-4 pb-5 space-y-2 text-gray-700 dark:text-gray-300">
                        <p className="text-lg">{listing?.desc}</p>
                        <p className="text-md font-semibold">Price: <span className="font-semibold">{listing?.price} ETH ($213)</span></p>
                    </div>
                  </div>
                )
              })
            }
          </>
        ) 
        : (
          <div>
            <Grid2x2X size={60} className="text-teal-500/80 mb-3"/>
            <span className="text-lg text-teal-600/80">No NFT Listed Yet!</span>
          </div>
        ) 
      }
    </div>
  )
}
