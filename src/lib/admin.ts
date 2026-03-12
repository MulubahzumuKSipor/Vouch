'use server'

import { createClient } from '@/lib/server'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

/**
 * MASTER ADMIN CLIENT
 * This bypasses RLS. Use ONLY for sensitive server-side admin operations.
 */
const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ============================================================================
// 1. AUTOMATED API PAYOUT (PRIMARY)
// ============================================================================
export async function processAutomatedPayout(payoutId: string) {
  const supabase = await createClient()

  // 1. SECURITY: Check admin session using standard client
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'mzksipor@gmail.com') {
    return { error: 'Unauthorized. Superadmin only.' }
  }

  // 2. FETCH DATA: Use Admin Client to bypass RLS restrictions
  const { data: payout, error: fetchError } = await supabaseAdmin
    .from('payouts')
    .select('amount, payment_method, payment_destination')
    .eq('id', payoutId)
    .eq('status', 'pending')
    .single()

  if (fetchError || !payout) return { error: 'Payout not found or already processed.' }

  try {
    // --- SIMULATED API CALL ---
    await new Promise(resolve => setTimeout(resolve, 1500));
    const apiTransactionRef = `API-${payout.payment_method.toUpperCase()}-${Math.floor(Math.random() * 1000000)}`

    // 3. UPDATE DATABASE: Use Admin Client to write the record
    const { error: updateError } = await supabaseAdmin
      .from('payouts')
      .update({
        status: 'completed',
        transaction_reference: apiTransactionRef,
        processed_at: new Date().toISOString()
      })
      .eq('id', payoutId)
      .eq('status', 'pending')

    if (updateError) throw updateError

    revalidatePath('/admin')
    revalidatePath('/admin/payouts')

    return { success: true }

  } catch (err: unknown) {
    console.error("API Payout Error:", err)
    return { error: 'Failed to process payout via external API.' }
  }
}

// ============================================================================
// 2. MANUAL OVERRIDE PAYOUT (FALLBACK)
// ============================================================================
export async function markPayoutCompleted(payoutId: string, transactionRef: string) {
  const supabase = await createClient()
  
  // 1. SECURITY: Check admin session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'mzksipor@gmail.com') {
    return { error: 'Unauthorized. Superadmin only.' }
  }

  if (!transactionRef || transactionRef.trim() === '') {
    return { error: 'Transaction Reference is required.' }
  }

  // 2. UPDATE DATABASE: Use Admin Client to bypass RLS
  const { error } = await supabaseAdmin
    .from('payouts')
    .update({ 
      status: 'completed', 
      transaction_reference: transactionRef,
      processed_at: new Date().toISOString()
    })
    .eq('id', payoutId)
    .eq('status', 'pending')

  if (error) {
    console.error("Manual Payout Error:", error)
    return { error: 'Failed to update payout record.' }
  }

  revalidatePath('/admin')
  revalidatePath('/admin/payouts')
  
  return { success: true }
}

// ============================================================================
// 3. TOGGLE USER VERIFICATION
// ============================================================================
export async function toggleUserVerification(userId: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'mzksipor@gmail.com') return { error: 'Unauthorized' }

  // Use the admin client to bypass RLS
  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_verified: !currentStatus })
    .eq('id', userId)

  if (error) return { error: 'Failed to update user verification status' }
  revalidatePath('/admin/users')
  return { success: true }
}

// ============================================================================
// 4. SUSPEND/ACTIVATE USER
// ============================================================================
export async function toggleUserSuspension(userId: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'mzksipor@gmail.com') return { error: 'Unauthorized' }

  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ is_suspended: !currentStatus }) // Matches your database.ts schema
    .eq('id', userId)

  if (error) return { error: 'Failed to update account suspension status' }
  revalidatePath('/admin/users')
  return { success: true }
}


// ============================================================================
// 5. TOGGLE CMS CONTENT VISIBILITY
// ============================================================================
export async function toggleContentVisibility(id: string, tableName: string, currentStatus: boolean) {
  // 🔴 Use the standard authenticated client to respect your new Admin RLS rules
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'mzksipor@gmail.com') return { error: 'Unauthorized' }

  // Security check: Only allow updates to our 4 designated CMS tables
  const allowedTables = ['blog_posts', 'help_articles', 'creator_guides', 'press_releases']
  if (!allowedTables.includes(tableName)) return { error: 'Invalid table' }

  // 🔴 Use "as any" to tell TypeScript the table name is safe
  const { error } = await supabase
    .from(tableName as any)
    .update({ is_published: !currentStatus })
    .eq('id', id)

  if (error) return { error: 'Failed to update publication status' }
  revalidatePath('/admin/content')
  return { success: true }
}

// ============================================================================
// 6. SAVE OR UPDATE CMS CONTENT
// ============================================================================
export async function saveContent(tableName: string, data: any, id?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'mzksipor@gmail.com') return { error: 'Unauthorized' }

  // Security check
  const allowedTables = ['blog_posts', 'help_articles', 'creator_guides', 'press_releases']
  if (!allowedTables.includes(tableName)) return { error: 'Invalid table name' }

  try {
    if (id) {
      // Update existing
      const { error } = await supabase.from(tableName as any).update(data).eq('id', id)
      if (error) throw error
    } else {
      // Insert new
      const { error } = await supabase.from(tableName as any).insert(data)
      if (error) throw error
    }

    revalidatePath('/admin/content')
    return { success: true }
  } catch (error: any) {
    console.error("Save Error:", error)
    return { error: error.message || 'Failed to save content' }
  }
}