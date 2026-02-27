import { createClient } from '@/lib/client'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Calendar, CheckCircle2, Mail } from 'lucide-react'
import styles from '@/styles/shop.module.css'

// Currency & Interactive
import { getLrdRate } from '@/lib/currency'
import { CurrencyProvider } from '@/context/CurrencyContext'
import PriceDisplay from '@/components/priceDisplay'
import ShareButton from '@/components/shareButton'

interface ShopProduct {
  id: string
  title: string
  slug: string
  product_type: string
  price_amount: number
  price_currency: string | null
  cover_image: string | null
  rating_average: number | null
}

// Helper: Product Cover
function ProductCover({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className={styles.productImageWrapper}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={styles.productImage}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <div className={styles.productPlaceholder}>{alt[0]}</div>
      )}
    </div>
  )
}

export default async function ShopPage({ params }: { params: Promise<{ username: string }> }) {
  const supabase = await createClient()
  const { username } = await params
  const cleanUsername = decodeURIComponent(username).replace('@', '')

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      products (
        id, title, slug, product_type, price_amount, price_currency, cover_image, rating_average
      )
    `)
    .eq('username', cleanUsername)
    .eq('products.is_published', true)
    .order('created_at', { ascending: false, foreignTable: 'products' })
    .single()

  if (!profile) return notFound()

  const exchangeRate = await getLrdRate()
  const totalProducts = profile.products.length
  const memberSince = new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <CurrencyProvider initialRate={exchangeRate}>
      <div className={styles.container}>

        {/* HERO SECTION */}
        <div className={styles.heroCard}>

          {/* 🔴 FIXED: The clean, 2-color pattern is now driven entirely by your CSS file */}
          <div className={styles.coverPattern}></div>

          <div className={styles.heroContent}>
            <div className={styles.heroHeader}>

              {/* LEFT/TOP: Avatar */}
              <div className={styles.avatarWrapper}>
                {profile.avatar_url ? (
                  <Image src={profile.avatar_url} alt={profile.username} fill className={styles.avatar} unoptimized />
                ) : (
                  <div className={styles.avatarPlaceholder}>{profile.full_name?.[0]?.toUpperCase() || 'C'}</div>
                )}
                {profile.is_verified && (
                  <div className={styles.verifiedBadge}>
                    <CheckCircle2 size={22} fill="#2563EB" color="white" />
                  </div>
                )}
              </div>

              {/* RIGHT: Actions (Share) */}
              <div className={styles.actionButtons}>
                <ShareButton username={profile.username} fullName={profile.full_name || profile.username} />
              </div>

            </div>

            {/* PROFILE TEXT */}
            <div className={styles.profileInfo}>
              <h1 className={styles.name}>{profile.full_name}</h1>
              <p className={styles.headline}>{profile.headline || 'Digital Creator'}</p>

              <p className={styles.bio}>{profile.bio || `Welcome to ${profile.full_name}'s digital storefront.`}</p>

              <div className={styles.metaRow}>
                {profile.city && (
                  <span className={styles.metaItem}>
                    <MapPin size={14} className={styles.metaIcon} />
                    {profile.city}, {profile.country}
                  </span>
                )}
                {profile.city && <span className={styles.metaDivider}>•</span>}
                <span className={styles.metaItem}>
                  <Calendar size={14} className={styles.metaIcon} />
                  Joined {memberSince}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SHOP GRID */}
        <div className={styles.shopGrid}>
          <aside className={styles.sidebar}>
              <div className={styles.sidebarCard}>
                <h3 className={styles.sidebarTitle}>Contact</h3>
                <a href={`mailto:${profile.email}`} className={styles.contactLink}>
                  <Mail size={16} /> Contact Seller
                </a>
              </div>
          </aside>

          <main className={styles.productSection}>
            <h2 className={styles.sectionTitle}>
              Products <span className={styles.countBadge}>{totalProducts}</span>
            </h2>

            {profile.products.length > 0 ? (
              <div className={styles.productsGrid}>
                {profile.products.map((product: ShopProduct) => (
                  <Link key={product.id} href={`/@${profile.username}/${product.slug}`} className={styles.productCard}>
                    <ProductCover src={product.cover_image} alt={product.title} />
                    <div className={styles.productInfo}>
                      <h3 className={styles.productTitle}>{product.title}</h3>
                      <div className={styles.productFooter}>
                        <PriceDisplay amount={product.price_amount} sourceCurrency={product.price_currency || 'USD'} className={styles.price} />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.emptyShop}><p>No products yet.</p></div>
            )}
          </main>
        </div>
      </div>
    </CurrencyProvider>
  )
}