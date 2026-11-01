export interface NoteDetail {
  name: string;
  description: string;
}

export interface NoteCategory {
  label: string;
  sublabel: string;
  notes: NoteDetail[];
}

export interface ProductDetailRow {
  label: string;
  value: string;
}

export interface PromiseBlock {
  title: string;
  text: string;
}

export interface ComparisonRow {
  label: string;
  velvetOud: string;
  vanillaEmber: string;
  blueAmber: string;
}

export interface PerformanceTip {
  title: string;
  text: string;
}

export interface PerformanceData {
  longevity: string;
  sillage: string;
  intensity: string;
  concentration: string;
  tips: PerformanceTip[];
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ProductPageContent {
  badge: string;
  tagline: string;
  oneLiner: string;
  trustLine: string;
  storyHeading: string;
  storyParagraphs: string[];
  notesIntro: string;
  noteCategories: NoteCategory[];
  detailsHeading: string;
  details: ProductDetailRow[];
  howToWearHeading: string;
  howToWearItems: { label: string; text: string }[];
  whoIsThisForHeading: string;
  whoIsThisForIntro: string;
  whoIsThisForList: string[];
  whoIsThisForClosing: string;
  comparison: ComparisonRow[];
  promiseHeading: string;
  promises: PromiseBlock[];
  ctaHeading: string;
  ctaSubtext: string;
  ctaSmallText: string;
  ingredientsText?: string;
  ingredientsNote?: string;
  performance?: PerformanceData;
  faqs?: FaqItem[];
}

export const DEFAULT_COMPARISON: ComparisonRow[] = [
  { label: 'Vibe', velvetOud: 'Dark · Bold · Smoky', vanillaEmber: 'Warm · Soft · Cosy', blueAmber: 'Fresh · Clean · Light' },
  { label: 'Best For', velvetOud: 'Evenings · Special occasions', vanillaEmber: 'Everyday · Office · College', blueAmber: 'Morning · Travel · Casual' },
  { label: 'Intensity', velvetOud: 'Strong', vanillaEmber: 'Medium', blueAmber: 'Light to Medium' },
  { label: 'Weather', velvetOud: 'Cool evenings · AC spaces', vanillaEmber: 'All seasons', blueAmber: 'Summer · Daytime' },
];

export const DEFAULT_PERFORMANCE_TIPS: PerformanceTip[] = [
  { title: 'Hydrate Skin', text: 'Fragrances bind to lipid layers. Apply an unscented moisturizer before spraying to increase longevity.' },
  { title: 'Target Pulse Points', text: 'Spray on warm areas like the sides of the neck, inner wrists, and inside elbows for optimal projection.' },
  { title: 'Spray on Fabric', text: 'Natural fibers like cotton and wool hold scent molecules longer than skin. Spray on collar or shoulders for a lingering trail.' },
  { title: 'Do Not Rub', text: 'Friction breaks down delicate top-note compounds, shortening the initial scent bubble. Let it dry naturally.' },
];

export const DEFAULT_FAQS: FaqItem[] = [
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

export const DEFAULT_INGREDIENTS_NOTE =
  'All AVORO fragrances are formulated using the highest quality natural raw materials and safe synthetics. Our formulas are 100% vegan, cruelty-free, and free from phthalates, parabens, and artificial colorants. We recommend performing a patch test on your wrist before full application.';

export function emptyPageContent(productName = ''): ProductPageContent {
  return {
    badge: '',
    tagline: '',
    oneLiner: '',
    trustLine: 'Free shipping on orders above ₹999',
    storyHeading: productName ? `What Makes ${productName} Special` : 'What Makes This Fragrance Special',
    storyParagraphs: [''],
    notesIntro: 'Every fragrance has layers. Here is what you will experience from the first spray to the last trace.',
    noteCategories: [
      { label: 'Top Notes', sublabel: 'first impression — lasts 15 to 30 minutes', notes: [{ name: '', description: '' }] },
      { label: 'Heart Notes', sublabel: 'main character — lasts 2 to 4 hours', notes: [{ name: '', description: '' }] },
      { label: 'Base Notes', sublabel: 'lasting finish — stays 6 to 10 hours', notes: [{ name: '', description: '' }] },
    ],
    detailsHeading: "What's in the Bottle",
    details: [
      { label: 'Fragrance Type', value: 'Eau de Parfum (EDP)' },
      { label: 'Size', value: '50ml' },
      { label: 'Fragrance Family', value: '' },
      { label: 'Gender', value: 'Unisex' },
      { label: 'Longevity', value: '' },
      { label: 'Sillage (Projection)', value: '' },
      { label: 'Season', value: '' },
      { label: 'Occasion', value: '' },
    ],
    howToWearHeading: productName ? `How to Get the Most Out of ${productName}` : 'How to Wear It',
    howToWearItems: [
      { label: 'Where to spray', text: '' },
      { label: 'How much to use', text: '' },
      { label: 'When to wear it', text: '' },
      { label: 'Pro tip', text: '' },
    ],
    whoIsThisForHeading: productName ? `Is ${productName} for You?` : 'Is This Fragrance for You?',
    whoIsThisForIntro: '',
    whoIsThisForList: [''],
    whoIsThisForClosing: '',
    comparison: DEFAULT_COMPARISON.map((row) => ({ ...row })),
    promiseHeading: 'Our Promise to You',
    promises: [
      { title: 'Genuine Fragrance', text: 'Full EDP concentration in every bottle. Real fragrance, real quality — no compromise.' },
      { title: 'Gift-Ready Packaging', text: "Your order arrives in AVORO's premium packaging — beautiful enough to gift directly." },
      { title: 'Free Shipping Across India', text: 'Free delivery on all orders above ₹999.' },
    ],
    ctaHeading: 'Ready to Experience It?',
    ctaSubtext: productName ? `${productName}. 50ml Eau de Parfum.` : '50ml Eau de Parfum.',
    ctaSmallText: '',
    ingredientsText: 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citral, Geraniol, Coumarin, Benzyl Salicylate, Benzyl Benzoate.',
    ingredientsNote: DEFAULT_INGREDIENTS_NOTE,
    performance: {
      longevity: '6 to 10 hours',
      sillage: 'Medium',
      intensity: 'Medium',
      concentration: '15% pure fragrance oils (Eau de Parfum)',
      tips: DEFAULT_PERFORMANCE_TIPS.map((t) => ({ ...t })),
    },
    faqs: DEFAULT_FAQS.map((f) => ({ ...f })),
  };
}

export function getPageContentPreset(slug: string): ProductPageContent | null {
  const preset = PAGE_CONTENT_PRESETS[slug];
  return preset ? JSON.parse(JSON.stringify(preset)) : null;
}

export const PAGE_CONTENT_PRESETS: Record<string, ProductPageContent> = {
  'velvet-oud': {
    badge: 'No. 01 · Signature Fragrance',
    tagline: 'Deep. Smoky. Magnetic.',
    oneLiner: 'A rich oud woody fragrance with warm amber and soft leather — designed for unforgettable evenings.',
    trustLine: 'Free shipping on orders above ₹999',

    storyHeading: 'What Makes Velvet Oud Special',
    storyParagraphs: [
      'There are fragrances you wear. And then there are fragrances that wear you — in the best way possible. Velvet Oud is built around one of the most prized ingredients in perfumery: oud. Also known as agarwood, oud comes from rare trees and carries a deep, smoky, almost earthy richness that is impossible to ignore. It is bold. It is raw. And when done right, it is absolutely magnetic. But Velvet Oud is not just raw oud. It is a full experience.',
      'The opening hits you with that smoky, woody intensity — confident and warm, the kind of scent that fills a room without shouting. As it settles on your skin over the first hour, warm amber comes in to smooth out the edges. Amber is naturally sweet and resinous, and here it acts like the soft light of a candle — golden, glowing, and comforting.',
      'Then comes the leather. Subtle but unmistakable. It adds a sophisticated edge, the kind of depth that makes this fragrance feel more grown-up and refined. Together, these three elements — oud, amber, leather — sit on a base of smoky woods that quietly hold everything together till the very end.',
      'Velvet Oud is the fragrance you wear when you mean business. When you want to walk into a room and own it — without saying a word.',
    ],

    notesIntro: 'Every fragrance has layers. Here is what you will experience with Velvet Oud — from the first spray to the last trace.',
    noteCategories: [
      {
        label: 'Top Notes',
        sublabel: 'what you smell first — lasts 15 to 30 minutes',
        notes: [
          { name: 'Smoky Woods', description: 'The very first thing that hits you. Woody, warm, and slightly smoky — it sets the tone immediately. This is what makes Velvet Oud feel powerful and present from the moment you spray it.' },
        ],
      },
      {
        label: 'Heart Notes',
        sublabel: 'the main character — lasts 2 to 4 hours',
        notes: [
          { name: 'Oud', description: 'The star of the show. Rich, dark, and deeply aromatic. Oud has a natural smokiness that feels ancient and rare. This is what makes Velvet Oud unforgettable.' },
          { name: 'Leather', description: 'Not sharp or harsh — this is smooth, refined leather. Think a well-worn jacket, not a new shoe. It adds character and a quiet confidence to the fragrance.' },
        ],
      },
      {
        label: 'Base Notes',
        sublabel: 'the lasting finish — stays 6 to 10 hours',
        notes: [
          { name: 'Amber', description: 'Warm, sweet, and slightly resinous. Amber wraps everything together and gives Velvet Oud that signature golden warmth that lingers on your skin for hours.' },
        ],
      },
    ],

    detailsHeading: "What's in the Bottle",
    details: [
      { label: 'Fragrance Type', value: 'Eau de Parfum (EDP)' },
      { label: 'Size', value: '50ml' },
      { label: 'Fragrance Family', value: 'Woody · Oriental' },
      { label: 'Gender', value: 'Unisex (primarily masculine)' },
      { label: 'Longevity', value: '8 to 10 hours' },
      { label: 'Sillage (Projection)', value: 'Strong — noticeable from a distance' },
      { label: 'Season', value: 'Best in Autumn and Winter · Great for Indian evenings year-round' },
      { label: 'Occasion', value: 'Evening events · Formal occasions · Date nights · Special occasions' },
    ],

    howToWearHeading: 'How to Get the Most Out of Velvet Oud',
    howToWearItems: [
      { label: 'Where to spray', text: 'Apply to your pulse points — wrists, neck, behind the ears, and the inside of your elbows. These areas are warm, which helps the fragrance develop and project better.' },
      { label: 'How much to use', text: 'Two to three sprays is enough. Velvet Oud is strong and rich. You do not need to go heavy — a little goes a long way.' },
      { label: 'When to wear it', text: 'This is an evening fragrance. It is built for dinners, events, parties, and late nights. The smokiness and depth of oud come alive in cooler temperatures, so it performs best in the evening or in air-conditioned spaces.' },
      { label: 'Pro tip', text: 'Do not rub your wrists together after spraying. This breaks down the fragrance molecules and shortens how long it lasts. Just spray and let it sit.' },
    ],

    whoIsThisForHeading: 'Is Velvet Oud for You?',
    whoIsThisForIntro: 'Velvet Oud is made for someone who does not want to blend in. If you like fragrances that are bold, warm, and leave a strong impression — this is yours. It is especially loved by people who enjoy Middle Eastern or Arabic-style perfumes, or anyone who has tried oud before and wants that experience in a more accessible, wearable format.',
    whoIsThisForList: [
      'Want a fragrance that lasts all evening without reapplying',
      'Love warm, woody, and smoky scents',
      'Are looking for something that feels premium and different from regular department store perfumes',
      'Want people to notice and ask what you are wearing',
    ],
    whoIsThisForClosing: 'It is not the right fit if you prefer light, fresh, or citrusy scents — in that case, Blue Amber would suit you better.',

    comparison: [
      { label: 'Vibe', velvetOud: 'Dark · Bold · Smoky', vanillaEmber: 'Warm · Soft · Cosy', blueAmber: 'Fresh · Clean · Light' },
      { label: 'Best For', velvetOud: 'Evenings · Special occasions', vanillaEmber: 'Everyday · Office · College', blueAmber: 'Morning · Travel · Casual' },
      { label: 'Intensity', velvetOud: 'Strong', vanillaEmber: 'Medium', blueAmber: 'Light to Medium' },
      { label: 'Weather', velvetOud: 'Cool evenings · AC spaces', vanillaEmber: 'All seasons', blueAmber: 'Summer · Daytime' },
    ],

    promiseHeading: 'Our Promise to You',
    promises: [
      { title: 'Genuine Fragrance', text: 'Every bottle of Velvet Oud is exactly what it says — no fillers, no dilution. Full EDP concentration in every spray.' },
      { title: 'Gift-Ready Packaging', text: "Your order arrives in AVORO's premium packaging — beautiful enough to gift directly without wrapping." },
      { title: 'Free Shipping Across India', text: 'We offer free delivery on all orders above ₹999.' },
    ],

    ctaHeading: 'Ready to Make Your Mark?',
    ctaSubtext: 'Velvet Oud. 50ml Eau de Parfum. ₹1,299.',
    ctaSmallText: 'Only a limited number of bottles available at this price.',

    ingredientsText: 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Coumarin, Eugenol, Benzyl Benzoate, Citral, Geraniol, Cinnamal, Citronellol.',
    ingredientsNote: DEFAULT_INGREDIENTS_NOTE,
    performance: {
      longevity: '8 to 10 hours',
      sillage: 'Strong — noticeable from a distance',
      intensity: 'Strong',
      concentration: '18% pure fragrance oils (Eau de Parfum)',
      tips: DEFAULT_PERFORMANCE_TIPS.map((t) => ({ ...t })),
    },
    faqs: DEFAULT_FAQS.map((f) => ({ ...f })),
  },

  'vanilla-ember': {
    badge: 'No. 02 · Everyday Luxury',
    tagline: 'Warm. Soft. Addictive.',
    oneLiner: 'Creamy vanilla blended with amber and musk — a comforting, luxurious fragrance you will want to wear every single day.',
    trustLine: 'Free shipping on orders above ₹999',

    storyHeading: 'What Makes Vanilla Ember Special',
    storyParagraphs: [
      'Some fragrances are made to impress. Vanilla Ember is made to be loved.',
      'There is a reason vanilla is one of the most universally liked scents in the world. It is warm, familiar, and comforting — it feels like something good. But vanilla alone can smell like food or a candle. Vanilla Ember is different. It takes that warmth and builds something genuinely beautiful around it.',
      'It starts with rich, creamy vanilla — the real, full, indulgent kind. Then comes tonka bean, a natural ingredient with a warm, slightly sweet, and softly spiced quality. Think of it as vanilla\'s more sophisticated cousin. Together, they create the heart of this fragrance: something that feels both cosy and refined.',
      'Warm amber runs underneath everything, giving Vanilla Ember a golden, glowing quality. It is the kind of warmth you feel sitting near a fire, or the last hour of sunlight on a winter afternoon. Then soft musk ties it all together — clean, skin-close, and effortless. The result is a fragrance that is impossible to dislike. It is not loud. It is not sharp. It just smells genuinely, deeply good. And people will notice.',
    ],

    notesIntro: 'Vanilla Ember unfolds in soft, warm layers. Here is what you will experience from first spray to last.',
    noteCategories: [
      {
        label: 'Top Notes',
        sublabel: 'first impression — lasts 15 to 30 minutes',
        notes: [
          { name: 'Vanilla', description: 'Immediate, warm, and rich. Not artificial or overly sweet — this is smooth, creamy vanilla that feels luxurious from the very first spray.' },
        ],
      },
      {
        label: 'Heart Notes',
        sublabel: 'the core experience — lasts 2 to 5 hours',
        notes: [
          { name: 'Tonka Bean', description: 'A warm, slightly sweet ingredient with a gentle spiced edge. It deepens the vanilla and adds a complexity that makes Vanilla Ember feel like more than just a sweet fragrance.' },
          { name: 'Amber', description: 'Golden, resinous, and glowing. Amber gives Vanilla Ember its warmth and makes it feel full-bodied and long-lasting.' },
        ],
      },
      {
        label: 'Base Notes',
        sublabel: 'the lasting skin scent — stays 6 to 9 hours',
        notes: [
          { name: 'Soft Musk', description: 'Clean, gentle, and skin-close. Musk is what makes this fragrance feel personal — like it is part of you, not just something you put on.' },
        ],
      },
    ],

    detailsHeading: "What's in the Bottle",
    details: [
      { label: 'Fragrance Type', value: 'Eau de Parfum (EDP)' },
      { label: 'Size', value: '50ml' },
      { label: 'Fragrance Family', value: 'Oriental · Gourmand' },
      { label: 'Gender', value: 'Unisex' },
      { label: 'Longevity', value: '7 to 9 hours' },
      { label: 'Sillage (Projection)', value: 'Medium — warm and close to skin' },
      { label: 'Season', value: 'All seasons · Especially beautiful in winter' },
      { label: 'Occasion', value: 'Daily wear · Office · College · Casual outings · Gifting' },
    ],

    howToWearHeading: 'How to Get the Most Out of Vanilla Ember',
    howToWearItems: [
      { label: 'Where to spray', text: 'Wrists, neck, and chest. Vanilla Ember is a skin-close fragrance — it projects softly and warmly, so applying it close to your body gives the best experience.' },
      { label: 'How much to use', text: 'Two to four sprays for an all-day wear. Because it is warm and creamy rather than sharp, you can be a little more generous than with stronger fragrances.' },
      { label: 'When to wear it', text: 'Any time. Morning commute. Office. A casual afternoon out. A relaxed dinner with friends. Vanilla Ember works everywhere because it is never too much. In cooler weather it becomes richer and more comforting.' },
      { label: 'Pro tip', text: 'Layer it with an unscented moisturiser before spraying. Fragrance lasts significantly longer on hydrated skin — especially with warm, creamy scents like this one.' },
    ],

    whoIsThisForHeading: 'Is Vanilla Ember for You?',
    whoIsThisForIntro: 'Vanilla Ember is for anyone who wants to smell effortlessly good, every single day. It is the fragrance people describe as "comforting", "addictive", and "I want to smell this all day." It appeals to a wide range of people — both men and women — and works especially well for younger audiences who want something luxurious without being intimidating.',
    whoIsThisForList: [
      'Want a go-to everyday fragrance that works in any situation',
      'Love warm, sweet, cosy scents without anything sharp or overwhelming',
      'Are looking for a gift — this is the safest, most universally loved pick in the AVORO collection',
      'Want something that smells expensive but does not cost a fortune',
    ],
    whoIsThisForClosing: 'It is not the right fit if you prefer very fresh or very smoky fragrances — consider Blue Amber for freshness or Velvet Oud for something darker.',

    comparison: [
      { label: 'Vibe', velvetOud: 'Dark · Bold · Smoky', vanillaEmber: 'Warm · Soft · Cosy', blueAmber: 'Fresh · Clean · Light' },
      { label: 'Best For', velvetOud: 'Evenings · Special occasions', vanillaEmber: 'Everyday · Office · College', blueAmber: 'Morning · Travel · Casual' },
      { label: 'Intensity', velvetOud: 'Strong', vanillaEmber: 'Medium', blueAmber: 'Light to Medium' },
      { label: 'Weather', velvetOud: 'Cool evenings · AC spaces', vanillaEmber: 'All seasons', blueAmber: 'Summer · Daytime' },
    ],

    promiseHeading: 'Our Promise to You',
    promises: [
      { title: 'Genuine Fragrance', text: 'Full EDP concentration — no dilution, no shortcuts. What you smell is what you get, every time.' },
      { title: 'Gift-Ready Packaging', text: 'Vanilla Ember is one of our most gifted fragrances. It arrives beautifully packaged and ready to give — no extra wrapping needed.' },
      { title: 'Free Shipping Across India', text: 'Free delivery on all orders above ₹999.' },
    ],

    ctaHeading: 'Your New Everyday Favourite.',
    ctaSubtext: 'Vanilla Ember. 50ml Eau de Parfum. ₹1,299.',
    ctaSmallText: 'Loved by thousands of customers across India.',

    ingredientsText: 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Benzyl Salicylate, Coumarin, Benzyl Alcohol, Limonene, Linalool, Anise Alcohol, Benzyl Benzoate, Citral.',
    ingredientsNote: DEFAULT_INGREDIENTS_NOTE,
    performance: {
      longevity: '7 to 9 hours',
      sillage: 'Medium — warm and close-to-skin',
      intensity: 'Medium',
      concentration: '15% pure fragrance oils (Eau de Parfum)',
      tips: DEFAULT_PERFORMANCE_TIPS.map((t) => ({ ...t })),
    },
    faqs: DEFAULT_FAQS.map((f) => ({ ...f })),
  },

  'blue-amber': {
    badge: 'No. 03 · Modern Essential',
    tagline: 'Fresh. Clean. Refined.',
    oneLiner: 'Fresh aquatic notes balanced with smooth amber — an effortless, modern fragrance for every day and every season.',
    trustLine: 'Free shipping on orders above ₹999 · Easy 7-day returns',

    storyHeading: 'What Makes Blue Amber Special',
    storyParagraphs: [
      'Not every great fragrance needs to be complex. Sometimes the best thing you can wear is something that just makes you smell clean, confident, and put together — without any effort at all.',
      'That is Blue Amber.',
      'It opens with bergamot — a bright, citrusy note that is slightly floral and immediately uplifting. If you have ever smelled Earl Grey tea, that slightly citrusy freshness is bergamot. On skin, it is sharper, livelier, and cleaner. It wakes you up and makes you feel like you are ready for the day.',
      'Then come the marine notes — the heart of what makes Blue Amber feel so distinctly fresh. Marine notes are hard to describe unless you have smelled them, but imagine standing at the edge of the sea on a clear morning. That open, airy, cool quality — that is what marine notes bring. It is effortlessly clean without smelling like soap or shampoo.',
      'As the day moves on, white musk and amber settle in underneath. White musk is soft and skin-close — the kind of clean that makes a fragrance feel personal rather than perfume-y. And amber adds just enough warmth to keep it from being too cold or too sharp. The result is a fragrance that works just as well on a hot summer afternoon as it does on a cool morning. Always fresh. Always refined. Never overdone.',
    ],

    notesIntro: 'Blue Amber moves from bright and fresh to warm and clean. Here is how it unfolds on your skin.',
    noteCategories: [
      {
        label: 'Top Notes',
        sublabel: 'first impression — lasts 15 to 30 minutes',
        notes: [
          { name: 'Bergamot', description: 'Bright, citrusy, and slightly floral. This is the opening that makes Blue Amber feel instantly fresh and alive. Think clean energy, not sharp sourness.' },
        ],
      },
      {
        label: 'Heart Notes',
        sublabel: 'the main experience — lasts 2 to 4 hours',
        notes: [
          { name: 'Marine Notes', description: 'Open, airy, and uniquely clean. Marine notes give Blue Amber its signature freshness — cool without being cold, breezy without being light.' },
        ],
      },
      {
        label: 'Base Notes',
        sublabel: 'the lasting finish — stays 5 to 8 hours',
        notes: [
          { name: 'White Musk', description: 'Soft, gentle, and skin-close. White musk makes Blue Amber feel like a second skin — clean and personal without smelling like a product.' },
          { name: 'Amber', description: 'Warm and smooth. Amber grounds the freshness of Blue Amber and stops it from being too sharp, giving it a soft, lasting warmth that carries through to the end.' },
        ],
      },
    ],

    detailsHeading: "What's in the Bottle",
    details: [
      { label: 'Fragrance Type', value: 'Eau de Parfum (EDP)' },
      { label: 'Size', value: '50ml' },
      { label: 'Fragrance Family', value: 'Fresh · Aquatic' },
      { label: 'Gender', value: 'Unisex (leans masculine)' },
      { label: 'Longevity', value: '6 to 8 hours' },
      { label: 'Sillage (Projection)', value: 'Light to Medium — clean and close' },
      { label: 'Season', value: 'Summer · Spring · Great year-round in Indian climate' },
      { label: 'Occasion', value: 'Morning wear · Office · Gym · Travel · Casual outings' },
    ],

    howToWearHeading: 'How to Get the Most Out of Blue Amber',
    howToWearItems: [
      { label: 'Where to spray', text: 'Neck, wrists, and chest. Because Blue Amber is a lighter, fresher fragrance, applying it to pulse points where your skin is warm helps it project well throughout the day.' },
      { label: 'How much to use', text: 'Three to four sprays for a full day. Fresh fragrances tend to be lighter than oud or vanilla ones, so you can be a little more generous without it ever feeling overpowering.' },
      { label: 'When to wear it', text: 'Morning. Every single morning. Blue Amber is the fragrance you spray before stepping out — whether it is a regular workday, a quick trip to the gym, or a weekend errand run. It is also ideal for hot weather, since fresh aquatic fragrances perform exceptionally well in heat.' },
      { label: 'Pro tip', text: 'Spray on clothes as well as skin for longer-lasting freshness. Fabric holds fresh fragrances particularly well — especially on cotton.' },
    ],

    whoIsThisForHeading: 'Is Blue Amber for You?',
    whoIsThisForIntro: 'Blue Amber is for anyone who wants to smell clean, fresh, and effortlessly good every single day. It is the kind of fragrance that never offends, never overwhelms, and always works. It is the safest compliment you will get — "you smell really nice" — and it comes from the simplest choice.',
    whoIsThisForList: [
      'Want a daily fragrance that works in Indian weather, especially summer',
      'Prefer light, fresh, clean scents over heavy or sweet ones',
      'Are new to EDP fragrances and want something easy to wear',
      'Need a fragrance for work, gym, or travel where you cannot go too strong',
      'Want something that smells modern and refined without being complicated',
    ],
    whoIsThisForClosing: 'It is not the right fit if you prefer very fresh or very smoky fragrances — consider Blue Amber for freshness or Velvet Oud for something darker.',

    comparison: [
      { label: 'Vibe', velvetOud: 'Dark · Bold · Smoky', vanillaEmber: 'Warm · Soft · Cosy', blueAmber: 'Fresh · Clean · Light' },
      { label: 'Best For', velvetOud: 'Evenings · Special occasions', vanillaEmber: 'Everyday · Office · College', blueAmber: 'Morning · Travel · Casual' },
      { label: 'Intensity', velvetOud: 'Strong', vanillaEmber: 'Medium', blueAmber: 'Light to Medium' },
      { label: 'Weather', velvetOud: 'Cool evenings · AC spaces', vanillaEmber: 'All seasons', blueAmber: 'Summer · Daytime' },
    ],

    promiseHeading: 'Our Promise to You',
    promises: [
      { title: 'Genuine Fragrance', text: 'Full EDP concentration in every bottle. Real fragrance, real quality — no compromise.' },
      { title: 'Gift-Ready Packaging', text: "Blue Amber arrives in AVORO's clean, premium packaging — a great gift for anyone who appreciates something fresh and modern." },
      { title: 'Free Shipping Across India', text: 'Free delivery on orders above ₹999.' },
    ],

    ctaHeading: 'Smell Fresh. Every Single Day.',
    ctaSubtext: 'Blue Amber. 50ml Eau de Parfum. ₹1,299.',
    ctaSmallText: 'Your new morning essential.',

    ingredientsText: 'Alcohol Denat., Parfum (Fragrance), Aqua (Water), Limonene, Linalool, Citral, Alpha-Isomethyl Ionone, Geraniol, Citronellol, Coumarin, Benzyl Salicylate.',
    ingredientsNote: DEFAULT_INGREDIENTS_NOTE,
    performance: {
      longevity: '6 to 8 hours',
      sillage: 'Light to Medium — clean and close',
      intensity: 'Light to Medium',
      concentration: '15% pure fragrance oils (Eau de Parfum)',
      tips: DEFAULT_PERFORMANCE_TIPS.map((t) => ({ ...t })),
    },
    faqs: DEFAULT_FAQS.map((f) => ({ ...f })),
  },
};
