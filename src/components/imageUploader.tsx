'use client'

import { useState } from 'react'
import { createClient } from '@/lib/client'
import { Image as ImageIcon, Loader2, X } from 'lucide-react'
import Image from 'next/image'
import styles from '@/styles/image-uploader.module.css'

interface ImageUploaderProps {
  currentImage?: string | null
  onUpload: (url: string) => void
}

export default function ImageUploader({ currentImage, onUpload }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImage || null)
  const supabase = createClient()

  // Limit: 5MB in bytes
  const MAX_FILE_SIZE = 5 * 1024 * 1024

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      // 1. Client-Side Size Check
      if (file.size > MAX_FILE_SIZE) {
        alert('File size must be less than 5MB')
        // Reset the input so they can select a different file
        e.target.value = ''
        return
      }

      setUploading(true)

      // 2. Generate unique file path
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `covers/${fileName}`

      // 3. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-covers')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 4. Get Public URL
      const { data } = supabase.storage
        .from('product-covers')
        .getPublicUrl(filePath)

      // 5. Update State & Parent
      setPreview(data.publicUrl)
      onUpload(data.publicUrl)

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      alert('Error uploading image: ' + message)
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onUpload('')
  }

  return (
    <div className={styles.container}>
      {preview ? (
        <div className={styles.previewWrapper}>
          <Image 
            src={preview} 
            alt="Cover preview" 
            fill 
            className={styles.previewImage} 
            unoptimized
            priority
          />
          <button 
            type="button"
            onClick={handleRemove}
            className={styles.removeBtn}
            title="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className={styles.uploadLabel}>
          {uploading ? (
            <Loader2 size={24} className={styles.spin} />
          ) : (
            <ImageIcon size={24} className={styles.icon} />
          )}
          <span className={styles.text}>
            {uploading ? 'Uploading...' : 'Click to upload cover image (Max 5MB)'}
          </span>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleUpload} 
            disabled={uploading}
            className={styles.hiddenInput}
          />
        </label>
      )}
    </div>
  )
}