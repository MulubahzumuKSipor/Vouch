'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Download, 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  User,
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

// 🔴 FIXED: Updated the interface to accept the 'null' values Supabase might return
interface Order {
  id: string
  order_number: string
  status: string
  amount_paid: number
  seller_earnings: number
  currency: string
  created_at: string
  product_title: string
  // Account for Postgres joins potentially returning null or nullable columns
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

  // Toggle between Sales and Purchases
  const toggleView = (newView: string) => {
    router.push(`/dashboard/orders?view=${newView}`)
  }

  // Filter Logic
  const filteredOrders = initialOrders.filter(order => {
    const matchesSearch = 
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.profiles?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' ? true : order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {view === 'sales' ? 'Orders Received' : 'Purchase History'}
          </h1>
          <p className={styles.subtitle}>
            {view === 'sales' 
              ? 'Manage your sales and track earnings.' 
              : 'View your past purchases and receipts.'}
          </p>
        </div>
        {view === 'sales' && (
          <button className={styles.exportBtn}>
            <Download size={18} />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {/* View Switcher (Only for Sellers) */}
      {isSeller && (
        <div className={styles.viewToggle}>
          <button 
            onClick={() => toggleView('sales')}
            className={`${styles.toggleBtn} ${view === 'sales' ? styles.activeToggle : ''}`}
          >
            <TrendingUp size={16} />
            Sales
          </button>
          <button 
            onClick={() => toggleView('purchases')}
            className={`${styles.toggleBtn} ${view === 'purchases' ? styles.activeToggle : ''}`}
          >
            <ShoppingBag size={16} />
            Purchases
          </button>
        </div>
      )}

      {/* Filters & Search */}
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

      {/* Orders Table/List */}
      <div className={styles.list}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.orderMeta}>
                  <span className={styles.orderNumber}>#{order.order_number}</span>
                  <span className={styles.dot}>•</span>
                  <span className={styles.date}>{formatDate(order.created_at)}</span>
                </div>
                <span className={`${styles.statusBadge} ${styles[order.status]}`}>
                  {order.status}
                </span>
              </div>

              <div className={styles.cardBody}>
                {/* Product Info */}
                <div className={styles.productInfo}>
                  <div className={styles.iconBox}>
                    <Package size={20} />
                  </div>
                  <div>
                    <h3 className={styles.productTitle}>{order.product_title}</h3>
                    <p className={styles.amount}>
                      {view === 'sales' 
                        ? `You earned: ${formatCurrency(order.seller_earnings, order.currency)}`
                        : `Total: ${formatCurrency(order.amount_paid, order.currency)}`
                      }
                    </p>
                  </div>
                </div>

                {/* Counterparty Info */}
                <div className={styles.counterparty}>
                  <div className={styles.userRow}>
                    <User size={14} className={styles.userIcon} />
                    <span>
                      {view === 'sales' ? 'Buyer: ' : 'Seller: '}
                      <span className={styles.userName}>
                        {order.profiles?.full_name || 'Unknown User'}
                      </span>
                    </span>
                  </div>
                  {view === 'sales' && order.profiles?.email && (
                    <div className={styles.emailRow}>{order.profiles.email}</div>
                  )}
                </div>
              </div>

              <div className={styles.cardFooter}>
                <Link 
                  href={`/dashboard/orders/${order.id}`}
                  className={styles.detailsLink}
                >
                  View Details
                </Link>
                {view === 'purchases' && order.status === 'completed' && (
                  <Link href={`/dashboard/library`} className={styles.actionLink}>
                    View Content
                  </Link>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <ShoppingBag size={48} className={styles.emptyIcon} />
            <h3>No orders found</h3>
            <p>
              {searchQuery 
                ? `No results for "${searchQuery}"` 
                : view === 'sales' 
                  ? "Share your products to get your first sale!" 
                  : "Explore the marketplace to make your first purchase."}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}