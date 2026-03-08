'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Download, 
  ShoppingBag, 
  Package, 
  User,
  ArrowRight
} from 'lucide-react'
import styles from '@/styles/orders.module.css'

// Helper for currency formatting
const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 2
  }).format(amount / 100)
}

// Helper for date formatting
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

interface Order {
  id: string
  order_number: string
  status: string
  amount_paid: number
  seller_earnings: number
  currency: string
  created_at: string
  product_title: string
  profiles?: {
    full_name: string | null;
    email?: string | null;
    avatar_url?: string | null;
    username?: string | null;
  } | null
  products?: {
    cover_image: string | null;
    product_type: string | null;
  } | null
}

interface OrdersListProps {
  initialOrders: Order[]
  view: 'sales' | 'purchases'
  isSeller: boolean
}

export default function OrdersList({ initialOrders, view, isSeller }: OrdersListProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const toggleView = (newView: string) => {
    router.push(`/dashboard/orders?view=${newView}`)
  }

  const filteredOrders = initialOrders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' ? true : order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className={styles.appWrapper}>

      {/* ── HEADER ── */}
      <div className={styles.headerSection}>
        <div className={styles.container}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className={styles.pageTitle}>
                {view === 'sales' ? 'Orders Received' : 'Purchase History'}
              </h1>
              <p className={styles.pageSubtitle}>
                {view === 'sales'
                  ? 'Manage your sales and track earnings.'
                  : 'View your past purchases and receipts.'}
              </p>
            </div>

            {view === 'sales' && (
              <button className={styles.secondaryBtn}>
                <Download size={18} />
                Export CSV
              </button>
            )}
          </div>

          {/* Minimal Tabs (Matching Library & Assets styling) */}
          {isSeller && (
            <div className={styles.tabsContainer}>
              <button
                onClick={() => toggleView('sales')}
                className={`${styles.tab} ${view === 'sales' ? styles.tabActive : ''}`}
              >
                Sales
              </button>
              <button
                onClick={() => toggleView('purchases')}
                className={`${styles.tab} ${view === 'purchases' ? styles.tabActive : ''}`}
              >
                Purchases
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.container}>
        {/* ── FILTERS & SEARCH ── */}
        <div className={styles.controls}>
          <div className={styles.searchWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search order #, product, or name..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.filterWrap}>
            <Filter size={16} className={styles.filterIcon} />
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        {/* ── CONTENT GRID ── */}
        {filteredOrders.length > 0 ? (
          <div className={styles.grid}>
            {filteredOrders.map((order) => (
              <div key={order.id} className={styles.card}>

                {/* Card Header: Meta & Status */}
                <div className={styles.cardHeader}>
                  <div className={styles.orderMeta}>
                    <span className={styles.orderNumber}>#{order.order_number}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.date}>{formatDate(order.created_at)}</span>
                  </div>
                  <span className={`${styles.statusBadge} ${styles[order.status.toLowerCase()] || styles.defaultStatus}`}>
                    {order.status}
                  </span>
                </div>

                {/* Card Body: Product & User */}
                <div className={styles.cardBody}>
                  <div className={styles.productInfo}>
                    <div className={styles.iconBox}>
                      <Package size={20} />
                    </div>
                    <div>
                      <h3 className={styles.productTitle}>{order.product_title}</h3>
                      <p className={styles.amount}>
                        {view === 'sales'
                          ? `Earnings: ${formatCurrency(order.seller_earnings, order.currency)}`
                          : `Total: ${formatCurrency(order.amount_paid, order.currency)}`
                        }
                      </p>
                    </div>
                  </div>

                  <div className={styles.counterparty}>
                    <div className={styles.userRow}>
                      <User size={14} className={styles.userIcon} />
                      <span className={styles.userLabel}>
                        {view === 'sales' ? 'Buyer:' : 'Seller:'}
                        <span className={styles.userName}>
                          {order.profiles?.full_name || 'Guest User'}
                        </span>
                      </span>
                    </div>
                    {view === 'sales' && order.profiles?.email && (
                      <div className={styles.emailRow}>{order.profiles.email}</div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Action Links */}
                <div className={styles.cardFooter}>
                  <Link href={`/dashboard/orders/${order.id}`} className={styles.actionText}>
                    View Details
                  </Link>

                  {view === 'purchases' && order.status === 'completed' ? (
                    <Link href={`/dashboard/library`} className={styles.actionLink}>
                      Go to Library <ArrowRight size={16} />
                    </Link>
                  ) : (
                    <ArrowRight size={16} className={styles.actionIcon} />
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── EMPTY STATE ── */
          <div className={styles.emptyState}>
            <div className={styles.emptyIconCircle}>
              <ShoppingBag size={32} />
            </div>
            <h3 className={styles.emptyTitle}>No orders found</h3>
            <p className={styles.emptyDesc}>
              {searchQuery 
                ? `We couldn't find any orders matching "${searchQuery}".`
                : view === 'sales' 
                  ? "Share your products to get your first sale!" 
                  : "Explore the marketplace to make your first purchase."}
            </p>
            {!searchQuery && view === 'purchases' && (
              <Link href="/explore" className={styles.primaryBtn}>
                Explore Marketplace
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}