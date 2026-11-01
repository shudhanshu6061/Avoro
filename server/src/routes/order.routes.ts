import { Router } from 'express';
import { createOrder, verifyPayment, saveOrder, getUserOrders } from '../controllers/order.controller';
import { optionalAuth, requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.post('/create', createOrder);
router.post('/verify', verifyPayment);
router.post('/save',   optionalAuth, saveOrder);
router.get('/my',      requireAuth,  getUserOrders);

export default router;
