'use client'

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts'
import { DollarSign, Eye, ShoppingBag, TrendingUp, Smartphone, Monitor } from 'lucide-react'
import styles from '@/styles/analytics.module.css'

// --- INTERFACES ---
export interface ChartDataPoint {
  date: string
  revenue: number
  views: number
}

export interface DeviceDataPoint {
  name: string
  value: number
}

interface AnalyticsProps {
  chartData: ChartDataPoint[]
  stats: {
    revenue: number
    views: number
    orders: number
    conversionRate: string
  }
  deviceData: DeviceDataPoint[]
}

export default function AnalyticsDashboard({ chartData, stats, deviceData }: AnalyticsProps) {
  
  // Colors for charts
  const COLORS = ['#1a1a1a', '#9ca3af', '#e5e7eb']

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Analytics</h1>
        <p className={styles.subtitle}>Overview for the last 30 days</p>
      </div>

      {/* KPI Cards */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Total Revenue</span>
            <DollarSign size={18} className={styles.iconGold} />
          </div>
          <div className={styles.cardValue}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(stats.revenue / 100)}
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Total Views</span>
            <Eye size={18} className={styles.iconBlue} />
          </div>
          <div className={styles.cardValue}>{stats.views.toLocaleString()}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Orders</span>
            <ShoppingBag size={18} className={styles.iconGreen} />
          </div>
          <div className={styles.cardValue}>{stats.orders}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <span className={styles.cardLabel}>Conversion Rate</span>
            <TrendingUp size={18} className={styles.iconPurple} />
          </div>
          <div className={styles.cardValue}>{stats.conversionRate}%</div>
        </div>
      </div>

      {/* Main Chart: Revenue & Traffic */}
      <div className={`${styles.card} ${styles.chartContainer}`}>
        <h3 className={styles.chartTitle}>Performance Over Time</h3>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a1a1a" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#1a1a1a" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#9ca3af" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: '#666' }} 
                axisLine={false}
                tickLine={false}
                minTickGap={30}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12, fill: '#666' }} 
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: '#666' }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                stroke="#1a1a1a" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                name="Revenue"
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="views" 
                stroke="#9ca3af" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorViews)" 
                name="Views"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        {/* Device Breakdown */}
        <div className={styles.card}>
          <h3 className={styles.chartTitle}>Device Breakdown</h3>
          <div className={styles.pieWrapper}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className={styles.legend}>
              {deviceData.map((entry, index) => (
                <div key={index} className={styles.legendItem}>
                  <div className={styles.legendDot} style={{ background: COLORS[index % COLORS.length] }} />
                  <span className={styles.legendText}>{entry.name || 'Unknown'}</span>
                  <span className={styles.legendValue}>{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Placeholder for Top Products (could easily be added later) */}
        <div className={styles.card}>
           <h3 className={styles.chartTitle}>Traffic Insights</h3>
           <div className={styles.insightItem}>
             <Monitor className={styles.insightIcon} />
             <div>
               <h4>Desktop Dominance</h4>
               <p>65% of your sales come from larger screens. Ensure your cover images are high-res.</p>
             </div>
           </div>
           <div className={styles.insightItem}>
             <Smartphone className={styles.insightIcon} />
             <div>
               <h4>Mobile Viewing</h4>
               <p>High mobile traffic but lower conversion. Consider simplifying your product descriptions.</p>
             </div>
           </div>
        </div>
      </div>
    </div>
  )
}