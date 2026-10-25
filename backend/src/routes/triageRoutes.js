import { Router } from 'express';
import {
  getCategories,
  getBuildings,
  getTeams,
  assignIssue,
  updateIssueStatus,
} from '../controllers/triageController.js';
import { tempAuth, requireAdmin } from '../middlewares/tempAuthMiddleware.js';

// Router for issue triage and lifecycle transitions (mounted under /issues)
export const triageIssueRouter = Router();
triageIssueRouter.post('/:id/assign', tempAuth, requireAdmin, assignIssue);
triageIssueRouter.patch('/:id/status', tempAuth, requireAdmin, updateIssueStatus);

// Routers for public catalog endpoints
export const categoryRouter = Router();
categoryRouter.get('/', getCategories);

export const buildingRouter = Router();
buildingRouter.get('/', getBuildings);

export const teamRouter = Router();
teamRouter.get('/', getTeams);

export default triageIssueRouter;
