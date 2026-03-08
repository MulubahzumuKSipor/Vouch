export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import CoursePlayer from '@/components/CoursePlayer'
import { Download, FileBox, Calendar, Link as LinkIcon, CheckCircle2, Clock } from 'lucide-react'

// --- INTERFACES ---
interface CourseLesson {
  id: string
  title: string
  lesson_type: string
  content_body: string | null
  content_url: string | null
  is_preview: boolean
  is_published: boolean
  sort_order: number | null
  allow_download: boolean
}

interface CourseModule {
  id: string
  title: string
  sort_order: number | null
  course_lessons: CourseLesson[]
}

export default async function LearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/learn/' + slug)

  // 1. Fetch Product & Attachments (We need product_type to know what UI to show)
  const { data: product } = await supabase
    .from('products')
    .select(`
      id, title, slug, product_type, description, cover_image, seller_id, duration_minutes,
      profiles!inner (username, full_name, email),
      product_attachments (*)
    `)
    .eq('slug', slug)
    .single()

  if (!product) redirect('/explore')

  // 2. SECURE ACCESS CHECK & FETCH ORDER INFO
  let hasAccess = false
  let userOrder = null

  if (user.id === product.seller_id) {
    hasAccess = true // Seller gets automatic access to test their own products
  } else {
    // If buyer, fetch their specific order to confirm access AND get their booking time
    const { data: order } = await supabase
      .from('orders')
      .select('id, booking_time, status')
      .eq('product_id', product.id)
      .eq('buyer_id', user.id)
      .eq('status', 'completed')
      .maybeSingle()

    if (order) {
      hasAccess = true
      userOrder = order
    }
  }

  if (!hasAccess) redirect(`/@${product.profiles.username}/${slug}`)


  // ==========================================
  // ROUTE 1: COURSE DELIVERY
  // ==========================================
  if (product.product_type === 'course') {
    const { data: rawModules, error } = await supabase
      .from('course_modules')
      .select(`id, title, sort_order, course_lessons ( * )`)
      .eq('product_id', product.id)
      .order('sort_order', { ascending: true })

    if (error) console.error("Error fetching curriculum:", error)

    const modules = ((rawModules as unknown as CourseModule[]) || []).map((mod: CourseModule) => {
      const publishedLessons = (mod.course_lessons || [])
        .filter((lesson: CourseLesson) => lesson.is_published === true)
        .sort((a: CourseLesson, b: CourseLesson) => (a.sort_order || 0) - (b.sort_order || 0))
      return { ...mod, course_lessons: publishedLessons }
    })

    return <CoursePlayer product={product} modules={modules} />
  }


  // ==========================================
  // ROUTE 2: DIGITAL ASSET DELIVERY
  // ==========================================
  if (product.product_type === 'asset') {
    const files = product.product_attachments?.filter((a: any) => a.attachment_type === 'file') || []

    // Generate SECURE Signed URLs for the private bucket (valid for 24 hours)
    const filesWithUrls = await Promise.all(
      files.map(async (file: any) => {
        const { data } = await supabase.storage
          .from('product-files')
          .createSignedUrl(file.storage_path, 60 * 60 * 24) // 24hr expiration
        return { ...file, downloadUrl: data?.signedUrl }
      })
    )

    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '2rem', borderBottom: '1px solid #E5E7EB', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
            <div style={{ width: '120px', height: '120px', position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#F3F4F6', flexShrink: 0 }}>
              {product.cover_image ? (
                <Image src={product.cover_image} alt={product.title} fill style={{ objectFit: 'cover' }} unoptimized />
              ) : <FileBox size={40} color="#9CA3AF" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />}
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#ECFDF5', color: '#059669', padding: '4px 10px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                <CheckCircle2 size={14} /> Ready to Download
              </div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', margin: '0 0 0.25rem 0' }}>{product.title}</h1>
              <p style={{ color: '#6B7280', margin: 0 }}>By @{product.profiles.username}</p>
            </div>
          </div>

          <div style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>Your Files</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filesWithUrls.map((file: any) => (
                <div key={file.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid #E5E7EB', borderRadius: '12px', background: '#F8FAFC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                    {/* 🔴 FIXED: flexShrink moved into a style object */}
                    <FileBox size={20} color="#4F46E5" style={{ flexShrink: 0 }} />
                    <span style={{ color: '#374151', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.file_name}</span>
                  </div>
                  {file.downloadUrl ? (
                    <a href={file.downloadUrl} download={file.file_name} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#4F46E5', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: '600', textDecoration: 'none', flexShrink: 0 }}>
                      <Download size={16} /> Download
                    </a>
                  ) : (
                    <span style={{ color: '#EF4444', fontSize: '0.875rem' }}>File Unavailable</span>
                  )}
                </div>
              ))}
              {filesWithUrls.length === 0 && <p style={{ color: '#6B7280' }}>No files are currently attached to this product.</p>}
            </div>
          </div>
        </div>
      </div>
    )
  }


  // ==========================================
  // ROUTE 3: SERVICE / CONSULTATION DELIVERY
  // ==========================================
  if (product.product_type === 'service') {
    const bookingLinkObj = product.product_attachments?.find((a: any) => a.attachment_type === 'link')
    const bookingLink = bookingLinkObj?.storage_path

    // Format the time the user booked (if they are a buyer)
    const bookedTime = userOrder?.booking_time
      // ✅ Fixed Line:
      ? new Date(userOrder.booking_time).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })
      : "View your booked schedule (Seller Preview)"

    return (
      <div style={{ minHeight: '100vh', background: '#F9FAFB', padding: '3rem 1rem' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>

          <div style={{ padding: '2rem', textAlign: 'center', background: '#EEF2FF', borderBottom: '1px solid #E0E7FF' }}>
            <div style={{ width: '64px', height: '64px', background: '#4F46E5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <CheckCircle2 size={32} color="white" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#111827', margin: '0 0 0.5rem 0' }}>Booking Confirmed!</h1>
            <p style={{ color: '#4F46E5', fontWeight: '500', margin: 0 }}>{product.title} with @{product.profiles.username}</p>
          </div>

          <div style={{ padding: '2rem' }}>
            <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
              <p style={{ fontSize: '0.875rem', color: '#64748B', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.5rem', margin: 0 }}>Your Selected Time</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#0F172A', fontWeight: '600', fontSize: '1.125rem', marginTop: '0.5rem' }}>
                <Calendar size={20} color="#4F46E5" />
                {bookedTime}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569', fontSize: '0.95rem', marginTop: '0.75rem' }}>
                <Clock size={18} />
                {product.duration_minutes || 60} Minute Session
              </div>
            </div>

            <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#111827', marginBottom: '1rem' }}>How to Join</h3>
            <p style={{ color: '#4B5563', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              At the time of your appointment, click the button below to join the meeting room provided by the seller.
            </p>

            {bookingLink ? (
              <a href={bookingLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: '#111827', color: 'white', padding: '1rem', borderRadius: '8px', fontSize: '1.125rem', fontWeight: '600', textDecoration: 'none', width: '100%', transition: 'background 0.2s' }}>
                <LinkIcon size={20} /> Join Meeting Room
              </a>
            ) : (
              <div style={{ padding: '1rem', background: '#FEF2F2', color: '#B91C1C', borderRadius: '8px', border: '1px solid #FECACA', textAlign: 'center', fontWeight: '500' }}>
                The seller has not provided a meeting link yet. Please contact them at {product.profiles.email}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Fallback if somehow a product type doesn't match
  return <div style={{ padding: '3rem', textAlign: 'center' }}>Product format not recognized.</div>
}