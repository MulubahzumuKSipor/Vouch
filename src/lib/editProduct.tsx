'use server'

import { createClient } from '@/lib/server'
import { revalidatePath } from 'next/cache'

export async function updateProductDetails(productId: string, formData: FormData) {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string || '0')
  const isPublished = formData.get('is_published') === 'true'
  const coverImage = formData.get('cover_image') as string // <--- Get the URL

  if (!title || title.length < 3) return { error: 'Title too short' }

  const { error } = await supabase
    .from('products')
    .update({
      title,
      description,
      price_amount: Math.round(price * 100),
      is_published: isPublished,
      cover_image: coverImage // <--- FIX: Save it to DB
    })
    .eq('id', productId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/products/${productId}/edit`)
  return { success: true }
}

export async function deleteAttachment(attachmentId: string, productId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('product_attachments')
    .delete()
    .eq('id', attachmentId)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/products/${productId}/edit`)
  return { success: true }
}