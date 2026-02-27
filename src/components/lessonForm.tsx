'use client'

import { useState, useEffect } from 'react'
import * as tus from 'tus-js-client'
import { createClient } from '@/lib/client'
import { createBunnyVideo } from '@/lib/product'
import {
  Loader2, Save, Video, FileText, Link2, Type,
  UploadCloud, CheckCircle2, Film, Trash2, Eye
} from 'lucide-react'
import styles from '@/styles/lesson-editor.module.css'

export interface Lesson {
  id: string
  title: string
  lesson_type: string
  content_url: string | null
  content_body: string
  is_preview: boolean
  is_published: boolean
  allow_download: boolean
}

export default function LessonEditorForm({ 
  lesson, 
  onUpdate 
}: { 
  lesson: Lesson
  onUpdate: (updatedLesson: Lesson) => void
}) {
  const [isSaving, setIsSaving] = useState(false)

  // Upload States
  const [isFileUploading, setIsFileUploading] = useState(false)
  const [isVideoUploading, setIsVideoUploading] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [showVideoPreview, setShowVideoPreview] = useState(false)

  // Form Fields
  const [title, setTitle] = useState(lesson.title || '')
  const [lessonType, setLessonType] = useState(lesson.lesson_type || 'video')
  const [contentUrl, setContentUrl] = useState(lesson.content_url || '')
  const [contentBody, setContentBody] = useState(lesson.content_body || '')
  const [isPreview, setIsPreview] = useState(!!lesson.is_preview)
  const [isPublished, setIsPublished] = useState(!!lesson.is_published)
  const [allowDownload, setAllowDownload] = useState(
    lesson.allow_download !== undefined ? lesson.allow_download : true
  )

  useEffect(() => {
    setTitle(lesson.title || '')
    setLessonType(lesson.lesson_type || 'video')
    setContentUrl(lesson.content_url || '')
    setContentBody(lesson.content_body || '')
    setIsPreview(!!lesson.is_preview)
    setIsPublished(!!lesson.is_published)
    setAllowDownload(lesson.allow_download !== undefined ? lesson.allow_download : true)
    setShowVideoPreview(false)
  }, [
    lesson.id,
    lesson.title,
    lesson.lesson_type,
    lesson.content_url,
    lesson.content_body,
    lesson.is_preview,
    lesson.is_published,
    lesson.allow_download,
  ])

  // --- 1. BUNNY.NET VIDEO UPLOAD (TUS) ---
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024 * 1024) {
      alert("Video is too large. Max 2GB allowed.")
      return
    }

    setIsVideoUploading(true)
    setVideoProgress(0)

    try {
      const response = await createBunnyVideo(file.name)

      if (!response.success || !response.videoId || !response.libraryId || !response.signature || !response.expirationTime) {
        throw new Error(response.error || "Failed to fetch secure upload credentials.")
      }

      const upload = new tus.Upload(file, {
        endpoint: 'https://video.bunnycdn.com/tusupload',
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          AuthorizationSignature: response.signature,
          AuthorizationExpire: response.expirationTime,
          VideoId: response.videoId,
          LibraryId: response.libraryId,
        },
        metadata: {
          filetype: file.type || 'video/mp4',
          title: file.name || 'untitled_video'
        },
        onError: (error) => {
          console.error("Upload failed:", error)
          alert("Failed to upload video to Bunny.net. Please try again.")
          setIsVideoUploading(false)
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          setVideoProgress(Math.round((bytesUploaded / bytesTotal) * 100))
        },
        onSuccess: async () => {
          const bunnyUrl = `bunny://${response.videoId}`
          setContentUrl(bunnyUrl)

          const supabase = createClient()
          await supabase.from('course_lessons').update({ content_url: bunnyUrl }).eq('id', lesson.id)

          onUpdate({ ...lesson, content_url: bunnyUrl })
          setIsVideoUploading(false)
        }
      })

      upload.start()
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to initialize secure upload."
      alert(message)
      setIsVideoUploading(false)
    }
  }

  // --- 2. SUPABASE PRIVATE FILE UPLOAD ---
  const handlePrivateFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      alert("File is too large. Please choose a file under 50MB.")
      return
    }

    setIsFileUploading(true)
    const supabase = createClient()

    try {
      const fileExt = file.name.split('.').pop()
      const filePath = `resources/${lesson.id}-${Math.random().toString(36).substring(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('product-files').upload(filePath, file)
      if (uploadError) throw uploadError

      setContentUrl(filePath)
      await supabase.from('course_lessons').update({ content_url: filePath }).eq('id', lesson.id)
      onUpdate({ ...lesson, content_url: filePath })
    } catch (error) {
      console.error("File upload failed:", error)
      alert("Failed to upload file. Ensure 'product-files' bucket exists.")
    } finally {
      setIsFileUploading(false)
    }
  }

  // --- 3. DELETE MEDIA ---
  const handleRemoveMedia = async () => {
    if (!confirm("Are you sure you want to delete this media?")) return

    setIsSaving(true)
    const supabase = createClient()

    const { error } = await supabase.from('course_lessons').update({ content_url: null }).eq('id', lesson.id)
    setIsSaving(false)

    if (error) {
      alert("Failed to remove media.")
      return
    }

    setContentUrl('')
    setShowVideoPreview(false)
    onUpdate({ ...lesson, content_url: null })
  }

  // --- 4. SAVE LESSON FORM ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    const updates = {
      title,
      lesson_type: lessonType,
      content_url: contentUrl,
      content_body: contentBody,
      is_preview: isPreview,
      is_published: isPublished,
      allow_download: allowDownload
    }

    const supabase = createClient()
    const { error } = await supabase.from('course_lessons').update(updates).eq('id', lesson.id)

    setIsSaving(false)
    if (error) return alert("Failed to save lesson.")
    onUpdate({ ...lesson, ...updates })
  }

  // --- HELPERS ---
  const extractBunnyId = (url: string) => url.replace('bunny://', '')

  return (
    <form onSubmit={handleSave} className={styles.settingsForm}>
      
      {/* 1. STATUS & TITLE */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Lesson Status</label>
        <div className={styles.statusToggleGroup}>
          <button type="button" className={`${styles.statusToggleBtn} ${!isPublished ? styles.activeDraft : ''}`} onClick={() => setIsPublished(false)}>Draft (Hidden)</button>
          <button type="button" className={`${styles.statusToggleBtn} ${isPublished ? styles.activePublished : ''}`} onClick={() => setIsPublished(true)}>Published (Live)</button>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="lessonTitle" className={styles.label}>Lesson Title</label>
        <input id="lessonTitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={styles.input} required />
      </div>

      {/* 2. TYPE SELECTOR */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Lesson Type</label>
        <div className={styles.typeSelectorGrid}>
          {[
            { id: 'video', label: 'Video', icon: <Video size={16} /> },
            { id: 'text', label: 'Text', icon: <Type size={16} /> },
            { id: 'file', label: 'Resource / Audio', icon: <FileText size={16} /> },
            { id: 'link', label: 'External Link', icon: <Link2 size={16} /> },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              className={`${styles.typeSelectorBtn} ${lessonType === type.id ? styles.activeType : ''}`}
              onClick={() => {
                setLessonType(type.id)
                if (lessonType !== type.id) setContentUrl('')
              }}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- VIDEO UI --- */}
      {lessonType === 'video' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>Secure Video Course</label>

          {contentUrl && contentUrl.includes('bunny://') ? (
            <div className={styles.attachedMediaCard}>
              <div className={styles.mediaInfo}>
                <CheckCircle2 size={24} color="#059669" />
                <div>
                  <strong>Video Secured on Bunny Stream</strong>
                  <p>ID: {extractBunnyId(contentUrl)}</p>
                </div>
              </div>

              {showVideoPreview && (
                <div className={styles.videoEmbedWrapper}>
                  <iframe
                    src={`https://iframe.mediadelivery.net/embed/${process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID}/${extractBunnyId(contentUrl)}?autoplay=false&preload=true`}
                    loading="lazy"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                    allowFullScreen={true}
                    className={styles.videoIframe}
                  ></iframe>
                </div>
              )}

              <div className={styles.mediaActions}>
                <button type="button" className={styles.actionBtnSecondary} onClick={() => setShowVideoPreview(!showVideoPreview)}>
                  <Eye size={16} /> {showVideoPreview ? 'Hide Preview' : 'Preview Video'}
                </button>
                <button type="button" className={styles.actionBtnDanger} onClick={handleRemoveMedia}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.fileUploaderArea}>
              <input type="file" id="video-upload" accept="video/mp4,video/webm,video/mov" onChange={handleVideoUpload} hidden disabled={isVideoUploading} />
              <label htmlFor="video-upload" className={styles.fileDropZone}>
                {isVideoUploading ? (
                  <div className={styles.progressWrapper}>
                    <Loader2 size={32} className={styles.spin} color="#EAB308" />
                    <span className={styles.uploaderText}>Uploading... {videoProgress}%</span>
                    <div className={styles.progressBar}>
                      <div className={styles.progressFill} style={{ width: `${videoProgress}%` }}></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Film size={32} color="#1A1A1A" />
                    <span className={styles.uploaderText}>Click to upload MP4/WebM</span>
                    <span className={styles.uploaderSubtext}>Encrypted via Bunny Stream</span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>
      )}

      {/* --- FILE UI --- */}
      {lessonType === 'file' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>Upload Secure Resource</label>
          {contentUrl && contentUrl.includes('resources/') ? (
            <div className={styles.attachedMediaCard}>
              <div className={styles.mediaInfo}>
                <CheckCircle2 size={24} color="#059669" />
                <div>
                  <strong>File Attached Securely</strong>
                  <p>{contentUrl.split('/').pop()}</p>
                </div>
              </div>
              <div className={styles.mediaActions}>
                <button type="button" className={styles.actionBtnDanger} onClick={handleRemoveMedia}>
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.fileUploaderArea}>
              <input type="file" id="private-file-upload" accept=".pdf,.doc,.docx,.mp3,.wav,.zip" onChange={handlePrivateFileUpload} hidden disabled={isFileUploading} />
              <label htmlFor="private-file-upload" className={styles.fileDropZone}>
                {isFileUploading ? (
                  <Loader2 size={32} className={styles.spin} color="#EAB308" />
                ) : (
                  <>
                    <UploadCloud size={32} color="#1A1A1A" />
                    <span className={styles.uploaderText}>Click to upload Resource</span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>
      )}

      {/* --- EXTERNAL LINK UI --- */}
      {lessonType === 'link' && (
        <div className={styles.formGroup}>
          <label htmlFor="contentUrl" className={styles.label}>External Link URL</label>
          <input id="contentUrl" type="url" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} className={styles.input} placeholder="https://..." required />
        </div>
      )}

      {/* 4. DOWNLOAD TOGGLE */}
      {(lessonType === 'video' || lessonType === 'file') && (
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" checked={allowDownload} onChange={(e) => setAllowDownload(e.target.checked)} className={styles.checkbox} />
            <span className={styles.checkboxText}>
              <strong>Allow File Download</strong>
              <small>If unchecked, students can only view/stream this securely.</small>
            </span>
          </label>
        </div>
      )}

      {/* 5. TEXT NOTES & SETTINGS */}
      <div className={styles.formGroup}>
        <label htmlFor="contentBody" className={styles.label}>Lesson Notes / Description</label>
        <textarea id="contentBody" value={contentBody} onChange={(e) => setContentBody(e.target.value)} className={styles.textarea} rows={6} />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" checked={isPreview} onChange={(e) => setIsPreview(e.target.checked)} className={styles.checkbox} />
          <span className={styles.checkboxText}>
            <strong>Free Preview</strong>
            <small>Anyone can view this lesson without buying.</small>
          </span>
        </label>
      </div>

      <div className={styles.formFooter}>
        <button type="submit" className={styles.submitBtn} disabled={isSaving || isVideoUploading || isFileUploading}>
          {isSaving ? <Loader2 size={18} className={styles.spin} /> : <Save size={18} />}
          {isSaving ? 'Saving...' : 'Save Lesson'}
        </button>
      </div>
    </form>
  )
}