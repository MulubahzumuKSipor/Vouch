'use server'

import { createClient } from '@/lib/server'
import { revalidatePath } from 'next/cache'

interface ActionState {
  message: string
  type: string
}

export async function updateStoreSettings(prevState: ActionState, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { message: 'Unauthorized', type: 'error' }

  // 1. Extract Data
  const displayName = formData.get('display_name') as string
  const tagline = formData.get('tagline') as string
  const supportEmail = formData.get('support_email') as string
  const whatsapp = formData.get('whatsapp') as string
  
  // Socials
  const socialLinks = {
    facebook: formData.get('facebook') as string,
    instagram: formData.get('instagram') as string,
    twitter: formData.get('twitter') as string,
    linkedin: formData.get('linkedin') as string,
    website: formData.get('website') as string,
    whatsapp: whatsapp,
    support_email: supportEmail
  }

  // 2. Update Profile
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: displayName,
      bio: tagline,
      social_links: socialLinks,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    console.error(error)
    return { message: 'Failed to update store.', type: 'error' }
  }

  revalidatePath('/dashboard/settings/store')
  return { message: 'Store updated successfully!', type: 'success' }
}