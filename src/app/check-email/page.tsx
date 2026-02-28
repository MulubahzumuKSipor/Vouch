import Link from 'next/link';
import { MailCheck, AlertCircle, ArrowLeft } from 'lucide-react';
import styles from '@/styles/auth.module.css'; // Reusing your existing auth styles

export default function CheckEmailPage() {
  return (
    <div className={styles.pageWrapper}>
      {/* Decorative African Pattern Background */}
      <div className={styles.patternOverlay}></div>

      <div className={styles.container} style={{ justifyContent: 'center' }}>
        <div className={styles.formCard} style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center', padding: '3rem 2rem' }}>

          {/* Animated Icon */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              backgroundColor: '#ECFDF5',
              padding: '1.5rem',
              borderRadius: '50%',
              boxShadow: '0 4px 6px rgba(5, 150, 105, 0.1)'
            }}>
              <MailCheck size={48} color="#059669" />
            </div>
          </div>

          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
            Verify your email
          </h1>

          <p style={{ color: '#4B5563', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
            We&apos;ve sent a magic link to your email address.
            Click the link inside to instantly activate your Vouch account.
          </p>

          {/* High-visibility Spam Warning */}
          <div style={{
            backgroundColor: '#FFFBEB',
            border: '1px solid #FEF3C7',
            padding: '1.25rem',
            borderRadius: '12px',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
            textAlign: 'left',
            marginBottom: '2.5rem'
          }}>
            <AlertCircle size={24} color="#B45309" style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '0.95rem', color: '#92400E', margin: 0, lineHeight: '1.5' }}>
              <strong>Don&apos;t see it?</strong> It might take a minute to arrive. Be sure to check your <strong>Spam or Junk</strong> folder, as sometimes our emails get misrouted!
            </p>
          </div>

          <Link
            href="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#4B5563',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'color 0.2s'
            }}
          >
            <ArrowLeft size={18} />
            Back to Sign In
          </Link>

        </div>
      </div>
    </div>
  );
}