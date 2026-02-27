import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import ProductManager from '@/components/productManager'
import DashboardLayout from '@/components/dashboardLayout'

export default async function ProductsPage() {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    redirect('/login')
  }

  // 2. Fetch Profile to confirm seller status
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // If not a seller, redirect to explore or library
  if (!profile?.is_seller) {
    redirect('/dashboard/library')
  }

  // 3. Fetch Products (Active only)
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', user.id)
    .eq('is_archived', false)
    .order('created_at', { ascending: false })

  const safeUsername = profile?.username || ''

  return (
    <DashboardLayout isSeller={true} username={safeUsername}>
      {/* CRITICAL: Suspense boundary is required because
        ProductManager uses useSearchParams() for the ?new=true feature.
      */}
      <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading products...</div>}>
        <ProductManager
          initialProducts={products || []}
          username={safeUsername}
        />
      </Suspense>
    </DashboardLayout>
  )
}