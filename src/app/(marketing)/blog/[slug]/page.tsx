import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/server';
import { ArrowLeft, Clock, Calendar, User } from 'lucide-react';
import styles from '@/styles/blogPost.module.css';

// Force Next.js to always fetch fresh data for these dynamic routes
export const dynamic = 'force-dynamic';

const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('en-US', { 
    month: 'long', 
    day: '2-digit', 
    year: 'numeric' 
  }).format(new Date(dateString));
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const supabase = await createClient();
  const { slug } = await params;

  // 🔴 Fetch the single post that matches the URL slug
  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  // If the post doesn't exist or isn't published, show the 404 page
  if (error || !post) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <article className={styles.articleContainer}>
        
        {/* ── 1. BACK LINK & HEADER ── */}
        <header className={styles.header}>
          <Link href="/blog" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Journal
          </Link>

          <div className={styles.categoryWrapper}>
            <span className={styles.categoryBadge}>{post.category}</span>
          </div>

          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.excerpt}>{post.excerpt}</p>

          <div className={styles.metaData}>
            <div className={styles.metaItem}>
              <User size={16} className={styles.metaIcon} />
              <span>{post.author_name}</span>
            </div>
            <div className={styles.metaItem}>
              <Calendar size={16} className={styles.metaIcon} />
              <span>{formatDate(post.published_at)}</span>
            </div>
            <div className={styles.metaItem}>
              <Clock size={16} className={styles.metaIcon} />
              <span>{post.read_time_minutes} min read</span>
            </div>
          </div>
        </header>

        {/* ── 2. ARTICLE CONTENT ── */}
        <div className={styles.contentWrapper}>
          {/* We use dangerouslySetInnerHTML because our DB stores raw HTML strings */}
          <div 
            className={styles.richText} 
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        </div>

        {/* ── 3. BOTTOM CTA ── */}
        <footer className={styles.articleFooter}>
          <div className={styles.ctaBox}>
            <h2>Ready to share your knowledge?</h2>
            <p>Join hundreds of Liberian experts building their digital empires on Vouch.</p>
            <Link href="/signup" className={styles.ctaBtn}>
              Start selling today
            </Link>
          </div>
        </footer>

      </article>
    </main>
  );
}