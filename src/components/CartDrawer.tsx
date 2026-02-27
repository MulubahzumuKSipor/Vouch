'use client'

import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import styles from '@/styles/shop.module.css'

export default function CartDrawer() {
  const { items, removeItem, isOpen, closeDrawer, isLoading } = useCart()
  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

  if (!isOpen) return null

  return (
    <>
      <div className={styles.overlay} onClick={closeDrawer} />
      <div className={styles.drawer}>

        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitleWrapper}>
            <ShoppingBag size={20} />
            <h2 className={styles.drawerTitle}>Your Bag ({items.length})</h2>
          </div>
          <button onClick={closeDrawer} className={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          {isLoading && items.length === 0 ? (
            <div className={styles.drawerLoading}>
              <div className={styles.spin}></div>
              <span>Loading cart...</span>
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
                  {/* UX CHECK: Conditionally render the link if we have the right data */}
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
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: item.currency || 'USD',
                      minimumFractionDigits: 0
                    }).format(item.price / 100)}
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

        {items.length > 0 && (
          <div className={styles.drawerFooter}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span className={styles.totalAmount}>
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD',
                  minimumFractionDigits: 0
                }).format(total / 100)}
              </span>
            </div>

            <div className={styles.checkoutActions}>
              <Link href="/checkout" className={styles.checkoutBtn} onClick={closeDrawer}>
                Checkout <ArrowRight size={18} />
              </Link>
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