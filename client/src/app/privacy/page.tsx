import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/privacy', {
    title: 'Privacy Policy | AVORO',
    description: "Your data. Your privacy. Our full responsibility. Read AVORO's Privacy Policy.",
    keywords: ['privacy policy', 'AVORO privacy', 'data security'],
    canonical: 'https://avoro.in/privacy',
  });
}

export default function PrivacyPolicy() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: 'clamp(3rem,8vw,5rem) var(--page-pad)' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.18em', color: 'var(--gold-dark)', marginBottom: '0.75rem' }}>
            LEGAL
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem,6vw,3.5rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.05, marginBottom: '0.5rem' }}>
            Privacy Policy
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Last updated: 1 January 2025
          </p>
        </div>

        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.85 }}>
          <p style={{ marginBottom: '1.5rem', fontStyle: 'italic', color: 'var(--text-soft)' }}>
            Your data. Your privacy. Our full responsibility.
          </p>

          <p style={{ marginBottom: '1.75rem' }}>
            In simple words: We collect only what is necessary to run your order and improve your experience on avoro.in. We never sell your personal information to anyone. This page tells you exactly what we collect, why we collect it, how long we keep it, and what your rights are. If anything is unclear, write to us at privacy@avoro.in and we will explain it.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>1. Who We Are</h2>
          <p style={{ marginBottom: '1.25rem' }}>
            AVORO is a luxury fragrance and lifestyle brand based in New Delhi, India, operating through its website avoro.in. When you visit our website, create an account, or make a purchase, you share personal information with us. We understand that trust is the foundation of that exchange, and we take our responsibility to protect your data seriously.
          </p>
          <p style={{ marginBottom: '1.75rem' }}>
            For the purposes of data protection law in India, AVORO is the data controller responsible for your personal information. Our registered contact for privacy matters is privacy@avoro.in.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>2. What Information We Collect</h2>
          
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text)', marginTop: '1.5rem', marginBottom: '0.6rem' }}>2.1 Information you provide to us directly</h3>
          <p style={{ marginBottom: '1rem' }}>
            When you interact with AVORO — whether by placing an order, creating an account, subscribing to our newsletter, or contacting our team — you share personal information with us. This may include:
          </p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.25rem' }}>
            <li>Your full name and email address</li>
            <li>Your phone number and delivery address, including pin code, city, and state</li>
            <li>Your payment information — we do not store card numbers on our servers; payment is handled by Razorpay and Stripe</li>
            <li>Any messages, questions, or comments you send us</li>
            <li>Your preferences and fragrance choices if you save them to your account</li>
          </ul>

          <h3 style={{ fontSize: '1.1rem', color: 'var(--text)', marginTop: '1.5rem', marginBottom: '0.6rem' }}>2.2 Information we collect automatically</h3>
          <p style={{ marginBottom: '1rem' }}>
            When you browse avoro.in, certain technical information is collected automatically: IP address and approximate geographic location, browser type, pages visited, time spent, source of visit, and items added to your bag.
          </p>

          <h3 style={{ fontSize: '1.1rem', color: 'var(--text)', marginTop: '1.5rem', marginBottom: '0.6rem' }}>2.3 Cookies and tracking technologies</h3>
          <p style={{ marginBottom: '1.75rem' }}>
            We use essential cookies (required for the website to function), analytics cookies (Google Analytics 4 — aggregated and anonymised), and marketing cookies (Facebook Pixel and Google Ads, only with your consent). You can manage non-essential cookies in your browser settings.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>3. Legal Basis for Processing Your Data</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            We process your personal information on the following legal grounds: Contract (to fulfil your order), Legitimate interests (to improve our website), Consent (for marketing emails and non-essential cookies), and Legal obligation (GST, accounting, Consumer Protection Act, 2019).
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>4. How We Use Your Information</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            We use your information to process orders, send shipping updates, respond to enquiries, send marketing communications (only if opted in), personalise your experience, detect fraud, comply with legal obligations, and improve our website. We will never sell your data.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>5. Who We Share Your Data With</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            We share data only with trusted providers necessary to deliver our service: Razorpay & Stripe (payments), Shiprocket (shipping), Sanity.io, Supabase, Resend, Cloudinary, Google (Analytics), and Meta (with consent). We do not transfer data outside these relationships without appropriate safeguards.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>6. Data Retention</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            Account and order data: 5 years (GST compliance). Marketing subscriptions: until you unsubscribe. Customer service communications: 2 years. Analytics: anonymised for up to 26 months. After retention periods, data is permanently deleted.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>7. Your Rights</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            You have the right to access, correct, delete, withdraw consent, request data portability, and object to direct marketing. Email privacy@avoro.in with your request. We will respond within 7 business days.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>8. Data Security</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            We use HTTPS, PCI-DSS compliant payment processing, restricted internal access, and regular security reviews. No method of transmission is 100% secure, but we take every reasonable precaution.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>9. Children&apos;s Privacy</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            Our website and products are intended for adults 18+. We do not knowingly collect data from anyone under 18.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>10. Changes to This Policy</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            We may update this policy from time to time. Significant changes will be notified by email and the date at the top of this page will be updated.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>11. Contact for Privacy Matters</h2>
          <p style={{ marginBottom: '2rem' }}>
            Email: privacy@avoro.in<br />
            Address: AVORO, New Delhi, India<br />
            Response time: Within 48 hours on business days (Monday to Saturday)
          </p>
        </div>

        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border-soft)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          AVORO · New Delhi, India · 2025
        </div>
      </div>
    </div>
  );
}
