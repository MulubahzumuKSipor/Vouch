'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Search, X, Trash2, Package } from 'lucide-react'
import styles from '@/styles/locked-store-layout.module.css'
import { useCart } from '@/context/CartContext'

interface LockedStoreLayoutProps {
  children: React.ReactNode
  sellerName: string
  sellerAvatar?: string | null
  sellerUsername: string
}

export default function LockedStoreLayout({ 
  children, 
  sellerName, 
  sellerUsername 
}: LockedStoreLayoutProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [cartOpen, setCartOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')

  // 🔴 FIXED: Destructured the correct context values
  const { items, isLoading, removeItem } = useCart()

  // 🔴 FIXED: Derived the missing values locally from the items array
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)
  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams(searchParams.toString())

    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim())
    } else {
      params.delete('q')
    }

    const queryString = params.toString()
    const url = queryString ? `/@${sellerUsername}?${queryString}` : `/@${sellerUsername}`
    router.push(url)
  }

  // Handle clearing search
  const handleClearSearch = () => {
    setSearchQuery('')
    router.push(`/@${sellerUsername}`)
  }

  // Handle removing item from cart
  const handleRemoveItem = async (productId: string) => {
    // 🔴 FIXED: Using the correctly named function from Context
    await removeItem(productId)
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100)
  }

  return (
    <div className={styles.lockedContainer}>
      {/* Top Bar - Search + Cart */}
      <header className={styles.topBar}>
        {/* Search Bar */}
        <form className={styles.searchContainer} onSubmit={handleSearch}>
          <Search className={styles.searchIcon} size={18} />
          <input
            type="text"
            name="q"
            placeholder={`Search ${sellerName}'s products...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className={styles.clearSearchBtn}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </form>

        {/* Actions */}
        <div className={styles.actions}>
          {/* Cart Button */}
          <button
            className={styles.cartBtn}
            aria-label="Shopping cart"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingCart size={20} />
            {itemCount > 0 && (
              <span className={styles.cartBadge}>{itemCount}</span>
            )}
          </button>
        </div>
      </header>

      {/* Store Content */}
      <main className={styles.storeContent}>
        {children}
      </main>

      {/* Cart Drawer */}
      {cartOpen && (
        <>
          {/* Overlay */}
          <div
            className={styles.overlay}
            onClick={() => setCartOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <aside className={styles.cartDrawer} role="dialog" aria-label="Shopping cart">
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>Shopping Cart</h2>
              <button
                className={styles.closeBtn}
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
              >
                <X size={24} />
              </button>
            </div>

            <div className={styles.drawerContent}>
              {items.length === 0 ? (
                /* Empty state */
                <div className={styles.emptyCart}>
                  <ShoppingCart size={48} className={styles.emptyIcon} />
                  <p className={styles.emptyText}>Your cart is empty</p>
                  <p className={styles.emptySubtext}>
                    Add some products from {sellerName}&apos;s store!
                  </p>
                </div>
              ) : (
                /* Cart items */
                <div className={styles.cartItems}>
                  {items.map((item) => (
                    <div key={item.product_id} className={styles.cartItem}>
                      <div className={styles.cartItemImage}>
                        {item.cover_image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.cover_image} alt={item.title} />
                        ) : (
                          <Package size={24} />
                        )}
                      </div>
                      <div className={styles.cartItemInfo}>
                        <p className={styles.cartItemTitle}>{item.title}</p>
                        <p className={styles.cartItemSeller}>by {item.seller_username}</p>
                        {/* Notice we removed price_changed and price_snapshot because they do not exist on CartItem */}
                      </div>
                      <div className={styles.cartItemRight}>
                        <p className={styles.cartItemPrice}>
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        <button
                          className={styles.cartItemRemove}
                          onClick={() => handleRemoveItem(item.product_id)}
                          aria-label={`Remove ${item.title} from cart`}
                          disabled={isLoading}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.drawerFooter}>
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalAmount}>
                  {formatCurrency(total)}
                </span>
              </div>
              <button
                className={styles.checkoutBtn}
                disabled={items.length === 0 || isLoading}
                onClick={() => {
                  router.push('/checkout')
                  setCartOpen(false)
                }}
              >
                {isLoading ? 'Loading...' : items.length === 0 ? 'Cart is Empty' : 'Proceed to Checkout'}
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <p className={styles.poweredBy}>
          Powered by <Link href="/" className={styles.platformLink}>Vouch</Link>
        </p>
      </footer>
    </div>
  )
}