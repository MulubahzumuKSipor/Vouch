'use client'

import { useState } from 'react'
import { ShoppingCart, Check, Loader2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import styles from '@/styles/shop.module.css'

// --- INTERFACE ---
// 🔴 FIXED: Updated to exactly match what CartContext expects, specifically adding 'username'
export interface CartProductPayload {
  id: string
  title: string
  slug: string
  price_amount: number
  price_currency: string | null
  cover_image: string | null
  username: string
}

export default function AddToCartButton({ product }: { product: CartProductPayload }) {
  const { addItem, openDrawer } = useCart()
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleClick = async (e: React.MouseEvent) => {
    // Crucial: Prevents the Next.js <Link> wrapper from redirecting the user!
    e.preventDefault()
    e.stopPropagation()

    if (status !== 'idle') return
    setStatus('loading')

    try {
      await addItem(product) // Adds to global cart state and database
      setStatus('success')

      // Optional: Automatically open the cart drawer so they see what they added!
      // If you prefer them to stay on the grid uninterrupted, you can comment this out.
      openDrawer()

      // Reset the button visual state after 2 seconds
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
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.5rem 1rem',
        backgroundColor: status === 'success' ? '#059669' : '#111827',
        color: '#ffffff',
        borderRadius: '9999px',
        border: 'none',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: status !== 'idle' ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {status === 'loading' ? (
        <Loader2 size={16} className="spin-animation" />
      ) : status === 'success' ? (
        <>
          <Check size={16} />
          <span>Added</span>
        </>
      ) : (
        <>
          <ShoppingCart size={16} />
          <span>Add to Cart</span>
        </>
      )}

      {/* Local animation for the loader */}
      <style jsx>{`
        .spin-animation {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </button>
  )
}