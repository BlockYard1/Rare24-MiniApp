"use client"

import { useEffect, useState } from "react";
import { getFarcasterUser } from "./backend/farcasterUser";
import sdk from "@farcaster/frame-sdk"
import { useFarcasterStore } from "./store/useFarcasterStore";
import { config } from "@/utils/wagmi";
import { simulateContract, writeContract, waitForTransactionReceipt } from "@wagmi/core"
import { Config } from "wagmi";
import { RARE24_CONTRACT_ABI, RARE24_CONTRACT_ADDRESS } from "./blockchain/core";
import { parseEther } from "viem";
import { LoaderCircle, Heart, CircleCheck, Grid2x2X } from "lucide-react";
import { getSharedMoments } from "./blockchain/getterHooks";
import { SharedMoments } from "./types/index.t";


export default function Home() {
  const { setUser, setLoading } = useFarcasterStore()

  const [userName, setUserName] = useState('')
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [sharedMoments, setSharedMoments] = useState<SharedMoments[] | null>(null)
  const [id, setId] = useState<number | null>(null)

  // fetch farcaster data
  useEffect(() => {
    // farcaster user data
    const getUser = async() => {
      let userFid: number | null = null

      // Try to get FID from Frame SDK first
      try {
        const context = await sdk.context
        userFid = context.user?.fid || null
      } catch (error) {
        console.log('Not in Farcaster context')
      }

      // Fallback to mock FID if not in Farcaster
      if (!userFid && process.env.NEXT_PUBLIC_MOCK_FID) {
        userFid = parseInt(process.env.NEXT_PUBLIC_MOCK_FID)
        console.log('Using mock FID:', userFid)
      }

      try {
        if(userFid) {
          const userData = await getFarcasterUser(userFid)
          if(userData) {
            setUser(userData)
            setUserName(userData.username)
          }
          setId(userFid)
        }
      } catch (error) {
        console.error('Error loading Farcaster user:', error)
      } finally {
        setLoading(false)
      }
    }
    getUser()
  }, [])

  // fetch moments
  useEffect(() => {
    const fetchData = async() => {
      setIsDataLoading(true)

      if(id) {
        const data = await getSharedMoments(id)
        if(data)
          setSharedMoments(data)
      }

      setIsDataLoading(false)
    }
    fetchData()
  }, [id])

  const handleBuyNow = async (tokenId:number, price: string) => {    
    try{
      setIsLoading(true)

      const { request } = await simulateContract(config as Config, {
        abi: RARE24_CONTRACT_ABI,
        address: RARE24_CONTRACT_ADDRESS,
        functionName: 'mintPhoto',
        args: [BigInt(tokenId), userName],
        value: parseEther(price)
      })
      const hash = await writeContract(config as Config, request)
      const receipt = await waitForTransactionReceipt(config as Config, { hash });

      if (!receipt) throw new Error("Couldn't Buy NFT!")
      // await new Promise(resolve => setTimeout(resolve, 5000));
      
      setIsLoading(false)
      setSuccess(true)
    } catch(error) {
      console.error("handleAcceptOffer: ", error)
      setIsLoading(false)
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
      <span className="text-teal-500/80 text-lg">Fetching Moments ...</span>
    </div>
  )

  return (
    <div className={`my-16`}>
      {
        (sharedMoments?.length ?? 0) > 0 
        ? (
          <>
            {
              sharedMoments?.map((moment) => {
                return(
                  <div className="border-b border-gray-500/30" key={moment.tokenId}>
                    {/* Image */}
                    <div 
                      className="border-b max-h-[50%]"
                    >
                      <img 
                        src={moment?.imageUrl} 
                        alt={moment?.creator}
                      />
                    </div>
                    {/* Moment Details */}
                    <div className="flex items-center justify-between px-4 py-3 text-gray-700 dark:text-gray-300">
                        <div className="font-semibold">
                            <span className="text-lg">@{moment?.creator}</span>
                        </div>
                        <div 
                          className="flex items-center justify-even gap-2"
                          onClick={async() => {
                            setSelectedId(moment.tokenId)
                            await handleBuyNow(moment.tokenId, moment.price)
                          }}
                        >
                            <Heart size={25} className="text-red-500"/>
                            <span className="text-lg font-semibold">{moment?.sold}/{moment?.amount}</span>
                        </div>
                    </div>
                    {
                      selectedId === moment.tokenId && (
                        <div className="p-5">
                          {
                            isLoading && (
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
                        <p className="text-lg">{moment?.desc}</p>
                        <p className="text-md font-semibold">Price: <span className="font-semibold">{moment?.price} ETH ($213)</span></p>
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
            <span className="text-lg text-teal-600/80">No Moments Shared Yet!</span>
          </div>
        ) 
      }
    </div>
  );
}
