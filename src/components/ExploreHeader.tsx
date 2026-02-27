'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ExploreSearch from './ExploreSearch'
import styles from '@/styles/explore-header.module.css'

interface ExploreHeaderProps {
  currentType?: string
  currentQuery?: string
}

export default function ExploreHeader({ currentType = 'all', currentQuery = '' }: ExploreHeaderProps) {
  // Safely build the URL query string
  const createFilterUrl = (type: string) => {
    const params = new URLSearchParams()
    if (currentQuery) params.set('q', currentQuery)
    params.set('type', type)
    return `/explore?${params.toString()}`
  }

  return (
    <div className={styles.header}>
      {/* TOP ROW: Title */}
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <h1 className={styles.pageTitle}>Explore Creators</h1>
          <p className={styles.pageSubtitle}>
            Discover Liberia&apos;s top digital talent and storefronts.
          </p>
        </div>
      </div>

      {/* MIDDLE: Search Bar */}
      <div className={styles.searchWrapper}>
        <ExploreSearch />
      </div>

      {/* BOTTOM: Filter Chips */}
      <div className={styles.filterScroll}>
        <Link href={createFilterUrl('all')} className={`${styles.filterChip} ${currentType === 'all' ? styles.activeChip : ''}`}>
          All Creators
        </Link>
        <Link href={createFilterUrl('course')} className={`${styles.filterChip} ${currentType === 'course' ? styles.activeChip : ''}`}>
          Educators
        </Link>
        <Link href={createFilterUrl('service')} className={`${styles.filterChip} ${currentType === 'service' ? styles.activeChip : ''}`}>
          Freelancers
        </Link>
        <Link href={createFilterUrl('asset')} className={`${styles.filterChip} ${currentType === 'asset' ? styles.activeChip : ''}`}>
          Designers
        </Link>
      </div>
    </div>
  )
}