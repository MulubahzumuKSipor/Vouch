import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Store } from 'lucide-react'
import StoreSettingsForm from '@/components/store' // Adjust path if needed
import DashboardLayout from '@/components/dashboardLayout'
import styles from '@/styles/settings.module.css'

export default async function StoreSettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  // 1. Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 2. Security Gate: Only Sellers can access Store Settings
  if (!profile?.is_seller) {
    return (
      <DashboardLayout isSeller={false} username={profile?.username}>
        <div className={styles.pageContainer}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIconCircle}>
              <Store size={32} />
            </div>
            <h2 className={styles.emptyTitle}>Seller Account Required</h2>
            <p className={styles.emptyDesc}>You must be a registered seller to configure a public storefront.</p>
            <Link href="/dashboard/settings" className={styles.saveBtn}>
              Go to General Settings
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout isSeller={true} username={profile.username}>
      <div className={styles.pageContainer}>
        
        {/* Header with Back Button */}
        <div className={styles.pageHeader}>
          <Link href="/dashboard/settings" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to General Settings
          </Link>
          <h1 className={styles.pageTitle}>Store Settings</h1>
        </div>

        {/* Form Component */}
        <StoreSettingsForm profile={profile as any} />
        
      </div>
    </DashboardLayout>
  )
}