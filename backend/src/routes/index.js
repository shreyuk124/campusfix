import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import feedRoutes from './feedRoutes.js';

const router = Router();

// Base API endpoints
router.use('/health', healthRoutes);
router.use('/issues', feedRoutes);

export default router;
