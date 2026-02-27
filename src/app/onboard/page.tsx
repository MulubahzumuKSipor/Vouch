import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import OnboardingForm from '@/components/onboarding-form'

export default async function OnboardingPage() {
  const supabase = await createClient();

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user has already completed onboarding
  const { data: profile } = await supabase
    .from('profiles')
    .select('has_completed_onboarding')
    .eq('id', user.id)
    .single();

  if (profile?.has_completed_onboarding) {
    // Already onboarded, redirect to dashboard
    redirect('/dashboard');
  }

  // User needs to complete onboarding
  return <OnboardingForm />;
}

