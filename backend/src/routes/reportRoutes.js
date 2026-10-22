import { Router } from 'express';
import {
  getSimilarIssues,
  createIssue,
  upvoteIssue,
} from '../controllers/reportController.js';
import { uploadIssuePhotos } from '../middlewares/uploadMiddleware.js';

const router = Router();

// GET /api/v1/issues/similar?buildingId=...&categoryId=...
// Intercepts duplicates by searching open issues in the same location and category
router.get('/similar', getSimilarIssues);

// POST /api/v1/issues
// Submits a new issue with 1 to 3 photo evidence files
router.post('/', uploadIssuePhotos, createIssue);

// POST /api/v1/issues/:id/reports
// Upvotes / re-reports an existing issue ("I'm facing this too")
router.post('/:id/reports', upvoteIssue);

export default router;
