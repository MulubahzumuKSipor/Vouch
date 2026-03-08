import { NextResponse } from 'next/server';
import { createClient } from '@/lib/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  
  // 1. Intercept standard Supabase errors (e.g., link timeout)
  const authError = searchParams.get('error_description') || searchParams.get('error');
  if (authError) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('The authentication link has expired or was already used.')}`);
  }

  // The 'code' is the PKCE exchange key for Social/Magic Links
  const code = searchParams.get('code');
  
  // The 'next' parameter tells us where the user was trying to go (e.g., /library after purchase)
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    
    // 🔴 PKCE EXCHANGE: Converts the URL code into an encrypted session cookie
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch profile to check onboarding status
        // Use maybeSingle() to prevent 406 crashes for new Guest Buyers
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_completed_onboarding')
          .eq('id', user.id)
          .maybeSingle();

        // 🟢 ONBOARDING LOGIC
        // We only interrupt the flow for onboarding if they are going to the Dashboard.
        // If they just bought something and are going to /library, don't stop them!
        const isStandardLogin = next === '/dashboard';

        if (isStandardLogin && profile && !profile.has_completed_onboarding) {
          return NextResponse.redirect(`${origin}/onboard`);
        }
      }

      // Successful Auth: Redirect to the intended destination
      return NextResponse.redirect(`${origin}${next}`);
    } else {
      // PKCE ERROR: Usually happens if the link is clicked in a different browser
      // or if it's clicked a second time (the code is consumed).
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Security mismatch: Please ensure you open the link in the same browser window where you started.')}`);
    }
  }

  // If we reach here, no code was found in the URL.
  return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent('Invalid authentication attempt.')}`);
}