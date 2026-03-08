'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { sendPasswordResetOtp, verifyAndSetNewPassword } from '@/lib/action';
import styles from '@/styles/auth.module.css';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Step 1: Request the Code
  const handleRequestCode = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError('');

    const formData = new FormData(e.currentTarget);
    const submittedEmail = formData.get('email') as string;
    const result = await sendPasswordResetOtp(formData);

    if (result?.error) {
      setServerError(result.error);
      setIsLoading(false);
    } else if (result?.success) {
      setEmail(submittedEmail);
      setStep(2); // Move to Step 2!
      setIsLoading(false);
    }
  };

  // Step 2: Verify Code and Set Password
  const handleUpdatePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError('');

    const formData = new FormData(e.currentTarget);
    // Append the email we saved from Step 1 so the server knows who to verify
    formData.append('email', email);

    const result = await verifyAndSetNewPassword(formData);

    if (result?.error) {
      setServerError(result.error);
      setIsLoading(false);
    } else if (result?.redirectTo) {
      window.location.href = result.redirectTo; // Success! Hard redirect to dashboard
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div style={{ maxWidth: '450px', margin: '4rem auto', width: '100%' }}>
          
          <div className={styles.formCard} style={{ padding: '3rem 2rem' }}>

            {/* STEP 1 HEADER */}
            {step === 1 && (
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '56px', height: '56px', background: '#EEF2FF', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <Mail size={28} color="#4F46E5" />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', margin: '0 0 0.5rem 0' }}>Reset your password</h1>
                <p style={{ color: '#6B7280', fontSize: '0.95rem', margin: 0 }}>
                  Enter your email address and we&apos;ll send you a 6-digit code.
                </p>
              </div>
            )}

            {/* STEP 2 HEADER */}
            {step === 2 && (
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ width: '56px', height: '56px', background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <KeyRound size={28} color="#16A34A" />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', margin: '0 0 0.5rem 0' }}>Enter your code</h1>
                <p style={{ color: '#6B7280', fontSize: '0.95rem', margin: 0 }}>
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>
            )}

            {serverError && (
              <div style={{ color: '#92400E', backgroundColor: '#FFFBEB', padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid #FEF3C7', fontSize: '0.875rem' }}>
                {serverError}
              </div>
            )}

            {/* STEP 1 FORM */}
            {step === 1 && (
              <form onSubmit={handleRequestCode} className={styles.form}>
                <div className={styles.inputGroup} style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="email" className={styles.label}>Email Address</label>
                  <input id="email" name="email" type="email" required placeholder="you@example.com" className={styles.input} />
                </div>

                <button type="submit" className={styles.submitBtn} disabled={isLoading} style={{ width: '100%', marginBottom: '1.5rem' }}>
                  {isLoading ? 'Sending code...' : 'Send Reset Code'}
                </button>

                <div style={{ textAlign: 'center' }}>
                  <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.875rem', textDecoration: 'none', fontWeight: '500' }}>
                    <ArrowLeft size={16} /> Back to Login
                  </Link>
                </div>
              </form>
            )}

            {/* STEP 2 FORM */}
            {step === 2 && (
              <form onSubmit={handleUpdatePassword} className={styles.form}>
                <div className={styles.inputGroup} style={{ marginBottom: '1.5rem' }}>
                  <label htmlFor="code" className={styles.label}>6-Digit Code</label>
                  <input
                    id="code"
                    name="code"
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    className={styles.input}
                    style={{ fontSize: '1.25rem', letterSpacing: '0.25rem', textAlign: 'center', fontWeight: '700' }}
                  />
                </div>

                <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
                  <label htmlFor="password" className={styles.label}>New Password</label>
                  <input id="password" name="password" type="password" required minLength={6} placeholder="••••••••" className={styles.input} />
                </div>

                <div className={styles.inputGroup} style={{ marginBottom: '2rem' }}>
                  <label htmlFor="confirm_password" className={styles.label}>Confirm New Password</label>
                  <input id="confirm_password" name="confirm_password" type="password" required minLength={6} placeholder="••••••••" className={styles.input} />
                </div>

                <button type="submit" className={styles.submitBtn} disabled={isLoading} style={{ width: '100%', marginBottom: '1.5rem' }}>
                  {isLoading ? 'Updating...' : 'Save Password & Login'}
                </button>

                <div style={{ textAlign: 'center' }}>
                  <button type="button" onClick={() => { setStep(1); setServerError(''); }} style={{ background: 'none', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#6B7280', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer' }}>
                    <ArrowLeft size={16} /> Use a different email
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}