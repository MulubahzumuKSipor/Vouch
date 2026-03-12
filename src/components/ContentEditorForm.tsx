'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { saveContent } from '@/lib/admin'
import { Loader2, Save } from 'lucide-react'
import styles from '@/styles/adminCms.module.css' // Reusing your existing styles

export default function ContentEditorForm({ 
  table, 
  id, 
  initialData 
}: { 
  table: string
  id?: string
  initialData: any 
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // State for common fields
  const [title, setTitle] = useState(initialData?.title || '')
  const [isPublished, setIsPublished] = useState(initialData?.is_published || false)

  // Determine what type of content we are editing to show the right fields
  const isPress = table === 'press_releases'
  const isGuide = table === 'creator_guides'
  
  // State for dynamic fields
  const [slug, setSlug] = useState(initialData?.slug || '')
  const [category, setCategory] = useState(initialData?.category || initialData?.release_type || '')
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || initialData?.description || '')
  const [content, setContent] = useState(initialData?.content || '')
  
  // Specific fields
  const [authorName, setAuthorName] = useState(initialData?.author_name || 'Admin')
  const [readTime, setReadTime] = useState(initialData?.read_time_minutes || 5)
  const [externalUrl, setExternalUrl] = useState(initialData?.external_url || '')
  const [publicationName, setPublicationName] = useState(initialData?.publication_name || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Build the data object based on the table schema
    let dataToSave: any = { title, is_published: isPublished }

    if (isPress) {
      dataToSave = { 
        ...dataToSave, 
        publication_name: publicationName, 
        release_type: category, 
        external_url: externalUrl,
        published_date: initialData?.published_date || new Date().toISOString().split('T')[0] 
      }
    } else {
      dataToSave = { 
        ...dataToSave, 
        slug, 
        category, 
        content 
      }
      if (table === 'blog_posts') {
        dataToSave = { ...dataToSave, excerpt, author_name: authorName, read_time_minutes: readTime }
      }
      if (table === 'help_articles') {
        dataToSave = { ...dataToSave, excerpt }
      }
      if (isGuide) {
        dataToSave = { ...dataToSave, description: excerpt, read_time_minutes: readTime, icon_name: 'FileText', color_class: 'bg-blue-500' }
      }
    }

    const result = await saveContent(table, dataToSave, id)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      // Success! Send them back to the hub
      router.push(`/admin/content?tab=${table}`)
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* ── COMMON FIELDS ── */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Title</label>
          <input required type="text" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
        </div>
        {!isPress && (
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>URL Slug</label>
            <input required type="text" value={slug} onChange={e => setSlug(e.target.value)} style={inputStyle} placeholder="my-awesome-post" />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>{isPress ? 'Release Type' : 'Category'}</label>
          <input required type="text" value={category} onChange={e => setCategory(e.target.value)} style={inputStyle} placeholder="e.g. Announcements" />
        </div>
        
        {table === 'blog_posts' && (
          <>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Author</label>
              <input required type="text" value={authorName} onChange={e => setAuthorName(e.target.value)} style={inputStyle} />
            </div>
            <div style={{ flex: 0.5 }}>
              <label style={labelStyle}>Read Time (min)</label>
              <input required type="number" value={readTime} onChange={e => setReadTime(Number(e.target.value))} style={inputStyle} />
            </div>
          </>
        )}
      </div>

      {/* ── PRESS RELEASE SPECIFIC ── */}
      {isPress && (
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Publication Name</label>
            <input required type="text" value={publicationName} onChange={e => setPublicationName(e.target.value)} style={inputStyle} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>External URL (Link to article)</label>
            <input type="url" value={externalUrl} onChange={e => setExternalUrl(e.target.value)} style={inputStyle} />
          </div>
        </div>
      )}

      {/* ── CONTENT & EXCERPT ── */}
      {!isPress && (
        <>
          <div>
            <label style={labelStyle}>{isGuide ? 'Short Description' : 'Excerpt'}</label>
            <textarea required value={excerpt} onChange={e => setExcerpt(e.target.value)} style={{ ...inputStyle, minHeight: '80px' }} />
          </div>
          <div>
            <label style={labelStyle}>Main Content (HTML/Markdown)</label>
            <textarea required value={content} onChange={e => setContent(e.target.value)} style={{ ...inputStyle, minHeight: '300px', fontFamily: 'monospace' }} />
          </div>
        </>
      )}

      {/* ── PUBLISH STATUS ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
        <input 
          type="checkbox" 
          id="publishCheck" 
          checked={isPublished} 
          onChange={(e) => setIsPublished(e.target.checked)} 
          style={{ width: '16px', height: '16px' }}
        />
        <label htmlFor="publishCheck" style={{ fontWeight: 600, color: '#111827', cursor: 'pointer' }}>
          Publish immediately (Make public)
        </label>
      </div>

      {error && <div style={{ color: '#DC2626', fontSize: '0.875rem' }}>{error}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button type="submit" disabled={loading} className={styles.createBtn}>
          {loading ? <Loader2 size={18} className={styles.spin} /> : <Save size={18} />}
          {loading ? 'Saving...' : 'Save Content'}
        </button>
      </div>

    </form>
  )
}

// Quick inline styles for the form inputs
const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.9375rem', outline: 'none' }