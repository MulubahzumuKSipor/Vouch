'use client'

import { useState } from 'react';
import Link from 'next/link';
import { login, signup } from '@/lib/action';
import styles from '@/styles/auth.module.css';

export default function AuthPage() {
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  // Validate username on client side
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

  const handleSubmit = async (formData: FormData) => {
    // Validate username before submission (signup only)
    if (view === 'signup') {
      const username = formData.get('username') as string;
      if (!validateUsername(username)) {
        return;
      }

      // Clean the username before sending
      const cleanedUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, '');
      formData.set('username', cleanedUsername);
    }

    setIsLoading(true);
    const action = view === 'login' ? login : signup;
    const result = await action(formData);

    if (result?.error) {
      alert(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Decorative African Pattern Background */}
      <div className={styles.patternOverlay}></div>

      {/* Animated accent lines */}
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

            {/* Decorative geometric elements */}
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
              <div className={styles.toggleContainer}>
                <div
                  className={styles.toggleSlider}
                  style={{ transform: view === 'signup' ? 'translateX(100%)' : 'translateX(0)' }}
                ></div>
                <button
                  className={`${styles.toggleBtn} ${view === 'login' ? styles.active : ''}`}
                  onClick={() => setView('login')}
                  type="button"
                >
                  Sign In
                </button>
                <button
                  className={`${styles.toggleBtn} ${view === 'signup' ? styles.active : ''}`}
                  onClick={() => setView('signup')}
                  type="button"
                >
                  Create Account
                </button>
              </div>

              {/* Form */}
              <form action={handleSubmit} className={styles.form}>
                {view === 'signup' && (
                  <>
                    <div className={styles.inputGroup}>
                      <label htmlFor="username" className={styles.label}>
                        Claim Your Handle
                      </label>
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
                        />
                      </div>
                      {usernameError && (
                        <p className={styles.errorText}>{usernameError}</p>
                      )}
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="full_name" className={styles.label}>
                        Full Name
                      </label>
                      <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        required
                        placeholder="Enter your full name"
                        className={styles.input}
                      />
                    </div>
                  </>
                )}

                <div className={styles.inputGroup}>
                  <label htmlFor="email" className={styles.label}>
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="password" className={styles.label}>
                    Password
                  </label>
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

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={isLoading}
                >
                  <span className={styles.btnText}>
                    {isLoading ? 'Processing...' : (view === 'login' ? 'Sign In' : 'Create Account')}
                  </span>
                  <span className={styles.btnArrow}>→</span>
                </button>
              </form>

              <div className={styles.footer}>
                {view === 'login' ? (
                  <Link href="/forgot-password" className={styles.footerLink}>
                    Forgot your password?
                  </Link>
                ) : (
                  <p className={styles.footerText}>
                    By joining, you agree to our{' '}
                    <Link href="/terms" className={styles.footerLink}>Terms</Link>
                    {' '}and{' '}
                    <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
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