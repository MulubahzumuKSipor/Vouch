'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Video, FileText, Calendar, Loader2, ArrowRight } from 'lucide-react'
import { createProduct } from '@/lib/product'
import styles from '@/styles/create-modal.module.css'

interface CreateProductModalProps {
  isOpen: boolean
  onClose: () => void
}

type ProductType = 'course' | 'service' | 'asset'

export default function CreateProductModal({ isOpen, onClose }: CreateProductModalProps) {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<ProductType>('course')
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  // 🔴 The Traffic Cop Logic
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      // 1. Pack up the data
      const formData = new FormData()
      formData.append('title', title)
      formData.append('type', selectedType)

      // 2. Ask the server to create the draft in the database
      const result = await createProduct(formData)

      if (result?.error) {
        throw new Error(result.error)
      }

      // 3. We got the ID! Time to route the user.
      if (result?.id) {
        onClose() // Hide the modal

        // Let Next.js navigate to the correct specialized editor
        if (selectedType === 'asset') {
          router.push(`/dashboard/assets/${result.id}`)
        } else if (selectedType === 'service') {
          router.push(`/dashboard/services/${result.id}`)
        } else {
          router.push(`/dashboard/products/${result.id}`) // Default to Course
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        {/* Header */}
        <div className={styles.header}>
          <h2>Create New Product</h2>
          <button onClick={onClose} className={styles.closeBtn} disabled={isSubmitting}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>

          {errorMsg && (
            <div className={styles.errorAlert}>{errorMsg}</div>
          )}

          {/* 1. Type Selection */}
          <div className={styles.section}>
            <label className={styles.label}>What are you selling?</label>
            <div className={styles.grid}>

              {/* Type: Course */}
              <label className={`${styles.typeCard} ${selectedType === 'course' ? styles.active : ''}`}>
                <input 
                  type="radio" 
                  name="type" 
                  value="course" 
                  checked={selectedType === 'course'}
                  onChange={() => setSelectedType('course')}
                  className={styles.radio}
                />
                <div className={styles.iconWrap} style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                  <Video size={24} />
                </div>
                <div className={styles.typeInfo}>
                  <span className={styles.typeName}>Course</span>
                  <span className={styles.typeDesc}>Video series & lessons</span>
                </div>
              </label>

              {/* Type: Service */}
              <label className={`${styles.typeCard} ${selectedType === 'service' ? styles.active : ''}`}>
                <input 
                  type="radio" 
                  name="type" 
                  value="service" 
                  checked={selectedType === 'service'}
                  onChange={() => setSelectedType('service')}
                  className={styles.radio}
                />
                <div className={styles.iconWrap} style={{ background: '#F0FDF4', color: '#16A34A' }}>
                  <Calendar size={24} />
                </div>
                <div className={styles.typeInfo}>
                  <span className={styles.typeName}>Service</span>
                  <span className={styles.typeDesc}>Coaching & Calls</span>
                </div>
              </label>

              {/* Type: Asset */}
              <label className={`${styles.typeCard} ${selectedType === 'asset' ? styles.active : ''}`}>
                <input 
                  type="radio" 
                  name="type" 
                  value="asset" 
                  checked={selectedType === 'asset'}
                  onChange={() => setSelectedType('asset')}
                  className={styles.radio}
                />
                <div className={styles.iconWrap} style={{ background: '#FFF1F2', color: '#E11D48' }}>
                  <FileText size={24} />
                </div>
                <div className={styles.typeInfo}>
                  <span className={styles.typeName}>Digital Asset</span>
                  <span className={styles.typeDesc}>Files, Templates, PDFs</span>
                </div>
              </label>

            </div>
          </div>

          {/* 2. Title Input */}
          <div className={styles.section}>
            <label htmlFor="title" className={styles.label}>Give it a name</label>
            <input
              id="title"
              type="text"
              placeholder="e.g., Ultimate Photography Masterclass"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              autoFocus
              disabled={isSubmitting}
            />
          </div>

          {/* Footer Actions */}
          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={isSubmitting}>
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || title.length < 3} 
              className={styles.submitBtn}
            >
              {isSubmitting ? (
                <><Loader2 size={18} className={styles.spin} /> Creating...</>
              ) : (
                <>Create Draft <ArrowRight size={18} /></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}