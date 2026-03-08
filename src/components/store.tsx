'use client'

import { useActionState } from 'react'
import { Save, Globe, Smartphone, Mail, Loader2 } from 'lucide-react'
import { updateStoreSettings } from '@/lib/store'
import styles from '@/styles/settings.module.css'

const initialState = { message: '', type: '' }

interface SocialLinks {
  whatsapp?: string
  support_email?: string
  facebook?: string
  instagram?: string
  twitter?: string
  linkedin?: string
  website?: string
}

interface Profile {
  full_name?: string
  bio?: string
  social_links?: SocialLinks
}

export default function StoreSettingsForm({ profile }: { profile: Profile }) {
  const [state, formAction, isPending] = useActionState(updateStoreSettings, initialState)

  const socials = profile.social_links || {}

  return (
    <div className={styles.wrapper}>
      {/* Reusing the formContainer styling to keep the white card look */}
      <div className={styles.formContainer}>
        <form action={formAction} className={styles.tabContent}>

          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Store Identity</h2>
            <p className={styles.sectionSubtitle}>This is what customers see when they visit your shop.</p>
          </div>

          <div className={styles.gridRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Store Name</label>
              <input 
                className={styles.input}
                name="display_name"
                defaultValue={profile.full_name}
                placeholder="e.g. CBJ Digital"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Tagline (Bio)</label>
              <input 
                className={styles.input}
                name="tagline"
                defaultValue={profile.bio}
                placeholder="e.g. Premium UI Kits for Developers"
              />
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Contact & Support</h2>
            <p className={styles.sectionSubtitle}>How should customers reach you?</p>
          </div>

          <div className={styles.gridRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>WhatsApp Number</label>
              <div className={styles.inputIconWrap}>
                <Smartphone size={18} className={styles.inputIcon} />
                <input
                  className={`${styles.input} ${styles.inputWithIcon}`}
                  name="whatsapp"
                  defaultValue={socials.whatsapp}
                  placeholder="+231 77..."
                />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Support Email</label>
              <div className={styles.inputIconWrap}>
                <Mail size={18} className={styles.inputIcon} />
                <input
                  className={`${styles.input} ${styles.inputWithIcon}`}
                  name="support_email"
                  type="email"
                  defaultValue={socials.support_email}
                  placeholder="support@cbj.com"
                />
              </div>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Social Profiles</h2>
            <p className={styles.sectionSubtitle}>Connect your social media to build trust.</p>
          </div>

          <div className={styles.gridRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Facebook</label>
              <input className={styles.input} name="facebook" defaultValue={socials.facebook} placeholder="Username or Link" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Instagram</label>
              <input className={styles.input} name="instagram" defaultValue={socials.instagram} placeholder="Username" />
            </div>
          </div>

          <div className={styles.gridRow}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Twitter / X</label>
              <input className={styles.input} name="twitter" defaultValue={socials.twitter} placeholder="Username" />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>LinkedIn</label>
              <input className={styles.input} name="linkedin" defaultValue={socials.linkedin} placeholder="Profile Link" />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Personal Website</label>
            <div className={styles.inputIconWrap}>
              <Globe size={18} className={styles.inputIcon} />
              <input
                className={`${styles.input} ${styles.inputWithIcon}`}
                name="website"
                defaultValue={socials.website}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* ── FOOTER ACTIONS ── */}
          <div className={styles.footer}>
            {/* Wrapped in messageBox so flexbox space-between works properly */}
            <div className={styles.messageBox}>
              {state.message && (
                <p className={state.type === 'error' ? styles.errorMsg : styles.successMsg}>
                  {state.message}
                </p>
              )}
            </div>

            <button type="submit" disabled={isPending} className={styles.saveBtn}>
              {isPending ? <Loader2 className={styles.spin} size={18} /> : <Save size={18} />}
              Save Store Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}