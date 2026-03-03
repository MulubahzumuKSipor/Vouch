'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { useCart } from '@/context/CartContext'
import { processGuestCheckout } from '@/lib/action' // 🔴 IMPORTED THE SERVER ACTION
import { Lock, Smartphone, ShieldCheck, Loader2, ArrowLeft, Mail } from 'lucide-react'
import styles from '@/styles/checkout.module.css'

type PaymentMethod = 'mtn_momo' | 'orange_money' | 'tipme'

export default function CheckoutPage() {
  const { items: cartItems, isLoading, removeItem } = useCart()
  const router = useRouter()
  const supabase = createClient()
  
  const [method, setMethod] = useState<PaymentMethod>('mtn_momo')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'idle' | 'prompting' | 'verifying' | 'completing'>('idle')

  const [isDirectMode, setIsDirectMode] = useState(false)
  const [directItem, setDirectItem] = useState<any | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // 1. Check if we are in Direct Buy mode & Fetch User on mount
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

    // Pre-fill email if user is already logged in
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setEmail(user.email)
      }
    }
    fetchUser()
  }, [supabase.auth])

  const activeItems = isDirectMode ? (directItem ? [directItem] : []) : cartItems
  const isReady = isDirectMode ? !isInitializing : !isLoading

  const total = activeItems.reduce((acc, item) => acc + (item.price_amount || item.price * item.quantity), 0)
  const totalFormatted = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    minimumFractionDigits: 2 
  }).format(total / 100)

  // Kick out if cart is empty
  useEffect(() => {
    if (isInitializing || isProcessing) return;

    const timer = setTimeout(() => {
      if (isReady && activeItems.length === 0) {
        router.push('/explore')
      }
    }, 600)

    return () => clearTimeout(timer)
  }, [activeItems.length, isReady, isProcessing, isInitializing, router])

  const handleSimulatedPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || phone.length < 9 || !email) return

    setIsProcessing(true)
    
    // Simulate Mobile Money USSD prompt delay
    setPaymentStep('prompting')
    await new Promise(resolve => setTimeout(resolve, 1500))

    setPaymentStep('verifying')
    await new Promise(resolve => setTimeout(resolve, 1500))

    setPaymentStep('completing')

    try {
      // 🔴 THE MAGIC: We send everything to our secure Server Action!
      const result = await processGuestCheckout({
        email,
        phone,
        method,
        items: activeItems
      })

      if (result.error) {
        throw new Error(result.error)
      }

      // If successful, clean up the cart/storage
      if (!isDirectMode) {
        for (const item of activeItems) {
          const productId = item.product_id || item.id
          await removeItem(productId)
        }
      } else {
        sessionStorage.removeItem('directBuyItem')
      }

      // Send them to the success page!
      router.push(`/checkout/success?amount=${total}&email=${encodeURIComponent(email)}`)

    } catch (error: any) {
      console.error(error)
      alert(error.message || "Something went wrong during checkout.")
      setIsProcessing(false)
      setPaymentStep('idle')
    }
  }

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
            <h2 className={styles.sectionTitle}>Payment Details</h2>
            <div className={styles.secureBadge}>
              <Lock size={14} /> End-to-End Encrypted
            </div>
          </div>

          <form onSubmit={handleSimulatedPayment} className={styles.form}>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Where should we send your receipt?
              </label>
              <div className={styles.inputWrapper}>
                <Mail size={20} className={styles.inputIcon} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isProcessing}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '0.25rem' }}>
                We&apos;ll email you a secure link so you never lose access to your purchase.
              </p>
            </div>

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
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  required
                  disabled={isProcessing}
                  maxLength={10}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className={styles.submitBtn}
              disabled={isProcessing || phone.length < 9 || !email}
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