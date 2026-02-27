import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import OrdersList from '@/components/OrdersList'
import DashboardLayout from '@/components/dashboardLayout'

// 1. Update the type definition to wrap searchParams in Promise
export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Get Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // 3. AWAIT the searchParams before using them (Next.js 15 Fix)
  const params = await searchParams

  const isSeller = profile?.is_seller || false
  const defaultView = isSeller ? 'sales' : 'purchases'
  // Use 'params' instead of 'searchParams' here
  const currentView = params.view || defaultView

  // 4. Fetch Data based on View
  let orders = []
  
  if (currentView === 'sales' && isSeller) {
    // Fetch Sales (Incoming Orders)
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        profiles!orders_buyer_id_fkey(full_name, username, avatar_url, email)
      `)
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
    orders = data || []
  } else {
    // Fetch Purchases (Outgoing Orders)
    const { data } = await supabase
      .from('orders')
      .select(`
        *,
        products(id, slug, cover_image, product_type),
        profiles!orders_seller_id_fkey(full_name, username, avatar_url)
      `)
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })
    orders = data || []
  }

  return (
    <DashboardLayout isSeller={isSeller} username={profile?.username}>
      <OrdersList 
        initialOrders={orders} 
        view={currentView as 'sales' | 'purchases'} 
        isSeller={isSeller} 
      />
    </DashboardLayout>
  )
}