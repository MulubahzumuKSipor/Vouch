'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import CreateProductModal from './newModal' // Make sure this path matches your modal file!

function ModalLogic() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Watch the URL for the trigger
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [searchParams])

  const handleClose = () => {
    setIsOpen(false)
    // Cleanly remove '?new=true' from the URL without refreshing the page
    const params = new URLSearchParams(searchParams.toString())
    params.delete('new')
    
    // Reconstruct the URL
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    router.replace(newUrl, { scroll: false })
  }

  return <CreateProductModal isOpen={isOpen} onClose={handleClose} />
}

export default function GlobalModalWrapper() {
  return (
    <Suspense fallback={null}>
      <ModalLogic />
    </Suspense>
  )
}