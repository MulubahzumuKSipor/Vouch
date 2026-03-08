'use server'

import { createClient } from "./server";
import { revalidatePath } from "next/cache";
import { Provider } from '@supabase/supabase-js';
import { createClient as createAdminClient } from '@supabase/supabase-js';

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

// Social Login Server Action
export async function signInWithOAuth(provider: Provider) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      // Route them back to your auth callback to establish the session
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vouch-sooty.vercel.app'}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Return the URL so the client component can redirect the user
  return { url: data.url };
}

// Magic Link / OTP Server Action (For Passwordless Entry)
export async function loginWithOtp(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Please enter your email address." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vouch-sooty.vercel.app'}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Magic link sent! Check your email." };
}

// 🔴 UPDATED: Guest Checkout with Gatekeeper & Consultation Booking Time
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
    // ------------------------------------------------------------------
    // 🛡️ STEP 1: THE PRE-CHECKOUT GATEKEEPER
    // ------------------------------------------------------------------
    for (const item of items) {
      const productId = item.product_id || item.id;

      // Fetch the Product and the Seller's Profile Email
      const { data: productData, error: productError } = await supabaseAdmin
        .from('products')
        .select(`seller_id, profiles!inner(email)`)
        .eq('id', productId)
        .single();

      if (productError || !productData) {
        return { error: `Product not found: ${item.title}` };
      }

      // 🛑 Gate 1: Prevent Sellers from buying their own products
      const profileData = productData.profiles as any;
      const sellerEmail = Array.isArray(profileData) ? profileData[0]?.email : profileData?.email;

      if (sellerEmail && sellerEmail.toLowerCase() === email.toLowerCase()) {
        return {
          error: `Checkout blocked: You are the creator of "${item.title}". Please log in to your account to access it for free.`
        };
      }

      // 🛑 Gate 2: Prevent Duplicate Purchases
      const { data: existingOrder } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('product_id', productId)
        .ilike('buyer_email', email) // Case-insensitive match
        .eq('status', 'completed')
        .maybeSingle();

      if (existingOrder) {
        return {
          error: `Checkout blocked: You have already purchased "${item.title}" with this email! Log in to access it, or check your email for the receipt.`
        };
      }

      // Temporarily store the seller_id on the item so we don't have to query it again later
      item.seller_id = productData.seller_id;
    }

    // ------------------------------------------------------------------
    // 👤 STEP 2: BUYER IDENTIFICATION / AUTO-ACCOUNT CREATION
    // ------------------------------------------------------------------
    let buyerId = null;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      email_confirm: true,
      user_metadata: { account_type: 'buyer', is_shadow_account: true },
    });

    if (authError) {
      const errorMessage = authError.message.toLowerCase();
      if (errorMessage.includes('already') && errorMessage.includes('registered')) {
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single();
        buyerId = existingProfile?.id || null;
      } else {
        throw new Error(authError.message);
      }
    } else {
      buyerId = authData.user.id;
    }

    // ------------------------------------------------------------------
    // 🛒 STEP 3: PREPARE AND INSERT ORDERS
    // ------------------------------------------------------------------
    const ordersToInsert = items.map(item => {
      const productId = item.product_id || item.id;
      const itemPrice = item.price_amount || item.price;
      const amountPaid = itemPrice * (item.quantity || 1);
      const platformFee = Math.floor(amountPaid * 0.05);

      return {
        order_number: `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        buyer_id: buyerId,
        buyer_email: email,
        buyer_phone: phone,
        seller_id: item.seller_id,
        product_id: productId,
        product_title: item.title,
        product_price: itemPrice,
        amount_paid: amountPaid,
        currency: item.currency || item.price_currency || 'USD',
        platform_fee: platformFee,
        seller_earnings: amountPaid - platformFee,
        payment_method: method,
        status: 'completed',
        booking_time: item.booking_time || null,
      };
    });

    const { error: orderError } = await supabaseAdmin.from('orders').insert(ordersToInsert);
    if (orderError) throw orderError;

    // Send the secure login link
    await supabaseAdmin.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vouch-sooty.vercel.app'}/auth/callback?next=/library`
      }
    });

    return { success: true };

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return { error: error.message || "Failed to process checkout." };
  }
}

// 🔴 NEW: The Real-Time Email Checker for the Checkout Modal
export async function checkEmailOwnership(email: string, productIds: string[]) {
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Check if they are the seller of any of these products
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('title, profiles!inner(email)')
      .in('id', productIds);

    for (const p of products || []) {
      const profileData = p.profiles as any;
      const sellerEmail = Array.isArray(profileData) ? profileData[0]?.email : profileData?.email;

      if (sellerEmail && sellerEmail.toLowerCase() === email.toLowerCase()) {
        return { status: 'owner', message: `You are the creator of "${p.title}". You don't need to buy your own product.` };
      }
    }

    // 2. Check if they already bought any of these products
    const { data: existingOrders } = await supabaseAdmin
      .from('orders')
      .select('product_title')
      .ilike('buyer_email', email)
      .eq('status', 'completed')
      .in('product_id', productIds);

    if (existingOrders && existingOrders.length > 0) {
      const ownedTitles = existingOrders.map(o => o.product_title).join(', ');
      return { status: 'purchased', message: `You already purchased: ${ownedTitles}.` };
    }

    return { status: 'clear' };
  } catch (error) {
    return { status: 'error' };
  }
}

// 🔴 NEW: Send the password reset email
export async function resetPassword(formData: FormData) {
  const supabase = await createClient();
  const email = formData.get('email') as string;

  if (!email) return { error: "Please enter your email address." };

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // We explicitly tell it to send them to the update-password page after clicking the link!
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://vouch-sooty.vercel.app'}/auth/callback?next=/update-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, message: "Password reset link sent! Please check your email." };
}

// 🔴 NEW: Save the brand new password
export async function updatePassword(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get('password') as string;

  if (!password || password.length < 6) {
    return { error: "Password must be at least 6 characters long." };
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true, redirectTo: "/dashboard" };
}