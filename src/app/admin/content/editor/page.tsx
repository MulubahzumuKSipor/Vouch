import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ContentEditorForm from '@/components/ContentEditorForm'
import styles from '@/styles/adminCms.module.css'

export const dynamic = 'force-dynamic'

export default async function CmsEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ table?: string, id?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user || user.email !== 'mzksipor@gmail.com') {
    redirect('/login')
  }

  const { table, id } = await searchParams
  
  // If no table is specified in the URL, send them back to the hub
  if (!table) redirect('/admin/content')

  let initialData = {}

  // If there's an ID, fetch the existing record
  if (id) {
    const { data, error } = await supabase
      .from(table as any) // 🔴 THE FIX: Tell TypeScript to accept the table string
      .select('*')
      .eq('id', id)
      .single()

    if (data) initialData = data
    if (error) console.error("Error fetching content for editor:", error)
  }

  return (
    <div className={styles.container} style={{ maxWidth: '800px' }}>
      <div className={styles.header}>
        <div>
          <Link href="/admin/content" className={styles.backLink}>
            <ArrowLeft size={16} /> Back to Content Hub
          </Link>
          <h1 className={styles.title} style={{ marginTop: '12px' }}>
            {id ? 'Edit Content' : 'Create New Content'}
          </h1>
          <p className={styles.subtitle}>
            Currently editing: <strong>{table.replace('_', ' ').toUpperCase()}</strong>
          </p>
        </div>
      </div>

      <div className={styles.tableCard} style={{ padding: '24px' }}>
        <ContentEditorForm table={table} id={id} initialData={initialData} />
      </div>
    </div>
  )
}