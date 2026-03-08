import { createClient } from '@/lib/client'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Calendar, CheckCircle2, Mail, Video, FileText, Package } from 'lucide-react'
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

// Helper: Product Cover with Dynamic Placeholder Icons
function ProductCover({ src, alt, type }: { src?: string | null; alt: string, type: string }) {
  return (
    <div className={styles.productImageWrapper} style={{ position: 'relative' }}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={styles.productImage}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      ) : (
        <div className={styles.productPlaceholder} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#F3F4F6' }}>
          {type === 'course' && <Video size={32} color="#9CA3AF" />}
          {type === 'asset' && <FileText size={32} color="#9CA3AF" />}
          {type === 'service' && <Calendar size={32} color="#9CA3AF" />}
          {!['course', 'asset', 'service'].includes(type) && <Package size={32} color="#9CA3AF" />}
        </div>
      )}
    </div>
  )
}

// Helper: Dynamic Badge styles
const getTypeDetails = (type: string) => {
  switch(type) {
    case 'course': return { label: 'Video Course', icon: <Video size={12} />, bg: '#EEF2FF', color: '#4F46E5' }
    case 'asset': return { label: 'Digital Download', icon: <FileText size={12} />, bg: '#FFF1F2', color: '#E11D48' }
    case 'service': return { label: '1-on-1 Call', icon: <Calendar size={12} />, bg: '#F0FDF4', color: '#16A34A' }
    default: return { label: 'Product', icon: <Package size={12} />, bg: '#F3F4F6', color: '#374151' }
  }
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
          <div className={styles.coverPattern}></div>

          <div className={styles.heroContent}>
            <div className={styles.heroHeader}>
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
              <div className={styles.actionButtons}>
                <ShareButton username={profile.username} fullName={profile.full_name || profile.username} />
              </div>
            </div>

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
                {profile.products.map((product: ShopProduct) => {
                  const typeDetails = getTypeDetails(product.product_type)

                  return (
                    <Link key={product.id} href={`/@${profile.username}/${product.slug}`} className={styles.productCard}>

                      <div style={{ position: 'relative' }}>
                        <ProductCover src={product.cover_image} alt={product.title} type={product.product_type} />

                        {/* 🔴 NEW: Floating Product Type Badge */}
                        <div style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: typeDetails.bg,
                          color: typeDetails.color,
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                          {typeDetails.icon}
                          {typeDetails.label}
                        </div>
                      </div>

                      <div className={styles.productInfo}>
                        <h3 className={styles.productTitle}>{product.title}</h3>
                        <div className={styles.productFooter}>
                          <PriceDisplay amount={product.price_amount} sourceCurrency={product.price_currency || 'USD'} className={styles.price} />
                        </div>
                      </div>
                    </Link>
                  )
                })}
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