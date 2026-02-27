import Link from "next/link";
import { CheckCircle2, HelpCircle, XCircle, Smartphone, Landmark, ArrowRight } from "lucide-react";
import styles from "@/styles/pricing.module.css";

export default function PricingPage() {
  return (
    <main className={styles.main}>

      {/* ── 1. HERO (Warm Sand) ── */}
      <section className={styles.heroSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.eyebrow}>Simple & Transparent</div>
          <h1 className={styles.headline}>
            We only succeed when <br />
            <span className={styles.highlight}>you succeed.</span>
          </h1>
          <p className={styles.subheadline}>
            No monthly subscriptions. No setup fees. No hidden charges.
            You get full access to every feature Vouch offers from day one, absolutely free.
          </p>
        </div>
      </section>

      {/* ── 2. THE PRICING CARD (Overlaps Hero) ── */}
      <section className={styles.pricingSection}>
        <div className={styles.container}>
          <div className={styles.pricingCard}>
            <div className={styles.cardHeader}>
              <h2 className={styles.planName}>Pay-As-You-Earn</h2>
              <div className={styles.priceContainer}>
                <span className={styles.priceSymbol}>$</span>
                <span className={styles.priceAmount}>0</span>
                <span className={styles.pricePeriod}>/ month</span>
              </div>
              <p className={styles.priceDesc}>
                Create your classroom, upload products, and set up your booking calendar for free.
              </p>
            </div>

            <div className={styles.transactionFee}>
              <div className={styles.feeHighlight}>10%</div>
              <div className={styles.feeText}>
                <strong>Flat Transaction Fee</strong>
                <p>We only take a small cut when you make a sale. This covers Mobile Money processing, secure hosting, and instant delivery.</p>
              </div>
            </div>

            <div className={styles.featuresList}>
              <p className={styles.featuresTitle}>Everything is included:</p>
              <ul>
                <li><CheckCircle2 size={20} className={styles.checkIcon} /> Unlimited Courses & Video Hosting</li>
                <li><CheckCircle2 size={20} className={styles.checkIcon} /> Unlimited Digital Product Downloads</li>
                <li><CheckCircle2 size={20} className={styles.checkIcon} /> Automated Calendar & Bookings</li>
                <li><CheckCircle2 size={20} className={styles.checkIcon} /> Accept MTN & Orange Mobile Money</li>
                <li><CheckCircle2 size={20} className={styles.checkIcon} /> Accept Visa & Mastercard</li>
                <li><CheckCircle2 size={20} className={styles.checkIcon} /> Payouts direct to local bank (LRD or USD)</li>
              </ul>
            </div>

            <div className={styles.cardAction}>
              <Link href="/signup" className={styles.primaryBtn}>
                Create Your Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. THE VALUE STACK (Pure White) ── */}
      <section className={styles.valueSection}>
        <div className={styles.container}>
          <div className={styles.centerHeader}>
            <h2 className={styles.sectionTitle}>Why 10% is a massive bargain.</h2>
            <p className={styles.sectionSubtitle}>
              Building an online business usually means paying expensive monthly subscriptions in USD before you even make your first sale. We changed the rules.
            </p>
          </div>

          <div className={styles.comparisonGrid}>
            {/* The Old Way */}
            <div className={styles.oldWayCard}>
              <h3 className={styles.compareTitle}>The Old Way</h3>
              <p className={styles.compareDesc}>Cobbling together foreign software.</p>
              <ul className={styles.compareList}>
                <li><XCircle size={18} className={styles.xIcon} /> Course Hosting (Teachable) <span>$39/mo</span></li>
                <li><XCircle size={18} className={styles.xIcon} /> Calendar Bookings (Calendly) <span>$15/mo</span></li>
                <li><XCircle size={18} className={styles.xIcon} /> Website Builder (Squarespace) <span>$23/mo</span></li>
                <li><XCircle size={18} className={styles.xIcon} /> Payment Gateway <span>3% + 30¢</span></li>
              </ul>
              <div className={styles.compareTotalBad}>
                <span>Fixed Monthly Cost:</span>
                <strong>~$77 USD</strong>
                <p>You pay this even if you sell nothing.</p>
              </div>
            </div>

            {/* The Vouch Way */}
            <div className={styles.vouchWayCard}>
              <h3 className={styles.compareTitleVouch}>The Vouch Way</h3>
              <p className={styles.compareDesc}>Everything built into one platform.</p>
              <ul className={styles.compareList}>
                <li><CheckCircle2 size={18} className={styles.checkIcon} /> Unlimited Course Hosting <span>Included</span></li>
                <li><CheckCircle2 size={18} className={styles.checkIcon} /> Unlimited Calendar Bookings <span>Included</span></li>
                <li><CheckCircle2 size={18} className={styles.checkIcon} /> Creator Storefront <span>Included</span></li>
                <li><CheckCircle2 size={18} className={styles.checkIcon} /> MTN & Orange MoMo Processing <span>Included</span></li>
              </ul>
              <div className={styles.compareTotalGood}>
                <span>Fixed Monthly Cost:</span>
                <strong>$0</strong>
                <p>We only make money when you do.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. THE MONEY FLOW (Warm Sand) ── */}
      <section className={styles.flowSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.centerHeader}>
            <h2 className={styles.sectionTitle}>How you get paid.</h2>
            <p className={styles.sectionSubtitle}>
              Complete transparency. Here is exactly what happens when you sell a course for LRD 1,000.
            </p>
          </div>

          <div className={styles.flowGrid}>
            <div className={styles.flowStep}>
              <div className={styles.stepIcon}><Smartphone size={28} /></div>
              <div className={styles.stepNumber}>Step 1</div>
              <h3>The Sale</h3>
              <p>Your student buys your course for <strong>LRD 1,000</strong> using MTN Mobile Money.</p>
            </div>

            <div className={styles.flowArrow}><ArrowRight size={24} /></div>

            <div className={styles.flowStep}>
              <div className={styles.stepIcon}><CheckCircle2 size={28} /></div>
              <div className={styles.stepNumber}>Step 2</div>
              <h3>The Split</h3>
              <p>Vouch securely processes the payment, unlocks the course, and takes our <strong>LRD 100</strong> fee.</p>
            </div>

            <div className={styles.flowArrow}><ArrowRight size={24} /></div>

            <div className={styles.flowStepHighlight}>
              <div className={styles.stepIconHighlight}><Landmark size={28} /></div>
              <div className={styles.stepNumberHighlight}>Step 3</div>
              <h3>Your Payout</h3>
              <p><strong>LRD 900</strong> is deposited directly into your local bank account.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FAQ SECTION (Soft Stone) ── */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <div className={styles.centerHeader}>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          </div>

          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <div className={styles.faqIcon}><HelpCircle size={24} /></div>
              <div>
                <h3>Are there any hidden transfer fees?</h3>
                <p>No. The 10% fee covers everything, including the gateway fees charged by the Mobile Money providers. When you request a payout to your local bank account, it is completely free on our end.</p>
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqIcon}><HelpCircle size={24} /></div>
              <div>
                <h3>How long does it take to get my money?</h3>
                <p>We operate on a standard T+2 schedule. This means the money from a sale will be available to transfer to your bank account exactly 2 business days after the customer pays.</p>
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqIcon}><HelpCircle size={24} /></div>
              <div>
                <h3>Can I charge my customers in USD?</h3>
                <p>Yes. You can price your products in either United States Dollars (USD) or Liberian Dollars (LRD). Customers can pay with whichever currency their Mobile Money or card supports, and we handle the secure conversion.</p>
              </div>
            </div>

            <div className={styles.faqItem}>
              <div className={styles.faqIcon}><HelpCircle size={24} /></div>
              <div>
                <h3>What happens if I don&apos;t sell anything?</h3>
                <p>Nothing! Your account remains active, your courses stay online, and you owe us absolutely nothing. You only ever pay Vouch when a customer pays you.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}