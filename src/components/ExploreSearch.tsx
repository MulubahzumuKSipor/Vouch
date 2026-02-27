'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { useEffect, useState, useTransition } from 'react'
import styles from '@/styles/explore-search.module.css'

export default function ExploreSearch() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '')

  useEffect(() => {
    // Only fire the debounce timer when the user actually types
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      const currentQuery = searchParams.get('q') || ''
      
      // Prevent unnecessary pushes if the value hasn't actually changed from the URL
      if (searchValue === currentQuery) return

      if (searchValue) {
        params.set('q', searchValue)
      } else {
        params.delete('q')
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    }, 400) // 400ms is the sweet spot for feeling fast but not spamming the database

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]) // Intentionally omitting router/pathname/searchParams to prevent loop

  return (
    <div className={styles.searchContainer}>
      <Search className={styles.searchIcon} size={20} />

      <input
        type="text"
        placeholder="Search creators, skills, or services..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        className={styles.searchInput}
        aria-label="Search"
      />

      {isPending && (
        <div className={styles.searchLoader}>
          <Loader2 size={18} className={styles.spinner} />
        </div>
      )}
    </div>
  )
}