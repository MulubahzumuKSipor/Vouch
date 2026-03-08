'use client'

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { updatePassword } from '@/lib/action';
import styles from '@/styles/auth.module.css';

export default function UpdatePasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError('');

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirm = formData.get('confirm_password') as string;

    if (password !== confirm) {
      setServerError("Passwords do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    const result = await updatePassword(formData);

    if (result?.error) {
      setServerError(result.error);
      setIsLoading(false);
    } else if (result?.redirectTo) {
      window.location.href = result.redirectTo; // Force a hard redirect to refresh session state
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <div style={{ maxWidth: '450px', margin: '4rem auto', width: '100%' }}>
          
          <div className={styles.formCard} style={{ padding: '3rem 2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ width: '56px', height: '56px', background: '#F0FDF4', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <Lock size={28} color="#16A34A" />
              </div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', margin: '0 0 0.5rem 0' }}>Set new password</h1>
              <p style={{ color: '#6B7280', fontSize: '0.95rem', margin: 0 }}>
                Please enter your new password below.
              </p>
            </div>

            {serverError && (
              <div style={{ color: '#92400E', backgroundColor: '#FFFBEB', padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', border: '1px solid #FEF3C7', fontSize: '0.875rem' }}>
                {serverError}
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup} style={{ marginBottom: '1rem' }}>
                <label htmlFor="password" className={styles.label}>New Password</label>
                <input id="password" name="password" type="password" required minLength={6} placeholder="••••••••" className={styles.input} />
              </div>

              <div className={styles.inputGroup} style={{ marginBottom: '2rem' }}>
                <label htmlFor="confirm_password" className={styles.label}>Confirm New Password</label>
                <input id="confirm_password" name="confirm_password" type="password" required minLength={6} placeholder="••••••••" className={styles.input} />
              </div>

              <button type="submit" className={styles.submitBtn} disabled={isLoading} style={{ width: '100%' }}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}