import Link from 'next/link';
import { createClient } from '@/lib/server';
import { Newspaper, Download, ArrowRight, Mail, ImageIcon, TrendingUp, Users, Globe } from 'lucide-react';
import styles from '@/styles/press.module.css';

// Force Next.js to always fetch the freshest data
export const dynamic = 'force-dynamic';

// Helper to format Supabase dates into clean strings like "February 15, 2026"
const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString));
};

export default async function PressPage() {
  const supabase = await createClient();

  // 🔴 Fetch live press releases from Supabase
  const { data: pressReleases, error } = await supabase
    .from('press_releases')
    .select('*')
    .eq('is_published', true)
    .order('published_date', { ascending: false });

  if (error) {
    console.error("Error fetching press releases:", error);
  }

  const releases = pressReleases || [];

  return (
    <main className={styles.main}>

      {/* ── 1. HERO SECTION (Deep Black) ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>Press & Media</div>
            <h1 className={styles.headline}>
              The story of <br />
              <span className={styles.highlightLine}>Vouch.</span>
            </h1>
            <p className={styles.subheadline}>
              We are building the financial and technological infrastructure for the African creator economy, starting right here in Monrovia.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. COMPANY AT A GLANCE (Pure White) ── */}
      <section className={styles.factsSection}>
        <div className={styles.container}>
          <div className={styles.factsGrid}>
            <div className={styles.factText}>
              <h2 className={styles.sectionTitle}>Company Facts</h2>
              <p className={styles.factDesc}>
                Vouch is an all-in-one platform that allows Liberian creators, educators, and experts to sell digital products, host video courses, and book consultations, with native integration for local payment methods like MTN and Orange Mobile Money.
              </p>
              <ul className={styles.factList}>
                <li><strong>Founded:</strong> 2025</li>
                <li><strong>Headquarters:</strong> Monrovia, Liberia</li>
                <li><strong>Mission:</strong> To make borderless internet income accessible to every Liberian expert.</li>
              </ul>
            </div>
            
            <div className={styles.statsVisual}>
              <div className={styles.statBox}>
                <div className={styles.iconGold}><TrendingUp size={24} /></div>
                <h3>10%</h3>
                <p>Flat Transaction Fee</p>
              </div>
              <div className={styles.statBox}>
                <div className={styles.iconGreen}><Users size={24} /></div>
                <h3>100%</h3>
                <p>Liberian Owned & Operated</p>
              </div>
              <div className={styles.statBox}>
                <div className={styles.iconRed}><Globe size={24} /></div>
                <h3>MoMo & Orange Money</h3>
                <p>Native Payment Rails</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. RECENT PRESS & NEWS (Woven White) ── */}
      <section className={styles.newsSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.newsHeader}>
            <h2 className={styles.sectionTitle}>Recent News</h2>
            <div className={styles.titleUnderline}></div>
          </div>

          <div className={styles.newsGrid}>
            {releases.length > 0 ? (
              releases.map((article) => (
                <Link
                  href={article.external_url || '#'}
                  target={article.external_url ? "_blank" : "_self"}
                  rel={article.external_url ? "noopener noreferrer" : ""}
                  key={article.id}
                  className={styles.newsCard}
                >
                  <div className={styles.newsMeta}>
                    <span className={styles.publicationName}>{article.publication_name}</span>
                    <span className={styles.articleType}>{article.release_type}</span>
                  </div>
                  <h3 className={styles.newsTitle}>{article.title}</h3>
                  <div className={styles.newsFooter}>
                    <span className={styles.newsDate}>{formatDate(article.published_date)}</span>
                    <span className={styles.readArticleBtn}>Read <ArrowRight size={16} /></span>
                  </div>
                </Link>
              ))
            ) : (
              <p style={{ color: '#6B7280' }}>No recent press releases at the moment.</p>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. BRAND ASSETS (Soft Stone) ── */}
      <section className={styles.assetsSection}>
        <div className={styles.container}>
          <div className={styles.assetsLayout}>
            <div className={styles.assetsText}>
              <h2 className={styles.sectionTitle}>Brand Assets</h2>
              <p className={styles.assetsDesc}>
                Download official Vouch logos, product screenshots, and founder headshots for use in publications. Please do not alter the logo colors or proportions.
              </p>
              <Link href="mailto:press@vouch.lr" className={styles.pressContactBtn}>
                <Mail size={18} /> Contact Press Team
              </Link>
            </div>

            <div className={styles.downloadGrid}>

              {/* 🔴 Updated Logo Download */}
              <div className={styles.downloadCard}>
                <div className={styles.downloadVisual}>
                  {/* Optional: You can actually show the logo here instead of the icon! */}
                  <img src="/logo.jpg" alt="Vouch Logo" style={{ width: '60%', height: 'auto', borderRadius: '4px' }} />
                </div>
                <div className={styles.downloadInfo}>
                  <div>
                    <h4>Vouch Logo</h4>
                    <p>High-Res JPG format</p>
                  </div>
                  {/* The 'download' attribute forces the browser to save the file */}
                  <a href="/logo.jpg" download="Vouch-Logo.jpg" className={styles.downloadBtn}>
                    <Download size={20} />
                  </a>
                </div>
              </div>

              {/* 🔴 Updated Press Kit Download */}
              <div className={styles.downloadCard}>
                <div className={styles.downloadVisual}>
                  <Newspaper size={48} className={styles.placeholderIcon} />
                </div>
                <div className={styles.downloadInfo}>
                  <div>
                    <h4>Press Kit</h4>
                    <p>Company Bio & Facts (PDF)</p>
                  </div>
                  {/* Assumes you save the PDF as vouch-press-kit.pdf in your public folder */}
                  <a href="/vouch-press-kit.pdf" download="Vouch-Press-Kit.pdf" className={styles.downloadBtn}>
                    <Download size={20} />
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

    </main>
  );
}