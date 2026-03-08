'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, UploadCloud, CheckCircle, Loader2, FileBox, X } from 'lucide-react'
import ImageUploader from '@/components/imageUploader'
import styles from '@/styles/asset-editor.module.css'
import { updateAsset } from '@/lib/product'
import { createClient } from '@/lib/client'

export default function AssetEditorClient({ asset }: { asset: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [coverImage, setCoverImage] = useState(asset.cover_image || '')

  const [digitalFiles, setDigitalFiles] = useState<File[]>([])

  const existingFiles = asset.product_attachments?.filter((a: any) => a.attachment_type === 'file') || []

  // 🔴 NEW: Add files to the array instead of overwriting
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      setDigitalFiles((prev) => [...prev, ...newFiles])
    }
    // Reset the input value so selecting the same file twice (if they removed it) works
    e.target.value = ''
  }

  // 🔴 NEW: Remove a specific file from the staged array
  const removeFile = (indexToRemove: number) => {
    setDigitalFiles((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setUploadStatus('Preparing save...')

    const formData = new FormData(e.currentTarget)
    formData.append('id', asset.id)
    formData.append('cover_image', coverImage)

    try {
      if (digitalFiles.length > 0) {
        const uploadedFileData: { path: string, name: string }[] = []

        for (let i = 0; i < digitalFiles.length; i++) {
          const file = digitalFiles[i]
          setUploadStatus(`Uploading file ${i + 1} of ${digitalFiles.length}...`)

          const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')
          const storagePath = `assets/${asset.id}/${Date.now()}_${cleanFileName}`

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('product-files')
            .upload(storagePath, file, { cacheControl: '3600', upsert: false })

          if (uploadError) throw new Error(`Failed to upload ${file.name}`)

          uploadedFileData.push({ path: uploadData.path, name: file.name })
        }

        formData.append('new_files', JSON.stringify(uploadedFileData))
      }

      setUploadStatus('Saving details...')
      const result = await updateAsset(formData)

      if (result?.error) throw new Error(result.error)

      setUploadStatus('Saved!')
      setTimeout(() => {
        router.push('/dashboard/products') // Routed to unified business page!
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
          <h1 className={styles.title}>Edit Digital Asset</h1>
        </div>
        
        <button type="submit" form="asset-form" disabled={isSubmitting} className={styles.saveBtn}>
          {isSubmitting ? (
            <><Loader2 className={styles.spin} size={18} /> {uploadStatus}</>
          ) : (
            <><Save size={18} /> Save Changes</>
          )}
        </button>
      </div>

      <form id="asset-form" onSubmit={handleSubmit} className={styles.gridLayout}>

        <div className={styles.mainColumn}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Asset Details</h2>
            <div className={styles.formGroup}>
              <label className={styles.label}>Title</label>
              <input name="title" defaultValue={asset.title} className={styles.input} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Description</label>
              <textarea name="description" defaultValue={asset.description} className={styles.textarea} required style={{ minHeight: '150px' }} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Price (USD)</label>
              <input name="price_amount" type="number" step="0.01" min="0" defaultValue={asset.price_amount ? (asset.price_amount / 100).toFixed(2) : ''} className={styles.input} required />
            </div>
          </div>
        </div>

        <div className={styles.sideColumn}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Cover Image</h2>
            <ImageUploader currentImage={coverImage} onUpload={(url) => setCoverImage(url)} />
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Digital Files</h2>
            <p className={styles.hint}>Upload the ZIPs, PDFs, or documents for your buyers.</p>

            <div className={styles.fileDropzone} style={{ padding: '1rem' }}>
              <input
                type="file"
                id="digital-file"
                multiple
                onChange={handleFileSelect} // 🔴 Uses our new appending function
                className={styles.hiddenInput}
                accept=".zip,.pdf,.rar,.docx,.xlsx"
              />

              {digitalFiles.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontWeight: '600' }}>
                    <CheckCircle size={20} />
                    <span>{digitalFiles.length} file(s) staged for upload</span>
                  </div>

                  {/* 🔴 NEW: List of staged files with Remove buttons */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {digitalFiles.map((f, i) => (
                      <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F3F4F6', padding: '0.75rem', borderRadius: '8px', fontSize: '0.875rem' }}>
                        <span style={{ color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                          📄 {f.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                          title="Remove file"
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* 🔴 NEW: The "Add Another" button that keeps adding to the list */}
                  <label htmlFor="digital-file" style={{ background: '#111827', color: 'white', padding: '0.5rem 1rem', borderRadius: '6px', textAlign: 'center', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', transition: 'background 0.2s' }}>
                    + Add Another File
                  </label>
                </div>

              ) : existingFiles.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                  <FileBox size={32} color="#3B82F6" />
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontWeight: '600', display: 'block' }}>{existingFiles.length} file(s) currently attached</span>
                    <span style={{ fontSize: '0.85rem', color: '#6B7280' }}>Uploading new files will replace these.</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, width: '100%', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    {existingFiles.map((f: any) => (
                      <li key={f.id} style={{ background: '#EFF6FF', color: '#1E3A8A', padding: '0.5rem', borderRadius: '4px' }}>
                        📄 {f.file_name}
                      </li>
                    ))}
                  </ul>
                  <label htmlFor="digital-file" style={{ background: '#F3F4F6', color: '#111827', padding: '0.5rem 1rem', borderRadius: '6px', textAlign: 'center', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600', width: '100%' }}>
                    Upload New Files
                  </label>
                </div>

              ) : (
                <label htmlFor="digital-file" className={styles.fileEmpty} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', padding: '2rem 1rem' }}>
                  <UploadCloud size={32} style={{ marginBottom: '0.5rem', color: '#6B7280' }} />
                  <span style={{ fontWeight: '500', color: '#374151' }}>Click to browse files</span>
                  <small style={{ color: '#9CA3AF', marginTop: '0.25rem' }}>You can select multiple files</small>
                </label>
              )}

            </div>
          </div>

          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Visibility</h2>
            <div className={styles.statusToggle}>
              <label className={styles.radioLabel}>
                <input type="radio" name="is_published" value="false" defaultChecked={!asset.is_published} />
                <span className={styles.radioText}>Draft (Hidden)</span>
              </label>
              <label className={styles.radioLabel}>
                <input type="radio" name="is_published" value="true" defaultChecked={asset.is_published} />
                <span className={styles.radioText}>Published (Live)</span>
              </label>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}