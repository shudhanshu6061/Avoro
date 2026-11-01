import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import FaqAccordion from './FaqAccordion';

import { getPageMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata('/about', {
    title: 'About AVORO | The Art of Being Remembered',
    description: 'Discover the philosophy behind AVORO and our pursuit of timeless fragrances that leave lasting impressions.',
    keywords: ['about AVORO', 'artisanal perfume india', 'luxury fragrance house', 'perfumery craftsmanship'],
    canonical: 'https://avoro.in/about',
  });
}

const EB: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.68rem',
  fontWeight: 600,
  letterSpacing: '0.22em',
  textTransform: 'uppercase' as const,
  color: 'var(--gold-dark)',
};

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--bg)', overflowX: 'hidden' }}>

      {/* ══ HERO SECTION ════════════════════════════════════ */}
      <section className="about-hero">
        {/* Subtle Ambient Radial Glows */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="about-ambient-glow1" />
          <div className="about-ambient-glow2" />
        </div>

        <div className="lumina-container about-hero-container">
          <div className="about-hero-badge" style={{ ...EB, marginBottom: '1.25rem' }}>
            <span>✦</span> About AVORO <span>✦</span>
          </div>

          <h1 className="about-hero-title">
            <span className="hero-line1">More than fragrance.</span>
            <br />
            <span className="hero-line2">A feeling that stays.</span>
          </h1>

          <p className="about-hero-sub">
            Homegrown in Mirzapur. Formulated with authentic, ethically sourced raw ingredients. Crafting timeless Indian luxury fragrances designed to be remembered.
          </p>
        </div>
      </section>

      {/* ══ THE HONEST VERSION ════════════════════════════ */}
      <section className="about-section about-section-light">
        <div className="lumina-container">
          <div className="about-grid">
            {/* Text Column */}
            <div>
              <div style={{ ...EB, marginBottom: '0.75rem' }}>OUR ORIGINS</div>
              <h2 className="about-heading">
                The Honest Version
              </h2>

              <div className="about-quote-box">
                "Let's skip the part where we tell you we're 'redefining luxury' and 'disrupting the industry.' You've read that before. Here's what's actually true."
              </div>

              <div className="about-body-text">
                <p>
                  We are a homegrown perfume brand from Mirzapur. We make four Eau de Parfum fragrances, each one developed over months, not weeks, with real ingredients sourced from the places they actually come from. Bulgarian rose from Bulgaria. Saffron from Kashmir. Sandalwood the way it smells in India, which is different from anywhere else in the world. Oud that's been properly cured, not cut with synthetics and marked up.
                </p>
                <p>
                  We are not cheap. We are not trying to be. If you want a Rs. 500 perfume, there are hundreds of those. If you want something that makes people ask what you're wearing three hours after you put it on — that's what we make.
                </p>
                <p>
                  AVORO is a new Indian perfume brand, launched in 2026, and we are aware that trust takes time. We're not asking you to take our word for it. We made the Discovery Set specifically so you don't have to.
                </p>
              </div>
            </div>

            {/* Premium Image Container */}
            <div className="about-image-wrapper">
              <Image 
                src="/images/bg-about.png" 
                alt="AVORO perfume bottles on a textured pedestal" 
                fill 
                sizes="(max-width: 900px) 100vw, 45vw"
                style={{ objectFit: 'cover' }}
                className="about-zoom-image"
                priority
              />
              <div className="about-image-overlay" />
              <div className="about-image-badge">
                Homegrown in Mirzapur
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHY THIS, WHY NOW (DARK CONTRAST) ═══════════════ */}
      <section className="about-section about-section-dark">
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="about-dark-ambient" />
        </div>

        <div className="lumina-container" style={{ position: 'relative' }}>
          <div className="about-grid about-grid-reverse">
            {/* Image Column */}
            <div className="about-image-wrapper">
              <Image 
                src="/images/perfume-heritage.png" 
                alt="AVORO Blue Amber Eau De Parfum luxury perfume bottle" 
                fill 
                sizes="(max-width: 900px) 100vw, 45vw"
                style={{ objectFit: 'cover' }}
                className="about-zoom-image"
              />
              <div className="about-image-overlay-dark" />
              <div className="about-image-badge dark">
                Indian Perfumery Reimagined
              </div>
            </div>

            {/* Text Column */}
            <div>
              <div style={{ ...EB, color: 'var(--gold)', marginBottom: '0.75rem' }}>HERITAGE & CRAFT</div>
              <h2 className="about-heading dark">
                Why This, Why Now
              </h2>

              <div className="about-body-text dark">
                <p>
                  India has been making the world's finest fragrances for over three thousand years. The attar makers of Kannauj have been distilling scent from flowers since before perfume existed as a European concept. Saffron, jasmine, sandalwood, oud — these are Indian ingredients, traded globally, used in the world's most expensive fragrances, and almost never credited. When you buy a French perfume that contains Indian sandalwood, the bottle says Paris. The sandalwood says nothing. We thought that was worth changing.
                </p>
                <p>
                  AVORO is a made-in-India luxury perfume brand that doesn't apologise for being Indian and doesn't dress itself up in borrowed European aesthetics to seem credible. The warmth in our fragrances is Indian warmth. The depth is the depth of Indian cities at night. The intimacy is the particular kind of closeness that comes from a culture where fragrance has always been personal, not performative. We are proud of where we come from. We think it makes us better at this, not less legitimate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ MISSION & VISION ══════════════════════════════ */}
      <section className="about-section about-section-soft">
        <div className="lumina-container">
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem, 5vw, 4rem)' }}>
            <div style={{ ...EB, marginBottom: '0.5rem' }}>OUR PURPOSE</div>
            <h2 className="about-heading" style={{ margin: 0 }}>
              Our Mission & Vision
            </h2>
          </div>

          <div className="about-mission-grid">
            {/* Mission Card */}
            <div className="about-mission-card">
              <div>
                <div className="about-card-badge">
                  01 · MISSION
                </div>
                <p className="about-card-title">
                  To make fragrances that hold the feeling of a moment after the moment has ended.
                </p>
              </div>
              <p className="about-card-desc">
                AVORO exists for the people who understand that the most meaningful things in life are invisible — and that sometimes, the only thing that stays is a scent.
              </p>
            </div>

            {/* Vision Card */}
            <div className="about-mission-card">
              <div>
                <div className="about-card-badge">
                  02 · VISION
                </div>
                <p className="about-card-title">
                  To build the fragrance house that shows the world what Indian luxury actually smells like.
                </p>
              </div>
              <p className="about-card-desc">
                Not a copy of European perfumery, but something rooted in the specific warmth, depth, and emotional intelligence of this country. The next great luxury fragrance brand will come from India. We are building it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ WHY YOU CAN TRUST AVORO ════════════════════════ */}
      <section className="about-section about-section-light">
        <div className="lumina-container">
          <div style={{ maxWidth: '800px', margin: '0 auto clamp(2.5rem, 5vw, 4rem)', textAlign: 'center' }}>
            <div style={{ ...EB, marginBottom: '0.5rem' }}>TRANSPARENCY & INTEGRITY</div>
            <h2 className="about-heading" style={{ marginBottom: '1rem' }}>
              Why You Can Trust AVORO
            </h2>
            <p className="about-subtitle">
              This is the part of an About page where most brands put a list of awards they've won and celebrities who use the product. We don't have those yet. We're being honest with you about that.
            </p>
            <div className="about-divider-tag">
              <span className="line" />
              <span>What we have instead</span>
              <span className="line" />
            </div>
          </div>

          <div className="about-trust-grid">
            {[
              {
                title: 'Real ingredients, named on every bottle.',
                text: 'Every AVORO fragrance comes with a full ingredient list in INCI format on the product page. We tell you exactly what you\'re wearing — Bulgarian rose absolute, Indian saffron, Mysore sandalwood, benzoin, vetiver. No vague "fragrance accord" language. No hiding cheap synthetics behind a premium price.'
              },
              {
                title: 'A trial mechanism with no catch.',
                text: 'The AVORO Discovery Set gives you all four fragrances in 8ml travel sizes. The full amount you pay is redeemable against any full-size bottle. Not a percentage. Not a voucher code that expires in 30 days. The full amount, against any product, with no minimum spend. We made this because we believe in what we make — and we wanted to remove every reason not to try it.'
              },
              {
                title: 'A return policy that\'s actually fair.',
                text: 'If you buy a full-size bottle and it\'s not right for you, you have 15 days to return it. The bottle needs to be at least 80% full — meaning you\'ve genuinely tried it, not just smelled it once. We refund you completely to your original payment method. No questions asked and no complicated process.'
              },
              {
                title: 'Direct access to the founder.',
                text: 'AVORO is a small team. Shivam reads the emails. If you write to us at hello@avoro.in, a person who actually cares about this brand will reply. Not a templated response from a customer service tool. We\'re not big enough for that yet and honestly, we don\'t want to be.'
              }
            ].map((item, index) => (
              <div key={item.title} className="about-trust-card">
                <span className="about-trust-num">{`0${index + 1}`}</span>
                <div className="about-trust-line" />
                <h3 className="about-trust-title">
                  {item.title}
                </h3>
                <p className="about-trust-desc">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ SECTION ═══════════════════════════════════ */}
      <section className="about-section about-section-soft" style={{
        borderTop: '1px solid var(--border-soft)',
        borderBottom: '1px solid var(--border-soft)',
      }}>
        <div className="lumina-container">
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2.5rem, 5vw, 3.5rem)' }}>
            <div style={{ ...EB, marginBottom: '0.5rem' }}>GOT QUESTIONS?</div>
            <h2 className="about-heading" style={{ margin: 0 }}>
              Frequently Asked Questions
            </h2>
          </div>

          <FaqAccordion />
        </div>
      </section>

      {/* ══ CLOSING CTA SECTION ═══════════════════════════ */}
      <section className="about-closing-section">
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div className="about-closing-glow" />
        </div>

        <div className="lumina-container" style={{ position: 'relative', maxWidth: '780px', marginInline: 'auto' }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--gold-dark)' }}>✦</span>
          </div>
          
          <h2 className="about-closing-title">
            AVORO is not for everyone.
          </h2>
          
          <div className="about-closing-body">
            <p>
              It's for the person who has smelled enough generic "luxury" to know what's missing from it. Who understands that a fragrance that costs something should do something — stay, provoke a feeling, make someone turn around when you walk past them.
            </p>
            <p className="highlight">
              If that's you, you're in the right place.
            </p>
            <p className="italic">
              And if you're not sure yet — the Discovery Set is waiting.
            </p>
          </div>

          <div className="about-cta-container">
            <Link href="/collection" className="lumina-btn-gold about-cta-btn">
              Start with the Discovery Set →
            </Link>
            <Link href="/collection" className="lumina-btn-ghost about-cta-btn dark">
              Explore the collection →
            </Link>
          </div>
        </div>
      </section>

      {/* ══ RESPONSIVE & SCOPED STYLES ══════════════════════ */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Hero Styling */
        .about-hero {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: clamp(4.5rem, 10vw, 8rem) var(--page-pad);
          position: relative;
          overflow: hidden;
          background: linear-gradient(180deg, #FBF9F6 0%, #F1E7DA 100%);
        }
        .about-hero-container {
          position: relative;
          max-width: 950px;
          margin: 0 auto;
          animation: aboutFadeUp 1s cubic-bezier(0.2,0.8,0.2,1) both;
        }
        .about-hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 1.1rem;
          background: rgba(212,175,136,0.12);
          border: 1px solid rgba(184,146,74,0.3);
          border-radius: 40px;
          backdrop-filter: blur(8px);
        }
        .about-hero-title {
          font-family: var(--font-display);
          font-size: clamp(2.1rem, 5.5vw, 4.8rem);
          font-weight: 800;
          color: #1a1209;
          line-height: 1.25;
          letter-spacing: -0.03em;
          margin: 0 0 1.5rem 0;
        }
        .hero-line1 {
          display: inline-block;
          color: #1a1209;
          padding-bottom: 0.1em;
        }
        .hero-line2 {
          display: inline-block;
          font-style: italic;
          background: linear-gradient(90deg, #b8832f 0%, #e8cc97 45%, #d4af88 60%, #a7731a 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          padding-bottom: 0.25em;
          padding-top: 0.05em;
          padding-inline: 0.05em;
          margin-bottom: -0.2em;
          animation: avoroShine 7s ease-in-out infinite;
          filter: drop-shadow(0 6px 12px rgba(26,18,9,0.1));
        }
        .about-hero-sub {
          font-family: var(--font-ui);
          font-size: clamp(0.95rem, 1.8vw, 1.15rem);
          color: var(--text-mid);
          max-width: 680px;
          margin: 0 auto;
          line-height: 1.7;
          font-weight: 300;
        }

        .about-ambient-glow1 {
          position: absolute;
          top: -15%;
          left: 50%;
          transform: translateX(-50%);
          width: min(700px, 90vw);
          height: min(700px, 90vw);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(212,175,136,0.22) 0%, rgba(212,175,136,0.08) 35%, transparent 70%);
          filter: blur(50px);
          pointer-events: none;
        }
        .about-ambient-glow2 {
          position: absolute;
          bottom: -20%;
          right: -10%;
          width: min(500px, 60vw);
          height: min(500px, 60vw);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,149,138,0.12) 0%, transparent 65%);
          filter: blur(40px);
          pointer-events: none;
        }

        /* Section Layouts */
        .about-section {
          padding-block: clamp(3rem, 7vw, 6.5rem);
          position: relative;
        }
        .about-section-light {
          background: var(--bg);
        }
        .about-section-soft {
          background: var(--bg-soft);
        }
        .about-section-dark {
          background: linear-gradient(180deg, #0F0D0A 0%, #171410 100%);
          color: #F5EFE6;
          overflow: hidden;
        }

        .about-heading {
          font-family: var(--font-display);
          font-size: clamp(1.75rem, 3.5vw, 3rem);
          font-weight: 700;
          color: var(--text);
          line-height: 1.15;
          margin-bottom: 1.5rem;
          letter-spacing: -0.02em;
        }
        .about-heading.dark {
          color: #F5EFE6;
        }

        .about-subtitle {
          font-family: var(--font-ui);
          font-size: clamp(0.9rem, 1.8vw, 1.05rem);
          color: var(--text-mid);
          line-height: 1.75;
          font-weight: 300;
          margin-bottom: 1.5rem;
        }

        .about-quote-box {
          font-family: var(--font-ui);
          font-size: clamp(0.95rem, 1.6vw, 1.15rem);
          color: var(--text);
          line-height: 1.7;
          font-weight: 400;
          font-style: italic;
          margin-bottom: 1.75rem;
          border-left: 3px solid var(--gold-dark);
          padding-left: 1.25rem;
          background: rgba(212,175,136,0.06);
          padding-block: 0.85rem;
          border-radius: 0 8px 8px 0;
        }

        .about-body-text {
          font-family: var(--font-ui);
          font-size: clamp(0.88rem, 1.6vw, 0.95rem);
          color: var(--text-mid);
          line-height: 1.85;
          font-weight: 300;
        }
        .about-body-text p {
          margin-bottom: 1.25rem;
        }
        .about-body-text p:last-child {
          margin-bottom: 0;
        }
        .about-body-text.dark {
          color: rgba(245,239,230,0.8);
        }

        .about-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: clamp(2rem, 5vw, 4.5rem);
          align-items: center;
        }

        /* Image Containers */
        .about-image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 4/5;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-soft);
          background: var(--bg-soft);
        }
        .about-zoom-image {
          transition: transform 0.8s var(--ease);
        }
        .about-image-wrapper:hover .about-zoom-image {
          transform: scale(1.04);
        }
        .about-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.3) 100%);
          pointer-events: none;
        }
        .about-image-overlay-dark {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.5) 100%);
          pointer-events: none;
        }
        .about-image-badge {
          position: absolute;
          bottom: 1.25rem;
          left: 1.25rem;
          font-family: var(--font-ui);
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.95);
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(10px);
          padding: 0.4rem 0.9rem;
          border-radius: 30px;
          border: 1px solid rgba(255,255,255,0.2);
        }
        .about-image-badge.dark {
          border-color: rgba(212,175,136,0.3);
          color: var(--gold-light);
        }

        .about-dark-ambient {
          position: absolute;
          bottom: -10%;
          left: -10%;
          width: 60vw;
          height: 60vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(184,146,74,0.08) 0%, transparent 60%);
          filter: blur(50px);
        }

        /* Mission & Vision */
        .about-mission-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: clamp(1.25rem, 3vw, 2rem);
        }
        .about-mission-card {
          padding: clamp(1.75rem, 4vw, 2.75rem);
          background: var(--bg-card);
          border: 1px solid var(--border-soft);
          border-radius: 16px;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.35s var(--ease), box-shadow 0.35s var(--ease), border-color 0.35s var(--ease);
        }
        .about-mission-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: var(--gold);
        }
        .about-card-badge {
          font-family: var(--font-ui);
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--gold-dark);
          margin-bottom: 1.25rem;
          display: inline-block;
          border-bottom: 1px solid var(--gold);
          padding-bottom: 0.25rem;
        }
        .about-card-title {
          font-family: var(--font-display);
          font-size: clamp(1.1rem, 2.2vw, 1.45rem);
          color: var(--text);
          line-height: 1.4;
          font-weight: 500;
          letter-spacing: -0.01em;
          margin-bottom: 1.25rem;
        }
        .about-card-desc {
          font-family: var(--font-ui);
          font-size: 0.9rem;
          color: var(--text-soft);
          line-height: 1.75;
          font-weight: 300;
          margin-bottom: 0;
        }

        /* Trust Section */
        .about-divider-tag {
          font-family: var(--font-ui);
          font-size: 0.68rem;
          font-weight: 600;
          color: var(--gold-dark);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }
        .about-divider-tag .line {
          width: 30px;
          height: 1px;
          background: var(--gold-dark);
          opacity: 0.4;
        }

        .about-trust-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: clamp(1rem, 2.5vw, 1.5rem);
        }
        .about-trust-card {
          position: relative;
          padding: 2rem 1.5rem;
          text-align: left;
          background: rgba(255,255,255,0.75);
          backdrop-filter: blur(10px);
          border: 1px solid var(--border-soft);
          border-radius: 14px;
          box-shadow: var(--shadow-sm);
          transition: transform 0.35s var(--ease), border-color 0.35s var(--ease);
          display: flex;
          flex-direction: column;
        }
        .about-trust-card:hover {
          transform: translateY(-4px);
          border-color: var(--gold);
        }
        .about-trust-num {
          position: absolute;
          top: 1rem;
          right: 1.25rem;
          font-family: var(--font-display);
          font-size: 1.8rem;
          font-weight: 300;
          color: var(--gold-dark);
          opacity: 0.25;
          line-height: 1;
        }
        .about-trust-line {
          width: 24px;
          height: 2px;
          background: var(--gold-dark);
          margin-bottom: 1.25rem;
          border-radius: 1px;
        }
        .about-trust-title {
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 0.75rem;
          line-height: 1.35;
        }
        .about-trust-desc {
          font-family: var(--font-ui);
          font-size: 0.86rem;
          color: var(--text-soft);
          line-height: 1.8;
          font-weight: 300;
          margin: 0;
        }

        /* Closing Section */
        .about-closing-section {
          padding-block: clamp(4.5rem, 10vw, 8.5rem);
          background: linear-gradient(180deg, #0A0A0A 0%, #16120C 50%, #0A0A0A 100%);
          textAlign: center;
          position: relative;
          overflow: hidden;
          color: #f5ede2;
          text-align: center;
        }
        .about-closing-glow {
          position: absolute;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: min(600px, 85vw);
          height: min(600px, 85vw);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(184,146,74,0.14) 0%, transparent 60%);
          filter: blur(40px);
        }
        .about-closing-title {
          font-family: var(--font-display);
          font-size: clamp(1.8rem, 4vw, 3.2rem);
          font-weight: 700;
          font-style: italic;
          color: #f5ede2;
          line-height: 1.2;
          letter-spacing: -0.02em;
          margin-bottom: 1.5rem;
        }
        .about-closing-body {
          font-family: var(--font-ui);
          font-size: clamp(0.9rem, 1.8vw, 1.02rem);
          color: rgba(245,237,226,0.7);
          line-height: 1.85;
          font-weight: 300;
          margin-bottom: 2.5rem;
        }
        .about-closing-body p {
          margin-bottom: 1rem;
        }
        .about-closing-body .highlight {
          color: #fff;
          font-weight: 400;
        }
        .about-closing-body .italic {
          font-style: italic;
        }

        .about-cta-container {
          display: flex;
          flex-wrap: wrap;
          gap: 1.25rem;
          justify-content: center;
          align-items: center;
        }
        .about-cta-btn {
          font-size: 0.72rem;
          padding: 0.95rem 2.25rem;
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        .about-cta-btn.dark {
          color: #f5ede2;
          border-color: rgba(245,237,226,0.3);
        }

        /* ── Media Queries for Mobile & Tablet Optimization ── */
        @media (max-width: 1024px) {
          .about-trust-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 900px) {
          .about-grid {
            grid-template-columns: 1fr;
            gap: 2.25rem;
          }
          .about-grid-reverse {
            display: flex;
            flex-direction: column-reverse;
          }
          .about-image-wrapper {
            aspect-ratio: 4/3;
            max-height: 380px;
          }
          .about-mission-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .about-trust-grid {
            grid-template-columns: 1fr;
          }
          .about-cta-container {
            flex-direction: column;
            width: 100%;
          }
          .about-cta-btn {
            width: 100%;
          }
          .about-image-wrapper {
            aspect-ratio: 16/10;
            max-height: 280px;
          }
          .about-hero {
            min-height: auto;
            padding-block: 4rem 3.5rem;
          }
        }

        @keyframes aboutFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes avoroShine {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      ` }} />
    </div>
  );
}
