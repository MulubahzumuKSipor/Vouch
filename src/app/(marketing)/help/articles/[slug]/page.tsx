import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/server';
import { ArrowLeft, LifeBuoy, Calendar, ChevronRight } from 'lucide-react';
import styles from '@/styles/helpArticle.module.css';

// Force Next.js to always fetch fresh data
export const dynamic = 'force-dynamic';

const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('en-US', { 
    month: 'long', 
    day: '2-digit', 
    year: 'numeric' 
  }).format(new Date(dateString));
};

export default async function HelpArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = await createClient();
  const { slug } = await params;

  // 🔴 Fetch the specific help article
  const { data: article, error } = await supabase
    .from('help_articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  // If the article doesn't exist, show the 404 page
  if (error || !article) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <article className={styles.articleContainer}>
        
        {/* ── 1. BREADCRUMBS & HEADER ── */}
        <header className={styles.header}>
          <nav className={styles.breadcrumbs}>
            <Link href="/help" className={styles.breadcrumbLink}>Help Center</Link>
            <ChevronRight size={14} className={styles.breadcrumbSeparator} />
            <span className={styles.breadcrumbCurrent}>{article.category}</span>
          </nav>

          <h1 className={styles.title}>{article.title}</h1>
          <p className={styles.excerpt}>{article.excerpt}</p>

          <div className={styles.metaData}>
            <div className={styles.metaItem}>
              <Calendar size={16} className={styles.metaIcon} />
              <span>Last updated: {formatDate(article.updated_at || article.created_at)}</span>
            </div>
          </div>
        </header>

        {/* ── 2. DOCUMENTATION CONTENT ── */}
        <div className={styles.contentWrapper}>
          {/* Renders the raw HTML saved in Supabase */}
          <div 
            className={styles.richText} 
            dangerouslySetInnerHTML={{ __html: article.content }} 
          />
        </div>

        {/* ── 3. BOTTOM SUPPORT CTA ── */}
        <footer className={styles.articleFooter}>
          <div className={styles.supportBox}>
            <div className={styles.supportIcon}>
              <LifeBuoy size={32} />
            </div>
            <div className={styles.supportText}>
              <h3>Didn&apos;t find what you were looking for?</h3>
              <p>Our support team in Monrovia is ready to help you troubleshoot.</p>
            </div>
            <Link href="/contact" className={styles.contactBtn}>
              Contact Support
            </Link>
          </div>
        </footer>

      </article>
    </main>
  );
}