import { Router } from 'express';
import {
  analyzeSingleReviewById,
  analyzeProductReviewsBatch,
  getProductSummary,
  getSuspiciousReviews,
} from '../controllers/analysisController.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/review/:reviewId', requireAuth, analyzeSingleReviewById);
router.post('/product/:productId/batch', requireAuth, analyzeProductReviewsBatch);
router.get('/product/:productId/summary', optionalAuth, getProductSummary);
router.get('/suspicious', optionalAuth, getSuspiciousReviews);

export default router;
