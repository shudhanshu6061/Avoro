import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { prisma } from './lib/prisma';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import adminRoutes from './routes/admin';
import uploadRoutes from './routes/upload.routes';
import discountRoutes from './routes/discount.routes';
import reviewRoutes from './routes/review.routes';
import adminReviewRoutes from './routes/admin/review.routes';
import articleRoutes from './routes/article.routes';
import seoRoutes from './routes/seo.routes';
import subscriberRoutes from './routes/subscriber.routes';
import contactRoutes from './routes/contact.routes';
import shippingRoutes from './routes/shipping.routes';
import { requireAdminSecret } from './middleware/adminSecret.middleware';
import { getPageContentPreset } from './lib/productPageContent';
import { generateOrderNumber } from './lib/orderNumber';


const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [/\.onrender\.com$/, /\.vercel\.app$/, 'https://avoro.in', 'https://www.avoro.in', 'https://admin.avoro.in'] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin/reviews', adminReviewRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/contact', contactRoutes);


// Health check — verifies API + database connectivity
app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const [products, users, orders] = await Promise.all([
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.count(),
    ]);
    res.json({
      status: 'ok',
      database: 'connected',
      counts: { products, users, orders },
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Database unreachable';
    res.status(503).json({ status: 'error', database: 'disconnected', message });
  }
});

// Public settings endpoint (for checkout delivery config)
app.get('/api/settings/public', async (_req, res) => {
  try {
    const settings = await prisma.storeSetting.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s: any) => { map[s.key] = s.value; });
    res.json(map);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Root Endpoint
app.get('/', (req, res) => {
  res.send('AVORO API is running (PostgreSQL)...');
});

// Endpoint to trigger database migrations (for production without shell)
app.post('/api/admin/migrate', requireAdminSecret, async (req, res) => {
  try {
    const { execSync } = require('child_process');
    console.log('Running database push...');
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('Database push completed');
    res.json({ message: 'Database push completed successfully. To seed admin user, use /api/admin/seed' });
  } catch (error: any) {
    console.error('Migration failed:', error);
    res.status(500).json({ message: 'Migration failed', error: error.message });
  }
});

// Separate endpoint for seeding - direct Prisma seed
app.post('/api/admin/seed', requireAdminSecret, async (req, res) => {
  try {
    console.log('Seeding admin user...');
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('Testuser@123', 10);
    
    const user = await prisma.user.upsert({
      where: { email: 'testuser@gmail.com' },
      update: {},
      create: {
        email: 'testuser@gmail.com',
        firstName: 'Test',
        lastName: 'User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    
    console.log('Admin user seeded successfully');
    res.json({ message: 'Admin user seeded successfully', user: { email: user.email, role: user.role } });
  } catch (error: any) {
    console.error('Seed failed:', error);
    res.status(500).json({ message: 'Seed failed', error: error.message });
  }
});

// Seed products endpoint (hit once on production to populate catalog)
app.post('/api/admin/seed-products', requireAdminSecret, async (req, res) => {
  try {
    const products = [
      {
        name: 'Velvet Oud',
        slug: 'velvet-oud',
        description: 'A deep, smoky fragrance with rich oud, warm sandalwood and a touch of saffron. Bold, mysterious and unapologetically masculine.',
        notes: ['Oud', 'Saffron', 'Sandalwood', 'Leather', 'Amber'],
        images: [],
        category: 'Signature',
        variants: [{ sku: 'VO-50', size: '50ml', price: 1299, stock: 100 }],
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Vanilla Ember',
        slug: 'vanilla-ember',
        description: 'Creamy vanilla blended with amber and musk — a comforting, luxurious fragrance you will want to wear every single day.',
        notes: ['Vanilla', 'Amber', 'Musk', 'Caramel', 'Tonka Bean'],
        images: [],
        category: 'Signature',
        variants: [{ sku: 'VE-50', size: '50ml', price: 1299, stock: 100 }],
        isFeatured: true,
        isActive: true,
      },
      {
        name: 'Blue Amber',
        slug: 'blue-amber',
        description: 'Fresh aquatic notes balanced with smooth amber — an effortless, modern fragrance for every day and every season.',
        notes: ['Bergamot', 'Marine Notes', 'White Musk', 'Amber'],
        images: [],
        category: 'Signature',
        variants: [{ sku: 'BA-50', size: '50ml', price: 1299, stock: 100 }],
        isFeatured: true,
        isActive: true,
      },
    ];

    const results = [];
    for (const p of products) {
      const product = await prisma.product.upsert({
        where: { slug: p.slug },
        update: {
          name: p.name,
          description: p.description,
          notes: p.notes,
          category: p.category,
          variants: p.variants,
          isFeatured: p.isFeatured,
          isActive: p.isActive,
          pageContent: getPageContentPreset(p.slug) as object | undefined,
        },
        create: { ...p, pageContent: getPageContentPreset(p.slug) as object | undefined },
      });
      results.push({ name: product.name, slug: product.slug });
    }

    res.json({ message: 'Products seeded', products: results });
  } catch (error: any) {
    console.error('Product seed failed:', error);
    res.status(500).json({ message: 'Seed failed', error: error.message });
  }
});

// One-time backfill: assigns orderNumbers to all existing orders that don't have one
// Call once after deploying the schema change:
//   curl -X POST https://your-api.com/api/admin/backfill-order-numbers \
//        -H "x-admin-secret: YOUR_SECRET"
app.post('/api/admin/backfill-order-numbers', requireAdminSecret, async (_req, res) => {
  try {
    // Fetch all orders missing an orderNumber, in chronological order so sequences are correct
    const orders = await prisma.order.findMany({
      where:   { orderNumber: null },
      orderBy: { createdAt: 'asc' },
      select:  { id: true, createdAt: true },
    });

    if (orders.length === 0) {
      res.json({ message: 'All orders already have an orderNumber.', updated: 0 });
      return;
    }

    let updated = 0;
    const errors: string[] = [];

    for (const order of orders) {
      try {
        const orderNumber = await generateOrderNumber(prisma, order.createdAt);
        await prisma.order.update({
          where: { id: order.id },
          data:  { orderNumber },
        });
        updated++;
      } catch (e: any) {
        errors.push(`Order ${order.id}: ${e.message}`);
      }
    }

    console.log(`Backfill complete: ${updated} orders updated, ${errors.length} errors`);
    res.json({
      message: `Backfill complete.`,
      updated,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('Backfill failed:', error);
    res.status(500).json({ message: 'Backfill failed', error: error.message });
  }
});

if (process.env.VERCEL !== '1') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

export default app;
