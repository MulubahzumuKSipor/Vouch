import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Calendar, BookOpen, ShoppingBag, Video, FileText,
  TrendingUp, Users, DollarSign, Eye, Package,
  ChevronRight, Plus
} from 'lucide-react'
import styles from '@/styles/dashboard.module.css'
import PayoutAlert from '@/components/PayoutAlert'
import DashboardLayout from '@/components/dashboardLayout'

// --- INTERFACES ---
interface TopProduct {
  id: string
  title: string
  slug: string
  price_amount: number
  price_currency: string
  cover_image: string | null
  sales_count: number
  rating_average: number
}

interface RecentSale {
  id: string
  order_number: string
  product_title: string
  seller_earnings: number
  status: string
  created_at: string
  buyer_email: string
  profiles: {
    full_name: string | null
    avatar_url: string | null
  } | null
}

interface Purchase {
  id: string
  order_number: string
  product_title: string
  amount_paid: number
  status: string
  created_at: string
  products: {
    id: string
    slug: string
    cover_image: string | null
    price_currency: string
  } | null
  profiles: {
    username: string
    full_name: string | null
  } | null
}

interface RecommendedProduct {
  id: string
  title: string
  slug: string
  price_amount: number
  price_currency: string
  cover_image: string | null
  product_type: string
  rating_average: number
  profiles: {
    username: string
    full_name: string | null
    avatar_url: string | null
    is_verified: boolean
  } | null
}

// Helper component for avatars
function Avatar({ src, alt, size = 40, fallback }: { src?: string | null; alt: string; size?: number; fallback: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} width={size} height={size} className={styles.avatarImg} />
    )
  }
  return <div className={styles.avatarFallback} style={{ width: size, height: size }}>{fallback}</div>
}

