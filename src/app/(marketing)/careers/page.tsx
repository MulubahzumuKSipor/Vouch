import Link from 'next/link';
import { createClient } from '@/lib/server';
import { MapPin, Briefcase, ArrowRight, Globe, Zap, Heart, Code } from 'lucide-react';
import styles from '@/styles/careers.module.css';

// Force Next.js to always fetch the freshest data
export const dynamic = 'force-dynamic';

export default async function CareersPage() {
  const supabase = await createClient();

  // 🔴 Fetch live open roles from Supabase
  const { data: openRoles, error } = await supabase
    .from('open_roles')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching roles:", error);
  }

  const roles = openRoles || [];

  return (
    <main className={styles.main}>

      {/* ── 1. HERO SECTION (Deep Black) ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>Join the Mission</div>
            <h1 className={styles.headline}>
              Build the infrastructure for <br />
              <span className={styles.highlightLine}>the new African economy.</span>
            </h1>
            <p className={styles.subheadline}>
              We are a team of Liberian engineers, designers, and creators building the financial tools to turn local knowledge into sustainable, borderless income. 
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. WHY VOUCH? (Pure White) ── */}
      <section className={styles.cultureSection}>
        <div className={styles.container}>
          <div className={styles.centerHeader}>
            <h2 className={styles.sectionTitle}>How we work</h2>
            <p className={styles.sectionSubtitle}>
              We aren&apos;t just writing code. We are moving money, changing livelihoods, and solving deeply technical problems in a unique emerging market.
            </p>
          </div>

          <div className={styles.cultureGrid}>
            <div className={styles.cultureCard}>
              <div className={styles.iconGold}><Globe size={32} /></div>
              <h3>Global Standards, Local Context</h3>
              <p>We build software that rivals Silicon Valley in speed and security, but is deeply integrated with the realities of Mobile Money and Liberian banking.</p>
            </div>

            <div className={styles.cultureCard}>
              <div className={styles.iconRed}><Zap size={32} /></div>
              <h3>Extreme Ownership</h3>
              <p>No corporate red tape. If you see a problem, you own it. We trust our team to make fast, high-impact decisions.</p>
            </div>

            <div className={styles.cultureCard}>
              <div className={styles.iconGreen}><Heart size={32} /></div>
              <h3>Creator-First Empathy</h3>
              <p>Every line of code we write directly impacts someone&apos;s ability to feed their family. We build with deep empathy and respect for our users.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. OPEN ROLES (Woven White) ── */}
      <section className={styles.rolesSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.rolesHeader}>
            <h2 className={styles.sectionTitle}>Open Positions</h2>
            <div className={styles.titleUnderline}></div>
          </div>

          <div className={styles.rolesGrid}>
            {roles.length > 0 ? (
              roles.map((role) => {
                // If there's an external URL (like Google Forms/ATS), use it. Otherwise, use email.
                const applyLink = role.application_url || `mailto:careers@vouch.lr?subject=Application: ${encodeURIComponent(role.title)}`;

                return (
                  <Link href={applyLink} key={role.id} className={styles.roleCard}>
                    <div className={styles.roleInfo}>
                      <span className={styles.roleDept}>{role.department}</span>
                      <h3 className={styles.roleTitle}>{role.title}</h3>
                      <div className={styles.roleMeta}>
                        <span><MapPin size={16} /> {role.location}</span>
                        <span><Briefcase size={16} /> {role.employment_type}</span>
                      </div>
                    </div>
                    <div className={styles.applyBtn}>
                      Apply Now <ArrowRight size={20} className={styles.applyArrow} />
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className={styles.noRolesState}>
                <Code size={48} className={styles.noRolesIcon} />
                <h3>No open roles right now</h3>
                <p>We aren&apos;t actively hiring for specific positions today, but we are always looking for brilliant minds. Send us your resume anyway!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 4. OPEN APPLICATION (Soft Stone) ── */}
      <section className={styles.openAppSection}>
        <div className={styles.container}>
          <div className={styles.openAppCard}>
            <div className={styles.openAppText}>
              <h2>Don&apos;t see a perfect fit?</h2>
              <p>
                If you are deeply passionate about the creator economy and think you can bring immense value to Vouch, we want to hear from you. Create your own role.
              </p>
            </div>
            <Link href="mailto:mzksipor@gmail.com?subject=Open Application: Vouch" className={styles.primaryBtn}>
              Send an Open Application
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}