'use server'

import { createClient } from "./server";
import { revalidatePath } from "next/cache";
import { Provider } from '@supabase/supabase-js';
import { createClient as createAdminClient } from '@supabase/supabase-js';

// --- AUTHENTICATION ---

export async function login(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };

  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('has_completed_onboarding')
      .eq('id', user.id)
      .maybeSingle();

    revalidatePath("/", "layout");

    if (profile && !profile.has_completed_onboarding) {
      return { success: true, redirectTo: "/onboard" };
    }
  }

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
      data: { username, full_name: fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/login`,
    },
  });

  if (authError) return { error: authError.message };
  return { success: true, redirectTo: "/check-email" };
}

// --- SOCIAL & OTP LOGIN ---

export async function signInWithOAuth(provider: Provider) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) return { error: error.message };
  return { url: data.url };
}

export async function loginWithOtp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) return { error: "Please enter your email address." };

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) return { error: error.message };
  return { success: true, message: "Magic link sent! Check your email." };
}

// --- PASSWORD RESET FLOW (6-DIGIT OTP) ---

export async function sendPasswordResetOtp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;

  if (!email) return { error: "Please enter your email address." };

  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) return { error: error.message };
  return { success: true, email };
}

export async function verifyAndSetNewPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;
  const code = formData.get('code') as string;
  const password = formData.get('password') as string;
  const confirm = formData.get('confirm_password') as string;

  if (password !== confirm) return { error: "Passwords do not match." };

  // 🔴 Explicitly checks for 6 digits
  if (!code || code.length !== 6) return { error: "Please enter a valid 6-digit code." };
  if (password.length < 6) return { error: "Password must be at least 6 characters." };

  const { error: verifyError } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'recovery'
  });

  if (verifyError) return { error: "Invalid or expired code. Please try again." };

  const { error: updateError } = await supabase.auth.updateUser({
    password: password
  });

  if (updateError) return { error: updateError.message };

  revalidatePath("/", "layout");
  return { success: true, redirectTo: "/dashboard" };
}

// --- GUEST CHECKOUT GATEKEEPER ---

export async function processGuestCheckout(payload: {
  email: string;
  phone: string;
  method: string;
  items: any[];
}) {
  const { email, phone, method, items } = payload;
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    for (const item of items) {
      const productId = item.product_id || item.id;
      const { data: productData, error: productError } = await supabaseAdmin
        .from('products')
        .select(`seller_id, profiles!inner(email)`)
        .eq('id', productId)
        .single();

      if (productError || !productData) throw new Error(`Product not found: ${item.title}`);

      const profileData = productData.profiles as any;
      const sellerEmail = Array.isArray(profileData) ? profileData[0]?.email : profileData?.email;

      if (sellerEmail?.toLowerCase() === email.toLowerCase()) {
        return { error: `You are the creator of "${item.title}". Access it via your dashboard.` };
      }

      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('product_id', productId)
        .ilike('buyer_email', email)
        .eq('status', 'completed')
        .maybeSingle();

      if (existingOrder) return { error: `You already purchased "${item.title}". Check your library.` };
      item.seller_id = productData.seller_id;
    }

    let buyerId = null;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
      user_metadata: { account_type: 'buyer', is_shadow_account: true },
    });

    if (authError) {
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();
      buyerId = existingProfile?.id || null;
    } else {
      buyerId = authData.user.id;
    }

    const ordersToInsert = items.map(item => {
      const amountPaid = (item.price_amount || item.price) * (item.quantity || 1);
      const platformFee = Math.floor(amountPaid * 0.05);
      return {
        order_number: `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        buyer_id: buyerId,
        buyer_email: email,
        buyer_phone: phone,
        seller_id: item.seller_id,
        product_id: item.product_id || item.id,
        product_title: item.title,
        product_price: item.price_amount || item.price,
        amount_paid: amountPaid,
        currency: item.currency || 'USD',
        platform_fee: platformFee,
        seller_earnings: amountPaid - platformFee,
        payment_method: method,
        status: 'completed',
        booking_time: item.booking_time || null,
      };
    });

    const { error: orderError } = await supabaseAdmin.from('orders').insert(ordersToInsert);
    if (orderError) throw orderError;

    await supabaseAdmin.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/library`
      }
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to process checkout." };
  }
}

export async function checkEmailOwnership(email: string, productIds: string[]) {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('title, profiles!inner(email)')
      .in('id', productIds);

    for (const p of products || []) {
      const profileData = p.profiles as any;
      const sellerEmail = Array.isArray(profileData) ? profileData[0]?.email : profileData?.email;
      if (sellerEmail?.toLowerCase() === email.toLowerCase()) {
        return { status: 'owner', message: `Creator detected: You own "${p.title}".` };
      }
    }

    const { data: existingOrders } = await supabaseAdmin
      .from('orders')
      .select('product_title')
      .ilike('buyer_email', email)
      .eq('status', 'completed')
      .in('product_id', productIds);

    if (existingOrders?.length) {
      return { status: 'purchased', message: `Duplicate detected: You already own this.` };
    }

    return { status: 'clear' };
  } catch (error) {
    return { status: 'error' };
  }
}