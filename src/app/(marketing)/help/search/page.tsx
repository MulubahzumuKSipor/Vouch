import Link from 'next/link';
import { createClient } from '@/lib/server';
import { Search, ChevronRight, AlertCircle } from 'lucide-react';
import styles from '@/styles/help.module.css';

export default async function HelpSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;
  const query = params.q || '';

  // 🔴 Fetch live search results from Supabase
  let searchResults: any[] = [];

  if (query.trim()) {
    const { data } = await supabase
      .from('help_articles')
      .select('id, title, slug, excerpt, category')
      .eq('is_published', true)
      // Searches for the query in the title, excerpt, OR category (case-insensitive)
      .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,category.ilike.%${query}%`)
      .order('sort_order', { ascending: true });

    if (data) {
      searchResults = data;
    }
  }

  return (
    <main className={styles.main}>
      
      {/* ── 1. MINI HERO (Deep Black) ── */}
      <section className={styles.miniHeroSection}>
        <div className={styles.container}>
          <Link href="/help" className={styles.backLink}>
            ← Back to Help Center
          </Link>
          <h1 className={styles.miniHeadline}>
            Search Results
          </h1>
          <p className={styles.miniSubheadline}>
            Showing results for: <span className={styles.highlightQuery}>&quot;{query}&quot;</span>
          </p>
        </div>
      </section>

      {/* ── 2. SEARCH RESULTS (Pure White) ── */}
      <section className={styles.resultsSection}>
        <div className={styles.container}>
          
          <div className={styles.resultsLayout}>
            {/* Left Column: The Results */}
            <div className={styles.resultsList}>
              {query === '' ? (
                <div className={styles.emptyState}>
                  <Search size={48} className={styles.emptyIcon} />
                  <h2>Please enter a search term.</h2>
                  <p>Type your question in the search bar to find answers.</p>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((article) => (
                  <Link href={`/help/articles/${article.slug}`} key={article.id} className={styles.resultCard}>
                    <div className={styles.resultCategory}>{article.category}</div>
                    <h3 className={styles.resultTitle}>{article.title}</h3>
                    <p className={styles.resultExcerpt}>{article.excerpt}</p>
                    <div className={styles.readMore}>Read article <ChevronRight size={16} /></div>
                  </Link>
                ))
              ) : (
                <div className={styles.emptyState}>
                  <AlertCircle size={48} className={styles.emptyIconAlert} />
                  <h2>No results found for &quot;{query}&quot;</h2>
                  <p>We couldn&apos;t find any articles matching your search. Try using different keywords or browse our categories.</p>
                  <Link href="/help" className={styles.primaryBtnSmall}>Browse Help Center</Link>
                </div>
              )}
            </div>

            {/* Right Column: Search Again & Support Box */}
            <div className={styles.sidebar}>
              <div className={styles.sidebarBox}>
                <h3>Search Again</h3>
                <form action="/help/search" method="GET" className={styles.sidebarSearch}>
                  <input 
                    type="text" 
                    name="q" 
                    defaultValue={query} 
                    className={styles.sidebarInput}
                    placeholder="Search..."
                    required
                  />
                  <button type="submit" className={styles.sidebarBtn}><Search size={18} /></button>
                </form>
              </div>

              <div className={styles.sidebarBoxDark}>
                <h3>Still stuck?</h3>
                <p>Our Monrovia-based support team is here to help you succeed.</p>
                <Link href="mailto:mzksipor@gmail.com" className={styles.sidebarLink}>Contact Support →</Link>
              </div>
            </div>

          </div>

        </div>
      </section>

    </main>
  );
}