import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, Mail, Globe, Shield, Zap } from "lucide-react";
import styles from "@/styles/about.module.css";

export default function AboutPage() {
  return (
    <main className={styles.main}>

      {/* ── 1. GRAND HERO ── */}
      <section className={styles.grandHero}>
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.grandHeroContent}>
            <h1 className={styles.grandHeadline}>
              You built the <span className={styles.highlightLine}>influence.</span> <br />
              We built the <span className={styles.highlightLine}>infrastructure.</span>
            </h1>
            <p className={styles.grandSubheadline}>
              We are a team of Liberians building the financial tools educators, creators, and community leaders need to turn their knowledge into sustainable income.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. THE ORIGIN STORY ── */}
      <section className={styles.originSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />

        <div className={styles.container}>
          <div className={styles.originLayout}>
            {/* Left Side: The Narrative */}
            <div className={styles.textContent}>
              <div className={styles.eyebrow}>Our Story</div>
              <h2 className={styles.headline}>
                We build for the voices <br />
                <span className={styles.highlight}>the global economy ignored.</span>
              </h2>
              <div className={styles.prose}>
                <p>
                  Our journey didn&apos;t start in a Silicon Valley boardroom. It started right here in Monrovia, born out of a very real, everyday frustration.
                </p>
                <p>
                  We are surrounded by incredible talent. Every day, we see university professors sharing deep expertise, WAEC tutors guiding the next generation, and digital creators shaping our culture. But despite their massive influence, turning that value into a sustainable living felt nearly impossible.
                </p>
                <p>
                  The problem wasn&apos;t a lack of audience; it was a lack of infrastructure. Global platforms simply don&apos;t work for us. They ignore our local bank accounts and don&apos;t connect with the Mobile Money networks that actually power our daily lives. Our brightest minds were being locked out of the modern digital economy.
                </p>
                <p>
                  We realized that if we wanted a system that actually worked for Liberians, we couldn&apos;t wait for the rest of the world to include us. We had to engineer the solution ourselves from the ground up. That is why we built Vouch.
                </p>
              </div>
            </div>

            {/* Right Side: The Visual Anchor */}
            <div className={styles.visualContent}>
              <div className={styles.imageWrapper}>
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

      {/* ── 3. NEW: THE VOUCH STANDARD (Core Values) ── */}
      <section className={styles.valuesSection}>
        <div className={styles.container}>
          <div className={styles.centerHeader}>
            <h2 className={styles.sectionTitle}>The Vouch Standard.</h2>
            <p className={styles.sectionSubtitle}>
              We don&apos;t just write code. We build economic bridges based on three uncompromising principles.
            </p>
          </div>

          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.iconGold}><Globe size={28} /></div>
              <h3>Local Reality, Global Standard</h3>
              <p>Engineered to seamlessly handle Liberian Mobile Money and local banking, while maintaining the speed and reliability of a Wall Street fintech.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.iconRed}><Zap size={28} /></div>
              <h3>Creator Sovereignty</h3>
              <p>You own your audience. We don&apos;t restrict your reach with algorithms or dictate your worth. We simply provide the highway for your income.</p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.iconGreen}><Shield size={28} /></div>
              <h3>Unbreakable Trust</h3>
              <p>When dealing with people&apos;s livelihoods, security is not a feature. It is the foundation. Every transaction is encrypted, verified, and protected.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. THE TEAM ── */}
      <section className={styles.teamSection}>
        <div className={styles.container}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>The team building the new economy.</h2>
            <p className={styles.sectionSubtitle}>
              A dedicated team engineering global-standard financial tools from Montserrado, Liberia.
            </p>
          </div>

          <div className={styles.teamGrid}>
            <div className={styles.teamCard}>
              <div className={styles.photoWrapper}>
                <Image
                  src="/profile1.jpeg"
                  alt="Mulubahzumu Kemmeh Sipor - Founder & Technical Lead"
                  fill
                  className={styles.teamPhoto}
                />
              </div>
              <h3 className={styles.teamName}>Mulubahzumu Kemmeh Sipor</h3>
              <p className={styles.teamRole}>Founder & Technical Lead</p>
              <p className={styles.teamBio}>
                Full-stack developer obsessed with making digital payments invisible, ensuring local creators can seamlessly monetize their craft and intellect.
              </p>
            </div>

            <div className={styles.teamCard}>
              <div className={styles.photoWrapper}>
                <Image
                  src="/profile2.png"
                  alt="Chris B. Jones - Co-Founder"
                  fill
                  className={styles.teamPhoto}
                />
              </div>
              <h3 className={styles.teamName}>Chris B. Jones</h3>
              <p className={styles.teamRole}>Co-Founder</p>
              <p className={styles.teamBio}>
                Drives growth and partnerships, ensuring every educator and creator on Vouch has the exact tools they need to succeed independently.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. NEW: THE VISION (The Movement) ── */}
      <section className={styles.visionSection}>
        <div className={styles.visionTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.visionContent}>
            <h2 className={styles.visionHeadline}>
              The next generation of African wealth won&apos;t be extracted from the ground.
            </h2>
            <p className={styles.visionText}>
              It will be generated by the minds, the creativity, and the influence of its people. We are building the infrastructure to ensure that wealth stays in the hands of the creators who build it.
            </p>
            <div className={styles.visionAccentLine}></div>
          </div>
        </div>
      </section>

      {/* ── 6. CAREERS & CONTACT ── */}
      <section className={styles.contactSection}>
        <div className={styles.container}>
          <div className={styles.contactLayout}>
            <div className={styles.contactBox}>
              <h3 className={styles.contactTitle}>Join the Team</h3>
              <p className={styles.contactText}>
                We are always looking for brilliant engineers, designers, and community builders who want to shape the new African creator economy.
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