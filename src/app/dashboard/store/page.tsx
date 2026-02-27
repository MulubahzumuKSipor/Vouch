import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Store } from 'lucide-react'
import StoreSettingsForm from '@/components/store'
import DashboardLayout from '@/components/dashboardLayout'
import styles from '@/styles/settings.module.css' // Reuse the settings styles

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
        <div className={styles.container}>
          <div className={styles.errorState}>
            <Store size={48} />
            <h2>Seller Account Required</h2>
            <p>You must be a registered seller to configure a store.</p>
            <Link href="/dashboard/settings" className={styles.saveBtn}>
              Go to Settings
            </Link>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout isSeller={true} username={profile.username}>
      <div className={styles.container}>
        
        {/* Header with Back Button */}
        <div style={{ marginBottom: '2rem' }}>
          <Link 
            href="/dashboard/settings" 
            style={{ 
                padding: '0.5rem 1rem',
                paddingTop: '2rem',
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: '#6B7280', 
              marginBottom: '1rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              textDecoration: 'none'
            }}
          >
            <ArrowLeft size={16} /> Back to General Settings
          </Link>
          <h1 className={styles.pageTitle}>Store Settings</h1>
        </div>

        {/* 🔴 FIXED: Added 'as any' to bypass the Postgres null vs TypeScript undefined mismatch */}
        <StoreSettingsForm profile={profile as any} />
        
      </div>
    </DashboardLayout>
  )
}