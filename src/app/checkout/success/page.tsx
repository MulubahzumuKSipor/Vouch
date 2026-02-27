import Link from 'next/link'
import { CheckCircle, BookOpen, ArrowRight, ShoppingBag } from 'lucide-react'
import styles from '@/styles/success.module.css'
import DashboardLayout from '@/components/dashboardLayout'
import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'

interface SuccessPageProps {
  searchParams: Promise<{
    amount?: string
  }>
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const supabase = await createClient()
  
  // 1. Verify Authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 2. Await search params securely (Next.js 15+ requirement)
  const params = await searchParams
  const amountParam = params.amount
  
  // Format the amount if it exists
  const formattedAmount = amountParam 
    ? new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(Number(amountParam) / 100)
    : null

  // 3. Fetch profile for the layout wrapper
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, is_seller')
    .eq('id', user.id)
    .single()

  return (
    <DashboardLayout isSeller={profile?.is_seller || false} username={profile?.full_name || 'User'}>
      <div className={styles.container}>
        <div className={styles.card}>
          {/* Decorative Kente Top Bar */}
          <div className={styles.kenteAccent} />

          <div className={styles.cardContent}>
            <div className={styles.iconWrapper}>
              <CheckCircle size={48} className={styles.successIcon} />
            </div>

            <h1 className={styles.title}>Payment Successful!</h1>
            
            <p className={styles.message}>
              Thank you for your purchase. Your payment {formattedAmount ? `of ${formattedAmount}` : ''} has been securely processed and your database records have been updated.
            </p>

            <div className={styles.receiptBox}>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Status</span>
                <span className={styles.receiptValueSuccess}>Completed</span>
              </div>
              <div className={styles.receiptRow}>
                <span className={styles.receiptLabel}>Secure Gateway</span>
                <span className={styles.receiptValue}>Vouch Simulated Checkout</span>
              </div>
            </div>

            <div className={styles.actionGroup}>
              <Link href="/dashboard/library" className={styles.primaryBtn}>
                <BookOpen size={18} />
                Go to My Library
              </Link>
              
              <Link href="/explore" className={styles.secondaryBtn}>
                <ShoppingBag size={18} />
                Browse More
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}