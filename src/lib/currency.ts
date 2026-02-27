'use server'

// You can get a free key from: https://www.exchangerate-api.com/
// Or just use a public endpoint if available, but for production, use a key.
const API_KEY = process.env.EXCHANGE_RATE_API_KEY
const BASE_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`

// Cache the rate for 1 hour so we don't hit the API limit
let cachedRate: number | null = null
let lastFetch = 0

export async function getLrdRate(): Promise<number> {
  // 1. Check Cache (Simple in-memory cache)
  const now = Date.now()
  if (cachedRate && (now - lastFetch < 3600000)) { // 1 hour
    return cachedRate
  }

  try {
    // 2. Fetch from API
    // If you don't have a key yet, we default to a safe fallback
    if (!API_KEY) {
      console.warn('No Currency API Key. Using fallback rate.')
      return 195.0 // Current approx street rate
    }

    const res = await fetch(BASE_URL, { next: { revalidate: 3600 } })
    const data = await res.json()
    
    if (data.conversion_rates?.LRD) {
      // 🔴 FIXED: Force the response to a number, and assert it for TypeScript
      cachedRate = Number(data.conversion_rates.LRD)
      lastFetch = now
      return cachedRate as number
    }
  } catch (err) {
    console.error('Failed to fetch currency rate:', err)
  }

  return 195.0 // Fallback if API fails
}

export async function convertPrice(amountInCents: number, targetCurrency: 'USD' | 'LRD') {
  if (targetCurrency === 'USD') {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD' 
    }).format(amountInCents / 100)
  }

  // Convert to LRD
  const rate = await getLrdRate()
  const amountLrd = (amountInCents / 100) * rate
  
  return new Intl.NumberFormat('en-LR', { 
    style: 'currency', 
    currency: 'LRD',
    maximumFractionDigits: 0 // LRD usually doesn't use cents
  }).format(amountLrd)
}