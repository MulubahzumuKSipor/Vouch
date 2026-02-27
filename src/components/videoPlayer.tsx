'use client'

interface VideoPlayerProps {
  contentUrl: string // Expecting something like 'bunny://dadf8dcc-9c78...'
  title?: string
  poster?: string
}

export default function VideoPlayer({
  contentUrl,
  title = 'Course Video',
  poster
}: VideoPlayerProps) {

  const libraryId = process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID

  // Strip the database prefix to get the raw GUID
  const videoId = contentUrl.replace('bunny://', '')

  if (!videoId || !libraryId) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>Video Unavailable</p>
      </div>
    )
  }

  // Construct the secure iframe URL
  const baseUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`
  const params = new URLSearchParams({
    autoplay: 'false',
    loop: 'false',
    muted: 'false',
    preload: 'true',
    responsive: 'true',
  })

  // Only append poster if explicitly provided
  if (poster) {
    params.append('poster', poster)
  }

  const embedUrl = `${baseUrl}?${params.toString()}`

  return (
    <div style={styles.wrapper}>
      <iframe
        src={embedUrl}
        loading="lazy"
        style={styles.iframe}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen={true}
        title={title}
      />
    </div>
  )
}

// Brutalist / Digital Kente Styles
const styles = {
  wrapper: {
    position: 'relative' as const,
    paddingTop: '56.25%', /* 16:9 Aspect Ratio */
    background: '#1A1A1A',
    border: '2px solid #1A1A1A',
    boxShadow: '4px 4px 0px #1A1A1A', /* Brutalist shadow */
    width: '100%',
    overflow: 'hidden',
  },
  iframe: {
    border: 'none',
    position: 'absolute' as const,
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
  },
  errorContainer: {
    width: '100%',
    paddingTop: '56.25%',
    background: '#FAFAFA',
    border: '2px dashed #DC2626',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
  },
  errorText: {
    position: 'absolute' as const,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: '#DC2626',
    fontWeight: 800,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
  }
}