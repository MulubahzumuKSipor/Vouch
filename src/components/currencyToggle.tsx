'use client'

import { useCurrency } from '@/context/CurrencyContext'
import { ArrowLeftRight } from 'lucide-react'
import styles from '@/styles/explore.module.css'

export default function CurrencyToggle() {
  const { preferredCurrency, toggleCurrency, exchangeRate } = useCurrency()

  return (
    <button 
      onClick={toggleCurrency} 
      className={styles.currencyToggleBtn}
      title={`Exchange Rate: 1 USD = ${exchangeRate} LRD`}
    >
      <span style={{ fontWeight: 800 }}>{preferredCurrency}</span>
      <ArrowLeftRight size={14} />
      <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
        Rate: {Math.round(exchangeRate)}
      </span>
    </button>
  )
}