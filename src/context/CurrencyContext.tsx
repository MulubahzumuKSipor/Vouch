'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type Currency = 'USD' | 'LRD'

interface CurrencyContextType {
  preferredCurrency: Currency
  exchangeRate: number
  toggleCurrency: () => void
  convertPrice: (amountInCents: number, sourceCurrency: string) => { value: number; currency: Currency }
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ 
  children, 
  initialRate 
}: { 
  children: ReactNode, 
  initialRate: number 
}) {
  // This is the currency the USER wants to see (The "Target")
  const [preferredCurrency, setPreferredCurrency] = useState<Currency>('USD')
  
  // The rate passed from the server (e.g., 198.5)
  const [exchangeRate] = useState(initialRate)

  const toggleCurrency = () => {
    setPreferredCurrency((prev) => (prev === 'USD' ? 'LRD' : 'USD'))
  }

  const convertPrice = (amountInCents: number, dbCurrency: string): { value: number; currency: Currency } => {
    // 1. Normalize the Source Currency (from Database)
    // If DB says null/undefined, assume USD.
    const source = (dbCurrency || 'USD').toUpperCase() as Currency

    // 2. Identify the Target Currency (User Preference)
    const target = preferredCurrency

    // --- CASE A: MATCH (No Conversion Needed) ---
    // If Product is USD and User wants USD -> Return original
    // If Product is LRD and User wants LRD -> Return original
    if (source === target) {
      return {
        value: amountInCents,
        currency: source
      }
    }

    // --- CASE B: MISMATCH (Conversion Needed) ---

    // Scenario 1: Product is USD, User wants LRD
    // Logic: Multiply by Rate
    if (source === 'USD' && target === 'LRD') {
      return {
        value: amountInCents * exchangeRate,
        currency: 'LRD'
      }
    }

    // Scenario 2: Product is LRD, User wants USD
    // Logic: Divide by Rate
    if (source === 'LRD' && target === 'USD') {
      return {
        value: amountInCents / exchangeRate,
        currency: 'USD'
      }
    }

    // Fallback (Should never reach here if types are correct)
    return { value: amountInCents, currency: source }
  }

  return (
    <CurrencyContext.Provider value={{ preferredCurrency, exchangeRate, toggleCurrency, convertPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}