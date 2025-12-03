"use client"

import { Manrope } from "next/font/google"
import type React from "react"
import { useState } from "react"
import { ImagePlus, Send } from "lucide-react"

const manrope = Manrope({ 
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-manrope',
})

export function ImageUploadCard() {
  const [caption, setCaption] = useState("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [emptyImage, setEmptyImage] = useState(false)
  const [emptycaption, setEmptycaption] = useState(false)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setEmptyImage(false)  
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleUpload = () => {
    if (!selectedImage || !caption) {
      if(!selectedImage) setEmptyImage(true);
      if(!caption) setEmptycaption(true);
      return
    }
    console.log("Uploading:", { image: selectedImage, caption })
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
        </div>

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
          onClick={handleUpload}
          className="w-full px-4 py-3 bg-gradient-to-br from-blue-500/15 to-teal-500/15 dark:from-blue-500/35 dark:to-teal-500/35 rounded-full font-medium flex items-center justify-center border border-teal-500 dark:border-teal-800"
        >
          <Send className="text-blue-500 dark:text-blue-300" size={25} />
        </button>
      </div>
    </div>
  )
}