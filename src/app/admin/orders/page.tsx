import { createClient } from '@/lib/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Search, ShoppingBag, CreditCard, ArrowRightLeft, ExternalLink } from 'lucide-react'
import styles from '@/styles/adminOrders.module.css'

export const dynamic = 'force-dynamic'

// Helper to format money (cents to dollars)
const formatMoney = (cents: number | null) => {
  if (cents == null) return '$0.00'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createClient()
  
  // 1. Check Admin Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'mzksipor@gmail.com') return <div>Unauthorized</div>

  // 2. Setup Master Key Client
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const resolvedParams = await searchParams
  const query = resolvedParams.q || ''

  // 3. Fetch Orders (Joining the profiles table to get the seller's username)
  let dbQuery = supabaseAdmin
    .from('orders')
    .select(`
      *,
      seller:profiles!orders_seller_id_fkey(username)
    `)
    .order('created_at', { ascending: false })

  if (query) {
    const safeQuery = query.replace(/,/g, ' ')
    dbQuery = dbQuery.or(`order_number.ilike.%${safeQuery}%,buyer_email.ilike.%${safeQuery}%,product_title.ilike.%${safeQuery}%`)
  }

  const { data: orders } = await dbQuery

  // Calculate quick metrics for the current view
  const totalVolume = orders?.reduce((sum, o) => sum + (o.amount_paid || 0), 0) || 0
  const totalFees = orders?.reduce((sum, o) => sum + (o.platform_fee || 0), 0) || 0

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Master Ledger</h1>
        <p className={styles.subtitle}>Track every transaction, platform fee, and payout split.</p>
      </div>

      {/* ── METRICS DASHBOARD ── */}
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}><ShoppingBag size={16} /> Total Orders (Shown)</div>
          <div className={styles.metricValue}>{orders?.length || 0}</div>
        </div>
        <div className={styles.metricCard}>
          <div className={styles.metricLabel}><ArrowRightLeft size={16} /> GMV (Volume)</div>
          <div className={styles.metricValue}>{formatMoney(totalVolume)}</div>
        </div>
        <div className={styles.metricCard} style={{ backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' }}>
          <div className={styles.metricLabel} style={{ color: '#166534' }}><CreditCard size={16} /> Vouch Fees Collected</div>
          <div className={styles.metricValue} style={{ color: '#166534' }}>{formatMoney(totalFees)}</div>
        </div>
      </div>

      <div className={styles.toolBar}>
        <form className={styles.searchForm}>
          <Search size={18} color="#6B7280" />
          <input 
            type="text" 
            name="q" 
            placeholder="Search by Order ID, Buyer Email, or Product..." 
            defaultValue={query}
            className={styles.searchInput}
          />
          <button type="submit" style={{display: 'none'}}>Search</button>
        </form>
      </div>

      {/* ── ORDERS TABLE ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order Details</th>
                <th>Product & Creator</th>
                <th>Status</th>
                <th>Financial Split</th>
              </tr>
            </thead>
            <tbody>
              {orders?.map((o) => {
                const sellerData = Array.isArray(o.seller) ? o.seller[0] : o.seller
                
                return (
                  <tr key={o.id}>
                    <td>
                      <div className={styles.orderDetails}>
                        <span className={styles.orderNumber}>{o.order_number}</span>
                        <span className={styles.buyerEmail}>{o.buyer_email}</span>
                        <span className={styles.date}>{new Date(o.created_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td>
                      <div className={styles.productDetails}>
                        <span className={styles.productTitle}>{o.product_title}</span>
                        <span className={styles.sellerName}>by @{sellerData?.username || 'unknown'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[o.status]}`}>
                        {o.status.toUpperCase()}
                      </span>
                      {o.payment_method && (
                        <div className={styles.paymentMethod}>via {o.payment_method}</div>
                      )}
                    </td>
                    <td>
                      <div className={styles.financials}>
                        <div className={styles.financeRow}>
                          <span>Paid:</span> <strong>{formatMoney(o.amount_paid)}</strong>
                        </div>
                        <div className={styles.financeRow}>
                          <span style={{ color: '#DC2626' }}>Fee:</span> <span style={{ color: '#DC2626' }}>-{formatMoney(o.platform_fee)}</span>
                        </div>
                        <div className={styles.divider}></div>
                        <div className={styles.financeRow}>
                          <span style={{ color: '#059669' }}>Creator:</span> <strong style={{ color: '#059669' }}>{formatMoney(o.seller_earnings)}</strong>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    {query ? `No orders found matching "${query}"` : 'No orders have been placed yet.'}
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