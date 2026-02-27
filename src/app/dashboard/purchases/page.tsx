import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ShoppingBag,
  Search,
  Package,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import styles from '@/styles/purchases.module.css'
import DashboardLayout from '@/components/dashboardLayout'

// --- INTERFACES ---
interface PurchaseOrder {
  id: string
  order_number: string
  created_at: string
  status: string
  amount_paid: number
  product_title: string
  product_id: string
  products: {
    slug: string
    cover_image: string | null
    product_type: string
  } | null
  profiles: {
    full_name: string | null
    username: string
    is_verified: boolean
  } | null
}

// --- HELPER COMPONENTS (Reused from Dashboard) ---

function ProductImage({ src, alt, size = 48 }: { src?: string | null; alt: string; size?: number }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={styles.itemImg}
        unoptimized={src.includes('.svg') || src.includes('dicebear')}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, background: '#F3F4F6',
      borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <Package size={20} color="#9CA3AF" />
    </div>
  )
}

// --- PAGE COMPONENT ---

export default async function PurchasesPage() {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  // 2. Fetch Orders (Source of Truth)
  // We use the snapshot 'product_title' for accuracy.
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      created_at,
      status,
      amount_paid,
      product_title,
      product_id,
      products (
        slug,
        cover_image,
        product_type
      ),
      profiles!orders_seller_id_fkey (
        full_name,
        username,
        is_verified
      )
    `)
    .eq('buyer_id', user.id)
    .order('created_at', { ascending: false })

  // 3. Calculate Stats
  const totalSpent = orders?.reduce((sum, o) => sum + (o.amount_paid || 0), 0) || 0

  // Formatters
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })
  }

  return (
    <DashboardLayout isSeller={user?.user_metadata?.is_seller || false} username={user?.user_metadata?.full_name}>
    <div className={styles.container}>

      {/* HEADER SECTION */}
      <div className={styles.welcomeHeader} style={{marginBottom: '2rem'}}>
        <div className={styles.welcomeContent}>
          <div>
            <h1 className={styles.welcomeTitle}>Order History</h1>
            <p className={styles.welcomeSubtitle}>
              Total Lifetime Spend: <span style={{color: '#F59E0B', fontWeight: 700}}>{formatCurrency(totalSpent)}</span>
            </p>
          </div>
          {/* Action Button: Browse More */}
          <Link href="/explore" className={styles.newProductBtn}>
            <Search size={18} />
            <span>Browse Store</span>
          </Link>
        </div>
      </div>

      {/* ORDERS LIST */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>All Transactions</h2>
          <span style={{fontSize: '0.9rem', color: '#6B7280'}}>
            {orders?.length || 0} orders
          </span>
        </div>

        {orders && orders.length > 0 ? (
          <div className={styles.listContainer}>
            {/* APPLIED STRICT INTERFACE HERE */}
            {(orders as unknown as PurchaseOrder[]).map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/purchases/${order.id}`}
                className={styles.listItem}
              >
                {/* LEFT: Image & Details */}
                <div className={styles.itemLeft}>
                  <div className={styles.itemImage}>
                    <ProductImage
                      src={order.products?.cover_image}
                      alt={order.product_title}
                    />
                  </div>
                  <div className={styles.itemText}>
                    <p className={styles.itemTitle}>{order.product_title}</p>
                    <p className={styles.itemSub}>
                      {order.profiles?.full_name}
                      {order.profiles?.is_verified && <span style={{color:'#2563EB', marginLeft:'4px'}}>✓</span>}
                      {' · '}
                      <span style={{fontFamily: 'monospace'}}>#{order.order_number.split('-')[1]}</span>
                    </p>
                  </div>
                </div>

                {/* RIGHT: Price & Status */}
                <div className={styles.itemRight}>
                  <div style={{textAlign: 'right'}}>
                    <p className={styles.itemPrice}>{formatCurrency(order.amount_paid)}</p>
                    <p className={styles.itemSub}>{formatDate(order.created_at)}</p>
                  </div>

                  {/* Status Indicator */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: order.status === 'completed' ? '#059669' :
                           order.status === 'pending' ? '#D97706' : '#DC2626',
                    backgroundColor: order.status === 'completed' ? '#ECFDF5' :
                                     order.status === 'pending' ? '#FFFBEB' : '#FEF2F2',
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    marginLeft: '1rem'
                  }}>
                    {order.status === 'completed' && <CheckCircle size={12} />}
                    {order.status === 'pending' && <Clock size={12} />}
                    {order.status === 'failed' && <XCircle size={12} />}
                    {order.status}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className={styles.emptyState}>
            <ShoppingBag className={styles.emptyIcon} />
            <p className={styles.emptyText}>No orders yet</p>
            <Link href="/explore" className={styles.emptyLink}>
              Start Shopping →
            </Link>
          </div>
        )}

        {/* Kente Accent at bottom of card */}
        <div className={styles.kenteAccent} />
      </div>
    </div>
    </DashboardLayout>
  )
}