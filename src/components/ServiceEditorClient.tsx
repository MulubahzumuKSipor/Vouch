'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Calendar } from 'lucide-react'
import ImageUploader from '@/components/imageUploader'
import AvailabilityPicker from '@/components/AvaliablityPicker'
import styles from '@/styles/asset-editor.module.css'
import { updateService } from '@/lib/product'

export default function ServiceEditorClient({ service }: { service: any }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [coverImage, setCoverImage] = useState(service.cover_image || '')

  // 🔴 1. Safe Data Parsing for the new Weekly Toggle
  const initialData = service.availability || {}
  const isNewFormat = initialData.hasOwnProperty('schedule')
  const initialRepeat = isNewFormat ? initialData.repeat_weekly : true
  const initialSchedule = isNewFormat ? initialData.schedule : initialData

  const [isRepeatWeekly, setIsRepeatWeekly] = useState(initialRepeat)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setUploadStatus('Saving details...')

    const formData = new FormData(e.currentTarget)
    formData.append('id', service.id)
    formData.append('cover_image', coverImage)

    // 🔴 2. Intercept and Structure the Availability JSON
    const rawAvailability = formData.get('availability') as string
    let parsedSchedule = {}

    if (rawAvailability) {
      try {
        const parsed = JSON.parse(rawAvailability)
        // Just in case the picker itself is sending nested data, extract it safely
        parsedSchedule = parsed.schedule ? parsed.schedule : parsed
      } catch (e) {
        parsedSchedule = {}
      }
    }

    // Wrap it in our new smart object and overwrite the form data!
    const finalAvailabilityPayload = {
      repeat_weekly: isRepeatWeekly,
      schedule: parsedSchedule,
      exceptions: {} // Future-proofing for specific blocked dates
    }

    formData.set('availability', JSON.stringify(finalAvailabilityPayload))

    try {
      const result = await updateService(formData)
      if (result?.error) throw new Error(result.error)

      setUploadStatus('Saved!')
      setTimeout(() => {
        router.push('/dashboard/products')
        router.refresh()
      }, 1000)

    } catch (error: any) {
      alert(error.message || 'Something went wrong')
      setIsSubmitting(false)
      setUploadStatus('')
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Link href="/dashboard/products" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Products
          </Link>
          <h1 className={styles.title}>Edit Consultation</h1>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button type="submit" form="service-form" disabled={isSubmitting} className={styles.saveBtn}>
            {isSubmitting ? (
              <><Loader2 className={styles.spin} size={18} /> {uploadStatus}</>
            ) : (
              <><Save size={18} /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      <form id="service-form" onSubmit={handleSubmit} className={styles.gridLayout}>

        <div className={styles.mainColumn}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Service Details</h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>Title</label>
              <input name="title" defaultValue={service.title} className={styles.input} placeholder="e.g., 1-on-1 Strategy Call" required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <textarea name="description" defaultValue={service.description} className={styles.textarea} placeholder="What will the client get out of this session?" required style={{ minHeight: '150px' }} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Price (USD)</label>
              <input name="price_amount" type="number" step="0.01" min="0" defaultValue={service.price_amount ? (service.price_amount / 100).toFixed(2) : ''} className={styles.input} placeholder="150.00" required />
            </div>
          </div>
        </div>

        <div className={styles.sideColumn}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Cover Image</h2>
            <ImageUploader currentImage={coverImage} onUpload={(url) => setCoverImage(url)} />
          </div>

          {/* Schedule Builder */}
          <div className={styles.card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Calendar size={20} color="#4F46E5" />
              <h2 className={styles.cardTitle} style={{ margin: 0 }}>Your Schedule</h2>
            </div>
            <p className={styles.hint}>Set the days and times you are available. Buyers will pick from these slots.</p>

            <div className={styles.formGroup} style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <label className={styles.label}>How long is this consultation?</label>
              <select name="duration_minutes" defaultValue={service.duration_minutes || 60} className={styles.input} style={{ appearance: 'auto' }}>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>1 Hour</option>
                <option value={90}>1.5 Hours</option>
                <option value={120}>2 Hours</option>
              </select>
            </div>

            {/* 🔴 3. The Toggle Switch UI */}
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '0.95rem', color: '#0F172A', fontWeight: '600' }}>
                  Repeat Weekly
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748B' }}>
                  {isRepeatWeekly
                    ? "Schedule repeats. Buyers see 30 days ahead."
                    : "One-time schedule. Buyers see 7 days ahead."}
                </p>
              </div>

              <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', flexShrink: 0, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isRepeatWeekly}
                  onChange={(e) => setIsRepeatWeekly(e.target.checked)}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: isRepeatWeekly ? '#4F46E5' : '#CBD5E1',
                  borderRadius: '24px', transition: '0.3s'
                }}></span>
                <span style={{
                  position: 'absolute', height: '18px', width: '18px',
                  left: isRepeatWeekly ? '22px' : '3px', bottom: '3px',
                  backgroundColor: 'white', borderRadius: '50%', transition: '0.3s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}></span>
              </label>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Select Your Available Times (GMT)</label>
              {/* 🔴 Pass ONLY the schedule portion so the picker doesn't break */}
              <AvailabilityPicker initialData={initialSchedule} />
            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Visibility</h2>
            <div className={styles.statusToggle}>
              <label className={styles.radioLabel}>
                <input type="radio" name="is_published" value="false" defaultChecked={!service.is_published} />
                <span className={styles.radioText}>Draft (Hidden)</span>
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" name="is_published" value="true" defaultChecked={service.is_published} />
                <span className={styles.radioText}>Published (Live)</span>
              </label>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}