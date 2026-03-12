'use client'

import { toggleUserVerification, toggleUserSuspension } from '@/lib/admin'
import { useState } from 'react'
import { ShieldCheck, ShieldAlert, Ban, CheckCircle2 } from 'lucide-react'
import styles from '@/styles/adminUsers.module.css'

interface UserActionsProps {
  userId: string
  isVerified: boolean
  isSuspended: boolean
}

export default function UserActions({ userId, isVerified, isSuspended }: UserActionsProps) {
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    setLoading(true)
    await toggleUserVerification(userId, isVerified)
    setLoading(false)
  }

  const handleSuspend = async () => {
    const msg = isSuspended
      ? "Reactivate this account? They will regain access to Vouch."
      : "Suspend this creator? They will immediately lose access to their dashboard."

    if (!window.confirm(msg)) return

    setLoading(true)
    await toggleUserSuspension(userId, isSuspended)
    setLoading(false)
  }

  return (
    <div className={styles.actionGroup}>
      <button
        onClick={handleVerify}
        disabled={loading}
        className={styles.verifyBtn}
        title={isVerified ? "Remove Verification" : "Verify Creator"}
      >
        {isVerified ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
        <span>{isVerified ? 'Unverify' : 'Verify'}</span>
      </button>

      <button
        onClick={handleSuspend}
        disabled={loading}
        className={isSuspended ? styles.activateBtn : styles.suspendBtn}
      >
        {isSuspended ? <CheckCircle2 size={16} /> : <Ban size={16} />}
        <span>{isSuspended ? 'Reactivate' : 'Suspend'}</span>
      </button>
    </div>
  )
}