import { Router } from 'express';
import { getSimilarIssues, createIssue } from '../controllers/reportController.js';
import { uploadIssuePhotos } from '../middlewares/uploadMiddleware.js';

const router = Router();

// GET /api/v1/issues/similar?buildingId=...&categoryId=...
// Intercepts duplicates by searching open issues in the same location and category
router.get('/similar', getSimilarIssues);

// POST /api/v1/issues
// Submits a new issue with 1 to 3 photo evidence files
router.post('/', uploadIssuePhotos, createIssue);

export default router;
