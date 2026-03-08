import { createClient } from '@/lib/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ShieldCheck, CheckCircle2, Download, PlayCircle, FileBox, Calendar } from 'lucide-react'
import styles from '@/styles/product.module.css'

// Currency & Layout
import { getLrdRate } from '@/lib/currency'
import { CurrencyProvider } from '@/context/CurrencyContext'
import PriceDisplay from '@/components/priceDisplay'
import CurrencyToggle from '@/components/currencyToggle'
import ShareButton from '@/components/shareButton'
import BuyNowButton from '@/components/buyProduct'
import AddToCartButton from '@/components/AddToCartButton'
import ServiceBookingCalendar from '@/components/serviceBooking'

function ProductHeroImage({ src, alt }: { src?: string | null; alt: string }) {
  return (
    <div className={styles.imageContainer}>
      {src ? (
        <Image src={src} alt={alt} fill className={styles.heroImage} priority sizes="(max-width: 768px) 100vw, 50vw" unoptimized />
      ) : (
        <div className={styles.placeholderHero}>{alt[0]}</div>
      )}
    </div>
  )
}

export default async function ProductPage({ params }: { params: Promise<{ username: string; slug: string }> }) {
  const supabase = await createClient()
  const { username, slug } = await params
  const cleanUsername = decodeURIComponent(username).replace('@', '').toLowerCase()

  // 1. Fetch Product, Creator, AND Attachments
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      product_attachments (*),
      profiles!inner (
        username, full_name, avatar_url, headline, is_verified
      )
    `)
    .eq('slug', slug)
    .eq('profiles.username', cleanUsername)
    .eq('is_published', true)
    .single()

  if (!product) return notFound()

  supabase.rpc('increment_view_count', { p_product_id: product.id }).then()

  // 2. SECURE ACCESS CHECK
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

  // 3. Cart Payload
  const cartPayload = {
    id: product.id,
    title: product.title,
    slug: product.slug,
    price_amount: product.price_amount,
    price_currency: product.price_currency,
    cover_image: product.cover_image,
    username: creator.username
  }

  // Filter out the digital files if it's an asset
  const assetFiles = product.product_attachments?.filter((a: any) => a.attachment_type === 'file') || []

  return (
    <CurrencyProvider initialRate={exchangeRate}>
      <div className={styles.container}>

        {/* Breadcrumb Navigation */}
        <nav className={styles.breadcrumb}>
          <Link href="/explore" className={styles.breadLink}>Explore</Link>
          <span className={styles.breadSep}>/</span>
          <Link href={`/@${creator.username}`} className={styles.breadLink}>@{creator.username}</Link>
          <span className={styles.breadSep}>/</span>
          <span className={styles.breadCurrent}>{product.title}</span>
        </nav>

        <div className={styles.grid}>

          {/* --- LEFT COLUMN: VISUALS --- */}
          <div className={styles.visualsColumn}>
            <ProductHeroImage src={product.cover_image} alt={product.title} />

            <div className={styles.trustRow}>
              <div className={styles.trustItem}><ShieldCheck size={18} /><span>Secure Payment</span></div>
              <div className={styles.trustItem}><CheckCircle2 size={18} /><span>Verified Creator</span></div>
              {product.product_type === 'asset' && <div className={styles.trustItem}><Download size={18} /><span>Instant Download</span></div>}
            </div>

            {/* Asset File List injected right below the image */}
            {product.product_type === 'asset' && assetFiles.length > 0 && (
              <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0F172A' }}>
                  <Download size={18} /> What&apos;s Included ({assetFiles.length} Files)
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {assetFiles.map((file: any) => (
                    <li key={file.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontSize: '0.875rem' }}>
                      <FileBox size={16} color="#3B82F6" /> {file.file_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* --- RIGHT COLUMN: DETAILS & ACTION --- */}
          <div className={styles.detailsColumn}>

            <div className={styles.headerInfo}>
              <div className={styles.typeBadgeWrapper}>
                <span className={`${styles.typeBadge} ${styles['type_' + product.product_type]}`}>{product.product_type}</span>
                {product.rating_average && product.rating_average > 0 ? (
                   <span className={styles.ratingBadge}><Star size={14} fill="currentColor" />{product.rating_average.toFixed(1)}</span>
                ) : null}
              </div>

              <h1 className={styles.title}>{product.title}</h1>

              <Link href={`/@${creator.username}`} className={styles.creatorLink}>
                <div className={styles.avatarSmall}>
                  {creator.avatar_url ? (
                    <Image src={creator.avatar_url} width={24} height={24} alt="Avatar" className={styles.avatarImg} unoptimized />
                  ) : <div className={styles.avatarPlaceholder}>{creator.username[0]}</div>}
                </div>
                <span className={styles.creatorName}>By {creator.full_name}</span>
                {creator.is_verified && <CheckCircle2 size={16} fill="#2563EB" color="white" />}
              </Link>
            </div>

            {/* Price & Buy Card */}
            <div className={styles.buyCard}>
              <div className={styles.priceRow}>
                 <PriceDisplay amount={product.price_amount} sourceCurrency={product.price_currency || 'USD'} className={styles.mainPrice} />
                 {!hasAccess && <CurrencyToggle />}
              </div>

              {hasAccess ? (
                // Dynamic Access Button based on Product Type
                <Link href={`/learn/${product.slug}`} className={`${styles.buyButton} ${styles.accessButton}`}>
                  {product.product_type === 'course' && <PlayCircle size={20} />}
                  {product.product_type === 'asset' && <Download size={20} />}
                  {product.product_type === 'service' && <Calendar size={20} />}

                  {product.product_type === 'course' ? 'Access Course' :
                   product.product_type === 'asset' ? 'Download Files' : 'View Booking Info'}
                </Link>
              ) : product.product_type === 'service' ? (
                // 🔴 FIXED: Added default fallbacks here so TypeScript is happy!
                <ServiceBookingCalendar
                  availability={product.availability || {}}
                  duration={product.duration_minutes || 60}
                  cartPayload={cartPayload}
                />
              ) : (
                // Standard Cart for Courses and Assets
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                  <BuyNowButton product={cartPayload} />
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <AddToCartButton product={cartPayload} />
                  </div>
                  <p className={styles.guaranteeText}>100% Secure Checkout via TipMe / Orange Money</p>
                </div>
              )}
            </div>

            {/* Description */}
            <div className={styles.descriptionSection}>
              <h3 className={styles.descTitle}>About this {product.product_type}</h3>
              <div className={styles.descriptionText}>
                {product.description ? product.description.split('\n').map((line: string, i: number) => <p key={i}>{line}</p>) : <p>No description provided.</p>}
              </div>
            </div>

            {/* Share */}
            <div className={styles.shareSection}>
              <ShareButton username={creator.username + '/' + product.slug} pageTitle={product.title} />
            </div>

          </div>
        </div>
      </div>
    </CurrencyProvider>
  )
}