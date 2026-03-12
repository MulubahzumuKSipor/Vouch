import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Smartphone, History, AlertCircle, CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import styles from '@/styles/payouts.module.css'
import DashboardLayout from '@/components/dashboardLayout'
import PayoutForm from '@/components/PayoutForm'

// --- INTERFACES ---
interface PaymentDetails {
  number?: string
  method?: 'mtn_momo' | 'orange_money'
}

interface PayoutRecord {
  id: string
  created_at: string
  payment_method: string
  amount: number
  status: string
  currency: 'USD' | 'LRD'
}

// 🔴 FIXED: Helper now dynamically formats based on the specific currency passed to it
const money = (amount: number, currency: 'USD' | 'LRD' | string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount / 100)

export default async function PayoutsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Fetch Orders to calculate total earnings per currency
  const { data: orders } = await supabase
    .from('orders')
    .select('currency, seller_earnings')
    .eq('seller_id', user.id)
    .eq('status', 'completed')

  // 2. Fetch Payouts to calculate withdrawals and render history
  const { data: history } = await supabase
    .from('payouts')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  // 3. Compute accurate separated balances
  const balances = {
    USD: { earnings: 0, withdrawn: 0, pending: 0, available: 0 },
    LRD: { earnings: 0, withdrawn: 0, pending: 0, available: 0 }
  }

  // Tally up earnings
  orders?.forEach(o => {
    const cur = o.currency as 'USD' | 'LRD'
    if (balances[cur]) balances[cur].earnings += (o.seller_earnings || 0)
  })

  // Subtract withdrawals and pending lockups
  history?.forEach(p => {
    const cur = p.currency as 'USD' | 'LRD'
    if (balances[cur]) {
      if (p.status === 'completed') balances[cur].withdrawn += p.amount
      if (p.status === 'pending' || p.status === 'processing') balances[cur].pending += p.amount
    }
  })

  // Final Available Balance calculation
  balances.USD.available = balances.USD.earnings - balances.USD.withdrawn - balances.USD.pending
  balances.LRD.available = balances.LRD.earnings - balances.LRD.withdrawn - balances.LRD.pending

  // 4. Check for saved payment details
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const paymentDetails = profile?.payment_details as PaymentDetails | null
  const savedNumber = paymentDetails?.number
  const savedMethod = paymentDetails?.method || ('mtn_momo' as const)

  return (
    <DashboardLayout isSeller={true} username={profile?.username}>
      <div className={styles.container}>

        <div className={styles.header}>
          <h1 className={styles.title}>Payouts</h1>
          <p className={styles.subtitle}>Manage your earnings and withdraw to Mobile Money.</p>
        </div>

        <div className={styles.balanceCard}>
          {/* LEFT: Balance Info (Now split into USD and LRD Wallets) */}
          <div className={styles.balanceLeft}>
            <span className={styles.balanceLabel}>Available Balances</span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '16px' }}>
              {/* 💵 USD WALLET */}
              <div style={{ paddingBottom: '24px', borderBottom: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 600 }}>USD Wallet</span>
                <h2 className={styles.balanceAmount}>{money(balances.USD.available, 'USD')}</h2>
                <div className={styles.balanceContext}>
                  <span>Earned: {money(balances.USD.earnings, 'USD')}</span>
                  <span className={styles.dot}>•</span>
                  <span>Withdrawn: {money(balances.USD.withdrawn, 'USD')}</span>
                </div>
              </div>

              {/* 💵 LRD WALLET */}
              <div>
                <span style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 600 }}>LRD Wallet</span>
                <h2 className={styles.balanceAmount}>{money(balances.LRD.available, 'LRD')}</h2>
                <div className={styles.balanceContext}>
                  <span>Earned: {money(balances.LRD.earnings, 'LRD')}</span>
                  <span className={styles.dot}>•</span>
                  <span>Withdrawn: {money(balances.LRD.withdrawn, 'LRD')}</span>
                </div>
              </div>
          </div>
          </div>

          {/* RIGHT: Action Area */}
          <div className={styles.balanceRight}>
             {savedNumber ? (
               // A. Form (Now takes both balances so the user can choose which to withdraw)
               <PayoutForm
                 availableUsd={balances.USD.available}
                 availableLrd={balances.LRD.available}
                 savedNumber={savedNumber}
                 savedMethod={savedMethod}
               />
             ) : (
               // B. Prompt to Settings
               <div className={styles.setupCard}>
                 <div className={styles.setupIconWrap}>
                   <Smartphone size={24} />
                 </div>
                 <h3 className={styles.setupTitle}>Connect Mobile Money</h3>
                 <p className={styles.setupText}>
                   To protect your funds, you must save a verified Mobile Money number before withdrawing.
                 </p>
                 <Link href="/dashboard/settings" className={styles.setupBtn}>
                   Go to Settings <ArrowRight size={16} />
                 </Link>
               </div>
             )}
          </div>
        </div>

        {/* History Table */}
        <div className={styles.historySection}>
          <h3 className={styles.sectionTitle}>
            <History size={20} /> Transaction History
          </h3>
          <div className={styles.tableCard}>
            {history && history.length > 0 ? (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(history as unknown as PayoutRecord[]).map((payout) => (
                    <tr key={payout.id}>
                      <td>{new Date(payout.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className={styles.methodBadge}>
                          <Smartphone size={14} />
                          {payout.payment_method === 'mtn_momo' ? 'MTN MoMo' : 'Orange Money'}
                        </div>
                      </td>
                      {/* 🔴 Format the amount to the specific currency of this payout */}
                      <td className={styles.amountCell}>
                        {money(payout.amount, payout.currency || 'USD')}
                      </td>
                      <td><StatusBadge status={payout.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className={styles.emptyState}>
                <p>No payout history yet.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'completed') return <span className={`${styles.badge} ${styles.success}`}><CheckCircle2 size={12}/> Paid</span>
  if (status === 'pending' || status === 'processing') return <span className={`${styles.badge} ${styles.pending}`}><Clock size={12}/> Pending</span>
  return <span className={`${styles.badge} ${styles.failed}`}><AlertCircle size={12}/> Failed</span>
}