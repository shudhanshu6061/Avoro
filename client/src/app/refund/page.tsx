import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/refund', {
    title: 'Refund & Returns Policy | AVORO',
    description: "15-day returns. Full refund. No complicated process. Read AVORO's Refund & Returns Policy.",
    keywords: ['refund policy', 'return policy', 'AVORO returns'],
    canonical: 'https://avoro.in/refund',
  });
}

export default function RefundReturnsPolicy() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: 'clamp(3rem,8vw,5rem) var(--page-pad)' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.18em', color: 'var(--gold-dark)', marginBottom: '0.75rem' }}>
            LEGAL
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem,6vw,3.5rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.05, marginBottom: '0.5rem' }}>
            Refund & Returns Policy
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Last updated: 1 January 2025
          </p>
        </div>

        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.85 }}>
          <p style={{ marginBottom: '1.5rem', fontStyle: 'italic', color: 'var(--text-soft)' }}>
            We want you to love your purchase. If you don&apos;t, here is what we do.
          </p>

          <p style={{ marginBottom: '1.75rem' }}>
            In simple words: You have 15 days from the date of delivery to return any AVORO product. The bottle must be at least 80% full. We refund you completely — to your original payment method — within 3 to 5 business days of receiving the return. No complicated process. We believe in what we make, and we want you to feel safe trying it.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>1. Return Window</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            You may initiate a return within 15 calendar days from the date of delivery. We do not accept returns after this period.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>2. Return Conditions</h2>
          <p style={{ marginBottom: '1rem' }}>To be eligible for a return, the product must meet all of the following conditions:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.25rem' }}>
            <li>The bottle must be at least 80% full (we cannot accept nearly empty or fully used bottles)</li>
            <li>The product must be in its original packaging with all seals, labels, and outer box intact</li>
            <li>The product must not be damaged, tampered with, or altered in any way</li>
            <li>You must provide the original order number or proof of purchase</li>
          </ul>
          <p style={{ marginBottom: '1.75rem' }}>
            Due to the nature of fragrance products (personal care items), we can only accept returns where the above conditions are strictly met.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>3. How to Initiate a Return</h2>
          <p style={{ marginBottom: '1rem' }}>Email us at returns@avoro.in with the following details:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.25rem' }}>
            <li>Order number</li>
            <li>Product name and quantity</li>
            <li>Reason for return</li>
            <li>Photos of the product and packaging (if applicable)</li>
          </ul>
          <p style={{ marginBottom: '1.75rem' }}>
            We will respond within 48 hours on business days with return instructions and a return shipping label (if applicable).
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>4. Refund Timeline</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            Once we receive and inspect your return, we will process the refund to your original payment method within 3 to 5 business days. You will receive an email confirmation when the refund is issued. Actual credit to your account may take an additional 5–10 business days depending on your bank or payment provider.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>5. Return Shipping</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            Return shipping costs are the responsibility of the customer, except in cases where the return is due to a defect or an error on our part (wrong product, damaged in transit, etc.). In such cases, we will provide a prepaid return label.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>6. Non-Returnable Items</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            We do not accept returns on: gift cards, opened or used products, products purchased during final sale or clearance events (if explicitly marked as non-returnable), and products returned after the 15-day window.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>7. Damaged or Defective Products</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            If your order arrives damaged or you receive the wrong item, please contact us within 48 hours of delivery at returns@avoro.in with photos. We will arrange a replacement or full refund at no cost to you.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>8. Contact</h2>
          <p style={{ marginBottom: '2rem' }}>
            Email: returns@avoro.in<br />
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
