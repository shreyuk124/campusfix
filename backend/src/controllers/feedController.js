/**
 * backend/src/controllers/feedController.js
 * 
 * Member 3: Public Feed & Browsing Controller.
 * Handles:
 * - GET /api/v1/issues (Public feed with filtering, sorting, pagination)
 * - GET /api/v1/issues/:id (Comprehensive single issue details)
 * - GET /api/v1/issues/mine (Authenticated student's submitted issues)
 * 
 * Dependency-Independent Design:
 * - Accepts an injected Issue model / repository, or uses setIssueModel().
 * - Does NOT create a competing Mongoose model or fake database queries.
 * - Enforces Privacy Rule §9: Strips student personal identifiers from public outputs.
 */

import {
  parsePagination,
  parseSort,
  buildFilter,
  formatPaginationMeta,
  validateIssueId,
  QueryValidationError,
} from '../utils/feedQueryHelpers.js';

let registeredIssueModel = null;

/**
 * Configure the active Issue model when teammate implementation arrives
 * @param {Object} model - Mongoose Issue model
 */
export function setIssueModel(model) {
  registeredIssueModel = model;
}

/**
 * Helper to get the model or return null
 */
function getModel(overrideModel) {
  return overrideModel || registeredIssueModel;
}

/**
 * Sanitizes an issue document for public consumption.
 * Privacy Rule §9: Reporter identity is NEVER exposed to public callers.
 * @param {Object} doc - Raw issue object or Mongoose document
 * @returns {Object} Public-safe issue object
 */
export function sanitizePublicIssue(doc) {
  if (!doc) return null;
  const issue = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };

  // Never leak sensitive user fields from populated createdBy
  if (issue.createdBy && typeof issue.createdBy === 'object') {
    issue.createdBy = {
      role: issue.createdBy.role || 'student',
    };
  } else {
    delete issue.createdBy;
  }

  // Remove internal/private metadata if any
  delete issue.__v;
  delete issue.password;

  return issue;
}

/**
 * Factory to create feed controller methods with optional dependency injection
 * @param {Object} [deps] - Dependencies { issueModel }
 */
export function createFeedController(deps = {}) {
  /**
   * GET /api/v1/issues
   * Public Feed with filters, sorting, and pagination
   */
  async function getFeed(req, res, next) {
    try {
      const Model = getModel(deps.issueModel);
      if (!Model) {
        return res.status(503).json({
          success: false,
          error: {
            code: 'DEPENDENCY_UNAVAILABLE',
            message: 'Issue model is not connected. Pending Member 2 model integration.',
          },
        });
      }

      const { page, limit, skip } = parsePagination(req.query);
      const { sortObj } = parseSort(req.query.sort);
      const filter = buildFilter(req.query);

      // Execute query with standard Mongoose populate paths
      const query = Model.find(filter)
        .sort(sortObj)
        .skip(skip)
        .limit(limit);

      if (typeof query.populate === 'function') {
        query
          .populate('building', 'name campus')
          .populate('category', 'label baseSeverity icon')
          .populate('createdBy', 'role');
      }

      const [rawIssues, total] = await Promise.all([
        query.exec ? query.exec() : query,
        Model.countDocuments ? Model.countDocuments(filter) : Promise.resolve(0),
      ]);

      const sanitizedData = Array.isArray(rawIssues)
        ? rawIssues.map(sanitizePublicIssue)
        : [];

      return res.status(200).json({
        success: true,
        data: sanitizedData,
        pagination: formatPaginationMeta(total, page, limit),
      });
    } catch (err) {
      if (err instanceof QueryValidationError) {
        return res.status(err.statusCode).json({
          success: false,
          error: {
            code: err.code,
            field: err.field,
            message: err.message,
          },
        });
      }
      return next ? next(err) : res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * GET /api/v1/issues/:id
   * Single issue details (by 24-char ObjectId or CF-YYYY-XXXX reference code)
   */
  async function getIssueById(req, res, next) {
    try {
      const Model = getModel(deps.issueModel);
      if (!Model) {
        return res.status(503).json({
          success: false,
          error: {
            code: 'DEPENDENCY_UNAVAILABLE',
            message: 'Issue model is not connected. Pending Member 2 model integration.',
          },
        });
      }

      const { isRefId, normalizedId } = validateIssueId(req.params.id);

      // Support finding by either refId (e.g. CF-2026-0042) or MongoDB _id
      const queryCriteria = isRefId ? { refId: normalizedId } : { _id: normalizedId };

      let query = Model.findOne(queryCriteria);
      if (typeof query.populate === 'function') {
        query = query
          .populate('building', 'name campus')
          .populate('category', 'label baseSeverity icon')
          .populate('createdBy', 'role');
      }

      const rawIssue = await (query.exec ? query.exec() : query);

      if (!rawIssue) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: `Issue with identifier "${req.params.id}" not found`,
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: sanitizePublicIssue(rawIssue),
      });
    } catch (err) {
      if (err instanceof QueryValidationError) {
        return res.status(err.statusCode).json({
          success: false,
          error: {
            code: err.code,
            field: err.field,
            message: err.message,
          },
        });
      }
      return next ? next(err) : res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  /**
   * GET /api/v1/issues/mine
   * Authenticated student's submitted issues
   * Requires: req.user._id (populated by Varsh's authMiddleware)
   */
  async function getMyIssues(req, res, next) {
    try {
      // 1. Verify authentication state
      const userId = req.user?._id || req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required. Token missing or invalid.',
          },
        });
      }

      const Model = getModel(deps.issueModel);
      if (!Model) {
        return res.status(503).json({
          success: false,
          error: {
            code: 'DEPENDENCY_UNAVAILABLE',
            message: 'Issue model is not connected. Pending Member 2 model integration.',
          },
        });
      }

      const { page, limit, skip } = parsePagination(req.query);

      // Filter exclusively by the logged-in student's ID
      const filter = { createdBy: userId };

      const query = Model.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      if (typeof query.populate === 'function') {
        query
          .populate('building', 'name campus')
          .populate('category', 'label icon');
      }

      const [rawIssues, total] = await Promise.all([
        query.exec ? query.exec() : query,
        Model.countDocuments ? Model.countDocuments(filter) : Promise.resolve(0),
      ]);

      const data = Array.isArray(rawIssues)
        ? rawIssues.map((doc) => {
            const item = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
            delete item.__v;
            return item;
          })
        : [];

      return res.status(200).json({
        success: true,
        data,
        pagination: formatPaginationMeta(total, page, limit),
      });
    } catch (err) {
      if (err instanceof QueryValidationError) {
        return res.status(err.statusCode).json({
          success: false,
          error: {
            code: err.code,
            field: err.field,
            message: err.message,
          },
        });
      }
      return next ? next(err) : res.status(500).json({ success: false, error: { message: err.message } });
    }
  }

  return {
    getFeed,
    getIssueById,
    getMyIssues,
  };
}

// Default controller instance
const defaultController = createFeedController();
export const getFeed = defaultController.getFeed;
export const getIssueById = defaultController.getIssueById;
export const getMyIssues = defaultController.getMyIssues;

export default {
  createFeedController,
  setIssueModel,
  sanitizePublicIssue,
  getFeed,
  getIssueById,
  getMyIssues,
};
