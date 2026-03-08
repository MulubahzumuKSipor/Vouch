'use client'

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { login, signup, signInWithOAuth, loginWithOtp } from '@/lib/action';
import styles from '@/styles/auth.module.css';

// 1. We extract the core logic into a separate component so we can use useSearchParams safely
function AuthFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🔴 NEW: Grab the email from the URL (e.g., ?email=mzksipor@gmail.com)
  const prefilledEmail = searchParams.get('email');

  const [view, setView] = useState<'login' | 'signup'>('login');
  const [loginMethod, setLoginMethod] = useState<'password' | 'magic_link'>('password');
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateUsername = (username: string): boolean => {
    const cleaned = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleaned.length < 3) {
      setUsernameError('Username must be at least 3 characters (letters, numbers, underscore only)');
      return false;
    }
    if (cleaned.length > 30) {
      setUsernameError('Username must be 30 characters or less');
      return false;
    }
    setUsernameError('');
    return true;
  };

  const handleViewSwitch = (newView: 'login' | 'signup') => {
    setView(newView);
    setServerError('');
    setSuccessMessage('');
    setUsernameError('');
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setServerError('');
    setSuccessMessage('');
    setIsLoading(true);

    const result = await signInWithOAuth(provider);

    if (result?.error) {
      setServerError(result.error);
      setIsLoading(false);
    } else if (result?.url) {
      window.location.href = result.url;
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setServerError('');
    setSuccessMessage('');

    if (view === 'signup') {
      const username = formData.get('username') as string;
      if (!validateUsername(username)) return;
      const cleanedUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
      formData.set('username', cleanedUsername);
    }

    setIsLoading(true);

    let result;
    if (view === 'signup') {
      result = await signup(formData);
    } else if (loginMethod === 'magic_link') {
      result = await loginWithOtp(formData);
    } else {
      result = await login(formData);
    }

    if (result?.error) {
      setServerError(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      if ('message' in result) {
        setSuccessMessage(result.message as string);
        setIsLoading(false);
      } else if ('redirectTo' in result) {
        router.push(result.redirectTo as string);
      } else if (view === 'signup') {
        router.push('/check-email');
      }
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.patternOverlay}></div>
      <div className={styles.accentLines}>
        <div className={styles.accentLine}></div>
        <div className={styles.accentLine}></div>
        <div className={styles.accentLine}></div>
      </div>

      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          {/* Left side - Branding */}
          <div className={styles.brandSection}>
            <div className={styles.logoWrapper}>
              <div className={styles.logoAccent}></div>
              <Link href="/" className={styles.logo}>
                Vouch<span className={styles.logoDot}>.</span>
              </Link>
            </div>
            <h1 className={styles.welcomeTitle}>
              {view === 'login' ? 'Welcome Back' : 'Join Our Community'}
            </h1>
            <p className={styles.subtitle}>
              {view === 'login'
                ? 'Continue your journey with Africa\'s marketplace'
                : 'Start building your legacy today'}
            </p>
            <div className={styles.decorativeElements}>
              <div className={styles.triangle}></div>
              <div className={styles.circle}></div>
              <div className={styles.square}></div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className={styles.formSection}>
            <div className={styles.formCard}>

              {/* Toggle Switcher */}
              <div className={styles.toggleContainer} role="group" aria-label="Authentication mode">
                <div
                  className={styles.toggleSlider}
                  style={{ transform: view === 'signup' ? 'translateX(100%)' : 'translateX(0)' }}
                ></div>
                <button
                  className={`${styles.toggleBtn} ${view === 'login' ? styles.active : ''}`}
                  onClick={() => handleViewSwitch('login')}
                  type="button"
                  aria-pressed={view === 'login'}
                >
                  Sign In
                </button>
                <button
                  className={`${styles.toggleBtn} ${view === 'signup' ? styles.active : ''}`}
                  onClick={() => handleViewSwitch('signup')}
                  type="button"
                  aria-pressed={view === 'signup'}
                >
                  Create Account
                </button>
              </div>

              {/* Server Error Banner */}
              {serverError && (
                <div
                  role="alert"
                  aria-live="assertive"
                  style={{ color: '#92400E', backgroundColor: '#FFFBEB', padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid #FEF3C7', fontSize: '0.95rem' }}
                >
                  {serverError}
                </div>
              )}

              {/* Success Message Banner (For Magic Links) */}
              {successMessage && (
                <div
                  role="status"
                  aria-live="polite"
                  style={{ color: '#065F46', backgroundColor: '#D1FAE5', padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid #A7F3D0', fontSize: '0.95rem' }}
                >
                  {successMessage}
                </div>
              )}

              {/* Social Login Buttons */}
              <div className={styles.socialAuthContainer} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FFF', color: '#374151', fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.2s' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('github')}
                  disabled={isLoading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#24292E', color: '#FFF', fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer', transition: 'background-color 0.2s' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                  Continue with GitHub
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0', color: '#9CA3AF', fontSize: '0.875rem' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
                <span style={{ padding: '0 1rem' }}>OR</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: '#E5E7EB' }}></div>
              </div>

              {/* Main Form */}
              <form action={handleSubmit} className={styles.form}>
                {view === 'signup' && (
                  <>
                    <div className={styles.inputGroup}>
                      <label htmlFor="username" className={styles.label}>Claim Your Handle</label>
                      <div className={styles.inputWrapper}>
                        <span className={styles.handlePrefix}>@</span>
                        <input
                          id="username"
                          name="username"
                          type="text"
                          required
                          placeholder="yourhandle"
                          className={styles.input}
                          autoCapitalize="none"
                          pattern="[a-zA-Z0-9_]{3,30}"
                          title="3-30 characters: letters, numbers, underscore only"
                          onBlur={(e) => validateUsername(e.target.value)}
                          aria-invalid={usernameError ? "true" : "false"}
                          aria-describedby={usernameError ? "username-error" : undefined}
                        />
                      </div>
                      {usernameError && <p id="username-error" className={styles.errorText} role="alert">{usernameError}</p>}
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="full_name" className={styles.label}>Full Name</label>
                      <input id="full_name" name="full_name" type="text" required placeholder="Enter your full name" className={styles.input} />
                    </div>
                  </>
                )}

                {/* 🔴 NEW: Dynamic Email Field */}
                {prefilledEmail && view === 'login' ? (
                  <div className={styles.inputGroup}>
                    <label className={styles.label}>Email Address</label>
                    <div style={{ padding: '0.75rem', backgroundColor: '#F3F4F6', borderRadius: '8px', border: '1px solid #E5E7EB', color: '#4B5563', fontSize: '0.95rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '500' }}>{prefilledEmail}</span>
                      <Link href="/login" style={{ fontSize: '0.75rem', color: '#4F46E5', textDecoration: 'none', fontWeight: '600' }}>
                        Change
                      </Link>
                    </div>
                    {/* Hidden input ensures the email is still sent with formData */}
                    <input type="hidden" name="email" value={prefilledEmail} />
                  </div>
                ) : (
                  <div className={styles.inputGroup}>
                    <label htmlFor="email" className={styles.label}>Email Address</label>
                    <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className={styles.input} />
                  </div>
                )}

                {/* Password Field Logic - Hidden if user chooses Magic Link */}
                {(view === 'signup' || loginMethod === 'password') && (
                  <div className={styles.inputGroup}>
                    {/* 🔴 NEW: Moved Forgot Password Link right above the password field */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <label htmlFor="password" className={styles.label} style={{ marginBottom: 0 }}>Password</label>
                      {view === 'login' && (
                        <Link href="/forgot-password" style={{ fontSize: '0.8rem', color: '#4F46E5', textDecoration: 'none', fontWeight: '500' }}>
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={6}
                      autoComplete={view === 'login' ? "current-password" : "new-password"}
                      placeholder="••••••••"
                      className={styles.input}
                    />
                  </div>
                )}

                {/* Magic Link vs Password Toggle */}
                {view === 'login' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginMethod(loginMethod === 'password' ? 'magic_link' : 'password');
                        setServerError('');
                      }}
                      style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                    >
                      {loginMethod === 'password' ? 'Prefer not to use a password?' : 'Sign in with a password instead'}
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                  <span className={styles.btnText}>
                    {isLoading
                      ? 'Processing...'
                      : view === 'signup'
                        ? 'Create Account'
                        : loginMethod === 'magic_link'
                          ? 'Send Magic Link'
                          : 'Sign In'
                    }
                  </span>
                  <span className={styles.btnArrow}>→</span>
                </button>
              </form>

              <div className={styles.footer}>
                {view === 'signup' && (
                  <p className={styles.footerText}>
                    By joining, you agree to our <Link href="/terms" className={styles.footerLink}>Terms</Link> and <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 2. We wrap our form inside the default export using Suspense to satisfy Next.js!
export default function AuthPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FAFB' }}>
        <p style={{ color: '#6B7280' }}>Loading secure login...</p>
      </div>
    }>
      <AuthFormContent />
    </Suspense>
  )
}