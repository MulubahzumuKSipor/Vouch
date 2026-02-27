import Link from "next/link";
import { ArrowRight } from "lucide-react";
import styles from "@/styles/cta.module.css";

export function CTA() {
  return (
    <section className={styles.section}>
      {/* --- GEOMETRIC BACKGROUND PATTERN --- */}
      <div className={styles.patternOverlay} aria-hidden="true" />

      <div className={styles.container}>
        <h2 className={styles.title}>
          Turn your expertise <br /> into your economy.
        </h2>
        <p className={styles.subtitle}>
          Join the new wave of Liberian creators building wealth on their own terms.
          No setup fees. No tech stress.
        </p>

        <Link href="/signup" className={styles.primaryBtn}>
          Start Selling Free
          <ArrowRight size={24} strokeWidth={3} />
        </Link>

        <p className={styles.footerNote}>
          Ready in under 10 minutes
        </p>
      </div>
    </section>
  );
}