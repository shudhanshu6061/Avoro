'use client';

import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Is AVORO actually made in India?',
    answer: 'Yes. Completely. AVORO is a homegrown Indian perfume brand founded in Mirzapur. Our fragrances are developed and manufactured in India. Some of our raw ingredients are sourced internationally — Bulgarian rose from Bulgaria, for example, because that\'s where the best Bulgarian rose comes from — but every fragrance is formulated, tested, and produced here. The brand, the team, the decisions, and the craft are all Indian.'
  },
  {
    question: 'Why does AVORO cost this much? I can get a perfume for Rs. 500.',
    answer: 'You can. And that perfume will serve a purpose.\n\nThe honest answer to why AVORO is priced the way it is: the ingredients cost what they cost. Bulgarian rose absolute is one of the most expensive raw materials in perfumery. Real saffron, real oud, real sandalwood — these are not cheap to source ethically, and we don\'t replace them with synthetic versions to protect our margins. Our fragrances are Eau de Parfum concentration, which means a higher percentage of aromatic compounds and significantly longer wear on skin.\n\nWe\'re not marking up for a label. We\'re pricing for what\'s actually inside the bottle.'
  },
  {
    question: "I've never heard of AVORO. How do I know this is a legitimate brand?",
    answer: "Fair question. We're a new Indian perfume brand — launched in 2026 and we have not been around long enough to have decades of reputation behind us.\n\nWhat we can tell you: our ingredients are real and listed in full on every product page. Our manufacturing process is something we're transparent about. Our founder is a real person you can contact directly. And we built the Discovery Set specifically for people who aren't sure yet — so you can try every fragrance we make before you commit to a full bottle, with the full amount redeemable. Trust is built over time. We're asking for a small one to start."
  },
  {
    question: "I tried an Indian perfume before and it didn't last. Will AVORO be different?",
    answer: "Longevity depends on two things: concentration and ingredients. Most Indian perfumes that don't last are Eau de Toilette or body mist concentration. They're designed to be light and affordable, and they fade fast by design.\n\nAVORO fragrances are Eau de Parfum — a higher concentration that typically lasts 6 to 10 hours on skin, longer on fabric. The base notes in our formulas (sandalwood, amber, vetiver, benzoin, musk) are specifically chosen for longevity. If you apply to pulse points on moisturised skin, you should still be able to smell AVORO on your wrist the next morning. If you want to test this before buying 50ml, the Discovery Set is the right starting point."
  },
  {
    question: 'Can I try before I buy?',
    answer: 'Yes — this is exactly what the Discovery Set is for. All four fragrances in 8ml travel sizes, presented in a single lacquered box. Wear each one for at least a full day before deciding — fragrance changes as your skin temperature changes, and what you smell in the first hour is different from what stays after six. Once you know which one is yours, the full amount is credited against your full-size purchase.'
  },
  {
    question: "What if I don't like it after I buy?",
    answer: '15-day returns on any fragrance, as long as the bottle is at least 80% full. Full refund to your original payment method within 3 to 5 business days. Email returns@avoro.in with your order number and we\'ll take it from there. No complicated process, no restocking fee, no judgment.'
  }
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', width: '100%' }}>
      {FAQS.map((faq, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            style={{
              borderBottom: '1px solid var(--border-soft)',
              transition: 'border-color 0.3s var(--ease)',
            }}
          >
            <button
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'left',
                padding: '1.25rem 0',
                gap: '1rem',
                color: isOpen ? 'var(--gold-dark)' : 'var(--text)',
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(0.98rem, 2.2vw, 1.15rem)',
                fontWeight: 600,
                lineHeight: 1.4,
                letterSpacing: '-0.01em',
                cursor: 'pointer',
                transition: 'color 0.25s var(--ease)',
                minHeight: '48px',
              }}
            >
              <span style={{ flex: 1 }}>{faq.question}</span>
              <span
                style={{
                  fontSize: '1.4rem',
                  fontWeight: 300,
                  color: 'var(--gold-dark)',
                  transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                  transition: 'transform 0.3s var(--ease)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                +
              </span>
            </button>
            <div
              style={{
                maxHeight: isOpen ? '800px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.4s var(--ease), opacity 0.3s var(--ease), padding-bottom 0.3s var(--ease)',
                opacity: isOpen ? 1 : 0,
                paddingBottom: isOpen ? '1.25rem' : '0',
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 'clamp(0.88rem, 1.8vw, 0.95rem)',
                  color: 'var(--text-mid)',
                  lineHeight: 1.8,
                  fontWeight: 300,
                  whiteSpace: 'pre-line',
                }}
              >
                {faq.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
