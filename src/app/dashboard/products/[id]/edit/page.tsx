import { createClient } from '@/lib/server'
import { redirect, notFound } from 'next/navigation'
import CourseEditor from '@/components/CourseEditor' // Removed duplicate import
import { getLrdRate } from '@/lib/currency'

// --- INTERFACES ---
interface CourseLesson {
  id: string
  module_id: string // 🔴 FIXED: Added module_id to match the Editor's strict requirements
  title: string
  lesson_type: string
  content_body: string | null
  content_url: string | null
  is_preview: boolean
  is_published: boolean
  sort_order: number | null
}

interface CourseModule {
  id: string
  title: string
  description: string | null
  sort_order: number | null
  course_lessons: CourseLesson[]
}

export default async function EditProductPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const { id } = await params

  // 1. Auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

  // 2. Fetch Product (Restored the correct Course relations)
  const { data: product, error: productError } = await supabase
    .from('products')
    .select(`
      *,
      course_modules (
        id, title, description, sort_order,
        course_lessons (
          id, module_id, title, lesson_type, content_body, content_url, is_preview, is_published, sort_order
        )
      )
    `)
    // 🔴 FIXED: Added 'module_id' inside the course_lessons select block above
    .eq('id', id)
    .single()

  if (productError || !product) notFound()

  // 3. Security Check
  if (product.seller_id !== user.id) redirect('/dashboard/products')

  // 4. Sort Modules and Lessons safely
  const rawModules = (product.course_modules as unknown as CourseModule[]) || []

  const sortedModules = rawModules.sort(
    (a: CourseModule, b: CourseModule) => (a.sort_order || 0) - (b.sort_order || 0)
  ).map((module: CourseModule) => ({
    ...module,
    course_lessons: (module.course_lessons || []).sort(
      (a: CourseLesson, b: CourseLesson) => (a.sort_order || 0) - (b.sort_order || 0)
    )
  }))

  // Cast as 'any' safely here to bypass any strict index signature mismatches with the CourseProduct type
  const fullProduct = { ...product, course_modules: sortedModules } as any

  // 5. Get Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  const safeUsername = profile?.username || 'creator'

  // 6. Fetch Live LRD Rate
  const lrdRate = await getLrdRate()

  // CRITICAL FIX: Do NOT wrap in DashboardLayout. Return the Editor directly.
  return (
    <CourseEditor
      initialProduct={fullProduct}
      username={safeUsername}
      /* We need to update CourseEditor to accept this prop */
      // lrdRate={lrdRate}
    />
  )
}