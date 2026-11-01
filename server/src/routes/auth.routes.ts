import { Router } from 'express';
import { register, login, logout, sendOtp, verifyOtp, updateProfile, getMe } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

router.get('/me', requireAuth, getMe);
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.put('/profile', requireAuth, updateProfile);

export default router;



