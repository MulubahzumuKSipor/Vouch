'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { useCart } from '@/context/CartContext'
import { Lock, Smartphone, ShieldCheck, Loader2, ArrowLeft } from 'lucide-react'
import styles from '@/styles/checkout.module.css'

type PaymentMethod = 'mtn_momo' | 'orange_money' | 'tipme'

export default function CheckoutPage() {
  const { items: cartItems, isLoading, removeItem } = useCart()
  const router = useRouter()
  const supabase = createClient()
  
  const [method, setMethod] = useState<PaymentMethod>('mtn_momo')
  const [phone, setPhone] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'idle' | 'prompting' | 'verifying' | 'completing'>('idle')

  // 🔴 NEW: State to handle the "Buy Now" bypass
  const [isDirectMode, setIsDirectMode] = useState(false)
  const [directItem, setDirectItem] = useState<any | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // 1. Check if we are in Direct Buy mode on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isDirect = window.location.search.includes('mode=direct')
      setIsDirectMode(isDirect)

      if (isDirect) {
        const storedItem = sessionStorage.getItem('directBuyItem')
        if (storedItem) {
          setDirectItem(JSON.parse(storedItem))
        }
      }
      setIsInitializing(false)
    }
  }, [])

  // 2. Determine which items we are actually checking out with
  const activeItems = isDirectMode ? (directItem ? [directItem] : []) : cartItems
  const isReady = isDirectMode ? !isInitializing : !isLoading

  const total = activeItems.reduce((acc, item) => acc + (item.price_amount || item.price * item.quantity), 0)
  const totalFormatted = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    minimumFractionDigits: 2 
  }).format(total / 100)

  // 3. Bulletproof Kick-Out Logic
  useEffect(() => {
    if (isInitializing || isProcessing) return;

    const timer = setTimeout(() => {
      // Only kick them out if they aren't in direct mode AND the global cart is empty
      if (isReady && activeItems.length === 0) {
        router.push('/explore')
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [activeItems.length, isReady, isProcessing, isInitializing, router])

  // --- THE REAL DATABASE SIMULATION ---
  const handleSimulatedPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || phone.length < 9) return

    setIsProcessing(true)
    
    setPaymentStep('prompting')
    await new Promise(resolve => setTimeout(resolve, 1500))

    setPaymentStep('verifying')
    await new Promise(resolve => setTimeout(resolve, 1500))

    setPaymentStep('completing')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("You must be logged in to complete a purchase.")
      }

      for (const item of activeItems) {
        // Handle varying payload structures (Cart vs Direct Buy)
        const productId = item.product_id || item.id
        const itemPrice = item.price_amount || item.price

        const { data: product } = await supabase
          .from('products')
          .select('seller_id')
          .eq('id', productId)
          .single()

        if (!product) continue;

        const amountPaid = itemPrice * (item.quantity || 1)
        const platformFee = Math.floor(amountPaid * 0.05)
        const sellerEarnings = amountPaid - platformFee

        const orderNumber = `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

        const { error: orderError } = await supabase.from('orders').insert({
          order_number: orderNumber,
          buyer_id: user.id,
          buyer_email: user.email,
          buyer_phone: phone,
          seller_id: product.seller_id,
          product_id: productId,
          product_title: item.title,
          product_price: itemPrice,
          amount_paid: amountPaid,
          currency: (item.currency || item.price_currency || 'USD') as 'USD' | 'LRD' | 'EUR' | 'GBP' | 'NGN' | 'GHS' | 'KES',
          platform_fee: platformFee,
          seller_earnings: sellerEarnings,
          referral_commission: 0,
          payment_method: method,
          status: 'completed',
          completed_at: new Date().toISOString()
        })

        if (orderError) throw new Error("Failed to create order record.")

        // Only remove from global cart if we are NOT in direct mode
        if (!isDirectMode) {
          await removeItem(productId)
        }
      }

      // Clear the temporary direct buy item
      if (isDirectMode) {
        sessionStorage.removeItem('directBuyItem')
      }

      router.push(`/checkout/success?amount=${total}`)

    } catch (error: unknown) {
      console.error(error)
      const err = error as Error
      alert(err.message || "Something went wrong during checkout.")
      setIsProcessing(false)
      setPaymentStep('idle')
    }
  }

  // Loading UI
  if (!isReady || (activeItems.length === 0 && !isProcessing)) {
    return (
      <div className={styles.loadingState}>
        <Loader2 size={40} className={styles.spin} />
        <p>Securing your checkout...</p>
      </div>
    )
  }

  return (
    <div className={styles.checkoutLayout}>
      
      {/* LEFT COLUMN: Payment Details */}
      <div className={styles.paymentColumn}>
        <div className={styles.header}>
          <Link href="/explore" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Store
          </Link>
          <div className={styles.brand}>
            <div className={styles.logoIcon}>V</div>
            <span className={styles.logoText}>Vouch Secure Checkout</span>
          </div>
        </div>

        <div className={styles.formContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Payment Method</h2>
            <div className={styles.secureBadge}>
              <Lock size={14} /> End-to-End Encrypted
            </div>
          </div>

          <form onSubmit={handleSimulatedPayment} className={styles.form}>
            {/* Method Selectors */}
            <div className={styles.methodGrid}>
              <button
                type="button"
                className={`${styles.methodCard} ${method === 'mtn_momo' ? styles.methodActive : ''}`}
                onClick={() => setMethod('mtn_momo')}
              >
                <div className={styles.radioCircle}>
                  {method === 'mtn_momo' && <div className={styles.radioDot} />}
                </div>
                <div className={`${styles.providerIcon} ${styles.mtnIcon}`}>MTN</div>
                <span>MTN MoMo</span>
              </button>

              <button
                type="button"
                className={`${styles.methodCard} ${method === 'orange_money' ? styles.methodActive : ''}`}
                onClick={() => setMethod('orange_money')}
              >
                <div className={styles.radioCircle}>
                  {method === 'orange_money' && <div className={styles.radioDot} />}
                </div>
                <div className={`${styles.providerIcon} ${styles.orangeIcon}`}>O</div>
                <span>Orange Money</span>
              </button>

              <button
                type="button"
                className={`${styles.methodCard} ${method === 'tipme' ? styles.methodActive : ''}`}
                onClick={() => setMethod('tipme')}
              >
                <div className={styles.radioCircle}>
                  {method === 'tipme' && <div className={styles.radioDot} />}
                </div>
                <div className={`${styles.providerIcon} ${styles.tipmeIcon}`}>T</div>
                <span>TipMe</span>
              </button>
            </div>

            {/* Phone Input */}
            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>
                {method === 'tipme' ? 'TipMe Wallet Number' : 'Mobile Money Number'}
              </label>
              <div className={styles.inputWrapper}>
                <Smartphone size={20} className={styles.inputIcon} />
                <input
                  id="phone"
                  type="tel"
                  placeholder="e.g. 088xxxxxxx or 077xxxxxxx"
                  className={styles.input}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} // Strictly numbers
                  required
                  disabled={isProcessing}
                  maxLength={10}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isProcessing || phone.length < 9}
            >
              {isProcessing ? (
                <div className={styles.processingWrapper}>
                  <Loader2 size={20} className={styles.spin} />
                  <span>
                    {paymentStep === 'prompting' && 'Check your phone for a prompt...'}
                    {paymentStep === 'verifying' && 'Verifying transaction...'}
                    {paymentStep === 'completing' && 'Finalizing...'}
                  </span>
                </div>
              ) : (
                <>Pay {totalFormatted}</>
              )}
            </button>

            {/* Trust Indicators */}
            <div className={styles.trustIndicators}>
              <div className={styles.trustItem}>
                <ShieldCheck size={16} />
                <span>Buyer Protection Guarantee</span>
              </div>
              <p className={styles.termsText}>
                By completing this purchase, you agree to Vouch&apos;s Terms of Service and Digital Product Return Policy.
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: Order Summary */}
      <div className={styles.summaryColumn}>
        <div className={styles.kenteAccent} />
        <div className={styles.summaryContent}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          
          <div className={styles.itemList}>
            {activeItems.map((item) => (
              <div key={item.product_id || item.id} className={styles.summaryItem}>
                <div className={styles.itemImageWrapper}>
                  {item.cover_image ? (
                    <Image src={item.cover_image} alt={item.title} fill sizes="64px" className={styles.itemImage} />
                  ) : (
                    <div className={styles.placeholderImg}>{item.title[0]}</div>
                  )}
                  {item.quantity && item.quantity > 1 && (
                    <span className={styles.quantityBadge}>{item.quantity}</span>
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <h4 className={styles.itemTitle}>{item.title}</h4>
                  <p className={styles.itemAuthor}>by {item.seller_username || item.username || 'Creator'}</p>
                </div>
                <div className={styles.itemPrice}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency || item.price_currency || 'USD' }).format((item.price_amount || item.price * (item.quantity || 1)) / 100)}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.totalsArea}>
            <div className={styles.totalRow}>
              <span>Subtotal</span>
              <span>{totalFormatted}</span>
            </div>
            <div className={styles.totalRow}>
              <span>Platform Fee</span>
              <span className={styles.freeText}>Covered by Creator</span>
            </div>
            <div className={styles.grandTotalRow}>
              <span>Total Due</span>
              <span className={styles.grandTotalAmount}>{totalFormatted}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}