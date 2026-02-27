import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Mail } from "lucide-react";
import styles from "@/styles/about.module.css";

export default function AboutPage() {
  return (
    <main className={styles.main}>

      {/* ── 1. GRAND HERO (Immersive Emotional Hook) ── */}
      <section className={styles.grandHero}>
        {/* Background image is handled in CSS, but the overlay makes text readable */}
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.grandHeroContent}>
            <h1 className={styles.grandHeadline}>
              Empowering the voices that shape our future.
            </h1>
            <p className={styles.grandSubheadline}>
              We are a team of Liberians building the tools you need to share your knowledge, grow your community, and earn a living on your own terms.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. THE ORIGIN STORY (Warm Sand) ── */}
      <section className={styles.originSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />

        <div className={styles.container}>
          <div className={styles.originLayout}>

            {/* Left Side: The Narrative */}
            <div className={styles.textContent}>
              <div className={styles.eyebrow}>Our Story</div>
              <h2 className={styles.headline}>
                We build for the creators <br />
                <span className={styles.highlight}>the world forgot.</span>
              </h2>
              <div className={styles.prose}>
                <p>
                  Our journey didn&apos;t start in a Silicon Valley boardroom. It started right here in Monrovia.
                </p>
                <p>
                  Previously, we built platforms that grew from local use to serving users across the United States who wanted to support their families back home. We saw firsthand how life-changing it is when technology removes borders and lets money flow freely.
                </p>
                <p>
                  But we noticed a massive gap. While traditional merchants were getting online, individual experts—teachers, consultants, writers, and creators—were being left behind because global platforms refused to support local bank accounts or Mobile Money.
                </p>
                <p>
                  We realized that if we wanted an economy that worked for Liberian creators, we couldn&apos;t wait for someone else to build it. We had to build Vouch.
                </p>
              </div>
            </div>

            {/* Right Side: The Visual Anchor */}
            <div className={styles.visualContent}>
              <div className={styles.imageWrapper}>
                {/* Make sure team.jpg is in your public folder */}
                <Image
                  src="/team.jpg"
                  alt="Liberian creators working together"
                  fill
                  className={styles.originImage}
                />
                <div className={styles.imageOverlay} aria-hidden="true" />
              </div>
              <div className={styles.accentBlock} aria-hidden="true" />
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. THE TEAM (Pure White) ── */}
      <section className={styles.teamSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>The people behind the platform.</h2>
            <p className={styles.sectionSubtitle}>
              A small, dedicated team building global-standard infrastructure from Montserrado, Liberia.
            </p>
          </div>

          <div className={styles.teamGrid}>
            {/* Team Member 1 */}
            <div className={styles.teamCard}>
              <div className={styles.photoWrapper}>
                <div className={styles.photoPlaceholder}>👤</div>
              </div>
              <h3 className={styles.teamName}>Mulubahzumu Kemmeh Sipor</h3>
              <p className={styles.teamRole}>Founder & Technical Lead</p>
              <p className={styles.teamBio}>
                Full-stack developer obsessed with making digital payments invisible and accessible for everyone in West Africa.
              </p>
            </div>

            {/* Team Member 2 */}
            <div className={styles.teamCard}>
              <div className={styles.photoWrapper}>
                <div className={styles.photoPlaceholder}>👤</div>
              </div>
              <h3 className={styles.teamName}>Chris B. Jones</h3>
              <p className={styles.teamRole}>Co-Founder</p>
              <p className={styles.teamBio}>
                Drives growth, partnerships, and ensures every creator on Vouch has the tools they need to succeed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. CAREERS & CONTACT (Soft Stone) ── */}
      <section className={styles.contactSection}>
        <div className={styles.container}>
          <div className={styles.contactLayout}>

            <div className={styles.contactBox}>
              <h3 className={styles.contactTitle}>Join the Team</h3>
              <p className={styles.contactText}>
                We are always looking for brilliant engineers, designers, and community builders who want to shape the African creator economy.
              </p>
              <Link href="/careers" className={styles.textLink}>
                View open roles <ArrowRight size={16} />
              </Link>
            </div>

            <div className={styles.contactBox}>
              <h3 className={styles.contactTitle}>Get in Touch</h3>
              <div className={styles.contactItem}>
                <MapPin size={20} className={styles.contactIcon} />
                <span>Monrovia, Montserrado, Liberia</span>
              </div>
              <div className={styles.contactItem}>
                <Mail size={20} className={styles.contactIcon} />
                <span>hello@vouch.lr</span>
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}