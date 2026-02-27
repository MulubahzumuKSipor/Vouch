// app/components/sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Store,
  BookOpen,
  ShoppingBag,
  Compass,
  Settings,
  LogOut
} from 'lucide-react'
import styles from '@/styles/sidebar.module.css'
import { createClient } from '@/lib/client'

interface SidebarProps {
  isSeller: boolean
  username?: string
  onClose?: () => void // Added to handle mobile UX
}

export default function Sidebar({ isSeller, username, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const sellerLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Course', href: '/dashboard/products', icon: Package },
    { name: 'Orders', href: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Library', href: '/dashboard/library', icon: BookOpen },
    { name: 'Analytics', href: '/dashboard/analytics', icon: TrendingUp },
    { name: 'Payouts', href: '/dashboard/payouts', icon: DollarSign },
    { name: 'Store Settings', href: '/dashboard/store', icon: Store },
  ]

  const buyerLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Library', href: '/dashboard/library', icon: BookOpen },
    { name: 'Purchases', href: '/dashboard/purchases', icon: ShoppingBag },
    { name: 'Explore', href: '/explore', icon: Compass },
  ]

  const navLinks = isSeller ? sellerLinks : buyerLinks

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className={styles.sidebar}>
      {/* Top Kente Accent Bar */}
      <div className={styles.kenteAccent} />

      {/* Brand Header */}
      <div className={styles.brand}>
        <Link href="/dashboard" className={styles.logo} onClick={() => onClose?.()}>
          <div className={styles.logoIcon}>V</div>
          <span className={styles.logoText}>Vouch</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navLinks.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => onClose?.()} // Auto-close on mobile
                  className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                >
                  <Icon size={20} className={`${styles.navIcon} ${active ? styles.iconActive : ''}`} />
                  <span className={styles.navText}>{link.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom Actions Anchored */}
      <div className={styles.bottomSection}>
        {isSeller && username && (
          <Link
            href={`/@${username}`}
            className={styles.storeLink}
            target="_blank"
            onClick={() => onClose?.()}
          >
            <Store size={18} />
            <span>View My Store</span>
          </Link>
        )}

        <div className={styles.divider} />

        <Link
          href="/dashboard/settings"
          onClick={() => onClose?.()}
          className={`${styles.navLink} ${isActive('/dashboard/settings') ? styles.navLinkActive : ''}`}
        >
          <Settings size={20} className={styles.navIcon} />
          <span className={styles.navText}>Settings</span>
        </Link>

        <button onClick={handleLogout} className={styles.logoutBtn}>
          <LogOut size={20} className={styles.navIcon} />
          <span className={styles.navText}>Log out</span>
        </button>
      </div>
    </aside>
  )
}