import { Router } from 'express';
import {
  checkPincodeServiceability,
  syncOrderToShiprocket,
  assignAWB,
  generatePickup,
  getShippingLabel,
  getShiprocketInvoice,
  trackOrder,
  handleShiprocketWebhook,
  getPickupLocations,
} from '../controllers/shipping.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();

// Public routes
router.get('/serviceability', checkPincodeServiceability);
router.get('/orders/:orderId/track', trackOrder);

// Webhook endpoint (Public for Shiprocket callbacks)
router.post('/webhook/shiprocket', handleShiprocketWebhook);

// Admin-only routes
router.get('/pickup-locations', requireAdmin, getPickupLocations);
router.post('/orders/:orderId/sync', requireAdmin, syncOrderToShiprocket);
router.post('/orders/:orderId/assign-awb', requireAdmin, assignAWB);
router.post('/orders/:orderId/generate-pickup', requireAdmin, generatePickup);
router.get('/orders/:orderId/label', requireAdmin, getShippingLabel);
router.get('/orders/:orderId/invoice', requireAdmin, getShiprocketInvoice);

export default router;
