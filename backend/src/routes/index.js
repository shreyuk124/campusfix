import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import reportRoutes from './reportRoutes.js';
import {
  triageIssueRouter,
  categoryRouter,
  buildingRouter,
  teamRouter,
} from './triageRoutes.js';

const router = Router();

// Base API endpoints
router.use('/health', healthRoutes);
router.use('/categories', categoryRouter);
router.use('/buildings', buildingRouter);
router.use('/teams', teamRouter);

// Issue endpoints (Member 2 creation & duplicates; Member 4 triage & status transitions)
router.use('/issues', reportRoutes);
router.use('/issues', triageIssueRouter);

export default router;
