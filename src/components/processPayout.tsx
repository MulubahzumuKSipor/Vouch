'use client'

import { useState } from 'react'
// 🔴 Make sure these imports match where you saved your server actions!
import { processAutomatedPayout, markPayoutCompleted } from '@/lib/admin'
import { CheckCircle2, Loader2, AlertCircle, Send, Keyboard } from 'lucide-react'
import styles from '@/styles/adminPayouts.module.css'

export default function ProcessButton({ payoutId }: { payoutId: string }) {
  const [mode, setMode] = useState<'api' | 'manual'>('api')
  const [refId, setRefId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // --- ACTION 1: The Automated API ---
  const handleApiProcess = async () => {
    if (!window.confirm("Trigger automated API transfer? Real funds will be moved.")) {
      return
    }

    setError('')
    setLoading(true)

    const result = await processAutomatedPayout(payoutId)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // On success, Next.js revalidates the page and this row disappears automatically!
  }

  // --- ACTION 2: The Manual Override ---
  const handleManualProcess = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await markPayoutCompleted(payoutId, refId)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      
      {/* ── API MODE (DEFAULT) ── */}
      {mode === 'api' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleApiProcess}
            disabled={loading}
            className={styles.approveBtn}
            style={{ backgroundColor: '#111827' }} // Black for API
          >
            {loading ? <Loader2 size={16} className={styles.spin} /> : <Send size={16} />}
            <span>{loading ? 'Processing...' : 'Send via API'}</span>
          </button>

          {/* Toggle to Manual Mode */}
          <button
            onClick={() => setMode('manual')}
            disabled={loading}
            title="Manual Override"
            style={{
              background: 'none', border: '1px solid #E5E7EB', borderRadius: '4px',
              padding: '6px', cursor: 'pointer', color: '#6B7280', display: 'flex'
            }}
          >
            <Keyboard size={16} />
          </button>
        </div>
      )}

      {/* ── MANUAL MODE (FALLBACK) ── */}
      {mode === 'manual' && (
        <form onSubmit={handleManualProcess} className={styles.approveForm}>
          <input
            type="text"
            placeholder="Ref: MTN-123"
            value={refId}
            onChange={(e) => setRefId(e.target.value)}
            className={styles.refInput}
            required
            disabled={loading}
          />
          <button type="submit" disabled={loading || !refId} className={styles.approveBtn}>
            {loading ? <Loader2 size={16} className={styles.spin} /> : <CheckCircle2 size={16} />}
            <span>Save</span>
          </button>

          {/* Cancel back to API mode */}
          <button
            type="button"
            onClick={() => { setMode('api'); setError(''); }}
            disabled={loading}
            style={{ background: 'none', border: 'none', fontSize: '0.8rem', cursor: 'pointer', color: '#6B7280', textDecoration: 'underline' }}
          >
            Cancel
          </button>
        </form>
      )}

      {/* Error Message Display */}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#DC2626', fontSize: '0.8rem', marginTop: '4px' }}>
          <AlertCircle size={14} /> <span>{error}</span>
        </div>
      )}

    </div>
  )
}