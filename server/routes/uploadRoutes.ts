import { Router } from 'express';
import { uploadMiddleware, previewCsv, importCsv } from '../controllers/uploadController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/csv/preview', requireAuth, uploadMiddleware.single('file'), previewCsv);
router.post('/csv/import', requireAuth, uploadMiddleware.single('file'), importCsv);

export default router;
