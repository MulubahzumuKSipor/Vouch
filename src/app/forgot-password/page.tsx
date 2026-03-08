'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { resetPassword } from '@/lib/action';
import styles from '@/styles/auth.module.css'; // Reusing your beautiful auth styles!

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError('');

    const formData = new FormData(e.currentTarget);
    const result = await resetPassword(formData);

    if (result?.error) {
      setServerError(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      setIsSuccess(true);
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div style={{ maxWidth: '450px', margin: '4rem auto', width: '100%' }}>
          
          <div className={styles.formCard} style={{ padding: '3rem 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '56px', height: '56px', background: '#EEF2FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <Mail size={28} color="#4F46E5" />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', margin: '0 0 0.5rem 0' }}>Reset your password</h1>
              <p style={{ color: '#6B7280', fontSize: '0.95rem', margin: 0 }}>
                Enter your email address and we&apos;ll send you a secure link to reset your password.
              </p>
            </div>

            {serverError && (
              <div style={{ color: '#92400E', backgroundColor: '#FFFBEB', padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid #FEF3C7', fontSize: '0.875rem' }}>
                {serverError}
              </div>
            )}

            {isSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#F0FDF4', borderRadius: '12px', border: '1px solid #BBF7D0' }}>
                <CheckCircle2 size={40} color="#16A34A" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ color: '#166534', fontSize: '1.125rem', fontWeight: '700', margin: '0 0 0.5rem 0' }}>Check your inbox</h3>
                <p style={{ color: '#15803D', fontSize: '0.9rem', margin: '0 0 1.5rem 0' }}>
                  We&apos;ve sent a password reset link to your email address.
                </p>
                <Link href="/login" style={{ color: '#166534', fontWeight: '600', textDecoration: 'underline', fontSize: '0.95rem' }}>
                  Return to Login
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.inputGroup} style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="email" className={styles.label}>Email Address</label>
                  <input id="email" name="email" type="email" required placeholder="you@example.com" className={styles.input} />
                </div>

                <button type="submit" className={styles.submitBtn} disabled={isLoading} style={{ width: '100%', marginBottom: '1.5rem' }}>
                  {isLoading ? 'Sending link...' : 'Send Reset Link'}
                </button>

                <div style={{ textAlign: 'center' }}>
                  <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.875rem', textDecoration: 'none', fontWeight: '500' }}>
                    <ArrowLeft size={16} /> Back to Login
                  </Link>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}