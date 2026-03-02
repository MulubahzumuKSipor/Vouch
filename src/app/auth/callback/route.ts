import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  
  // The secure code sent by Supabase/Google/GitHub
  const code = searchParams.get('code');
  
  // If we passed a 'next' parameter (e.g. they were trying to buy a specific product)
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    
    // 🔴 THE MAGIC: We exchange the URL code for a secure, encrypted cookie session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if this is a brand new user who needs to complete onboarding
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_completed_onboarding')
          .eq('id', user.id)
          .single();

        // If they haven't onboarded, force them to the /onboard page
        if (profile && !profile.has_completed_onboarding) {
          return NextResponse.redirect(`${origin}/onboard`);
        }
      }

      // If they are fully onboarded, send them to their destination
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If the code was missing, expired, or tampered with, boot them back to the login screen
  return NextResponse.redirect(`${origin}/auth?error=Could not verify your authentication attempt. Please try again.`);
}