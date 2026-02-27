'use client'

import { useState } from 'react'
import { ShoppingCart, Check, Loader2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import styles from '@/styles/shop.module.css'

// --- INTERFACE ---
// Define the exact fields your CartContext expects to receive
export interface CartProduct {
  id: string
  title: string
  slug: string
  price_amount: number
  price_currency: string | null
  cover_image: string | null
  product_type?: string
}

export default function AddToCartButton({ product }: { product: CartProduct }) {
  const { addItem } = useCart()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (status !== 'idle') return
    setStatus('loading')

    try {
      await addItem(product) // Triggers Context Optimistic UI
      setStatus('success')
      setTimeout(() => setStatus('idle'), 2000)
    } catch (err) {
      console.error("Failed to add item to cart:", err)
      setStatus('idle')
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={status !== 'idle'}
      className={`${styles.addToCartBtn} ${status === 'success' ? styles.btnSuccess : ''}`}
      aria-label="Add to cart"
    >
      {status === 'loading' ? (
        <Loader2 size={18} className={styles.spin} />
      ) : status === 'success' ? (
        <>
          <Check size={18} />
          <span className={styles.btnText}>Added</span>
        </>
      ) : (
        <>
          <ShoppingCart size={18} />
          <span className={styles.btnText}>Add</span>
        </>
      )}
    </button>
  )
}