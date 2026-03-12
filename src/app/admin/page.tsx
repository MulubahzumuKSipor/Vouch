import { createClient } from '@/lib/server'
import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react'
import styles from '@/styles/adminDashboard.module.css'

// Force Next.js to NEVER cache this page. We want live data every time you refresh.
export const dynamic = 'force-dynamic'

// Helper to format cents into beautiful dollar strings
const formatMoney = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100)
}

export default async function AdminDashboard() {
  const supabase = await createClient()

  // 1. Fetch all required data simultaneously for maximum speed
  const [
    { data: orders, error: ordersError },
    { count: creatorCount, error: creatorsError },
    { count: pendingPayoutsCount, error: payoutsError }
  ] = await Promise.all([
    // Fetch completed orders to calculate GMV and Revenue
    supabase
      .from('orders')
      .select('seller_earnings')
      .eq('status', 'completed'),

    // Count total signed-up creators
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true }),

    // Count how many people are waiting for their money
    supabase
      .from('payouts')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
  ])

  // 2. Crunch the Numbers
  // Assuming 'seller_earnings' is 90% of the total order.
  // Total GMV = seller_earnings / 0.9. Vouch Cut = GMV - seller_earnings.
  let totalSellerEarningsCents = 0
  if (orders) {
    totalSellerEarningsCents = orders.reduce((sum, order) => sum + (order.seller_earnings || 0), 0)
  }

  const totalGMVCents = Math.round(totalSellerEarningsCents / 0.9) // 100% of the money that moved
  const vouchRevenueCents = totalGMVCents - totalSellerEarningsCents // Your 10% cut!

  // Fallbacks just in case a table is empty or throws an error
  const safeCreatorCount = creatorCount || 0
  const safePendingPayoutsCount = pendingPayoutsCount || 0

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Platform Overview</h1>
        <p className={styles.subtitle}>Welcome to the Vouch Command Center.</p>
      </div>

      <div className={styles.metricsGrid}>
        
        {/* Total GMV */}
        <div className={styles.metricCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Total GMV (Volume)</span>
            <DollarSign size={20} color="#10B981" />
          </div>
          <h2 className={styles.metricValue}>{formatMoney(totalGMVCents)}</h2>
        </div>

        {/* Vouch Revenue */}
        <div className={styles.metricCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Vouch Revenue (10%)</span>
            <TrendingUp size={20} color="#F59E0B" />
          </div>
          <h2 className={styles.metricValue}>{formatMoney(vouchRevenueCents)}</h2>
        </div>

        {/* Active Creators */}
        <div className={styles.metricCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Total Creators</span>
            <Users size={20} color="#3B82F6" />
          </div>
          <h2 className={styles.metricValue}>{safeCreatorCount}</h2>
        </div>

        {/* Pending Payouts */}
        <div className={styles.metricCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Pending Payout Requests</span>
            <Activity size={20} color="#DC2626" />
          </div>
          <h2 className={styles.metricValue}>{safePendingPayoutsCount}</h2>
        </div>

      </div>
    </div>
  )
}