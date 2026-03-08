import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  
  // 1. Catch Supabase Errors immediately (e.g., expired links from double-clicking)
  const authError = searchParams.get('error_description') || searchParams.get('error');
  if (authError) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Link expired or invalid. Please request a new one.')}`);
  }

  // The secure code sent by Supabase/Google/GitHub
  const code = searchParams.get('code');
  
  // If we passed a 'next' parameter (e.g. they were trying to buy a specific product)
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    
    // 🔴 THE MAGIC: Exchanges the code for a session. (Requires matching browser cookies!)
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if this is a brand new user who needs to complete onboarding
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // 🔴 THE 406 FIX: Using .maybeSingle() prevents crashes for Guest Buyers without profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_completed_onboarding')
          .eq('id', user.id)
          .maybeSingle();

        // 🟢 THE BYPASS FIX: Only force onboarding if they are heading to the dashboard.
        const isStandardLogin = next === '/dashboard';

        if (isStandardLogin && profile && !profile.has_completed_onboarding) {
          return NextResponse.redirect(`${origin}/onboard`);
        }
      }

      // If they are fully onboarded, OR if they are a buyer, OR password reset
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      // If PKCE fails (opened in wrong browser or code was used)
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Security mismatch: Please open the email link in the exact same browser window you requested it from.')}`);
    }
  }

  // If the code was missing or tampered with, boot them back to the login screen
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Could not verify your authentication attempt. Please try again.')}`);
}