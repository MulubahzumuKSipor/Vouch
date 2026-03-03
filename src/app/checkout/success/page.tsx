import Link from 'next/link'
import { CheckCircle, BookOpen, ArrowRight, ShoppingBag, Mail } from 'lucide-react'
import styles from '@/styles/success.module.css'
import DashboardLayout from '@/components/dashboardLayout'
import { createClient } from '@/lib/server'

interface SuccessPageProps {
  searchParams: Promise<{
    amount?: string;
    email?: string;
  }>
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const supabase = await createClient()
  
  // 1. Check for user, but DON'T redirect if they aren't there
  const { data: { user } } = await supabase.auth.getUser()

  const params = await searchParams
  const amountParam = params.amount
  const guestEmail = params.email
  
  const formattedAmount = amountParam 
    ? new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(Number(amountParam) / 100)
    : null

  // 2. Fetch profile ONLY if a user is logged in
  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, is_seller')
      .eq('id', user.id)
      .single()
    profile = data;
  }

  // 3. Define the Page Content
  const content = (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.kenteAccent} />

        <div className={styles.cardContent}>
          <div className={styles.iconWrapper}>
            <CheckCircle size={48} className={styles.successIcon} />
          </div>

          <h1 className={styles.title}>Payment Successful!</h1>

          <p className={styles.message}>
            Thank you for your purchase. Your payment {formattedAmount ? `of ${formattedAmount}` : ''} has been securely processed.
          </p>

          {/* Guest Instruction Box */}
          {!user && (
            <div className={styles.guestInfoBox} style={{ backgroundColor: '#EEF2FF', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #E0E7FF' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', color: '#4338CA' }}>
                <Mail size={20} />
                <span style={{ fontWeight: '600' }}>Check your inbox</span>
              </div>
              <p style={{ fontSize: '0.9rem', color: '#374151', marginTop: '0.5rem' }}>
                We sent a secure access link to <strong>{guestEmail || 'your email'}</strong>. Click it to access your products instantly.
              </p>
            </div>
          )}

          <div className={styles.receiptBox}>
            <div className={styles.receiptRow}>
              <span className={styles.receiptLabel}>Status</span>
              <span className={styles.receiptValueSuccess}>Completed</span>
            </div>
            <div className={styles.receiptRow}>
              <span className={styles.receiptLabel}>Gateway</span>
              <span className={styles.receiptValue}>Vouch Secure Pay</span>
            </div>
          </div>

          {/* 🔴 UPDATED: The Optimized Action Group */}
          <div className={styles.actionGroup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center', width: '100%' }}>
            {user ? (
              // Logged-in users can go straight to their library
              <Link href="/dashboard/library" className={styles.primaryBtn} style={{ width: '100%', justifyContent: 'center' }}>
                <BookOpen size={18} />
                Go to My Library
              </Link>
            ) : (
              // Guests get a helpful prompt to keep browsing while they wait for the email
              <div style={{ width: '100%', textAlign: 'center' }}>
                <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1rem' }}>
                  Click the link in your email to instantly view your purchase.
                </p>
                <Link href="/explore" className={styles.primaryBtn} style={{ width: '100%', justifyContent: 'center' }}>
                  <ShoppingBag size={18} />
                  Keep Browsing
                </Link>
              </div>
            )}

            {/* Always show Browse More as a secondary option for logged-in users */}
            {user && (
              <Link href="/explore" className={styles.secondaryBtn} style={{ width: '100%', justifyContent: 'center' }}>
                <ShoppingBag size={18} />
                Browse More
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // 4. Wrap with DashboardLayout ONLY if user is logged in
  if (user) {
    return (
      <DashboardLayout isSeller={profile?.is_seller || false} username={profile?.full_name || 'User'}>
        {content}
      </DashboardLayout>
    );
  }

  return <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{content}</div>;
}