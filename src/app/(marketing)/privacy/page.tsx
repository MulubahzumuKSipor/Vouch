import Link from 'next/link';
import styles from '@/styles/legal.module.css';

export default function PrivacyPage() {
  const lastUpdated = "March 11, 2026";

  return (
    <main className={styles.main}>

      {/* ── 1. LEGAL HERO ── */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>Legal Agreement</div>
            <h1 className={styles.headline}>Privacy Policy</h1>
            <p className={styles.subheadline}>
              How Vouch collects, uses, and protects your personal data.
            </p>
            <div className={styles.lastUpdated}>Last Updated: {lastUpdated}</div>
          </div>
        </div>
      </section>

      {/* ── 2. DOCUMENT CONTENT ── */}
      <section className={styles.documentSection}>
        <div className={styles.container}>
          <div className={styles.documentLayout}>
            
            {/* Sidebar Navigation (Sticky) */}
            <aside className={styles.sidebar}>
              <nav className={styles.tableOfContents}>
                <h3>Contents</h3>
                <ul>
                  <li><a href="#collection">1. Information We Collect</a></li>
                  <li><a href="#usage">2. How We Use Your Data</a></li>
                  <li><a href="#sharing">3. Data Sharing & Creators</a></li>
                  <li><a href="#security">4. Data Security</a></li>
                  <li><a href="#rights">5. Your Privacy Rights</a></li>
                  <li><a href="#contact">6. Contact Us</a></li>
                </ul>
              </nav>
            </aside>

            {/* Main Legal Text */}
            <div className={styles.legalContent}>
              
              <div id="collection" className={styles.legalSection}>
                <h2>1. Information We Collect</h2>
                <p>
                  To provide the Vouch platform to both Creators and Students, we must collect certain personal information. This includes:
                </p>
                <ul>
                  <li><strong>Account Information:</strong> Your name, email address, and secure password when you register.</li>
                  <li><strong>Financial Information:</strong> For Creators, we collect your MTN Mobile Money number, Orange Money number, or local bank account details to process your payouts. For Buyers, we collect payment details necessary to process the transaction securely via our gateway partners.</li>
                  <li><strong>Usage Data:</strong> Information about how you interact with our platform, such as IP addresses, browser types, and device information to ensure platform security.</li>
                </ul>
              </div>

              <div id="usage" className={styles.legalSection}>
                <h2>2. How We Use Your Data</h2>
                <p>
                  We use your personal data strictly to operate, improve, and protect the Vouch platform. Specifically, we use it to:
                </p>
                <ul>
                  <li>Process transactions and deliver digital products securely to buyers.</li>
                  <li>Issue T+2 payouts to Creators&apos; Mobile Money wallets or bank accounts.</li>
                  <li>Send critical platform notifications, receipt emails, and security alerts.</li>
                  <li>Prevent fraud, enforce our Terms of Service, and comply with Liberian financial regulations.</li>
                </ul>
              </div>

              <div id="sharing" className={styles.legalSection}>
                <h2>3. Data Sharing & The Creator Relationship</h2>
                <p>
                  <strong>We do not sell your personal data to third parties.</strong> However, the nature of our platform requires specific data sharing to function:
                </p>
                <h3>3.1 Sharing with Creators</h3>
                <p>
                  When a Student purchases a product, their name and email address are shared with the Creator who sold the product. This allows the Creator to provide customer support, deliver course updates, and manage their business. Creators are bound by our Terms of Service to use this data strictly for business purposes and are prohibited from selling it or using it for malicious spam.
                </p>
                <h3>3.2 Sharing with Payment Processors</h3>
                <p>
                  We share necessary transaction data securely with our financial partners (e.g., MTN, Orange, commercial banks) strictly to authorize payments and settle funds.
                </p>
              </div>

              <div id="security" className={styles.legalSection}>
                <h2>4. Data Security</h2>
                <p>
                  We implement industry-standard security measures to protect your data. All payment information is encrypted and transmitted securely. However, no internet transmission is 100% secure. You are responsible for keeping your account password confidential and enabling multi-factor authentication if available.
                </p>
              </div>

              <div id="rights" className={styles.legalSection}>
                <h2>5. Your Privacy Rights</h2>
                <p>
                  You have the right to control your personal data on Vouch:
                </p>
                <ul>
                  <li><strong>Access & Export:</strong> Creators can export their student lists and sales data directly from their dashboard at any time.</li>
                  <li><strong>Deletion:</strong> You may request the permanent deletion of your Vouch account and associated data by contacting support, subject to our legal requirement to retain financial transaction records for anti-money laundering (AML) compliance.</li>
                </ul>
              </div>

              <div id="contact" className={styles.legalSection}>
                <h2>6. Contact Us</h2>
                <p>
                  If you have any questions or concerns regarding this Privacy Policy or how your data is handled, please reach out to our privacy team:
                </p>
                <p>
                  <strong>Email:</strong> privacy@vouch.lr<br />
                  <strong>Address:</strong> Monrovia, Montserrado, Liberia
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

    </main>
  );
}