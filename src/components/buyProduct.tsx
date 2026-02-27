'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useCart, CartProduct } from '@/context/CartContext'
import styles from '@/styles/product.module.css' // Reusing your product styles

export default function BuyNowButton({ product }: { product: CartProduct }) {
  const { addItem } = useCart()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBuyNow = async () => {
    if (isProcessing) return
    setIsProcessing(true)

    try {
      await addItem(product) // Add to cart
      router.push('/checkout') // Immediately redirect to checkout
    } catch (error) {
      console.error("Failed to process Buy Now:", error)
      setIsProcessing(false)
    }
  }

  return (
    <button 
      onClick={handleBuyNow} 
      disabled={isProcessing}
      className={styles.buyButton}
    >
      {isProcessing ? (
        <>
          <Loader2 size={20} className={styles.spin} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
          Processing...
        </>
      ) : (
        'Buy Now'
      )}
    </button>
  )
}