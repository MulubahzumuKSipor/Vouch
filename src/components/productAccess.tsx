'use client'

import { useState } from 'react'
import { Download, PlayCircle, FileText } from 'lucide-react'
import VideoPlayer from '@/components/videoPlayer'
import styles from '@/styles/productView.module.css'

interface Attachment {
  id: string
  attachment_type: string
  storage_path: string
  file_name: string
  mime_type?: string
}

interface Product {
  id: string
  title: string
}

export default function ProductAccessView({ product, attachments }: { product: Product, attachments: Attachment[] }) {
  const firstVideo = attachments.find(a => a.attachment_type === 'video')
  const [activeVideo, setActiveVideo] = useState(firstVideo ? firstVideo.storage_path : null)

  const videos = attachments.filter(a => a.attachment_type === 'video')
  const files = attachments.filter(a => a.attachment_type !== 'video')

  const handleDownload = (path: string, filename: string) => {
    alert("Downloading " + filename + "...") 
  }

  return (
    <div className={styles.accessLayout}>
      
      {/* 1. Main Stage (Video Player) */}
      <div className={styles.stage}>
        <div className={styles.playerWrapper}>
          {activeVideo ? (
            <VideoPlayer 
              {...({
                videoId: activeVideo,
                libraryId: process.env.NEXT_PUBLIC_BUNNY_LIBRARY_ID!,
                title: "Course Content"
              } as any)}
            />
          ) : (
            <div className={styles.emptyPlayer}>
              <FileText size={48} />
              <h3>No Video Selected</h3>
              <p>Select a lesson from the list to start watching.</p>
            </div>
          )}
        </div>

        <div className={styles.lessonInfo}>
          <h1>{videos.find(v => v.storage_path === activeVideo)?.file_name || product.title}</h1>
        </div>
      </div>

      {/* 2. Playlist / Curriculum Sidebar */}
      <div className={styles.playlist}>
        <div className={styles.playlistHeader}>
          <h2>Course Content</h2>
          <span>{videos.length} Lessons</span>
        </div>

        <div className={styles.scrollArea}>
          {/* Video List */}
          {videos.map((vid, idx) => (
            <button 
              key={vid.id} 
              onClick={() => setActiveVideo(vid.storage_path)}
              className={`${styles.moduleItem} ${activeVideo === vid.storage_path ? styles.activeModule : ''}`}
            >
              <div className={styles.moduleIcon}>
                {activeVideo === vid.storage_path ? <PlayCircle size={16} fill="black" /> : <PlayCircle size={16} />}
              </div>
              <div className={styles.moduleText}>
                <span className={styles.lessonNum}>Lesson {idx + 1}</span>
                <p>{vid.file_name}</p>
              </div>
            </button>
          ))}

          {/* Attachments Section */}
          {files.length > 0 && (
            <>
              <div className={styles.sectionDivider}>Resources</div>
              {files.map((file) => (
                <div key={file.id} className={styles.resourceItem}>
                  <div className={styles.resourceIcon}>
                    <FileText size={16} />
                  </div>
                  <div className={styles.moduleText}>
                    <p>{file.file_name}</p>
                    <span className={styles.fileSize}>{file.mime_type?.toUpperCase()}</span>
                  </div>
                  <button
                    onClick={() => handleDownload(file.storage_path, file.file_name)}
                    className={styles.miniDownloadBtn}
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

    </div>
  )
}