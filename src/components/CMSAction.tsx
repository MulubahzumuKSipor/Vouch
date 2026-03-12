'use client'

import { useState } from 'react'
import { toggleContentVisibility } from '@/lib/admin'
import { Eye, EyeOff, Loader2, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import styles from '@/styles/adminCms.module.css'

interface CmsActionsProps {
  id: string
  tableName: string
  isPublished: boolean
}

export default function CmsActions({ id, tableName, isPublished }: CmsActionsProps) {
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    await toggleContentVisibility(id, tableName, isPublished)
    setLoading(false)
  }

  return (
    <div className={styles.actionGroup}>
      <button 
        onClick={handleToggle} 
        disabled={loading} 
        className={isPublished ? styles.btnPublished : styles.btnDraft}
        title={isPublished ? "Unpublish" : "Publish"}
      >
        {loading ? <Loader2 size={14} className={styles.spin} /> : (isPublished ? <Eye size={14} /> : <EyeOff size={14} />)}
        {isPublished ? 'Live' : 'Draft'}
      </button>

      {/* 🔴 This links to the Universal Editor we will build next */}
      <Link href={`/admin/content/editor?table=${tableName}&id=${id}`} className={styles.iconBtn}>
        <Edit size={16} />
      </Link>
      <button className={`${styles.iconBtn} ${styles.danger}`} title="Delete">
        <Trash2 size={16} />
      </button>
    </div>
  )
}