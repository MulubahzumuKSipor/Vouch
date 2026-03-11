import Link from 'next/link';
import { createClient } from '@/lib/server';
import { Clock, ArrowUpRight, BookOpen } from 'lucide-react';
import styles from '@/styles/blog.module.css';

// 🔴 1. Force Next.js to NEVER cache this page (always fetch fresh data)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }).format(new Date(dateString));
};

export default async function BlogPage() {
  const supabase = await createClient();

  // 🔴 2. Grab the 'error' object so we can see what went wrong
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  // 🔴 3. Log the result to your VS Code terminal
  // console.log("Supabase Error:", error);
  // console.log("Supabase Data:", posts);

  const featuredPost = posts?.find(p => p.is_featured);
  const regularPosts = posts?.filter(p => p.id !== featuredPost?.id) || [];


  return (
    <main className={styles.main}>

      {/* ── 1. EDITORIAL HERO ── */}
      <section className={styles.heroSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.heroHeader}>
            <div className={styles.eyebrow}><BookOpen size={18} /> The Vouch Journal</div>
            <h1 className={styles.headline}>
              Insights for the <br />
              <span className={styles.highlightLine}>Modern Creator.</span>
            </h1>
            <p className={styles.subheadline}>
              Strategies, success stories, and product updates from the heart of Liberia&apos;s digital revolution.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. THE FEATURED STORY ── */}
      {featuredPost && (
        <section className={styles.featuredSection}>
          <div className={styles.container}>
            <Link href={`/blog/${featuredPost.slug}`} className={styles.featuredArticle}>
              {/* Image Area */}
              <div className={styles.featuredVisual}>
                <div className={styles.imagePlaceholder}>
                  <span>Featured Editorial</span>
                </div>
              </div>

              {/* Text Area */}
              <div className={styles.featuredContent}>
                <div className={styles.metaRow}>
                  <span className={styles.categoryBadge}>{featuredPost.category}</span>
                  <span className={styles.readMeta}><Clock size={14} /> {featuredPost.read_time_minutes} min</span>
                </div>
                <h2 className={styles.featuredTitle}>{featuredPost.title}</h2>
                <p className={styles.featuredExcerpt}>{featuredPost.excerpt}</p>

                <div className={styles.authorRow}>
                  <div className={styles.authorInfo}>
                    <span className={styles.authorName}>{featuredPost.author_name}</span>
                    <span className={styles.publishDate}>{formatDate(featuredPost.published_at)}</span>
                  </div>
                  <div className={styles.readMoreBtn}>
                    Read Story <ArrowUpRight size={20} />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ── 3. RECENT STORIES GRID ── */}
      <section className={styles.gridSection}>
        <div className={styles.container}>
          <div className={styles.sectionDivider}>
            <h3>Recent Stories</h3>
            <div className={styles.dividerLine}></div>
          </div>

          <div className={styles.articleGrid}>
            {regularPosts.length > 0 ? (
              regularPosts.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.id} className={styles.articleCard}>
                  <div className={styles.cardHeader}>
                    <span className={styles.cardCategory}>{post.category}</span>
                    <ArrowUpRight size={20} className={styles.cardArrow} />
                  </div>
                  <h3 className={styles.cardTitle}>{post.title}</h3>
                  <p className={styles.cardExcerpt}>{post.excerpt}</p>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardDate}>{formatDate(post.published_at)}</span>
                    <span className={styles.cardReadTime}>{post.read_time_minutes} min read</span>
                  </div>
                </Link>
              ))
            ) : (
              <p style={{ color: '#6B7280' }}>More stories coming soon...</p>
            )}
          </div>
        </div>
      </section>

    </main>
  );
}