'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import styles from '@/styles/product.module.css'

export default function BuyNowButton({ product }: { product: any }) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleBuyNow = () => {
    if (isProcessing) return
    setIsProcessing(true)

    // 🔴 THE FIX: Do NOT use addItem() here. We bypass the global cart entirely.
    const directBuyPayload = { ...product, quantity: 1 }

    // Save it temporarily in the browser's session storage
    sessionStorage.setItem('directBuyItem', JSON.stringify(directBuyPayload))

    // Redirect to checkout with a flag telling it to look for the single item
    router.push('/checkout?mode=direct')
  }

  return (
    <button
      onClick={handleBuyNow}
      disabled={isProcessing}
      className={styles.buyButton}
    >
      {isProcessing ? (
        <>
          <Loader2 size={20} style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
          Processing...
        </>
      ) : (
        'Buy Now'
      )}
    </button>
  )
}