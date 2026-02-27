'use server'

import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

interface ProfileUpdates {
  has_completed_onboarding: boolean
  updated_at: string
  is_seller: boolean
}

export async function selectRole(formData: FormData) {
  const supabase = await createClient()
  const role = formData.get('role')

  // 1. Auth Check
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'You must be logged in to continue.' }
  }

  const updates: ProfileUpdates = {
    has_completed_onboarding: true,
    updated_at: new Date().toISOString(),
    is_seller: role === 'seller',
  }

  // 3. Update Database
  const { error: updateError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (updateError) {
    console.error('Onboarding Failed:', updateError)
    return { error: 'Could not update profile. Please try again.' }
  }

  // 4. Clear Cache & Redirect
  // We revalidate the entire layout so the Sidebar updates (e.g., showing "Seller" tabs)
  revalidatePath('/', 'layout')
  
  redirect('/dashboard')
}