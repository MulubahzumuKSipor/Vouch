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
  const { items, isLoading, removeItem } = useCart()
  const router = useRouter()
  const supabase = createClient()
  
  const [method, setMethod] = useState<PaymentMethod>('mtn_momo')
  const [phone, setPhone] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'idle' | 'prompting' | 'verifying' | 'completing'>('idle')

  const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)
  const totalFormatted = new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    minimumFractionDigits: 2 
  }).format(total / 100)

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoading && items.length === 0) {
      router.push('/explore')
    }
  }, [items, isLoading, router])

  // --- THE REAL DATABASE SIMULATION ---
  const handleSimulatedPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone || phone.length < 9) return

    setIsProcessing(true)
    
    // 1. Simulate Mobile Money Prompt
    setPaymentStep('prompting')
    await new Promise(resolve => setTimeout(resolve, 1500))

    // 2. Simulate Network Verification
    setPaymentStep('verifying')
    await new Promise(resolve => setTimeout(resolve, 1500))

    setPaymentStep('completing')

    try {
      // 3. Authenticate the Buyer
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("You must be logged in to complete a purchase.")
      }

      // 4. Process each item in the cart into a real Order
      for (const item of items) {
        // We need the seller's ID to record the sale accurately
        const { data: product } = await supabase
          .from('products')
          .select('seller_id')
          .eq('id', item.product_id)
          .single()

        if (!product) continue;

        // Calculate exact financial breakdown
        const amountPaid = item.price * item.quantity
        const platformFee = Math.floor(amountPaid * 0.05) // 5% Vouch Fee
        const sellerEarnings = amountPaid - platformFee

        // Generate a random Order Number
        const orderNumber = `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`

        // Insert the official order into your database matching your exact schema requirements
        const { error: orderError } = await supabase.from('orders').insert({
          order_number: orderNumber,
          buyer_id: user.id,
          buyer_email: user.email,
          buyer_phone: phone,                      // Captured from the form
          seller_id: product.seller_id,
          product_id: item.product_id,
          product_title: item.title,
          product_price: item.price,               // REQUIRED: Base price
          amount_paid: amountPaid,
          currency: (item.currency || 'USD') as 'USD' | 'LRD' | 'EUR' | 'GBP' | 'NGN' | 'GHS' | 'KES',
          platform_fee: platformFee,
          seller_earnings: sellerEarnings,
          referral_commission: 0,
          payment_method: method,                  // Track the method used
          status: 'completed',                     // Matches order_status_enum
          completed_at: new Date().toISOString()   // Timestamp the completion
        })

        if (orderError) {
          console.error("Order insertion failed:", orderError)
          throw new Error("Failed to create order record. Please contact support.")
        }

        // 5. Remove the item from the cart now that it is purchased
        await removeItem(item.product_id)
      }

      // 6. Success! Route to the confirmation page.
      router.push(`/checkout/success?amount=${total}`)

    } catch (error: unknown) {
      console.error(error)
      const err = error as Error
      alert(err.message || "Something went wrong during checkout.")
      setIsProcessing(false)
      setPaymentStep('idle')
    }
  }

  if (isLoading || items.length === 0) {
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
            {items.map((item) => (
              <div key={item.product_id} className={styles.summaryItem}>
                <div className={styles.itemImageWrapper}>
                  {item.cover_image ? (
                    <Image src={item.cover_image} alt={item.title} fill sizes="64px" className={styles.itemImage} />
                  ) : (
                    <div className={styles.placeholderImg}>{item.title[0]}</div>
                  )}
                  {item.quantity > 1 && (
                    <span className={styles.quantityBadge}>{item.quantity}</span>
                  )}
                </div>
                <div className={styles.itemDetails}>
                  <h4 className={styles.itemTitle}>{item.title}</h4>
                  <p className={styles.itemAuthor}>by {item.seller_username || 'Creator'}</p>
                </div>
                <div className={styles.itemPrice}>
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: item.currency || 'USD' }).format((item.price * item.quantity) / 100)}
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