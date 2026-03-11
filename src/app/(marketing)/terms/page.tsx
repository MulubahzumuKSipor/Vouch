import Link from 'next/link';
import styles from '@/styles/legal.module.css';

export default function TermsPage() {
  const lastUpdated = "March 11, 2026";

  return (
    <main className={styles.main}>

      {/* ── 1. LEGAL HERO ── */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>Legal Agreement</div>
            <h1 className={styles.headline}>Terms of Service</h1>
            <p className={styles.subheadline}>
              Please read these terms carefully before using the Vouch platform.
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
                  <li><a href="#acceptance">1. Acceptance of Terms</a></li>
                  <li><a href="#description">2. Description of Service</a></li>
                  <li><a href="#accounts">3. Creator Accounts</a></li>
                  <li><a href="#payments">4. Payments & Payouts</a></li>
                  <li><a href="#prohibited">5. Prohibited Content</a></li>
                  <li><a href="#liability">6. Limitation of Liability</a></li>
                  <li><a href="#contact">7. Contact Us</a></li>
                </ul>
              </nav>
            </aside>

            {/* Main Legal Text */}
            <div className={styles.legalContent}>
              
              <div id="acceptance" className={styles.legalSection}>
                <h2>1. Acceptance of Terms</h2>
                <p>
                  By accessing or using the Vouch website, services, or platform (collectively, the &quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may not access or use the Service. Vouch operates out of Monrovia, Liberia, and these terms are governed by the laws of the Republic of Liberia.
                </p>
              </div>

              <div id="description" className={styles.legalSection}>
                <h2>2. Description of Service</h2>
                <p>
                  Vouch provides a digital storefront and platform that allows independent creators, educators, and experts (&quot;Creators&quot;) to sell digital downloads, video courses, and calendar bookings to their audience (&quot;Students&quot; or &quot;Buyers&quot;). Vouch acts solely as a technology provider and payment facilitator between the Creator and the Buyer. We do not own, create, or take responsibility for the digital products sold by Creators on our platform.
                </p>
              </div>

              <div id="accounts" className={styles.legalSection}>
                <h2>3. Creator Accounts & Responsibilities</h2>
                <p>
                  To sell on Vouch, you must register for a Creator account. You agree to provide accurate, current, and complete information, including your legal name and legitimate payment details.
                </p>
                <ul>
                  <li>You are responsible for safeguarding your password and account security.</li>
                  <li>You are solely responsible for all content, products, and services you upload and sell.</li>
                  <li>You must have the legal right to distribute any content you upload. Plagiarism or copyright infringement will result in immediate account termination.</li>
                </ul>
              </div>

              <div id="payments" className={styles.legalSection}>
                <h2>4. Payments, Fees, and Payouts</h2>
                <p>
                  Vouch is designed specifically for the Liberian economy. By monetizing on our platform, you agree to our payment processing rules:
                </p>
                <h3>4.1 Payment Methods</h3>
                <p>
                  Currently, Vouch exclusively processes transactions using <strong>MTN Mobile Money, Orange Money, and local Liberian Bank Transfers</strong>. We do not currently support international wire transfers or international credit card processing.
                </p>
                <h3>4.2 Platform Fees</h3>
                <p>
                  Vouch charges a flat <strong>10% transaction fee</strong> on every successful sale. This fee covers platform hosting, secure file delivery, and the telecommunication/gateway processing fees. There are no monthly subscription fees.
                </p>
                <h3>4.3 Payout Schedule & Currency</h3>
                <p>
                  Vouch operates on a <strong>T+2 payout schedule</strong>. Funds from a sale become available for withdrawal 2 business days after the transaction. To protect you from exchange rate fluctuations, payouts are settled <strong>&quot;Like-for-Like.&quot;</strong> If a buyer pays in LRD, your payout will be in LRD. If a buyer pays in USD, your payout will be in USD. You must provide a valid MoMo number or local bank account matching the currency you wish to withdraw.
                </p>
              </div>

              <div id="prohibited" className={styles.legalSection}>
                <h2>5. Prohibited Content</h2>
                <p>
                  To maintain our standing with local telecommunication providers and banks, Vouch enforces a strict acceptable use policy. You may not use Vouch to sell or distribute:
                </p>
                <ul>
                  <li>Pornography or sexually explicit content.</li>
                  <li>Fraudulent schemes, &quot;get-rich-quick&quot; scams, or unverified financial advice.</li>
                  <li>Content that promotes violence, hate speech, or discrimination.</li>
                  <li>Any goods or services that are illegal under the laws of Liberia.</li>
                </ul>
                <p>Violation of these rules will result in immediate account termination and forfeiture of pending payouts.</p>
              </div>

              <div id="liability" className={styles.legalSection}>
                <h2>6. Limitation of Liability</h2>
                <p>
                  Vouch provides its platform on an &quot;as is&quot; and &quot;as available&quot; basis. We do not guarantee that the Service will be uninterrupted or error-free. In no event shall Vouch, its directors, or employees be liable for any indirect, incidental, or consequential damages resulting from your use of the platform, including lost profits or data loss.
                </p>
              </div>

              <div id="contact" className={styles.legalSection}>
                <h2>7. Contact Us</h2>
                <p>
                  If you have any questions about these Terms, please contact our legal team:
                </p>
                <p>
                  <strong>Email:</strong> legal@vouch.lr<br />
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