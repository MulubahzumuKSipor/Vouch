'use client'

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Heart, Lightbulb, TrendingUp, ShieldCheck, Wallet, GraduationCap } from "lucide-react";
import Image from "next/image";
import styles from "@/styles/hero.module.css";

export default function HomePage() {
  const words = ["Income.", "Revenue.", "Earnings.", "Capital.", "Funds."];
  const [index, setIndex] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);

  // ── THE COVER & REVEAL ANIMATION TIMER ──
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Trigger the black block to slide over the word
      setIsRevealing(true);

      // 2. Exactly halfway through the animation (400ms), when the word is completely covered, swap it out.
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % words.length);
      }, 400);

      // 3. When the block finishes sliding away (800ms), reset the state for the next cycle.
      setTimeout(() => {
        setIsRevealing(false);
      }, 800);

    }, 4000); // Leaves the word on screen for a solid 4 seconds so it's easily read

    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <main className={styles.main}>

      {/* ── 1. HERO ── */}
      <section className={styles.heroSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.eyebrow}>Built for Liberian Creators & Educators</div>
          <h1 className={styles.headline}>
            You’ve Built Influence. <br />
            Now Turn It Into{' '}
            {/* The Cover Reveal Container */}
            <span className={styles.revealContainer}>
              {words[index]}
              {/* This span only exists while the animation is playing */}
              {isRevealing && <span className={styles.revealBlock}></span>}
            </span>
          </h1>
          <p className={styles.subheadline}>
            Our platform helps Liberian creators, educators, and leaders earn from their audience through direct support, memberships, exclusive access, and community contributions.
          </p>
          <div className={styles.buttonGroup}>
            <Link href="/login" className={styles.primaryBtn}>
              Create Your Support Page
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. THE REALITY ── */}
      <section className={styles.problemSection}>
        <div className={styles.container}>
          <div className={styles.problemGrid}>
            <div className={styles.problemText}>
              <h2 className={styles.sectionTitle}>If You Have an Audience, You Have an Opportunity.</h2>
              <p>
                Are you a university professor sharing deep expertise? A Facebook content creator sparking daily conversations? A WAEC tutor guiding engaged students? Or a TikTok personality setting the trends?
              </p>
              <p>
                <strong>If people follow you, listen to you, or learn from you. They believe in your value.</strong> And people who believe in your value are willing to support it.
              </p>
              <p>
                This is designed for how communities actually grow in Liberia: strong communal ties, loyal followers, dedicated students, and deep personal connections.
              </p>
            </div>
            <div className={styles.problemImagePlaceholder}>
              <div className={styles.imageBox}>
                <Image
                  src="/teacher.jpg"
                  alt="A Liberian educator and creator engaging with their community"
                  fill
                  className={styles.teacherImage}
                  priority
                />
                <div className={styles.imageOverlay} aria-hidden="true"></div>

                <span className={styles.imageQuote}>
                  &quot;Your audience doesn’t just consume your content. They feel connected to your mission. Now, they can financially support it.&quot;
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. THE TOOLS ── */}
      <section className={styles.toolsSection}>
        <div className={styles.container}>
          <div className={styles.centerHeader}>
            <h2 className={styles.sectionTitle}>Direct Support, Direct Growth.</h2>
            <p className={styles.sectionSubtitle}>
              You turn influence and intellect into income. Here is how your community can back you consistently.
            </p>
          </div>

          <div className={styles.toolsGrid}>
            <div className={styles.toolCard}>
              <div className={styles.toolIconRed}><Heart size={28} /></div>
              <h3>Direct Financial Support</h3>
              <p>Receive immediate backing from followers, students, and fans who value your voice and content.</p>
            </div>
            <div className={styles.toolCard}>
              <div className={styles.toolIconGreen}><GraduationCap size={28} /></div>
              <h3>Exclusive Inner Circle</h3>
              <p>Launch a membership for students, professionals, or loyal fans wanting advanced lectures and mentorship.</p>
            </div>
            <div className={styles.toolCard}>
              <div className={styles.toolIconGold}><Lightbulb size={28} /></div>
              <h3>Fund Your Ideas</h3>
              <p>Raise funds to upgrade your studio equipment, back your research, or launch a community initiative.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. THE MATH ── */}
      <section className={styles.paymentsSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.paymentsLayout}>
            <div className={styles.paymentsVisual}>
               <div className={styles.mockupReceipt}>
                  <div className={styles.receiptHeader}>Monthly Predictable Income</div>
                  <div className={styles.receiptAmount}>$500.00</div>
                  <div className={styles.receiptMethod}>
                    <TrendingUp size={16} /> From just 100 loyal supporters
                  </div>
               </div>
            </div>
            <div className={styles.paymentsText}>
              <h2 className={styles.sectionTitle}>Small Audience. Real Income.</h2>
              <p style={{ fontSize: '1.1rem', color: '#4B5563', marginBottom: '1.5rem' }}>
                You don’t need millions of followers. You just need loyal ones.
              </p>
              <ul className={styles.checkList}>
                <li>
                  <strong>Do the math:</strong>
                  <span>If just 100 people support you with $5, that’s $500.</span>
                </li>
                <li>
                  <strong>Predictable Earnings:</strong>
                  <span>If 200 supporters contribute monthly, you’ve built a predictable, sustainable income.</span>
                </li>
                <li>
                  <strong>No viral algorithms needed:</strong>
                  <span>You don&apos;t need to go viral to make a living. You need to go deep.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. VISION & COMMUNITY ── */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <div className={styles.centerHeaderLight}>
            <h2 className={styles.sectionTitleLight}>Ownership Changes Everything.</h2>
            <p className={styles.sectionSubtitleLight}>
              When you monetize your audience directly, your audience becomes your economic power.
            </p>
          </div>

          <div className={styles.valuesGrid}>
            <div className={styles.valueItem}>
              <Wallet size={32} className={styles.accentIconGold} />
              <h4>Control Your Income</h4>
              <p>You decide what you offer. You control your pricing. You stop waiting for unpredictable brand deals or sponsorships.</p>
            </div>
            <div className={styles.valueItem}>
              <ShieldCheck size={32} className={styles.accentIconGreen} />
              <h4>Grow Independently</h4>
              <p>Build a real community, not just a view count. Grow on your own terms with the people who truly believe in your value.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. FINAL CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <h2 className={styles.ctaTitle}>This Is the New Economy in Liberia.</h2>
          <p className={styles.ctaSubtitle}>
            It’s not just about posting. It’s not just about trending. It’s about building sustainable income, stronger communities, and real independence.
          </p>
          <Link href="/login" className={styles.ctaBtn}>
            Create Your Support Page Today
          </Link>
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#FEF3C7' }}>
            Set up your profile. Invite your students and fans. Start receiving support.
          </p>
        </div>
      </section>

    </main>
  );
}