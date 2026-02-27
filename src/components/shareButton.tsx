'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import styles from '@/styles/shop.module.css'

interface ShareButtonProps {
  username: string
  fullName?: string  // Made optional for products
  pageTitle?: string // Added for products
}

export default function ShareButton({ username, fullName, pageTitle }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/@${username}`

    // Dynamically adjust the share text based on whether it's a product or a profile
    const title = pageTitle ? `${pageTitle} on Vouch` : `${fullName} on Vouch`
    const text = pageTitle
      ? `Check out "${pageTitle}" on Vouch!`
      : `Check out ${fullName}'s digital shop on Vouch!`

    // 1. Try Native Mobile Share
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
      } catch (err) {
        // User cancelled, ignore silently
      }
    } else {
      // 2. Fallback: Copy to Clipboard
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000) // Reset after 2s
      } catch (err) {
        console.error('Failed to copy', err)
      }
    }
  }

  return (
    <button 
      onClick={handleShare} 
      className={styles.shareBtn}
      title="Share this link"
    >
      {copied ? (
        <>
          <Check size={16} className={styles.iconSuccess} />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Share2 size={16} />
          <span>Share</span>
        </>
      )}
    </button>
  )
}