'use server'

import { createClient } from "./server";
import { revalidatePath } from "next/cache";

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

    // 🔴 THE FIX: Return the destination URL to the client instead of using redirect()
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

  // 🔴 THE FIX: Tell the client to go to the check-email page
  return { success: true, redirectTo: "/check-email" };
}