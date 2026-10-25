import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import reportRoutes from './reportRoutes.js';
import feedRoutes from './feedRoutes.js';
import {
  triageIssueRouter,
  categoryRouter,
  buildingRouter,
  teamRouter,
} from './triageRoutes.js';

const router = Router();

// Base API endpoints
router.use('/health', healthRoutes);

// Catalog endpoints (Categories, Buildings, Teams)
router.use('/categories', categoryRouter);
router.use('/buildings', buildingRouter);
router.use('/teams', teamRouter);

// Issue endpoints
// 1. Reporting, duplicates & upvotes
router.use('/issues', reportRoutes);

// 2. Staff/Admin triage & workflow transitions
router.use('/issues', triageIssueRouter);

// 3. Public feed queries, pagination, issue details & student's my-issues
router.use('/issues', feedRoutes);

export default router;
