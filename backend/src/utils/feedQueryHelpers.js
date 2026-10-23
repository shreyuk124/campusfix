/**
 * backend/src/utils/feedQueryHelpers.js
 * 
 * Pure query-parameter validation and normalization helpers for Public Feed & Browsing.
 * Independent of Mongoose models and MongoDB connections.
 * 
 * Conforms to Member 3 API specifications:
 * - GET /api/v1/issues
 * - GET /api/v1/issues/:id
 * - GET /api/v1/issues/mine
 */

export const ALLOWED_CAMPUSES = Object.freeze(['north', 'south']);

export const ALLOWED_STATUSES = Object.freeze([
  'Reported',
  'Assigned',
  'In Progress',
  'Resolved',
  'Closed',
  'Reopened',
]);

export const ALLOWED_SORTS = Object.freeze(['newest', 'priority', 'overdue']);

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 50;

/**
 * Custom ValidationError for query parsing
 */
export class QueryValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'QueryValidationError';
    this.statusCode = 400;
    this.code = 'BAD_REQUEST';
    this.field = field;
  }
}

/**
 * Validates and normalizes pagination parameters
 * @param {Object} query - Express req.query object
 * @returns {{ page: number, limit: number, skip: number }}
 */
export function parsePagination(query = {}) {
  let page = DEFAULT_PAGE;
  let limit = DEFAULT_LIMIT;

  if (query.page !== undefined && query.page !== null && query.page !== '') {
    const parsedPage = Number(query.page);
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      throw new QueryValidationError('Page parameter must be a positive integer', 'page');
    }
    page = parsedPage;
  }

  if (query.limit !== undefined && query.limit !== null && query.limit !== '') {
    const parsedLimit = Number(query.limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1) {
      throw new QueryValidationError('Limit parameter must be a positive integer', 'limit');
    }
    // Enforce maximum page size to prevent Denial of Service
    limit = Math.min(parsedLimit, MAX_LIMIT);
  }

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Maps public sort key to MongoDB sort specification
 * @param {string} [sortParam] - e.g. 'newest', 'priority', 'overdue'
 * @returns {{ sortObj: Object, sortKey: string, pendingSchemaNote?: string }}
 */
export function parseSort(sortParam) {
  if (!sortParam || sortParam === '') {
    return {
      sortKey: 'newest',
      sortObj: { createdAt: -1 },
    };
  }

  const normalized = String(sortParam).trim().toLowerCase();

  if (!ALLOWED_SORTS.includes(normalized)) {
    throw new QueryValidationError(
      `Invalid sort parameter: "${sortParam}". Allowed values: ${ALLOWED_SORTS.join(', ')}`,
      'sort'
    );
  }

  switch (normalized) {
    case 'priority':
      return {
        sortKey: 'priority',
        // Sort highest priority score first, break ties with newest
        sortObj: { priorityScore: -1, createdAt: -1 },
      };

    case 'overdue':
      // Integration Note: Depends on agreed SLA / deadline field in Issue model
      // We sort by slaDeadline ascending (nearest deadline / overdue first), fallback to createdAt
      return {
        sortKey: 'overdue',
        sortObj: { slaDeadline: 1, createdAt: -1 },
        pendingSchemaNote: 'Requires slaDeadline or targetResolutionDate on Issue schema',
      };

    case 'newest':
    default:
      return {
        sortKey: 'newest',
        sortObj: { createdAt: -1 },
      };
  }
}

/**
 * Validates and builds schema-safe filter criteria
 * Ignores arbitrary/unwhitelisted keys to prevent NoSQL operator injection
 * @param {Object} query - Express req.query object
 * @returns {Object} Clean MongoDB filter object
 */
export function buildFilter(query = {}) {
  const filter = {};

  // 1. Campus filter (strictly 'north' | 'south')
  if (query.campus !== undefined && query.campus !== '') {
    const campusStr = String(query.campus).trim().toLowerCase();
    if (!ALLOWED_CAMPUSES.includes(campusStr)) {
      throw new QueryValidationError(
        `Invalid campus: "${query.campus}". Allowed values: ${ALLOWED_CAMPUSES.join(', ')}`,
        'campus'
      );
    }
    filter.campus = campusStr;
  }

  // 2. Status filter
  if (query.status !== undefined && query.status !== '') {
    const statusStr = String(query.status).trim();
    // Case-insensitive match against allowed statuses
    const matchedStatus = ALLOWED_STATUSES.find(
      (s) => s.toLowerCase() === statusStr.toLowerCase()
    );
    if (!matchedStatus) {
      throw new QueryValidationError(
        `Invalid status: "${query.status}". Allowed values: ${ALLOWED_STATUSES.join(', ')}`,
        'status'
      );
    }
    filter.status = matchedStatus;
  }

  // 3. Building filter (string / ID)
  if (query.building !== undefined && query.building !== '') {
    const buildingStr = String(query.building).trim();
    if (buildingStr) {
      filter.building = buildingStr;
    }
  }

  // 4. Category filter (string / ID)
  if (query.category !== undefined && query.category !== '') {
    const categoryStr = String(query.category).trim();
    if (categoryStr) {
      filter.category = categoryStr;
    }
  }

  return filter;
}

/**
 * Formats standardized pagination metadata
 * @param {number} total - Total matching records
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Standard pagination payload
 */
export function formatPaginationMeta(total = 0, page = DEFAULT_PAGE, limit = DEFAULT_LIMIT) {
  const totalCount = Math.max(0, Number(total) || 0);
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const hasMore = page < totalPages;

  return {
    page,
    limit,
    total: totalCount,
    totalPages,
    hasMore,
  };
}

/**
 * Validates an issue ID or reference string (prevents malformed queries)
 * @param {string} id - Path parameter
 * @returns {{ isObjectId: boolean, isRefId: boolean, normalizedId: string }}
 */
export function validateIssueId(id) {
  if (!id || typeof id !== 'string') {
    throw new QueryValidationError('Issue ID is required', 'id');
  }

  const trimmed = id.trim();
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(trimmed);
  const isRefId = /^CF-\d{4}-\d{1,8}$/i.test(trimmed);

  if (!isObjectId && !isRefId) {
    throw new QueryValidationError(
      `Invalid issue identifier: "${id}". Must be a valid 24-char ObjectId or reference code (e.g. CF-2026-0001)`,
      'id'
    );
  }

  return {
    isObjectId,
    isRefId,
    normalizedId: trimmed,
  };
}
