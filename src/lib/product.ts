'use server'

import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

// --- CONFIGURATION ---
const BUNNY_LIBRARY_ID = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID
const BUNNY_API_KEY = process.env.BUNNY_API_KEY // Library Access Key (Secret)
const BUNNY_PULL_ZONE = process.env.NEXT_PUBLIC_BUNNY_PULL_ZONE

// --- HELPER: Slug Generator ---
function generateSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') + '-' + Math.floor(Math.random() * 1000)
}

// --- 1. CREATE PRODUCT ---
export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const title = formData.get('title') as string
  const type = formData.get('type') as 'course' | 'service' | 'asset'

  if (!title || !type) return { error: 'Title and Type are required' }

  const { data, error } = await supabase
    .from('products')
    .insert({
      seller_id: user.id,
      title: title,
      slug: generateSlug(title),
      product_type: type,
      is_published: false,
      price_amount: 0,
      price_currency: 'USD'
    })
    .select('id')
    .single()

  if (error) return { error: 'Failed to create product' }

  revalidatePath('/dashboard/products')
  redirect(`/dashboard/products/${data.id}/edit`)
}

// --- 2. UPDATE PRODUCT DETAILS ---
export async function updateProductDetails(productId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const priceString = formData.get('price') as string
  const currency = formData.get('currency') as string
  const isPublished = formData.get('is_published') === 'true'

  const priceAmount = Math.round(parseFloat(priceString) * 100)

  const { error } = await supabase
    .from('products')
    .update({
      title,
      description,
      price_amount: priceAmount,
      // 🔴 FIXED: Asserted the string to match the strict Supabase currency_enum
      price_currency: currency as 'USD' | 'LRD' | 'EUR' | 'GBP' | 'NGN' | 'GHS' | 'KES',
      is_published: isPublished,
      updated_at: new Date().toISOString()
    })
    .eq('id', productId)
    .eq('seller_id', user.id)

  if (error) return { error: 'Failed to update product details' }

  revalidatePath(`/dashboard/products/${productId}`)
  return { success: true }
}

// --- 3. CREATE BUNNY VIDEO & SIGNATURE (For TUS Upload) ---
export async function createBunnyVideo(title: string) {
  if (!BUNNY_LIBRARY_ID || !BUNNY_API_KEY) {
    return { success: false, error: 'Bunny.net keys not configured on server' }
  }

  // A. Create Video Entry in Bunny
  const url = `https://video.bunnycdn.com/library/${BUNNY_LIBRARY_ID}/videos`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      AccessKey: BUNNY_API_KEY
    },
    body: JSON.stringify({ title })
  })

  const data = await res.json()
  if (!res.ok) return { success: false, error: 'Failed to create Bunny container' }

  const videoId = data.guid

  // B. Generate SHA256 Signature for TUS
  const expirationTime = Math.floor(Date.now() / 1000) + 3600 // 1 hour
  const signatureString = `${BUNNY_LIBRARY_ID}${BUNNY_API_KEY}${expirationTime}${videoId}`
  const signature = crypto.createHash('sha256').update(signatureString).digest('hex')

  return {
    success: true,
    videoId,
    libraryId: BUNNY_LIBRARY_ID,
    signature,
    expirationTime: expirationTime.toString()
  }
}

// --- 4. SAVE VIDEO ATTACHMENT ---
export async function saveVideoAttachment(productId: string, videoId: string, fileName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Use Pull Zone for Thumbnail
  const thumbnailUrl = BUNNY_PULL_ZONE
    ? `https://${BUNNY_PULL_ZONE}.b-cdn.net/${videoId}/thumbnail.jpg`
    : null

  if (thumbnailUrl) {
    await supabase
      .from('products')
      .update({ preview_video: videoId, cover_image: thumbnailUrl })
      .eq('id', productId)
      .eq('seller_id', user.id)
  }

  const { error } = await supabase
    .from('product_attachments')
    .insert({
      product_id: productId,
      file_name: fileName,
      storage_path: videoId,
      attachment_type: 'video',
      mime_type: 'video/mp4',
      is_preview: true
    })

  if (error) return { success: false, error: error.message }

  revalidatePath(`/dashboard/products/${productId}/edit`)
  return { success: true }
}

// --- 5. SAVE FILE ATTACHMENT ---
export async function saveFileAttachment(productId: string, storagePath: string, fileName: string, fileType: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('product_attachments')
    .insert({
      product_id: productId,
      file_name: fileName,
      storage_path: storagePath,
      attachment_type: 'file',
      mime_type: fileType,
      is_preview: false
    })

  if (error) return { success: false, error: error.message }

  revalidatePath(`/dashboard/products/${productId}/edit`)
  return { success: true }
}

// Delete a file from Supabase Private Storage
export async function deleteSupabaseFile(filePath: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Extract just the file name/path from the full URL if necessary
  const pathClean = filePath.replace('resources/', '')

  const { error } = await supabase.storage
    .from('product-files')
    .remove([`resources/${pathClean}`])

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// Delete a video from Bunny.net
export async function deleteBunnyVideo(videoId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID
  const apiKey = process.env.BUNNY_API_KEY // Server-side Access Key

  const url = `https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`

  try {
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { accept: 'application/json', AccessKey: apiKey! }
    })

    if (!res.ok) throw new Error('Failed to delete from CDN')
    return { success: true }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}