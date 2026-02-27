'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import Sidebar from '@/components/sidebar'
import styles from '@/styles/dashboard-layout.module.css'

interface DashboardLayoutProps {
  children: React.ReactNode
  isSeller: boolean
  username?: string
}

export default function DashboardLayout({ children, isSeller, username }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [sidebarOpen])

  return (
    <div className={styles.layoutContainer}>
      {/* Mobile Header (Sticky) */}
      <header className={styles.mobileHeader}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={styles.menuBtn}
          aria-label="Toggle menu"
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        
        <Link href="/dashboard" className={styles.mobileLogo}>
          <div className={styles.logoIcon}>V</div>
          <span>Vouch</span>
        </Link>

        <div className={styles.mobileActions}>
          {/* Reserve space for balance or notifications */}
        </div>
      </header>

      {/* Sidebar Wrapper */}
      <div className={`${styles.sidebarWrapper} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <Sidebar 
          isSeller={isSeller} 
          username={username}
          onClose={() => setSidebarOpen(false)} // Pass closure control
        />
      </div>

      {/* Mobile Overlay with Blur */}
      {sidebarOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  )
}