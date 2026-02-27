'use server'

import { createClient } from '@/lib/server'
import { revalidatePath } from 'next/cache'

interface ProfileUpdates {
  updated_at: string
  username?: string
  full_name?: string
  bio?: string
  avatar_url?: string
  is_seller?: boolean
  // Accepts a structured object or an empty object to satisfy Postgres NOT NULL constraints
  payment_details?: {
    method: string
    number: string
    currency: string
  } | {}
}

interface ActionState {
  message: string
  type: string
}

export async function updateSettings(prevState: ActionState, formData: FormData) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { message: 'Unauthorized', type: 'error' }

  // 1. Fetch CURRENT profile (The "Truth")
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) return { message: 'Profile not found', type: 'error' }

  // 2. Initialize the Updates Object
  const updates: ProfileUpdates = {
    updated_at: new Date().toISOString()
  }
  let hasChanges = false

  // --- EXTRACT FIELDS ---
  const rawUsername = formData.get('username') as string
  const newFullName = formData.get('full_name') as string
  const newBio = formData.get('bio') as string
  const newAvatar = formData.get('avatar_url') as string
  const newIsSellerRaw = formData.get('is_seller') as string

  // --- GENERAL FIELDS ---

  // A. Username (Critical URL-Safe & Collision Check)
  if (rawUsername) {
    const cleanUsername = rawUsername.toLowerCase().replace(/[^a-z0-9_]/g, '')

    if (cleanUsername !== profile.username) {
      if (cleanUsername.length < 3) {
        return { message: 'Username must be at least 3 characters.', type: 'error' }
      }

      // Prevent claiming an existing username
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', cleanUsername)
        .neq('id', user.id)
        .maybeSingle()

      if (existingUser) {
        return { message: 'That username is already taken. Please choose another.', type: 'error' }
      }

      updates.username = cleanUsername
      hasChanges = true
    }
  }

  // B. Role Toggle (Buyer vs Seller)
  let isDowngrading = false
  let isNowSeller = profile.is_seller

  if (newIsSellerRaw !== null) {
    const newIsSeller = newIsSellerRaw === 'true'
    if (newIsSeller !== profile.is_seller) {
      updates.is_seller = newIsSeller
      hasChanges = true
      isNowSeller = newIsSeller

      // Flag if they are abandoning their seller account
      if (profile.is_seller === true && newIsSeller === false) {
        isDowngrading = true
      }
    }
  }

  // C. Other Text Fields
  if (newFullName && newFullName !== profile.full_name) {
    updates.full_name = newFullName
    hasChanges = true
  }

  if (newBio !== null && newBio !== profile.bio) {
    updates.bio = newBio
    hasChanges = true
  }

  // D. Avatar
  if (newAvatar && newAvatar !== profile.avatar_url) {
    updates.avatar_url = newAvatar
    hasChanges = true
  }

  // --- SELLER FIELDS (Payment) ---
  if (isNowSeller) {
    const paymentMethod = formData.get('payment_method') as string | null
    const paymentNumber = formData.get('payment_number') as string | null
    const currency = formData.get('currency') as string | null

    if (paymentMethod && paymentNumber) {
      const newPaymentDetails = {
        method: paymentMethod,
        number: paymentNumber,
        currency: currency ?? 'USD'
      }

      const currentJson = JSON.stringify(profile.payment_details || {})
      const newJson = JSON.stringify(newPaymentDetails)

      if (currentJson !== newJson) {
        updates.payment_details = newPaymentDetails
        hasChanges = true
      }
    }
  } else if (isDowngrading && Object.keys(profile.payment_details || {}).length > 0) {
    // SECURITY UX: If they downgraded from Seller to Buyer, wipe their payment info safely
    // using an empty object to satisfy the Postgres NOT NULL JSONB constraint.
    updates.payment_details = {}
    hasChanges = true
  }

  // 3. Early Exit (Saves DB compute if nothing changed)
  if (!hasChanges) {
    return { message: 'No changes detected.', type: 'success' }
  }

  // 4. Perform the Profile Update
  const { error: updateError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (updateError) {
    console.error('Update Error:', updateError)
    if (updateError.code === '23505') {
      return { message: 'Username is already taken.', type: 'error' }
    }
    return { message: 'Failed to save settings. Please try again.', type: 'error' }
  }

  // 5. SIDE-EFFECT: Handle Seller Downgrade (Protect Buyers)
  if (isDowngrading) {
    const { error: productsError } = await supabase
      .from('products')
      .update({ is_published: false })
      .eq('seller_id', user.id)
      .eq('is_published', true)

    if (productsError) {
      console.error("Critical: Failed to unpublish products on downgrade:", productsError)
    }
  }

  // 6. Revalidate Caches (Forces UI to immediately reflect new state)
  revalidatePath('/dashboard/settings')
  revalidatePath('/', 'layout')

  return {
    message: isNowSeller ? 'Seller profile and payout settings saved!' : 'Buyer profile updated successfully!',
    type: 'success'
  }
}