import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import DashboardLayout from '@/components/dashboardLayout'

// --- INTERFACES ---
interface AnalyticsView {
  created_at: string
  country: string | null
  device_type: string | null
}

export default async function AnalyticsPage() {
  const supabase = await createClient()

  // 1. Auth & Seller Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, is_seller')
    .eq('id', user.id)
    .single()

  if (!profile?.is_seller) {
    redirect('/dashboard')
  }

  // 2. Mathematically lock Date Range to UTC to prevent drift
  const endDate = new Date()
  endDate.setUTCHours(23, 59, 59, 999) // End of today (UTC)

  const startDate = new Date(endDate)
  startDate.setUTCDate(endDate.getUTCDate() - 29) // 30 days total inclusive
  startDate.setUTCHours(0, 0, 0, 0) // Start of day 1 (UTC)

  // 3. Fetch Orders (Revenue) - 🔴 NOW FETCHING CURRENCY
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('created_at, seller_earnings, currency')
    .eq('seller_id', user.id)
    .eq('status', 'completed')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .order('created_at', { ascending: true })

  if (ordersError) {
    console.error("Orders fetch error:", ordersError)
  }

  // 4. Fetch Views (Traffic) - Hard limit added to prevent Vercel memory crash
  const { data: views, error: viewsError } = await supabase
    .from('analytics_events')
    .select('created_at, country, device_type')
    .eq('seller_id', user.id)
    .eq('event_type', 'view')
    .gte('created_at', startDate.toISOString())
    .lte('created_at', endDate.toISOString())
    .limit(10000)

  if (viewsError) {
    console.error("Views fetch error:", viewsError)
  }

  // 5. Build strict Date Map - 🔴 UPDATED TO TRACK BOTH CURRENCIES
  const chartDataMap = new Map<string, { date: string, revenueUSD: number, revenueLRD: number, views: number }>()

  // Generate exactly 30 days dynamically to ensure no gaps in the chart
  for (let i = 0; i < 30; i++) {
    const d = new Date(startDate)
    d.setUTCDate(startDate.getUTCDate() + i)
    const dateStr = d.toISOString().split('T')[0] // YYYY-MM-DD (UTC)

    chartDataMap.set(dateStr, {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
      revenueUSD: 0,
      revenueLRD: 0,
      views: 0
    })
  }

  // 6. Fill Map Safely
  orders?.forEach(order => {
    // Split on 'T' handles ISO strings safely
    const dateStr = order.created_at.split('T')[0]
    const targetDay = chartDataMap.get(dateStr)

    if (targetDay) {
      // 🔴 Sort into the correct wallet and convert from cents to flat currency
      const amount = order.seller_earnings / 100
      if (order.currency === 'LRD') {
        targetDay.revenueLRD += amount
      } else {
        targetDay.revenueUSD += amount
      }
    }
  })

  views?.forEach(view => {
    const dateStr = view.created_at.split('T')[0]
    if (chartDataMap.has(dateStr)) {
      chartDataMap.get(dateStr)!.views += 1
    }
  })

  // 7. Calculate Totals - 🔴 SEPARATE KPI TOTALS IN CENTS
  const totalRevenueUSD = orders?.filter(o => o.currency === 'USD' || !o.currency).reduce((sum, o) => sum + o.seller_earnings, 0) || 0
  const totalRevenueLRD = orders?.filter(o => o.currency === 'LRD').reduce((sum, o) => sum + o.seller_earnings, 0) || 0

  const totalViews = views?.length || 0
  const totalOrders = orders?.length || 0
  const conversionRate = totalViews > 0 ? ((totalOrders / totalViews) * 100).toFixed(1) : '0.0'

  // 8. Device Breakdown (Strictly Typed)
  const deviceStats = (views as AnalyticsView[] | null)?.reduce<Record<string, number>>((acc, curr) => {
    const device = curr.device_type || 'Unknown'
    acc[device] = (acc[device] || 0) + 1
    return acc
  }, {})

  const deviceData = Object.entries(deviceStats || {}).map(([name, value]) => ({
    name,
    value
  }))

  return (
    <DashboardLayout isSeller={true} username={profile.username}>
      <AnalyticsDashboard
        chartData={Array.from(chartDataMap.values())}
        stats={{
          // 🔴 Passing both totals down to the client component
          revenueUSD: totalRevenueUSD,
          revenueLRD: totalRevenueLRD,
          views: totalViews,
          orders: totalOrders,
          conversionRate
        }}
        deviceData={deviceData}
      />
    </DashboardLayout>
  )
}