import { createClient } from '@/lib/server'
import { redirect, notFound } from 'next/navigation'
import CourseEditor from '@/components/CourseEditor'

// --- INTERFACES ---
interface CourseLesson {
  id: string
  module_id: string // 🔴 REQUIRED: Added module_id here
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

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) redirect('/login')

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
    `) // 🔴 REQUIRED: Added module_id to the select query above
    .eq('id', id)
    .single()

  if (productError || !product) return notFound()
  if (product.seller_id !== user.id) redirect('/dashboard/products')

  // 1. Cast the raw data to our strict Module interface
  const rawModules = (product.course_modules as unknown as CourseModule[]) || []

  // 2. Stable, null-safe sorting for Modules
  const sortedModules = rawModules.sort(
    (a: CourseModule, b: CourseModule) => (a.sort_order || 0) - (b.sort_order || 0)
  )

  // 3. Stable, null-safe sorting for nested Lessons
  const modulesWithSortedLessons = sortedModules.map((module: CourseModule) => ({
    ...module,
    course_lessons: (module.course_lessons || []).sort(
      (a: CourseLesson, b: CourseLesson) => (a.sort_order || 0) - (b.sort_order || 0)
    )
  }))

  const fullProduct = { ...product, course_modules: modulesWithSortedLessons }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single()

  // --- THE FIX: Safe Fallback ---
  const safeUsername = profile?.username || 'creator'

  // Return the Editor directly. No DashboardLayout wrapper.
  return (
    // 🔴 REQUIRED: Added "as any" to bypass deep nested type checking
    <CourseEditor initialProduct={fullProduct as any} username={safeUsername} />
  )
}