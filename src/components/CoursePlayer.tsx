'use client'

import { useState, useEffect, useRef } from 'react' // <-- Added useRef
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { ArrowLeft, PlayCircle, FileText, Link2, Download, Type, CheckCircle2, Loader2 } from 'lucide-react'
import VideoPlayer from '@/components/videoPlayer'
import styles from '@/styles/learn.module.css'

// --- INTERFACES ---
export interface PlayerLesson {
  id: string
  title: string
  lesson_type: string
  content_url?: string | null
  content_body?: string | null
  is_preview?: boolean
  is_published?: boolean
  sort_order?: number | null
}

export interface PlayerModule {
  id: string
  title: string
  sort_order?: number | null
  course_lessons: PlayerLesson[]
}

export interface PlayerProduct {
  id: string
  title: string
  slug: string
  seller_id: string
  profiles: {
    username: string
  }
}

interface CoursePlayerProps {
  product: PlayerProduct
  modules: PlayerModule[]
}

export default function CoursePlayer({ product, modules }: CoursePlayerProps) {
  const firstLesson = modules.flatMap(m => m.course_lessons)[0] || null
  const [activeLesson, setActiveLesson] = useState<PlayerLesson | null>(firstLesson)

  // State to hold the secure, temporary URL for private files
  const [signedFileUrl, setSignedFileUrl] = useState<string | null>(null)
  const [isUrlLoading, setIsUrlLoading] = useState(false)

  // --- NEW: Ref for mobile auto-scrolling ---
  const stageRef = useRef<HTMLElement>(null)

  const totalMaterials = modules.reduce((acc, mod) => acc + mod.course_lessons.length, 0)

  // Fetch a signed URL whenever the user clicks a 'file' lesson
  useEffect(() => {
    async function fetchSignedUrl() {
      if (activeLesson?.lesson_type === 'file' && activeLesson.content_url) {
        setIsUrlLoading(true)
        const supabase = createClient()
        // Generate a URL valid for 1 hour
        const { data, error } = await supabase.storage
          .from('product-files')
          .createSignedUrl(activeLesson.content_url, 60 * 60)

        if (data) {
          setSignedFileUrl(data.signedUrl)
        } else {
          console.error("Failed to generate signed URL:", error)
          setSignedFileUrl(null)
        }
        setIsUrlLoading(false)
      } else {
        setSignedFileUrl(null)
      }
    }

    fetchSignedUrl()
  }, [activeLesson])

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <PlayCircle size={20} />
      case 'file': return <FileText size={20} />
      case 'link': return <Link2 size={20} />
      default: return <Type size={20} />
    }
  }

  // --- NEW: Custom click handler to trigger the scroll ---
  const handleLessonSelect = (lesson: PlayerLesson) => {
    setActiveLesson(lesson)

    // Auto-scroll down to the video on mobile screens (under 860px)
    if (window.innerWidth <= 860) {
      setTimeout(() => stageRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
    }
  }

  const renderContent = () => {
    if (!activeLesson) return null

    switch (activeLesson.lesson_type) {
      case 'video':
        return activeLesson.content_url ? (
          <div className={styles.mediaStage}>
            <VideoPlayer contentUrl={activeLesson.content_url} title={activeLesson.title} />
          </div>
        ) : (
          <div className={styles.missingMedia}>Video unavailable or processing.</div>
        )

      case 'file':
        if (!activeLesson.content_url) {
           return <div className={styles.missingMedia}>File unavailable.</div>
        }

        if (isUrlLoading || !signedFileUrl) {
          return (
            <div className={styles.resourceStage}>
              <Loader2 className={styles.spinIcon} size={48} color="#1A1A1A" />
              <h3 className={styles.resourceTitle}>Decrypting Resource...</h3>
            </div>
          )
        }

        // Check if the file is a PDF based on the storage path safely
        const isPdf = activeLesson.content_url.toLowerCase().endsWith('.pdf')

        if (isPdf) {
          // EMBED PDFs DIRECTLY
          return (
            <div className={styles.pdfStage}>
              <div className={styles.pdfToolbar}>
                <span className={styles.pdfTitle}>Document Viewer</span>
                <a href={signedFileUrl} download className={styles.actionButtonSmall}>
                  <Download size={16} /> Download PDF
                </a>
              </div>
              <iframe
                src={`${signedFileUrl}#toolbar=0`}
                className={styles.pdfIframe}
                title={activeLesson.title}
              />
            </div>
          )
        } else {
          // WORD DOCS / EXCEL / ZIP (Force Download UI)
          return (
            <div className={styles.resourceStage}>
              <div className={styles.resourceIcon}><FileText size={48} color="#1A1A1A" /></div>
              <h3 className={styles.resourceTitle}>Document Resource</h3>
              <p className={styles.resourceNotice}>This document format requires a native application (like Word or Excel) to open.</p>

              {/* Unconditionally allow download for documents */}
              <a href={signedFileUrl} download className={styles.actionButton}>
                <Download size={18} /> Download Document
              </a>
            </div>
          )
        }

      case 'link':
        if (!activeLesson.content_url) {
           return <div className={styles.missingMedia}>Link unavailable.</div>
        }
        return (
          <div className={styles.resourceStage}>
            <div className={styles.resourceIcon}><Link2 size={48} color="#1A1A1A" /></div>
            <h3 className={styles.resourceTitle}>External Link Required</h3>
            <a href={activeLesson.content_url} target="_blank" rel="noopener noreferrer" className={styles.actionButton}>
              Open Link <Link2 size={18} />
            </a>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className={styles.layout}>

      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Link href={`/@${product.profiles.username}/${product.slug}`} className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Product
          </Link>
          <h2 className={styles.courseTitle}>{product.title}</h2>
          <div className={styles.progressBadge}>
            <CheckCircle2 size={14} />
            <span>{totalMaterials} Materials</span>
          </div>
        </div>

        <nav className={styles.curriculumNav}>
            {modules.map((module, mIndex) => (
                <div key={module.id} className={styles.moduleGroup}>

                {/* Module Header */}
                <div className={styles.moduleHeader}>
                    <span className={styles.moduleBadge}>MOD {mIndex + 1}</span>
                    <span className={styles.moduleTitle}>{module.title}</span>
                </div>

                {/* Material List */}
                <div className={styles.lessonList}>
                    {module.course_lessons.length === 0 && (
                    <p className={styles.emptyModuleText}>No materials published yet.</p>
                    )}

                    {module.course_lessons.map((lesson, lIndex) => {
                    const isActive = activeLesson?.id === lesson.id
                    return (
                        <button
                        key={lesson.id}
                        onClick={() => handleLessonSelect(lesson)} /* <-- USED NEW HANDLER */
                        className={`${styles.lessonItem} ${isActive ? styles.activeItem : ''}`}
                        >
                        <div className={styles.lessonIconWrapper}>
                            {getIcon(lesson.lesson_type)}
                        </div>

                        <div className={styles.lessonDetails}>
                            <span className={styles.lessonNumber}>Material {lIndex + 1}</span>
                            <span className={styles.lessonName}>{lesson.title}</span>
                        </div>

                        {/* Little dot indicator when active */}
                        {isActive && <div className={styles.activeIndicator} />}
                        </button>
                    )
                    })}
                </div>

                </div>
            ))}
        </nav>
      </aside>

      {/* MAIN STAGE */}
      <main className={styles.mainStage} ref={stageRef}> {/* <-- ATTACHED REF */}
        {activeLesson ? (
          <div className={styles.contentContainer}>

            {renderContent()}

            <div className={styles.infoCard}>
              <h1 className={styles.activeTitle}>{activeLesson.title}</h1>

              {activeLesson.content_body && (
                <div className={styles.textBody}>
                  {activeLesson.content_body.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className={styles.emptyState}>
            <h2>No materials found in this curriculum.</h2>
          </div>
        )}
      </main>

    </div>
  )
}