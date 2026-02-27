import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Smartphone, History, AlertCircle, CheckCircle2, Clock, ArrowRight } from 'lucide-react'
import styles from '@/styles/payouts.module.css'
import DashboardLayout from '@/components/dashboardLayout'
import PayoutForm from '@/components/PayoutForm'
import { getPayoutStats } from '@/lib/payout'

// --- INTERFACES ---
// 🔴 FIXED: Restrict 'method' from a generic string to the exact allowed literal types
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
}

// Helper to format currency
const money = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100)

export default async function PayoutsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 1. Fetch Data
  const stats = await getPayoutStats()

  const { data: history } = await supabase
    .from('payouts')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 2. Check for saved payment details
  const paymentDetails = profile?.payment_details as PaymentDetails | null
  const savedNumber = paymentDetails?.number
  // 🔴 FIXED: Tell TypeScript this fallback strictly matches the literal type
  const savedMethod = paymentDetails?.method || ('mtn_momo' as const)

  return (
    <DashboardLayout isSeller={true} username={profile?.username}>
      <div className={styles.container}>

        <div className={styles.header}>
          <h1 className={styles.title}>Payouts</h1>
          <p className={styles.subtitle}>Manage your earnings and withdraw to Mobile Money.</p>
        </div>

        <div className={styles.balanceCard}>
          {/* LEFT: Balance Info */}
          <div className={styles.balanceLeft}>
            <span className={styles.balanceLabel}>Available Balance</span>
            <h2 className={styles.balanceAmount}>{money(stats?.availableBalance || 0)}</h2>
            <div className={styles.balanceContext}>
              <span>Total Earnings: {money(stats?.totalEarnings || 0)}</span>
              <span className={styles.dot}>•</span>
              <span>Paid Out: {money(stats?.totalWithdrawn || 0)}</span>
            </div>
          </div>

          {/* RIGHT: Action Area */}
          <div className={styles.balanceRight}>
             {savedNumber ? (
               // A. If number exists, show the Form
               <PayoutForm
                 maxAmount={stats?.availableBalance || 0}
                 savedNumber={savedNumber}
                 savedMethod={savedMethod}
               />
             ) : (
               // B. If NO number, prompt to Settings
               <div className={styles.setupCard}>
                 <div className={styles.setupIconWrap}>
                   <Smartphone size={24} />
                 </div>
                 <h3 className={styles.setupTitle}>Connect Mobile Money</h3>
                 <p className={styles.setupText}>
                   To protect your funds, you must save a verified Mobile Money number in your settings before withdrawing.
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
                  {/* Applied the strictly typed interface here */}
                  {(history as PayoutRecord[]).map((payout) => (
                    <tr key={payout.id}>
                      <td>{new Date(payout.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className={styles.methodBadge}>
                          <Smartphone size={14} />
                          {payout.payment_method === 'mtn_momo' ? 'MTN MoMo' : 'Orange Money'}
                        </div>
                      </td>
                      <td className={styles.amountCell}>{money(payout.amount)}</td>
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
  if (status === 'pending') return <span className={`${styles.badge} ${styles.pending}`}><Clock size={12}/> Pending</span>
  return <span className={`${styles.badge} ${styles.failed}`}><AlertCircle size={12}/> Failed</span>
}