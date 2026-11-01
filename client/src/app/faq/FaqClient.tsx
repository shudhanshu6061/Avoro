'use client';

import { useState, useMemo } from 'react';

interface FaqItem {
  id: number;
  category: 'basics' | 'application' | 'styling' | 'about';
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 1,
    category: 'application',
    question: 'How do you apply perfume correctly for men?',
    answer: 'Apply perfume right after a shower, on clean, slightly damp skin. This helps the fragrance bind and last longer. Spray on pulse points where your skin naturally runs warm: wrists, neck, and behind the ears. Don\'t rub your wrists together after spraying, as this breaks down the fragrance molecules and changes the scent. One to three sprays is enough for an EDP like AVORO – more isn\'t always better.'
  },
  {
    id: 2,
    category: 'styling',
    question: 'How do I choose the right perfume for men in India?',
    answer: 'Choosing a perfume in India means factoring in climate first. Heat and humidity intensify fragrance projection, so lighter, well-balanced scents often work better for daily wear, while richer notes like oud and amber suit evenings and winter months. Think about your lifestyle too – office wear should be subtle, while a date or event calls for something bolder. AVORO\'s Velvet Oud, Vanilla Ember, and Blue Amber are each built for a different mood, so testing on skin (not just paper) is the best way to find your match.'
  },
  {
    id: 3,
    category: 'basics',
    question: 'What\'s the difference between EDP, EDT, and EDC?',
    answer: 'EDP (Eau de Parfum), EDT (Eau de Toilette), and EDC (Eau de Cologne) differ mainly in fragrance oil concentration. EDP has 15-20% oil concentration, giving it the strongest longevity – often 6-8 hours or more. EDT sits at 5-15%, lasting around 4-6 hours, while EDC is the lightest at 2-4%, lasting just 2 hours. AVORO fragrances are all EDP, meaning richer scent depth and longer wear per spray.'
  },
  {
    id: 4,
    category: 'basics',
    question: 'How long does perfume last on skin?',
    answer: 'Most quality EDPs last 6-8 hours on skin, though this varies based on skin type, weather, and how the fragrance is applied. Oily skin tends to hold fragrance longer than dry skin. Hot, humid conditions common in India can cause a scent to project harder but fade a bit faster. Applying to moisturized skin and pulse points helps extend wear time significantly.'
  },
  {
    id: 5,
    category: 'application',
    question: 'Does perfume expire in India\'s climate?',
    answer: 'Yes, perfume can degrade faster in India due to heat and humidity. Most fragrances have a shelf life of 3-5 years unopened, but that shortens once opened and exposed to heat, light, or air. Signs a perfume has turned include a change in color, a sour or altered smell, or reduced projection. Storing it correctly (see below) makes a big difference in how long your bottle stays true to its original scent.'
  },
  {
    id: 6,
    category: 'application',
    question: 'How should I store perfume in India?',
    answer: 'Store perfume away from direct sunlight, heat, and humidity – so avoid bathroom shelves or windowsills. A cool, dry drawer or cupboard is ideal, since Indian summers can get hot enough to break down the fragrance oils and alcohol base. Keep the cap tightly closed to limit air exposure, and avoid moving the bottle between hot and cold environments repeatedly.'
  },
  {
    id: 7,
    category: 'basics',
    question: 'What is sillage in perfume?',
    answer: 'Sillage refers to the trail a fragrance leaves behind as you move – essentially, how much of your scent lingers in a room or space after you\'ve left it. A perfume with strong sillage is noticeable to people standing several feet away, while low sillage stays close to the skin. Oud and amber-based fragrances, like AVORO\'s Velvet Oud, typically have richer sillage compared to lighter citrus or aquatic scents.'
  },
  {
    id: 8,
    category: 'basics',
    question: 'What is projection in perfume, and how is it different from sillage?',
    answer: 'Projection is how far a fragrance radiates from your body immediately after application – basically, your personal scent bubble. Sillage, on the other hand, is the lingering trail left behind after you\'ve walked past someone. A perfume can have strong projection but fade quickly (low longevity), or subtle projection but excellent sillage over time. Both depend on concentration, ingredients, and skin chemistry.'
  },
  {
    id: 9,
    category: 'styling',
    question: 'How do you test perfume properly before buying, especially in India?',
    answer: 'Never judge a perfume from the bottle or paper strip alone – always test it on your skin, since body chemistry changes how a fragrance develops. Apply it to your wrist, wait at least 30 minutes, and let it go through its opening, heart, and base notes before deciding. In India\'s heat, fragrances can amplify quickly, so testing at different times of day (morning vs. evening) gives a truer sense of how it\'ll actually wear.'
  },
  {
    id: 10,
    category: 'basics',
    question: 'Why does the same perfume smell different on different people?',
    answer: 'Perfume interacts with your unique skin chemistry influenced by pH levels, skin type (oily vs. dry), diet, and even hormones – which is why the same bottle can smell different on two people. Oily skin tends to amplify and hold scent longer, while dry skin lets it fade faster and smell lighter. This is exactly why testing on your own skin matters more than trusting how it smelled on a friend.'
  },
  {
    id: 11,
    category: 'application',
    question: 'How can I make my perfume last longer through the day?',
    answer: 'Moisturized skin holds fragrance far better than dry skin, so apply an unscented lotion before spraying. Target pulse points – wrists, neck, chest, and behind the ears – where body heat helps the scent diffuse gradually. Layering with a matching scented body wash or lotion (see layering below) also extends wear. Avoid spraying on clothes only, since fragrance interacts differently with fabric than skin.'
  },
  {
    id: 12,
    category: 'application',
    question: 'What is fragrance layering, and how do you layer scents as a man in India?',
    answer: 'Fragrance layering means combining products – like a matching shower gel, deodorant, and EDP – to build a longer-lasting, more complex scent profile. Start with a scented or neutral body wash, follow with a matching or complementary body lotion, then apply your perfume on top. In India\'s climate, layering lighter, non-overpowering products works best, since heat already intensifies scent – you want depth, not an overwhelming cloud.'
  },
  {
    id: 13,
    category: 'about',
    question: 'Where can I buy AVORO perfume?',
    answer: 'AVORO is available directly through avoro.in and will soon be listed on Amazon.in for wider access across India. Buying through official channels ensures you\'re getting an authentic, freshly-made bottle rather than a diluted or counterfeit version – which is unfortunately common with lesser-known fragrance brands sold through unofficial resellers.'
  },
  {
    id: 14,
    category: 'about',
    question: 'What does AVORO perfume smell like?',
    answer: 'AVORO is built around three distinct personalities: Velvet Oud is deep, smoky, and rich – perfect for evenings and colder months. Vanilla Ember is warm and inviting with a sweet, cozy edge, great for everyday wear. Blue Amber is fresh yet grounded, balancing lightness with depth for versatile, all-day wear. Each is an EDP, so all three offer strong longevity and noticeable sillage.'
  },
  {
    id: 15,
    category: 'about',
    question: 'Is AVORO perfume good quality?',
    answer: 'AVORO fragrances are EDP-concentration, meaning higher oil content for longer-lasting, richer scent compared to typical EDTs found in the same price range. Each fragrance was developed with attention to Indian climate conditions so they perform well in heat and humidity, not just in air-conditioned settings. The brand focuses on three well-developed signature scents rather than a large, diluted lineup, prioritizing quality over quantity.'
  },
  {
    id: 16,
    category: 'styling',
    question: 'How can I smell expensive without spending a lot on perfume in India?',
    answer: 'Smelling expensive is less about price and more about concentration, application, and choice. Go for EDP over EDT for richer, longer-lasting scent. Apply to pulse points on moisturized skin rather than spraying into the air. Choose fragrances with deep base notes like oud, amber, or musk, which read as more luxurious than light citrus blends. Layering complementary products also builds a more expensive-smelling scent trail.'
  },
  {
    id: 17,
    category: 'styling',
    question: 'Which perfume makes you smell like money in India?',
    answer: 'Fragrances built around oud, amber, sandalwood, and musk tend to be associated with a "rich" or luxurious scent profile in India, since these notes are deep, warm, and long-lasting rather than sharp or fleeting. AVORO\'s Velvet Oud and Blue Amber lean into this – rich, grounded compositions designed to feel premium without relying on an overly sweet or synthetic edge.'
  },
  {
    id: 18,
    category: 'styling',
    question: 'What perfume should a man wear on a first date?',
    answer: 'For a first date, choose something warm but not overpowering. You want to be noticed up close, not from across the room. A fragrance with balanced sillage, like AVORO\'s Vanilla Ember, works well since it\'s inviting without being aggressive. Apply lightly (1-2 sprays), stick to pulse points, and avoid testing a brand-new scent for the first time on the date itself. Wear it once beforehand to know how it develops on your skin.'
  },
  {
    id: 19,
    category: 'styling',
    question: 'What\'s the best first perfume for a beginner man in India?',
    answer: 'A good beginner fragrance should be versatile enough for both daily wear and slightly dressier occasions, without being too niche or overpowering. Look for an EDP with moderate projection and a balanced note profile – not too sweet, not too sharp. AVORO\'s Blue Amber is a strong beginner pick, since it\'s fresh yet warm, easy to wear across seasons, and forgiving even if application is a bit heavy-handed while you\'re still learning your ideal amount.'
  }
];

