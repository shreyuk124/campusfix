import { Router } from 'express';
import { getSimilarIssues } from '../controllers/reportController.js';

const router = Router();

// GET /api/v1/issues/similar?buildingId=...&categoryId=...
// Intercepts duplicates by searching open issues in the same location and category
router.get('/similar', getSimilarIssues);

export default router;
