"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "@/styles/navbar.module.css";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className={styles.nav}>
        <div className={styles.container}>

          {/* Hamburger — sits left of logo on mobile */}
          <button
            className={styles.hamburger}
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <span className={`${styles.bar} ${open ? styles.barTop : ""}`} />
            <span className={`${styles.bar} ${open ? styles.barMid : ""}`} />
            <span className={`${styles.bar} ${open ? styles.barBot : ""}`} />
          </button>

          <Link href="/" className={styles.logo}>
            Vouch<span className={styles.dot}>.</span>
          </Link>

          {/* Desktop links — hidden on mobile */}
          <div className={styles.links}>
            <Link href="/about"     className={styles.link}>About</Link>
            <Link href="/pricing"   className={styles.link}>Pricing</Link>
            <Link href="/community" className={styles.link}>Community</Link>
          </div>

          <div className={styles.actions}>
            <Link href="/login"  className={styles.loginBtn}>Log in</Link>
            <Link href="/login" className={styles.ctaBtn}>Start Selling</Link>
          </div>

        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}
        aria-hidden={!open}
      >
        <div className={styles.drawerInner}>
          <Link href="/about"     className={styles.drawerLink} onClick={() => setOpen(false)}>About</Link>
          <Link href="/pricing"   className={styles.drawerLink} onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/community" className={styles.drawerLink} onClick={() => setOpen(false)}>Community</Link>
          <div className={styles.drawerDivider} />
          <Link href="/login"  className={styles.drawerLogin}  onClick={() => setOpen(false)}>Log in</Link>
          <Link href="/signup" className={styles.drawerCta}    onClick={() => setOpen(false)}>Start Selling Free</Link>
        </div>
      </div>

      {/* Backdrop */}
      {open && (
        <div
          className={styles.backdrop}
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
}