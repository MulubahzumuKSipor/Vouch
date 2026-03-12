'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/client'
import { useCart } from '@/context/CartContext'
import { processGuestCheckout, checkEmailOwnership } from '@/lib/action'
import { Lock, Smartphone, ShieldCheck, Loader2, ArrowLeft, Mail, AlertTriangle } from 'lucide-react'
import styles from '@/styles/checkout.module.css'

// 🔴 1. REMOVED TIPME
type PaymentMethod = 'mtn_momo' | 'orange_money'

export default function CheckoutPage() {
  const { items: cartItems, isLoading, removeItem } = useCart()
  const router = useRouter()
  const supabase = createClient()

  const [method, setMethod] = useState<PaymentMethod>('mtn_momo')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'idle' | 'checking' | 'prompting' | 'verifying' | 'completing'>('idle')

  // New state to show phone validation errors natively without browser alerts
  const [phoneError, setPhoneError] = useState<string | null>(null)

  const [isDirectMode, setIsDirectMode] = useState(false)
  const [directItem, setDirectItem] = useState<any | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const [ownershipWarning, setOwnershipWarning] = useState<{status: string, message: string} | null>(null)
  const [showModal, setShowModal] = useState(false)

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

  // 🔴 2. DETECT CHECKOUT CURRENCY AND CHECK FOR MIXED CARTS
  const checkoutCurrency = activeItems.length > 0 ? (activeItems[0].currency || activeItems[0].price_currency || 'USD') : 'USD'
  const hasMixedCurrencies = activeItems.some(item => (item.currency || item.price_currency || 'USD') !== checkoutCurrency)

  const total = activeItems.reduce((acc, item) => acc + (item.price_amount || item.price * (item.quantity || 1)), 0)
  const totalFormatted = new Intl.NumberFormat(checkoutCurrency === 'LRD' ? 'en-LR' : 'en-US', {
    style: 'currency',
    currency: checkoutCurrency,
    minimumFractionDigits: checkoutCurrency === 'LRD' ? 0 : 2
  }).format(total / 100)

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
    setPhoneError(null)

    if (hasMixedCurrencies) {
      alert("You cannot mix USD and LRD items in the same checkout. Please adjust your cart.")
      return;
    }

    // 🔴 3. STRICT PHONE VALIDATION LOGIC
    // Remove all spaces and hyphens
    const cleanPhone = phone.replace(/[-\s]/g, '')
    let isValidPhone = false

    if (method === 'mtn_momo') {
      if (cleanPhone.startsWith('088') && cleanPhone.length === 10) isValidPhone = true
      else if (cleanPhone.startsWith('+23188') && cleanPhone.length === 13) isValidPhone = true
      else {
        setPhoneError('MTN MoMo numbers must start with 088 (10 digits) or +23188 (13 characters).')
        return
      }
    } else if (method === 'orange_money') {
      if (cleanPhone.startsWith('077') && cleanPhone.length === 10) isValidPhone = true
      else if (cleanPhone.startsWith('+23177') && cleanPhone.length === 13) isValidPhone = true
      else {
        setPhoneError('Orange Money numbers must start with 077 (10 digits) or +23177 (13 characters).')
        return
      }
    }

    if (!isValidPhone || !email) return

    setIsProcessing(true)
    setPaymentStep('checking')

    const productIds = activeItems.map(item => item.product_id || item.id)
    const ownershipCheck = await checkEmailOwnership(email, productIds)

    if (ownershipCheck.status === 'owner' || ownershipCheck.status === 'purchased') {
      setOwnershipWarning({
        status: ownershipCheck.status,
        message: ownershipCheck.message || 'You already own this product.'
      })
      setShowModal(true)
      setIsProcessing(false)
      setPaymentStep('idle')
      return;
    }

    setPaymentStep('prompting')
    await new Promise(resolve => setTimeout(resolve, 1500))

    setPaymentStep('verifying')
    await new Promise(resolve => setTimeout(resolve, 1500))

    setPaymentStep('completing')

    try {
      // Pass the CLEANED phone number to the backend
      const result = await processGuestCheckout({
        email,
        phone: cleanPhone,
        method,
        items: activeItems
      })

      if (result.error) {
        throw new Error(result.error)
      }

      if (!isDirectMode) {
        for (const item of activeItems) {
          const productId = item.product_id || item.id
          await removeItem(productId)
        }
      } else {
        sessionStorage.removeItem('directBuyItem')
      }

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
    <>
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

            {/* Frontend Mix Currency Warning */}
            {hasMixedCurrencies && (
              <div style={{ background: '#FEF2F2', border: '1px solid #F87171', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '8px', color: '#991B1B' }}>
                <AlertTriangle size={20} />
                <p style={{ fontSize: '0.875rem', margin: 0 }}>
                  <strong>Mixed Currencies Detected!</strong> You cannot purchase USD and LRD items in the same transaction. Please check out separately.
                </p>
              </div>
            )}

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
                  onClick={() => { setMethod('mtn_momo'); setPhoneError(null); }}
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
                  onClick={() => { setMethod('orange_money'); setPhoneError(null); }}
                >
                  <div className={styles.radioCircle}>
                    {method === 'orange_money' && <div className={styles.radioDot} />}
                  </div>
                  <div className={`${styles.providerIcon} ${styles.orangeIcon}`}>O</div>
                  <span>Orange Money</span>
                </button>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="phone" className={styles.label}>
                  Mobile Money Number
                </label>
                <div className={styles.inputWrapper}>
                  <Smartphone size={20} className={styles.inputIcon} />
                  <input
                    id="phone"
                    type="tel"
                    placeholder={method === 'mtn_momo' ? "+23188 / 088..." : "+23177 / 077..."}
                    className={styles.input}
                    value={phone}
                    // 🔴 4. ALLOW DIGITS, HYPHENS, AND THE PLUS SIGN
                    onChange={(e) => {
                      setPhoneError(null)
                      setPhone(e.target.value.replace(/[^\d+-]/g, ''))
                    }}
                    required
                    disabled={isProcessing}
                    maxLength={16} // Increased to allow + and hyphens during typing
                  />
                </div>
                {/* 🔴 5. INLINE PHONE ERROR MESSAGES */}
                {phoneError && (
                  <p style={{ color: '#DC2626', fontSize: '0.875rem', marginTop: '4px', fontWeight: 500 }}>
                    {phoneError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isProcessing || !phone || !email || hasMixedCurrencies}
              >
                {isProcessing ? (
                  <div className={styles.processingWrapper}>
                    <Loader2 size={20} className={styles.spin} />
                    <span>
                      {paymentStep === 'checking' && 'Verifying account...'}
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
                    {new Intl.NumberFormat(item.currency === 'LRD' || item.price_currency === 'LRD' ? 'en-LR' : 'en-US', { style: 'currency', currency: item.currency || item.price_currency || 'USD' }).format((item.price_amount || item.price * (item.quantity || 1)) / 100)}
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

      {showModal && ownershipWarning && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div onClick={() => setShowModal(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }} />

          <div style={{ position: 'relative', background: 'white', borderRadius: '16px', width: '100%', maxWidth: '400px', padding: '2.5rem 2rem', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ width: '64px', height: '64px', background: '#FEF2F2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
              <Lock size={32} color="#DC2626" />
            </div>

            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginBottom: '0.75rem' }}>
              {ownershipWarning.status === 'owner' ? 'You created this!' : 'Already Purchased!'}
            </h2>

            <p style={{ color: '#4B5563', marginBottom: '2rem', lineHeight: '1.6', fontSize: '1rem' }}>
              {ownershipWarning.message} To access it without paying, please log in to your account.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link
                href={`/login?email=${encodeURIComponent(email)}`}
                style={{ display: 'block', width: '100%', background: '#4F46E5', color: 'white', padding: '0.875rem', borderRadius: '8px', fontWeight: '600', textDecoration: 'none' }}
              >
                Log In to Access
              </Link>

              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#6B7280', fontWeight: '600', padding: '0.75rem', cursor: 'pointer', fontSize: '0.875rem' }}
              >
                Close and use a different email
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}