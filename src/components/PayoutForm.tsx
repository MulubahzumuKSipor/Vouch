'use client'

import { useState } from 'react'
import { Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { requestPayout } from '@/lib/payout' // You will need to update this server action to accept currency!
import styles from '@/styles/payouts.module.css'

interface PayoutFormProps {
  availableUsd: number
  availableLrd: number
  savedNumber: string
  savedMethod: 'mtn_momo' | 'orange_money'
}

// Quick helper to format the dropdown labels
const formatMoney = (amount: number, currency: 'USD' | 'LRD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)

export default function PayoutForm({ availableUsd, availableLrd, savedNumber, savedMethod }: PayoutFormProps) {
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState('')
  const [wallet, setWallet] = useState<'USD' | 'LRD'>('USD')

  const number = savedNumber
  const method = savedMethod

  // Determine the dynamic max amount and symbol based on selected wallet
  const maxAmount = wallet === 'USD' ? availableUsd : availableLrd
  const currencySymbol = wallet === 'USD' ? '$' : 'L$'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Convert to cents
    const cents = Math.round(parseFloat(amount) * 100)
    
    // 🔴 Ensure your requestPayout function is updated to accept the 'wallet' currency!
    const result = await requestPayout(cents, method, number, wallet)
    
    setLoading(false)
    if (result.error) {
      alert(result.error)
    } else {
      alert(`Payout requested! Your ${wallet} funds will be processed within 24 hours.`)
      setAmount('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.payoutForm}>

      {/* 🔴 NEW: Wallet Selection Dropdown */}
      <div className={styles.inputGroup} style={{ marginBottom: '16px' }}>
        <label>Select Wallet</label>
        <select
          value={wallet}
          onChange={(e) => {
            setWallet(e.target.value as 'USD' | 'LRD')
            setAmount('') // Clear amount when switching wallets to prevent over-withdrawing
          }}
          className={styles.readOnlyInput}
          style={{ cursor: 'pointer', backgroundColor: 'white' }}
        >
          <option value="USD">USD Wallet (Available: {formatMoney(availableUsd, 'USD')})</option>
          <option value="LRD">LRD Wallet (Available: {formatMoney(availableLrd, 'LRD')})</option>
        </select>
      </div>

      <div className={styles.inputGroup}>
        <label>Amount to Withdraw ({wallet})</label>
        <div className={styles.amountInputWrap}>
          <span>{currencySymbol}</span>
          <input 
            type="number" 
            placeholder="0.00" 
            max={maxAmount / 100}
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.inputGroup}>
          <label>Provider</label>
          <input
            type="text"
            value={method === 'mtn_momo' ? 'MTN MoMo' : 'Orange Money'}
            disabled
            className={styles.readOnlyInput}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Number</label>
          <input 
            type="tel" 
            value={number}
            disabled
            className={styles.readOnlyInput}
          />
          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', textAlign: 'right' }}>
            <Link href="/dashboard/settings" style={{ color: '#D97706', fontWeight: 600, textDecoration: 'none' }}>
              Change in Settings →
            </Link>
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={loading || !amount || parseFloat(amount) <= 0 || (parseFloat(amount) * 100) > maxAmount}
        className={styles.cashOutBtn}
      >
        {loading ? <Loader2 className={styles.spin} /> : 'Cash Out'} <ArrowRight size={18} />
      </button>
      
      <p className={styles.note}>
        Min: {wallet === 'USD' ? '$5.00' : 'L$500.00'}. Fee: 3% + standard carrier fees.
      </p>
    </form>
  )
}