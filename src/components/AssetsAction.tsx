'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Archive, Trash2, Loader2, AlertTriangle, X } from 'lucide-react'
import { archiveProduct, deleteProduct } from '@/lib/product'
import styles from '@/styles/create-modal.module.css' // We can reuse your beautiful modal styles!

export default function AssetActions({ id, title }: { id: string, title: string }) {
  const router = useRouter()
  const [isArchiving, setIsArchiving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // --- ARCHIVE LOGIC (Soft Delete) ---
  const handleArchive = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!window.confirm(`Archive "${title}"? It will be hidden from your store, but past buyers can still access it.`)) return

    setIsArchiving(true)
    const result = await archiveProduct(id)
    if (result?.error) alert(result.error)
    setIsArchiving(false)
    router.refresh()
  }

  // --- HARD DELETE LOGIC ---
  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteProduct(id)
    
    if (result?.error) {
      alert(result.error)
      setIsDeleting(false)
      setShowDeleteModal(false)
    } else {
      setShowDeleteModal(false)
      router.refresh()
    }
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {/* Archive Button */}
        <button 
          onClick={handleArchive} 
          disabled={isArchiving || isDeleting}
          title="Archive Asset (Keep for past buyers)"
          style={{
            background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer',
            padding: '0.5rem', opacity: isArchiving ? 0.5 : 1, transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
        >
          {isArchiving ? <Loader2 size={16} className={styles.spin} /> : <Archive size={16} />}
        </button>

        {/* Delete Button */}
        <button 
          onClick={(e) => { e.preventDefault(); setShowDeleteModal(true); }} 
          disabled={isArchiving || isDeleting}
          title="Permanently Delete"
          style={{
            background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer',
            padding: '0.5rem', opacity: isDeleting ? 0.5 : 1, transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#B91C1C'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#EF4444'}
        >
          {isDeleting ? <Loader2 size={16} className={styles.spin} /> : <Trash2 size={16} />}
        </button>
      </div>

      {/* --- DANGER MODAL --- */}
      {showDeleteModal && (
        <div className={styles.overlay} onClick={() => setShowDeleteModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            
            <div className={styles.header} style={{ borderBottom: 'none', paddingBottom: '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#EF4444' }}>
                <AlertTriangle size={24} />
                <h2 style={{ color: '#111827' }}>Delete Asset?</h2>
              </div>
              <button onClick={() => setShowDeleteModal(false)} className={styles.closeBtn}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.form}>
              <p style={{ color: '#4B5563', lineHeight: '1.5', margin: '0 0 1.5rem 0' }}>
                Are you absolutely sure you want to delete <strong>&apos;{title}&apos;</strong>? 
              </p>
              <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', padding: '1rem', borderRadius: '8px', color: '#991B1B', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                <strong>Warning:</strong> This is permanent. The file will be wiped from our servers, and any customers who purchased this will instantly lose access to their download.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button onClick={() => setShowDeleteModal(false)} className={styles.cancelBtn} disabled={isDeleting}>
                  Cancel
                </button>
                <button 
                  onClick={handleDelete} 
                  disabled={isDeleting}
                  style={{ background: '#EF4444', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                  {isDeleting ? <><Loader2 size={18} className={styles.spin} /> Deleting...</> : 'Yes, Delete Asset'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}