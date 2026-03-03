'use server'

import { createClient } from "./server";
import { revalidatePath } from "next/cache";
import { Provider } from '@supabase/supabase-js'; // 🔴 Required for Google/GitHub typing
import { createClient as createAdminClient } from '@supabase/supabase-js'; // 🔴 Required for bypassing RLS in checkout

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


// 🔴 UPDATED: Guest Checkout Server Action with Duplicate Purchase Check
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
    let buyerId = null;

    // 1. Identification Phase
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

    // 2. 🔴 NEW: DUPLICATE PURCHASE CHECK
    // If the user is identified, check if they already own any of these items
    if (buyerId) {
      const productIds = items.map(item => item.product_id || item.id);

      const { data: existingOrders } = await supabaseAdmin
        .from('orders')
        .select('product_id, product_title')
        .eq('buyer_id', buyerId)
        .eq('status', 'completed')
        .in('product_id', productIds);

      if (existingOrders && existingOrders.length > 0) {
        // If they own at least one item, stop the checkout and warn them
        const ownedTitles = existingOrders.map(o => o.product_title).join(', ');
        return {
          error: `You already own: ${ownedTitles}. Check your email for access or use a different email to buy for someone else.`
        };
      }
    }

    // 3. Prepare the orders (No changes here)
    const ordersToInsert = [];
    for (const item of items) {
      const productId = item.product_id || item.id;
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('seller_id')
        .eq('id', productId)
        .single();

      if (!product) throw new Error(`Product not found: ${item.title}`);

      const itemPrice = item.price_amount || item.price;
      const amountPaid = itemPrice * (item.quantity || 1);
      const platformFee = Math.floor(amountPaid * 0.05);

      ordersToInsert.push({
        order_number: `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        buyer_id: buyerId,
        buyer_email: email,
        buyer_phone: phone,
        seller_id: product.seller_id,
        product_id: productId,
        product_title: item.title,
        product_price: itemPrice,
        amount_paid: amountPaid,
        currency: item.currency || item.price_currency || 'USD',
        platform_fee: platformFee,
        seller_earnings: amountPaid - platformFee,
        payment_method: method,
        status: 'completed',
      });
    }

    // 4. Finalize
    const { error: orderError } = await supabaseAdmin.from('orders').insert(ordersToInsert);
    if (orderError) throw orderError;

    await supabaseAdmin.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/library`
      }
    });

    return { success: true };

  } catch (error: any) {
    console.error("Checkout Error:", error);
    return { error: error.message || "Failed to process checkout." };
  }
}