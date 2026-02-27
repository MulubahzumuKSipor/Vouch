'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/lib/client'
import { getGuestSessionId } from '@/lib/cart'

// --- INTERFACES ---

export interface CartProduct {
  id: string
  title: string
  slug: string
  price_amount: number
  price_currency: string | null
  cover_image: string | null
  username?: string | null
}

export type CartItem = {
  cart_id?: string
  product_id: string
  title: string
  price: number
  currency: string
  cover_image: string | null
  quantity: number
  seller_username?: string | null
  slug?: string | null
  username?: string | null
}

interface CartContextType {
  items: CartItem[]
  addItem: (product: CartProduct) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  refreshCart: () => Promise<void>
  isOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchCartData = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // FIX: Use undefined instead of null to satisfy Supabase RPC types
    const sessionId = user ? undefined : (getGuestSessionId() || undefined)

    const { data } = await supabase.rpc('get_cart_details', { p_session_id: sessionId })
    return data as CartItem[] | null
  }

  useEffect(() => {
    let isMounted = true

    const initializeCart = async () => {
      const data = await fetchCartData()

      if (isMounted) {
        if (data) setItems(data)
        setIsLoading(false)
      }
    }

    initializeCart()

    return () => {
      isMounted = false
    }
  }, [])

  const refreshCart = async () => {
    setIsLoading(true)
    const data = await fetchCartData()
    if (data) setItems(data)
    setIsLoading(false)
  }

  const addItem = async (product: CartProduct) => {
    setIsOpen(true)
    
    setItems((prev) => {
      const existing = prev.find(item => item.product_id === product.id)
      if (existing) {
        return prev.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        )
      }
      return [...prev, {
        product_id: product.id,
        title: product.title,
        price: product.price_amount,
        currency: product.price_currency || 'USD',
        cover_image: product.cover_image,
        quantity: 1,
        slug: product.slug,
        username: product.username
      }]
    })

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // FIX: Use undefined instead of null
    const sessionId = user ? undefined : (getGuestSessionId() || undefined)

    const { error } = await supabase.rpc('add_to_cart', {
      p_product_id: product.id,
      p_session_id: sessionId
    })

    if (error) {
      console.error("Failed to save cart:", error)
      refreshCart()
    }
  }

  const removeItem = async (productId: string) => {
    setItems(prev => prev.filter(item => item.product_id !== productId))

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // FIX: Use undefined instead of null
    const sessionId = user ? undefined : (getGuestSessionId() || undefined)

    await supabase.rpc('remove_from_cart', { 
      p_product_id: productId, 
      p_session_id: sessionId 
    })
  }

  return (
    <CartContext.Provider value={{ 
      items, addItem, removeItem, refreshCart, 
      isOpen, openDrawer: () => setIsOpen(true), closeDrawer: () => setIsOpen(false),
      isLoading 
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within a CartProvider')
  return context
}