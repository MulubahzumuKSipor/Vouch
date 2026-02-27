'use client'

import { useState } from 'react'
import { Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { requestPayout } from '@/lib/payout' // Ensure this path matches your server action file
import styles from '@/styles/payouts.module.css'

interface PayoutFormProps {
  maxAmount: number
  savedNumber: string
  savedMethod: 'mtn_momo' | 'orange_money'
}

export default function PayoutForm({ maxAmount, savedNumber, savedMethod }: PayoutFormProps) {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')

  // We use the props directly since they are read-only
  const number = savedNumber
  const method = savedMethod

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Convert to cents
    const cents = Math.round(parseFloat(amount) * 100)
    
    const result = await requestPayout(cents, method, number)
    
    setLoading(false)
    if (result.error) {
      alert(result.error)
    } else {
      alert('Payout requested! You will receive funds within 24 hours.')
      setAmount('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.payoutForm}>
      <div className={styles.inputGroup}>
        <label>Amount (USD)</label>
        <div className={styles.amountInputWrap}>
          <span>$</span>
          <input 
            type="number" 
            placeholder="0.00" 
            max={maxAmount / 100}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.inputGroup}>
          <label>Provider</label>
          {/* Read-only Display for Provider */}
          <input
            type="text"
            value={method === 'mtn_momo' ? 'MTN MoMo' : 'Orange Money'}
            disabled
            className={styles.readOnlyInput}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Number</label>
          {/* Read-only Display for Number */}
          <input 
            type="tel" 
            value={number}
            disabled
            className={styles.readOnlyInput}
          />
          {/* Link to Change Settings */}
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', textAlign: 'right' }}>
            <Link href="/dashboard/settings" style={{ color: '#D97706', fontWeight: 600, textDecoration: 'none' }}>
              Change in Settings →
            </Link>
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading || !amount || parseFloat(amount) <= 0}
        className={styles.cashOutBtn}
      >
        {loading ? <Loader2 className={styles.spin} /> : 'Cash Out'} <ArrowRight size={18} />
      </button>
      
      <p className={styles.note}>Min: $5.00. Fee: 3% + standard carrier fees.</p>
    </form>
  )
}