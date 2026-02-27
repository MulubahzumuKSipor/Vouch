'use client'

import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'
import { createClient } from '@/lib/client'
import { useEffect, useState, useMemo } from 'react'
import type { User } from '@supabase/supabase-js'

export default function MinimalNavbar() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase.auth])

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 2rem',
      background: 'white',
      borderBottom: '1px solid #E5E7EB',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      {/* 1. TRUST ANCHOR */}
      <Link href="/" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', textDecoration: 'none' }}>
        Vouch<span style={{ color: '#F59E0B' }}>.</span>
      </Link>

      {/* 2. UTILITY (Login or Dashboard) */}
      <div>
        {user ? (
          <Link
            href="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#374151',
              textDecoration: 'none'
            }}
          >
            <LayoutDashboard size={18} />
            <span>My Dashboard</span>
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link
              href="/login"
              style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', textDecoration: 'none' }}
            >
              Log in
            </Link>
            <Link
              href="/signup"
              style={{
                padding: '0.5rem 1rem',
                background: '#111827',
                color: 'white',
                borderRadius: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}