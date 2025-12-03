"use client"

import type React from "react"
import { useState } from "react"
import { ImagePlus, Send, Replace } from "lucide-react"
import { uploadImage } from "../backend/upload"

export function ImageUploadCard() {
  const [caption, setCaption] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [emptyImage, setEmptyImage] = useState(false)
  const [emptycaption, setEmptycaption] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const MIN_WIDTH = 1080
  const MAX_WIDTH = 5000
  const MIN_HEIGHT = 1080
  const MAX_HEIGHT = 5000

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

  // 
  const handleUpload = async () => {
    if (!selectedImage || !caption) {
      if(!selectedImage) setEmptyImage(true);
      if(!caption) setEmptycaption(true);
      return
    }
    console.log("Uploading:", { image: selectedImage, caption })

    setIsUploading(true)

    try {
      // Create FormData
      const formData = new FormData()
      formData.append('image', selectedImage)
      formData.append('caption', caption)

      // Call server action
      const result = await uploadImage(formData)

      if (result.success) {
        alert(result.message)
        // Reset form
        setSelectedImage(null)
        setCaption("")
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Main Content - fills available space */}
      <div className="flex-1 flex flex-col gap-4 p-4 overflow-auto">
        {/* Image Preview Area - grows to fill space */}
        <div className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed ${emptyImage ? "border-red-500 dark:border-red-800 dark:bg-red-500/10 bg-red-100/10" :"border-teal-500 dark:border-teal-800 dark:bg-[#222529] bg-teal-100/10"} border-border rounded-lg`}>
          {selectedImage ? (
            <img
              src={selectedImage}
              alt="Selected"
              className="w-full h-full object-contain rounded-lg"
            />
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
            selectedImage && (
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

        {/* Caption Textarea */}
        <textarea
          placeholder="Add caption ..."
          value={caption}
          onChange={(e) => {
            setCaption(e.target.value)
            setEmptycaption(false)
          }}
          className={`w-full px-4 py-3 border ${emptycaption ? "border-red-500 dark:border-red-800 dark:bg-red-500/10 bg-red-100/10 focus:ring-red-500 " : "dark:bg-[#222529] bg-teal-500/10 border-teal-700 focus:ring-teal-500 "} rounded-lg text-lg focus:outline-none focus:ring-1 resize-none`}
          rows={4}
        />

        {/* Upload Button */}
        <button
          onClick={async() => await handleUpload()}
          className="w-full px-4 py-3 bg-gradient-to-br from-blue-500/15 to-teal-500/15 dark:from-blue-500/35 dark:to-teal-500/35 rounded-full font-medium flex items-center justify-center border border-teal-500 dark:border-teal-800"
        >
          <Send className="text-blue-500 dark:text-blue-300" size={25} />
        </button>
      </div>
    </div>
  )
}