'use client'

import { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'
import { Loader2, AlertCircle } from 'lucide-react'

export default function SecureVideoPlayer({ attachmentId }: { attachmentId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [poster, setPoster] = useState('')

  useEffect(() => {
    let hls: Hls | null = null

    const initPlayer = async () => {
      try {
        // 1. Fetch the secure signed URL from our API
        const res = await fetch(`/api/video/${attachmentId}`)
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Failed to load video')

        setPoster(data.poster)
        const video = videoRef.current
        if (!video) return

        // 2. Load the source
        if (Hls.isSupported()) {
          hls = new Hls()
          hls.loadSource(data.url)
          hls.attachMedia(video)
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // For Safari (Native HLS support)
          video.src = data.url
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load video'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    initPlayer()

    return () => {
      if (hls) hls.destroy()
    }
  }, [attachmentId])

  if (error) {
    return (
      <div style={{ 
        background: '#FEF2F2', color: '#DC2626', 
        padding: '20px', borderRadius: '8px', 
        display: 'flex', alignItems: 'center', gap: '8px' 
      }}>
        <AlertCircle size={20} />
        <span style={{ fontSize: '14px', fontWeight: 500 }}>{error}</span>
      </div>
    )
  }

  return (
    <div style={{ 
      position: 'relative', background: '#000', 
      borderRadius: '8px', overflow: 'hidden', 
      aspectRatio: '16/9', width: '100%' 
    }}>
      {loading && (
        <div style={{ 
          position: 'absolute', inset: 0, 
          display: 'flex', alignItems: 'center', justifyContent: 'center', 
          color: 'white', zIndex: 10 
        }}>
          <Loader2 className={styles.spin} size={32} />
        </div>
      )}
      <video 
        ref={videoRef} 
        controls 
        poster={poster}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
      />
    </div>
  )
}

// Simple spin animation style usually in global css, but adding here for reference
const styles = { spin: 'animate-spin' }