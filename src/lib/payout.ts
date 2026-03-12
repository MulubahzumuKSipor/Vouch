'use server'

import { createClient } from '@/lib/server'
import { revalidatePath } from 'next/cache'

// Define what our JSON object looks like
interface PaymentDetails {
  number?: string;
  method?: string;
}

// 🔴 UPDATED: Now calculates available balances separately for USD and LRD
export async function getPayoutStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch all completed orders (earnings)
  const { data: orders } = await supabase
    .from('orders')
    .select('seller_earnings, currency')
    .eq('seller_id', user.id)
    .eq('status', 'completed')

  // Fetch all payouts (deductions)
  const { data: payouts } = await supabase
    .from('payouts')
    .select('amount, currency')
    .eq('seller_id', user.id)
    .in('status', ['pending', 'processing', 'completed'])

  // Initialize wallets
  const balances = {
    USD: 0,
    LRD: 0
  }

  // Add Earnings
  orders?.forEach(o => {
    const cur = o.currency as 'USD' | 'LRD'
    if (balances[cur] !== undefined) balances[cur] += (o.seller_earnings || 0)
  })

  // Subtract Withdrawals
  payouts?.forEach(p => {
    const cur = p.currency as 'USD' | 'LRD'
    if (balances[cur] !== undefined) balances[cur] -= (p.amount || 0)
  })

  return {
    USD: Math.max(0, balances.USD),
    LRD: Math.max(0, balances.LRD)
  }
}

// 🔴 UPDATED: Added the `currency` parameter
export async function requestPayout(amount: number, method: string, number: string, currency: 'USD' | 'LRD') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 1. SECURITY CHECK: Verify Payment Details
  const { data: profile } = await supabase
    .from('profiles')
    .select('payment_details')
    .eq('id', user.id)
    .single()

  const paymentDetails = profile?.payment_details as PaymentDetails | null
  const savedNumber = paymentDetails?.number

  if (!savedNumber || number !== savedNumber) {
    return { error: 'Security Alert: Payout number does not match your saved Settings. Please verify your profile.' }
  }

  // 2. SERVER-SIDE BALANCE VERIFICATION
  const stats = await getPayoutStats()

  // 🔴 Isolate the balance for the specifically requested currency
  const availableBalance = stats ? stats[currency] : 0

  if (availableBalance < amount) {
    return { error: `Insufficient ${currency} balance. You requested ${amount/100}, but only have ${availableBalance/100} available.` }
  }

  // 🔴 DYNAMIC MINIMUM CHECK ($5.00 USD = 500 cents / L$500.00 LRD = 50000 cents)
  const minAmount = currency === 'USD' ? 500 : 50000;
  if (amount < minAmount) {
    return { error: `Minimum payout is ${currency === 'USD' ? '$5.00 USD' : 'L$500.00 LRD'}` }
  }

  // 3. CREATE PAYOUT REQUEST
  const { error } = await supabase
    .from('payouts')
    .insert({
      seller_id: user.id,
      amount: amount,
      currency: currency, // 🔴 Force the DB to record the specific wallet used
      payment_method: method,
      payment_destination: {
        number: savedNumber,
        name: user.user_metadata?.full_name || 'Creator'
      },
      status: 'pending'
    })

  if (error) {
    console.error('Payout Request Error:', error)
    return { error: 'Failed to request payout. Please try again.' }
  }

  revalidatePath('/dashboard/payouts')
  return { success: true }
}