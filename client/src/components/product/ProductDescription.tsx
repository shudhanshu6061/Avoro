'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product } from '@/types/product';
import { resolveProductPageContent } from '@/lib/productPageContent';
import type { ProductPageContent, PerformanceData } from '@/lib/productPageContentData';
import { DEFAULT_PERFORMANCE_TIPS } from '@/lib/productPageContentData';
import Accordion from '@/components/ui/Accordion';

interface Props {
  product: Product;
}

export default function ProductDescription({ product }: Props) {
  const content = resolveProductPageContent(product) as ProductPageContent | null;
  const [openSection, setOpenSection] = useState<string | null>('story');

  if (!content) return null;

  const handleToggle = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  // Helper to retrieve ingredients list based on product slug
  const getIngredients = (slug: string) => {
    switch (slug) {
      case 'velvet-oud':
        return 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Coumarin, Eugenol, Benzyl Benzoate, Citral, Geraniol, Cinnamal, Citronellol.';
      case 'vanilla-ember':
        return 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Benzyl Salicylate, Coumarin, Benzyl Alcohol, Limonene, Linalool, Anise Alcohol, Benzyl Benzoate, Citral.';
      case 'blue-amber':
        return 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citral, Alpha-Isomethyl Ionone, Geraniol, Citronellol, Coumarin, Benzyl Salicylate.';
      default:
        return 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citral, Geraniol, Coumarin, Benzyl Salicylate, Benzyl Benzoate.';
    }
  };

  // Helper to retrieve longevity and performance metrics
  const getPerformanceData = (slug: string): PerformanceData => {
    switch (slug) {
      case 'velvet-oud':
        return {
          longevity: '8 to 10 hours',
          sillage: 'Strong — noticeable from a distance',
          intensity: 'Strong',
          concentration: '18% pure fragrance oils (Eau de Parfum)',
          tips: DEFAULT_PERFORMANCE_TIPS,
        };
      case 'vanilla-ember':
        return {
          longevity: '7 to 9 hours',
          sillage: 'Medium — warm and close-to-skin',
          intensity: 'Medium',
          concentration: '15% pure fragrance oils (Eau de Parfum)',
          tips: DEFAULT_PERFORMANCE_TIPS,
        };
      case 'blue-amber':
        return {
          longevity: '6 to 8 hours',
          sillage: 'Light to Medium — clean and close',
          intensity: 'Light to Medium',
          concentration: '15% pure fragrance oils (Eau de Parfum)',
          tips: DEFAULT_PERFORMANCE_TIPS,
        };
      default:
        return {
          longevity: '6 to 10 hours',
          sillage: 'Medium',
          intensity: 'Medium',
          concentration: '15% pure fragrance oils (Eau de Parfum)',
          tips: DEFAULT_PERFORMANCE_TIPS,
        };
    }
  };

  // Helper to get static FAQs for the product page
  const getFaqs = (slug: string) => {
    return [
      {
        q: 'How should I store my AVORO fragrance?',
        a: 'Keep your bottle in a cool, dry place away from direct sunlight, humidity, and sudden temperature changes (like bathrooms). High-quality natural ingredients degrade quicker when exposed to heat and light.',
      },
      {
        q: 'Can I test the fragrance before buying 50ml?',
        a: 'Yes, we offer an AVORO Discovery Set containing 2ml sample vials of all our signature scents. The full price of the Discovery Set is redeemable as a credit toward your first 50ml bottle purchase.',
      },
      {
        q: 'Are AVORO fragrances vegan and cruelty-free?',
        a: 'Yes, absolutely. We commit to 100% vegan, cruelty-free processes. We source our raw materials ethically and do not test our final products or ingredients on animals.',
      },
      {
        q: 'Can I layer this with other perfumes?',
        a: 'Yes. AVORO fragrances are built on clean, high-quality note frameworks that complement each other. For example, layering Velvet Oud with Vanilla Ember creates a warm, creamy, and smoky signature scent.',
      },
    ];
  };

  const perf = content.performance || getPerformanceData(product.slug);
  const ingredientsText = content.ingredientsText || getIngredients(product.slug);
  const ingredientsNote = content.ingredientsNote || 'All AVORO fragrances are formulated using the highest quality natural raw materials and safe synthetics. Our formulas are 100% vegan, cruelty-free, and free from phthalates, parabens, and artificial colorants. We recommend performing a patch test on your wrist before full application.';
  const faqs = content.faqs || getFaqs(product.slug);

  return (
    <div style={{ background: 'var(--bg)', paddingTop: 'clamp(2rem, 4vw, 4rem)' }}>
      {/* ══ ACCORDION WRAPPER ══════════════════════════ */}
      <div
        style={{
          maxWidth: '800px',
          marginInline: 'auto',
          padding: '0 var(--page-pad)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        {/* 1. Description & Story */}
        <Accordion
          id="story"
          title="Description & Story"
          isOpen={openSection === 'story'}
          onToggle={() => handleToggle('story')}
        >
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.3rem, 3vw, 1.6rem)',
                fontWeight: 600,
                color: 'var(--text)',
                marginBottom: '1.25rem',
                lineHeight: 1.2,
              }}
            >
              {content.storyHeading}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {content.storyParagraphs.map((p, i) => (
                <p
                  key={i}
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.92rem',
                    color: 'var(--text-mid)',
                    lineHeight: 1.85,
                    fontWeight: 300,
                  }}
                >
                  {p}
                </p>
              ))}
            </div>

            {content.whoIsThisForHeading && (
              <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: '1.75rem', marginTop: '1.75rem' }}>
                <h4
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.15rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: '1rem',
                  }}
                >
                  {content.whoIsThisForHeading}
                </h4>
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.92rem',
                    color: 'var(--text-mid)',
                    lineHeight: 1.85,
                    fontWeight: 300,
                    marginBottom: '1.25rem',
                  }}
                >
                  {content.whoIsThisForIntro}
                </p>
                <ul
                  style={{
                    paddingLeft: '1.25rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.65rem',
                  }}
                >
                  {content.whoIsThisForList.map((item, i) => (
                    <li
                      key={i}
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.88rem',
                        color: 'var(--text-mid)',
                        lineHeight: 1.7,
                        fontWeight: 300,
                        listStyleType: 'square',
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                {content.whoIsThisForClosing && (
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.88rem',
                      color: 'var(--text-soft)',
                      lineHeight: 1.7,
                      fontWeight: 300,
                      fontStyle: 'italic',
                    }}
                  >
                    {content.whoIsThisForClosing}
                  </p>
                )}
              </div>
            )}
          </div>
        </Accordion>

        {/* 2. Fragrance Notes */}
        <Accordion
          id="notes"
          title="Fragrance Notes"
          isOpen={openSection === 'notes'}
          onToggle={() => handleToggle('notes')}
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.92rem',
                color: 'var(--text-mid)',
                lineHeight: 1.8,
                fontWeight: 300,
                marginBottom: '1.75rem',
              }}
            >
              {content.notesIntro}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {content.noteCategories.map((cat) => {
                let durationStr = cat.sublabel;
                const labelLower = cat.label.toLowerCase();
                if (labelLower.includes('top')) {
                  durationStr = 'First Impression • 15–30 min';
                } else if (labelLower.includes('heart') || labelLower.includes('middle')) {
                  durationStr = 'Main Character • 2–4 hours';
                } else if (labelLower.includes('base')) {
                  durationStr = 'Lasting Finish • 6–10 hours';
                }

                return (
                  <div
                    key={cat.label}
                    style={{
                      background: 'rgba(184, 146, 82, 0.02)',
                      border: '1px solid var(--border-soft)',
                      borderRadius: '12px',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'baseline',
                        width: '100%',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                        borderBottom: '1px solid var(--border-soft)',
                        paddingBottom: '0.75rem',
                      }}
                    >
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)' }}>
                        {cat.label}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-ui)',
                          fontSize: '0.72rem',
                          color: 'var(--text-soft)',
                          fontWeight: 300,
                          letterSpacing: '0.02em',
                        }}
                      >
                        {durationStr}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {cat.notes.map((note) => (
                        <div key={note.name} style={{ paddingLeft: '1rem', borderLeft: '2px solid var(--gold-dark)' }}>
                          <div
                            style={{
                              fontFamily: 'var(--font-display)',
                              fontSize: '1.05rem',
                              fontWeight: 600,
                              color: 'var(--gold-dark)',
                              marginBottom: '0.25rem',
                            }}
                          >
                            {note.name}
                          </div>
                          <p
                            style={{
                              fontFamily: 'var(--font-ui)',
                              fontSize: '0.88rem',
                              color: 'var(--text-mid)',
                              lineHeight: 1.8,
                              fontWeight: 300,
                            }}
                          >
                            {note.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Accordion>

        {/* 3. Ingredients */}
        <Accordion
          id="ingredients"
          title="Ingredients"
          isOpen={openSection === 'ingredients'}
          onToggle={() => handleToggle('ingredients')}
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '0.9rem',
                color: 'var(--text-mid)',
                lineHeight: 1.8,
                fontWeight: 300,
                letterSpacing: '0.03em',
                background: 'var(--bg-soft)',
                padding: '1.25rem 1.5rem',
                borderRadius: '8px',
                marginBottom: '1.5rem',
                wordBreak: 'break-word',
              }}
            >
              {ingredientsText}
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.2rem', color: 'var(--gold-dark)', lineHeight: 1 }}>🌿</span>
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '0.82rem',
                  color: 'var(--text-soft)',
                  lineHeight: 1.7,
                  fontWeight: 300,
                }}
              >
                {ingredientsNote}
              </p>
            </div>
          </div>
        </Accordion>

        {/* 4. How to Use */}
        <Accordion
          id="how-to-use"
          title="How to Use"
          isOpen={openSection === 'how-to-use'}
          onToggle={() => handleToggle('how-to-use')}
        >
          <div>
            <h3
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.15rem, 2.5vw, 1.3rem)',
                fontWeight: 600,
                color: 'var(--text)',
                marginBottom: '1.25rem',
              }}
            >
              {content.howToWearHeading}
            </h3>
            <div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}
              className="accordion-grid-2"
            >
              {content.howToWearItems.map((item) => (
                <div
                  key={item.label}
                  style={{
                    background: 'rgba(184, 146, 82, 0.03)',
                    border: '1px solid var(--border-soft)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.98rem',
                      fontWeight: 600,
                      color: 'var(--gold-dark)',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {item.label}
                  </div>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.85rem',
                      color: 'var(--text-mid)',
                      lineHeight: 1.7,
                      fontWeight: 300,
                    }}
                  >
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Accordion>

        {/* 5. Longevity & Performance */}
        <Accordion
          id="longevity"
          title="Longevity & Performance"
          isOpen={openSection === 'longevity'}
          onToggle={() => handleToggle('longevity')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}
              className="accordion-grid-3"
            >
              <div style={{ background: 'var(--bg-soft)', padding: '1rem', borderRadius: '10px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--gold-dark)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Longevity
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                  {perf.longevity}
                </div>
              </div>
              <div style={{ background: 'var(--bg-soft)', padding: '1rem', borderRadius: '10px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--gold-dark)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Projection
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                  {perf.sillage ? perf.sillage.split('—')[0].trim() : 'Medium'}
                </div>
              </div>
              <div style={{ background: 'var(--bg-soft)', padding: '1rem', borderRadius: '10px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.68rem',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--gold-dark)',
                    marginBottom: '0.25rem',
                  }}
                >
                  Concentration
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                  {perf.concentration || 'Eau de Parfum'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-soft)', paddingTop: '1.25rem' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text)' }}>
                How to Maximize Performance
              </h4>
              <ul style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {perf.tips && perf.tips.length > 0 ? (
                  perf.tips.map((tip, i) => (
                    <li key={i} style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--text-mid)', lineHeight: 1.7, fontWeight: 300 }}>
                      <strong>{tip.title}:</strong> {tip.text}
                    </li>
                  ))
                ) : (
                  <>
                    <li style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--text-mid)', lineHeight: 1.7, fontWeight: 300 }}>
                      <strong>Hydrate Skin:</strong> Fragrances bind to lipid layers. Apply an unscented moisturizer before spraying to increase longevity.
                    </li>
                    <li style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--text-mid)', lineHeight: 1.7, fontWeight: 300 }}>
                      <strong>Target Pulse Points:</strong> Spray on warm areas like the sides of the neck, inner wrists, and inside elbows for optimal projection.
                    </li>
                    <li style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--text-mid)', lineHeight: 1.7, fontWeight: 300 }}>
                      <strong>Spray on Fabric:</strong> Natural fibers like cotton and wool hold scent molecules longer than skin. Spray on collar or shoulders for a lingering trail.
                    </li>
                    <li style={{ fontFamily: 'var(--font-ui)', fontSize: '0.85rem', color: 'var(--text-mid)', lineHeight: 1.7, fontWeight: 300 }}>
                      <strong>Do Not Rub:</strong> Friction breaks down delicate top-note compounds, shortening the initial scent bubble. Let it dry naturally.
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </Accordion>

        {/* 6. Shipping */}
        <Accordion
          id="shipping"
          title="Shipping"
          isOpen={openSection === 'shipping'}
          onToggle={() => handleToggle('shipping')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div
              style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}
              className="accordion-grid-3"
            >
              {content.promises.map((p) => (
                <div
                  key={p.title}
                  style={{
                    background: 'rgba(255,255,255,0.5)',
                    border: '1px solid var(--border-soft)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '2px',
                      background: 'var(--gold-dark)',
                      margin: '0 auto 0.75rem',
                      borderRadius: '1px',
                    }}
                  />
                  <h4
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: 'var(--text)',
                      marginBottom: '0.5rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {p.title}
                  </h4>
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.82rem',
                      color: 'var(--text-soft)',
                      lineHeight: 1.6,
                      fontWeight: 300,
                    }}
                  >
                    {p.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Accordion>

        {/* 7. Product Details */}
        <Accordion
          id="details"
          title="Product Details"
          isOpen={openSection === 'details'}
          onToggle={() => handleToggle('details')}
        >
          <div
            style={{
              overflowX: 'auto',
              background: 'rgba(255,255,255,0.7)',
              border: '1px solid var(--border-soft)',
              borderRadius: '12px',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-soft)', background: 'var(--bg-soft)' }}>
                  <th
                    style={{
                      padding: '0.85rem 1.25rem',
                      textAlign: 'left',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--text-soft)',
                      width: '38%',
                    }}
                  >
                    Detail
                  </th>
                  <th
                    style={{
                      padding: '0.85rem 1.25rem',
                      textAlign: 'left',
                      fontFamily: 'var(--font-ui)',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: 'var(--text-soft)',
                    }}
                  >
                    Info
                  </th>
                </tr>
              </thead>
              <tbody>
                {content.details.map((row, idx) => (
                  <tr
                    key={row.label}
                    style={{
                      borderBottom: idx < content.details.length - 1 ? '1px solid var(--border-soft)' : 'none',
                    }}
                  >
                    <td
                      style={{
                        padding: '0.85rem 1.25rem',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.82rem',
                        color: 'var(--text-soft)',
                        fontWeight: 500,
                        verticalAlign: 'top',
                      }}
                    >
                      {row.label}
                    </td>
                    <td
                      style={{
                        padding: '0.85rem 1.25rem',
                        fontFamily: 'var(--font-ui)',
                        fontSize: '0.85rem',
                        color: 'var(--text-mid)',
                        fontWeight: 400,
                        lineHeight: 1.6,
                      }}
                    >
                      {row.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Accordion>

        {/* 8. FAQs */}
        <Accordion
          id="faqs"
          title="Frequently Asked Questions"
          isOpen={openSection === 'faqs'}
          onToggle={() => handleToggle('faqs')}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                style={{
                  borderBottom: i < 3 ? '1px solid var(--border-soft)' : 'none',
                  paddingBottom: i < 3 ? '1rem' : '0',
                  paddingTop: i > 0 ? '0.5rem' : '0',
                }}
              >
                <h4
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.05rem',
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: '0.35rem',
                  }}
                >
                  {faq.q}
                </h4>
                <p
                  style={{
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.88rem',
                    color: 'var(--text-mid)',
                    lineHeight: 1.7,
                    fontWeight: 300,
                  }}
                >
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </Accordion>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 640px) {
          .accordion-grid-2 {
            grid-template-columns: 1fr !important;
          }
          .accordion-grid-3 {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 768px) {
          .accordion-grid-3 {
            grid-template-columns: 1fr !important;
          }
        }
      ` }} />
    </div>
  );
}
