'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { MapPin, Mail, MessageCircle, Clock, Send, CheckCircle2 } from 'lucide-react';
import styles from '@/styles/contactPage.module.css';

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // 1. Grab the data from the form
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    try {
      // 2. Initialize Supabase client
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 3. Insert the message into the database
      const { error } = await supabase
        .from('contact_messages')
        .insert([
          {
            full_name: fullName,
            email: email,
            subject: subject,
            message: message,
          }
        ]);

      if (error) {
        console.error("Supabase Error:", error);
        alert("Failed to send message. Please try again.");
      } else {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.main}>

      {/* ── 1. HERO SECTION ── */}
      <section className={styles.heroSection}>
        <div className={styles.subtleTexture} aria-hidden="true" />
        <div className={styles.container}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>Get in Touch</div>
            <h1 className={styles.headline}>
              We are here to help you <br />
              <span className={styles.highlightLine}>build your empire.</span>
            </h1>
            <p className={styles.subheadline}>
              Whether you have a technical question, need help setting up your payouts, or want to discuss a partnership, our team in Monrovia is ready to support you.
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. CONTACT LAYOUT (Grid) ── */}
      <section className={styles.contactSection}>
        <div className={styles.container}>
          <div className={styles.contactLayout}>
            
            {/* Left Side: Contact Information */}
            <div className={styles.infoColumn}>
              <h2 className={styles.columnTitle}>Direct Contact</h2>
              <p className={styles.columnDesc}>
                Need an immediate answer? Reach out to us directly via WhatsApp or Email. We aim to respond to all inquiries within 2 hours during business hours.
              </p>

              <div className={styles.infoCards}>
                <a href="https://wa.me/231886678786" className={styles.infoCard} target="_blank" rel="noreferrer">
                  <div className={styles.iconGreen}><MessageCircle size={24} /></div>
                  <div>
                    <h3>WhatsApp Support</h3>
                    <p>+231 88 667 8786</p>
                  </div>
                </a>

                <a href="mailto:mzksipor@gmail.com" className={styles.infoCard}>
                  <div className={styles.iconRed}><Mail size={24} /></div>
                  <div>
                    <h3>Email Us</h3>
                    <p>mzksipor@gmail.com</p>
                  </div>
                </a>

                <div className={styles.infoCardStatic}>
                  <div className={styles.iconGold}><MapPin size={24} /></div>
                  <div>
                    <h3>Headquarters</h3>
                    <p>Monrovia, Montserrado<br />Liberia</p>
                  </div>
                </div>

                <div className={styles.infoCardStatic}>
                  <div className={styles.iconDark}><Clock size={24} /></div>
                  <div>
                    <h3>Business Hours</h3>
                    <p>Monday - Friday<br />9:00 AM - 5:00 PM (GMT)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Contact Form */}
            <div className={styles.formColumn}>
              <div className={styles.formWrapper}>
                {isSuccess ? (
                  <div className={styles.successState}>
                    <div className={styles.successIcon}><CheckCircle2 size={48} /></div>
                    <h3>Message Sent!</h3>
                    <p>Thank you for reaching out. A member of our team will get back to you shortly.</p>
                    <button onClick={() => setIsSuccess(false)} className={styles.resetBtn}>
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className={styles.contactForm}>
                    <h2 className={styles.formTitle}>Send a Message</h2>
                    
                    <div className={styles.inputGroup}>
                      <label htmlFor="name">Full Name</label>
                      <input type="text" id="name" name="name" required placeholder="Jane Doe" />
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="email">Email Address</label>
                      <input type="email" id="email" name="email" required placeholder="jane@example.com" />
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="subject">What is this regarding?</label>
                      <select id="subject" name="subject" required>
                        <option value="">Select a topic...</option>
                        <option value="support">Technical Support</option>
                        <option value="payouts">Payments & Payouts</option>
                        <option value="partnership">Partnership Inquiry</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="message">Your Message</label>
                      <textarea id="message" name="message" rows={5} required placeholder="How can we help you today?"></textarea>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                      {isSubmitting ? 'Sending...' : (
                        <>Send Message <Send size={18} /></>
                      )}
                    </button>
                    <p className={styles.formDisclaimer}>
                      By submitting this form, you agree to our <Link href="/privacy">Privacy Policy</Link>.
                    </p>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
}