'use client'

import { useState } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'

export default function CloudflareUploader({ onSuccess }: { onSuccess: (videoId: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)

    try {
      // 1. Get the Upload URL AND the Video ID
      const res = await fetch('/api/upload/cloudflare-url', { method: 'POST' })
      const { uploadUrl, videoId } = await res.json() // <--- Getting the ID here

      if (!uploadUrl || !videoId) throw new Error('Failed to get upload parameters')

      // 2. Upload the file using standard XHR (or TUS)
      const xhr = new XMLHttpRequest()
      xhr.open('POST', uploadUrl, true)

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setProgress(Math.round(percentComplete))
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          // 3. SUCCESS! Pass the videoId (not the URL) to the parent
          onSuccess(videoId)
          setUploading(false)
          setProgress(0)
        } else {
          alert('Upload failed')
          setUploading(false)
        }
      }

      const formData = new FormData()
      formData.append('file', file)
      xhr.send(formData)

    } catch (err) {
      console.error(err)
      alert('Error uploading video')
      setUploading(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <label style={{
        display: 'flex', alignItems: 'center', gap: '8px',
        padding: '10px 16px', border: '1px dashed #ccc',
        borderRadius: '8px', cursor: 'pointer', background: '#fafafa'
      }}>
        {uploading ? <Loader2 className="animate-spin" size={20} /> : <UploadCloud size={20} />}
        <span style={{ fontSize: '14px', fontWeight: 500 }}>
          {uploading ? `Uploading ${progress}%` : 'Upload Video'}
        </span>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          disabled={uploading}
        />
      </label>
    </div>
  )
}