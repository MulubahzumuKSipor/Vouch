import Link from 'next/link';
import { createClient } from '@/lib/server';
import { BookOpen, PlayCircle, TrendingUp, CheckCircle, ArrowRight, Lightbulb } from 'lucide-react';
import styles from '@/styles/guides.module.css';

// Force Next.js to always fetch the freshest data
export const dynamic = 'force-dynamic';

// 🔴 Map database string names to actual Lucide React components
const IconMap: Record<string, React.ReactNode> = {
  PlayCircle: <PlayCircle size={24} />,
  TrendingUp: <TrendingUp size={24} />,
  Lightbulb: <Lightbulb size={24} />,
  CheckCircle: <CheckCircle size={24} />,
  // Fallback icon just in case a name is misspelled in the database
  Default: <BookOpen size={24} />
};

export default async function GuidesPage() {
  const supabase = await createClient();

  // 🔴 Fetch live guides from Supabase
  const { data: guides, error } = await supabase
    .from('creator_guides')
    .select('*')
    .eq('is_published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error("Error fetching guides:", error);
  }

  const activeGuides = guides || [];

  return (
    <main className={styles.main}>
      
      {/* ── 1. HERO SECTION ── */}
      <section className={styles.heroSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.heroHeader}>
            <div className={styles.eyebrow}><BookOpen size={18} /> Creator Curriculum</div>
            <h1 className={styles.headline}>
              Turn your expertise into an <br />
              <span className={styles.highlightLine}>economic engine.</span>
            </h1>
            <p className={styles.subheadline}>
              In-depth tutorials, blueprints, and strategies to help you build, launch, and scale your digital business on Vouch.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. THE BLUEPRINT (START HERE) ── */}
      <section className={styles.blueprintSection}>
        <div className={styles.container}>
          <div className={styles.blueprintCard}>
            <div className={styles.blueprintContent}>
              <div className={styles.blueprintBadge}>Start Here</div>
              <h2 className={styles.blueprintTitle}>The Vouch Launch Blueprint</h2>
              <p className={styles.blueprintDesc}>
                Brand new to digital products? We built a massive, 5-part masterclass that takes you from finding your niche to making your first LRD 10,000 online. This is required reading for every new creator.
              </p>
              
              <div className={styles.curriculumList}>
                <div className={styles.curriculumItem}>
                  <div className={styles.stepNumber}>01</div>
                  <span>Packaging your knowledge into a product</span>
                </div>
                <div className={styles.curriculumItem}>
                  <div className={styles.stepNumber}>02</div>
                  <span>Setting up your Vouch storefront</span>
                </div>
                <div className={styles.curriculumItem}>
                  <div className={styles.stepNumber}>03</div>
                  <span>Your first marketing campaign</span>
                </div>
              </div>

              <Link href="/guides/launch-blueprint" className={styles.blueprintBtn}>
                Read the Masterclass <ArrowRight size={20} />
              </Link>
            </div>
            
            <div className={styles.blueprintVisual}>
              <div className={styles.bookMockup}>
                <div className={styles.bookSpine}></div>
                <div className={styles.bookCover}>
                  <h3>The Launch Blueprint</h3>
                  <p>By Vouch</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. TACTICAL GUIDES GRID ── */}
      <section className={styles.gridSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2>Tactical Guides</h2>
            <p>Specific strategies to optimize your business.</p>
          </div>

          <div className={styles.guidesGrid}>
            {activeGuides.length > 0 ? (
              activeGuides.map((guide) => (
                <Link href={`/guides/${guide.slug}`} key={guide.id} className={styles.guideCard}>
                  <div className={styles.cardHeader}>
                    {/* Maps the string 'iconRed' or 'iconGold' to your CSS classes */}
                    <div className={`${styles.iconBox} ${styles[guide.color_class] || styles.iconDark}`}>
                      {/* Uses the IconMap to render the correct SVG */}
                      {IconMap[guide.icon_name] || IconMap.Default}
                    </div>
                    <span className={styles.readTimeBadge}>{guide.read_time_minutes} min read</span>
                  </div>
                  <span className={styles.guideCategory}>{guide.category}</span>
                  <h3 className={styles.guideTitle}>{guide.title}</h3>
                  <p className={styles.guideDesc}>{guide.description}</p>

                  <div className={styles.cardFooter}>
                    <span>Read Guide</span>
                    <ArrowRight size={16} className={styles.cardArrow} />
                  </div>
                </Link>
              ))
            ) : (
              <p style={{ color: '#6B7280' }}>More guides coming soon...</p>
            )}
          </div>
        </div>
      </section>

    </main>
  );
}