// Helper component for product images
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
  return <div className={styles.itemImgFallback} style={{ width: size, height: size }}><Package size={20} /></div>
}

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  // 2. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 3. Initialize seller data
  let sellerStats = { totalRevenue: 0, totalSales: 0, totalViews: 0, followerCount: 0 }
  let topProducts: TopProduct[] = []
  let recentSales: RecentSale[] = []

  // 4. Fetch seller-specific data
  if (profile?.is_seller) {
    const { data: revenueData } = await supabase
      .from('orders')
      .select('seller_earnings')
      .eq('seller_id', user.id)
      .eq('status', 'completed')

    const totalRevenue = revenueData?.reduce((sum, order) => sum + (order.seller_earnings || 0), 0) || 0

    const { data: productsData } = await supabase
      .from('products')
      .select('view_count, sales_count')
      .eq('seller_id', user.id)
      .eq('is_archived', false)

    const totalViews = productsData?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0
    const totalSales = productsData?.reduce((sum, p) => sum + (p.sales_count || 0), 0) || 0

    sellerStats = { totalRevenue, totalSales, totalViews, followerCount: profile?.follower_count || 0 }

    const { data: products } = await supabase
      .from('products')
      .select('id, title, slug, price_amount, price_currency, cover_image, sales_count, rating_average')
      .eq('seller_id', user.id)
      .eq('is_archived', false)
      .eq('is_published', true)
      .order('sales_count', { ascending: false })
      .limit(3)
    topProducts = products as TopProduct[] || []

    const { data: orders } = await supabase
      .from('orders')
      .select(`id, order_number, product_title, seller_earnings, status, created_at, buyer_email, profiles!orders_buyer_id_fkey(full_name, avatar_url)`)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
    recentSales = orders as unknown as RecentSale[] || []
  }

  // 5. Fetch buyer purchases
  const { data: purchases } = await supabase
    .from('orders')
    .select(`id, order_number, product_title, amount_paid, status, created_at, products(id, slug, cover_image, price_currency), profiles!orders_seller_id_fkey(username, full_name)`)
    .eq('buyer_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(5)

  // 6. Fetch recommended products
  const { data: recommended } = await supabase
    .from('products')
    .select(`id, title, slug, price_amount, price_currency, cover_image, product_type, rating_average, profiles(username, full_name, avatar_url, is_verified)`)
    .eq('is_published', true)
    .eq('is_archived', false)
    .neq('seller_id', user.id)
    .order('sales_count', { ascending: false })
    .limit(3)

  // 7. Quick Actions (UPDATED TO USE ?new=true)
  const quickActions = profile?.is_seller
    ? [
        { name: 'New Service', href: '/dashboard/products?new=true', icon: Calendar },
        { name: 'New Course', href: '/dashboard/products?new=true', icon: Video },
        { name: 'New Asset', href: '/dashboard/products?new=true', icon: FileText },
        { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
      ]
    : [
        { name: 'Browse Courses', href: '/explore?type=course', icon: Video },
        { name: 'Book Service', href: '/explore?type=service', icon: Calendar },
        { name: 'My Library', href: '/dashboard/library', icon: BookOpen },
        { name: 'Community', href: '/community', icon: Users },
      ]

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat(currency === 'LRD' ? 'en-LR' : 'en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: currency === 'LRD' ? 0 : 2
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const diffDays = Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <DashboardLayout isSeller={profile?.is_seller || false} username={profile?.username}>
      <div className={styles.appWrapper}>

        {/* ── PREMIUM DARK HERO BANNER ── */}
        <div className={styles.dashboardHero}>
          <div className={styles.heroSubtlePattern} aria-hidden="true" />
          <div className={styles.container}>
            {/* 🔴 FIXED: Added 'as any' Type Assertion to bypass Supabase JSON restriction */}
            <PayoutAlert profile={profile as any} />

            <div className={styles.heroContent}>
              <div className={styles.heroText}>
                <p className={styles.dateLabel}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                <h1 className={styles.welcomeTitle}>
                  Welcome back, {profile?.full_name?.split(' ')[0] || 'Creator'}
                </h1>
              </div>

              {profile?.is_seller && (
                <div className={styles.heroAction}>
                  {/* UPDATED TO USE ?new=true */}
                  <Link href="/dashboard/products?new=true" className={styles.primaryBtn}>
                    <Plus size={20} /> Add New Course
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.container}>
          {/* ── OVERLAPPING METRICS GRID ── */}
          <div className={styles.overlapMetrics}>
            {profile?.is_seller ? (
              <>
                <div className={styles.metricCardPremium}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricLabel}>Total Lifetime Revenue</span>
                    <div className={styles.iconWrapGold}><DollarSign size={18} /></div>
                  </div>
                  <p className={styles.metricValueLarge}>{formatCurrency(sellerStats.totalRevenue, 'USD')}</p>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricLabel}>Products Sold</span>
                    <div className={styles.iconWrapTerracotta}><Package size={18} /></div>
                  </div>
                  <p className={styles.metricValue}>{sellerStats.totalSales}</p>
                </div>

                <div className={styles.metricCard}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricLabel}>Store Views</span>
                    <div className={styles.iconWrapStone}><Eye size={18} /></div>
                  </div>
                  <p className={styles.metricValue}>{sellerStats.totalViews.toLocaleString()}</p>
                </div>
              </>
            ) : (
              <>
                <div className={styles.metricCardPremium}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricLabel}>Total Purchases</span>
                    <div className={styles.iconWrapGold}><ShoppingBag size={18} /></div>
                  </div>
                  <p className={styles.metricValueLarge}>{purchases?.length || 0}</p>
                </div>
                <div className={styles.metricCard}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricLabel}>Library Items</span>
                    <div className={styles.iconWrapTerracotta}><Video size={18} /></div>
                  </div>
                  <p className={styles.metricValue}>{purchases?.length || 0}</p>
                </div>
              </>
            )}
          </div>

          {/* ── PRIMARY ACTIONS (Prominent Quick Links) ── */}
          <div className={styles.quickActionsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Quick Actions</h2>
            </div>
            <div className={styles.quickActionsGrid}>
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.name} href={action.href} className={styles.actionCard}>
                    <div className={styles.actionIconWrapper}>
                      <Icon size={28} strokeWidth={2} />
                    </div>
                    <span className={styles.actionName}>{action.name}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* ── MAIN CONTENT GRID ── */}
          <div className={styles.mainGrid}>

            {/* ========== SELLER VIEW ========== */}
            {profile?.is_seller && (
              <>
                {/* Left Column: Recent Sales */}
                <div className={styles.glassCard}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Recent Sales</h2>
                    <Link href="/dashboard/orders" className={styles.cardLink}>View all <ChevronRight size={16} /></Link>
                  </div>

                  {recentSales.length > 0 ? (
                    <div className={styles.cleanList}>
                      {recentSales.map((order) => (
                        <Link key={order.id} href={`/dashboard/orders/${order.id}`} className={styles.cleanListItem}>
                          <div className={styles.listItemLeft}>
                            <Avatar src={order.profiles?.avatar_url} alt="Buyer" size={44} fallback={(order.profiles?.full_name || order.buyer_email || 'G')[0].toUpperCase()} />
                            <div className={styles.listText}>
                              <p className={styles.primaryText}>{order.product_title}</p>
                              <p className={styles.secondaryText}>{order.profiles?.full_name || order.buyer_email?.split('@')[0]} · {formatDate(order.created_at)}</p>
                            </div>
                          </div>
                          <div className={styles.listItemRight}>
                            <p className={styles.amountText}>+{formatCurrency(order.seller_earnings, 'USD')}</p>
                            <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>Paid</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIconCircle}><ShoppingBag size={24} /></div>
                      <p className={styles.emptyTitle}>No sales yet</p>
                      <p className={styles.emptyDesc}>Share your storefront link to get your first sale.</p>
                    </div>
                  )}
                </div>

                {/* Right Column: Top Products */}
                <div className={styles.glassCard}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Top Performing</h2>
                    <Link href="/dashboard/products" className={styles.cardLink}>Manage <ChevronRight size={16} /></Link>
                  </div>

                  {topProducts.length > 0 ? (
                    <div className={styles.cleanList}>
                      {topProducts.map((product) => (
                        <Link key={product.id} href={`/dashboard/products/${product.id}`} className={styles.cleanListItem}>
                          <div className={styles.listItemLeft}>
                            <ProductImage src={product.cover_image} alt={product.title} size={48} />
                            <div className={styles.listText}>
                              <p className={styles.primaryText}>{product.title}</p>
                              <p className={styles.secondaryText}>{product.sales_count} total sales</p>
                            </div>
                          </div>
                          <div className={styles.listItemRight}>
                            <p className={styles.priceText}>{formatCurrency(product.price_amount, product.price_currency)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIconCircle}><Package size={24} /></div>
                      <p className={styles.emptyTitle}>No products listed</p>
                      <p className={styles.emptyDesc}>Create your first product to start earning.</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ========== BUYER VIEW ========== */}
            {!profile?.is_seller && (
              <>
                {/* Left Column: Recent Purchases */}
                <div className={styles.glassCard}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Recent Purchases</h2>
                    <Link href="/dashboard/purchases" className={styles.cardLink}>View all <ChevronRight size={16} /></Link>
                  </div>

                  {purchases && purchases.length > 0 ? (
                    <div className={styles.cleanList}>
                      {(purchases as unknown as Purchase[]).map((order) => (
                        <Link key={order.id} href={`/dashboard/purchases/${order.id}`} className={styles.cleanListItem}>
                          <div className={styles.listItemLeft}>
                            <ProductImage src={order.products?.cover_image} alt={order.product_title} size={48} />
                            <div className={styles.listText}>
                              <p className={styles.primaryText}>{order.product_title}</p>
                              <p className={styles.secondaryText}>by {order.profiles?.full_name} · {formatDate(order.created_at)}</p>
                            </div>
                          </div>
                          <div className={styles.listItemRight}>
                            <p className={styles.priceText}>{formatCurrency(order.amount_paid, 'USD')}</p>
                            <span className={`${styles.statusBadge} ${styles.statusCompleted}`}>Paid</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIconCircle}><ShoppingBag size={24} /></div>
                      <p className={styles.emptyTitle}>No purchases yet</p>
                      <p className={styles.emptyDesc}>Explore the marketplace to find what you need.</p>
                    </div>
                  )}
                </div>

                {/* Right Column: Fresh on Vouch */}
                <div className={styles.glassCard}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Fresh on Vouch</h2>
                    <Link href="/explore" className={styles.cardLink}>Explore <ChevronRight size={16} /></Link>
                  </div>

                  {recommended && recommended.length > 0 ? (
                    <div className={styles.cleanList}>
                      {(recommended as unknown as RecommendedProduct[]).map((product) => (
                        <Link key={product.id} href={`/vouch.lr/@${product.profiles?.username}/${product.slug}`} className={styles.cleanListItem}>
                          <div className={styles.listItemLeft}>
                            <ProductImage src={product.cover_image} alt={product.title} size={48} />
                            <div className={styles.listText}>
                              <p className={styles.primaryText}>{product.title}</p>
                              <p className={styles.secondaryText}>by {product.profiles?.full_name}</p>
                            </div>
                          </div>
                          <div className={styles.listItemRight}>
                            <p className={styles.priceText}>{formatCurrency(product.price_amount, product.price_currency)}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyIconCircle}><Users size={24} /></div>
                      <p className={styles.emptyTitle}>No products available</p>
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}