import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Video,
  FileText,
  Calendar,
  Search,
  Package,
  ArrowRight
} from 'lucide-react'
import styles from '@/styles/library.module.css'
import DashboardLayout from '@/components/dashboardLayout'

interface LibraryOrder {
  id: string
  created_at: string
  status: string
  products: {
    id: string
    title: string
    slug: string
    product_type: string
    cover_image: string | null
    profiles: {
      full_name: string | null
      username: string
      is_verified: boolean
    }
  } | null // 🔴 Added null type in case product was deleted
}

// Helper for consistent images
function ProductImage({ src, alt }: { src?: string | null; alt: string }) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={styles.productImg}
        unoptimized={src.includes('.svg') || src.includes('dicebear')}
      />
    )
  }
  return (
    <div className={styles.productImgFallback}>
      <Package size={32} />
    </div>
  )
}

export default async function LibraryPage() {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) redirect('/login')

  // 2. Fetch the actual profile for the Layout (more reliable than user_metadata)
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, is_seller')
    .eq('id', user.id)
    .single()

  // 3. Fetch Orders
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id,
      created_at,
      status,
      products (
        id,
        title,
        slug,
        product_type,
        cover_image,
        profiles (
          full_name,
          username,
          is_verified
        )
      )
    `)
    .eq('buyer_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })

  // 4. Safely filter out any orders where the product might have been deleted from the DB
  const validOrders = (orders as unknown as LibraryOrder[])?.filter(o => o.products !== null) || []

  const totalItems = validOrders.length
  const courseCount = validOrders.filter(o => o.products?.product_type === 'course').length
  const assetCount = validOrders.filter(o => o.products?.product_type === 'asset').length

  return (
    <DashboardLayout isSeller={profile?.is_seller || false} username={profile?.full_name || 'User'}>
      <div className={styles.appWrapper}>

        {/* ── HEADER ── */}
        <div className={styles.headerSection}>
          <div className={styles.container}>
            <h1 className={styles.pageTitle}>My Library</h1>
            <p className={styles.pageSubtitle}>
              Your collection of {totalItems} digital items. Owned by you, secured by Vouch.
            </p>

            {/* FILTER TABS */}
            {totalItems > 0 && (
              <div className={styles.tabsContainer}>
                <div className={`${styles.tab} ${styles.tabActive}`}>All Items ({totalItems})</div>
                <div className={styles.tab}>Courses ({courseCount})</div>
                <div className={styles.tab}>Assets ({assetCount})</div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.container}>
          {/* ── CONTENT GRID ── */}
          {validOrders.length > 0 ? (
            <div className={styles.grid}>
              {validOrders.map((order: LibraryOrder) => {
                const product = order.products! // Safe to assert because of the filter above
                const isCourse = product.product_type === 'course'
                const isService = product.product_type === 'service'
                const isAsset = product.product_type === 'asset'

                // Safe routing fallback
                const creatorUsername = product.profiles?.username || 'creator'
                const productUrl = `/@${creatorUsername}/${product.slug || product.id}`

                return (
                  <Link href={productUrl} key={order.id} className={styles.card}>
                    <div className={styles.imageWrapper}>
                      <ProductImage src={product.cover_image} alt={product.title || 'Product'} />

                      {/* Floating Type Badge inside Image */}
                      <div className={styles.imageBadge}>
                        {isCourse && <Video size={14} />}
                        {isAsset && <FileText size={14} />}
                        {isService && <Calendar size={14} />}
                        <span>
                          {isCourse ? 'Course' : isAsset ? 'Asset' : 'Service'}
                        </span>
                      </div>
                    </div>

                    <div className={styles.cardBody}>
                      <h3 className={styles.cardTitle}>{product.title}</h3>
                      <p className={styles.author}>
                        by {product.profiles?.full_name || 'Unknown Creator'}
                        {product.profiles?.is_verified && <span className={styles.verifiedBadge}>✓</span>}
                      </p>
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.actionText}>
                        {isCourse ? 'Watch Course' : isAsset ? 'Download Asset' : 'View Details'}
                      </span>
                      <ArrowRight size={16} className={styles.actionIcon} />
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            /* ── EMPTY STATE ── */
            <div className={styles.emptyState}>
              <div className={styles.emptyIconCircle}>
                <Search size={32} />
              </div>
              <h3 className={styles.emptyTitle}>Your library is waiting</h3>
              <p className={styles.emptyDesc}>
                Start your journey. Purchase courses and assets from top creators.
              </p>
              <Link href="/explore" className={styles.primaryBtn}>
                Explore Marketplace
              </Link>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}