import { Router } from 'express';
import { submitReview, getApprovedReviews, getReviewStats } from '../controllers/review.controller';

const router = Router();

// Public endpoints
router.post('/', submitReview);                    // Submit a review (pending)
router.get('/', getApprovedReviews);               // ?productId=xxx → approved reviews for product
router.get('/stats', getReviewStats);              // ?productId=xxx → average + count

export default router;
