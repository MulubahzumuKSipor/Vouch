'use server'

import { createClient } from '@/lib/server'
import { revalidatePath } from 'next/cache'

// Define what our JSON object looks like
interface PaymentDetails {
  number?: string;
  method?: string;
}

export async function getPayoutStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null


  const { data: orders } = await supabase
    .from('orders')
    .select('seller_earnings')
    .eq('seller_id', user.id)
    .eq('status', 'completed')
  
  const totalEarnings = orders?.reduce((sum, o) => sum + (o.seller_earnings || 0), 0) || 0

  // 2. Calculate Total Payouts
  const { data: payouts } = await supabase
    .from('payouts')
    .select('amount')
    .eq('seller_id', user.id)
    .in('status', ['pending', 'processing', 'completed'])

  const totalWithdrawn = payouts?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

  // 3. Calculate Available
  const availableBalance = totalEarnings - totalWithdrawn

  return {
    totalEarnings,
    totalWithdrawn,
    availableBalance: Math.max(0, availableBalance)
  }
}

export async function requestPayout(amount: number, method: string, number: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 1. SECURITY CHECK: Verify Payment Details
  // We do not trust the 'number' sent from the client blindly.
  // It must match what is verified and saved in their profile.
  const { data: profile } = await supabase
    .from('profiles')
    .select('payment_details')
    .eq('id', user.id)
    .single()

  // 🔴 FIXED: Tell TypeScript this JSON is our expected PaymentDetails object
  const paymentDetails = profile?.payment_details as PaymentDetails | null
  const savedNumber = paymentDetails?.number

  if (!savedNumber || number !== savedNumber) {
    return { error: 'Security Alert: Payout number does not match your saved Settings. Please verify your profile.' }
  }

  // 2. Verify Balance
  const stats = await getPayoutStats()
  if (!stats || stats.availableBalance < amount) {
    return { error: 'Insufficient balance' }
  }

  if (amount < 500) { // $5.00 minimum
    return { error: 'Minimum payout is $5.00 USD' }
  }

  // 3. Create Payout Request
  const { error } = await supabase
    .from('payouts')
    .insert({
      seller_id: user.id,
      amount: amount,
      currency: 'USD',
      payment_method: method,
      payment_destination: {
        number: savedNumber, // Force use of the DB value
        name: user.user_metadata.full_name
      },
      status: 'pending'
    })

  // REMOVED: The step that updated the profile.
  // We do not change settings here anymore.

  if (error) {
    console.error('Payout Request Error:', error)
    return { error: 'Failed to request payout. Please try again.' }
  }

  revalidatePath('/dashboard/payouts')
  return { success: true }
}