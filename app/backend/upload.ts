"use server"

import { pinata } from "@/utils/config"

export async function uploadImage(formData: FormData) {
  const base64Image = formData.get('image') as string
  const caption = formData.get('caption') as string

  if (!base64Image || !caption) {
    return { success: false, message: "Missing image or caption" }
  }
  
  try {
    // Extract base64 data
    const base64Data = base64Image.split(',')[1]
    const mimeType = base64Image.split(';')[0].split(':')[1]
    
    // Convert to Buffer
    const buffer = Buffer.from(base64Data, 'base64')

    // Get file extension
    const extension = mimeType.split('/')[1]
    const filename = `${Date.now()}.${extension}`

    // Create a File object from buffer
    const file = new File([buffer], filename, { type: mimeType })

    // Pinata Upload
    const { cid } = await pinata.upload.public.file(file)
    const url = await pinata.gateways.public.convert(cid);
    
    return { success: true, message: url }
  } catch (error) {
    return { success: false, message: "Upload failed" }
  }
}