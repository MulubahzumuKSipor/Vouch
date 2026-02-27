'use client'

import { useState, useRef } from 'react'
import { X, Video, FileText, Calendar, Loader2, ArrowRight } from 'lucide-react'
import styles from '@/styles/create-modal.module.css'
import { createProduct } from '@/lib/product' // <--- FIXED IMPORT

type ProductType = 'course' | 'service' | 'asset'

interface CreateProductModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CreateProductModal({ isOpen, onClose }: CreateProductModalProps) {
  const [selectedType, setSelectedType] = useState<ProductType>('course')
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  if (!isOpen) return null

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true)

    // FIXED: Call the correct Server Action
    // createProduct will redirect on success, so we only handle the error here
    const result = await createProduct(formData)

    if (result?.error) {
      alert(result.error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2>Create New Product</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>

        <form action={handleSubmit} ref={formRef} className={styles.form}>
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
                <div className={styles.iconWrap} style={{ background: '#FFF8E1', color: '#F59E0B' }}>
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
                <div className={styles.iconWrap} style={{ background: '#E6F4EA', color: '#137333' }}>
                  <Calendar size={24} />
                </div>
                <div className={styles.typeInfo}>
                  <span className={styles.typeName}>Service</span>
                  <span className={styles.typeDesc}>Coaching & Consultations</span>
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
                <div className={styles.iconWrap} style={{ background: '#FCE8E6', color: '#D93025' }}>
                  <FileText size={24} />
                </div>
                <div className={styles.typeInfo}>
                  <span className={styles.typeName}>Digital Asset</span>
                  <span className={styles.typeDesc}>E-books, Templates, PDFs</span>
                </div>
              </label>
            </div>
          </div>

          {/* 2. Title Input */}
          <div className={styles.section}>
            <label htmlFor="title" className={styles.label}>Give it a name</label>
            <input
              name="title"
              id="title"
              type="text"
              placeholder="e.g., Ultimate Photography Masterclass"
              className={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={3}
              autoFocus
            />
          </div>

          {/* Footer Actions */}
          <div className={styles.footer}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || title.length < 3} 
              className={styles.submitBtn}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className={styles.spin} />
                  Creating...
                </>
              ) : (
                <>
                  Create Draft
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}