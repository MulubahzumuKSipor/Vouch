'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Search, Plus, MoreVertical, Eye, TrendingUp, Package, Edit3, ExternalLink, Link2, Check, Video, FileText, Calendar
} from 'lucide-react'
import styles from '@/styles/productEdits.module.css'
import CreateProductModal from './newModal'
import AssetActions from '@/components/AssetsAction'

function ProductImage({ src, alt, type }: { src?: string | null; alt: string, type: string }) {
  if (src) {
    return (
      <div className={styles.imageWrapper}>
        <Image src={src} alt={alt} fill className={styles.productThumb} unoptimized={src.includes('.svg')} />
      </div>
    )
  }
  return (
    <div className={styles.placeholderThumb}>
      {type === 'course' && <Video size={20} strokeWidth={1.5} />}
      {type === 'asset' && <FileText size={20} strokeWidth={1.5} />}
      {type === 'service' && <Calendar size={20} strokeWidth={1.5} />}
      {!['course', 'asset', 'service'].includes(type) && <Package size={20} strokeWidth={1.5} />}
    </div>
  )
}

// Dynamically route to the correct editor
const getEditorPath = (type: string, id: string) => {
  if (type === 'asset') return `/dashboard/assets/${id}`
  if (type === 'service') return `/dashboard/services/${id}`
  return `/dashboard/products/${id}`
}

// Generate nice UI badges based on product type
const getTypeBadge = (type: string) => {
  if (type === 'asset') return { label: 'Digital Asset', color: '#E11D48', bg: '#FFF1F2' }
  if (type === 'service') return { label: 'Consultation', color: '#16A34A', bg: '#F0FDF4' }
  return { label: 'Course', color: '#4F46E5', bg: '#EEF2FF' }
}

type Product = {
  id: string; title: string; slug: string; price_amount: number; price_currency: string;
  cover_image: string | null; is_published: boolean; product_type: string;
  view_count: number; sales_count: number; created_at: string;
}

