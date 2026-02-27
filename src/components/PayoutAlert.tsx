'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, X, ArrowRight } from 'lucide-react'
import styles from '@/styles/payout.module.css'

// --- INTERFACES ---
export interface AlertProfile {
  is_seller?: boolean | null
  payment_details?: {
    number?: string | null
    method?: string | null
  } | null
}

export default function PayoutAlert({ profile }: { profile: AlertProfile | null }) {
  const [isVisible, setIsVisible] = useState(true)
  
  if (!profile) return null;

  const isSeller = profile.is_seller === true;

  // Now TypeScript knows exactly what shapes to expect inside payment_details
  const hasPaymentDetails = profile.payment_details?.number && profile.payment_details?.method;

  // Don't show if they are not a seller, HAVE details, or dismissed it
  if (!isSeller || hasPaymentDetails || !isVisible) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <AlertTriangle size={24} />
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>
          Action Required: Setup Payouts
        </h3>
        <p className={styles.message}>
          You haven&apos;t added your Mobile Money number yet. We cannot pay you until this is done.
        </p>
        
        <Link href="/dashboard/settings" className={styles.linkButton}>
          Add Mobile Money <ArrowRight size={16} />
        </Link>
      </div>

      <button 
        onClick={() => setIsVisible(false)} 
        className={styles.closeButton}
        aria-label="Dismiss alert"
      >
        <X size={20} />
      </button>
    </div>
  )
}