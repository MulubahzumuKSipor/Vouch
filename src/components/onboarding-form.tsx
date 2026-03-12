'use client'

import { selectRole } from '@/lib/onboard'
import styles from '@/styles/onboard.module.css'
import { Briefcase, ShoppingBag, Search, Info } from 'lucide-react'

export default function OnboardingForm() {
  async function handleSelection(formData: FormData) {
    const result = await selectRole(formData);

    if (result?.error) {
      alert(result.error);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        <div className={styles.intro}>
          <div className={styles.logo}>Vouch.</div>
          <h1 className={styles.title}>How do you plan to use Vouch?</h1>
          <p className={styles.subtitle}>
            Don&apos;t worry, you can switch between Buying and Selling at any time from your dashboard.
          </p>
        </div>

        {/* ── BETA TESTING ALERT BANNER ── */}
        <div style={{
          backgroundColor: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
          textAlign: 'left'
        }}>
          <Info size={20} color="#2563EB" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h3 style={{ color: '#1E3A8A', margin: '0 0 4px 0', fontSize: '0.875rem', fontWeight: 600 }}>
              Welcome to the Vouch Beta!
            </h3>
            <p style={{ color: '#1E40AF', margin: 0, fontSize: '0.875rem', lineHeight: 1.5 }}>
              We are currently in our testing phase. Please note that <strong>real money transfers and payouts are temporarily disabled</strong> until our official launch. Feel free to set up your store, explore the dashboard, and get ready!
            </p>
          </div>
        </div>

        <div className={styles.options}>
          
          {/* OPTION 1: SELLER */}
          <form action={handleSelection}>
            <input type="hidden" name="role" value="seller" />
            <button type="submit" className={styles.optionBtn}>
              <div className={styles.iconWrapper}>
                <Briefcase size={24} />
              </div>
              <div className={styles.optionText}>
                <h3>I want to Sell</h3>
                <p>I am a Creator, Expert, or Artist. I want to sell content, services, or ads.</p>
              </div>
            </button>
          </form>

          {/* OPTION 2: BUYER */}
          <form action={handleSelection}>
            <input type="hidden" name="role" value="buyer" />
            <button type="submit" className={styles.optionBtn}>
              <div className={styles.iconWrapper}>
                <ShoppingBag size={24} />
              </div>
              <div className={styles.optionText}>
                <h3>I want to Buy</h3>
                <p>I want to purchase courses, book consultations, or support creators.</p>
              </div>
            </button>
          </form>

          {/* OPTION 3: BROWSE */}
          <form action={handleSelection}>
            <input type="hidden" name="role" value="buyer" />
            <button type="submit" className={styles.optionBtn}>
              <div className={styles.iconWrapper}>
                <Search size={24} />
              </div>
              <div className={styles.optionText}>
                <h3>Just Browsing</h3>
                <p>I&apos;m just looking around for now. Take me to the feed.</p>
              </div>
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}