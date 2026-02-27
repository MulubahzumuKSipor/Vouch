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
      aria-label="Toggle Currency"
    >
      <span className={styles.currencyCode}>{preferredCurrency}</span>
      <ArrowLeftRight size={14} className={styles.toggleIcon} />
      <span className={styles.exchangeRate}>
        Rate: {Math.round(exchangeRate)}
      </span>
    </button>
  )
}