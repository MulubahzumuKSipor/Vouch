export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import CoursePlayer from '@/components/CoursePlayer'

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

  // 1. Fetch Product
  const { data: product } = await supabase
    .from('products')
    // 🔴 FIXED: Added 'slug' to the select query
    .select('id, title, slug, seller_id, profiles!inner (username)')
    .eq('slug', slug)
    .single()

  if (!product) redirect('/explore')

  // 2. SECURE ACCESS CHECK
  let hasAccess = false
  if (user.id === product.seller_id) {
    hasAccess = true
  } else {
    const { data: order } = await supabase
      .from('orders')
      .select('id')
      .eq('product_id', product.id)
      .eq('buyer_id', user.id)
      .eq('status', 'completed')
      .maybeSingle()
    if (order) hasAccess = true
  }

  if (!hasAccess) redirect(`/@${product.profiles.username}/${slug}`)

  // 3. CORRECT QUERY: Fetch Modules and their nested lessons
  const { data: rawModules, error } = await supabase
    .from('course_modules')
    .select(`
      id,
      title,
      sort_order,
      course_lessons ( * )
    `)
    .eq('product_id', product.id)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error("Error fetching curriculum:", error)
  }

  // 4. Format the data: Filter only published lessons and sort them (Strictly Typed)
  const modules = ((rawModules as unknown as CourseModule[]) || []).map((mod: CourseModule) => {
    const publishedLessons = (mod.course_lessons || [])
      .filter((lesson: CourseLesson) => lesson.is_published === true)
      // Added fallback to 0 to prevent math errors if sort_order is null
      .sort((a: CourseLesson, b: CourseLesson) => (a.sort_order || 0) - (b.sort_order || 0))

    return {
      ...mod,
      course_lessons: publishedLessons
    }
  })

  // Since we added 'slug' to the query, this now perfectly satisfies PlayerProduct
  return <CoursePlayer product={product} modules={modules} />
}