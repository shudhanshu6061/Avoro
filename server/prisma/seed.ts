import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const products = [
  {
    name: 'Velvet Oud',
    slug: 'velvet-oud',
    description:
      'A rich oud woody fragrance with warm amber and soft leather — designed for unforgettable evenings.',
    notes: ['Smoky Woods', 'Oud', 'Leather', 'Amber'],
    images: ['/images/bottle-noir.png'],
    category: 'woody',
    variants: [
      { size: '50ml', price: 1299, stock: 100, sku: 'VO-50' },
    ],
    isFeatured: true,
  },
  {
    name: 'Vanilla Ember',
    slug: 'vanilla-ember',
    description:
      'Creamy vanilla blended with amber and musk — a comforting, luxurious fragrance you will want to wear every single day.',
    notes: ['Vanilla', 'Tonka Bean', 'Amber', 'Soft Musk'],
    images: ['/images/bottle-ete.png'],
    category: 'oriental',
    variants: [
      { size: '50ml', price: 1299, stock: 100, sku: 'VE-50' },
    ],
    isFeatured: true,
  },
  {
    name: 'Blue Amber',
    slug: 'blue-amber',
    description:
      'Fresh aquatic notes balanced with smooth amber — an effortless, modern fragrance for every day and every season.',
    notes: ['Bergamot', 'Marine Notes', 'White Musk', 'Amber'],
    images: ['/images/bottle-sukoon.png'],
    category: 'fresh',
    variants: [
      { size: '50ml', price: 1299, stock: 100, sku: 'BA-50' },
    ],
    isFeatured: true,
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }
  console.log(`Seeded ${products.length} LUMINA fragrances`);

  // Seed admin user
  const adminPassword = await bcrypt.hash('Shivamlodu@123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'shivamy0012@gmail.com' },
    update: { role: 'ADMIN', password: adminPassword },
    create: {
      firstName: 'Shivam',
      lastName: 'Admin',
      email: 'shivamy0012@gmail.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('Admin user seeded: shivamy0012@gmail.com');

  // Seed Journal categories & articles
  const categories = [
    { name: 'Craft', slug: 'craft' },
    { name: 'Lifestyle', slug: 'lifestyle' },
    { name: 'Guide', slug: 'guide' },
  ];

  const seededCategories: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.journalCategory.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    seededCategories[cat.slug] = created.id;
  }

  const defaultArticles = [
    {
      title: 'The Feeling Behind Every Fragrance',
      slug: 'the-feeling-behind-every-fragrance',
      excerpt: 'Discover the inspiration and emotion behind the AVORO collection.',
      body: '<p>Discover the inspiration and emotion behind the AVORO collection.</p>',
      categoryId: seededCategories['craft'],
      authorId: adminUser.id,
      status: 'PUBLISHED' as const,
      publishedAt: new Date(),
    },
    {
      title: 'Why Certain Fragrances Stay in Memory',
      slug: 'why-certain-fragrances-stay-in-memory',
      excerpt: 'How scent becomes connected to moments and people.',
      body: '<p>How scent becomes connected to moments and people.</p>',
      categoryId: seededCategories['lifestyle'],
      authorId: adminUser.id,
      status: 'PUBLISHED' as const,
      publishedAt: new Date(),
    },
    {
      title: 'Everyday Luxury Starts with Small Rituals',
      slug: 'everyday-luxury-starts-with-small-rituals',
      excerpt: 'Simple moments that make everyday life feel timeless.',
      body: '<p>Simple moments that make everyday life feel timeless.</p>',
      categoryId: seededCategories['guide'],
      authorId: adminUser.id,
      status: 'PUBLISHED' as const,
      publishedAt: new Date(),
    },
  ];

  for (const art of defaultArticles) {
    await prisma.article.upsert({
      where: { slug: art.slug },
      update: art,
      create: art,
    });
  }
  console.log('Journal categories & articles seeded');

  // Seed mock contact messages
  const mockMessages = [
    {
      name: 'Amit Patel',
      email: 'amit.patel@gmail.com',
      subject: 'Inquiry about bulk order discounts',
      message: 'Hello AVORO Team, I would like to order 50 bottles of Velvet Oud for a corporate event. Do you offer bulk discounts or custom packaging for events? Thanks!',
      status: 'NEW' as const,
      source: 'Website Contact Form',
    },
    {
      name: 'Rohan Sharma',
      email: 'rohan.sharma@yahoo.com',
      subject: 'Delivery issue',
      message: 'Hi, I ordered a bottle of Vanilla Ember 3 days ago, and the status still shows PROCESSING. Can you please check if it has been shipped? Order ID is #VO-9901.',
      status: 'READ' as const,
      source: 'Website Contact Form',
      internalNotes: 'Checked status. Shipped yesterday. Updated tracker.',
    },
    {
      name: 'Sarah Dsouza',
      email: 'sarah.d@outlook.com',
      subject: 'Fragrance Recommendation',
      message: 'Hello, I prefer sweet and woody perfumes. Should I go with Vanilla Ember or Velvet Oud? Also, does Velvet Oud have a strong leather note? Thanks.',
      status: 'REPLIED' as const,
      source: 'Website Contact Form',
      replyEmailSent: true,
      internalNotes: 'Emailed Sarah recommending Velvet Oud with notes descriptions.',
    },
    {
      name: 'Divya Nair',
      email: 'divya.nair@hotmail.com',
      subject: 'Collaboration query',
      message: 'Hi, I am a lifestyle influencer on Instagram (50k followers). I love AVORO perfumes and would like to review them on my page. Let me know if you are open to collaborations.',
      status: 'ARCHIVED' as const,
      source: 'Website Contact Form',
      internalNotes: 'Archived for future influencer campaign.',
    },
  ];

  for (const msg of mockMessages) {
    const existing = await prisma.contactMessage.findFirst({
      where: { email: msg.email, subject: msg.subject },
    });
    if (!existing) {
      await prisma.contactMessage.create({
        data: msg,
      });
    }
  }
  console.log('Contact messages seeded');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