const CATEGORIES = [
  { id: 'all', label: 'All Questions' },
  { id: 'basics', label: 'Basics & Science' },
  { id: 'application', label: 'Application & Care' },
  { id: 'styling', label: 'Selection & Styling' },
  { id: 'about', label: 'About AVORO' }
] as const;

export default function FaqClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openItems, setOpenItems] = useState<Record<number, boolean>>({});

  const filteredItems = useMemo(() => {
    return FAQ_ITEMS.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = searchQuery.trim() === '' || 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // If searching, auto-expand matched items for quick reading
  const activeOpenItems = useMemo(() => {
    if (searchQuery.trim() !== '') {
      const autoExpanded: Record<number, boolean> = {};
      filteredItems.forEach(item => {
        autoExpanded[item.id] = true;
      });
      return autoExpanded;
    }
    return openItems;
  }, [searchQuery, filteredItems, openItems]);

  const toggleItem = (id: number) => {
    if (searchQuery.trim() !== '') return; // Lock toggle open when searching to maintain auto-expansion visibility
    setOpenItems((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div>
      {/* ══ HERO SECTION ══════════════════════════════════ */}
      <section style={{
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'clamp(4rem, 8vw, 6rem) var(--page-pad)',
        position: 'relative',
        background: 'linear-gradient(180deg, #FBF9F6 0%, #EFE7DA 100%)',
        borderBottom: '1px solid rgba(184,146,74,0.06)'
      }}>
        {/* Background Decorative Auras */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: '-20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '80vw',
            height: '80vw',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,136,0.15) 0%, rgba(212,175,136,0.05) 40%, transparent 70%)',
            filter: 'blur(30px)'
          }} />
        </div>

        <div style={{ position: 'relative', maxWidth: '800px', width: '100%' }}>
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'clamp(0.65rem, 1.5vw, 0.72rem)',
            fontWeight: 600,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--gold-dark)',
            marginBottom: '1rem',
          }}>
            THE AVORO GUIDE
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.2rem, 5.5vw, 3.8rem)',
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            margin: '0 0 1.25rem 0'
          }}>
            Know Your Scent.
          </h1>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'clamp(0.92rem, 2vw, 1.05rem)',
            color: 'var(--text-soft)',
            lineHeight: 1.6,
            maxWidth: '580px',
            margin: '0 auto',
            fontWeight: 300
          }}>
            From application to longevity, sillage to storage – answers to help you get the most out of every spray.
          </p>
        </div>
      </section>

      {/* ══ CONTENT AREA ══════════════════════════════════ */}
      <section className="lumina-container" style={{
        paddingBlock: 'clamp(3rem, 6vw, 5rem)',
        maxWidth: '840px',
      }}>
        {/* Search Bar */}
        <div style={{
          position: 'relative',
          marginBottom: '2rem',
          width: '100%',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-card)',
            border: '1.5px solid var(--border)',
            borderRadius: '100px',
            padding: '0.6rem 1.25rem',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.3s var(--ease)',
          }} className="faq-search-wrapper">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dark)" strokeWidth="1.6" style={{ marginRight: '0.75rem', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search fragrance questions (e.g. storage, EDP, Velvet Oud...)"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                fontSize: '0.95rem',
                color: 'var(--text)',
                outline: 'none',
                width: '100%',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                style={{
                  color: 'var(--text-soft)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  borderRadius: '50%',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-soft)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div style={{
          position: 'relative',
          marginBottom: '2.5rem',
          width: '100%',
        }}>
          {/* Scrollable Pills Container */}
          <div 
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              scrollbarWidth: 'none', // Hide scrollbar for Firefox
              msOverflowStyle: 'none', // Hide scrollbar for IE/Edge
              paddingBottom: '0.5rem',
              WebkitOverflowScrolling: 'touch',
            }}
            className="faq-categories-scroll"
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '100px',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all 0.25s var(--ease)',
                    background: isActive ? 'var(--text)' : 'rgba(184,146,74,0.06)',
                    color: isActive ? 'var(--bg)' : 'var(--text-mid)',
                    border: isActive ? '1px solid var(--text)' : '1px solid var(--border-soft)',
                    minHeight: '38px', // Ensure good mobile tap target height
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  className="faq-tab-btn"
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Inline Styles to Hide Webkit Scrollbars */}
          <style>{`
            .faq-categories-scroll::-webkit-scrollbar {
              display: none;
            }
            .faq-search-wrapper:focus-within {
              border-color: var(--gold-dark) !important;
              box-shadow: 0 0 0 3px rgba(184, 146, 74, 0.12) !important;
            }
          `}</style>
        </div>

        {/* Accordions */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
          {filteredItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              paddingBlock: '4rem',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.95rem'
            }}>
              <p style={{ marginBottom: '0.5rem' }}>No answers found matching &ldquo;{searchQuery}&rdquo;</p>
              <button 
                type="button" 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                style={{
                  color: 'var(--gold-dark)',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  fontSize: '0.85rem'
                }}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredItems.map((faq) => {
              const isOpen = !!activeOpenItems[faq.id];
              return (
                <div
                  key={faq.id}
                  style={{
                    borderBottom: '1px solid var(--border-soft)',
                    transition: 'background-color 0.25s ease',
                    backgroundColor: isOpen && searchQuery.trim() === '' ? 'rgba(184, 146, 74, 0.02)' : 'transparent',
                  }}
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    disabled={searchQuery.trim() !== ''} // Disable toggling when searching (keep expanded)
                    style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      textAlign: 'left',
                      padding: '1.25rem 0.5rem',
                      color: 'var(--text)',
                      fontFamily: 'var(--font-display)',
                      fontSize: 'clamp(1rem, 2.2vw, 1.12rem)',
                      fontWeight: 600,
                      letterSpacing: '-0.01em',
                      cursor: searchQuery.trim() !== '' ? 'default' : 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                    }}
                  >
                    <span style={{ paddingRight: '1.5rem', lineHeight: 1.4 }}>
                      {faq.id}. {faq.question}
                    </span>
                    {searchQuery.trim() === '' && (
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
                          width: '24px',
                          height: '24px',
                          marginLeft: '1rem',
                          lineHeight: 1,
                          flexShrink: 0,
                        }}
                      >
                        +
                      </span>
                    )}
                  </button>
                  <div
                    style={{
                      maxHeight: isOpen ? '1200px' : '0',
                      overflow: 'hidden',
                      transition: 'max-height 0.4s var(--ease), opacity 0.3s var(--ease), padding-bottom 0.3s var(--ease)',
                      opacity: isOpen ? 1 : 0,
                      paddingBottom: isOpen ? '1.5rem' : '0',
                      paddingLeft: '0.5rem',
                      paddingRight: '0.5rem',
                    }}
                  >
                    <p
                      style={{
                        fontFamily: 'var(--font-ui)',
                        fontSize: 'clamp(0.85rem, 1.8vw, 0.94rem)',
                        color: 'var(--text-mid)',
                        lineHeight: 1.8,
                        fontWeight: 300,
                        whiteSpace: 'pre-line',
                        paddingLeft: '1.25rem',
                        borderLeft: '1.5px solid var(--gold-pale)'
                      }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Contact Banner */}
        <div style={{
          marginTop: '5rem',
          padding: '2.5rem 2rem',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, rgba(239, 231, 218, 0.5) 0%, rgba(248, 246, 242, 0.9) 100%)',
          border: '1.5px solid rgba(184,146,74,0.12)',
          textAlign: 'center',
          boxShadow: 'var(--shadow-sm)',
        }} className="faq-contact-card">
          <h3 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.4rem',
            color: 'var(--text)',
            marginBottom: '0.5rem',
            fontWeight: 600,
          }}>
            Still have questions about AVORO?
          </h3>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.88rem',
            color: 'var(--text-soft)',
            marginBottom: '1.5rem',
            fontWeight: 300,
          }}>
            Our concierge team is here to guide you to the perfect scent.
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}>
            <a href="mailto:contact@avoro.in" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text)',
              borderBottom: '1px solid var(--gold-dark)',
              paddingBottom: '0.2rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold-dark)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" /></svg>
              Email Support
            </a>
            <a href="https://wa.me/917607090101" target="_blank" rel="noopener noreferrer" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--text)',
              borderBottom: '1px solid var(--gold-dark)',
              paddingBottom: '0.2rem',
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--gold-dark)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
              WhatsApp Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
