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

export default function SettingsForm({ profile }: { profile: Profile }) {
  // 🔴 UPDATED: Using useActionState instead of useFormState
  const [state, formAction] = useActionState(updateSettings, initialState)
  const [activeTab, setActiveTab] = useState('general')

  // Local state for immediate UI updates
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [isSellerLocal, setIsSellerLocal] = useState(profile.is_seller)

  return (
    <div className={styles.wrapper}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`${styles.tabBtn} ${activeTab === 'general' ? styles.active : ''}`}
        >
          <User size={18} /> General Profile
        </button>
        {/* Reacts instantly to the toggle */}
        {isSellerLocal && (
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`${styles.tabBtn} ${activeTab === 'payments' ? styles.active : ''}`}
          >
            <Wallet size={18} /> Payments & Currency
          </button>
        )}
      </div>

      {/* Main Form Area */}
      <form action={formAction} className={styles.formContainer}>

        {/* Hidden inputs to pass dynamic state to the server action */}
        <input type="hidden" name="avatar_url" value={avatarUrl} />
        <input type="hidden" name="is_seller" value={isSellerLocal.toString()} />

        {activeTab === 'general' && (
          <div className={styles.tabContent}>

            <div className={styles.sectionHeader}>
              <h2>Account Type</h2>
              <p>Choose how you want to use Vouch.</p>
            </div>

            {/* --- NEW ACCOUNT TYPE TOGGLE --- */}
            <div className={styles.formGroup}>
              <div className={styles.roleToggleGroup}>
                <button
                  type="button"
                  onClick={() => setIsSellerLocal(false)}
                  className={`${styles.roleBtn} ${!isSellerLocal ? styles.roleActive : ''}`}
                >
                  <ShoppingBag size={18} />
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
                  <Store size={18} />
                  <div className={styles.roleText}>
                    <strong>Creator / Seller</strong>
                    <span>I want to sell my own products</span>
                  </div>
                </button>
              </div>
            </div>

            <div className={styles.sectionDivider} />

            <div className={styles.sectionHeader}>
              <h2>Public Profile</h2>
              <p>This is how others see you on Vouch.</p>
            </div>

            <div className={styles.formGroup}>
              <label>Profile Picture</label>
              <div className={styles.avatarRow}>
                <div className={styles.avatarUploaderWrapper}>
                  <ImageUploader
                    currentImage={avatarUrl}
                    onUpload={(url) => setAvatarUrl(url)}
                  />
                </div>
                <div className={styles.avatarInfo}>
                  <p>Upload a new avatar</p>
                  <span>JPG, GIF or PNG. Max 1MB.</span>
                </div>
              </div>
            </div>

            <div className={styles.gridRow}>
              <div className={styles.formGroup}>
                <label>Full Name</label>
                <input name="full_name" defaultValue={profile.full_name} placeholder="e.g. John Doe" required />
              </div>
              <div className={styles.formGroup}>
                <label>Username</label>
                <input name="username" defaultValue={profile.username} placeholder="e.g. johndoe" required />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Bio</label>
              <textarea name="bio" defaultValue={profile.bio} rows={4} placeholder="Tell us about yourself..." />
            </div>
          </div>
        )}

        {isSellerLocal && activeTab === 'payments' && (
          <div className={styles.tabContent}>
            <div className={styles.sectionHeader}>
              <h2>Payout Settings</h2>
              <p>Where should we send your money?</p>
            </div>
            <div className={styles.gridRow}>
              <div className={styles.formGroup}>
                <label>Mobile Money Provider</label>
                <select name="payment_method" defaultValue={profile.payment_details?.method || 'mtn_momo'}>
                  <option value="mtn_momo">MTN Mobile Money</option>
                  <option value="orange_money">Orange Money</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Phone Number</label>
                <input
                  name="payment_number"
                  type="tel"
                  defaultValue={profile.payment_details?.number}
                  placeholder="088..."
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Primary Currency</label>
              <select name="currency" defaultValue={profile.payment_details?.currency || 'USD'}>
                <option value="USD">USD (United States Dollar)</option>
                <option value="LRD">LRD (Liberian Dollar)</option>
              </select>
            </div>
          </div>
        )}

        <div className={styles.footer}>
          {state.message && (
            <p className={state.type === 'error' ? styles.errorMsg : styles.successMsg}>
              {state.message}
            </p>
          )}
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