import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/shipping', {
    title: 'Shipping Policy | AVORO',
    description: "Fast, reliable delivery across India. Read AVORO's Shipping Policy.",
    keywords: ['shipping policy', 'AVORO delivery', 'perfume shipping india'],
    canonical: 'https://avoro.in/shipping',
  });
}

export default function ShippingPolicy() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: 'clamp(3rem,8vw,5rem) var(--page-pad)' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.18em', color: 'var(--gold-dark)', marginBottom: '0.75rem' }}>
            LEGAL
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem,6vw,3.5rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.05, marginBottom: '0.5rem' }}>
            Shipping Policy
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Last updated: 1 January 2025
          </p>
        </div>

        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.85 }}>
          <p style={{ marginBottom: '1.5rem', fontStyle: 'italic', color: 'var(--text-soft)' }}>
            We deliver with care. Every order is packed with attention and love.
          </p>

          <p style={{ marginBottom: '1.75rem' }}>
            In simple words: We ship all orders within 1–2 business days. Delivery across India usually takes 3–7 business days depending on your location. All orders are carefully packed and sent via trusted courier partners.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>1. Order Processing</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            All orders are processed and dispatched within 1–2 business days (Monday to Saturday, excluding public holidays) after payment confirmation. You will receive an order confirmation email immediately after placing your order, followed by a shipping confirmation with tracking details once your package is handed over to the courier.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>2. Shipping Partners & Delivery Time</h2>
          <p style={{ marginBottom: '1rem' }}>We partner with reliable courier services including:</p>
          <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.25rem' }}>
            <li>Shiprocket and its partner network</li>
            <li>Blue Dart, Delhivery, DTDC, and other premium carriers (as available by pin code)</li>
          </ul>
          <p style={{ marginBottom: '1.75rem' }}>
            Estimated delivery times (after dispatch):
            <br />• Metro cities (Delhi NCR, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad): 2–4 business days
            <br />• Tier-2 and Tier-3 cities: 4–7 business days
            <br />• Remote / North-East / J&K / Andaman & Nicobar: 6–10 business days
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>3. Shipping Charges</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            Shipping is free on all orders above ₹999. For orders below ₹999, a flat shipping fee of ₹99 is charged. This fee is clearly displayed at checkout before payment.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>4. Tracking Your Order</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            Once your order is shipped, you will receive an email and SMS with a tracking link. You can also track your order anytime from the "My Orders" section in your account (if you created one at checkout).
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>5. Delays & Exceptions</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            While we do everything possible to ensure timely delivery, AVORO is not responsible for delays caused by:
            <br />• Courier partners
            <br />• Severe weather, natural disasters, or strikes
            <br />• Incorrect or incomplete delivery address provided by the customer
            <br />• Public holidays or peak festive seasons
            <br />• Government restrictions or lockdowns
          </p>
          <p style={{ marginBottom: '1.75rem' }}>
            In case of significant delays, we will proactively reach out to you.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>6. Address & Delivery Issues</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            Please ensure your delivery address is complete and accurate, including pin code, landmark, and phone number. We are not responsible for packages delivered to the wrong address due to incorrect information provided at checkout. If a package is returned to us because of an incorrect address or failed delivery attempts, we may charge a re-shipping fee or issue a refund after deducting shipping costs.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>7. Contact for Shipping Queries</h2>
          <p style={{ marginBottom: '2rem' }}>
            Email: shipping@avoro.in<br />
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
