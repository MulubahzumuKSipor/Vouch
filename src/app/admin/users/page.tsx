import { createClient } from '@/lib/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { Search, Mail, TrendingUp, ShieldCheck } from 'lucide-react'
import UserActions from '@/components/UserActions'
import styles from '@/styles/adminUsers.module.css'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const supabase = await createClient()

  // 1. Check Admin Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'mzksipor@gmail.com') return <div>Unauthorized</div>

  // 2. Setup Master Key Client to read all profiles & emails safely
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const resolvedParams = await searchParams
  const query = resolvedParams.q || ''

  // 3. Fetch Profiles with upgraded Multi-Column Search
  let dbQuery = supabaseAdmin
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (query) {
    // 🔴 We strip commas out of the query to prevent breaking the Supabase parser
    const safeQuery = query.replace(/,/g, ' ')

    // 🔴 The .or() syntax tells Postgres to search across multiple columns
    dbQuery = dbQuery.or(`username.ilike.%${safeQuery}%,full_name.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%`)
  }

  const { data: users } = await dbQuery

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Creator Management</h1>
        <p className={styles.subtitle}>Monitor accounts, manage verification, and enforce platform rules.</p>
      </div>

      <div className={styles.toolBar}>
        <form className={styles.searchForm}>
          <Search size={18} color="#6B7280" />
          <input 
            type="text" 
            name="q" 
            placeholder="Search by username, name, or email..."
            defaultValue={query}
            className={styles.searchInput}
          />
          <button type="submit" style={{display: 'none'}}>Search</button>
        </form>
        <div className={styles.stats}>
          <strong>{users?.length || 0}</strong> Registered Accounts
        </div>
      </div>

      <div className={styles.tableCard}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Creator Info</th>
                <th>Status</th>
                <th>Total Sales</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.id} className={u.is_suspended ? styles.rowSuspended : ''}>
                  <td>
                    <div className={styles.userInfo}>
                      <span className={styles.username}>@{u.username}</span>
                      <span className={styles.email}><Mail size={12}/> {u.email}</span>
                      <span className={styles.fullName}>{u.full_name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                      {u.is_verified ? (
                        <span className={styles.badgeVerified}><ShieldCheck size={12}/> Verified</span>
                      ) : (
                        <span className={styles.badgeStandard}>Standard</span>
                      )}
                      {u.is_suspended && <span className={styles.badgeSuspended}>Suspended</span>}
                    </div>
                  </td>
                  <td>
                    <div className={styles.salesInfo}>
                      <TrendingUp size={14} color="#10B981" />
                      <strong>{u.total_sales || 0}</strong>
                    </div>
                  </td>
                  <td className={styles.dateCell}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <UserActions
                      userId={u.id}
                      isVerified={u.is_verified}
                      isSuspended={u.is_suspended}
                    />
                  </td>
                </tr>
              ))}
              {(!users || users.length === 0) && (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    {query ? `No creators found matching "${query}"` : 'No users found.'}
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