import { Router } from 'express';
import { subscribeEmail } from '../controllers/subscriber.controller';

const router = Router();

// Public subscription endpoint
router.post('/', subscribeEmail);

export default router;
