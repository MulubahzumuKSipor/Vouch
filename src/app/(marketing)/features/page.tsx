import Link from 'next/link';
import Image from 'next/image';
import { 
  Video, 
  Download, 
  CalendarCheck, 
  Users, 
  Smartphone, 
  BarChart3, 
  ShieldCheck, 
  Globe 
} from 'lucide-react';
import styles from '@/styles/featuresPage.module.css';
import { CTA } from '@/components/marketing/cta';

export default function FeaturesPage() {
  return (
    <main className={styles.main}>

      {/* ── 1. HERO ── */}
      <section className={styles.heroSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>The Vouch Toolkit</div>
            <h1 className={styles.headline}>
              Everything you need to <br />
              <span className={styles.highlightLine}>run your empire.</span>
            </h1>
            <p className={styles.subheadline}>
              We replaced four different expensive software subscriptions with one powerful, locally-integrated dashboard. Build, sell, and manage your business from anywhere.
            </p>
            <div className={styles.buttonGroup}>
              <Link href="/login" className={styles.primaryBtn}>Start Building for Free</Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. CORE MONETIZATION PILLARS (Woven White) ── */}
      <section className={styles.pillarsSection}>
        <div className={styles.container}>
          <div className={styles.centerHeader}>
            <h2 className={styles.sectionTitle}>Four ways to monetize your mind.</h2>
            <p className={styles.sectionSubtitle}>Mix and match these tools to create the perfect business model for your specific audience.</p>
          </div>

          <div className={styles.pillarsGrid}>
            {/* Feature 1: Digital Products */}
            <div className={styles.pillarCard}>
              <div className={styles.iconRed}><Download size={32} /></div>
              <h3>Digital Downloads</h3>
              <p>Sell e-books, templates, research papers, and audio files. Secure file delivery happens automatically the second a customer pays.</p>
              <ul className={styles.featureList}>
                <li>Automated email delivery</li>
                <li>PDF stamping to prevent theft</li>
                <li>Unlimited file storage</li>
              </ul>
            </div>

            {/* Feature 2: Courses */}
            <div className={styles.pillarCard}>
              <div className={styles.iconGold}><Video size={32} /></div>
              <h3>Video Courses</h3>
              <p>Host your entire curriculum on Vouch. Build rich, multi-module video courses for your students or professional peers.</p>
              <ul className={styles.featureList}>
                <li>High-definition video hosting</li>
                <li>Progress tracking for students</li>
                <li>Drip-feed content scheduling</li>
              </ul>
            </div>

            {/* Feature 3: Bookings */}
            <div className={styles.pillarCard}>
              <div className={styles.iconGreen}><CalendarCheck size={32} /></div>
              <h3>Calendar Bookings</h3>
              <p>Charge for your time. Perfect for 1-on-1 tutoring, legal consultations, or private coaching sessions.</p>
              <ul className={styles.featureList}>
                <li>Syncs with Google Calendar</li>
                <li>Automated Zoom/Meet links</li>
                <li>Custom availability windows</li>
              </ul>
            </div>

            {/* Feature 4: Memberships */}
            <div className={styles.pillarCard}>
              <div className={styles.iconDark}><Users size={32} /></div>
              <h3>Memberships</h3>
              <p>Build recurring monthly income. Create an exclusive inner circle for your most loyal supporters with locked content.</p>
              <ul className={styles.featureList}>
                <li>Monthly recurring billing</li>
                <li>Exclusive member-only posts</li>
                <li>Tiered pricing options</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. PAYMENTS & INFRASTRUCTURE (Deep Black) ── */}
      <section className={styles.infrastructureSection}>
        <div className={styles.infrastructureTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.infraGrid}>
            <div className={styles.infraText}>
              <h2 className={styles.sectionTitleLight}>Built for the Liberian Economy.</h2>
              <p className={styles.sectionSubtitleLight}>
                Stop losing customers because they don&apos;t have international credit cards. Vouch integrates directly with the payment methods your audience actually uses every day.
              </p>
              
              <div className={styles.infraFeatures}>
                <div className={styles.infraItem}>
                  <Smartphone className={styles.accentGold} size={24} />
                  <div>
                    <h4>MTN & Orange Mobile Money</h4>
                    <p>Native checkout experience for MoMo users.</p>
                  </div>
                </div>
                <div className={styles.infraItem}>
                  <ShieldCheck className={styles.accentRed} size={24} />
                  <div>
                    <h4>Bank-Level Security</h4>
                    <p>PCI-compliant processing and encrypted data protection.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.infraVisual}>
              <div className={styles.glassCard}>
                <div className={styles.mockupHeader}>Recent Transactions</div>
                <div className={styles.mockupRow}>
                  <span className={styles.mockupUser}>+231 77 *** ****</span>
                  <span className={styles.mockupStatus}>Success</span>
                  <span className={styles.mockupAmount}>LRD 1,500</span>
                </div>
                <div className={styles.mockupRow}>
                  <span className={styles.mockupUser}>+231 88 *** ****</span>
                  <span className={styles.mockupStatus}>Success</span>
                  <span className={styles.mockupAmount}>LRD 3,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. CREATOR DASHBOARD (Pure White) ── */}
      <section className={styles.dashboardSection}>
        <div className={styles.container}>
          <div className={styles.dashboardLayout}>
            <div className={styles.dashboardVisual}>
              <div className={styles.dashImageFrame}>
                <div className={styles.placeholderDash}>
                  <BarChart3 size={64} color="#E5E7EB" />
                  <p>Dashboard Preview</p>
                </div>
                {/* When you have a screenshot of the dashboard, use this:
                <Image src="/dashboard-preview.jpg" alt="Vouch Creator Dashboard" fill className={styles.dashImg} />
                */}
              </div>
            </div>
            <div className={styles.dashboardText}>
              <div className={styles.eyebrowDark}>Analytics & Control</div>
              <h2 className={styles.sectionTitle}>Know exactly how your business is growing.</h2>
              <p className={styles.dashboardDesc}>
                Your Vouch dashboard gives you absolute clarity over your income, audience growth, and top-performing products.
              </p>
              <ul className={styles.dashList}>
                <li><strong>Real-time Sales Data:</strong> Track revenue across different products instantly.</li>
                <li><strong>Customer Export:</strong> You own your audience data. Export your student lists anytime.</li>
                <li><strong>Payout Management:</strong> One click to transfer funds to your local bank account.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </main>
  );
}