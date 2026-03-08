'use client'

import { useActionState, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Save, User, Wallet, Loader2, Store, ShoppingBag } from 'lucide-react'
import { updateSettings } from '@/lib/settings'
import ImageUploader from '@/components/imageUploader'
import styles from '@/styles/settings.module.css'

const initialState = { message: '', type: '' }

interface PaymentDetails {
  method?: string
  number?: string
  currency?: string
}

interface Profile {
  avatar_url: string
  is_seller: boolean
  full_name: string
  username: string
  bio: string
  payment_details?: PaymentDetails
}

type SettingsTab = 'general' | 'payments'

export default function SettingsForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useActionState(updateSettings, initialState)

  const [activeTab, setActiveTab] = useState<SettingsTab>('general' as SettingsTab)

  // Local state for immediate UI updates
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [isSellerLocal, setIsSellerLocal] = useState(profile.is_seller)

  return (
    <div className={styles.wrapper}>
      {/* ── SIDEBAR ── */}
      <div className={styles.sidebar}>
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`${styles.tabBtn} ${activeTab === 'general' ? styles.activeTab : ''}`}
        >
          <User size={18} /> General Profile
        </button>

        {isSellerLocal && (
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`${styles.tabBtn} ${activeTab === 'payments' ? styles.activeTab : ''}`}
          >
            <Wallet size={18} /> Payouts & Currency
          </button>
        )}
      </div>

      {/* ── MAIN FORM AREA ── */}
      <form action={formAction} className={styles.formContainer}>
        {/* Hidden inputs to pass dynamic state to the server action */}
        <input type="hidden" name="avatar_url" value={avatarUrl} />
        <input type="hidden" name="is_seller" value={isSellerLocal.toString()} />

        {activeTab === 'general' && (
          <div className={styles.tabContent}>

            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Account Type</h2>
              <p className={styles.sectionSubtitle}>Choose how you want to use Vouch.</p>
            </div>

            {/* --- ACCOUNT TYPE TOGGLE --- */}
            <div className={styles.formGroup}>
              <div className={styles.roleToggleGroup}>
                <button
                  type="button"
                  onClick={() => {
                    setIsSellerLocal(false)
                    setActiveTab('general' as SettingsTab)
                  }}
                  className={`${styles.roleBtn} ${!isSellerLocal ? styles.roleActive : ''}`}
                >
                  <div className={styles.roleIcon}><ShoppingBag size={20} /></div>
                  <div className={styles.roleText}>
                    <strong>Buyer</strong>
                    <span>I just want to purchase products</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setIsSellerLocal(true)}
                  className={`${styles.roleBtn} ${isSellerLocal ? styles.roleActiveSeller : ''}`}
                >
                  <div className={styles.roleIcon}><Store size={20} /></div>
                  <div className={styles.roleText}>
                    <strong>Creator / Seller</strong>
                    <span>I want to sell my own products</span>
                  </div>
                </button>
              </div>
            </div>

            <div className={styles.divider} />

            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Public Profile</h2>
              <p className={styles.sectionSubtitle}>This is how others see you on Vouch.</p>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Profile Picture</label>
              <div className={styles.avatarRow}>
                <div className={styles.avatarUploaderWrapper}>
                  <ImageUploader
                    currentImage={avatarUrl}
                    onUpload={(url) => setAvatarUrl(url)}
                  />
                </div>
                <div className={styles.avatarInfo}>
                  <p className={styles.avatarHint}>Upload a new avatar</p>
                  <span className={styles.avatarSubhint}>JPG, GIF or PNG. Max 2MB.</span>
                </div>
              </div>
            </div>

            <div className={styles.gridRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Full Name</label>
                <input className={styles.input} name="full_name" defaultValue={profile.full_name} placeholder="e.g. John Doe" required />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Username</label>
                <input className={styles.input} name="username" defaultValue={profile.username} placeholder="e.g. johndoe" required />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Bio</label>
              <textarea className={styles.textarea} name="bio" defaultValue={profile.bio} rows={4} placeholder="Tell us about yourself..." />
            </div>
          </div>
        )}

        {isSellerLocal && activeTab === 'payments' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Payout Settings</h2>
              <p className={styles.sectionSubtitle}>Where should we send your money?</p>
            </div>

            <div className={styles.gridRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Mobile Money Provider</label>
                <select className={styles.select} name="payment_method" defaultValue={profile.payment_details?.method || 'mtn_momo'}>
                  <option value="mtn_momo">MTN Mobile Money</option>
                  <option value="orange_money">Orange Money</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Phone Number</label>
                <input
                  className={styles.input}
                  name="payment_number"
                  type="tel"
                  defaultValue={profile.payment_details?.number}
                  placeholder="088..."
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Primary Currency</label>
              <select className={styles.select} name="currency" defaultValue={profile.payment_details?.currency || 'USD'}>
                <option value="USD">USD (United States Dollar)</option>
                <option value="LRD">LRD (Liberian Dollar)</option>
              </select>
            </div>
          </div>
        )}

        {/* ── FOOTER ACTIONS ── */}
        <div className={styles.footer}>
          <div className={styles.messageBox}>
            {state.message && (
              <p className={state.type === 'error' ? styles.errorMsg : styles.successMsg}>
                {state.message}
              </p>
            )}
          </div>
          <SubmitButton />
        </div>
      </form>
    </div>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className={styles.saveBtn}>
      {pending ? <Loader2 className={styles.spin} size={18} /> : <Save size={18} />}
      Save Changes
    </button>
  )
}