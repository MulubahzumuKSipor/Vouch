import { createClient } from '@/lib/server'
import { notFound } from 'next/navigation'
import ProductSalesView from '@/components/products'
import ProductAccessView from '@/components/productAccess'
import styles from '@/styles/product.module.css'
import MinimalNavbar from '@/components/minibar'

// 🔴 FIXED: Wrapped params in a Promise to satisfy Next.js 15 async routing constraints
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const supabase = await createClient()
  const { slug } = await params

  // 1. Fetch Product Data
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      profiles:seller_id (full_name, username, avatar_url)
    `)
    .eq('slug', slug)
    .single()

  if (!product) notFound()

  // 2. Check Access (The "Gatekeeper")
  let hasAccess = false
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // A. Is Owner?
    if (product.seller_id === user.id) {
      hasAccess = true
    }
    // B. Is Buyer? (Check Orders)
    else {
      const { data: order } = await supabase
        .from('orders')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('product_id', product.id)
        .eq('status', 'completed')
        .single()

      if (order) hasAccess = true
    }
  }

  // 3. Fetch Content (Only if Access Granted)
  // Optimization: We don't fetch video links for people who haven't paid.

  // 🔴 FIXED: Explicitly typed the empty array to silence the implicit 'any' error
  let attachments: any[] = []

  if (hasAccess) {
    const { data } = await supabase
      .from('product_attachments')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: true }) // Order by upload time

    attachments = data || []
  }

  return (
    <div className={styles.pageWrapper}>
      <MinimalNavbar /> {/* Public Navbar */}

      <main className={styles.main}>
        {hasAccess ? (
          // Passed safely to prevent strict nested object mismatches downstream
          <ProductAccessView product={product as any} attachments={attachments} />
        ) : (
          <ProductSalesView product={product as any} />
        )}
      </main>
    </div>
  )
}