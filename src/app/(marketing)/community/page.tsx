import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/server';
import { ArrowRight } from 'lucide-react';
import styles from '@/styles/community.module.css';
import { CTA } from '@/components/marketing/cta';

export default async function CommunityPage() {
  const supabase = await createClient();

  // 1. Fetch Real Platform Stats
  const { count: creatorCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: productCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  // 2. Fetch Live Featured Creators
  const { data: featuredCreators } = await supabase
    .from('profiles')
    .select('id, full_name, username, bio, avatar_url')
    .limit(6);

  const displayCreators = featuredCreators && featuredCreators.length > 0 ? featuredCreators : [];
  const displayCreatorCount = creatorCount || 0;
  const displayProductCount = productCount || 0;

  // Categories with encoded routing
  const categories = [
    { name: 'Education & Courses', icon: '📚' },
    { name: 'Business & Finance',  icon: '💼' },
    { name: 'Health & Fitness',    icon: '💪' },
    { name: 'Music & Audio',       icon: '🎵' },
    { name: 'Design & Creative',   icon: '🎨' },
    { name: 'Tech & Development',  icon: '💻' },
  ];

  return (
    <main className={styles.main}>

      {/* ── 1. HERO (Warm Sand) ── */}
      <section className={styles.heroSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <span className={styles.eyebrow}>The Vouch Community</span>
            <h1 className={styles.headline}>
              Meet the Liberian creators<br />
              building the future
            </h1>
            <p className={styles.subheadline}>
              Teachers, coaches, artists, and experts—hundreds of Liberians are
              turning their knowledge into income. You are not building this alone.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. LIVE STATS BAR (Pure White) ── */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{displayCreatorCount}+</span>
              <span className={styles.statLabel}>Active Creators</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{displayProductCount}+</span>
              <span className={styles.statLabel}>Products Listed</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>100%</span>
              <span className={styles.statLabel}>Liberian Owned</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. LIVE FEATURED CREATORS (Soft Stone) ── */}
      <section className={styles.featuredSection}>
        <div className={styles.container}>
          <div className={styles.centerHeader}>
            <h2 className={styles.sectionTitle}>Featured Creators</h2>
            <p className={styles.sectionSubtitle}>Discover experts making waves on the platform right now.</p>
          </div>

          <div className={styles.creatorsGrid}>
            {displayCreators.map((creator) => (
              <Link href={`/@${creator.username}`} key={creator.id} className={styles.creatorCard}>
                <div className={styles.creatorAvatar}>
                  {creator.avatar_url ? (
                    <Image src={creator.avatar_url} alt={creator.full_name || 'Creator'} fill className={styles.avatarImage} unoptimized/>
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {creator.full_name ? creator.full_name.charAt(0).toUpperCase() : 'V'}
                    </div>
                  )}
                </div>
                <div className={styles.creatorInfo}>
                  <h3 className={styles.creatorName}>{creator.full_name || 'Anonymous Creator'}</h3>
                  <span className={styles.creatorHandle}>@{creator.username}</span>
                  <p className={styles.creatorBio}>{creator.bio || 'Building my business on Vouch.'}</p>
                </div>
                <div className={styles.viewProfileBtn}>View Profile <ArrowRight size={16} /></div>
              </Link>
            ))}
          </div>

          <div className={styles.browseAllWrapper}>
            <Link href="/explore" className={styles.browseAllBtn}>
              Browse all creators <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. CATEGORIES WITH ROUTING (Pure White) ── */}
      <section className={styles.categoriesSection}>
        <div className={styles.container}>
          <div className={styles.centerHeader}>
            <h2 className={styles.sectionTitle}>Explore by Category</h2>
            <p className={styles.sectionSubtitle}>Find the exact knowledge or service you need.</p>
          </div>

          <div className={styles.categoriesGrid}>
            {categories.map((category) => (
              <Link
                href={`/explore?category=${encodeURIComponent(category.name)}`}
                key={category.name}
                className={styles.categoryCard}
              >
                <div className={styles.categoryContent}>
                  <span className={styles.categoryIcon}>{category.icon}</span>
                  <span className={styles.categoryName}>{category.name}</span>
                </div>
                <ArrowRight size={20} className={styles.categoryArrow} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. VALUES (Deep Charcoal) ── */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <div className={styles.centerHeaderLight}>
            <h2 className={styles.sectionTitleLight}>What Makes Us Different</h2>
            <p className={styles.sectionSubtitleLight}>The Vouch community isn&apos;t just a marketplace — it&apos;s a movement.</p>
          </div>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueNumber}>01</div>
              <h3 className={styles.valueTitle}>Liberian-first</h3>
              <p className={styles.valueDescription}>Every feature is built for how Liberians actually work. MTN Mobile Money isn&apos;t an afterthought — it&apos;s the default.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueNumber}>02</div>
              <h3 className={styles.valueTitle}>Quality over quantity</h3>
              <p className={styles.valueDescription}>We want 500 creators making real money to support their families, not 50,000 abandoned accounts.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueNumber}>03</div>
              <h3 className={styles.valueTitle}>Creators help creators</h3>
              <p className={styles.valueDescription}>Our community shares what&apos;s working, what&apos;s not, and how to grow. No gatekeeping, just real talk.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. RESOURCES (Warm Sand) ── */}
      <section className={styles.resourcesSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.centerHeader}>
            <h2 className={styles.sectionTitle}>Community Resources</h2>
          </div>
          <div className={styles.resourcesGrid}>
            <div className={styles.resourceCard}>
              <div className={styles.resourceIcon}>💬</div>
              <h3>WhatsApp Community</h3>
              <p>Join creators sharing tips, wins, and honest feedback. Weekly office hours with the Vouch team.</p>
              <Link href="/whatsapp" className={styles.resourceLink}>Join the group →</Link>
            </div>
            <div className={styles.resourceCard}>
              <div className={styles.resourceIcon}>📖</div>
              <h3>Creator Guides</h3>
              <p>Step-by-step tutorials on pricing, marketing, and building products that sell.</p>
              <Link href="/guides" className={styles.resourceLink}>Read the guides →</Link>
            </div>
            <div className={styles.resourceCard}>
              <div className={styles.resourceIcon}>📅</div>
              <h3>Creator Meetups</h3>
              <p>In-person events in Monrovia. Network, learn, and celebrate wins together.</p>
              <Link href="/events" className={styles.resourceLink}>See upcoming events →</Link>
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </main>
  );
}