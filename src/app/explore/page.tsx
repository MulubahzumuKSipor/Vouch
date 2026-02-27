import { createClient } from '@/lib/server'
import Link from 'next/link'
import Image from 'next/image'
import { Search, MapPin, Briefcase, CheckCircle2 } from 'lucide-react'
import styles from '@/styles/explore.module.css'

import DashboardLayout from '@/components/dashboardLayout'
import ExploreHeader from '@/components/ExploreHeader'

interface SearchParams {
  searchParams: Promise<{ q?: string; type?: string }>
}

interface ExploreCreator {
  id: string; username: string; full_name: string | null; avatar_url: string | null;
  headline: string | null; bio: string | null; is_verified: boolean;
  city: string | null; country: string | null; products: { id: string; product_type: string }[] | null;
}

function CreatorAvatar({ src, alt }: { src?: string | null; alt: string }) {
  if (src) return <Image src={src} alt={alt} className={styles.avatarImage} unoptimized width={40} height={40} />
  return <div className={styles.avatarPlaceholder}>{alt ? alt[0].toUpperCase() : 'C'}</div>
}

export default async function ExplorePage({ searchParams }: SearchParams) {
  const supabase = await createClient()
  const params = await searchParams
  const query = params.q || ''
  const typeFilter = params.type || 'all'

  let dbQuery = supabase
    .from('profiles')
    .select(`id, username, full_name, avatar_url, headline, bio, is_verified, city, country, products!inner(id, product_type)`)
    .eq('products.is_published', true)
    .eq('products.is_archived', false)

  if (['course', 'service', 'asset'].includes(typeFilter)) {
    // 🔴 FIXED: Asserted the type to perfectly match Supabase's product_type_enum
    dbQuery = dbQuery.eq('products.product_type', typeFilter as "course" | "service" | "asset")
  }

  if (query) {
    dbQuery = dbQuery.or(`full_name.ilike.%${query}%,username.ilike.%${query}%,headline.ilike.%${query}%`)
  }

  const { data: creators } = await dbQuery.limit(50)
  const uniqueCreators = creators ? Array.from(new Map((creators as unknown as ExploreCreator[]).map(c => [c.id, c])).values()) : []

  return (
    <DashboardLayout isSeller={false} username={undefined}>
      <div className={styles.pageWrapper}>
        <div className={styles.container}>

          <ExploreHeader currentType={typeFilter} currentQuery={query} />

          <div className={styles.grid}>
            {uniqueCreators.length > 0 ? (
              uniqueCreators.map((creator: ExploreCreator) => (
                <Link key={creator.id} href={`/@${creator.username}`} className={styles.creatorCard}>

                  {/* Premium Soft Gradient Cover */}
                  <div className={styles.cardCover} />

                  <div className={styles.cardContent}>
                    <div className={styles.avatarRow}>
                      <div className={styles.avatarBorder}>
                        <CreatorAvatar src={creator.avatar_url} alt={creator.username} />
                      </div>
                      <div className={styles.actionPill}>View Store</div>
                    </div>

                    <div className={styles.infoRow}>
                      <h3 className={styles.creatorName}>
                        {creator.full_name || `@${creator.username}`}
                        {creator.is_verified && <CheckCircle2 size={16} className={styles.verifiedIcon} fill="#0284C7" color="white" />}
                      </h3>
                      <p className={styles.creatorHeadline}>{creator.headline || "Digital Creator"}</p>
                    </div>

                    <div className={styles.metricsRow}>
                      {(creator.city || creator.country) && (
                        <span className={styles.metricItem}><MapPin size={14} /> {creator.city || 'Liberia'}</span>
                      )}
                      <span className={styles.metricItem}><Briefcase size={14} /> {creator.products?.length || 1} Products</span>
                    </div>

                    <p className={styles.creatorBio}>
                      {creator.bio ? (creator.bio.length > 90 ? creator.bio.substring(0, 90) + '...' : creator.bio) : `Check out ${creator.full_name || creator.username}'s digital shop.`}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIconCircle}><Search size={32} /></div>
                <h3 className={styles.emptyTitle}>No creators found</h3>
                <p className={styles.emptyDesc}>
                  {query ? `We couldn't find anyone matching "${query}".` : 'No creators have joined this category yet.'}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}