export default function ProductManager({ initialProducts, username }: { initialProducts: Product[], username: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'course' | 'asset' | 'service'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsModalOpen(true)
      router.replace('/dashboard/products', { scroll: false })
    }
  }, [searchParams, router])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter by Search AND Product Type
  const filteredProducts = initialProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' ? true : product.product_type === filterType
    return matchesSearch && matchesType
  })

  const handleCopyLink = (slug: string, id: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/vouch.lr/@${username}/${slug}`)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    setActiveDropdown(null)
  }

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>

        {/* ── HEADER ── */}
        <header className={styles.header}>
          <div className={styles.headerText}>
            <h1 className={styles.title}>My Business</h1>
            <p className={styles.subtitle}>Manage all your courses, assets, and consultations.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className={styles.createBtn}>
            <Plus size={18} /> <span>Add Product</span>
          </button>
        </header>

        {/* ── TOOLBAR ── */}
        <div className={styles.toolbar}>
          <div className={styles.tabs}>
            <button onClick={() => setFilterType('all')} className={`${styles.tab} ${filterType === 'all' ? styles.activeTab : ''}`}>
              All <span className={styles.badge}>{initialProducts.length}</span>
            </button>
            <button onClick={() => setFilterType('course')} className={`${styles.tab} ${filterType === 'course' ? styles.activeTab : ''}`}>
              Courses <span className={styles.badge}>{initialProducts.filter(p => p.product_type === 'course').length}</span>
            </button>
            <button onClick={() => setFilterType('asset')} className={`${styles.tab} ${filterType === 'asset' ? styles.activeTab : ''}`}>
              Assets <span className={styles.badge}>{initialProducts.filter(p => p.product_type === 'asset').length}</span>
            </button>
            <button onClick={() => setFilterType('service')} className={`${styles.tab} ${filterType === 'service' ? styles.activeTab : ''}`}>
              Consultations <span className={styles.badge}>{initialProducts.filter(p => p.product_type === 'service').length}</span>
            </button>
          </div>

          <div className={styles.searchBox}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search products..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* ── PRODUCT LIST CARD ── */}
        <div className={styles.listCard}>
          {filteredProducts.length > 0 && (
            <div className={styles.listHeader}>
              <div className={styles.colMain}>Product Details</div>
              <div className={styles.colStats}>Performance</div>
              <div className={styles.colStatus}>Status</div>
              <div className={styles.colAction}></div>
            </div>
          )}

          {filteredProducts.length > 0 ? (
            <div className={styles.listBody}>
              {filteredProducts.map((product) => {
                const editorPath = getEditorPath(product.product_type, product.id)
                const typeBadge = getTypeBadge(product.product_type)

                return (
                  <div key={product.id} className={styles.productRow}>

                    {/* Clickable Area spans the grid */}
                    <Link href={editorPath} className={styles.rowContent}>

                      {/* Column 1: Image & Info */}
                      <div className={styles.colMain}>
                        <ProductImage src={product.cover_image} alt={product.title} type={product.product_type} />
                        <div className={styles.productInfo}>
                          <h3 className={styles.productTitle}>{product.title}</h3>
                          <div className={styles.productMeta}>
                            <span
                              className={styles.metaType}
                              style={{ backgroundColor: typeBadge.bg, color: typeBadge.color, padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}
                            >
                              {typeBadge.label}
                            </span>
                            <span className={styles.metaDot}>•</span>
                            <span className={styles.metaPrice}>
                              {product.price_amount > 0 ? `$${(product.price_amount / 100).toFixed(2)} ${product.price_currency}` : 'Free'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Column 2: Stats */}
                      <div className={styles.colStats}>
                        <div className={styles.statGroup}>
                          <TrendingUp size={14} className={styles.statIcon} />
                          <span className={styles.statValue}>{product.sales_count} sales</span>
                        </div>
                        <div className={styles.statGroup}>
                          <Eye size={14} className={styles.statIcon} />
                          <span className={styles.statValue}>{product.view_count} views</span>
                        </div>
                      </div>

                      {/* Column 3: Status */}
                      <div className={styles.colStatus}>
                        <span className={`${styles.statusBadge} ${product.is_published ? styles.badgePublished : styles.badgeDraft}`}>
                          {product.is_published ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </Link>

                    {/* Column 4: Actions (Outside the Link) */}
                    <div className={styles.colAction} ref={activeDropdown === product.id ? dropdownRef : null} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>

                      <AssetActions id={product.id} title={product.title} />

                      <button
                        className={styles.iconBtn}
                        onClick={(e) => { e.preventDefault(); setActiveDropdown(activeDropdown === product.id ? null : product.id) }}
                        aria-label="Product Actions"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeDropdown === product.id && (
                        <div className={styles.dropdown}>
                          <Link href={editorPath} className={styles.dropItem}>
                            <Edit3 size={16} /> Edit {typeBadge.label}
                          </Link>
                          <Link href={`/vouch.lr/@${username}/${product.slug}`} target="_blank" className={styles.dropItem}>
                            <ExternalLink size={16} /> View on Store
                          </Link>
                          <div className={styles.dropDivider} />
                          <button onClick={() => handleCopyLink(product.slug, product.id)} className={styles.dropItem}>
                            {copiedId === product.id ? <Check size={16} className={styles.textGreen} /> : <Link2 size={16} />}
                            {copiedId === product.id ? 'Link Copied!' : 'Copy Link'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIconCircle}>
                <Package size={32} />
              </div>
              <h3 className={styles.emptyTitle}>No products found</h3>
              <p className={styles.emptyText}>
                {searchQuery
                  ? `We couldn't find anything matching "${searchQuery}".`
                  : "You haven't created any products yet. Get started now."}
              </p>
              {!searchQuery && (
                <button onClick={() => setIsModalOpen(true)} className={styles.createBtn}>
                  Create Your First Product
                </button>
              )}
            </div>
          )}
        </div>

        <CreateProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </div>
  )
}