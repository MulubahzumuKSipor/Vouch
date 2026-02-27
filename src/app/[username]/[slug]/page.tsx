import { createClient } from '@/lib/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShieldCheck, CheckCircle2, Download, PlayCircle } from 'lucide-react'
import styles from '@/styles/product.module.css'

// Currency & Layout
import { getLrdRate } from '@/lib/currency'
import { CurrencyProvider } from '@/context/CurrencyContext'
import PriceDisplay from '@/components/priceDisplay'
import CurrencyToggle from '@/components/currencyToggle'
import ShareButton from '@/components/shareButton'
import BuyNowButton from '@/components/buyProduct'
import AddToCartButton from '@/components/AddToCartButton' // 🔴 ADDED IMPORT

// Helper: Product Cover
function ProductHeroImage({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className={styles.imageContainer}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={styles.heroImage}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized
        />
      ) : (
        <div className={styles.placeholderHero}>
          {alt[0]}
        </div>
      )}
    </div>
  )
}

export default async function ProductPage({ params }: { params: Promise<{ username: string; slug: string }> }) {
  const supabase = await createClient()
  const { username, slug } = await params

  // 1. Clean Username
  const cleanUsername = decodeURIComponent(username).replace('@', '').toLowerCase()

  // 2. Fetch Product & Creator
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      profiles!inner (
        username,
        full_name,
        avatar_url,
        headline,
        is_verified
      )
    `)
    .eq('slug', slug)
    .eq('profiles.username', cleanUsername)
    .eq('is_published', true)
    .single()

  if (!product) return notFound()

  supabase.rpc('increment_view_count', { p_product_id: product.id }).then()

  // 3. SECURE ACCESS CHECK (Creator or Buyer)
  const { data: { user } } = await supabase.auth.getUser()
  let hasAccess = false

  if (user) {
    if (user.id === product.seller_id) {
      hasAccess = true
    } else {
      const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('product_id', product.id)
        .eq('buyer_id', user.id)
        .eq('status', 'completed')
        .maybeSingle()

      if (order) hasAccess = true
    }
  }

  const creator = product.profiles
  const exchangeRate = await getLrdRate()

  // 4. Format the payload for the Cart Context
  const cartPayload = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    price_amount: product.price_amount,
    price_currency: product.price_currency,
    cover_image: product.cover_image,
    username: creator.username
  }

  return (
    <CurrencyProvider initialRate={exchangeRate}>
      <div className={styles.container}>

        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumb}>
          <Link href="/explore" className={styles.breadLink}>Explore</Link>
          <span className={styles.breadSep}>/</span>
          <Link href={`/@${creator.username}`} className={styles.breadLink}>
            @{creator.username}
          </Link>
          <span className={styles.breadSep}>/</span>
          <span className={styles.breadCurrent}>{product.title}</span>
        </nav>

        <div className={styles.grid}>

          {/* --- LEFT COLUMN: VISUALS --- */}
          <div className={styles.visualsColumn}>
            <ProductHeroImage src={product.cover_image} alt={product.title} />

            <div className={styles.trustRow}>
              <div className={styles.trustItem}>
                <ShieldCheck size={18} />
                <span>Secure Payment</span>
              </div>
              <div className={styles.trustItem}>
                <CheckCircle2 size={18} />
                <span>Verified Creator</span>
              </div>
              {product.product_type === 'asset' && (
                <div className={styles.trustItem}>
                  <Download size={18} />
                  <span>Instant Download</span>
                </div>
              )}
            </div>
          </div>

          {/* --- RIGHT COLUMN: DETAILS & ACTION --- */}
          <div className={styles.detailsColumn}>

            <div className={styles.headerInfo}>
              <div className={styles.typeBadgeWrapper}>
                <span className={`${styles.typeBadge} ${styles['type_' + product.product_type]}`}>
                  {product.product_type}
                </span>
                {product.rating_average && product.rating_average > 0 ? (
                   <span className={styles.ratingBadge}>
                      <Star size={14} fill="currentColor" />
                      {product.rating_average.toFixed(1)}
                   </span>
                ) : null}
              </div>

              <h1 className={styles.title}>{product.title}</h1>

              <Link href={`/@${creator.username}`} className={styles.creatorLink}>
                <div className={styles.avatarSmall}>
                  {creator.avatar_url ? (
                    <Image src={creator.avatar_url} width={24} height={24} alt="Avatar" className={styles.avatarImg} unoptimized />
                  ) : (
                     <div className={styles.avatarPlaceholder}>{creator.username[0]}</div>
                  )}
                </div>
                <span className={styles.creatorName}>By {creator.full_name}</span>
                {creator.is_verified && <CheckCircle2 size={16} fill="#2563EB" color="white" />}
              </Link>
            </div>

            {/* Price & Buy Card */}
            <div className={styles.buyCard}>
              <div className={styles.priceRow}>
                 <PriceDisplay
                    amount={product.price_amount}
                    sourceCurrency={product.price_currency || 'USD'}
                    className={styles.mainPrice}
                 />
                 {!hasAccess && <CurrencyToggle />}
              </div>

              {/* DYNAMIC CTA: Changes based on ownership */}
              {hasAccess ? (
                <Link
                  href={`/learn/${product.slug}`}
                  className={`${styles.buyButton} ${styles.accessButton}`}
                >
                  <PlayCircle size={20} />
                  Access {product.product_type === 'course' ? 'Course' : 'Product'}
                </Link>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                  {/* Primary Action */}
                  <BuyNowButton product={cartPayload} />
                  
                  {/* 🔴 ADDED: Secondary Action (Centered Pill) */}
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <AddToCartButton product={cartPayload} />
                  </div>

                  <p className={styles.guaranteeText}>
                     100% Secure Checkout via TipMe / Orange Money
                  </p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className={styles.descriptionSection}>
              <h3 className={styles.descTitle}>About this {product.product_type}</h3>
              <div className={styles.descriptionText}>
                {product.description
                  ? product.description.split('\n').map((line: string, i: number) => (
                      <p key={i}>{line}</p>
                    ))
                  : <p>No description provided.</p>
                }
              </div>
            </div>

            {/* Share */}
            <div className={styles.shareSection}>
              <ShareButton
                 username={creator.username + '/' + product.slug}
                 pageTitle={product.title}
              />
            </div>

          </div>
        </div>
      </div>
    </CurrencyProvider>
  )
}