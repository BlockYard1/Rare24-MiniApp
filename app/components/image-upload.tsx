"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ImagePlus, Send, Replace, LoaderPinwheel, CircleCheck, CircleX } from "lucide-react"
import { uploadImage } from "../backend/upload"
import { useConnection } from 'wagmi'
import { getCreatorMomentsCount } from "../blockchain/getterHooks"

export function ImageUploadCard() {
  const route = useRouter()
  const { isConnected, address } = useConnection()

  console.log(`address: ${address} ${isConnected}`)

  const [caption, setCaption] = useState("")
  const [price, setPrice] = useState("");
  const [inUsd, setInUsd] = useState("0")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [emptyImage, setEmptyImage] = useState(false)
  const [emptyCaption, setEmptyCaption] = useState(false)
  const [emptyPrice, setEmptyPrice] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const [momentCount, setMomentCount] = useState(0)

  const MIN_WIDTH = 1080
  const MAX_WIDTH = 5000
  const MIN_HEIGHT = 1080
  const MAX_HEIGHT = 5000

  const userName = "mokuakaleb";

  // moment count
  useEffect(() => {
    const getCount = async () => {
      const count = await getCreatorMomentsCount(address as `0x${string}`);
      setMomentCount(count + 1)
    }

    getCount()
  }, []);

  // Image
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if(!file) return
    setEmptyImage(false) 

    // Reset error
    setError(null)

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file")
      return
    }

    // Create an image element to check dimensions
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      // Check dimensions
      if (img.width < MIN_WIDTH || img.width > MAX_WIDTH || img.height < MIN_HEIGHT || img.height > MAX_HEIGHT || img.width > img.height) {
        setError(`Image Too Small or Too Large!`)
        URL.revokeObjectURL(objectUrl)
        event.target.value = "" // Reset file input
        return
      }

      // If dimensions are correct, load the image
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setImage(file)
      }
      reader.readAsDataURL(file)
      URL.revokeObjectURL(objectUrl)
    }

    img.onerror = () => {
      setError("Failed to load image")
      URL.revokeObjectURL(objectUrl)
    }

    img.src = objectUrl
  }

  // ETH to USD
  useEffect(() => {
    const ethInUsd = 3456;
    const amountPrice = Number(price) * ethInUsd;
    setInUsd(amountPrice.toFixed(2))
  }, [price]);

  // Close success
  const closeStatus = () => {
    setIsError(false)
    setIsSuccess(false)
    setSelectedImage(null)
    setCaption("")
    setPrice("")
  }

  // Upload
  const handleUpload = async () => {
    if (!selectedImage || !caption || !price) {
      if(!selectedImage) setEmptyImage(true);
      if(!caption) setEmptyCaption(true);
      if(!price) setEmptyPrice(true);
      return
    }
    console.log("Uploading:", { caption, price })

    setIsUploading(true)

    try {
      // Create FormData
      const formData = new FormData()
      image && formData.append('image', image)
      formData.append('caption', caption)
      formData.append('creator', userName)
      formData.append('momentCount', momentCount.toString())

      // Call server action
      const result = await uploadImage(formData)
      // check error
      if(!result.success) throw new Error("Image Upload Failed!");

      // call contract function
      

      if (result.success) {
        setIsUploading(false)
        setIsSuccess(true)
        alert(result.message)
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload failed. Please try again.")
      setIsUploading(false)
      setIsError(true)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Main Content - fills available space */}
      <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto">
        {/* Image Preview Area - grows to fill space */}
        <div className={`flex-1 flex flex-col items-center justify-center ${emptyImage && "border-2 border-dashed border-red-500 dark:border-red-800 dark:bg-red-500/10 bg-red-100/10 border-border rounded-lg"} ${(isUploading || isError || isSuccess) ? "" : "border-2 border-dashed  border-teal-500 dark:border-teal-800 dark:bg-[#222529] bg-teal-100/10 border-border rounded-lg"}`}>
          {selectedImage ? (
            <>
              <img
                src={selectedImage}
                alt="Selected"
                className={`w-full ${(isUploading || isError || isSuccess) ? "h-3/4" : "h-full"} object-contain rounded-lg`}
              />
              {
                isUploading && (
                  <div className="flex flex-col w-full items-center text-teal-800 dark:text-teal-300 justify-center p-5 gap-2 border bg-teal-500/20 border-teal-700 rounded-lg">
                    <span className="animate-spin">
                      <LoaderPinwheel size={35} />
                    </span>
                    <span className="text-lg font-semibold">Turning Your Moment Into An NFT</span>
                  </div>
                )
              }
              {
                isError && (
                  <div className="flex flex-col w-full items-center text-red-700 dark:text-red-300 justify-center p-5 gap-2 border bg-red-500/20 border-red-700 rounded-lg">
                    <span className="animate-pulse">
                      <CircleX size={35} />
                    </span>
                    <span className="text-lg font-semibold">Failed to Turn Moment Into NFT.</span>
                    <button onClick={() => closeStatus()} className="px-3 py-2 bg-red-600 rounded-lg text-white">
                      Let's Try Again
                    </button>
                  </div>
                )
              }
              {
                isSuccess && (
                  <div className="flex flex-col w-full items-center text-green-800 dark:text-green-300 justify-center p-5 gap-2 border bg-green-500/20 border-green-700 rounded-lg">
                    <span className="animate-pulse">
                      <CircleCheck size={35} />
                    </span>
                    <span className="text-lg font-semibold">Successfully Shared Moment As NFT</span>
                    <button onClick={() => route.push("/")} className="px-3 py-2 bg-green-600 rounded-lg text-white">
                      Okay
                    </button>
                  </div>
                )
              }
            </>
          ) : (
            <label className={`flex flex-col items-center gap-2 cursor-pointer p-8`}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageSelect} 
                className="hidden" 
              />
              <ImagePlus size={48} className="" />
              <p className={`text-lg `}>Select an image to preview</p>
              <span className="text-sm text-primary underline mt-2">Click to browse</span>
            </label>
          )}
          {
            selectedImage && !isUploading && !isSuccess && !isError && (
              <span onClick={() => setSelectedImage(null)} className="dark:bg-gray-800 dark:border dark:border-gray-600 bg-gray-300 rounded-full p-2 my-2">
                <Replace size={25} className="" />
              </span>
            )
          }
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 text-center border border-red-500/50 rounded-lg text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className={`${(isUploading || isError || isSuccess) && "hidden"} flex flex-col gap-4`}>
          {/* Caption Textarea */}
          <textarea
            placeholder="Add caption ..."
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value)
              setEmptyCaption(false)
            }}
            className={`w-full px-4 py-3 border ${emptyCaption ? "border-red-500 dark:border-red-800 dark:bg-red-500/10 bg-red-100/10 focus:ring-red-500 " : "dark:bg-[#222529] bg-teal-500/10 border-teal-700 focus:ring-teal-500 "} rounded-lg text-lg focus:outline-none focus:ring-1 resize-none`}
            rows={4}
          />

          {/* Price */}
          <div>
            <label className={`flex items-center justify-between gap-2 cursor-pointer p-2 border ${emptyPrice ? "border-red-500 dark:border-red-800 dark:bg-red-500/10 bg-red-100/10" : "dark:bg-[#222529] bg-teal-500/10 border-teal-700"} rounded-lg text-lg`}>
              <input
                placeholder="0.01 ETH"
                type="text"
                value={price}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d*\.?\d*$/.test(val)) setPrice(val);
                  setEmptyPrice(false)
                }}
                onBlur={() => {
                  if (Number(price) < 0.001) setPrice("0.001");
                }}
                className="px-4 py-3 w-full outline-none"
              />
              <p className={`text-lg pr-2 dark:text-gray-400 text-gray-800`}>${inUsd}</p>
            </label>
            <p className="text-xs text-center my-2 dark:text-gray-400 text-gray-800">
              * Minimum is 0.001 ETH
            </p>
          </div>

          {/* Upload Button */}
          <button
            onClick={async() => await handleUpload()}
            className="w-full px-4 py-3 bg-gradient-to-br from-blue-500/15 to-teal-500/15 dark:from-blue-500/35 dark:to-teal-500/35 rounded-full font-medium flex items-center justify-center border border-teal-500 dark:border-teal-800"
          >
            <Send className="text-blue-500 dark:text-blue-300" size={25} />
          </button>
        </div>
      </div>
    </div>
  )
}