"use server"

import { pinata } from "@/utils/config"

// moment id from users number of deployed tokenIds
const momentId = 1;

export async function uploadImage(formData: FormData) {
  const file = formData.get('image') as File
  const caption = formData.get('caption') as string
  const creator = formData.get('creator') as string
  
  try {
    // Pinata Upload
    const { cid } = await pinata.upload.public
      .file(file)
      .name(`${creator}-${momentId}`)
      .keyvalues({
        type: 'nft-image',
        uploadAt: new Date().toISOString()
      })
    const imageUrl = await pinata.gateways.public.convert(cid);

    // construct NFT metadata
    const nftMetadata = {
      name: `${creator}-${momentId}`,
      description: caption,
      image: imageUrl,
      attributes: [
        { trait_type: "Rarity", value: "Rare" }
      ],
      external_url: ""
    }

    // upload metadata JSON to pinata
    const metadataUpload = await pinata.upload.public
      .json(nftMetadata)
      .name(`${creator}-${momentId}-metadata`)
      .keyvalues({
        type: 'nft-metadata',
        uploadAt: new Date().toISOString()
      })
    const metadataUrl = await pinata.gateways.public.convert(metadataUpload.cid);
    
    return { success: true, message: metadataUrl }
  } catch (error) {
    return { success: false, message: "Upload failed" }
  }
}