import styles from '@/styles/legal.module.css';

export default function CookiePolicyPage() {
  const lastUpdated = "March 11, 2026";

  return (
    <main className={styles.main}>

      {/* ── 1. LEGAL HERO ── */}
      <section className={styles.heroSection}>
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>Legal Agreement</div>
            <h1 className={styles.headline}>Cookie Policy</h1>
            <p className={styles.subheadline}>
              How Vouch uses cookies to keep your account secure and running smoothly.
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
                  <li><a href="#what-are-cookies">1. What Are Cookies?</a></li>
                  <li><a href="#how-we-use">2. How We Use Cookies</a></li>
                  <li><a href="#third-party">3. Third-Party Cookies</a></li>
                  <li><a href="#managing">4. Managing Your Cookies</a></li>
                  <li><a href="#contact">5. Contact Us</a></li>
                </ul>
              </nav>
            </aside>

            {/* Main Legal Text */}
            <div className={styles.legalContent}>
              
              <div id="what-are-cookies" className={styles.legalSection}>
                <h2>1. What Are Cookies?</h2>
                <p>
                  Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used by online platforms to make websites work efficiently, as well as to provide reporting information and personalize your experience. 
                </p>
                <p>
                  At Vouch, because we handle financial data and creator storefronts, cookies are primarily used to keep you securely logged into your dashboard and to ensure payment sessions process correctly.
                </p>
              </div>

              <div id="how-we-use" className={styles.legalSection}>
                <h2>2. How We Use Cookies</h2>
                <p>
                  We categorize the cookies we use into the following types:
                </p>
                <ul>
                  <li><strong>Strictly Necessary Cookies:</strong> These are essential for the Vouch platform to function. They include cookies that allow creators to log into secure areas of our website and ensure that checkout sessions for Mobile Money and card payments don&apos;t time out or fail. <em>These cannot be disabled in our systems.</em></li>
                  <li><strong>Performance & Analytics Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us know which pages (like Creator storefronts) are the most and least popular.</li>
                  <li><strong>Functionality Cookies:</strong> These are used to recognize you when you return to our platform. This enables us to personalize our content for you, greet you by name, and remember your preferences (e.g., your choice of language or currency view).</li>
                </ul>
              </div>

              <div id="third-party" className={styles.legalSection}>
                <h2>3. Third-Party Cookies</h2>
                <p>
                  In some special cases, we also use cookies provided by trusted third parties. The following section details which third-party cookies you might encounter through this site:
                </p>
                <ul>
                  <li><strong>Payment Processors:</strong> When a student buys a product, our payment partners (handling MTN MoMo, Orange Money, or banking rails) may use strictly necessary cookies to verify identity and prevent fraudulent transactions during checkout.</li>
                  <li><strong>Analytics:</strong> We use industry-standard analytics solutions to help us understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit.</li>
                </ul>
              </div>

              <div id="managing" className={styles.legalSection}>
                <h2>4. Managing Your Cookies</h2>
                <p>
                  You can prevent the setting of cookies by adjusting the settings on your browser (see your browser Help for how to do this). Please be aware that disabling cookies will affect the functionality of Vouch and many other websites that you visit. 
                </p>
                <p>
                  <strong>Important:</strong> Disabling strictly necessary cookies will prevent you from logging into your Creator Dashboard and may stop buyers from successfully completing checkout on your storefront. Therefore, it is recommended that you do not disable cookies for Vouch.
                </p>
              </div>

              <div id="contact" className={styles.legalSection}>
                <h2>5. Contact Us</h2>
                <p>
                  Hopefully, that has clarified things for you. If there is something that you aren&apos;t sure whether you need or not, it&apos;s usually safer to leave cookies enabled in case it does interact with one of the features you use on our site.
                </p>
                <p>
                  If you have any further questions regarding our Cookie Policy, please contact us:
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