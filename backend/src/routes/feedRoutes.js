/**
 * backend/src/routes/feedRoutes.js
 * 
 * Member 3: Public Feed & Browsing Routes.
 * 
 * Endpoint Mapping:
 * - GET /api/v1/issues/mine  --> getMyIssues (Protected: requires authMiddleware)
 * - GET /api/v1/issues       --> getFeed (Public)
 * - GET /api/v1/issues/:id   --> getIssueById (Public)
 * 
 * CRITICAL ROUTE PRECEDENCE:
 * The static route '/mine' MUST be registered BEFORE the dynamic route '/:id'.
 * Otherwise, Express will match '/mine' as an issue ID parameter (:id = 'mine')
 * and fail with an invalid identifier format error.
 */

import { Router } from 'express';
import {
  getFeed,
  getIssueById,
  getMyIssues,
} from '../controllers/feedController.js';

/**
 * Factory to configure the feed router with optional dependencies (e.g. authMiddleware)
 * @param {Object} [options]
 * @param {Function} [options.authMiddleware] - Varsh's protect middleware (when available)
 * @param {Object} [options.controller] - Custom controller instance (for testing/DI)
 * @returns {Router} Configured Express router
 */
export function createFeedRouter({ authMiddleware = null, controller = null } = {}) {
  const router = Router();

  const ctrl = controller || {
    getFeed,
    getIssueById,
    getMyIssues,
  };

  // 1. STATIC ROUTE: Authenticated student's own issues (MUST precede /:id)
  if (typeof authMiddleware === 'function') {
    router.get('/mine', authMiddleware, ctrl.getMyIssues);
  } else {
    // When authMiddleware is not yet connected, the controller will inspect req.user
    // and cleanly reject with 401 UNAUTHORIZED if unauthenticated.
    router.get('/mine', ctrl.getMyIssues);
  }

  // 2. COLLECTION ROUTE: Public feed with filtering, sorting and pagination
  router.get('/', ctrl.getFeed);

  // 3. DYNAMIC ROUTE: Issue details by ObjectId or refId
  router.get('/:id', ctrl.getIssueById);

  return router;
}

import { protect } from '../middlewares/authMiddleware.js';

// Default router instance connected with live auth protect middleware
export const feedRouter = createFeedRouter({ authMiddleware: protect });

export default feedRouter;
