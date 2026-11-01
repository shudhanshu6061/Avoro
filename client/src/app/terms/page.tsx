import type { Metadata } from 'next';
import { getPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/terms', {
    title: 'Terms & Conditions | AVORO',
    description: 'Terms and Conditions for using avoro.in and purchasing from AVORO.',
    keywords: ['terms and conditions', 'AVORO terms', 'legal'],
    canonical: 'https://avoro.in/terms',
  });
}

export default function TermsConditions() {
  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto', padding: 'clamp(3rem,8vw,5rem) var(--page-pad)' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.72rem', letterSpacing: '0.18em', color: 'var(--gold-dark)', marginBottom: '0.75rem' }}>
            LEGAL
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.4rem,6vw,3.5rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.05, marginBottom: '0.5rem' }}>
            Terms &amp; Conditions
          </h1>
          <p style={{ fontFamily: 'var(--font-ui)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Last updated: 1 January 2025
          </p>
        </div>

        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.95rem', color: 'var(--text-mid)', lineHeight: 1.85 }}>
          <p style={{ marginBottom: '1.5rem', fontStyle: 'italic', color: 'var(--text-soft)' }}>
            Please read these terms carefully before using avoro.in or making a purchase.
          </p>

          <p style={{ marginBottom: '1.75rem' }}>
            These Terms and Conditions ("Terms") govern your use of the website avoro.in and any purchase you make through it. By accessing or using our website, placing an order, or creating an account, you agree to be bound by these Terms. If you do not agree, please do not use the website.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>1. About AVORO</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            AVORO is a luxury fragrance brand based in New Delhi, India. We operate exclusively through avoro.in. All references to "we", "us", "our", or "AVORO" refer to the brand and its operators.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>2. Eligibility</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            You must be at least 18 years of age to use this website or make a purchase. By using the site, you represent and warrant that you are 18 or older and have the legal capacity to enter into these Terms.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>3. Account Registration</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            You may create an account to place orders and track your purchases. You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. Please notify us immediately at hello@avoro.in if you suspect any unauthorised use of your account.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>4. Orders and Payment</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            All orders are subject to availability and acceptance by us. We reserve the right to refuse or cancel any order for any reason, including but not limited to product unavailability, pricing errors, or suspected fraudulent activity.
          </p>
          <p style={{ marginBottom: '1.75rem' }}>
            Payment is processed securely through Razorpay or Stripe. By placing an order, you confirm that you are the authorised holder of the payment method being used and that sufficient funds are available.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>5. Product Descriptions and Availability</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            We make every reasonable effort to ensure that product descriptions, notes, ingredient lists, photography, and pricing on avoro.in are accurate. However, we do not guarantee that the website is completely free from errors. Product images are for illustrative purposes only. Slight variations in colour or packaging due to screen settings or production batches are not considered defects.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>6. Fragrance and Allergen Disclosure</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            All AVORO fragrances are Eau de Parfum and contain a proprietary blend of natural and synthetic ingredients, including potential allergens. A full INCI ingredient list is published on each product page. We recommend performing a patch test before full use. Our products are not tested on animals and are not intended for children under 3 years of age.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>7. Intellectual Property</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            All content on avoro.in — including the AVORO name and logo, fragrance names, photography, copywriting, design, and brand identity — is the exclusive property of AVORO and is protected under Indian copyright and trademark law. You may not reproduce, copy, distribute, or create derivative works for commercial purposes without prior written consent.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>8. User-Generated Content</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            If you share reviews, photographs, or other content related to AVORO on our website or social media, you grant AVORO a non-exclusive, royalty-free, worldwide licence to use, reproduce, and display that content for marketing purposes (with credit where possible). You may withdraw this permission at any time by contacting us.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>9. Limitation of Liability</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            To the fullest extent permitted by Indian law, AVORO and its directors, employees, and partners are not liable for indirect, incidental, special, consequential, or punitive losses, including loss of profit, data, or goodwill. Our total liability for any claim is limited to the amount you paid for the relevant product in that transaction. Nothing in these terms limits liability for death or personal injury caused by negligence or for fraud.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>10. Indemnity</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            You agree to indemnify and hold harmless AVORO and its officers, directors, employees, and agents from any claims, damages, losses, or expenses (including legal fees) arising from your breach of these Terms, violation of law, or infringement of third-party rights.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>11. Third-Party Links</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            Our website may contain links to third-party websites or social media platforms. We do not control these external sites and are not responsible for their content or practices. The inclusion of a link does not imply endorsement.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>12. Governing Law and Dispute Resolution</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            These Terms are governed by the laws of India. Any dispute arising out of or relating to these Terms or your use of avoro.in shall be subject to the exclusive jurisdiction of the courts of New Delhi, India.
          </p>
          <p style={{ marginBottom: '1.75rem' }}>
            Before initiating formal legal proceedings, we ask that you contact us at hello@avoro.in so we can attempt to resolve the matter directly. You also retain the right to approach the relevant consumer forum under the Consumer Protection Act, 2019, or use the Online Dispute Resolution mechanism at consumerhelpline.gov.in.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>13. Severability</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            If any clause of these Terms is found to be invalid or unenforceable, that clause will be modified to the minimum extent necessary or severed. The remaining clauses will continue in full force.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>14. Entire Agreement</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            These Terms, together with our Privacy Policy, Refund and Returns Policy, and Shipping Policy, constitute the entire agreement between you and AVORO regarding your use of avoro.in and any purchases made through it.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>15. Changes to These Terms</h2>
          <p style={{ marginBottom: '1.75rem' }}>
            We reserve the right to update these Terms at any time. When we make significant changes, we will notify you by email and update the date at the top of this page. Your continued use of avoro.in after changes constitutes acceptance of the updated Terms.
          </p>

          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: 'var(--text)', marginTop: '2.5rem', marginBottom: '0.85rem' }}>16. Contact Us</h2>
          <p style={{ marginBottom: '2rem' }}>
            Email: hello@avoro.in<br />
            Legal and compliance: legal@avoro.in<br />
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
