import Link from "next/link";
import { Heart, Users, Lightbulb, TrendingUp, ShieldCheck, Wallet } from "lucide-react";
import Image from "next/image";
import styles from "@/styles/hero.module.css";

export default function HomePage() {
  return (
    <main className={styles.main}>

      {/* ── 1. HERO (Warm Sand) ── */}
      <section className={styles.heroSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.eyebrow}>Built for Liberian Creators</div>
          <h1 className={styles.headline}>
            Your Audience Is Valuable. <br />
            Now It Can <span className={styles.highlight}>Pay You Back.</span>
          </h1>
          <p className={styles.subheadline}>
            You’ve built attention. You’ve built influence. You’ve built trust.
            Now you can turn that into income directly from the people who support you. No brand deals required.
          </p>
          <div className={styles.buttonGroup}>
            <Link href="/login" className={styles.primaryBtn}>
              Create Your Support Page
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. THE REALITY (Pure White) ── */}
      <section className={styles.problemSection}>
        <div className={styles.container}>
          <div className={styles.problemGrid}>
            <div className={styles.problemText}>
              <h2 className={styles.sectionTitle}>Stop Depending Only on Brand Deals.</h2>
              <p>
                Brand deals are inconsistent, hard to get, not guaranteed, and often underpaid.
                Why wait for a company to value you when your audience already does?
              </p>
              <p>
                <strong>If you have followers, you can earn.</strong> Whether you are a TikTok personality, a community leader, or a WAEC tutor with engaged students. If people follow you, they believe in you. And people who believe in you are willing to support you.
              </p>
            </div>
            <div className={styles.problemImagePlaceholder}>
              <div className={styles.imageBox}>
                <Image
                  src="/teacher.jpg" /* 🔴 Update this image in your public folder */
                  alt="A Liberian content creator engaging with their community"
                  fill
                  className={styles.teacherImage}
                  priority
                />
                <div className={styles.imageOverlay} aria-hidden="true"></div>

                <span className={styles.imageQuote}>
                  &quot;Your followers don’t just watch you. They feel connected to you. Now they can support you.&quot;
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. THE TOOLS (Soft Stone) ── */}
      <section className={styles.toolsSection}>
        <div className={styles.container}>
          <div className={styles.centerHeader}>
            <h2 className={styles.sectionTitle}>Turn your influence into income.</h2>
            <p className={styles.sectionSubtitle}>
              With our platform, your supporters can back you consistently. You decide your offers. You build community, not just views.
            </p>
          </div>

          <div className={styles.toolsGrid}>
            <div className={styles.toolCard}>
              <div className={styles.toolIcon}><Heart size={28} /></div>
              <h3>Direct Support</h3>
              <p>Receive direct financial support from followers who value your voice and your content.</p>
            </div>
            <div className={styles.toolCard}>
              <div className={styles.toolIcon}><Users size={28} /></div>
              <h3>Exclusive Community</h3>
              <p>Launch a supporter club where fans contribute monthly for exclusive access to you.</p>
            </div>
            <div className={styles.toolCard}>
              <div className={styles.toolIcon}><Lightbulb size={28} /></div>
              <h3>Fund Your Ideas</h3>
              <p>Raise funds to upgrade your equipment, host community events, or launch your next big project.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. THE MATH (Warm Sand) ── */}
      <section className={styles.paymentsSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.paymentsLayout}>
            <div className={styles.paymentsVisual}>
               <div className={styles.mockupReceipt}>
                  <div className={styles.receiptHeader}>Monthly Predictable Income</div>
                  <div className={styles.receiptAmount}>$500.00</div>
                  <div className={styles.receiptMethod}>
                    <TrendingUp size={16} /> From 100 loyal supporters
                  </div>
               </div>
               {/* 🔴 Adding diagram for context */}

            </div>
            <div className={styles.paymentsText}>
              <h2 className={styles.sectionTitle}>Small Audience. Real Income.</h2>
              <p style={{ fontSize: '1.1rem', color: '#4B5563', marginBottom: '1.5rem' }}>
                You don’t need millions of followers. You need to go deep.
              </p>
              <ul className={styles.checkList}>
                <li>
                  <strong>Do the math:</strong>
                  <span>If just 100 followers support you with $5, that’s $500.</span>
                </li>
                <li>
                  <strong>Predictable Earnings:</strong>
                  <span>If 200 supporters contribute monthly, you’ve created sustainable, predictable income.</span>
                </li>
                <li>
                  <strong>No viral algorithms needed:</strong>
                  <span>You don&apos;t need to trend to make a living. You just need a true community.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. VISION & COMMUNITY (Deep Charcoal) ── */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <div className={styles.centerHeaderLight}>
            <h2 className={styles.sectionTitleLight}>Ownership Changes Everything.</h2>
            <p className={styles.sectionSubtitleLight}>
              Imagine a campus influencer raising funds for a project, or a content creator buying a new camera through audience support.
            </p>
          </div>

          <div className={styles.valuesGrid}>
            <div className={styles.valueItem}>
              <Wallet size={32} className={styles.accentIcon} />
              <h4>Control Your Income</h4>
              <p>When you monetize your audience directly, you stop waiting for permission from sponsors. Your audience becomes your economic power.</p>
            </div>
            <div className={styles.valueItem}>
              <ShieldCheck size={32} className={styles.accentIcon} />
              <h4>Grow Independently</h4>
              <p>Built for how creators actually grow in Liberia: strong community ties, loyal followers, and active, personal engagement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FINAL CTA (Terracotta) ── */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>This Is the New Creator Economy in Liberia.</h2>
          <p className={styles.ctaSubtitle}>
            Not just posting. Not just trending. Building sustainable income and stronger communities.
          </p>
          <Link href="/login" className={styles.ctaBtn}>
            Create Your Support Page Today
          </Link>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#FCA5A5' }}>
            Set up your page. Invite your followers. Start receiving support.
          </p>
        </div>
      </section>

    </main>
  );
}