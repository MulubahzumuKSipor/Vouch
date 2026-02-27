'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation' // <-- Added imports
import {
  Search, Plus, MoreVertical, Eye, TrendingUp, Package, Edit3, ExternalLink, Link2, Check
} from 'lucide-react'
import styles from '@/styles/productEdits.module.css' // Adjust if you renamed it to product-manager.module.css
import CreateProductModal from './newModal'

function ProductImage({ src, alt }: { src?: string | null; alt: string }) {
  if (src) {
    return (
      <div className={styles.imageWrapper}>
        <Image src={src} alt={alt} fill className={styles.productThumb} unoptimized={src.includes('.svg')} />
      </div>
    )
  }
  return (
    <div className={styles.placeholderThumb}>
      <Package size={20} strokeWidth={1.5} />
    </div>
  )
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
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // --- NEW: Auto-open modal if ?new=true is in URL ---
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsModalOpen(true)
      // Clean up the URL so a refresh doesn't pop it open again
      router.replace('/dashboard/products', { scroll: false })
    }
  }, [searchParams, router])

  // --- Handle clicks outside dropdown ---
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filteredProducts = initialProducts.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTab = filter === 'all' ? true : filter === 'published' ? product.is_published : !product.is_published
    return matchesSearch && matchesTab
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
            <h1 className={styles.title}>Products</h1>
            <p className={styles.subtitle}>Manage and organize your digital storefront.</p>
          </div>
          <button onClick={() => setIsModalOpen(true)} className={styles.createBtn}>
            <Plus size={18} /> <span>Add New Course</span>
          </button>
        </header>

        {/* ... Rest of your component (Toolbar, List Card, etc.) remains exactly the same ... */}

        {/* ── TOOLBAR ── */}
        <div className={styles.toolbar}>
          <div className={styles.tabs}>
            <button onClick={() => setFilter('all')} className={`${styles.tab} ${filter === 'all' ? styles.activeTab : ''}`}>
              All <span className={styles.badge}>{initialProducts.length}</span>
            </button>
            <button onClick={() => setFilter('published')} className={`${styles.tab} ${filter === 'published' ? styles.activeTab : ''}`}>
              Published <span className={styles.badge}>{initialProducts.filter(p => p.is_published).length}</span>
            </button>
            <button onClick={() => setFilter('draft')} className={`${styles.tab} ${filter === 'draft' ? styles.activeTab : ''}`}>
              Drafts <span className={styles.badge}>{initialProducts.filter(p => !p.is_published).length}</span>
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
              {filteredProducts.map((product) => (
                <div key={product.id} className={styles.productRow}>

                  {/* Clickable Area spans the grid */}
                  <Link href={`/dashboard/products/${product.id}`} className={styles.rowContent}>

                    {/* Column 1: Image & Info */}
                    <div className={styles.colMain}>
                      <ProductImage src={product.cover_image} alt={product.title} />
                      <div className={styles.productInfo}>
                        <h3 className={styles.productTitle}>{product.title}</h3>
                        <div className={styles.productMeta}>
                          <span className={styles.metaType}>{product.product_type}</span>
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
                  <div className={styles.colAction} ref={activeDropdown === product.id ? dropdownRef : null}>
                    <button
                      className={styles.iconBtn}
                      onClick={(e) => { e.preventDefault(); setActiveDropdown(activeDropdown === product.id ? null : product.id) }}
                      aria-label="Product Actions"
                    >
                      <MoreVertical size={18} />
                    </button>

                    {activeDropdown === product.id && (
                      <div className={styles.dropdown}>
                        <Link href={`/dashboard/products/${product.id}`} className={styles.dropItem}>
                          <Edit3 size={16} /> Edit Product
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
              ))}
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