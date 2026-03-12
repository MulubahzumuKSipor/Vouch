import { createClient } from '@/lib/server'
import Link from 'next/link'
import { FileText, BookOpen, GraduationCap, Newspaper, Plus } from 'lucide-react'
import CmsActions from '@/components/CMSAction' // Ensure this path matches your file structure
import styles from '@/styles/adminCms.module.css'

export const dynamic = 'force-dynamic'

const TABS = [
  { id: 'blog_posts', label: 'Blog Posts', icon: FileText },
  { id: 'help_articles', label: 'Help Center', icon: BookOpen },
  { id: 'creator_guides', label: 'Creator Guides', icon: GraduationCap },
  { id: 'press_releases', label: 'Press & News', icon: Newspaper },
]

// 🔴 THE FIX: Create a "Unified" type so TypeScript stops panicking about missing properties
type CmsItem = {
  id: string
  title: string
  created_at: string | null
  is_published: boolean | null
  slug?: string | null
  external_url?: string | null
  category?: string | null
  release_type?: string | null
}

type CmsTable = 'blog_posts' | 'help_articles' | 'creator_guides' | 'press_releases'

export default async function AdminCmsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'mzksipor@gmail.com') return <div>Unauthorized</div>

  const resolvedParams = await searchParams
  const activeTab = (resolvedParams.tab || 'blog_posts') as CmsTable

  const { data, error } = await supabase
    .from(activeTab)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error(`CMS Fetch Error (${activeTab}):`, error)
  }

  // 🔴 Cast the data to our unified type so we can safely check properties
  const contentList = data as CmsItem[] | null

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Content Management</h1>
          <p className={styles.subtitle}>Manage your blog, help docs, guides, and press releases.</p>
        </div>
        <Link href={`/admin/content/editor?table=${activeTab}`} className={styles.createBtn}>
          <Plus size={18} /> Create New
        </Link>
      </div>

      {/* ── TAB NAVIGATION ── */}
      <div className={styles.tabContainer}>
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <Link 
              key={tab.id} 
              href={`/admin/content?tab=${tab.id}`}
              className={`${styles.tab} ${isActive ? styles.activeTab : ''}`}
            >
              <Icon size={16} /> {tab.label}
            </Link>
          )
        })}
      </div>

      {/* ── UNIFIED CONTENT TABLE ── */}
      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title & Link</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status & Actions</th>
              </tr>
            </thead>
            <tbody>
              {contentList?.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div className={styles.contentInfo}>
                      <span className={styles.contentTitle}>{item.title}</span>
                      <span className={styles.contentSlug}>
                        {item.slug ? `/${item.slug}` : (item.external_url ? 'External Link' : 'No Link')}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={styles.categoryBadge}>
                      {item.category || item.release_type || 'Uncategorized'}
                    </span>
                  </td>
                  <td className={styles.dateCell}>
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Draft'}
                  </td>
                  <td>
                    <CmsActions 
                      id={item.id} 
                      tableName={activeTab} 
                      isPublished={item.is_published || false} 
                    />
                  </td>
                </tr>
              ))}
              {(!contentList || contentList.length === 0) && (
                <tr>
                  <td colSpan={4} className={styles.emptyState}>
                    No content found for {TABS.find(t => t.id === activeTab)?.label}. Click &quot;Create New&quot; to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}