import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/auth.middleware';
import { generateOrderNumber } from '../lib/orderNumber';

const getRazorpayInstance = (): Razorpay | null => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) return null;
  return new Razorpay({ key_id, key_secret });
};

// POST /api/orders/create
// Body: { amount: number (in rupees), currency?: string }
export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      res.status(503).json({ message: 'Payment service not configured' });
      return;
    }

    const { amount, currency = 'INR', notes = {} } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ message: 'Invalid amount' });
      return;
    }

    const options = {
      amount:   Math.round(amount * 100), // Razorpay expects paise
      currency,
      receipt:  `receipt_${Date.now()}`,
      notes,
    };

    const order = await razorpay.orders.create(options);

    res.status(201).json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error('Razorpay createOrder error:', error);
    res.status(500).json({ message: error.message || 'Failed to create order' });
  }
};

// POST /api/orders/save
// Body: { razorpay_payment_id, razorpay_order_id, items, shippingAddress, itemsPrice, shippingPrice, totalPrice }
export const saveOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { razorpay_payment_id, razorpay_order_id, items, shippingAddress, itemsPrice, shippingPrice, taxPrice, totalPrice } = req.body;

    const order = await prisma.order.create({
      data: {
        userId:          req.userId ?? null,
        guestEmail:      shippingAddress?.email ?? null,
        shippingAddress,
        paymentMethod:   'Razorpay',
        paymentResult:   { id: razorpay_payment_id, razorpayOrderId: razorpay_order_id, status: 'paid' },
        itemsPrice:      itemsPrice  ?? 0,
        taxPrice:        taxPrice ?? 0,
        shippingPrice:   shippingPrice ?? 0,
        totalPrice:      totalPrice ?? 0,
        isPaid:          true,
        paidAt:          new Date(),
        status:          'PROCESSING',
        orderItems: {
          create: (items ?? []).map((item: { productId?: string; name: string; size: string; quantity: number; price: number }) => ({
            productId: item.productId || 'unknown',
            name:      item.name,
            size:      item.size,
            quantity:  item.quantity,
            price:     item.price,
          })),
        },
      },
      include: { orderItems: true },
    });

    // Reduce stock for each ordered item
    for (const item of (items ?? [])) {
      if (!item.productId || item.productId === 'unknown') continue;
      try {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (product && Array.isArray(product.variants)) {
          const updatedVariants = (product.variants as any[]).map((v: any) => {
            if (v.size === item.size) {
              return { ...v, stock: Math.max(0, (v.stock || 0) - (item.quantity || 1)) };
            }
            return v;
          });
          await prisma.product.update({ where: { id: item.productId }, data: { variants: updatedVariants } });
        }
      } catch (e) {
        console.error('Stock reduction error for product', item.productId, e);
      }
    }

    // Generate and assign the sequential order number
    try {
      const orderNumber = await generateOrderNumber(prisma, order.createdAt);
      const updatedOrder = await prisma.order.update({
        where:   { id: order.id },
        data:    { orderNumber },
        include: { orderItems: true },
      });
      res.status(201).json(updatedOrder);
    } catch (numErr) {
      // If number generation fails, still return the order (fallback gracefully)
      console.error('Order number generation error:', numErr);
      res.status(201).json(order);
    }
  } catch (error: any) {
    console.error('saveOrder error:', error);
    res.status(500).json({ message: error.message || 'Failed to save order' });
  }
};

// GET /api/orders/my
export const getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) { res.status(401).json({ message: 'Not authenticated' }); return; }

    const orders = await prisma.order.findMany({
      where:   { userId: req.userId },
      include: { orderItems: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch orders' });
  }
};

// POST /api/orders/verify
// Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
export const verifyPayment = (req: Request, res: Response): void => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ message: 'Missing payment verification fields' });
      return;
    }

    const body      = razorpay_order_id + '|' + razorpay_payment_id;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      res.status(400).json({ message: 'Payment verification failed. Signature mismatch.' });
      return;
    }

    res.status(200).json({
      verified:   true,
      paymentId:  razorpay_payment_id,
      orderId:    razorpay_order_id,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Verification error' });
  }
};
