"use server"

import { pinata } from "@/utils/config"

export async function uploadImage(formData: FormData) {
  const file = formData.get('image') as File
  const caption = formData.get('caption') as string
  const price = formData.get('price') as string
  
  try {

    // Pinata Upload
    const { cid } = await pinata.upload.public.file(file)
    const url = await pinata.gateways.public.convert(cid);
    
    return { success: true, message: url }
  } catch (error) {
    return { success: false, message: "Upload failed" }
  }
}