import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import AssetEditorClient from '@/components/AssetEditorClient'
import DashboardLayout from '@/components/dashboardLayout'

export default async function EditAssetPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: asset, error } = await supabase
    .from('products')
    .select('*, product_attachments(*)')
    .eq('id', id)
    .eq('seller_id', user.id)
    .eq('product_type', 'asset')
    .single()

  if (error || !asset) {
    redirect('/dashboard/assets')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, is_seller')
    .eq('id', user.id)
    .single()

  return (
    <DashboardLayout isSeller={profile?.is_seller || false} username={profile?.username}>
      <AssetEditorClient asset={asset} />
    </DashboardLayout>
  )
}