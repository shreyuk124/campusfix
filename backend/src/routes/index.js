import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import reportRoutes from './reportRoutes.js';

const router = Router();

// Base API endpoints
router.use('/health', healthRoutes);
router.use('/issues', reportRoutes);

export default router;
