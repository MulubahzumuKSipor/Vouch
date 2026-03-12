import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/server'
import { LayoutDashboard, Users, CreditCard, ShoppingBag, Settings, LogOut, FileText } from 'lucide-react'
import styles from '@/styles/admin.module.css'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // 1. Get the current user
  const { data: { user } } = await supabase.auth.getUser()

  // 2. THE VAULT DOOR: Only allow your specific email
  if (!user || user.email !== 'mzksipor@gmail.com') {
    redirect('/login') // Kick intruders back to login
  }

  return (
    <div className={styles.adminContainer}>
      {/* SIDEBAR */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logo}>VOUCH <span className={styles.adminBadge}>ADMIN</span></div>
        </div>

        <nav className={styles.navLinks}>
          <Link href="/admin" className={styles.navItem}>
            <LayoutDashboard size={20} /> Overview
          </Link>
          <Link href="/admin/payouts" className={styles.navItem}>
            <CreditCard size={20} /> Payout Queue
          </Link>
          <Link href="/admin/users" className={styles.navItem}>
            <Users size={20} /> Creators
          </Link>
          <Link href="/admin/orders" className={styles.navItem}>
            <ShoppingBag size={20} /> All Orders
          </Link>
          <Link href="/admin/content" className={styles.navItem}>
            <FileText size={20} /> CMS (Blog & Help)
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/dashboard" className={styles.exitLink}>
            Exit Admin <LogOut size={16} />
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.topbarRight}>
            <span className={styles.adminEmail}>{user.email}</span>
            <div className={styles.avatar}>M</div>
          </div>
        </header>
        <div className={styles.pageContent}>
          {children}
        </div>
      </main>
    </div>
  )
}