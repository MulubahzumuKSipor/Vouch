import Link from "next/link";
import { BookOpen, CalendarHeart, DownloadCloud, HeartHandshake, ShieldCheck, Smartphone } from "lucide-react";
import Image from "next/image";
import styles from "@/styles/hero.module.css";

export default function HomePage() {
  return (
    <main className={styles.main}>

      {/* ── 1. HERO (Warm Sand) ── */}
      <section className={styles.heroSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.eyebrow}>Built for Liberian Educators & Creators</div>
          <h1 className={styles.headline}>
            Your knowledge is valuable. <br />
            We make it simple to <span className={styles.highlight}>share it.</span>
          </h1>
          <p className={styles.subheadline}>
            You are a teacher, a consultant, a creator. You shouldn&apos;t have to fight
            complex foreign tech just to get paid. Vouch lets your students and clients
            pay with Mobile Money, so you can focus on what you do best.
          </p>
          <div className={styles.buttonGroup}>
            <Link href="/signup" className={styles.primaryBtn}>
              Start Your Free Classroom
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. THE REALITY (Pure White) ── */}
      <section className={styles.problemSection}>
        <div className={styles.container}>
          <div className={styles.problemGrid}>
            <div className={styles.problemText}>
              <h2 className={styles.sectionTitle}>Global platforms weren&apos;t built for our reality.</h2>
              <p>
                A tutor in Monrovia shouldn&apos;t lose a student because they can&apos;t
                accept MTN Mobile Money online. A consultant in Buchanan shouldn&apos;t struggle
                to get paid because international websites don&apos;t support Liberian bank accounts.
              </p>
              <p>
                <strong>We built Vouch to fix this.</strong> We handle the
                complexities of local payments and digital delivery so you can serve your community without the headache.
              </p>
            </div>
            <div className={styles.problemImagePlaceholder}>
              <div className={styles.imageBox}>
                <Image
                  src="/teacher.jpg"
                  alt="A Liberian teacher managing their online classroom"
                  fill
                  className={styles.teacherImage}
                  priority /* Loads this image quickly since it's above the fold */
                />
                {/* Dark gradient overlay to make the white text readable */}
                <div className={styles.imageOverlay} aria-hidden="true"></div>

                <span className={styles.imageQuote}>
                  &quot;Finally, a platform that understands how my students actually pay.&quot;
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
            <h2 className={styles.sectionTitle}>Everything you need to share your gift.</h2>
            <p className={styles.sectionSubtitle}>
              No coding required. Just upload what you know, and we give you a beautiful link to share on WhatsApp or Facebook.
            </p>
          </div>

          <div className={styles.toolsGrid}>
            <div className={styles.toolCard}>
              <div className={styles.toolIcon}><BookOpen size={28} /></div>
              <h3>Your Online Classroom</h3>
              <p>Upload video lessons, share notes, and track your students&apos; progress. We make sure it loads fast on mobile phones.</p>
            </div>
            <div className={styles.toolCard}>
              <div className={styles.toolIcon}><CalendarHeart size={28} /></div>
              <h3>Book Your Time</h3>
              <p>Offer 1-on-1 coaching or consulting. Clients pick a time, pay upfront, and get a meeting link automatically.</p>
            </div>
            <div className={styles.toolCard}>
              <div className={styles.toolIcon}><DownloadCloud size={28} /></div>
              <h3>Share Resources</h3>
              <p>Sell your e-books, study guides, or templates. As soon as they pay, they get the file instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. THE LOCAL ADVANTAGE (Warm Sand) ── */}
      <section className={styles.paymentsSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.paymentsLayout}>
            <div className={styles.paymentsVisual}>
               <div className={styles.mockupReceipt}>
                  <div className={styles.receiptHeader}>New Student Enrolled</div>
                  <div className={styles.receiptAmount}>LRD 4,500</div>
                  <div className={styles.receiptMethod}>
                    <Smartphone size={16} /> Paid via Orange Money
                  </div>
               </div>
            </div>
            <div className={styles.paymentsText}>
              <h2 className={styles.sectionTitle}>Make it easy for them to pay.</h2>
              <ul className={styles.checkList}>
                <li>
                  <strong>MTN & Orange Money Ready</strong>
                  <span>Your people pay with what&apos;s already in their pockets.</span>
                </li>
                <li>
                  <strong>Direct to your Bank</strong>
                  <span>Get your earnings sent straight to your local account in LRD or USD.</span>
                </li>
                <li>
                  <strong>No Hidden Surprises</strong>
                  <span>Free to start. We only take a small, transparent 10% fee when you actually make a sale.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. VALUES & COMMUNITY (Deep Charcoal) ── */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <div className={styles.centerHeaderLight}>
            <h2 className={styles.sectionTitleLight}>Our promise to you.</h2>
            <p className={styles.sectionSubtitleLight}>
              We are a small team building from Monrovia. We don&apos;t answer to overseas investors; we answer to you.
            </p>
          </div>

          <div className={styles.valuesGrid}>
            <div className={styles.valueItem}>
              <HeartHandshake size={32} className={styles.accentIcon} />
              <h4>Creators First</h4>
              <p>Every decision we make starts with one question: &quot;Does this help you earn more for your family?&quot;</p>
            </div>
            <div className={styles.valueItem}>
              <ShieldCheck size={32} className={styles.accentIcon} />
              <h4>Africa-Grade Reliable</h4>
              <p>We know internet drops and power cuts happen. We built Vouch to be fast, light, and resilient.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FINAL CTA (Terracotta) ── */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>Ready to welcome your students?</h2>
          <p className={styles.ctaSubtitle}>
            Join the community of Liberian experts building a living from their knowledge.
          </p>
          <Link href="/signup" className={styles.ctaBtn}>
            Create Your Free Account
          </Link>
        </div>
      </section>

    </main>
  );
}