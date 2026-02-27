'use client'

import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import styles from '@/styles/shop.module.css'

// Helper to keep the JSX clean
const formatPrice = (amount: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount / 100)
}

export default function CartDrawer() {
  const { items, removeItem, isOpen, closeDrawer, isLoading } = useCart()
  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)


  return (
    <>
      {/* Overlay - Fades in/out */}
      <div
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer - Slides in/out */}
      <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`} role="dialog" aria-label="Shopping Cart">

        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitleWrapper}>
            <ShoppingBag size={20} />
            <h2 className={styles.drawerTitle}>Your Bag ({items.length})</h2>
          </div>
          <button onClick={closeDrawer} className={styles.closeBtn} aria-label="Close cart">
            <X size={24} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          {isLoading && items.length === 0 ? (
            // 🔴 POLISHED: Premium Skeleton Loader instead of a basic spinner
            <div className={styles.skeletonContainer}>
              {[1, 2, 3].map((i) => (
                <div key={i} className={styles.skeletonItem}>
                  <div className={styles.skeletonImage} />
                  <div className={styles.skeletonTextWrapper}>
                    <div className={styles.skeletonTextLine} style={{ width: '80%' }} />
                    <div className={styles.skeletonTextLine} style={{ width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length > 0 ? (
            items.map((item) => (
              <div key={item.product_id} className={styles.cartItem}>
                <div className={styles.itemImage}>
                   {item.cover_image ? (
                     <Image
                       src={item.cover_image}
                       alt={item.title}
                       fill
                       sizes="80px"
                       style={{ objectFit: 'cover' }}
                     />
                   ) : (
                     <div className={styles.placeholderImg}>{item.title[0]}</div>
                   )}
                </div>

                <div className={styles.itemDetails}>
                  {item.username && item.slug ? (
                    <Link
                      href={`/@${item.username}/${item.slug}`}
                      onClick={closeDrawer}
                      className={styles.itemTitleLink}
                    >
                      <h4 className={styles.itemTitle}>{item.title}</h4>
                    </Link>
                  ) : (
                    <div className={styles.itemTitleLink}>
                      <h4 className={styles.itemTitle}>{item.title}</h4>
                    </div>
                  )}

                  <p className={styles.itemPrice}>
                    {formatPrice(item.price, item.currency)}
                  </p>

                  <button onClick={() => removeItem(item.product_id)} className={styles.removeBtn}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyDrawer}>
              <div className={styles.emptyIconWrapper}>
                <ShoppingBag size={48} color="#D1D5DB" />
              </div>
              <p className={styles.emptyText}>Your bag is empty.</p>
              <button onClick={closeDrawer} className={styles.continueBtn}>Continue Shopping</button>
            </div>
          )}
        </div>

        {/* Footer sticks to the bottom */}
        {items.length > 0 && (
          <div className={styles.drawerFooter}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span className={styles.totalAmount}>
                {formatPrice(total)}
              </span>
            </div>

            <div className={styles.checkoutActions}>
              <Link href="/checkout" className={styles.checkoutBtn} onClick={closeDrawer}>
                Checkout <ArrowRight size={18} />
              </Link>
              {/* Optional: if you don't have a dedicated /cart page, you can remove this link! */}
              <Link href="/cart" className={styles.viewCartLink} onClick={closeDrawer}>
                View Full Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}