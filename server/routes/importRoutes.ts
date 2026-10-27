import { Router } from 'express';
import {
  importAmazonProductReviews,
  importFlipkartProductReviews,
  analyzeMultiPlatformProduct,
} from '../controllers/importController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/import/amazon
router.post('/amazon', optionalAuth, importAmazonProductReviews);

// POST /api/import/flipkart
router.post('/flipkart', optionalAuth, importFlipkartProductReviews);

// POST /api/import/analyze (Multi-platform import)
router.post('/analyze', optionalAuth, analyzeMultiPlatformProduct);

export default router;
