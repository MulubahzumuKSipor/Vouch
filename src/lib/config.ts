// Environment variables type definition
// Add to your .env.local file:
// NEXT_PUBLIC_SUPABASE_URL=https://vsmicouphxhyjjhrjrih.supabase.co
// NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
// SUPABASE_SERVICE_ROLE_KEY=your-service-role-key (for server-side only)

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
};