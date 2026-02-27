'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { ArrowLeft, Plus, Settings, Video, FileText, Link2, Type, Loader2, GripVertical, Eye } from 'lucide-react'
import styles from '@/styles/editor.module.css'

import ProductSettingsForm from './ProductSettingsForm'
import LessonEditorForm from './lessonForm'

// --- INTERFACES ---
export interface CourseLesson {
  id: string; module_id: string; title: string; lesson_type: string;
  content_body: string | null; content_url: string | null;
  is_preview: boolean; is_published: boolean; sort_order: number | null;
  allow_download?: boolean;
}

export interface CourseModule {
  id: string; product_id?: string; title: string; description?: string | null;
  sort_order: number | null; course_lessons: CourseLesson[];
}

export interface CourseProduct {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
  description?: string | null;
  price_amount?: number;
  price_currency?: string;
  cover_image?: string | null;
  course_modules: CourseModule[];
  [key: string]: string | number | boolean | null | undefined | CourseModule[];
}

export default function CourseEditor({
  initialProduct,
  username
}: {
  initialProduct: CourseProduct
  username: string
}) {
  const [product, setProduct] = useState<CourseProduct>(initialProduct)
  const [activePane, setActivePane] = useState<'settings' | 'lesson'>('settings')
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null)

  const [isAddingModule, setIsAddingModule] = useState(false)
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null)

  // 2. Initialize the ref for the form canvas
  const formCanvasRef = useRef<HTMLDivElement>(null)

  const supabase = createClient()

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video size={16} />
      case 'text': return <Type size={16} />
      case 'file': return <FileText size={16} />
      case 'link': return <Link2 size={16} />
      default: return <FileText size={16} />
    }
  }

  // Find active lesson
  let activeLesson: CourseLesson | null = null
  if (activePane === 'lesson' && activeLessonId) {
    for (const mod of product.course_modules) {
      const found = mod.course_lessons.find((l) => l.id === activeLessonId)
      if (found) {
        activeLesson = found; break;
      }
    }
  }

  const handleLessonUpdate = (updatedLesson: CourseLesson) => {
    setProduct((prev) => {
      const newModules = prev.course_modules.map((mod) => {
        if (mod.id === updatedLesson.module_id) {
          return {
            ...mod,
            course_lessons: mod.course_lessons.map((l) => l.id === updatedLesson.id ? updatedLesson : l)
          }
        }
        return mod
      })
      return { ...prev, course_modules: newModules }
    })
  }

  const handleAddModule = async () => {
    setIsAddingModule(true)
    const nextSortOrder = product.course_modules.length > 0 ? Math.max(...product.course_modules.map((m) => m.sort_order || 0)) + 1 : 0
    const { data: newModule, error } = await supabase.from('course_modules').insert({ product_id: product.id, title: 'New Module', sort_order: nextSortOrder }).select().single()
    setIsAddingModule(false)
    if (error) { alert("Failed to create module."); return; }
    setProduct((prev) => ({ ...prev, course_modules: [...prev.course_modules, { ...newModule, course_lessons: [] } as CourseModule] }))
  }

  const handleAddLesson = async (moduleId: string, currentLessons: CourseLesson[]) => {
    setAddingLessonTo(moduleId)
    const nextSortOrder = currentLessons.length > 0 ? Math.max(...currentLessons.map((l) => l.sort_order || 0)) + 1 : 0
    const { data: newLesson, error } = await supabase.from('course_lessons').insert({ module_id: moduleId, title: 'New Lesson', lesson_type: 'video', sort_order: nextSortOrder, is_published: false }).select().single()
    setAddingLessonTo(null)
    if (error) { alert("Failed to create lesson."); return; }
    setProduct((prev) => {
      const newModules = prev.course_modules.map((mod) => {
        if (mod.id === moduleId) { return { ...mod, course_lessons: [...mod.course_lessons, newLesson as CourseLesson] } }
        return mod
      })
      return { ...prev, course_modules: newModules }
    })
    setActivePane('lesson')
    setActiveLessonId(newLesson.id)

    // Auto-scroll to the new lesson form on mobile
    if (window.innerWidth <= 860) {
      setTimeout(() => formCanvasRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }

  // Helper to handle clicks and trigger the scroll
  const handlePaneSwitch = (pane: 'settings' | 'lesson', lessonId?: string) => {
    setActivePane(pane)
    if (lessonId) setActiveLessonId(lessonId)

    if (window.innerWidth <= 860) {
      setTimeout(() => formCanvasRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }

  return (
    <div className={styles.editorRoot}>
      
      {/* --- TOP NAV BAR --- */}
      <header className={styles.topNav}>
        <div className={styles.navLeft}>
          <Link href="/dashboard/products" className={styles.backBtn} aria-label="Back to Products">
            <ArrowLeft size={20} />
          </Link>
          <div className={styles.titleWrapper}>
            <h1 className={styles.productTitle}>{product.title}</h1>
            <span className={`${styles.statusBadge} ${product.is_published ? styles.badgePublished : styles.badgeDraft}`}>
              {product.is_published ? 'Published' : 'Draft'}
            </span>
          </div>
        </div>
        
        <div className={styles.navRight}>
          <Link href={`/vouch.lr/@${username}/${product.slug}`} target="_blank" className={styles.previewBtn}>
            <Eye size={16} /> Preview Storefront
          </Link>
        </div>
      </header>

      {/* --- SPLIT PANE WORKSPACE --- */}
      <div className={styles.workspace}>
        
        {/* LEFT PANE: The Outline */}
        <aside className={styles.sidebar}>
          
          <div className={styles.sidebarHeader}>
            <button
              className={`${styles.rootNavItem} ${activePane === 'settings' ? styles.activeRootNav : ''}`}
              onClick={() => handlePaneSwitch('settings')}
            >
              <div className={styles.rootNavIcon}><Settings size={18} /></div>
              <span>Product Settings</span>
            </button>
          </div>

          <div className={styles.curriculumSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Curriculum</h3>
              <button className={styles.addModuleBtn} onClick={handleAddModule} disabled={isAddingModule}>
                {isAddingModule ? <Loader2 size={16} className={styles.spin} /> : <><Plus size={16} /> Module</>}
              </button>
            </div>

            <div className={styles.moduleList}>
              {product.course_modules.map((module) => (
                <div key={module.id} className={styles.moduleCard}>
                  <div className={styles.moduleHeader}>
                    <div className={styles.moduleHeaderLeft}>
                      <GripVertical size={16} className={styles.dragHandle} />
                      <h4 className={styles.moduleTitle}>{module.title}</h4>
                    </div>
                    <button className={styles.addLessonIcon} onClick={() => handleAddLesson(module.id, module.course_lessons)} disabled={addingLessonTo === module.id} title="Add Lesson">
                      {addingLessonTo === module.id ? <Loader2 size={14} className={styles.spin} /> : <Plus size={16} />}
                    </button>
                  </div>

                  <div className={styles.lessonList}>
                    {module.course_lessons.length === 0 && (
                      <div className={styles.emptyModule}>No lessons yet</div>
                    )}
                    {module.course_lessons.map((lesson) => {
                      const isActive = activeLessonId === lesson.id && activePane === 'lesson'
                      return (
                        <button
                          key={lesson.id}
                          className={`${styles.lessonItem} ${isActive ? styles.activeLesson : ''}`}
                          onClick={() => handlePaneSwitch('lesson', lesson.id)}
                        >
                          <div className={styles.lessonIconWrapper}>
                            {getLessonIcon(lesson.lesson_type)}
                          </div>
                          <span className={styles.lessonTitle}>{lesson.title}</span>

                          <div className={styles.lessonBadges}>
                            {lesson.is_preview && <span className={styles.previewTag}>Free</span>}
                            {!lesson.is_published && <span className={styles.draftTag}>Draft</span>}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT PANE: The Canvas */}
        <main className={styles.canvas} ref={formCanvasRef}>
          <div className={styles.canvasInner}>
            {activePane === 'settings' && (
              <div className={styles.formWrapper}>
                <div className={styles.formHeader}>
                  <h2>Product Settings</h2>
                  <p>Update your storefront details, pricing, and cover image.</p>
                </div>
                <ProductSettingsForm
                  product={product as any}
                  onUpdate={(updatedData: any) => setProduct((prev) => ({ ...prev, ...updatedData }))}
                />
              </div>
            )}

            {activePane === 'lesson' && activeLesson && (
              <div className={styles.formWrapper}>
                <div className={styles.formHeader}>
                  <h2>Edit Lesson</h2>
                  <p>Add content, videos, and downloads for your students.</p>
                </div>
                {/* 🔴 FIXED: Asserted as any to bypass the null vs string interface mismatch */}
                <LessonEditorForm lesson={activeLesson as any} onUpdate={handleLessonUpdate as any} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}