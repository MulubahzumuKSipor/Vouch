'use client'

import Link from 'next/link'
import { ShoppingBag, Search } from 'lucide-react'
import styles from '@/styles/shop.module.css'
import CartDrawer from './CartDrawer'
import { useCart } from '@/context/CartContext'

export default function ShopHeader() {
  const { items, openDrawer } = useCart()

  return (
    <>
      <header className={styles.shopHeader}>
        <div className={styles.headerContainer}>
          <Link href="#" className={styles.brandLogo}>VOUCH</Link>
          <div className={styles.headerSearch}>
            <Search size={18} className={styles.searchIcon} />
            <input type="text" placeholder="Search this shop..." className={styles.searchInput} />
          </div>
          <button className={styles.cartTrigger} onClick={openDrawer}>
            <ShoppingBag size={24} />
            {items.length > 0 && <span className={styles.cartBadge}>{items.length}</span>}
          </button>
        </div>
      </header>
      <CartDrawer />
    </>
  )
}