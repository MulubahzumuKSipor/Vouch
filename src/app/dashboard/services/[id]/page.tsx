import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import ServiceEditorClient from '@/components/ServiceEditorClient'
import DashboardLayout from '@/components/dashboardLayout'

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  
  // Await params for Next.js 15
  const { id } = await params

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Fetch the specific service, including its attachments (the booking link)
  const { data: service, error } = await supabase
    .from('products')
    .select('*, product_attachments(*)')
    .eq('id', id)
    .eq('seller_id', user.id)
    .eq('product_type', 'service')
    .single()

  // If it doesn't exist or isn't a service, kick them back to the business page
  if (error || !service) {
    redirect('/dashboard/products')
  }

  // 3. Fetch profile for the layout
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, is_seller')
    .eq('id', user.id)
    .single()

  return (
    <DashboardLayout isSeller={profile?.is_seller || false} username={profile?.username}>
      <ServiceEditorClient service={service} />
    </DashboardLayout>
  )
}