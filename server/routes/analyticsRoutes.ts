import { Router } from 'express';
import { getDashboardAnalytics, compareProducts } from '../controllers/analyticsController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', optionalAuth, getDashboardAnalytics);
router.post('/compare', optionalAuth, compareProducts);

export default router;
