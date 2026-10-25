import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import reportRoutes from './reportRoutes.js';
import feedRoutes from './feedRoutes.js';

const router = Router();

// Base API endpoints
router.use('/health', healthRoutes);

// Mount issue reporting, duplicate interception, upvoting & status transitions
router.use('/issues', reportRoutes);

// Mount public feed queries, pagination, issue details & student's my-issues
router.use('/issues', feedRoutes);

export default router;
