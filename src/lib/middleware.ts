import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // 1. Initialize Response
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 2. Get User
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;

  // -----------------------------------------------------------------
  // RULE 1: PUBLIC vs PROTECTED
  // -----------------------------------------------------------------
  const protectedPrefixes = ['/dashboard', '/settings', '/onboard'];
  const isProtected = protectedPrefixes.some((prefix) => path.startsWith(prefix));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    // 🔴 FIXED: Route unauthenticated users to your unified /auth page
    url.pathname = '/auth';
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  // 🔴 FIXED: Prevent logged-in users from accessing the auth page
  if (user && path.startsWith('/auth')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // -----------------------------------------------------------------
  // RULE 2: ENFORCE ONBOARDING (The "Trap")
  // -----------------------------------------------------------------
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_seller, has_completed_onboarding')
      .eq('id', user.id)
      .single();

    // A. User HAS NOT finished onboarding
    if (profile && !profile.has_completed_onboarding) {
      if (!path.startsWith('/onboard')) {
        const url = request.nextUrl.clone();
        url.pathname = '/onboard';
        return NextResponse.redirect(url);
      }
      return supabaseResponse;
    }

    // B. User HAS finished onboarding
    if (profile && profile.has_completed_onboarding) {
      if (path.startsWith('/onboard')) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    }

    // -----------------------------------------------------------------
    // RULE 3: SELLER ONLY ROUTES (Role Based Access)
    // -----------------------------------------------------------------
    const sellerOnlyPrefixes = [
      '/dashboard/products',
      '/dashboard/orders',
      '/dashboard/analytics',
      '/dashboard/payouts',
      '/dashboard/store'
    ];
    const isSellerRoute = sellerOnlyPrefixes.some((prefix) => path.startsWith(prefix));

    if (isSellerRoute && (!profile || !profile.is_seller)) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}