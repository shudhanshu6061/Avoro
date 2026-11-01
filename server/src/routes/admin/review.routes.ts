import { Router } from 'express';
import { requireAdmin } from '../../middleware/admin.middleware';
import { listReviews, getReview, updateReviewApproval, deleteReview } from '../../controllers/admin/review.controller';

const router = Router();

// All routes here require admin
router.get('/', requireAdmin, listReviews);
router.get('/:id', requireAdmin, getReview);
router.patch('/:id/approve', requireAdmin, updateReviewApproval);
router.delete('/:id', requireAdmin, deleteReview);

export default router;
