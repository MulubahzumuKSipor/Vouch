import Link from 'next/link';
import { createClient } from '@/lib/server';
import { 
  Search, 
  BookOpen, 
  CreditCard, 
  ShoppingBag, 
  ShieldCheck, 
  MessageCircle, 
  Mail,
  ChevronRight
} from 'lucide-react';
import styles from '@/styles/help.module.css';

export default async function HelpPage() {
  const supabase = await createClient();

  // 🔴 Fetch live articles from Supabase
  const { data: popularArticles } = await supabase
    .from('help_articles')
    .select('title, slug')
    .eq('is_published', true)
    .order('sort_order', { ascending: true })
    .limit(5);

  return (
    <main className={styles.main}>

      {/* ── 1. HERO & SEARCH (Deep Black) ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <h1 className={styles.headline}>How can we help you grow?</h1>
            <p className={styles.subheadline}>
              Search for guides, tutorials, and answers to keep your business running smoothly.
            </p>
            
            {/* 🔴 Native Server-Side Search Form */}
            <form action="/help/search" method="GET" className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={24} />
              <input 
                type="text" 
                name="q"
                placeholder="Search for 'Mobile Money', 'Upload Course', etc..." 
                className={styles.searchInput}
                required
              />
              <button type="submit" className={styles.searchBtn}>Search</button>
            </form>

          </div>
        </div>
      </section>

      {/* ── 2. HELP CATEGORIES (Pure White) ── */}
      <section className={styles.categoriesSection}>
        <div className={styles.container}>
          <div className={styles.categoriesGrid}>
            
            <Link href="/help/getting-started" className={styles.categoryCard}>
              <div className={styles.iconGold}><BookOpen size={32} /></div>
              <h3>Getting Started</h3>
              <p>Setting up your Vouch profile, customizing your storefront, and launching your page.</p>
            </Link>

            <Link href="/help/payments" className={styles.categoryCard}>
              <div className={styles.iconGreen}><CreditCard size={32} /></div>
              <h3>Payments & Payouts</h3>
              <p>Connecting MTN/Orange MoMo, understanding the T+2 schedule, and bank withdrawals.</p>
            </Link>

            <Link href="/help/products" className={styles.categoryCard}>
              <div className={styles.iconRed}><ShoppingBag size={32} /></div>
              <h3>Managing Products</h3>
              <p>Uploading video courses, setting up calendar bookings, and protecting digital downloads.</p>
            </Link>

            <Link href="/help/security" className={styles.categoryCard}>
              <div className={styles.iconDark}><ShieldCheck size={32} /></div>
              <h3>Account & Security</h3>
              <p>Password resets, two-factor authentication, and keeping your creator account secure.</p>
            </Link>

          </div>
        </div>
      </section>

      {/* ── 3. LIVE POPULAR ARTICLES (Woven White) ── */}
      <section className={styles.articlesSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.centerHeader}>
            <h2 className={styles.sectionTitle}>Popular Guides</h2>
            <div className={styles.titleUnderline}></div>
          </div>

          <div className={styles.articlesGrid}>
            {popularArticles && popularArticles.length > 0 ? (
              popularArticles.map((article) => (
                <Link href={`/help/articles/${article.slug}`} key={article.slug} className={styles.articleRow}>
                  <span className={styles.articleTitle}>{article.title}</span>
                  <ChevronRight size={20} className={styles.articleArrow} />
                </Link>
              ))
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: '#6B7280' }}>
                No guides available at the moment. Check back soon!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. STILL NEED HELP? (Warm Sand) ── */}
      <section className={styles.contactSection}>
        <div className={styles.container}>
          <div className={styles.contactBox}>
            <div className={styles.contactText}>
              <h2 className={styles.contactTitle}>Can&apos;t find what you&apos;re looking for?</h2>
              <p className={styles.contactDesc}>
                Our team is based right here in Monrovia. We are ready to help you troubleshoot, optimize your store, or answer any specific questions.
              </p>
            </div>
            
            <div className={styles.contactActions}>
              <Link href="https://wa.me/231886678786" className={styles.whatsappBtn}>
                <MessageCircle size={20} />
                Chat on WhatsApp
              </Link>
              <Link href="mailto:mzksipor@gmail.com" className={styles.emailBtn}>
                <Mail size={20} />
                Email Support
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}