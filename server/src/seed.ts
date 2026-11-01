import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with updated AVORO signature collection...');

  // 1. Clean existing data
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@avoro.com',
      password: hashedPassword,
      role: 'ADMIN',
      twoFactorEnabled: false,
    },
  });

  const customer = await prisma.user.create({
    data: {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      password: hashedPassword,
      role: 'CUSTOMER',
    },
  });

  console.log('Users created:', { adminEmail: admin.email, customerEmail: customer.email });

  // 3. Create Products matching Signature Collection
  const products = [
    {
      name: 'AVORO SUKOON',
      slug: 'avoro-sukoon',
      description: 'A warm, soft, and addictive cocoon of vanilla and golden amber. Sukoon wraps you in absolute tranquility and sensual comfort.',
      notes: ['Top: Bergamot, Heliotrope', 'Heart: Vanilla Orchids, Tonka Bean', 'Base: Amber, Soft White Musk'],
      images: ['/images/perfume-1.png'],
      category: 'floral',
      isFeatured: true,
      variants: [
        { size: '50ml', price: 559.0, originalPrice: 999.0, stock: 50, sku: 'AV-SUK-50' },
        { size: '100ml', price: 999.0, originalPrice: 1799.0, stock: 35, sku: 'AV-SUK-100' },
      ],
    },
    {
      name: 'AVORO ÉTÉ',
      slug: 'avoro-ete',
      description: 'A fresh, clean, and effortless breath of summer. Reminiscent of a gentle coastal breeze rustling through neroli and orange blossoms.',
      notes: ['Top: Bergamot, Marine Notes', 'Heart: Neroli, Orange Blossom', 'Base: White Musk, Dry Amber'],
      images: ['/images/perfume-2.png'],
      category: 'fresh',
      isFeatured: true,
      variants: [
        { size: '50ml', price: 699.0, originalPrice: 1199.0, stock: 40, sku: 'AV-ETE-50' },
        { size: '100ml', price: 1199.0, originalPrice: 1999.0, stock: 25, sku: 'AV-ETE-100' },
      ],
    },
    {
      name: 'AVORO NOIR',
      slug: 'avoro-noir',
      description: 'A deep, rich, and unforgettable journey into the night. Bold notes of precious oud, smooth leather, and smoldering woods create a sophisticated signature.',
      notes: ['Top: Cardamom, Cinnamon', 'Heart: Smoky Woods, Leather, Patchouli', 'Base: Dark Oud, Amber, Musk'],
      images: ['/images/perfume-3.png'],
      category: 'woody',
      isFeatured: true,
      variants: [
        { size: '50ml', price: 899.0, originalPrice: 1499.0, stock: 30, sku: 'AV-NOI-50' },
        { size: '100ml', price: 1499.0, originalPrice: 2499.0, stock: 20, sku: 'AV-NOI-100' },
      ],
    },
  ];

  for (const product of products) {
    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        notes: product.notes,
        images: product.images,
        category: product.category,
        isFeatured: product.isFeatured,
        variants: product.variants, // JSON array
      },
    });
  }

  console.log('Signature Collection seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
