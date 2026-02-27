'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/client'
import { UploadCloud, Loader2, Save, Image as ImageIcon } from 'lucide-react'
import styles from '@/styles/product-editor.module.css'

export type PriceCurrency = 'USD' | 'LRD' | 'EUR' | 'GBP' | 'NGN' | 'GHS' | 'KES'

export interface Product {
  id: string
  title: string
  description: string
  price_amount: number
  price_currency: PriceCurrency
  cover_image: string
  is_published: boolean
}

export default function ProductSettingsForm({ 
  product, 
  onUpdate 
}: { 
  product: Product
  onUpdate: (updatedProduct: Product) => void
}) {
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  
  // State for the form inputs
  const [title, setTitle] = useState(product.title || '')
  const [description, setDescription] = useState(product.description || '')

  // Safe fallbacks for price and currency
  const [priceInput, setPriceInput] = useState(((product.price_amount || 0) / 100).toString())
  const [currency, setCurrency] = useState<PriceCurrency>(product.price_currency || 'USD')

  const [coverImage, setCoverImage] = useState(product.cover_image || '')
  const [isPublished, setIsPublished] = useState(!!product.is_published)

  // 1. Handle Image Upload (Targeting the 'product-covers' bucket)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Client-side validation (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please choose an image under 2MB.")
      return
    }

    setIsUploading(true)
    const supabase = createClient()
    
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${product.id}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `covers/${fileName}`

      // Upload to the correct 'product-covers' bucket
      const { error: uploadError } = await supabase.storage
        .from('product-covers')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Fetch the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-covers')
        .getPublicUrl(filePath)

      setCoverImage(publicUrl)
      
      // Auto-save the image to the product row so the user doesn't lose it if they navigate away
      await supabase.from('products').update({ cover_image: publicUrl }).eq('id', product.id)

      // Update the parent component's state
      onUpdate({ ...product, cover_image: publicUrl })

    } catch (error) {
      console.error("Upload failed:", error)
      alert("Failed to upload image. Please ensure your storage policies allow uploads.")
    } finally {
      setIsUploading(false)
    }
  }

  // 2. Handle Form Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Convert string dollars back to integer cents safely
    const priceInCents = Math.round(parseFloat(priceInput || '0') * 100)

    const updates: Partial<Product> = {
      title,
      description,
      price_amount: priceInCents,
      price_currency: currency,
      is_published: isPublished,
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', product.id)

    setIsSaving(false)

    if (error) {
      alert("Failed to save changes.")
      console.error("Save error:", error)
      return
    }

    // Tell the parent component to update the UI globally
    onUpdate({ ...product, ...updates })
  }

  return (
    <form onSubmit={handleSave} className={styles.settingsForm}>
      
      {/* Visual Status Toggles */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Product Status</label>
        <div className={styles.statusToggleGroup}>
          <button
            type="button"
            className={`${styles.statusToggleBtn} ${!isPublished ? styles.activeDraft : ''}`}
            onClick={() => setIsPublished(false)}
          >
            Draft (Hidden)
          </button>
          <button
            type="button"
            className={`${styles.statusToggleBtn} ${isPublished ? styles.activePublished : ''}`}
            onClick={() => setIsPublished(true)}
          >
            Published (Live)
          </button>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.label}>Course Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={styles.input}
          required
        />
      </div>

      {/* Composite Price Input with Currency Selector */}
      <div className={styles.formGroup}>
        <label htmlFor="price" className={styles.label}>Price</label>
        <div className={styles.compositeInput}>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as PriceCurrency)}
            className={styles.currencySelect}
          >
            <option value="USD">USD ($)</option>
            <option value="LRD">LRD ($)</option>
          </select>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            className={styles.attachedInput}
            required
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={styles.textarea}
          rows={4}
          placeholder="What will students learn in this course?"
        />
      </div>

      {/* Image Uploader */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Cover Image</label>
        <div className={styles.imageUploader}>
          {coverImage ? (
            <div className={styles.imagePreviewWrapper}>
              <Image
                src={coverImage}
                alt="Cover Preview"
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                style={{ objectFit: 'cover' }}
              />
              <div className={styles.imageOverlay}>
                <label className={styles.changeImageBtn}>
                  {isUploading ? <Loader2 size={16} className={styles.spin} /> : <UploadCloud size={16} />}
                  <span>Change Image</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
                </label>
              </div>
            </div>
          ) : (
            <label className={styles.emptyUploader}>
              {isUploading ? (
                <Loader2 size={32} className={styles.spin} color="#EAB308" />
              ) : (
                <>
                  <ImageIcon size={32} color="#1A1A1A" />
                  <span className={styles.uploaderText}>Click to upload cover image</span>
                  <span className={styles.uploaderSubtext}>Recommended: 1280x720px (Under 2MB)</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImageUpload} hidden disabled={isUploading} />
            </label>
          )}
        </div>
      </div>

      <div className={styles.formFooter}>
        <button type="submit" className={styles.submitBtn} disabled={isSaving}>
          {isSaving ? <Loader2 size={18} className={styles.spin} /> : <Save size={18} />}
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}