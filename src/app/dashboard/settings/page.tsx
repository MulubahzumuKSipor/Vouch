import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import SettingsForm from '@/components/SettingsForm'
import DashboardLayout from '@/components/dashboardLayout'
import styles from '@/styles/settings.module.css'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Always good practice to safeguard against a missing profile row
  if (!profile) redirect('/login')

  return (
    <DashboardLayout isSeller={profile?.is_seller || false} username={profile?.username}>
      <div className={styles.pageContainer}>

        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Settings</h1>
        </div>

        {/* Passed safely as any to prevent strict nested JSON mismatches */}
        <SettingsForm profile={profile as any} />

      </div>
    </DashboardLayout>
  )
}