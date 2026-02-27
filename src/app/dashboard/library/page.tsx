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
  }
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

  // 2. Fetch Orders
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

  const totalItems = orders?.length || 0
  const courseCount = orders?.filter(o => o.products?.product_type === 'course').length || 0
  const assetCount = orders?.filter(o => o.products?.product_type === 'asset').length || 0

  // Note: If you want to filter by tabs on the client side later, you can pass these to a client component.
  // For now, we will render all items and the tabs act as visual indicators.

  return (
    <DashboardLayout isSeller={user?.user_metadata?.is_seller || false} username={user?.user_metadata?.full_name}>
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
          {orders && orders.length > 0 ? (
            <div className={styles.grid}>
              {orders.map((order: LibraryOrder) => {
                const product = order.products
                const isCourse = product.product_type === 'course'
                const isService = product.product_type === 'service'
                const isAsset = product.product_type === 'asset'

                // Routing directly to the creator's storefront product page
                const productUrl = `/@${product.profiles?.username}/${product.slug}`

                return (
                  <Link href={productUrl} key={order.id} className={styles.card}>
                    <div className={styles.imageWrapper}>
                      <ProductImage src={product.cover_image} alt={product.title} />

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
                        by {product.profiles?.full_name}
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
                Start your journey. Purchase courses and assets from Liberia&apos;s top creators.
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