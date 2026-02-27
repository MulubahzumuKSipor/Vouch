import ShopHeader from '@/components/ShopHeader'
import { CartProvider } from '@/context/CartContext'

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
      <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
        <ShopHeader />
        {children}
      </div>
    </CartProvider>
  )
}