import { createClient } from '@/lib/server'
import { Smartphone, Clock, History } from 'lucide-react'
// 🔴 Changed from ApproveForm to your new ProcessButton
import ProcessButton from '@/components/processPayout'
import styles from '@/styles/adminPayouts.module.css'

export const dynamic = 'force-dynamic'

const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)

export default async function AdminPayoutsPage() {
  const supabase = await createClient()

  // Fetch pending payouts WITH the creator's profile info attached
  const { data: pendingPayouts } = await supabase
    .from('payouts')
    .select(`
      *,
      profiles:seller_id (username, email, full_name)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true }) // Oldest first! Pay the people who have waited longest.

  // Fetch recently completed payouts for the history log
  const { data: completedPayouts } = await supabase
    .from('payouts')
    .select(`
      *,
      profiles:seller_id (username)
    `)
    .eq('status', 'completed')
    .order('processed_at', { ascending: false })
    .limit(10)

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Payout Queue</h1>
        <p className={styles.subtitle}>Process withdrawals and log Mobile Money transactions.</p>
      </div>

      {/* ── PENDING PAYOUTS (ACTION REQUIRED) ── */}
      <div className={styles.sectionCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <Clock size={18} className={styles.iconPending} /> Action Required
          </h2>
          <span className={styles.countBadge}>{pendingPayouts?.length || 0}</span>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Creator</th>
                <th>Amount</th>
                <th>Destination</th>
                {/* 🔴 Changed Header Title */}
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingPayouts && pendingPayouts.length > 0 ? (
                pendingPayouts.map((p) => {
                  const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
                  const dest = p.payment_destination as { number: string, name?: string }

                  return (
                    <tr key={p.id}>
                      <td>
                        <div className={styles.creatorInfo}>
                          <span className={styles.creatorName}>{profile?.full_name || 'Unknown'}</span>
                          <span className={styles.creatorEmail}>{profile?.email}</span>
                        </div>
                      </td>
                      <td className={styles.amountCell}>{money(p.amount)}</td>
                      <td>
                        <div className={styles.destinationBadge}>
                          <Smartphone size={14} />
                          <span>{p.payment_method === 'mtn_momo' ? 'MTN' : 'Orange'}</span>
                          <strong>{dest?.number}</strong>
                        </div>
                      </td>
                      <td>
                        {/* 🔴 Swapped in the new automated button */}
                        <ProcessButton payoutId={p.id} />
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    No pending payouts. You are all caught up!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── RECENTLY COMPLETED ── */}
      <div className={styles.sectionCard} style={{ marginTop: '32px' }}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            <History size={18} /> Recent History
          </h2>
        </div>
        
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Creator</th>
                <th>Amount</th>
                <th>Ref ID</th>
              </tr>
            </thead>
           <tbody>
              {completedPayouts && completedPayouts.length > 0 ? (
                completedPayouts.map((p) => {
                  const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
                  return (
                    <tr key={p.id}>
                      <td style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                        {new Date(p.processed_at || p.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ fontWeight: 500 }}>@{profile?.username}</td>
                      <td style={{ color: '#111827', fontWeight: 600 }}>{money(p.amount)}</td>
                      <td><span className={styles.refBadge}>{p.transaction_reference}</span></td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    No recent payout history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}