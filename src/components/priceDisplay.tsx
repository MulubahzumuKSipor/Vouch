'use client'

import { useCurrency } from '@/context/CurrencyContext'

interface PriceDisplayProps {
  amount: number // in cents
  sourceCurrency: string // 'USD' or 'LRD'
  className?: string
}

export default function PriceDisplay({ amount, sourceCurrency, className }: PriceDisplayProps) {
  const { convertPrice } = useCurrency()

  // 1. Do the math based on current preference
  const { value, currency } = convertPrice(amount, sourceCurrency)

  // 2. Format the output
  const formattedPrice = new Intl.NumberFormat(currency === 'LRD' ? 'en-LR' : 'en-US', {
    style: 'currency',
    currency: currency,
    // UPDATED: Enforce 0 decimal places for BOTH currencies
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value / 100)

  return (
    <span className={className}>
      {formattedPrice} {currency}
    </span>
  )
}