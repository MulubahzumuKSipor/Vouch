'use server'

import { createClient } from "./server";
import { revalidatePath } from "next/cache";
import { Provider } from '@supabase/supabase-js'; // 🔴 Required for Google/GitHub typing

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // Check if user has completed onboarding
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('has_completed_onboarding')
      .eq('id', user.id)
      .single();

    // Revalidate the layout so the navbar updates with the user's logged-in state
    revalidatePath("/", "layout");

    // Return the destination URL to the client instead of using redirect()
    if (profile && !profile.has_completed_onboarding) {
      return { success: true, redirectTo: "/onboard" };
    } else {
      return { success: true, redirectTo: "/dashboard" };
    }
  }

  // Fallback
  return { success: true, redirectTo: "/dashboard" };
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;
  const fullName = formData.get("full_name") as string;

  const { error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vouch-sooty.vercel.app'}/login`,
    },
  });

  if (authError) {
    return { error: authError.message };
  }

  // Tell the client to go to the check-email page
  return { success: true, redirectTo: "/check-email" };
}

// 🔴 NEW: Social Login Server Action
export async function signInWithOAuth(provider: Provider) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      // Route them back to your auth callback to establish the session
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Return the URL so the client component can redirect the user
  return { url: data.url };
}

// 🔴 NEW: Magic Link / OTP Server Action (For Passwordless Entry)
export async function loginWithOtp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Please enter your email address." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Magic link sent! Check your email." };
}